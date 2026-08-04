import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus, TaskPriority } from '../lib/database.types'

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch tasks:', error)
      return
    }
    setTasks(data ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => {
              if (prev.some(t => t.id === (payload.new as Task).id)) return prev
              return [...prev, payload.new as Task]
            })
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === (payload.new as Task).id ? payload.new as Task : t))
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== (payload.old as { id: string }).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const createTask = async (params: {
    title: string
    sectionId?: string | null
    assigneeId?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: string | null
  }) => {
    if (!projectId) return null

    const sectionTasks = tasks.filter(t => t.section_id === (params.sectionId ?? null))
    const maxOrder = sectionTasks.length > 0
      ? Math.max(...sectionTasks.map(t => t.sort_order))
      : -1

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        section_id: params.sectionId ?? null,
        title: params.title,
        status: params.status ?? 'not_started',
        priority: params.priority ?? 'medium',
        assignee_id: params.assigneeId ?? null,
        due_date: params.dueDate ?? null,
        sort_order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create task:', error)
      return null
    }
    setTasks(prev => [...prev, data])
    return data
  }

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignee_id' | 'due_date' | 'section_id' | 'sort_order' | 'completed_at'>>) => {
    // Auto-set completed_at
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
      console.error('Failed to update task:', error)
      return
    }
    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete task:', error)
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

  return { tasks, loading, createTask, updateTask, deleteTask, toggleComplete, refetch: fetchTasks }
}
