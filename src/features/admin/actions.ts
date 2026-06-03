'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { User, Estaca, Ala, UpdateUsuarioData, ApiResponse, UnidadesData } from '@/types/domain'

export async function buscarUsuariosAction(): Promise<ApiResponse<User[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*, ala:alas(*, estaca:estacas(*))')
      .order('name')

    if (error) throw error
    return { data: data as unknown as User[] }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar usuários' }
  }
}

export async function buscarUnidadesAction(): Promise<ApiResponse<UnidadesData>> {
  try {
    const supabase = await createClient()
    const [{ data: estacas, error: e1 }, { data: alas, error: e2 }] = await Promise.all([
      supabase.from('estacas').select('*').order('nome'),
      supabase.from('alas').select('*').order('nome'),
    ])

    if (e1) throw e1
    if (e2) throw e2

    return { 
      data: { 
        estacas: estacas as Estaca[], 
        alas: alas as Ala[] 
      } 
    }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar unidades' }
  }
}

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
      .update(data as never)
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
      .insert({ nome: nome.trim() } as never)
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
      .insert({ nome: data.nome.trim(), estaca_id: data.estaca_id } as never)
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
