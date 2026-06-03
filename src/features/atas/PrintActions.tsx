'use client'

import { Printer, FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'

type PrintActionsProps = {
  ataId: string
}

export function PrintActions({ ataId }: PrintActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  function handlePrint() {
    window.print()
  }

  function handleDownloadPdf() {
    setIsLoading(true)
    const printWindow = window.open(`/atas/${ataId}/imprimir?auto=1`, '_blank')
    if (printWindow) {
      printWindow.focus()
    }
    // Fallback: if popup was blocked, reset loading after a short delay
    if (!printWindow) {
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  return (
    <div className="no-print mt-8 flex items-center justify-center gap-3">
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        aria-label="Imprimir ata"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Imprimir
      </button>
      <button
        onClick={handleDownloadPdf}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Baixar PDF da ata"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <FileDown className="h-4 w-4" aria-hidden="true" />
        )}
        {isLoading ? 'Preparando…' : 'Baixar PDF'}
      </button>
    </div>
  )
}
