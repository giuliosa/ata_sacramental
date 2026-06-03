import { describe, it, expect } from 'vitest'
import { criarAtaSchema, editarAtaSchema } from '@/lib/schemas'

describe('criarAtaSchema', () => {
  it('validates a valid object with data_reuniao, modelo_id and conteudo', () => {
    const result = criarAtaSchema.safeParse({
      data_reuniao: '2026-06-03',
      modelo_id: '00000000-0000-0000-0000-000000000001',
      conteudo: { titulo: 'Reunião' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing data_reuniao', () => {
    const result = criarAtaSchema.safeParse({
      modelo_id: '00000000-0000-0000-0000-000000000001',
      conteudo: {},
    })
    expect(result.success).toBe(false)
  })
})

describe('editarAtaSchema', () => {
  it('allows partial updates with only conteudo (modelo_id and data_reuniao optional)', () => {
    const result = editarAtaSchema.safeParse({
      conteudo: { titulo: 'Atualizado' },
    })
    expect(result.success).toBe(true)
  })
})
