'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCreateModelo } from '@/hooks/useModelos'

export default function NovoModeloPage() {
  const router = useRouter()
  const { mutate: criarModelo, isPending } = useCreateModelo()
  const [nome, setNome] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    criarModelo({ nome: nome.trim() }, {
      onSuccess: () => router.push('/modelos'),
    })
  }

  const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'

  return (
    <div className="max-w-xl">
      <Link
        href="/modelos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-slate-100">Novo modelo</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome do modelo</label>
          <input
            id="nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className={`${inputClass} mt-1`}
            placeholder="Ex: Modelo Padrão — Reunião Sacramental"
            required
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            O modelo será criado com o conteúdo padrão e ficará ativo automaticamente.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/modelos"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || !nome.trim()}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar modelo
          </button>
        </div>
      </form>
    </div>
  )
}
