'use server'

import { getUserProfile } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils'
import type { User, ApiResponse } from '@/types/domain'

export async function getMeAction(): Promise<ApiResponse<User>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { data: null, error: 'Não autenticado' }
    return { data: profile, error: null }
  } catch (error: any) {
    return handleApiError(error, 'Erro ao buscar perfil')
  }
}
