import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // O RLS já filtra modelos ativos para leitores e todos para ADMs.
  const { data, error } = await supabase
    .from('modelos')
    .select('id, nome, conteudo, ativo, criado_por, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
