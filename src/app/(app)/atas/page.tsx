import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
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

const PAGE_SIZE = 15

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default async function AtasListPage({
  searchParams,
}: {
  searchParams: { page?: string; mes?: string; ano?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id, ala:alas(nome)')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ProfileInfo, { merge: false }>()

  const currentPage = Math.max(1, Number(searchParams.page) || 1)
  const currentMes = searchParams.mes || ''
  const currentAno = searchParams.ano || ''
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const alaId = profile!.ala_id!

  function getMonthRange(): [string, string] | null {
    if (!currentMes || !currentAno) return null
    const startDate = `${currentAno}-${currentMes.padStart(2, '0')}-01`
    const nextMonthNum = parseInt(currentMes) + 1
    const nextMonthYear = nextMonthNum > 12 ? parseInt(currentAno) + 1 : parseInt(currentAno)
    const nextMonthStr = nextMonthNum > 12 ? '01' : String(nextMonthNum).padStart(2, '0')
    const endDate = `${nextMonthYear}-${nextMonthStr}-01`
    return [startDate, endDate]
  }

  const monthRange = getMonthRange()

  let countQuery = supabase
    .from('atas')
    .select('*', { count: 'exact', head: true })
    .eq('ala_id', alaId)

  let dataQuery = supabase
    .from('atas')
    .select('id, data_reuniao, conteudo, created_at')
    .eq('ala_id', alaId)
    .order('data_reuniao', { ascending: false })
    .range(from, to)

  if (monthRange) {
    const [start, end] = monthRange
    countQuery = countQuery.gte('data_reuniao', start).lt('data_reuniao', end)
    dataQuery = dataQuery.gte('data_reuniao', start).lt('data_reuniao', end)
  }

  const [{ count: totalCount }, { data: atas }] = await Promise.all([
    countQuery,
    dataQuery.overrideTypes<AtaRow[], { merge: false }>(),
  ])

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE)
  const role = profile?.role ?? 'reader'
  const currentYear = new Date().getFullYear()

  function buildPageUrl(page: number) {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (currentMes) params.set('mes', currentMes)
    if (currentAno) params.set('ano', currentAno)
    return `/atas?${params.toString()}`
  }

  return (
    <div className="animate-fade-in space-y-6">
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
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova ata
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="mes" className="mb-1 block text-xs font-medium text-gray-500 dark:text-slate-400">Mês</label>
          <select
            id="mes"
            name="mes"
            defaultValue={currentMes}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Todos</option>
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={String(i + 1)}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ano" className="mb-1 block text-xs font-medium text-gray-500 dark:text-slate-400">Ano</label>
          <select
            id="ano"
            name="ano"
            defaultValue={currentAno}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Todos</option>
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-brand-700"
        >
          Filtrar
        </button>
        {(currentMes || currentAno) && (
          <Link
            href="/atas"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Limpar
          </Link>
        )}
      </form>

      {!atas?.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <FileText className="mx-auto h-10 w-10 text-gray-300 dark:text-slate-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
            {(currentMes || currentAno) ? 'Nenhuma ata encontrada para este período.' : 'Nenhuma ata registrada ainda.'}
          </p>
          {can.createAta(role) && !currentMes && !currentAno && (
            <Link
              href="/atas/nova"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-all duration-200 hover:text-brand-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Criar primeira ata
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white sm:block dark:border-slate-700 dark:bg-slate-800">
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
                    <tr key={ata.id} className="animate-slide-up transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-900/10">
                      <td className="px-6 py-4">
                        <Link href={`/atas/${ata.id}`} className="text-sm font-medium text-gray-900 transition-all duration-200 hover:text-brand-700 dark:text-slate-100">
                          {formatDateBR(ata.data_reuniao)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                        {typeof conteudo?.presidida_por === 'string' ? conteudo.presidida_por : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/atas/${ata.id}`}
                          className="inline-flex items-center text-sm font-medium text-brand-600 transition-all duration-200 hover:scale-105 hover:text-brand-700"
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

          <div className="block space-y-3 sm:hidden">
            {atas.map(ata => {
              const conteudo = ata.conteudo as Record<string, unknown>
              return (
                <div
                  key={ata.id}
                  className="animate-slide-up rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <Link href={`/atas/${ata.id}`} className="text-sm font-medium text-gray-900 transition-all duration-200 hover:text-brand-700 dark:text-slate-100">
                      {formatDateBR(ata.data_reuniao)}
                    </Link>
                    <Link
                      href={`/atas/${ata.id}`}
                      className="inline-flex items-center text-sm font-medium text-brand-600 transition-all duration-200 hover:text-brand-700"
                    >
                      Ver
                    </Link>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                    {typeof conteudo?.presidida_por === 'string' ? conteudo.presidida_por : '-'}
                  </p>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Link
                href={buildPageUrl(currentPage - 1)}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  currentPage <= 1
                    ? 'pointer-events-none opacity-50'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : undefined}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Link>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                Página {currentPage} de {totalPages}
              </span>
              <Link
                href={buildPageUrl(currentPage + 1)}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  currentPage >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                aria-disabled={currentPage >= totalPages}
                tabIndex={currentPage >= totalPages ? -1 : undefined}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
