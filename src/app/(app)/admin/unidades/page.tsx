'use client'

import { useState } from 'react'
import { Loader2, Plus, Building2, MapPin } from 'lucide-react'
import { useUnidades, useCreateEstaca, useCreateAla } from '@/hooks/useAdmin'

export default function AdminUnidadesPage() {
  const { data: unidades, isLoading } = useUnidades()
  const { mutate: criarEstaca, isPending: criandoEstaca } = useCreateEstaca()
  const { mutate: criarAla, isPending: criandoAla } = useCreateAla()

  const [showEstacaForm, setShowEstacaForm] = useState(false)
  const [showAlaForm, setShowAlaForm] = useState(false)
  const [novaEstaca, setNovaEstaca] = useState('')
  const [novaAla, setNovaAla] = useState('')
  const [alaEstacaId, setAlaEstacaId] = useState('')

  function handleCriarEstaca(e: React.FormEvent) {
    e.preventDefault()
    if (!novaEstaca.trim()) return
    criarEstaca(novaEstaca.trim(), {
      onSuccess: () => {
        setNovaEstaca('')
        setShowEstacaForm(false)
      },
    })
  }

  function handleCriarAla(e: React.FormEvent) {
    e.preventDefault()
    if (!novaAla.trim() || !alaEstacaId) return
    criarAla({ nome: novaAla.trim(), estaca_id: alaEstacaId }, {
      onSuccess: () => {
        setNovaAla('')
        setAlaEstacaId('')
        setShowAlaForm(false)
      },
    })
  }

  const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Unidades</h1>
        <p className="mt-1 text-sm text-gray-500">Gerencie estacas e alas do sistema.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* ─── Estacas ─── */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-gray-900">Estacas</h2>
              </div>
              <button
                onClick={() => setShowEstacaForm(!showEstacaForm)}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" /> Nova estaca
              </button>
            </div>

            {showEstacaForm && (
              <form onSubmit={handleCriarEstaca} className="flex items-end gap-3 border-b border-gray-100 px-6 py-4">
                <div className="flex-1">
                  <label htmlFor="nome-estaca" className="block text-xs font-medium text-gray-500">Nome</label>
                  <input
                    id="nome-estaca"
                    value={novaEstaca}
                    onChange={e => setNovaEstaca(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="Ex: Estaca Recife Leste"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={criandoEstaca}
                  className="flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  {criandoEstaca ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </button>
              </form>
            )}

            {!unidades?.estacas?.length ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Nenhuma estaca cadastrada.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {unidades.estacas.map(estaca => (
                  <li key={estaca.id} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm font-medium text-gray-900">{estaca.nome}</span>
                    <span className="text-xs text-gray-400">
                      {unidades.alas.filter(a => a.estaca_id === estaca.id).length} alas
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ─── Alas ─── */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-gray-900">Alas</h2>
              </div>
              <button
                onClick={() => setShowAlaForm(!showAlaForm)}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" /> Nova ala
              </button>
            </div>

            {showAlaForm && (
              <form onSubmit={handleCriarAla} className="flex items-end gap-3 border-b border-gray-100 px-6 py-4">
                <div className="flex-1">
                  <label htmlFor="nome-ala" className="block text-xs font-medium text-gray-500">Nome</label>
                  <input
                    id="nome-ala"
                    value={novaAla}
                    onChange={e => setNovaAla(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="Ex: Ala Jardim Atlântico"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="estaca-ala" className="block text-xs font-medium text-gray-500">Estaca</label>
                  <select
                    id="estaca-ala"
                    value={alaEstacaId}
                    onChange={e => setAlaEstacaId(e.target.value)}
                    className={`${inputClass} mt-1`}
                    required
                  >
                    <option value="">Selecione...</option>
                    {unidades?.estacas?.map(e => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={criandoAla}
                  className="flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  {criandoAla ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </button>
              </form>
            )}

            {!unidades?.alas?.length ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Nenhuma ala cadastrada.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {unidades.alas.map(ala => {
                  const estaca = unidades.estacas.find(e => e.id === ala.estaca_id)
                  return (
                    <li key={ala.id} className="flex items-center justify-between px-6 py-3">
                      <span className="text-sm font-medium text-gray-900">{ala.nome}</span>
                      <span className="text-xs text-gray-400">{estaca?.nome ?? '-'}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
