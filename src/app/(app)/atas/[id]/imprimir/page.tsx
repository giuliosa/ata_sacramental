import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/utils'
import { formatFieldValue } from '@/lib/print-utils'
import type { ModeloCampo } from '@/types/domain'
import type { Json } from '@/types/supabase'
import { PrintActions } from '@/features/atas/PrintActions'
import { AutoPrint } from '@/features/atas/AutoPrint'

export const metadata: Metadata = { title: 'Imprimir ata' }

type AtaPrint = {
  id: string
  data_reuniao: string
  conteudo: Json
  modelo_id: string
  ala: { nome: string; estaca: { nome: string } } | null
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
    .overrideTypes<{ ala_id: string | null }, { merge: false }>()

  const { data: ata } = await supabase
    .from('atas')
    .select('id, data_reuniao, conteudo, modelo_id, ala:alas!inner(nome, estaca:estacas(nome))')
    .eq('id', id)
    .eq('ala_id', profile!.ala_id!)
    .single()
    .overrideTypes<AtaPrint, { merge: false }>()

  if (!ata) notFound()

  const { data: modelo } = await supabase
    .from('modelos')
    .select('nome, campos')
    .eq('id', ata.modelo_id)
    .single()
    .overrideTypes<{ nome: string; campos: Json }, { merge: false }>()

  const campos = (modelo?.campos ?? []) as ModeloCampo[]
  const conteudo = ata.conteudo as Record<string, any>
  const sortedCampos = [...campos].sort((a, b) => a.order - b.order)

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-sm leading-relaxed text-black print:p-0">
      <AutoPrint />

      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">A Igreja de Jesus Cristo dos Santos dos Últimos Dias</h1>
        <p className="mt-1 font-semibold">{ata.ala?.nome}{ata.ala?.estaca ? ` — ${ata.ala.estaca.nome}` : ''}</p>
        <p className="mt-0.5 text-base font-semibold">{modelo?.nome || 'Reunião Sacramental'}</p>
        <p className="mt-0.5">{formatDateBR(ata.data_reuniao)}</p>
      </div>

      {sortedCampos.map(campo => {
        const value = conteudo[campo.id]
        if (value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0)) return null

        return (
          <div key={campo.id} className="mb-3 flex gap-4 border-b border-dotted border-gray-400 pb-2">
            <span className="w-40 shrink-0 font-semibold">{campo.label}</span>
            <span>
              {campo.type === 'list' && Array.isArray(value) ? (
                value.filter(Boolean).join('; ')
              ) : (
                formatFieldValue(value)
              )}
            </span>
          </div>
        )
      })}

      <PrintActions ataId={ata.id} />
    </div>
  )
}
