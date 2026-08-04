import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Section } from '../lib/database.types'

export function useSections(projectId: string | null) {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSections = useCallback(async () => {
    if (!projectId) {
      setSections([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch sections:', error)
      return
    }
    setSections(data ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const createSection = async (name: string) => {
    if (!projectId) return null

    const maxOrder = sections.length > 0
      ? Math.max(...sections.map(s => s.sort_order))
      : -1

    const { data, error } = await supabase
      .from('sections')
      .insert({ project_id: projectId, name, sort_order: maxOrder + 1 })
      .select()
      .single()

    if (error) {
      console.error('Failed to create section:', error)
      return null
    }
    setSections(prev => [...prev, data])
    return data
  }

  const updateSection = async (id: string, name: string) => {
    const { error } = await supabase
      .from('sections')
      .update({ name })
      .eq('id', id)

    if (error) {
      console.error('Failed to update section:', error)
      return
    }
    setSections(prev => prev.map(s => s.id === id ? { ...s, name } : s))
  }

  const deleteSection = async (id: string) => {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete section:', error)
      return
    }
    setSections(prev => prev.filter(s => s.id !== id))
  }

  return { sections, loading, createSection, updateSection, deleteSection, refetch: fetchSections }
}
