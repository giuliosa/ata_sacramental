'use client'

import { useUpdateAta } from '@/hooks/useAtas'
import { DynamicAtaForm } from '@/features/atas/AtaForm'
import type { ModeloCampo } from '@/types/domain'

type EditarAtaClientProps = {
  ataId: string
  defaultConteudo: Record<string, any>
  campos: ModeloCampo[]
}

export function EditarAtaClient({ ataId, defaultConteudo, campos }: EditarAtaClientProps) {
  const { mutate, isPending } = useUpdateAta(ataId)

  function handleSubmit(conteudo: Record<string, any>) {
    mutate({ data_reuniao: '', conteudo })
  }

  return (
    <DynamicAtaForm
      campos={campos}
      defaultValues={defaultConteudo}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  )
}
