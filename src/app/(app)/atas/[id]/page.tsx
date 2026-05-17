import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/utils'
import type { UserRole } from '@/types/domain'
import type { Json } from '@/types/supabase'
import type { AtaConteudo } from '@/types/domain'
import { AtaActions } from '@/features/atas/AtaActions'

export const metadata: Metadata = { title: 'Ata' }

type AtaView = {
  id: string
  data_reuniao: string
  conteudo: Json
  criado_por: string
  created_at: string
  updated_at: string
  ala: { nome: string; estaca: { nome: string } } | null
  autor: { name: string } | null
}

type ViewerProfile = {
  role: UserRole
  ala_id: string | null
}

export default async function AtaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ViewerProfile, { merge: false }>()

  const { data: ata } = await supabase
    .from('atas')
    .select('id, data_reuniao, conteudo, criado_por, created_at, updated_at, ala:alas!inner(nome, estaca:estacas(nome)), autor:users(name)')
    .eq('id', id)
    .eq('ala_id', profile!.ala_id!)
    .single()
    .overrideTypes<AtaView, { merge: false }>()

  if (!ata) notFound()

  const conteudo = ata.conteudo as unknown as AtaConteudo
  const role = profile?.role ?? 'reader'

  return (
    <div className="max-w-3xl">
      <AtaActions ataId={ata.id} role={role} />

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-700 dark:bg-slate-800">
        <header className="mb-6 border-b border-gray-100 pb-4 dark:border-slate-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Ata de Reunião Sacramental
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {formatDateBR(ata.data_reuniao)} — {ata.ala?.nome}
            {ata.ala?.estaca && ` — ${ata.ala.estaca.nome}`}
          </p>
        </header>

        <dl className="space-y-4 text-sm">
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Presidida por</dt>
            <dd className="text-gray-900 dark:text-slate-100">{conteudo.presidida_por}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Dirigida por</dt>
            <dd className="text-gray-900 dark:text-slate-100">{conteudo.dirigida_por}</dd>
          </div>

          <hr className="border-gray-100 dark:border-slate-700" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Regente</dt>
            <dd className="text-gray-900 dark:text-slate-100">{conteudo.regente || '-'}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Pianista</dt>
            <dd className="text-gray-900 dark:text-slate-100">{conteudo.pianista || '-'}</dd>
          </div>

          <hr className="border-gray-100 dark:border-slate-700" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Hino inicial</dt>
            <dd className="text-gray-900 dark:text-slate-100">
              {conteudo.hino_inicial_numero ? `${conteudo.hino_inicial_numero}. ` : ''}{conteudo.hino_inicial_titulo}
            </dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Oração inicial</dt>
            <dd className="text-gray-900 dark:text-slate-100">{conteudo.oracao_inicial}</dd>
          </div>

          {(conteudo.anuncios?.length ?? 0) > 0 && (
            <>
              <hr className="border-gray-100 dark:border-slate-700" />
              <div className="flex gap-4">
                <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Anúncios</dt>
                <dd>
                  <ul className="space-y-2">
                    {conteudo.anuncios.map((a, i) => (
                      <li key={i} className="text-gray-900 dark:text-slate-100">
                        <span className="text-gray-500 dark:text-slate-400">[{a.data}]</span> {a.descricao}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </>
          )}

          {(conteudo.apoios?.length ?? 0) > 0 && (
            <>
              <hr className="border-gray-100 dark:border-slate-700" />
              <div className="flex gap-4">
                <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Apoios</dt>
                <dd>
                  <ul className="space-y-1">
                    {conteudo.apoios.map((a, i) => (
                      <li key={i} className="text-gray-900 dark:text-slate-100">
                        {a.cargo}: {a.nome_membro}
                        {a.votacao_aprovada === true && <span className="ml-2 text-green-600 dark:text-green-400">✓</span>}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </>
          )}

          {(conteudo.desobrigacoes?.length ?? 0) > 0 && (
            <>
              <hr className="border-gray-100 dark:border-slate-700" />
              <div className="flex gap-4">
                <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Desobrigações</dt>
                <dd>
                  <ul className="space-y-1">
                    {conteudo.desobrigacoes.map((d, i) => (
                      <li key={i} className="text-gray-900 dark:text-slate-100">{d}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </>
          )}

          <hr className="border-gray-100 dark:border-slate-700" />

          {conteudo.hino_sacramental_titulo && (
            <div className="flex gap-4">
              <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Hino sacramental</dt>
              <dd className="text-gray-900 dark:text-slate-100">
                {conteudo.hino_sacramental_numero ? `${conteudo.hino_sacramental_numero}. ` : ''}{conteudo.hino_sacramental_titulo}
              </dd>
            </div>
          )}

          <hr className="border-gray-100 dark:border-slate-700" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Discursantes</dt>
            <dd>
              <ol className="space-y-2">
                {conteudo.discursantes.map((d, i) => (
                  <li key={i} className="text-gray-900 dark:text-slate-100">
                    <span className="font-medium">{d.nome}</span>
                    {d.tema && <span className="text-gray-500 dark:text-slate-400"> — {d.tema}</span>}
                  </li>
                ))}
              </ol>
            </dd>
          </div>

          {conteudo.hino_intermediario_titulo && (
            <div className="flex gap-4">
              <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Hino interm.</dt>
              <dd className="text-gray-900 dark:text-slate-100">
                {conteudo.hino_intermediario_numero ? `${conteudo.hino_intermediario_numero}. ` : ''}{conteudo.hino_intermediario_titulo}
              </dd>
            </div>
          )}

          <hr className="border-gray-100 dark:border-slate-700" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Hino final</dt>
            <dd className="text-gray-900 dark:text-slate-100">
              {conteudo.hino_final_numero ? `${conteudo.hino_final_numero}. ` : ''}{conteudo.hino_final_titulo}
            </dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">Oração encerr.</dt>
            <dd className="text-gray-900 dark:text-slate-100">{conteudo.oracao_encerramento}</dd>
          </div>
        </dl>

        <footer className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-slate-700 dark:text-slate-500">
          <p>Criada por {ata.autor?.name ?? '?'} em {new Date(ata.created_at).toLocaleString('pt-BR')}</p>
          {ata.updated_at !== ata.created_at && (
            <p>Última edição em {new Date(ata.updated_at).toLocaleString('pt-BR')}</p>
          )}
        </footer>
      </article>
    </div>
  )
}
