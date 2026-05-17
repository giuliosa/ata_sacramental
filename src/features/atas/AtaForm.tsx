'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { generateId } from '@/lib/utils'
import {
  ataConteudoSchema,
  type AtaConteudoFormData,
} from '@/lib/schemas'

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

  const { fields: anuncioFields, append: appendAnuncio, remove: removeAnuncio } = useFieldArray({
    control,
    name: 'anuncios',
  })

  const { fields: apoioFields, append: appendApoio, remove: removeApoio } = useFieldArray({
    control,
    name: 'apoios',
  })

  const { fields: discursanteFields, append: appendDiscursante, remove: removeDiscursante } = useFieldArray({
    control,
    name: 'discursantes',
  })

  function handleFormSubmit(formData: AtaConteudoFormData) {
    onSubmit({
      ...formData,
      desobrigacoes: desobrigacoesText.split('\n').filter(Boolean),
    })
  }

  const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300'
  const errorClass = 'mt-1 text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Presidência */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Presidência</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="presidida_por" className={labelClass}>Presidida por</label>
            <input id="presidida_por" {...register('presidida_por')} className={`${inputClass} mt-1`} />
            {errors.presidida_por && <p className={errorClass}>{errors.presidida_por.message}</p>}
          </div>
          <div>
            <label htmlFor="dirigida_por" className={labelClass}>Dirigida por</label>
            <input id="dirigida_por" {...register('dirigida_por')} className={`${inputClass} mt-1`} />
            {errors.dirigida_por && <p className={errorClass}>{errors.dirigida_por.message}</p>}
          </div>
        </div>
      </section>

      {/* Música e Orações */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Música e Orações</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="regente" className={labelClass}>Regente</label>
            <input id="regente" {...register('regente')} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label htmlFor="pianista" className={labelClass}>Pianista</label>
            <input id="pianista" {...register('pianista')} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label htmlFor="hino_inicial_numero" className={labelClass}>Nº do hino inicial</label>
            <input id="hino_inicial_numero" {...register('hino_inicial_numero')} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label htmlFor="hino_inicial_titulo" className={labelClass}>Título do hino inicial</label>
            <input id="hino_inicial_titulo" {...register('hino_inicial_titulo')} className={`${inputClass} mt-1`} />
            {errors.hino_inicial_titulo && <p className={errorClass}>{errors.hino_inicial_titulo.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="oracao_inicial" className={labelClass}>Oração inicial</label>
            <input id="oracao_inicial" {...register('oracao_inicial')} className={`${inputClass} mt-1`} />
            {errors.oracao_inicial && <p className={errorClass}>{errors.oracao_inicial.message}</p>}
          </div>
        </div>
      </section>

      {/* Anúncios */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Anúncios</h2>
          <button
            type="button"
            onClick={() => appendAnuncio({ id: generateId(), data: '', descricao: '' })}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        </div>
        {anuncioFields.length === 0 && <p className="text-sm text-gray-400 dark:text-slate-500">Nenhum anúncio.</p>}
        <div className="space-y-3">
          {anuncioFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="w-28 shrink-0">
                <input
                  {...register(`anuncios.${index}.data`)}
                  placeholder="dd/mm/aaaa"
                  className={inputClass}
                />
                {errors.anuncios?.[index]?.data && <p className={errorClass}>{errors.anuncios[index]?.data?.message}</p>}
              </div>
              <div className="flex-1">
                <input
                  {...register(`anuncios.${index}.descricao`)}
                  placeholder="Descrição do anúncio"
                  className={inputClass}
                />
                {errors.anuncios?.[index]?.descricao && <p className={errorClass}>{errors.anuncios[index]?.descricao?.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeAnuncio(index)}
                className="mt-2 shrink-0 text-gray-400 hover:text-red-600 dark:text-slate-500"
                aria-label="Remover anúncio"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sacerdócio */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Sacerdócio</h2>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Apoios</span>
            <button
              type="button"
              onClick={() => appendApoio({ id: generateId(), cargo: '', nome_membro: '' })}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          </div>
          {apoioFields.length === 0 && <p className="mb-2 text-sm text-gray-400 dark:text-slate-500">Nenhum apoio.</p>}
          <div className="space-y-3">
            {apoioFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <input
                    {...register(`apoios.${index}.cargo`)}
                    placeholder="Cargo"
                    className={inputClass}
                  />
                  {errors.apoios?.[index]?.cargo && <p className={errorClass}>{errors.apoios[index]?.cargo?.message}</p>}
                </div>
                <div className="flex-[2]">
                  <input
                    {...register(`apoios.${index}.nome_membro`)}
                    placeholder="Nome do membro"
                    className={inputClass}
                  />
                  {errors.apoios?.[index]?.nome_membro && <p className={errorClass}>{errors.apoios[index]?.nome_membro?.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeApoio(index)}
                className="mt-2 shrink-0 text-gray-400 hover:text-red-600 dark:text-slate-500"
                aria-label="Remover apoio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Desobrigações (um por linha)</label>
          <textarea
            value={desobrigacoesText}
            onChange={e => setDesobrigacoesText(e.target.value)}
            placeholder="Digite os nomes dos membros desobrigados, um por linha"
            className={`${inputClass} mt-1 min-h-[60px]`}
          />
        </div>
      </section>

      {/* Sacramento */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Sacramento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hino_sacramental_numero" className={labelClass}>Nº do hino</label>
            <input id="hino_sacramental_numero" {...register('hino_sacramental_numero')} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label htmlFor="hino_sacramental_titulo" className={labelClass}>Título do hino</label>
            <input id="hino_sacramental_titulo" {...register('hino_sacramental_titulo')} className={`${inputClass} mt-1`} />
          </div>
        </div>
      </section>

      {/* Programa */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Discursantes</h2>
          {discursanteFields.length < 3 && (
            <button
              type="button"
              onClick={() => {
                const nextOrdem = (discursanteFields.length + 1) as 1 | 2 | 3
                appendDiscursante({ id: generateId(), ordem: nextOrdem, nome: '', tema: '' })
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          )}
        </div>
        {errors.discursantes && !Array.isArray(errors.discursantes) && (
          <p className="mb-2 text-sm text-red-600">{errors.discursantes.message}</p>
        )}
        <div className="space-y-3">
          {discursanteFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <span className="mt-2 text-sm font-medium text-gray-400 dark:text-slate-500">{index + 1}.</span>
              <div className="flex-1">
                <input
                  {...register(`discursantes.${index}.nome`)}
                  placeholder="Nome do discursante"
                  className={inputClass}
                />
                {errors.discursantes?.[index]?.nome && <p className={errorClass}>{errors.discursantes[index]?.nome?.message}</p>}
              </div>
              <div className="flex-[2]">
                <input
                  {...register(`discursantes.${index}.tema`)}
                  placeholder="Tema (opcional)"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDiscursante(index)}
                className="mt-2 shrink-0 text-gray-400 hover:text-red-600 dark:text-slate-500"
                aria-label="Remover discursante"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <hr className="my-4 border-gray-100 dark:border-slate-700" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hino_intermediario_numero" className={labelClass}>Nº do hino interm.</label>
            <input id="hino_intermediario_numero" {...register('hino_intermediario_numero')} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label htmlFor="hino_intermediario_titulo" className={labelClass}>Título do hino interm.</label>
            <input id="hino_intermediario_titulo" {...register('hino_intermediario_titulo')} className={`${inputClass} mt-1`} />
          </div>
        </div>
      </section>

      {/* Encerramento */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Encerramento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hino_final_numero" className={labelClass}>Nº do hino final</label>
            <input id="hino_final_numero" {...register('hino_final_numero')} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label htmlFor="hino_final_titulo" className={labelClass}>Título do hino final</label>
            <input id="hino_final_titulo" {...register('hino_final_titulo')} className={`${inputClass} mt-1`} />
            {errors.hino_final_titulo && <p className={errorClass}>{errors.hino_final_titulo.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="oracao_encerramento" className={labelClass}>Oração de encerramento</label>
            <input id="oracao_encerramento" {...register('oracao_encerramento')} className={`${inputClass} mt-1`} />
            {errors.oracao_encerramento && <p className={errorClass}>{errors.oracao_encerramento.message}</p>}
          </div>
        </div>
      </section>

      {/* Submit */}
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
