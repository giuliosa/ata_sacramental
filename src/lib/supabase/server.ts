import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseConfig } from './config'
import type { Database } from '@/types/supabase'

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
