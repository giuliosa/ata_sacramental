'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useUpdateModelo } from '@/hooks/useModelos'
import { generateId } from '@/lib/utils'
import type { ModeloCampo, FieldType } from '@/types/domain'

const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'boolean', label: 'Sim/Não' },
  { value: 'list', label: 'Lista' },
]

type EditarModeloClientProps = {
  modeloId: string
  defaultNome: string
  defaultCampos: ModeloCampo[]
  defaultAtivo: boolean
}

function createEmptyField(order: number): ModeloCampo {
  return { id: generateId(), label: '', type: 'text', required: false, order }
}

export function EditarModeloClient({ modeloId, defaultNome, defaultCampos, defaultAtivo }: EditarModeloClientProps) {
  const router = useRouter()
  const { mutate: updateModelo, isPending } = useUpdateModelo()
  const [nome, setNome] = useState(defaultNome)
  const [campos, setCampos] = useState<ModeloCampo[]>(defaultCampos.length > 0 ? defaultCampos : [createEmptyField(0)])
  const [ativo, setAtivo] = useState(defaultAtivo)

  function updateField(index: number, partial: Partial<ModeloCampo>) {
    setCampos(prev => prev.map((f, i) => i === index ? { ...f, ...partial } : f))
  }

  function addField() {
    setCampos(prev => [...prev, createEmptyField(prev.length)])
  }

  function removeField(index: number) {
    if (campos.length <= 1) return
    setCampos(prev => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.map((f, i) => ({ ...f, order: i }))
    })
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= campos.length) return
    setCampos(prev => {
      const updated = [...prev]
      ;[updated[index], updated[target]] = [updated[target], updated[index]]
      return updated.map((f, i) => ({ ...f, order: i }))
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return

    const validCampos = campos.map((f, i) => ({
      ...f,
      label: f.label.trim() || `Campo ${i + 1}`,
      order: i,
    }))

    updateModelo(
      { id: modeloId, data: { nome: nome.trim(), campos: validCampos, ativo } },
      { onSuccess: () => router.push('/modelos') }
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/modelos"
        className="no-print mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-slate-100">Editar modelo</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <label htmlFor="nome" className={labelClass}>Nome do modelo</label>
          <input
            id="nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className={`${inputClass} mt-1`}
            placeholder="Ex: Reunião Sacramental Padrão"
            required
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Campos ({campos.length})
            </h2>
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Campo
            </button>
          </div>

          <div className="space-y-3">
            {campos.map((campo, index) => (
              <div
                key={campo.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-600 dark:bg-slate-700/50"
              >
                <div className="flex flex-col gap-0.5 pt-1">
                  <button
                    type="button"
                    onClick={() => moveField(index, -1)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-slate-300"
                    aria-label={`Mover campo "${campo.label || 'sem nome'}" para cima`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(index, 1)}
                    disabled={index === campos.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-slate-300"
                    aria-label={`Mover campo "${campo.label || 'sem nome'}" para baixo`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-slate-400">
                      Nome do campo
                    </label>
                    <input
                      value={campo.label}
                      onChange={e => updateField(index, { label: e.target.value })}
                      className={inputClass}
                      placeholder="Ex: Presidida por"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-slate-400">
                      Tipo
                    </label>
                    <select
                      value={campo.type}
                      onChange={e => updateField(index, { type: e.target.value as FieldType })}
                      className={`${inputClass}`}
                    >
                      {FIELD_TYPES.map(ft => (
                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={campo.required}
                      onChange={e => updateField(index, { required: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                    />
                    Obrigatório
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeField(index)}
                  disabled={campos.length <= 1}
                  className="mt-1 text-gray-400 hover:text-red-600 disabled:opacity-30 dark:hover:text-red-400"
                  aria-label={`Remover campo "${campo.label || 'sem nome'}"`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={ativo}
              onChange={e => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Modelo ativo
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/modelos"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || !nome.trim()}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  )
}
