import { createClient } from '@/lib/supabase/server'
import type { Ata, ApiResponse, UserProfile, ModeloCampo } from '@/types/domain'
import type { CriarAtaFormData, EditarAtaFormData } from '@/lib/schemas'
import { can } from '@/lib/permissions'
import { normalizeCampos, handleApiError } from '@/lib/utils'

/**
 * AtaService encapsula o acesso a dados e regras de negócio relacionadas a atas.
 */
export class AtaService {
  /**
   * Valida se o conteúdo da ata respeita as regras do modelo (campos obrigatórios).
   */
  private static validarConteudo(conteudo: Record<string, unknown>, campos: ModeloCampo[]): string | null {
    const camposNormalizados = normalizeCampos(campos)
    for (const campo of camposNormalizados) {
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

  static async buscarAtas(): Promise<ApiResponse<Ata[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('atas')
        .select('*, ala:alas(*), autor:users(*)')
        .order('data_reuniao', { ascending: false })

      if (error) throw error
      return { data: data as unknown as Ata[], error: null }
    } catch (error: any) {
      return handleApiError(error, 'Erro ao buscar atas')
    }
  }

  static async buscarPorId(id: string): Promise<ApiResponse<Ata>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('atas')
        .select('*, ala:alas(*), autor:users(*)')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return { data: null, error: 'Ata não encontrada' }
        throw error
      }
      return { data: data as unknown as Ata, error: null }
    } catch (error: any) {
      return handleApiError(error, 'Erro ao buscar ata')
    }
  }

  static async criar(profile: UserProfile, data: CriarAtaFormData): Promise<ApiResponse<Ata>> {
    try {
      if (!can.createAta(profile.role)) return { data: null, error: 'Sem permissão' }
      if (!profile.ala_id) return { data: null, error: 'Usuário sem ala vinculada' }

      const supabase = await createClient()
      
      // Busca modelo para validar conteúdo
      const { data: modelo } = await supabase
        .from('modelos')
        .select('campos')
        .eq('id', data.modelo_id)
        .single() as unknown as { data: { campos: ModeloCampo[] } | null }

      if (!modelo) return { data: null, error: 'Modelo não encontrado' }
      
      const validationError = this.validarConteudo(data.conteudo, modelo.campos)
      if (validationError) return { data: null, error: validationError }

      const { data: novaAta, error } = await supabase
        .from('atas')
        .insert({
          data_reuniao: data.data_reuniao,
          ala_id: profile.ala_id,
          modelo_id: data.modelo_id,
          conteudo: data.conteudo as any,
          criado_por: profile.id,
        } as any)
        .select('*')
        .single()

      if (error) {
        if (error.code === '23505') return { data: null, error: 'Já existe uma ata para esta data' }
        throw error
      }

      return { data: novaAta as unknown as Ata, error: null }
    } catch (error: any) {
      return handleApiError(error, 'Erro ao criar ata')
    }
  }

  static async atualizar(id: string, data: EditarAtaFormData): Promise<ApiResponse<Ata>> {
    try {
      const supabase = await createClient()
      
      // Se houver conteúdo novo, precisamos validar contra o modelo
      if (data.conteudo) {
        const { data: existingAta } = await supabase
          .from('atas')
          .select('modelo_id')
          .eq('id', id)
          .single() as unknown as { data: { modelo_id: string } | null }
        
        if (existingAta) {
          const modeloId = data.modelo_id || existingAta.modelo_id
          const { data: modelo } = await supabase
            .from('modelos')
            .select('campos')
            .eq('id', modeloId)
            .single() as unknown as { data: { campos: ModeloCampo[] } | null }
          
          if (modelo) {
            const validationError = this.validarConteudo(data.conteudo, modelo.campos)
            if (validationError) return { data: null, error: validationError }
          }
        }
      }

      const { data: ataAtualizada, error } = await (supabase
        .from('atas') as any)
        .update({
          conteudo: data.conteudo as any,
          ...(data.data_reuniao ? { data_reuniao: data.data_reuniao } : {}),
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        if (error.code === 'PGRST116') return { data: null, error: 'Ata não encontrada ou acesso negado' }
        throw error
      }

      return { data: ataAtualizada as unknown as Ata, error: null }
    } catch (error: any) {
      return handleApiError(error, 'Erro ao atualizar ata')
    }
  }

  static async excluir(id: string): Promise<ApiResponse<null>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('atas')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: null, error: null }
    } catch (error: any) {
      return handleApiError(error, 'Erro ao excluir ata')
    }
  }
}
