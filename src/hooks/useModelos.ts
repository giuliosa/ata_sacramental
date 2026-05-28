'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Modelo, ApiResponse } from '@/types/domain'
import { criarModeloAction, atualizarModeloAction, excluirModeloAction } from '@/features/modelos/actions'

async function fetchModelos(): Promise<Modelo[]> {
  const res = await fetch('/api/modelos')
  if (!res.ok) {
    const body: ApiResponse<never> = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar modelos')
  }
  const json: ApiResponse<Modelo[]> = await res.json()
  return json.data!
}

export function useModelos() {
  return useQuery({
    queryKey: ['modelos'],
    queryFn: fetchModelos,
  })
}

export function useCreateModelo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { nome: string; ativo?: boolean }) => {
      const result = await criarModeloAction(data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] })
      toast.success('Modelo criado com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateModelo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pick<Modelo, 'nome' | 'ativo'>> }) => {
      const result = await atualizarModeloAction(id, data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] })
      toast.success('Modelo atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteModelo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await excluirModeloAction(id)
      if (result.error) throw new Error(result.error)
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] })
      toast.success('Modelo excluído com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
