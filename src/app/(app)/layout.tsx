import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Carrega o perfil do usuário para o layout (role, ala, etc.)
  const { data: profile } = await supabase
    .from('users')
    .select('*, ala:alas(*, estaca:estacas(*))')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return <AppShell user={profile}>{children}</AppShell>
}
