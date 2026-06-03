export type UserRole = 'adm' | 'editor' | 'reader'

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
  ala_id: string | null
  ala?: Ala
  created_at: string
}

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'list'

export type ModeloCampo = {
  id: string
  label: string
  type: FieldType
  required: boolean
  order: number
}

export type Modelo = {
  id: string
  nome: string
  campos: ModeloCampo[]
  criado_por: string
  ala_id: string
  ativo: boolean
  created_at: string
}

export type Ata = {
  id: string
  data_reuniao: string
  ala_id: string
  ala?: Ala
  modelo_id: string
  conteudo: Record<string, any>
  criado_por: string
  autor?: User
  created_at: string
  updated_at: string
}

export type ApiResponse<T> = {
  data: T
  error?: null
} | {
  data?: null
  error: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  per_page: number
}

export type UpdateUsuarioData = {
  role?: UserRole
  ala_id?: string | null
  name?: string
}

export type UnidadesData = {
  estacas: Estaca[]
  alas: Ala[]
}

export type PermissionLevel = 'viewer' | 'editor' | 'owner'

export type ResourcePermission = {
  id: string
  resource_type: string
  resource_id: string
  user_id: string | null
  user?: User | null
  permission_level: PermissionLevel
  invited_by: string | null
  invited_email: string | null
  token: string | null
  accepted_at: string | null
  created_at: string
}
