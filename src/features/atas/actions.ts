'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { criarAtaSchema, editarAtaSchema, type CriarAtaFormData, type EditarAtaFormData } from '@/lib/schemas'
import { can } from '@/lib/permissions'
import type { Ata, ApiResponse, ModeloCampo } from '@/types/domain'

function validarConteudo(conteudo: Record<string, unknown>, campos: ModeloCampo[]): string | null {
  for (const campo of campos) {
    if (campo.required) {
      const value = conteudo[campo.id]
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        return `"${campo.label}" é obrigatório`
      }
    }
  }
  return null
}

export async function buscarAtasAction(): Promise<ApiResponse<Ata[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atas')
    .select('*, ala:alas(*), autor:users(*)')
    .order('data_reuniao', { ascending: false })
  if (error) return { error: error.message }
  return { data: data as unknown as Ata[] }
}

export async function buscarAtaAction(id: string): Promise<ApiResponse<Ata>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atas')
    .select('*, ala:alas(*), autor:users(*)')
    .eq('id', id)
    .single()
  if (error) return { error: error.code === 'PGRST116' ? 'Ata não encontrada' : error.message }
  return { data: data as unknown as Ata }
}

export async function criarAtaAction(data: CriarAtaFormData): Promise<ApiResponse<Ata>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }
    if (!can.createAta(profile.role)) return { error: 'Sem permissão' }
    if (!profile.ala_id) return { error: 'Usuário sem ala vinculada' }

    const parsed = criarAtaSchema.safeParse(data)
    if (!parsed.success) return { error: 'Dados inválidos' }

    const supabase = await createClient()
    const { data: modelo } = await supabase
      .from('modelos')
      .select('*')
      .eq('id', parsed.data.modelo_id)
      .single() as unknown as { data: { campos: ModeloCampo[] } | null }
    
    if (!modelo) return { error: 'Modelo não encontrado' }
    const campos = modelo.campos
    const validationError = validarConteudo(parsed.data.conteudo, campos)
    if (validationError) return { error: validationError }

    const { data: novaAta, error } = await supabase
      .from('atas')
      .insert({
        data_reuniao: parsed.data.data_reuniao,
        ala_id: profile.ala_id,
        modelo_id: parsed.data.modelo_id,
        conteudo: parsed.data.conteudo,
        criado_por: profile.id,
      } as never)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') return { error: 'Já existe uma ata para esta data' }
      throw error
    }

    revalidatePath('/atas')
    revalidatePath('/dashboard')
    return { data: novaAta as unknown as Ata }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao criar ata' }
  }
}

export async function atualizarAtaAction(id: string, data: EditarAtaFormData): Promise<ApiResponse<Ata>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    const parsed = editarAtaSchema.safeParse(data)
    if (!parsed.success) return { error: 'Dados inválidos' }

    if (parsed.data.conteudo) {
      const supabase = await createClient()
      const { data: existingAta } = await supabase
        .from('atas')
        .select('modelo_id')
        .eq('id', id)
        .single() as unknown as { data: { modelo_id: string } | null }
      
      if (existingAta) {
        const modeloId = parsed.data.modelo_id || existingAta.modelo_id
        const { data: modelo } = await supabase
          .from('modelos')
          .select('*')
          .eq('id', modeloId)
          .single() as unknown as { data: { campos: ModeloCampo[] } | null }
        
        if (modelo) {
          const campos = modelo.campos
          const validationError = validarConteudo(parsed.data.conteudo, campos)
          if (validationError) return { error: validationError }
        }
      }
    }

    const supabase = await createClient()
    const { data: ataAtualizada, error } = await supabase
      .from('atas')
      .update({
        conteudo: parsed.data.conteudo,
        ...(parsed.data.data_reuniao ? { data_reuniao: parsed.data.data_reuniao } : {}),
      } as never)
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
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao atualizar ata' }
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
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao excluir ata' }
  }
}
