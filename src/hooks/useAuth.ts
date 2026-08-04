import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const ALLOWED_DOMAIN = 'conoc.jp'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email ?? ''
        if (email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          setUser(session.user)
        } else {
          setError(`@${ALLOWED_DOMAIN} のアカウントでログインしてください`)
          supabase.auth.signOut()
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email ?? ''
        if (email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          setUser(session.user)
          setError(null)
        } else {
          setError(`@${ALLOWED_DOMAIN} のアカウントでログインしてください`)
          supabase.auth.signOut()
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          hd: ALLOWED_DOMAIN,
        },
      },
    })
    if (error) {
      setError('ログインに失敗しました')
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, error, signInWithGoogle, signOut }
}
