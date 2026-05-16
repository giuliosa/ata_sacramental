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
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'adm' | 'editor' | 'reader'
          ala_id: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'adm' | 'editor' | 'reader'
          ala_id: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'adm' | 'editor' | 'reader'
          ala_id?: string
          created_at?: string
        }
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
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'adm' | 'editor' | 'reader'
    }
  }
}
