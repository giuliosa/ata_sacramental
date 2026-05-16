'use client'

import { useUpdateAta } from '@/hooks/useAtas'
import { AtaForm } from '@/features/atas/AtaForm'
import type { AtaConteudoFormData } from '@/lib/schemas'
import type { AtaConteudo } from '@/types/domain'

type EditarAtaClientProps = {
  ataId: string
  defaultConteudo: AtaConteudo
}

function mapConteudoToFormData(c: AtaConteudo): AtaConteudoFormData {
  return {
    presidida_por: c.presidida_por,
    dirigida_por: c.dirigida_por,
    regente: c.regente ?? '',
    pianista: c.pianista ?? '',
    hino_inicial_numero: c.hino_inicial_numero ?? '',
    hino_inicial_titulo: c.hino_inicial_titulo,
    oracao_inicial: c.oracao_inicial,
    anuncios: c.anuncios,
    apoios: c.apoios,
    desobrigacoes: c.desobrigacoes,
    hino_sacramental_numero: c.hino_sacramental_numero ?? '',
    hino_sacramental_titulo: c.hino_sacramental_titulo ?? '',
    discursantes: c.discursantes,
    hino_intermediario_numero: c.hino_intermediario_numero ?? '',
    hino_intermediario_titulo: c.hino_intermediario_titulo ?? '',
    hino_final_numero: c.hino_final_numero ?? '',
    hino_final_titulo: c.hino_final_titulo,
    oracao_encerramento: c.oracao_encerramento,
  }
}

export function EditarAtaClient({ ataId, defaultConteudo }: EditarAtaClientProps) {
  const { mutate, isPending } = useUpdateAta(ataId)

  function handleSubmit(conteudo: AtaConteudoFormData) {
    mutate({
      data_reuniao: '',
      conteudo,
    })
  }

  return (
    <AtaForm
      defaultValues={mapConteudoToFormData(defaultConteudo)}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  )
}
