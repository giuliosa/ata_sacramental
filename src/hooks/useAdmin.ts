'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { User, Estaca, Ala, UnidadesData, UpdateUsuarioData, ApiResponse } from '@/types/domain'
import { atualizarUsuarioAction, criarEstacaAction, criarAlaAction } from '@/features/admin/actions'

// ─── Usuários ────────────────────────────────────────────────────────────────

async function fetchUsuarios(): Promise<User[]> {
  const res = await fetch('/api/admin/usuarios')
  if (!res.ok) {
    const body: ApiResponse<never> = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar usuários')
  }
  const json: ApiResponse<User[]> = await res.json()
  return json.data!
}

export function useUsuarios() {
  return useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: fetchUsuarios,
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

async function fetchUnidades(): Promise<UnidadesData> {
  const res = await fetch('/api/admin/unidades')
  if (!res.ok) {
    const body: ApiResponse<never> = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar unidades')
  }
  const json: ApiResponse<UnidadesData> = await res.json()
  return json.data!
}

export function useUnidades() {
  return useQuery({
    queryKey: ['admin', 'unidades'],
    queryFn: fetchUnidades,
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
