'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { Modelo, ApiResponse } from '@/types/domain'

const MAX_MODELOS = Number(process.env.MAX_MODELOS) || 3

export async function criarModeloAction(data: { nome: string; ativo?: boolean; conteudo?: any }): Promise<ApiResponse<Modelo>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    if (!can.createModelo(profile.role)) {
      return { error: 'Sem permissão para criar modelos' }
    }

    if (!data.nome || !data.nome.trim()) {
      return { error: 'Nome do modelo é obrigatório' }
    }

    const supabase = await createClient()
    const willBeActive = data.ativo !== false

    if (willBeActive) {
      const { count } = await supabase
        .from('modelos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true)

      if ((count ?? 0) >= MAX_MODELOS) {
        return { error: `Limite de ${MAX_MODELOS} modelos ativos atingido.` }
      }
    }

    const { data: novoModelo, error } = await supabase
      .from('modelos')
      .insert({
        nome: data.nome.trim(),
        conteudo: data.conteudo ?? { defaults: {}, campos_obrigatorios: [] },
        criado_por: profile.id,
        ativo: willBeActive,
      })
      .select('*')
      .single()

    if (error) throw error

    revalidatePath('/modelos')
    return { data: novoModelo as unknown as Modelo }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar modelo' }
  }
}

export async function atualizarModeloAction(id: string, data: Partial<Pick<Modelo, 'nome' | 'ativo' | 'conteudo'>>): Promise<ApiResponse<Modelo>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    if (!can.createModelo(profile.role)) {
      return { error: 'Sem permissão para atualizar modelos' }
    }

    const supabase = await createClient()
    const updates: any = {}

    if (data.nome !== undefined) {
      if (!data.nome.trim()) return { error: 'Nome inválido' }
      updates.nome = data.nome.trim()
    }

    if (data.conteudo !== undefined) updates.conteudo = data.conteudo

    if (data.ativo !== undefined) {
      if (data.ativo === true) {
        const { data: current } = await supabase
          .from('modelos')
          .select('ativo')
          .eq('id', id)
          .single()

        if (!current?.ativo) {
          const { count } = await supabase
            .from('modelos')
            .select('*', { count: 'exact', head: true })
            .eq('ativo', true)

          if ((count ?? 0) >= MAX_MODELOS) {
            return { error: `Limite de ${MAX_MODELOS} modelos ativos atingido.` }
          }
        }
      }
      updates.ativo = data.ativo
    }

    const { data: modeloAtualizado, error } = await supabase
      .from('modelos')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    revalidatePath('/modelos')
    return { data: modeloAtualizado as unknown as Modelo }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar modelo' }
  }
}

export async function excluirModeloAction(id: string): Promise<ApiResponse<null>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    if (!can.createModelo(profile.role)) {
      return { error: 'Sem permissão para excluir modelos' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('modelos')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/modelos')
    return { data: null }
  } catch (error: any) {
    return { error: error.message || 'Erro ao excluir modelo' }
  }
}
