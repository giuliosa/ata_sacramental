import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarAtaSchema } from '@/lib/schemas'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'
type ProfileRow = {
  role: UserRole
  ala_id: string | null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id')
    .eq('id', user.id)
    .single()
    .overrideTypes<ProfileRow, { merge: false }>()

  if (!profile?.ala_id) {
    return NextResponse.json({ error: 'Usuário sem ala vinculada' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('atas')
    .select('id, data_reuniao, ala_id, modelo_id, conteudo, criado_por, created_at, updated_at, ala:alas(nome), autor:users(name)')
    .eq('ala_id', profile.ala_id)
    .order('data_reuniao', { ascending: false })

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
    .select('role, ala_id')
    .eq('id', user.id)
    .single()
    .overrideTypes<ProfileRow, { merge: false }>()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  if (!can.createAta(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão para criar atas' }, { status: 403 })
  }

  if (!profile.ala_id) {
    return NextResponse.json({ error: 'Usuário sem ala vinculada' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = criarAtaSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('atas')
    .insert({
      data_reuniao: parsed.data.data_reuniao,
      ala_id: profile.ala_id,
      modelo_id: parsed.data.modelo_id,
      conteudo: parsed.data.conteudo as never,
      criado_por: user.id,
    } as never)
    .select('id, data_reuniao, ala_id, modelo_id, conteudo, criado_por, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Já existe uma ata para esta data' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
