import { z } from 'zod'

export const modeloSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  ativo: z.boolean().optional(),
})

export const campoDefSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label é obrigatório'),
  type: z.enum(['text', 'textarea', 'number', 'date', 'boolean', 'list']),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
})

export const criarAtaSchema = z.object({
  data_reuniao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (yyyy-MM-dd)'),
  modelo_id: z.string().uuid('Modelo inválido'),
  conteudo: z.record(z.any()),
})

export const editarAtaSchema = criarAtaSchema.partial({ modelo_id: true, data_reuniao: true, conteudo: true })

export type CriarAtaFormData = z.infer<typeof criarAtaSchema>
export type EditarAtaFormData = z.infer<typeof editarAtaSchema>
