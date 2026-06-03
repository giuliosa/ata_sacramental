import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR, normalizeCampos } from '@/lib/utils'
import { formatFieldValue } from '@/lib/print-utils'
import type { ModeloCampo } from '@/types/domain'
import type { Json } from '@/types/supabase'
import { AtaActions } from '@/features/atas/AtaActions'

export const metadata: Metadata = { title: 'Ata' }

type AtaView = {
  id: string
  data_reuniao: string
  conteudo: Json
  modelo_id: string
  criado_por: string
  created_at: string
  updated_at: string
  ala: { nome: string; estaca: { nome: string } } | null
  autor: { name: string } | null
}

type ViewerProfile = {
  role: 'adm' | 'editor' | 'reader'
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
    .select('id, data_reuniao, conteudo, modelo_id, criado_por, created_at, updated_at, ala:alas!inner(nome, estaca:estacas(nome)), autor:users(name)')
    .eq('id', id)
    .eq('ala_id', profile!.ala_id!)
    .single()
    .overrideTypes<AtaView, { merge: false }>()

  if (!ata) notFound()

  const { data: modelo } = await supabase
    .from('modelos')
    .select('nome, campos')
    .eq('id', ata.modelo_id)
    .single()
    .overrideTypes<{ nome: string; campos: Json }, { merge: false }>()

  const campos = normalizeCampos(modelo?.campos) as ModeloCampo[]
  const conteudo = ata.conteudo as Record<string, any>
  const role = profile?.role ?? 'reader'

  const sortedCampos = [...campos].sort((a, b) => a.order - b.order)

  return (
    <div className="max-w-3xl">
      <AtaActions ataId={ata.id} role={role} />

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8 dark:border-slate-700 dark:bg-slate-800">
        <header className="mb-6 border-b border-gray-100 pb-4 dark:border-slate-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            {modelo?.nome || 'Ata de Reunião Sacramental'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {formatDateBR(ata.data_reuniao)} — {ata.ala?.nome}
            {ata.ala?.estaca && ` — ${ata.ala.estaca.nome}`}
          </p>
        </header>

        <dl className="space-y-4 text-sm">
          {sortedCampos.map(campo => {
            const value = conteudo[campo.id]
            if (value === undefined || value === null || value === '' || 
                (Array.isArray(value) && value.length === 0)) return null
            
            return (
              <div key={campo.id} className="flex gap-4">
                <dt className="w-36 shrink-0 font-medium text-gray-500 dark:text-slate-400">
                  {campo.label}
                </dt>
                <dd className="text-gray-900 dark:text-slate-100">
                  {campo.type === 'list' && Array.isArray(value) ? (
                    <ul className="list-inside list-disc space-y-1">
                      {value.map((item: string, i: number) => (
                        item ? <li key={i}>{item}</li> : null
                      ))}
                    </ul>
                  ) : (
                    formatFieldValue(value)
                  )}
                </dd>
              </div>
            )
          })}
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
