'use client'

import { useState } from 'react'
import { Loader2, Building2, MapPin, Pencil, Trash2, X, Check } from 'lucide-react'
import { useUnidades, useUpdateEstaca, useDeleteEstaca, useUpdateAla, useDeleteAla } from '@/hooks/useAdmin'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function AdminUnidadesPage() {
  const { data: unidades, isLoading } = useUnidades()
  const { mutate: atualizarEstaca, isPending: atualizandoEstaca } = useUpdateEstaca()
  const { mutate: excluirEstaca, isPending: excluindoEstaca } = useDeleteEstaca()
  const { mutate: atualizarAla, isPending: atualizandoAla } = useUpdateAla()
  const { mutate: excluirAla, isPending: excluindoAla } = useDeleteAla()

  const [editandoEstacaId, setEditandoEstacaId] = useState<string | null>(null)
  const [editandoEstacaNome, setEditandoEstacaNome] = useState('')

  const [editandoAlaId, setEditandoAlaId] = useState<string | null>(null)
  const [editandoAlaNome, setEditandoAlaNome] = useState('')
  const [editandoAlaEstacaId, setEditandoAlaEstacaId] = useState('')

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; tipo: 'estaca' | 'ala'; nome: string } | null>(null)

  function iniciarEdicaoEstaca(estaca: { id: string; nome: string }) {
    setEditandoEstacaId(estaca.id)
    setEditandoEstacaNome(estaca.nome)
  }

  function salvarEdicaoEstaca() {
    if (!editandoEstacaId || !editandoEstacaNome.trim()) return
    atualizarEstaca({ id: editandoEstacaId, nome: editandoEstacaNome.trim() }, {
      onSuccess: () => setEditandoEstacaId(null),
    })
  }

  function iniciarEdicaoAla(ala: { id: string; nome: string; estaca_id: string }) {
    setEditandoAlaId(ala.id)
    setEditandoAlaNome(ala.nome)
    setEditandoAlaEstacaId(ala.estaca_id)
  }

  function salvarEdicaoAla() {
    if (!editandoAlaId || !editandoAlaNome.trim() || !editandoAlaEstacaId) return
    atualizarAla({ id: editandoAlaId, nome: editandoAlaNome.trim(), estaca_id: editandoAlaEstacaId }, {
      onSuccess: () => setEditandoAlaId(null),
    })
  }

  function handleConfirmDelete() {
    if (!confirmDelete) return
    if (confirmDelete.tipo === 'estaca') {
      excluirEstaca(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })
    } else {
      excluirAla(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })
    }
  }

  const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Unidades</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Gerencie estacas e alas do sistema.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-slate-500" />
        </div>
      ) : (
        <>
          {/* ─── Estacas ─── */}
          <section className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 dark:border-slate-700">
              <Building2 className="h-5 w-5 text-gray-400 dark:text-slate-500" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Estacas</h2>
            </div>

            {!unidades?.estacas?.length ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400 dark:text-slate-500">Nenhuma estaca cadastrada.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                {unidades.estacas.map(estaca => (
                  <li key={estaca.id} className="px-6 py-3">
                    {editandoEstacaId === estaca.id ? (
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Nome</label>
                          <input
                            value={editandoEstacaNome}
                            onChange={e => setEditandoEstacaNome(e.target.value)}
                            className={`${inputClass} mt-1`}
                            autoFocus
                          />
                        </div>
                        <div className="flex items-center gap-1 pt-5">
                          <button
                            onClick={salvarEdicaoEstaca}
                            disabled={atualizandoEstaca || !editandoEstacaNome.trim()}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-green-600 hover:bg-green-50 disabled:opacity-40 dark:hover:bg-green-950"
                            aria-label="Salvar"
                          >
                            {atualizandoEstaca ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setEditandoEstacaId(null)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                            aria-label="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{estaca.nome}</span>
                          <span className="text-xs text-gray-400 dark:text-slate-500">
                            {unidades.alas.filter(a => a.estaca_id === estaca.id).length} alas
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => iniciarEdicaoEstaca(estaca)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                            aria-label={`Editar estaca ${estaca.nome}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ id: estaca.id, tipo: 'estaca', nome: estaca.nome })}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                            aria-label={`Excluir estaca ${estaca.nome}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ─── Alas ─── */}
          <section className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 dark:border-slate-700">
              <MapPin className="h-5 w-5 text-gray-400 dark:text-slate-500" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Alas</h2>
            </div>

            {!unidades?.alas?.length ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400 dark:text-slate-500">Nenhuma ala cadastrada.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                {unidades.alas.map(ala => {
                  const estaca = unidades.estacas.find(e => e.id === ala.estaca_id)
                  return (
                    <li key={ala.id} className="px-6 py-3">
                      {editandoAlaId === ala.id ? (
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Nome</label>
                            <input
                              value={editandoAlaNome}
                              onChange={e => setEditandoAlaNome(e.target.value)}
                              className={`${inputClass} mt-1`}
                              autoFocus
                            />
                          </div>
                          <div className="w-48">
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Estaca</label>
                            <select
                              value={editandoAlaEstacaId}
                              onChange={e => setEditandoAlaEstacaId(e.target.value)}
                              className={`${inputClass} mt-1`}
                            >
                              {unidades?.estacas?.map(e => (
                                <option key={e.id} value={e.id}>{e.nome}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-1 pt-5">
                            <button
                              onClick={salvarEdicaoAla}
                              disabled={atualizandoAla || !editandoAlaNome.trim() || !editandoAlaEstacaId}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-green-600 hover:bg-green-50 disabled:opacity-40 dark:hover:bg-green-950"
                              aria-label="Salvar"
                            >
                              {atualizandoAla ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setEditandoAlaId(null)}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                              aria-label="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{ala.nome}</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">{estaca?.nome ?? '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => iniciarEdicaoAla(ala)}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                              aria-label={`Editar ala ${ala.nome}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ id: ala.id, tipo: 'ala', nome: ala.nome })}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                              aria-label={`Excluir ala ${ala.nome}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Excluir ${confirmDelete?.tipo === 'estaca' ? 'estaca' : 'ala'}`}
        message={`Tem certeza que deseja excluir ${confirmDelete?.tipo === 'estaca' ? 'a estaca' : 'a ala'} "${confirmDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel={excluindoEstaca || excluindoAla ? 'Excluindo...' : 'Excluir'}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
