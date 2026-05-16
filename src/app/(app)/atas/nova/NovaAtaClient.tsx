'use client'

import { useCreateAta } from '@/hooks/useAtas'
import { AtaForm } from '@/features/atas/AtaForm'
import type { AtaConteudoFormData } from '@/lib/schemas'

type NovaAtaClientProps = {
  modeloId: string
}

export function NovaAtaClient({ modeloId }: NovaAtaClientProps) {
  const { mutate, isPending } = useCreateAta()

  function handleSubmit(conteudo: AtaConteudoFormData) {
    const today = new Date()
    const dataISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    mutate({
      data_reuniao: dataISO,
      modelo_id: modeloId,
      conteudo,
    })
  }

  return <AtaForm onSubmit={handleSubmit} isSubmitting={isPending} />
}
