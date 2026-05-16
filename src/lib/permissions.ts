import type { UserRole } from '@/types/domain'

/**
 * Regras de permissão centralizadas.
 * Qualquer mudança nas regras de negócio deve passar por aqui.
 *
 * Tabela de referência (plan.md §4):
 * ──────────────────────────────────────────────────
 *  Ação                  | adm | editor | reader
 * ──────────────────────────────────────────────────
 *  Criar ata             |  ✅ |   ✅   |   ❌
 *  Editar ata            |  ✅ |   ❌   |   ❌
 *  Ver atas da ala       |  ✅ |   ✅   |   ✅
 *  Imprimir ata          |  ✅ |   ✅   |   ✅
 *  Criar modelo          |  ✅ |   ❌   |   ❌
 *  Gerenciar usuários    |  ✅ |   ❌   |   ❌
 *  Criar/vincular ala    |  ✅ |   ❌   |   ❌
 * ──────────────────────────────────────────────────
 */
export const can = {
  createAta: (role: UserRole) => role === 'adm' || role === 'editor',
  editAta:   (role: UserRole) => role === 'adm',
  viewAta:   (_role: UserRole) => true,
  printAta:  (_role: UserRole) => true,

  createModelo:    (role: UserRole) => role === 'adm',
  manageUsers:     (role: UserRole) => role === 'adm',
  manageUnidades:  (role: UserRole) => role === 'adm',
} as const

export type Permission = keyof typeof can
