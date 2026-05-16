import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { editarAtaSchema } from '@/lib/schemas'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'

type ProfileRow = {
  role: UserRole
  ala_id: string | null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('atas')
    .select('id, data_reuniao, ala_id, modelo_id, conteudo, criado_por, created_at, updated_at, ala:alas(nome, estaca_id, estaca:estacas(nome)), autor:users(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Ata não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

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
    .select('role, ala_id')
    .eq('id', user.id)
    .single()
    .overrideTypes<ProfileRow, { merge: false }>()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  if (!can.editAta(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão para editar atas' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = editarAtaSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('atas')
    .update({
      conteudo: parsed.data.conteudo as never,
      ...(parsed.data.data_reuniao ? { data_reuniao: parsed.data.data_reuniao } : {}),
    } as never)
    .eq('id', id)
    .eq('ala_id', profile.ala_id!)
    .select('id, data_reuniao, ala_id, modelo_id, conteudo, criado_por, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Ata não encontrada' }, { status: 404 })
    }
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
    .select('role, ala_id')
    .eq('id', user.id)
    .single()
    .overrideTypes<ProfileRow, { merge: false }>()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  if (!can.editAta(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão para excluir atas' }, { status: 403 })
  }

  const { error } = await supabase
    .from('atas')
    .delete()
    .eq('id', id)
    .eq('ala_id', profile.ala_id!)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: null })
}
