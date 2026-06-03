import { describe, it, expect } from 'vitest'
import { can } from '@/lib/permissions'

describe('permissions', () => {
  describe('createAta', () => {
    it('allows adm to create ata', () => {
      expect(can.createAta('adm')).toBe(true)
    })
    it('allows editor to create ata', () => {
      expect(can.createAta('editor')).toBe(true)
    })
    it('denies reader to create ata', () => {
      expect(can.createAta('reader')).toBe(false)
    })
  })

  describe('editAta', () => {
    it('allows adm to edit ata', () => {
      expect(can.editAta('adm')).toBe(true)
    })
    it('denies editor to edit ata', () => {
      expect(can.editAta('editor')).toBe(false)
    })
  })

  describe('shareAta', () => {
    it('allows adm to share ata', () => {
      expect(can.shareAta('adm')).toBe(true)
    })
    it('denies editor to share ata', () => {
      expect(can.shareAta('editor')).toBe(false)
    })
  })

  describe('viewAta', () => {
    it('allows any role to view ata', () => {
      expect(can.viewAta('reader')).toBe(true)
    })
  })
})
