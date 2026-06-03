'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdateUsuarioData } from '@/types/domain'
import { 
  atualizarUsuarioAction, 
  criarEstacaAction, 
  criarAlaAction,
  atualizarEstacaAction,
  excluirEstacaAction,
  atualizarAlaAction,
  excluirAlaAction,
  alterarMinhaAlaAction,
  buscarUsuariosAction,
  buscarUnidadesAction
} from '@/features/admin/actions'

// ─── Usuários ────────────────────────────────────────────────────────────────

export function useUsuarios() {
  return useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: async () => {
      const result = await buscarUsuariosAction()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUsuarioData }) => {
      const result = await atualizarUsuarioAction(id, data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] })
      toast.success('Usuário atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// ─── Unidades ────────────────────────────────────────────────────────────────

export function useUnidades() {
  return useQuery({
    queryKey: ['admin', 'unidades'],
    queryFn: async () => {
      const result = await buscarUnidadesAction()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}

export function useCreateEstaca() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nome: string) => {
      const result = await criarEstacaAction(nome)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unidades'] })
      toast.success('Estaca criada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCreateAla() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { nome: string; estaca_id: string }) => {
      const result = await criarAlaAction(data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unidades'] })
      toast.success('Ala criada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateEstaca() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const result = await atualizarEstacaAction(id, nome)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unidades'] })
      toast.success('Estaca atualizada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteEstaca() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await excluirEstacaAction(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unidades'] })
      toast.success('Estaca excluída com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateAla() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, nome, estaca_id }: { id: string; nome: string; estaca_id: string }) => {
      const result = await atualizarAlaAction(id, { nome, estaca_id })
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unidades'] })
      toast.success('Ala atualizada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteAla() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await excluirAlaAction(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unidades'] })
      toast.success('Ala excluída com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useAlterarMinhaAla() {
  return useMutation({
    mutationFn: async (alaId: string | null) => {
      const result = await alterarMinhaAlaAction(alaId)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      toast.success('Ala alterada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
