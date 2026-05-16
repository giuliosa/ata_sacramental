'use client'

import { Loader2, BookOpen, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useModelos, useUpdateModelo, useDeleteModelo } from '@/hooks/useModelos'

export default function ModelosListPage() {
  const { data: modelos, isLoading } = useModelos()
  const { mutate: updateModelo } = useUpdateModelo()
  const { mutate: deleteModelo } = useDeleteModelo()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Modelos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie os modelos de ata disponíveis.</p>
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
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-500">Nenhum modelo cadastrado.</p>
          <Link
            href="/modelos/novo"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Criar primeiro modelo
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {modelos.map(modelo => (
                <tr key={modelo.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{modelo.nome}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateModelo({ id: modelo.id, data: { ativo: !modelo.ativo } })}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                        modelo.ativo
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
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
                      onClick={() => {
                        if (confirm(`Excluir modelo "${modelo.nome}"?`)) {
                          deleteModelo(modelo.id)
                        }
                      }}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
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
    </div>
  )
}
