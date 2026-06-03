import { describe, it, expect } from 'vitest'
import { formatDateBR, parseDateBR, generateId, cn } from '@/lib/utils'

describe('formatDateBR', () => {
  it('converts ISO date to Brazilian format', () => {
    expect(formatDateBR('2026-06-03')).toBe('03/06/2026')
  })
})

describe('parseDateBR', () => {
  it('converts Brazilian date to ISO format', () => {
    expect(parseDateBR('03/06/2026')).toBe('2026-06-03')
  })
})

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
})

describe('cn', () => {
  it('merges classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
