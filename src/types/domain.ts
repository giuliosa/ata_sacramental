// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'adm' | 'editor' | 'reader'

// ─── Entities ─────────────────────────────────────────────────────────────────

export type Estaca = {
  id: string
  nome: string
  created_at: string
}

export type Ala = {
  id: string
  nome: string
  estaca_id: string
  estaca?: Estaca
  created_at: string
}

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  ala_id: string
  ala?: Ala
  created_at: string
}

// ─── Ata ──────────────────────────────────────────────────────────────────────

/**
 * Estrutura do conteúdo da ata baseada no modelo oficial da reunião sacramental.
 * Campos opcionais refletem que nem toda reunião tem todos os elementos preenchidos.
 */
export type AtaConteudo = {
  // Identificação
  presidida_por: string
  dirigida_por: string

  // Música e Orações
  regente?: string
  pianista?: string
  hino_inicial_numero?: string
  hino_inicial_titulo: string
  oracao_inicial: string

  // Anúncios
  anuncios: Anuncio[]

  // Administração do Sacerdócio
  apoios: Apoio[]
  desobrigacoes: string[]

  // Sacramento
  hino_sacramental_numero?: string
  hino_sacramental_titulo?: string

  // Programa / Discursantes
  discursantes: Discursante[]
  hino_intermediario_numero?: string
  hino_intermediario_titulo?: string

  // Encerramento
  hino_final_numero?: string
  hino_final_titulo: string
  oracao_encerramento: string
}

export type Anuncio = {
  id: string
  data: string         // formato dd/mm/yyyy
  descricao: string
}

export type Apoio = {
  id: string
  cargo: string
  nome_membro: string
  votacao_aprovada?: boolean
}

export type Discursante = {
  id: string
  ordem: 1 | 2 | 3
  nome: string
  tema?: string
}

export type Ata = {
  id: string
  data_reuniao: string   // ISO date: yyyy-MM-dd
  ala_id: string
  ala?: Ala
  modelo_id: string
  conteudo: AtaConteudo
  criado_por: string
  autor?: User
  created_at: string
  updated_at: string
}

// ─── Modelo ───────────────────────────────────────────────────────────────────

export type Modelo = {
  id: string
  nome: string
  conteudo: ModeloConteudo
  criado_por: string
  ativo: boolean
  created_at: string
}

export type ModeloConteudo = {
  // Valores padrão para pré-preencher os campos ao criar uma nova ata
  defaults?: Partial<AtaConteudo>
  // Campos obrigatórios para validação
  campos_obrigatorios?: Array<keyof AtaConteudo>
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T
  error: null
} | {
  data: null
  error: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  per_page: number
}
