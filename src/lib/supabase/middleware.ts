import { createServerClient } from '@supabase/ssr'
import { getSupabaseConfig } from './config'
import type { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * Cria o cliente Supabase para uso no middleware.
 * Necessário para renovar sessões em cada request (sliding session).
 */
export function createClient(request: NextRequest, response: NextResponse) {
  const { url, key } = getSupabaseConfig()

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}
