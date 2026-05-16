'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UserRole } from '@/types/domain'

// ─── Usuários ────────────────────────────────────────────────────────────────

type UsuarioRow = {
  id: string
  email: string
  name: string
  role: UserRole
  ala_id: string | null
  created_at: string
  ala: { nome: string } | null
}

type UsuariosResponse = { data: UsuarioRow[] }

type UpdateUsuarioData = {
  role?: UserRole
  ala_id?: string | null
  name?: string
}

async function fetchUsuarios(): Promise<UsuarioRow[]> {
  const res = await fetch('/api/admin/usuarios')
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar usuários')
  }
  const json: UsuariosResponse = await res.json()
  return json.data
}

async function updateUsuario({ id, data }: { id: string; data: UpdateUsuarioData }): Promise<UsuarioRow> {
  const res = await fetch(`/api/admin/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? 'Erro ao atualizar usuário')
  }
  return json.data
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
    mutationFn: updateUsuario,
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

type EstacaRow = {
  id: string
  nome: string
  created_at: string
}

type AlaRow = {
  id: string
  nome: string
  estaca_id: string
  created_at: string
}

type UnidadesData = {
  estacas: EstacaRow[]
  alas: AlaRow[]
}

type UnidadesResponse = { data: UnidadesData }

async function fetchUnidades(): Promise<UnidadesData> {
  const res = await fetch('/api/admin/unidades')
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error ?? 'Erro ao carregar unidades')
  }
  const json: UnidadesResponse = await res.json()
  return json.data
}

async function createEstaca(nome: string): Promise<EstacaRow> {
  const res = await fetch('/api/admin/unidades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'estaca', nome }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? 'Erro ao criar estaca')
  }
  return json.data
}

async function createAla(data: { nome: string; estaca_id: string }): Promise<AlaRow> {
  const res = await fetch('/api/admin/unidades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'ala', ...data }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? 'Erro ao criar ala')
  }
  return json.data
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
    mutationFn: createEstaca,
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
    mutationFn: createAla,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unidades'] })
      toast.success('Ala criada com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
