import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/utils'
import { formatFieldValue } from '@/lib/print-utils'
import { can } from '@/lib/permissions'
import type { Json } from '@/types/supabase'
import type { UserRole } from '@/types/domain'

type DashboardProfile = {
  role: UserRole
  ala_id: string | null
  ala: { nome: string } | null
}

type RecentAta = {
  id: string
  data_reuniao: string
  conteudo: Json
  modelo_id: string
  modelo: { nome: string; campos: Json } | null
}

export const metadata: Metadata = { title: 'Início' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id, ala:alas(nome)')
    .eq('id', user!.id)
    .single()
    .overrideTypes<DashboardProfile, { merge: false }>()

  if (!profile?.ala_id) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Bem-vindo!</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Complete seu cadastro para começar.
        </p>
        <Link
          href="/completar-cadastro"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          Completar cadastro
        </Link>
      </div>
    )
  }

  const { data: recentAtas } = await supabase
    .from('atas')
    .select('id, data_reuniao, conteudo, modelo_id, modelo:modelos!inner(nome, campos)')
    .eq('ala_id', profile.ala_id)
    .order('data_reuniao', { ascending: false })
    .limit(5)
    .overrideTypes<RecentAta[], { merge: false }>()

  const canCreate = can.createAta(profile.role)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Início</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {profile.ala?.nome}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/atas/nova"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova ata
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Atas recentes</h2>
        </div>

        {!recentAtas?.length ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">Nenhuma ata encontrada.</p>
            {canCreate && (
              <Link
                href="/atas/nova"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" /> Criar primeira ata
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-slate-700">
            {recentAtas.map(ata => {
              const conteudo = ata.conteudo as Record<string, any>
              const campos = (ata.modelo?.campos ?? []) as any[]
              const firstTextField = campos.find((c: any) => c.type === 'text')
              const primaryInfo = firstTextField ? conteudo[firstTextField.id] : null

              return (
                <li key={ata.id}>
                  <Link
                    href={`/atas/${ata.id}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {formatDateBR(ata.data_reuniao)}
                      </p>
                      {primaryInfo && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                          {formatFieldValue(primaryInfo)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {ata.modelo?.nome}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
