'use client'

import { useState } from 'react'
import { Loader2, BookOpen, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useModelos, useUpdateModelo, useDeleteModelo } from '@/hooks/useModelos'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function ModelosListPage() {
  const { data: modelos, isLoading } = useModelos()
  const { mutate: updateModelo } = useUpdateModelo()
  const { mutate: deleteModelo } = useDeleteModelo()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nome: string } | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Modelos</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Gerencie os modelos de ata disponíveis.</p>
        </div>
        <Link
          href="/modelos/novo"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo modelo
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : !modelos?.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-600 dark:bg-slate-800">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300 dark:text-slate-500" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">Nenhum modelo cadastrado.</p>
          <Link
            href="/modelos/novo"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Criar primeiro modelo
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {modelos.map(modelo => (
                <tr key={modelo.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{modelo.nome}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateModelo({ id: modelo.id, data: { ativo: !modelo.ativo } })}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                        modelo.ativo
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500',
                      )}
                    >
                      {modelo.ativo
                        ? <><ToggleRight className="h-3.5 w-3.5" /> Ativo</>
                        : <><ToggleLeft className="h-3.5 w-3.5" /> Inativo</>
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteTarget({ id: modelo.id, nome: modelo.nome })}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Excluir modelo "${deleteTarget?.nome}"?`}
        message="Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteModelo(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
