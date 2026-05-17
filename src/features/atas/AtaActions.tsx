'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Printer, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { can } from '@/lib/permissions'
import { useDeleteAta } from '@/hooks/useAtas'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { UserRole } from '@/types/domain'

type AtaActionsProps = {
  ataId: string
  role: UserRole
}

export function AtaActions({ ataId, role }: AtaActionsProps) {
  const router = useRouter()
  const { mutate: deleteAta } = useDeleteAta()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href="/atas"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/atas/${ataId}/imprimir`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir
          </Link>
          {can.editAta(role) && (
            <>
              <Link
                href={`/atas/${ataId}/editar`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                <Edit2 className="h-4 w-4" aria-hidden="true" />
                Editar
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Excluir ata"
        message="Tem certeza que deseja excluir esta ata? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={() => {
          setShowConfirm(false)
          deleteAta(ataId, {
            onSuccess: () => router.push('/atas'),
          })
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
