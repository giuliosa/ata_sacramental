'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Modelo } from '@/types/domain'
import { 
  criarModeloAction, 
  atualizarModeloAction, 
  excluirModeloAction,
  buscarModelosAction
} from '@/features/modelos/actions'

export function useModelos() {
  return useQuery({
    queryKey: ['modelos'],
    queryFn: async () => {
      const result = await buscarModelosAction()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
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
