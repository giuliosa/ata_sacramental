import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  return <AppShell user={profile}>{children}</AppShell>
}
