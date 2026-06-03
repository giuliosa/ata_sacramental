'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  buscarPermissoesAction,
  convidarUsuarioAction,
  removerPermissaoAction,
  alterarNivelPermissaoAction,
  aceitarConviteAction,
  buscarConvitesPendentesAction,
} from '@/features/atas/permissions-actions'
import type { PermissionLevel } from '@/types/domain'

export function usePermissoes(ataId: string) {
  return useQuery({
    queryKey: ['permissoes', ataId],
    queryFn: async () => {
      const result = await buscarPermissoesAction(ataId)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!ataId,
  })
}

export function useConvidarUsuario(ataId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, level }: { email: string; level: PermissionLevel }) => {
      const result = await convidarUsuarioAction(ataId, email, level)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissoes', ataId] })
      if (data.inviteLink) {
        navigator.clipboard.writeText(data.inviteLink)
        toast.success('Link de convite copiado para a área de transferência')
      } else {
        toast.success('Usuário adicionado com sucesso')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useRemoverPermissao(ataId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (permissionId: string) => {
      const result = await removerPermissaoAction(permissionId)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes', ataId] })
      toast.success('Permissão removida')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useAlterarNivelPermissao(ataId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ permissionId, level }: { permissionId: string; level: PermissionLevel }) => {
      const result = await alterarNivelPermissaoAction(permissionId, level)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes', ataId] })
      toast.success('Nível alterado')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useAceitarConvite() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (token: string) => {
      const result = await aceitarConviteAction(token)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (data) => {
      toast.success('Convite aceito com sucesso')
      router.push(`/atas/${data.ataId}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useConvitesPendentes() {
  return useQuery({
    queryKey: ['convites-pendentes'],
    queryFn: async () => {
      const result = await buscarConvitesPendentesAction()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}
