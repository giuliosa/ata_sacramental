import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseConfig } from './config'
import type { Database } from '@/types/supabase'

/**
 * Cliente Supabase para uso em Client Components.
 * Cria uma nova instância por chamada — o @supabase/ssr gerencia o singleton internamente.
 */
export function createClient() {
  const { url, key } = getSupabaseConfig()

  return createBrowserClient<Database>(url, key)
}
