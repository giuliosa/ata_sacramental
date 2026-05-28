import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // O RLS já filtra as atas pela ala_id do usuário autenticado.
  // Se não houver usuário, o RLS não retornará nada.
  const { data, error } = await supabase
    .from('atas')
    .select('id, data_reuniao, ala_id, modelo_id, conteudo, criado_por, created_at, updated_at, ala:alas(nome), autor:users(name)')
    .order('data_reuniao', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
