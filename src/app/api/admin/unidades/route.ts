import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

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
