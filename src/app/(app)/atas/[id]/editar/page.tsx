import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { UserRole, AtaConteudo } from '@/types/domain'
import type { Json } from '@/types/supabase'
import { EditarAtaClient } from './EditarAtaClient'

export const metadata: Metadata = { title: 'Editar ata' }

type AtaEditView = {
  id: string
  data_reuniao: string
  conteudo: Json
  ala_id: string
}

type ProfileCheck = {
  role: UserRole
  ala_id: string | null
}

export default async function EditarAtaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ProfileCheck, { merge: false }>()

  if (!can.editAta(profile?.role ?? 'reader')) redirect('/atas')

  const { data: ata } = await supabase
    .from('atas')
    .select('id, data_reuniao, conteudo, ala_id')
    .eq('id', id)
    .eq('ala_id', profile!.ala_id!)
    .single()
    .overrideTypes<AtaEditView, { merge: false }>()

  if (!ata) notFound()

  return (
    <div className="max-w-3xl">
      <Link
        href={`/atas/${id}`}
        className="no-print mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-slate-100">Editar ata</h1>

      <EditarAtaClient
        ataId={ata.id}
        defaultConteudo={ata.conteudo as unknown as AtaConteudo}
      />
    </div>
  )
}
