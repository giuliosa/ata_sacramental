'use client'

import { useState } from 'react'
import { useCreateAta } from '@/hooks/useAtas'
import { AtaForm } from '@/features/atas/AtaForm'
import type { AtaConteudoFormData } from '@/lib/schemas'

type ModeloOption = {
  id: string
  nome: string
}

type NovaAtaClientProps = {
  modelos: ModeloOption[]
}

export function NovaAtaClient({ modelos }: NovaAtaClientProps) {
  const [modeloId, setModeloId] = useState(modelos[0]?.id ?? '')
  const [showForm, setShowForm] = useState(false)
  const { mutate, isPending } = useCreateAta()

  function handleSubmit(conteudo: AtaConteudoFormData) {
    if (!modeloId) return

    const today = new Date()
    const dataISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    mutate({
      data_reuniao: dataISO,
      modelo_id: modeloId,
      conteudo,
    })
  }

  if (!showForm) {
    return (
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">
            Modelo da ata
          </label>
          <select
            id="modelo"
            value={modeloId}
            onChange={e => setModeloId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          >
            {modelos.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            disabled={!modeloId}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  return <AtaForm onSubmit={handleSubmit} isSubmitting={isPending} />
}
