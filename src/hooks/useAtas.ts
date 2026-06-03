'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { CriarAtaFormData, EditarAtaFormData } from '@/lib/schemas'
import { 
  criarAtaAction, 
  atualizarAtaAction, 
  excluirAtaAction,
  buscarAtasAction,
  buscarAtaAction
} from '@/features/atas/actions'

export function useAtas() {
  return useQuery({
    queryKey: ['atas'],
    queryFn: async () => {
      const result = await buscarAtasAction()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}

export function useAta(id: string) {
  return useQuery({
    queryKey: ['atas', id],
    queryFn: async () => {
      const result = await buscarAtaAction(id)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!id,
  })
}

export function useCreateAta() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: CriarAtaFormData) => {
      const result = await criarAtaAction(data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atas'] })
      toast.success('Ata criada com sucesso')
      router.push('/atas')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateAta(id: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: EditarAtaFormData) => {
      const result = await atualizarAtaAction(id, data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atas'] })
      toast.success('Ata atualizada com sucesso')
      router.push(`/atas/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteAta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await excluirAtaAction(id)
      if (result.error) throw new Error(result.error)
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atas'] })
      toast.success('Ata excluída com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
