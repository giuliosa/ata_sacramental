'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAceitarConvite } from '@/hooks/usePermissions'
import { Loader2, CheckCircle2, XCircle, LogIn } from 'lucide-react'

export function AcceptInviteClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { user, isLoading: authLoading } = useAuth()
  const { mutate: aceitar, isPending, isSuccess, data, error } = useAceitarConvite()
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!authLoading && user && token && !submitted) {
      setSubmitted(true)
      aceitar(token)
    }
  }, [authLoading, user, token, submitted, aceitar])

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm text-gray-500 dark:text-slate-400">Verificando sessão...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <XCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
        <h1 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Link inválido</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
          Este link de convite não é válido. Verifique se você copiou o link correto.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Ir para login
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <LogIn className="mx-auto mb-4 h-8 w-8 text-brand-600" />
        <h1 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Convite recebido!</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
          Faça login ou crie uma conta para aceitar o convite.
        </p>
        <Link
          href={`/login?redirectTo=/convidar?token=${token}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Fazer login
        </Link>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm text-gray-500 dark:text-slate-400">Aceitando convite...</p>
      </div>
    )
  }

  if (isSuccess && data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <CheckCircle2 className="mx-auto mb-4 h-8 w-8 text-green-500" />
        <h1 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Convite aceito!</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
          Agora você tem acesso à ata compartilhada.
        </p>
        <Link
          href={`/atas/${data.ataId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Ver ata
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <XCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
        <h1 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Erro ao aceitar convite</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
          {error.message || 'Ocorreu um erro ao processar o convite.'}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Ir para dashboard
        </Link>
      </div>
    )
  }

  return null
}
