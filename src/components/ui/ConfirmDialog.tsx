'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  const confirmStyles =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
      : 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
            variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 id="confirm-title" className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-slate-300">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 ${confirmStyles}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
