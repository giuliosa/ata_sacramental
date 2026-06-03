'use server'

import { revalidatePath } from 'next/cache'
import { getUserProfile } from '@/lib/supabase/server'
import { criarAtaSchema, editarAtaSchema, type CriarAtaFormData, type EditarAtaFormData } from '@/lib/schemas'
import type { Ata, ApiResponse, UserProfile } from '@/types/domain'
import { AtaService } from './service'

export async function buscarAtasAction(): Promise<ApiResponse<Ata[]>> {
  return AtaService.buscarAtas()
}

export async function buscarAtaAction(id: string): Promise<ApiResponse<Ata>> {
  return AtaService.buscarPorId(id)
}

export async function criarAtaAction(data: CriarAtaFormData): Promise<ApiResponse<Ata>> {
  try {
    const profile = (await getUserProfile()) as UserProfile | null
    if (!profile) return { data: null, error: 'Não autenticado' }

    const parsed = criarAtaSchema.safeParse(data)
    if (!parsed.success) return { data: null, error: 'Dados inválidos' }

    const result = await AtaService.criar(profile, parsed.data)
    
    if (result.data) {
      revalidatePath('/atas')
      revalidatePath('/dashboard')
    }
    
    return result
  } catch (error: any) {
    return { data: null, error: error.message || 'Erro ao criar ata' }
  }
}

export async function atualizarAtaAction(id: string, data: EditarAtaFormData): Promise<ApiResponse<Ata>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { data: null, error: 'Não autenticado' }

    const parsed = editarAtaSchema.safeParse(data)
    if (!parsed.success) return { data: null, error: 'Dados inválidos' }

    const result = await AtaService.atualizar(id, parsed.data)

    if (result.data) {
      revalidatePath('/atas')
      revalidatePath(`/atas/${id}`)
    }
    
    return result
  } catch (error: any) {
    return { data: null, error: error.message || 'Erro ao atualizar ata' }
  }
}

export async function excluirAtaAction(id: string): Promise<ApiResponse<null>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { data: null, error: 'Não autenticado' }

    const result = await AtaService.excluir(id)

    if (result.error === null) {
      revalidatePath('/atas')
      revalidatePath('/dashboard')
    }

    return result
  } catch (error: any) {
    return { data: null, error: error.message || 'Erro ao excluir ata' }
  }
}
