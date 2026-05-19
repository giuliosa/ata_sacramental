import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseConfig } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'

type UserProfileStatus = {
  ala_id: string | null
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const { url, key } = getSupabaseConfig()

    const setCookies: { name: string; value: string; options: CookieOptions }[] = []

    const supabase = createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            setCookies.push({ name, value, options })
          })
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password recovery → redirect to password update page
      if (type === 'recovery') {
        const response = NextResponse.redirect(`${origin}/auth/atualizar-senha`)
        for (const { name, value, options } of setCookies) {
          response.cookies.set(name, value, options)
        }
        return response
      }

      const { data: { user } } = await supabase.auth.getUser()
      let destination = `${origin}${next}`

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('ala_id')
          .eq('id', user.id)
          .single()
          .overrideTypes<UserProfileStatus, { merge: false }>()

        if (!profile?.ala_id) {
          destination = `${origin}/completar-cadastro`
        }
      }

      const response = NextResponse.redirect(destination)
      for (const { name, value, options } of setCookies) {
        response.cookies.set(name, value, options)
      }
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_error`)
}
