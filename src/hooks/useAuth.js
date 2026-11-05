import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Being signed in is not enough to manage bookings: the account must also be
// on the admin allow-list (public.admin_users). The database enforces this
// with RLS; isAdmin here only decides which screen to show.
async function checkIsAdmin(user) {
  if (!user) return false
  const { data, error } = await supabase.rpc('is_admin')
  return !error && data === true
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    const applySession = async (session) => {
      const nextUser = session?.user ?? null
      const admin = await checkIsAdmin(nextUser)
      if (!active) return
      setUser(nextUser)
      setIsAdmin(admin)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Defer: calling Supabase inside this callback can deadlock supabase-js.
        setTimeout(() => applySession(session), 0)
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Demo admin login
      if (email && password) {
        setUser({ email, id: 'demo-admin' })
        return
      }
      throw new Error('Invalid credentials')
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Demo mode (no Supabase configured) has no real data, so any demo login is "admin".
  return { user, isAdmin: isSupabaseConfigured ? isAdmin : !!user, loading, signIn, signOut }
}
