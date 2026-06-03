import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ModeloCampo, ErrorResponse } from '@/types/domain'

/**
 * Combina classes Tailwind de forma segura, resolvendo conflitos.
 * Uso: cn('px-2 py-1', condition && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utilitário centralizado para tratar erros de API/Actions.
 */
export function handleApiError(error: unknown, defaultMessage = 'Ocorreu um erro inesperado'): ErrorResponse {
  console.error('[API Error]:', error)

  if (error instanceof Error) {
    return { data: null, error: error.message, code: (error as any).code }
  }

  if (typeof error === 'string') {
    return { data: null, error }
  }

  return { data: null, error: defaultMessage }
}

/**
 * Formata uma data ISO (yyyy-MM-dd) para o formato brasileiro (dd/mm/yyyy).
 */
export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Converte data brasileira (dd/mm/yyyy) para ISO (yyyy-MM-dd).
 */
export function parseDateBR(brDate: string): string {
  const [day, month, year] = brDate.split('/')
  return `${year}-${month}-${day}`
}

/**
 * Gera um ID único simples para itens de lista (anúncios, apoios, discursantes).
 * Para persistência real, use UUIDs gerados pelo banco.
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function normalizeCampos(raw: unknown): ModeloCampo[] {
  if (Array.isArray(raw)) return raw
  return []
}
