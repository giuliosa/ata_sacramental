'use client'

import { Printer, FileDown } from 'lucide-react'

type PrintActionsProps = {
  ataId: string
}

export function PrintActions({ ataId }: PrintActionsProps) {
  function handlePrint() {
    window.print()
  }

  function handleDownloadPdf() {
    const printWindow = window.open(`/atas/${ataId}/imprimir?auto=1`, '_blank')
    if (printWindow) {
      printWindow.focus()
    }
  }

  return (
    <div className="no-print mt-8 flex items-center justify-center gap-3">
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Imprimir
      </button>
      <button
        onClick={handleDownloadPdf}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
      >
        <FileDown className="h-4 w-4" aria-hidden="true" />
        Baixar PDF
      </button>
    </div>
  )
}
