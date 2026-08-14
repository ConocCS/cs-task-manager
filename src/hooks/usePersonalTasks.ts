import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { PersonalTask, TaskStatus, TaskPriority } from '../lib/database.types'

export function usePersonalTasks(memberId: string | null) {
  const [tasks, setTasks] = useState<PersonalTask[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!memberId) {
      setTasks([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('personal_tasks')
      .select('*')
      .eq('member_id', memberId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch personal tasks:', error)
      return
    }
    setTasks(data ?? [])
    setLoading(false)
  }, [memberId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Realtime subscription
  useEffect(() => {
    if (!memberId) return

    const channel = supabase
      .channel(`personal-tasks-${memberId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_tasks',
          filter: `member_id=eq.${memberId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => {
              if (prev.some(t => t.id === (payload.new as PersonalTask).id)) return prev
              return [...prev, payload.new as PersonalTask]
            })
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === (payload.new as PersonalTask).id ? payload.new as PersonalTask : t))
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== (payload.old as { id: string }).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [memberId])

  const createTask = async (params: {
    title: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: string | null
  }) => {
    if (!memberId) return null

    const maxOrder = tasks.length > 0
      ? Math.max(...tasks.map(t => t.sort_order))
      : -1

    const { data, error } = await supabase
      .from('personal_tasks')
      .insert({
        member_id: memberId,
        title: params.title,
        status: params.status ?? 'not_started',
        priority: params.priority ?? 'medium',
        due_date: params.dueDate ?? null,
        sort_order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create personal task:', error)
      return null
    }
    setTasks(prev => [...prev, data])
    return data
  }

  const updateTask = async (id: string, updates: Partial<Pick<PersonalTask, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'sort_order' | 'completed_at'>>) => {
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    } else if (updates.status && updates.status !== 'completed') {
      updates.completed_at = null
    }

    const { data, error } = await supabase
      .from('personal_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update personal task:', error)
      return
    }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('personal_tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete personal task:', error)
      return
    }
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const newStatus: TaskStatus = task.status === 'completed' ? 'not_started' : 'completed'
    await updateTask(id, { status: newStatus })
  }

  return { tasks, loading, createTask, updateTask, deleteTask, toggleComplete }
}
