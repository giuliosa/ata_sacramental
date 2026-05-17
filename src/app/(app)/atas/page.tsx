import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/utils'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'
import type { Json } from '@/types/supabase'

export const metadata: Metadata = { title: 'Atas' }

type ProfileInfo = {
  role: UserRole
  ala_id: string | null
  ala: { nome: string } | null
}

type AtaRow = {
  id: string
  data_reuniao: string
  conteudo: Json
  created_at: string
}

export default async function AtasListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id, ala:alas(nome)')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ProfileInfo, { merge: false }>()

  const { data: atas } = await supabase
    .from('atas')
    .select('id, data_reuniao, conteudo, created_at')
    .eq('ala_id', profile!.ala_id!)
    .order('data_reuniao', { ascending: false })
    .overrideTypes<AtaRow[], { merge: false }>()

  const role = profile?.role ?? 'reader'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Atas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {profile?.ala ? `Ala ${profile.ala.nome}` : 'Todas as atas'}
          </p>
        </div>

        {can.createAta(role) && (
          <Link
            href="/atas/nova"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova ata
          </Link>
        )}
      </div>

      {!atas?.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <FileText className="mx-auto h-10 w-10 text-gray-300 dark:text-slate-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">Nenhuma ata registrada ainda.</p>
          {can.createAta(role) && (
            <Link
              href="/atas/nova"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Criar primeira ata
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Presidida por</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {atas.map(ata => {
                const conteudo = ata.conteudo as Record<string, unknown>
                return (
                  <tr key={ata.id} className="transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-900/10">
                    <td className="px-6 py-4">
                      <Link href={`/atas/${ata.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-700 dark:text-slate-100">
                        {formatDateBR(ata.data_reuniao)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {typeof conteudo?.presidida_por === 'string' ? conteudo.presidida_por : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/atas/${ata.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
