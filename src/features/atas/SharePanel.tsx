'use client'

import { useState } from 'react'
import { ArrowLeft, Copy, Mail, Trash2, UserPlus, Users, Check } from 'lucide-react'
import Link from 'next/link'
import { usePermissoes, useConvidarUsuario, useRemoverPermissao, useAlterarNivelPermissao } from '@/hooks/usePermissions'
import type { PermissionLevel, UserRole } from '@/types/domain'
import { formatDateBR } from '@/lib/utils'

type SharePanelProps = {
  ataId: string
  ataDataReuniao: string
  ataModeloNome: string
  role: UserRole
}

const levelLabels: Record<PermissionLevel, string> = {
  viewer: 'Visualizador',
  editor: 'Editor',
  owner: 'Proprietário',
}

export function SharePanel({ ataId, ataDataReuniao, ataModeloNome, role }: SharePanelProps) {
  const [email, setEmail] = useState('')
  const [level, setLevel] = useState<PermissionLevel>('viewer')
  const { data: permissoes, isLoading, error } = usePermissoes(ataId)
  const convidar = useConvidarUsuario(ataId)
  const remover = useRemoverPermissao(ataId)
  const alterarNivel = useAlterarNivelPermissao(ataId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    convidar.mutate({ email: email.trim(), level })
    setEmail('')
    setLevel('viewer')
  }

  const canManage = role === 'adm'

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/atas/${ataId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para ata
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 border-b border-gray-100 pb-4 dark:border-slate-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Compartilhar Ata
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {ataModeloNome} — {formatDateBR(ataDataReuniao)}
          </p>
        </div>

        {canManage && (
          <form onSubmit={handleSubmit} className="mb-8">
            <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
              <UserPlus className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
              Adicionar pessoa
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
                />
              </div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as PermissionLevel)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                <option value="viewer">Visualizador</option>
                <option value="editor">Editor</option>
              </select>
              <button
                type="submit"
                disabled={convidar.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {convidar.isPending ? 'Convidando...' : 'Convidar'}
              </button>
            </div>
          </form>
        )}

        <div>
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
            <Users className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
            Pessoas com acesso
          </h2>

          {isLoading && (
            <p className="text-sm text-gray-400">Carregando...</p>
          )}

          {error && (
            <p className="text-sm text-red-500">Erro ao carregar permissões</p>
          )}

          {permissoes && permissoes.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-slate-600">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-slate-500" aria-hidden="true" />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Nenhuma permissão compartilhada
              </p>
            </div>
          )}

          {permissoes && permissoes.length > 0 && (
            <ul className="divide-y divide-gray-100 dark:divide-slate-700">
              {permissoes.map((perm) => (
                <li key={perm.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                      {perm.user?.name?.[0]?.toUpperCase() || perm.invited_email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {perm.user?.name || perm.invited_email || 'Usuário desconhecido'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {perm.accepted_at ? levelLabels[perm.permission_level] : 'Convite pendente'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!perm.accepted_at && perm.token && (
                      <CopyInviteLink token={perm.token} />
                    )}

                    {canManage && perm.accepted_at && (
                      <select
                        value={perm.permission_level}
                        onChange={(e) => {
                          const newLevel = e.target.value as PermissionLevel
                          if (newLevel !== perm.permission_level) {
                            alterarNivel.mutate({ permissionId: perm.id, level: newLevel })
                          }
                        }}
                        className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                      >
                        <option value="viewer">Visualizador</option>
                        <option value="editor">Editor</option>
                      </select>
                    )}

                    {canManage && (
                      <button
                        onClick={() => remover.mutate(perm.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                        aria-label="Remover acesso"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function CopyInviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const link = `${origin}/convidar?token=${token}`

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950"
      title="Copiar link de convite"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? 'Copiado' : 'Copiar link'}
    </button>
  )
}
