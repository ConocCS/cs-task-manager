import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Member } from '../lib/database.types'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Failed to fetch members:', error)
        return
      }
      setMembers(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { members, loading }
}
