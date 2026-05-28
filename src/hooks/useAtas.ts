'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Ata, ApiResponse } from '@/types/domain'
import type { CriarAtaFormData, EditarAtaFormData } from '@/lib/schemas'
import { criarAtaAction, atualizarAtaAction, excluirAtaAction } from '@/features/atas/actions'

async function fetchAtas(): Promise<Ata[]> {
  const res = await fetch('/api/atas')
  if (!res.ok) {
    const body: ApiResponse<never> = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar atas')
  }
  const json: ApiResponse<Ata[]> = await res.json()
  return json.data!
}

async function fetchAta(id: string): Promise<Ata> {
  const res = await fetch(`/api/atas/${id}`)
  if (!res.ok) {
    const body: ApiResponse<never> = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar ata')
  }
  const json: ApiResponse<Ata> = await res.json()
  return json.data!
}

export function useAtas() {
  return useQuery({
    queryKey: ['atas'],
    queryFn: fetchAtas,
  })
}

export function useAta(id: string) {
  return useQuery({
    queryKey: ['atas', id],
    queryFn: () => fetchAta(id),
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
