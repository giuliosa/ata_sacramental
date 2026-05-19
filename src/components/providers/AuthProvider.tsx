'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'

type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, session: null, isLoading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, isLoading: true })

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, isLoading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, isLoading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
