import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'
import { NovaAtaClient } from './NovaAtaClient'

export const metadata: Metadata = { title: 'Nova ata' }

type ProfileCheck = {
  role: UserRole
  ala_id: string | null
}

type ModeloOption = {
  id: string
  nome: string
}

export default async function NovaAtaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ProfileCheck, { merge: false }>()

  if (!profile?.ala_id) redirect('/completar-cadastro')

  if (!can.createAta(profile.role)) redirect('/atas')

  const { data: modelos } = await supabase
    .from('modelos')
    .select('id, nome')
    .eq('ativo', true)
    .overrideTypes<ModeloOption[], { merge: false }>()

  if (!modelos?.length) {
    return (
      <div className="max-w-3xl">
        <Link
          href="/atas"
          className="no-print mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Link>
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">Nenhum modelo ativo disponível.</p>
          <p className="mt-1 text-xs text-gray-400">Peça a um administrador para criar um modelo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/atas"
        className="no-print mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Nova ata</h1>

      <NovaAtaClient modelos={modelos} />
    </div>
  )
}
