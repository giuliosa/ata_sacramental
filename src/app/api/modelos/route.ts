import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'

type ProfileRow = {
  role: UserRole
}

const MAX_MODELOS = Number(process.env.MAX_MODELOS) || 3

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

  const isAdm = profile && can.createModelo(profile.role)

  let query = supabase
    .from('modelos')
    .select('id, nome, conteudo, ativo, criado_por, created_at')
    .order('created_at', { ascending: false })

  if (!isAdm) {
    query = query.eq('ativo', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
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

  if (!profile || !can.createModelo(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.nome || typeof body.nome !== 'string' || !body.nome.trim()) {
    return NextResponse.json({ error: 'Nome do modelo é obrigatório' }, { status: 400 })
  }

  // Verifica limite de modelos ativos
  const { count } = await supabase
    .from('modelos')
    .select('*', { count: 'exact', head: true })
    .eq('ativo', true)

  const ativoCount = count ?? 0
  const willBeActive = body.ativo !== false

  if (willBeActive && ativoCount >= MAX_MODELOS) {
    return NextResponse.json({
      error: `Limite de ${MAX_MODELOS} modelos ativos atingido. Desative um modelo antes de criar outro.`,
    }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('modelos')
    .insert({
      nome: body.nome.trim(),
      conteudo: body.conteudo ?? { defaults: {}, campos_obrigatorios: [] },
      criado_por: user.id,
      ativo: willBeActive,
    } as never)
    .select('id, nome, conteudo, ativo, criado_por, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
