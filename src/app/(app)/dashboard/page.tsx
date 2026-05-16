import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/utils'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'

export const metadata: Metadata = { title: 'Início' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id, ala:alas(nome)')
    .eq('id', user!.id)
    .single()

  const { data: atasRecentes } = await supabase
    .from('atas')
    .select('id, data_reuniao, conteudo')
    .eq('ala_id', profile!.ala_id!)
    .order('data_reuniao', { ascending: false })
    .limit(5)

  const role = profile?.role as UserRole

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Início</h1>
          <p className="mt-1 text-sm text-gray-500">
            {profile?.ala && typeof profile.ala === 'object' && 'nome' in profile.ala
              ? `Ala ${(profile.ala as { nome: string }).nome}`
              : 'Bem-vindo'}
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

      {/* Atas recentes */}
      <section aria-labelledby="atas-recentes-title">
        <h2
          id="atas-recentes-title"
          className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-400"
        >
          Atas recentes
        </h2>

        {!atasRecentes?.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">Nenhuma ata registrada ainda.</p>
            {can.createAta(role) && (
              <Link
                href="/atas/nova"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Criar primeira ata
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {atasRecentes.map(ata => {
              const conteudo = ata.conteudo as Record<string, unknown>
              return (
                <li key={ata.id}>
                  <Link
                    href={`/atas/${ata.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-colors hover:border-brand-300 hover:bg-brand-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Reunião de {formatDateBR(ata.data_reuniao)}
                      </p>
                      {typeof conteudo?.presidida_por === 'string' && conteudo.presidida_por && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          Presidida por {conteudo.presidida_por}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400" aria-hidden="true">→</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Link para lista completa */}
      {(atasRecentes?.length ?? 0) > 0 && (
        <Link
          href="/atas"
          className="inline-flex items-center text-sm text-brand-600 hover:text-brand-700"
        >
          Ver todas as atas →
        </Link>
      )}
    </div>
  )
}
