import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/utils'
import { formatHino, formatApoio, formatDiscursante, formatAnuncio } from '@/lib/print-utils'
import type { Json } from '@/types/supabase'
import type { AtaConteudo } from '@/types/domain'
import { PrintActions } from '@/features/atas/PrintActions'
import { AutoPrint } from '@/features/atas/AutoPrint'

export const metadata: Metadata = { title: 'Imprimir ata' }

type AtaPrint = {
  id: string
  data_reuniao: string
  conteudo: Json
  ala: { nome: string; estaca: { nome: string } } | null
}

type ViewerProfile = {
  ala_id: string | null
}

export default async function AtaPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('ala_id')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ViewerProfile, { merge: false }>()

  const { data: ata } = await supabase
    .from('atas')
    .select('id, data_reuniao, conteudo, ala:alas!inner(nome, estaca:estacas(nome))')
    .eq('id', id)
    .eq('ala_id', profile!.ala_id!)
    .single()
    .overrideTypes<AtaPrint, { merge: false }>()

  if (!ata) notFound()

  const conteudo = ata.conteudo as unknown as AtaConteudo

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-sm leading-relaxed text-black print:p-0 dark:bg-slate-800 dark:text-slate-100">
      <AutoPrint />

      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">A Igreja de Jesus Cristo dos Santos dos Últimos Dias</h1>
        <p className="mt-1 font-semibold">{ata.ala?.nome}{ata.ala?.estaca ? ` — ${ata.ala.estaca.nome}` : ''}</p>
        <p className="mt-0.5 text-base font-semibold">Reunião Sacramental</p>
        <p className="mt-0.5">{formatDateBR(ata.data_reuniao)}</p>
      </div>

      <div className="mb-4 border-t border-b border-gray-800 py-3">
        <div className="flex justify-between">
          <span><span className="font-semibold">Presidida por:</span> {conteudo.presidida_por}</span>
          <span><span className="font-semibold">Dirigida por:</span> {conteudo.dirigida_por}</span>
        </div>
      </div>

      <table className="mb-4 w-full border-collapse">
        <tbody>
          <tr>
            <td className="w-40 align-top font-semibold">Regente</td>
            <td className="border-b border-dotted border-gray-400 pb-2">{conteudo.regente || '-'}</td>
          </tr>
          <tr>
            <td className="w-40 align-top font-semibold">Pianista</td>
            <td className="border-b border-dotted border-gray-400 pb-2">{conteudo.pianista || '-'}</td>
          </tr>
        </tbody>
      </table>

      <table className="mb-4 w-full border-collapse">
        <tbody>
          <tr>
            <td className="w-40 align-top font-semibold">Hino inicial</td>
            <td className="border-b border-dotted border-gray-400 pb-2">
              {formatHino(conteudo.hino_inicial_numero, conteudo.hino_inicial_titulo)}
            </td>
          </tr>
          <tr>
            <td className="w-40 align-top font-semibold">Oração inicial</td>
            <td className="border-b border-dotted border-gray-400 pb-2">{conteudo.oracao_inicial}</td>
          </tr>
        </tbody>
      </table>

      {(conteudo.anuncios?.length ?? 0) > 0 && (
        <div className="mb-4">
          <p className="mb-1 font-semibold">Anúncios</p>
          {conteudo.anuncios.map((a, i) => (
            <p key={i} className="border-b border-dotted border-gray-400 py-1">{formatAnuncio(a)}</p>
          ))}
        </div>
      )}

      {(conteudo.apoios?.length ?? 0) > 0 && (
        <div className="mb-4">
          <p className="mb-1 font-semibold">Apoios</p>
          {conteudo.apoios.map((a, i) => (
            <p key={i} className="border-b border-dotted border-gray-400 py-1">
              {formatApoio(a)}
            </p>
          ))}
        </div>
      )}

      {(conteudo.desobrigacoes?.length ?? 0) > 0 && (
        <div className="mb-4">
          <p className="mb-1 font-semibold">Desobrigações</p>
          {conteudo.desobrigacoes.map((d, i) => (
            <p key={i} className="border-b border-dotted border-gray-400 py-1">{d}</p>
          ))}
        </div>
      )}

      {conteudo.hino_sacramental_titulo && (
        <div className="mb-4">
          <p className="font-semibold">Hino sacramental: {formatHino(conteudo.hino_sacramental_numero, conteudo.hino_sacramental_titulo)}</p>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-1 font-semibold">Discursantes</p>
        {conteudo.discursantes.map((d, i) => (
          <p key={i} className="border-b border-dotted border-gray-400 py-1">
            {formatDiscursante(d)}
          </p>
        ))}
      </div>

      {conteudo.hino_intermediario_titulo && (
        <div className="mb-4">
          <p className="font-semibold">Hino interm.: {formatHino(conteudo.hino_intermediario_numero, conteudo.hino_intermediario_titulo)}</p>
        </div>
      )}

      <div className="mb-4 border-t border-gray-800 pt-3">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 align-top font-semibold">Hino final</td>
              <td className="border-b border-dotted border-gray-400 pb-2">
                {formatHino(conteudo.hino_final_numero, conteudo.hino_final_titulo)}
              </td>
            </tr>
            <tr>
              <td className="w-40 align-top font-semibold">Oração encerr.</td>
              <td className="border-b border-dotted border-gray-400 pb-2">{conteudo.oracao_encerramento}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <PrintActions ataId={ata.id} />
    </div>
  )
}
