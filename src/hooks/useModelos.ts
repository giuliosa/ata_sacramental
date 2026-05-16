'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Modelo } from '@/types/domain'

type ModeloRow = Modelo
type ModelosResponse = { data: ModeloRow[] }

async function fetchModelos(): Promise<ModeloRow[]> {
  const res = await fetch('/api/modelos')
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar modelos')
  }
  const json: ModelosResponse = await res.json()
  return json.data
}

async function createModelo(data: { nome: string; ativo?: boolean }): Promise<ModeloRow> {
  const res = await fetch('/api/modelos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? 'Erro ao criar modelo')
  }
  return json.data
}

async function updateModelo({ id, data }: { id: string; data: Partial<Pick<ModeloRow, 'nome' | 'ativo'>> }): Promise<ModeloRow> {
  const res = await fetch(`/api/modelos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? 'Erro ao atualizar modelo')
  }
  return json.data
}

async function deleteModelo(id: string): Promise<void> {
  const res = await fetch(`/api/modelos/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error ?? 'Erro ao excluir modelo')
  }
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
    mutationFn: createModelo,
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
    mutationFn: updateModelo,
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
    mutationFn: deleteModelo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] })
      toast.success('Modelo excluído com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
