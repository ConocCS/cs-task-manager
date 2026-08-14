import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus } from '../lib/database.types'

export function useAssignedTasks(memberId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [waitingOnTasks, setWaitingOnTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!memberId) {
      setTasks([])
      setWaitingOnTasks([])
      setLoading(false)
      return
    }

    const [assignedRes, waitingRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', memberId)
        .order('due_date', { ascending: true, nullsFirst: false }),
      supabase
        .from('tasks')
        .select('*')
        .eq('waiting_on_id', memberId)
        .neq('assignee_id', memberId) // 担当かつ確認先の場合は重複させない
        .order('due_date', { ascending: true, nullsFirst: false }),
    ])

    if (assignedRes.error) {
      console.error('Failed to fetch assigned tasks:', assignedRes.error)
    } else {
      setTasks(assignedRes.data ?? [])
    }
    if (waitingRes.error) {
      console.error('Failed to fetch waiting-on tasks:', waitingRes.error)
    } else {
      setWaitingOnTasks(waitingRes.data ?? [])
    }
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
          const updateList = (
            setter: React.Dispatch<React.SetStateAction<Task[]>>,
            matchFn: (task: Task) => boolean,
          ) => {
            if (payload.eventType === 'INSERT') {
              const newTask = payload.new as Task
              if (matchFn(newTask)) {
                setter(prev => prev.some(t => t.id === newTask.id) ? prev : [...prev, newTask])
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Task
              setter(prev => {
                const existed = prev.some(t => t.id === updated.id)
                if (matchFn(updated)) {
                  return existed ? prev.map(t => t.id === updated.id ? updated : t) : [...prev, updated]
                }
                return existed ? prev.filter(t => t.id !== updated.id) : prev
              })
            } else if (payload.eventType === 'DELETE') {
              setter(prev => prev.filter(t => t.id !== (payload.old as { id: string }).id))
            }
          }

          updateList(setTasks, t => t.assignee_id === memberId)
          updateList(setWaitingOnTasks, t => t.waiting_on_id === memberId && t.assignee_id !== memberId)
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

  return { tasks, waitingOnTasks, loading, updateTask, toggleComplete }
}
