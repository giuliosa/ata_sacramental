'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { User, Estaca, Ala, UpdateUsuarioData, ApiResponse } from '@/types/domain'

export async function atualizarUsuarioAction(id: string, data: UpdateUsuarioData): Promise<ApiResponse<User>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    if (!can.manageUsers(profile.role)) {
      return { error: 'Sem permissão para gerenciar usuários' }
    }

    const supabase = await createClient()
    const { data: usuarioAtualizado, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    revalidatePath('/admin/usuarios')
    return { data: usuarioAtualizado as unknown as User }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar usuário' }
  }
}

export async function criarEstacaAction(nome: string): Promise<ApiResponse<Estaca>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    if (!can.manageUnidades(profile.role)) {
      return { error: 'Sem permissão para gerenciar unidades' }
    }

    if (!nome || !nome.trim()) return { error: 'Nome da estaca é obrigatório' }

    const supabase = await createClient()
    const { data: novaEstaca, error } = await supabase
      .from('estacas')
      .insert({ nome: nome.trim() })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') return { error: 'Estaca já existe' }
      throw error
    }

    revalidatePath('/admin/unidades')
    return { data: novaEstaca as unknown as Estaca }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar estaca' }
  }
}

export async function criarAlaAction(data: { nome: string; estaca_id: string }): Promise<ApiResponse<Ala>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    if (!can.manageUnidades(profile.role)) {
      return { error: 'Sem permissão para gerenciar unidades' }
    }

    if (!data.nome || !data.nome.trim()) return { error: 'Nome da ala é obrigatório' }
    if (!data.estaca_id) return { error: 'Estaca é obrigatória' }

    const supabase = await createClient()
    const { data: novaAla, error } = await supabase
      .from('alas')
      .insert({ nome: data.nome.trim(), estaca_id: data.estaca_id })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') return { error: 'Já existe uma ala com este nome nesta estaca' }
      throw error
    }

    revalidatePath('/admin/unidades')
    return { data: novaAla as unknown as Ala }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar ala' }
  }
}
