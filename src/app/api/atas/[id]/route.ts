import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('atas')
    .select('id, data_reuniao, ala_id, modelo_id, conteudo, criado_por, created_at, updated_at, ala:alas(nome, estaca_id, estaca:estacas(nome)), autor:users(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Ata não encontrada ou acesso negado' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
