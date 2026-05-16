import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Edit2, Printer } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/utils'
import { can } from '@/lib/permissions'
import type { UserRole } from '@/types/domain'
import type { Json } from '@/types/supabase'
import type { AtaConteudo } from '@/types/domain'

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
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href="/atas"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/atas/${id}/imprimir`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir
          </Link>
          {can.editAta(role) && (
            <Link
              href={`/atas/${id}/editar`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              Editar
            </Link>
          )}
        </div>
      </div>

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Ata de Reunião Sacramental
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatDateBR(ata.data_reuniao)} — {ata.ala?.nome}
            {ata.ala?.estaca && ` — ${ata.ala.estaca.nome}`}
          </p>
        </header>

        <dl className="space-y-4 text-sm">
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Presidida por</dt>
            <dd className="text-gray-900">{conteudo.presidida_por}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Dirigida por</dt>
            <dd className="text-gray-900">{conteudo.dirigida_por}</dd>
          </div>

          <hr className="border-gray-100" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Regente</dt>
            <dd className="text-gray-900">{conteudo.regente || '-'}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Pianista</dt>
            <dd className="text-gray-900">{conteudo.pianista || '-'}</dd>
          </div>

          <hr className="border-gray-100" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Hino inicial</dt>
            <dd className="text-gray-900">
              {conteudo.hino_inicial_numero ? `${conteudo.hino_inicial_numero}. ` : ''}{conteudo.hino_inicial_titulo}
            </dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Oração inicial</dt>
            <dd className="text-gray-900">{conteudo.oracao_inicial}</dd>
          </div>

          {(conteudo.anuncios?.length ?? 0) > 0 && (
            <>
              <hr className="border-gray-100" />
              <div className="flex gap-4">
                <dt className="w-36 shrink-0 font-medium text-gray-500">Anúncios</dt>
                <dd>
                  <ul className="space-y-2">
                    {conteudo.anuncios.map((a, i) => (
                      <li key={i} className="text-gray-900">
                        <span className="text-gray-500">[{a.data}]</span> {a.descricao}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </>
          )}

          {(conteudo.apoios?.length ?? 0) > 0 && (
            <>
              <hr className="border-gray-100" />
              <div className="flex gap-4">
                <dt className="w-36 shrink-0 font-medium text-gray-500">Apoios</dt>
                <dd>
                  <ul className="space-y-1">
                    {conteudo.apoios.map((a, i) => (
                      <li key={i} className="text-gray-900">
                        {a.cargo}: {a.nome_membro}
                        {a.votacao_aprovada === true && <span className="ml-2 text-green-600">✓</span>}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </>
          )}

          {(conteudo.desobrigacoes?.length ?? 0) > 0 && (
            <>
              <hr className="border-gray-100" />
              <div className="flex gap-4">
                <dt className="w-36 shrink-0 font-medium text-gray-500">Desobrigações</dt>
                <dd>
                  <ul className="space-y-1">
                    {conteudo.desobrigacoes.map((d, i) => (
                      <li key={i} className="text-gray-900">{d}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </>
          )}

          <hr className="border-gray-100" />

          {conteudo.hino_sacramental_titulo && (
            <div className="flex gap-4">
              <dt className="w-36 shrink-0 font-medium text-gray-500">Hino sacramental</dt>
              <dd className="text-gray-900">
                {conteudo.hino_sacramental_numero ? `${conteudo.hino_sacramental_numero}. ` : ''}{conteudo.hino_sacramental_titulo}
              </dd>
            </div>
          )}

          <hr className="border-gray-100" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Discursantes</dt>
            <dd>
              <ol className="space-y-2">
                {conteudo.discursantes.map((d, i) => (
                  <li key={i} className="text-gray-900">
                    <span className="font-medium">{d.nome}</span>
                    {d.tema && <span className="text-gray-500"> — {d.tema}</span>}
                  </li>
                ))}
              </ol>
            </dd>
          </div>

          {conteudo.hino_intermediario_titulo && (
            <div className="flex gap-4">
              <dt className="w-36 shrink-0 font-medium text-gray-500">Hino interm.</dt>
              <dd className="text-gray-900">
                {conteudo.hino_intermediario_numero ? `${conteudo.hino_intermediario_numero}. ` : ''}{conteudo.hino_intermediario_titulo}
              </dd>
            </div>
          )}

          <hr className="border-gray-100" />

          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Hino final</dt>
            <dd className="text-gray-900">
              {conteudo.hino_final_numero ? `${conteudo.hino_final_numero}. ` : ''}{conteudo.hino_final_titulo}
            </dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-36 shrink-0 font-medium text-gray-500">Oração encerr.</dt>
            <dd className="text-gray-900">{conteudo.oracao_encerramento}</dd>
          </div>
        </dl>

        <footer className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-400">
          <p>Criada por {ata.autor?.name ?? '?'} em {new Date(ata.created_at).toLocaleString('pt-BR')}</p>
          {ata.updated_at !== ata.created_at && (
            <p>Última edição em {new Date(ata.updated_at).toLocaleString('pt-BR')}</p>
          )}
        </footer>
      </article>
    </div>
  )
}
