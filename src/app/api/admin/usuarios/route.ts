import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // O RLS já garante que apenas ADMs vejam todos os usuários.
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, ala_id, created_at, ala:alas(nome)')
    .order('name', { ascending: true })

  if (error) {
    if (error.code === '42501') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
