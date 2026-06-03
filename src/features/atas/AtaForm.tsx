'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { generateId } from '@/lib/utils'
import {
  ataConteudoSchema,
  type AtaConteudoFormData,
} from '@/lib/schemas'
import {
  PresidenciaSection,
  MusicaSection,
  AnunciosSection,
  SacerdocioSection,
  SacramentoSection,
  ProgramaSection,
  EncerramentoSection,
} from './AtaFormSections'

type AtaFormProps = {
  defaultValues?: Partial<AtaConteudoFormData>
  onSubmit: (data: AtaConteudoFormData) => void
  isSubmitting: boolean
}

export function AtaForm({ defaultValues, onSubmit, isSubmitting }: AtaFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AtaConteudoFormData>({
    resolver: zodResolver(ataConteudoSchema),
    defaultValues: {
      presidida_por: '',
      dirigida_por: '',
      regente: '',
      pianista: '',
      hino_inicial_numero: '',
      hino_inicial_titulo: '',
      oracao_inicial: '',
      anuncios: [],
      apoios: [],
      desobrigacoes: [],
      hino_sacramental_numero: '',
      hino_sacramental_titulo: '',
      discursantes: [{ id: generateId(), ordem: 1 as const, nome: '', tema: '' }],
      hino_intermediario_numero: '',
      hino_intermediario_titulo: '',
      hino_final_numero: '',
      hino_final_titulo: '',
      oracao_encerramento: '',
      ...defaultValues,
    },
  })

  const [desobrigacoesText, setDesobrigacoesText] = useState(
    (defaultValues?.desobrigacoes ?? []).join('\n'),
  )

  function handleFormSubmit(formData: AtaConteudoFormData) {
    onSubmit({
      ...formData,
      desobrigacoes: desobrigacoesText.split('\n').filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <PresidenciaSection register={register} errors={errors} />
      <MusicaSection register={register} errors={errors} />
      <AnunciosSection register={register} errors={errors} control={control} />
      <SacerdocioSection 
        register={register} 
        errors={errors} 
        control={control} 
        desobrigacoesText={desobrigacoesText}
        setDesobrigacoesText={setDesobrigacoesText}
      />
      <SacramentoSection register={register} />
      <ProgramaSection register={register} errors={errors} control={control} />
      <EncerramentoSection register={register} errors={errors} />

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar ata
        </button>
      </div>
    </form>
  )
}
