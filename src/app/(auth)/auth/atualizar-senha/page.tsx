'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Senhas não conferem')
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }
    toast.success('Senha atualizada com sucesso!')
    router.push('/dashboard')
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700">
        <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-slate-100">
          Redefinir senha
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
          Escolha uma nova senha para sua conta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="sr-only">Nova senha</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova senha (mín. 6 caracteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="sr-only">Confirmar nova senha</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              'Atualizar senha'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
