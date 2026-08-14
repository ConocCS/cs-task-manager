import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus } from '../lib/database.types'

export function useAssignedTasks(memberId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!memberId) {
      setTasks([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee_id', memberId)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Failed to fetch assigned tasks:', error)
      return
    }
    setTasks(data ?? [])
    setLoading(false)
  }, [memberId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Realtime: 全tasksテーブルの変更を監視し、assignee_idが一致するものを反映
  useEffect(() => {
    if (!memberId) return

    const channel = supabase
      .channel(`assigned-tasks-${memberId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task
            if (newTask.assignee_id === memberId) {
              setTasks(prev => {
                if (prev.some(t => t.id === newTask.id)) return prev
                return [...prev, newTask]
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Task
            setTasks(prev => {
              const existed = prev.some(t => t.id === updated.id)
              if (updated.assignee_id === memberId) {
                // 担当者が自分に変更された or 既存タスクの更新
                if (existed) {
                  return prev.map(t => t.id === updated.id ? updated : t)
                }
                return [...prev, updated]
              }
              // 担当者が自分から外された
              if (existed) {
                return prev.filter(t => t.id !== updated.id)
              }
              return prev
            })
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

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignee_id' | 'due_date' | 'sort_order' | 'completed_at'>>) => {
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    } else if (updates.status && updates.status !== 'completed') {
      updates.completed_at = null
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update assigned task:', error)
      return
    }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const newStatus: TaskStatus = task.status === 'completed' ? 'not_started' : 'completed'
    await updateTask(id, { status: newStatus })
  }

  return { tasks, loading, updateTask, toggleComplete }
}
