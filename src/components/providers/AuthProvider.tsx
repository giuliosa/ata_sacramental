'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { User as AuthUser, Session } from '@supabase/supabase-js'
import type { User } from '@/types/domain'
import { getMeAction } from '@/features/auth/actions'

type AuthState = {
  user: User | null
  authUser: AuthUser | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthState>({ 
  user: null, 
  authUser: null,
  session: null, 
  isLoading: true 
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ 
    user: null, 
    authUser: null,
    session: null, 
    isLoading: true 
  })

  async function refreshProfile(session: Session | null) {
    if (!session) {
      setState({ user: null, authUser: null, session: null, isLoading: false })
      return
    }

    const { data: profile } = await getMeAction()
    setState({ 
      user: profile ?? null, 
      authUser: session.user,
      session, 
      isLoading: false 
    })
  }

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      refreshProfile(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      refreshProfile(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
