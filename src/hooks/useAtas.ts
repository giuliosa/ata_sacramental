'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { CriarAtaFormData, EditarAtaFormData } from '@/lib/schemas'

type AtaConteudoJson = Record<string, unknown>

type AtaRow = {
  id: string
  data_reuniao: string
  ala_id: string
  modelo_id: string
  conteudo: AtaConteudoJson
  criado_por: string
  created_at: string
  updated_at: string
  ala?: { nome: string }
  autor?: { name: string }
}

type AtasResponse = { data: AtaRow[] }
type AtaResponse = { data: AtaRow }

async function fetchAtas(): Promise<AtaRow[]> {
  const res = await fetch('/api/atas')
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar atas')
  }
  const json: AtasResponse = await res.json()
  return json.data
}

async function fetchAta(id: string): Promise<AtaRow> {
  const res = await fetch(`/api/atas/${id}`)
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar ata')
  }
  const json: AtaResponse = await res.json()
  return json.data
}

async function createAta(data: CriarAtaFormData): Promise<AtaRow> {
  const res = await fetch('/api/atas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? 'Erro ao criar ata')
  }
  return json.data
}

async function updateAta({ id, data }: { id: string; data: EditarAtaFormData }): Promise<AtaRow> {
  const res = await fetch(`/api/atas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? 'Erro ao atualizar ata')
  }
  return json.data
}

async function deleteAta(id: string): Promise<void> {
  const res = await fetch(`/api/atas/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error ?? 'Erro ao excluir ata')
  }
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
    mutationFn: createAta,
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
    mutationFn: (data: EditarAtaFormData) => updateAta({ id, data }),
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
    mutationFn: deleteAta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atas'] })
      toast.success('Ata excluída com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
