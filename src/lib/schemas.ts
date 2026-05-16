import { z } from 'zod'

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const anuncioSchema = z.object({
  id: z.string(),
  data: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: dd/mm/yyyy'),
  descricao: z.string().min(1, 'Descrição obrigatória'),
})

export const apoioSchema = z.object({
  id: z.string(),
  cargo: z.string().min(1, 'Cargo obrigatório'),
  nome_membro: z.string().min(1, 'Nome do membro obrigatório'),
  votacao_aprovada: z.boolean().optional(),
})

export const discursanteSchema = z.object({
  id: z.string(),
  ordem: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  nome: z.string().min(1, 'Nome do discursante obrigatório'),
  tema: z.string().optional(),
})

// ─── Ata schema ───────────────────────────────────────────────────────────────

export const ataConteudoSchema = z.object({
  // Identificação
  presidida_por: z.string().min(1, 'Campo obrigatório'),
  dirigida_por:  z.string().min(1, 'Campo obrigatório'),

  // Música e Orações
  regente:  z.string().optional(),
  pianista: z.string().optional(),
  hino_inicial_numero: z.string().optional(),
  hino_inicial_titulo: z.string().min(1, 'Campo obrigatório'),
  oracao_inicial: z.string().min(1, 'Campo obrigatório'),

  // Anúncios
  anuncios: z.array(anuncioSchema).default([]),

  // Sacerdócio
  apoios:       z.array(apoioSchema).default([]),
  desobrigacoes: z.array(z.string()).default([]),

  // Sacramento
  hino_sacramental_numero: z.string().optional(),
  hino_sacramental_titulo: z.string().optional(),

  // Programa
  discursantes:             z.array(discursanteSchema).min(1, 'Pelo menos um discursante').max(3),
  hino_intermediario_numero: z.string().optional(),
  hino_intermediario_titulo: z.string().optional(),

  // Encerramento
  hino_final_numero: z.string().optional(),
  hino_final_titulo: z.string().min(1, 'Campo obrigatório'),
  oracao_encerramento: z.string().min(1, 'Campo obrigatório'),
})

export const criarAtaSchema = z.object({
  data_reuniao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  modelo_id: z.string().uuid('Modelo inválido'),
  conteudo: ataConteudoSchema,
})

export const editarAtaSchema = criarAtaSchema.partial({ modelo_id: true })

// ─── Inferred types ───────────────────────────────────────────────────────────

export type AtaConteudoFormData = z.infer<typeof ataConteudoSchema>
export type CriarAtaFormData    = z.infer<typeof criarAtaSchema>
export type EditarAtaFormData   = z.infer<typeof editarAtaSchema>
