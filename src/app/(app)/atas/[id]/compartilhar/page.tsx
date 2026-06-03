import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import { SharePanel } from '@/features/atas/SharePanel'

export const metadata: Metadata = { title: 'Compartilhar Ata' }

type ViewerProfile = {
  role: 'adm' | 'editor' | 'reader'
  ala_id: string | null
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ViewerProfile, { merge: false }>()

  if (!profile) redirect('/login')

  if (!can.shareAta(profile.role)) {
    redirect(`/atas/${id}`)
  }

  const { data: ata } = await supabase
    .from('atas')
    .select('id, data_reuniao, modelo_id, ala_id')
    .eq('id', id)
    .single()
    .overrideTypes<{ id: string; data_reuniao: string; modelo_id: string; ala_id: string }, { merge: false }>()

  if (!ata) notFound()

  const { data: modelo } = await supabase
    .from('modelos')
    .select('nome')
    .eq('id', ata.modelo_id)
    .single()
    .overrideTypes<{ nome: string }, { merge: false }>()

  return (
    <SharePanel
      ataId={ata.id}
      ataDataReuniao={ata.data_reuniao}
      ataModeloNome={modelo?.nome || 'Ata'}
      role={profile.role}
    />
  )
}
