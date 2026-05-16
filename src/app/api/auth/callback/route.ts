import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type UserProfileStatus = {
  ala_id: string | null
}

/**
 * Route Handler para o callback do OAuth do Supabase.
 * Após o login com Google, o Supabase redireciona para esta rota com um `code`.
 * Trocamos o code por uma sessão e redirecionamos o usuário.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Verifica se o usuário já completou o cadastro (tem ala vinculada)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('ala_id')
          .eq('id', user.id)
          .single()
          .overrideTypes<UserProfileStatus, { merge: false }>()

        // Primeiro login: redireciona para completar cadastro
        if (!profile?.ala_id) {
          return NextResponse.redirect(`${origin}/completar-cadastro`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Erro: redireciona para login com mensagem
  return NextResponse.redirect(`${origin}/login?error=callback_error`)
}
