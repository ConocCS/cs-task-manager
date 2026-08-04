import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/database.types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch projects:', error)
      return
    }
    setProjects(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (name: string, color?: string) => {
    const maxOrder = projects.length > 0
      ? Math.max(...projects.map(p => p.sort_order))
      : -1

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color: color ?? '#2563eb', sort_order: maxOrder + 1 })
      .select()
      .single()

    if (error) {
      console.error('Failed to create project:', error)
      return null
    }
    setProjects(prev => [...prev, data])
    return data
  }

  const updateProject = async (id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'color'>>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Failed to update project:', error)
      return
    }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const archiveProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: true })
      .eq('id', id)

    if (error) {
      console.error('Failed to archive project:', error)
      return
    }
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return { projects, loading, createProject, updateProject, archiveProject, refetch: fetchProjects }
}
