import type { AtaConteudo } from '@/types/domain'

/**
 * Utilitários para formatação de dados de impressão da ata.
 */

export function formatHino(numero?: string, titulo?: string) {
  if (!titulo) return '-'
  return numero ? `Nº ${numero} — ${titulo}` : titulo
}

export function formatApoio(apoio: { cargo: string; nome_membro: string; votacao_aprovada?: boolean }) {
  const status = apoio.votacao_aprovada === true ? ' — Aprovado' : ''
  return `${apoio.cargo}: ${apoio.nome_membro}${status}`
}

export function formatDiscursante(discursante: { nome: string; tema?: string }) {
  return discursante.tema ? `${discursante.nome} — ${discursante.tema}` : discursante.nome
}

export function formatAnuncio(anuncio: { data: string; descricao: string }) {
  return `[${anuncio.data}] ${anuncio.descricao}`
}
