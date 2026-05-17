'use client'

import { useEffect } from 'react'

export function AutoPrint() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auto') === '1') {
      // Pequeno delay para garantir que o CSS de print carregou
      const timer = setTimeout(() => window.print(), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  return null
}
