'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register' | 'reset'

export function EmailPasswordForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function resetForm() {
    setPassword('')
    setConfirmPassword('')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg =
        error.message === 'Invalid login credentials'
          ? 'Email ou senha inválidos'
          : error.message
      toast.error(msg)
      setIsLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  async function handleRegister(e: React.FormEvent) {
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
    const redirectTo = `${window.location.origin}/api/auth/callback`
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }
    toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.')
    setMode('login')
    resetForm()
    setIsLoading(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast.error('Informe seu email')
      return
    }
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()
    const redirectTo = `${window.location.origin}/api/auth/callback`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }
    toast.success('Link de redefinição enviado! Verifique seu email.')
    setMode('login')
    resetForm()
    setIsLoading(false)
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400'

  return (
    <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset} className="space-y-4">
      {mode !== 'login' && (
        <button
          type="button"
          onClick={() => { setMode('login'); resetForm() }}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>
      )}

      <div>
        <label htmlFor="email" className="sr-only">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputClass}
            autoComplete={mode === 'register' ? 'email' : 'username'}
          />
        </div>
      </div>

      {mode !== 'reset' && (
        <div>
          <label htmlFor="password" className="sr-only">Senha</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Crie uma senha (mín. 6 caracteres)' : 'Sua senha'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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
      )}

      {mode === 'register' && (
        <div>
          <label htmlFor="confirmPassword" className="sr-only">Confirmar senha</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : mode === 'login' ? (
          'Entrar'
        ) : mode === 'register' ? (
          'Criar conta'
        ) : (
          'Enviar link de redefinição'
        )}
      </button>

      <div className="flex flex-col items-center gap-2 text-xs">
        {mode === 'login' && (
          <>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Esqueci minha senha
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); resetForm() }}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Não tem conta? <span className="font-medium text-brand-600 hover:text-brand-700">Criar conta</span>
            </button>
          </>
        )}
        {mode === 'register' && (
          <button
            type="button"
            onClick={() => { setMode('login'); resetForm() }}
            className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Já tem conta? <span className="font-medium text-brand-600 hover:text-brand-700">Entrar</span>
          </button>
        )}
      </div>
    </form>
  )
}
