'use client'

import { useState } from 'react'
import { Users, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUsuarios, useUpdateUsuario } from '@/hooks/useAdmin'
import type { UserRole } from '@/types/domain'

const ROLE_LABELS: Record<UserRole, string> = {
  adm: 'Administrador',
  editor: 'Editor',
  reader: 'Leitor',
}

const ROLE_COLORS: Record<UserRole, string> = {
  adm: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  reader: 'bg-gray-100 text-gray-600',
}

export default function AdminUsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios()
  const { mutate: updateUsuario, isPending: isUpdating } = useUpdateUsuario()
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleRoleChange(userId: string, newRole: UserRole) {
    updateUsuario({ id: userId, data: { role: newRole } })
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Usuários</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Gerencie os usuários e suas permissões no sistema.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-slate-500" />
        </div>
      ) : !usuarios?.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <Users className="mx-auto h-10 w-10 text-gray-300 dark:text-slate-600" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Ala</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Cargo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {usuarios.map(user => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{user.ala?.nome ?? '-'}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                        disabled={isUpdating}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                          ROLE_COLORS[user.role],
                          'hover:opacity-80',
                        )}
                      >
                        {ROLE_LABELS[user.role]}
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {editingId === user.id && (
                        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(user.id, role)}
                              className={cn(
                                'flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-700',
                                role === user.role ? 'font-medium text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-slate-300',
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
