'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { ApiResponse, PermissionLevel, ResourcePermission } from '@/types/domain'

export async function buscarPermissoesAction(ataId: string): Promise<ApiResponse<ResourcePermission[]>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('resource_permissions')
      .select('*')
      .eq('resource_type', 'ata')
      .eq('resource_id', ataId)

    if (error) throw error
    return { data: data as unknown as ResourcePermission[] }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao buscar permissões' }
  }
}

export async function convidarUsuarioAction(
  ataId: string,
  email: string,
  level: PermissionLevel
): Promise<ApiResponse<{ permission: ResourcePermission; inviteLink?: string }>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }
    if (!can.shareAta(profile.role)) return { error: 'Sem permissão para compartilhar atas' }

    if (!email || !email.trim()) return { error: 'Email é obrigatório' }
    const normalizedEmail = email.trim().toLowerCase()

    const supabase = await createClient()

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle() as unknown as { data: { id: string } | null }

    if (existingUser) {
      const { data: existingPerm } = await supabase
        .from('resource_permissions')
        .select('id')
        .eq('resource_type', 'ata')
        .eq('resource_id', ataId)
        .eq('user_id', existingUser.id)
        .maybeSingle() as unknown as { data: { id: string } | null }

      if (existingPerm) {
        return { error: 'Usuário já tem permissão para esta ata' }
      }

      const { data: permission, error } = await supabase
        .from('resource_permissions')
        .insert({
          resource_type: 'ata',
          resource_id: ataId,
          user_id: existingUser.id,
          permission_level: level,
          invited_by: profile.id,
          accepted_at: new Date().toISOString(),
        } as never)
        .select('*')
        .single()

      if (error) throw error

      revalidatePath(`/atas/${ataId}`)
      revalidatePath(`/atas/${ataId}/compartilhar`)
      return { data: { permission: permission as unknown as ResourcePermission } }
    }

    const { data: existingPending } = await supabase
      .from('resource_permissions')
      .select('id')
      .eq('resource_type', 'ata')
      .eq('resource_id', ataId)
      .eq('invited_email', normalizedEmail)
      .is('accepted_at', null)
      .maybeSingle()

    if (existingPending) {
      return { error: 'Já existe um convite pendente para este email' }
    }

    const token = crypto.randomUUID()
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${origin}/convidar?token=${token}`

    const { data: permission, error } = await supabase
      .from('resource_permissions')
      .insert({
        resource_type: 'ata',
        resource_id: ataId,
        invited_email: normalizedEmail,
        permission_level: level,
        invited_by: profile.id,
        token,
      } as never)
      .select('*')
      .single()

    if (error) throw error

    revalidatePath(`/atas/${ataId}`)
    revalidatePath(`/atas/${ataId}/compartilhar`)
    return { data: { permission: permission as unknown as ResourcePermission, inviteLink } }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao convidar usuário' }
  }
}

export async function removerPermissaoAction(permissionId: string): Promise<ApiResponse<null>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }
    if (!can.shareAta(profile.role)) return { error: 'Sem permissão' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('resource_permissions')
      .delete()
      .eq('id', permissionId)

    if (error) throw error

    return { data: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao remover permissão' }
  }
}

export async function alterarNivelPermissaoAction(
  permissionId: string,
  level: PermissionLevel
): Promise<ApiResponse<ResourcePermission>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }
    if (!can.shareAta(profile.role)) return { error: 'Sem permissão' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('resource_permissions')
      .update({ permission_level: level } as never)
      .eq('id', permissionId)
      .select('*')
      .single()

    if (error) throw error

    return { data: data as unknown as ResourcePermission }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao alterar nível de permissão' }
  }
}

export async function aceitarConviteAction(token: string): Promise<ApiResponse<{ ataId: string }>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    const supabase = await createClient()

    const { data: perm } = await supabase
      .from('resource_permissions')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single() as unknown as { data: { id: string; invited_email: string | null; resource_id: string } | null }

    if (!perm) return { error: 'Convite inválido ou já aceito' }

    if (perm.invited_email && perm.invited_email.toLowerCase() !== profile.email.toLowerCase()) {
      return { error: 'Este convite é para outro email' }
    }

    const { error } = await supabase
      .from('resource_permissions')
      .update({
        user_id: profile.id,
        accepted_at: new Date().toISOString(),
        token: null,
      } as never)
      .eq('id', perm.id)

    if (error) throw error

    revalidatePath(`/atas/${perm.resource_id}`)
    revalidatePath(`/atas/${perm.resource_id}/compartilhar`)

    return { data: { ataId: perm.resource_id } }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao aceitar convite' }
  }
}

export async function buscarConvitesPendentesAction(): Promise<ApiResponse<ResourcePermission[]>> {
  try {
    const profile = await getUserProfile()
    if (!profile) return { error: 'Não autenticado' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('resource_permissions')
      .select('*')
      .eq('invited_email', profile.email)
      .is('accepted_at', null)

    if (error) throw error
    return { data: data as unknown as ResourcePermission[] }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Erro ao buscar convites pendentes' }
  }
}
