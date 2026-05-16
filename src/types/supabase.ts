/**
 * Este arquivo será gerado automaticamente pelo Supabase CLI:
 *   npm run db:generate
 *
 * O shape abaixo é um placeholder que reflete a estrutura esperada do banco.
 * Substitua pelo arquivo gerado após rodar as migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      estacas: {
        Row: {
          id: string
          nome: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          created_at?: string
        }
        Relationships: []
      }
      alas: {
        Row: {
          id: string
          nome: string
          estaca_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          estaca_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          estaca_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'alas_estaca_id_fkey'
            columns: ['estaca_id']
            isOneToOne: false
            referencedRelation: 'estacas'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'adm' | 'editor' | 'reader'
          ala_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'adm' | 'editor' | 'reader'
          ala_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'adm' | 'editor' | 'reader'
          ala_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_ala_id_fkey'
            columns: ['ala_id']
            isOneToOne: false
            referencedRelation: 'alas'
            referencedColumns: ['id']
          },
        ]
      }
      modelos: {
        Row: {
          id: string
          nome: string
          conteudo: Json
          criado_por: string
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          conteudo: Json
          criado_por: string
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          conteudo?: Json
          criado_por?: string
          ativo?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'modelos_criado_por_fkey'
            columns: ['criado_por']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      atas: {
        Row: {
          id: string
          data_reuniao: string
          ala_id: string
          modelo_id: string
          conteudo: Json
          criado_por: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          data_reuniao: string
          ala_id: string
          modelo_id: string
          conteudo: Json
          criado_por: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          data_reuniao?: string
          ala_id?: string
          modelo_id?: string
          conteudo?: Json
          criado_por?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'atas_ala_id_fkey'
            columns: ['ala_id']
            isOneToOne: false
            referencedRelation: 'alas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'atas_criado_por_fkey'
            columns: ['criado_por']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'atas_modelo_id_fkey'
            columns: ['modelo_id']
            isOneToOne: false
            referencedRelation: 'modelos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'adm' | 'editor' | 'reader'
    }
    CompositeTypes: Record<string, never>
  }
}
