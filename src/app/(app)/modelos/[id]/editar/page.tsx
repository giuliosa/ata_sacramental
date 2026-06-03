import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import { normalizeCampos } from '@/lib/utils'
import type { UserRole } from '@/types/domain'
import type { Json } from '@/types/supabase'
import { EditarModeloClient } from './EditarModeloClient'

export const metadata: Metadata = { title: 'Editar modelo' }

type ProfileCheck = {
  role: UserRole
  ala_id: string | null
}

type ModeloEditView = {
  id: string
  nome: string
  campos: Json
  ativo: boolean
}

export default async function EditarModeloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('role, ala_id')
    .eq('id', user!.id)
    .single()
    .overrideTypes<ProfileCheck, { merge: false }>()

  if (!can.createModelo(profile?.role ?? 'reader')) redirect('/modelos')

  const { data: modelo } = await supabase
    .from('modelos')
    .select('id, nome, campos, ativo')
    .eq('id', id)
    .single()
    .overrideTypes<ModeloEditView, { merge: false }>()

  if (!modelo) notFound()

  return (
    <EditarModeloClient
      modeloId={modelo.id}
      defaultNome={modelo.nome}
      defaultCampos={normalizeCampos(modelo.campos)}
      defaultAtivo={modelo.ativo}
    />
  )
}
