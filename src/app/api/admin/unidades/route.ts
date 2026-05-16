import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'

type ProfileRow = {
  role: UserRole
}

export async function GET() {
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

  if (!profile || !can.manageUnidades(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { data: estacas, error: errEstacas } = await supabase
    .from('estacas')
    .select('id, nome, created_at')
    .order('nome', { ascending: true })

  if (errEstacas) {
    return NextResponse.json({ error: errEstacas.message }, { status: 500 })
  }

  const { data: alas, error: errAlas } = await supabase
    .from('alas')
    .select('id, nome, estaca_id, created_at')
    .order('nome', { ascending: true })

  if (errAlas) {
    return NextResponse.json({ error: errAlas.message }, { status: 500 })
  }

  return NextResponse.json({ data: { estacas, alas } })
}

export async function POST(request: Request) {
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

  if (!profile || !can.manageUnidades(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await request.json()

  if (body.tipo === 'estaca') {
    if (!body.nome || typeof body.nome !== 'string' || !body.nome.trim()) {
      return NextResponse.json({ error: 'Nome da estaca é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('estacas')
      .insert({ nome: body.nome.trim() } as never)
      .select('id, nome, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Estaca já existe' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  }

  if (body.tipo === 'ala') {
    if (!body.nome || typeof body.nome !== 'string' || !body.nome.trim()) {
      return NextResponse.json({ error: 'Nome da ala é obrigatório' }, { status: 400 })
    }
    if (!body.estaca_id || typeof body.estaca_id !== 'string') {
      return NextResponse.json({ error: 'Estaca é obrigatória' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('alas')
      .insert({ nome: body.nome.trim(), estaca_id: body.estaca_id } as never)
      .select('id, nome, estaca_id, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Já existe uma ala com este nome nesta estaca' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  }

  return NextResponse.json({ error: 'Tipo inválido. Use "estaca" ou "ala".' }, { status: 400 })
}
