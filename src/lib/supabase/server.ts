import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { getSupabaseConfig } from './config'
import type { Database } from '@/types/supabase'
import type { User } from '@/types/domain'

/**
 * Cliente Supabase para uso em Server Components e Route Handlers.
 * Lê/escreve cookies via next/headers — deve ser chamado dentro de um contexto de request.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, key } = getSupabaseConfig()

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Em Server Components o set é ignorado — apenas Route Handlers precisam setar cookies
          }
        },
      },
    },
  )
}

/**
 * Obtém o perfil do usuário logado de forma otimizada com cache do React.
 * Ideal para ser usado em múltiplos Server Components na mesma página.
 */
export const getUserProfile = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*, ala:alas(*, estaca:estacas(*))')
    .eq('id', authUser.id)
    .single()

  return profile as User | null
})
