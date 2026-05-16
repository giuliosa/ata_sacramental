import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'

type ProfileRow = {
  role: UserRole
}

const ROLES: UserRole[] = ['adm', 'editor', 'reader']

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    .overrideTypes<ProfileRow, { merge: false }>()

  if (!profile || !can.manageUsers(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.role !== undefined) {
    if (!ROLES.includes(body.role)) {
      return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
    }
    updates.role = body.role
  }

  if (body.ala_id !== undefined) {
    updates.ala_id = body.ala_id
  }

  if (body.name !== undefined) {
    updates.name = body.name
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates as never)
    .eq('id', id)
    .select('id, email, name, role, ala_id, created_at, ala:alas(nome)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
