import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/api/auth/callback', '/completar-cadastro', '/auth/atualizar-senha']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // Renova a sessão — essencial para que Server Components leiam a sessão atualizada
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  // Redireciona para login se não autenticado e rota protegida
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redireciona para dashboard se já autenticado e tentou acessar login
  if (user && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico
     * - arquivos públicos (imagens, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
