import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'

type ProfileRow = {
  role: UserRole
}

const MAX_MODELOS = Number(process.env.MAX_MODELOS) || 3

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

  if (!profile || !can.createModelo(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.nome !== undefined) {
    if (typeof body.nome !== 'string' || !body.nome.trim()) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }
    updates.nome = body.nome.trim()
  }

  if (body.conteudo !== undefined) {
    updates.conteudo = body.conteudo
  }

  if (body.ativo !== undefined) {
    // Se for ativar, verifica limite
    if (body.ativo === true) {
      const { data: current } = await supabase
        .from('modelos')
        .select('ativo')
        .eq('id', id)
        .single()
        .overrideTypes<{ ativo: boolean }, { merge: false }>()

      if (!current?.ativo) {
        const { count } = await supabase
          .from('modelos')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)

        if ((count ?? 0) >= MAX_MODELOS) {
          return NextResponse.json({
            error: `Limite de ${MAX_MODELOS} modelos ativos atingido.`,
          }, { status: 400 })
        }
      }
    }
    updates.ativo = body.ativo
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('modelos')
    .update(updates as never)
    .eq('id', id)
    .select('id, nome, conteudo, ativo, criado_por, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _request: Request,
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

  if (!profile || !can.createModelo(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { error } = await supabase
    .from('modelos')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: null })
}
