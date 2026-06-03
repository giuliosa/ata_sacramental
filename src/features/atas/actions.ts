'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { criarAtaSchema, editarAtaSchema, type CriarAtaFormData, type EditarAtaFormData } from '@/lib/schemas'
import { can } from '@/lib/permissions'
import type { Ata, ApiResponse } from '@/types/domain'

export async function buscarAtasAction(): Promise<ApiResponse<Ata[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('atas')
      .select('*, ala:alas(*), autor:users(*)')
      .order('data_reuniao', { ascending: false })

    if (error) throw error
    return { data: data as unknown as Ata[] }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar atas' }
  }
}

export async function buscarAtaAction(id: string): Promise<ApiResponse<Ata>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('atas')
      .select('*, ala:alas(*), autor:users(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return { error: 'Ata não encontrada' }
      throw error
    }
    return { data: data as unknown as Ata }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar ata' }
  }
}

export async function criarAtaAction(data: CriarAtaFormData): Promise<ApiResponse<Ata>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    if (!can.createAta(profile.role)) {
      return { error: 'Sem permissão para criar atas' }
    }

    if (!profile.ala_id) {
      return { error: 'Usuário sem ala vinculada' }
    }

    const parsed = criarAtaSchema.safeParse(data)
    if (!parsed.success) {
      return { error: 'Dados inválidos' }
    }

    const supabase = await createClient()
    const { data: novaAta, error } = await supabase
      .from('atas')
      .insert({
        data_reuniao: parsed.data.data_reuniao,
        ala_id: profile.ala_id,
        modelo_id: parsed.data.modelo_id,
        conteudo: parsed.data.conteudo as any,
        criado_por: profile.id,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') return { error: 'Já existe uma ata para esta data' }
      throw error
    }

    revalidatePath('/atas')
    revalidatePath('/dashboard')
    
    return { data: novaAta as unknown as Ata }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar ata' }
  }
}

export async function atualizarAtaAction(id: string, data: EditarAtaFormData): Promise<ApiResponse<Ata>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    const parsed = editarAtaSchema.safeParse(data)
    if (!parsed.success) {
      return { error: 'Dados inválidos' }
    }

    const supabase = await createClient()
    const { data: ataAtualizada, error } = await supabase
      .from('atas')
      .update({
        conteudo: parsed.data.conteudo as any,
        ...(parsed.data.data_reuniao ? { data_reuniao: parsed.data.data_reuniao } : {}),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') return { error: 'Ata não encontrada ou acesso negado' }
      throw error
    }

    revalidatePath('/atas')
    revalidatePath(`/atas/${id}`)
    
    return { data: ataAtualizada as unknown as Ata }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar ata' }
  }
}

export async function excluirAtaAction(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('atas')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/atas')
    revalidatePath('/dashboard')

    return { data: null }
  } catch (error: any) {
    return { error: error.message || 'Erro ao excluir ata' }
  }
}
