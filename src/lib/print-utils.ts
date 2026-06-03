export function formatHino(numero?: string, titulo?: string) {
  if (!titulo) return '-'
  return numero ? `Nº ${numero} — ${titulo}` : titulo
}

export function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  return String(value)
}
