'use server'

import { getUserProfile } from '@/lib/supabase/server'
import type { User, ApiResponse } from '@/types/domain'

export async function getMeAction(): Promise<ApiResponse<User>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }
    return { data: profile }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar perfil' }
  }
}
