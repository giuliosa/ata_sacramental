'use client'

import { useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { ModeloCampo, FieldType } from '@/types/domain'

const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-slate-300'

type DynamicAtaFormProps = {
  campos: ModeloCampo[]
  defaultValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => void
  isSubmitting: boolean
}

function getDefaultValue(campo: ModeloCampo): any {
  if (campo.type === 'list') return []
  if (campo.type === 'boolean') return false
  return ''
}

function getDefaultFieldValues(campos: ModeloCampo[], defaults?: Record<string, any>): Record<string, any> {
  const values: Record<string, any> = {}
  for (const campo of campos) {
    values[campo.id] = defaults?.[campo.id] ?? getDefaultValue(campo)
  }
  return values
}

function validateFields(values: Record<string, any>, campos: ModeloCampo[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const campo of campos) {
    const value = values[campo.id]
    if (campo.required) {
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        errors[campo.id] = `${campo.label} é obrigatório`
      }
    }
  }
  return errors
}

function TextField({ campo, value, onChange, error }: any) {
  return (
    <div>
      <label className={labelClass}>
        {campo.label}
        {campo.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value ?? ''}
        onChange={e => onChange(campo.id, e.target.value)}
        className={`${inputClass} mt-1`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function NumberField({ campo, value, onChange, error }: any) {
  return (
    <div>
      <label className={labelClass}>
        {campo.label}
        {campo.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="number"
        value={value ?? ''}
        onChange={e => onChange(campo.id, e.target.value)}
        className={`${inputClass} mt-1`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function TextareaField({ campo, value, onChange, error }: any) {
  return (
    <div>
      <label className={labelClass}>
        {campo.label}
        {campo.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        value={value ?? ''}
        onChange={e => onChange(campo.id, e.target.value)}
        className={`${inputClass} mt-1 min-h-[80px] resize-y`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function DateField({ campo, value, onChange, error }: any) {
  return (
    <div>
      <label className={labelClass}>
        {campo.label}
        {campo.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value ?? ''}
        onChange={e => onChange(campo.id, e.target.value)}
        className={`${inputClass} mt-1`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function BooleanField({ campo, value, onChange }: any) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600">
      <input
        type="checkbox"
        checked={!!value}
        onChange={e => onChange(campo.id, e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
      />
      <span className={`${labelClass} mb-0`}>
        {campo.label}
        {campo.required && <span className="ml-1 text-red-500">*</span>}
      </span>
    </label>
  )
}

function ListField({ campo, value, onChange, error }: any) {
  const items: string[] = Array.isArray(value) ? value : []

  function addItem() {
    onChange(campo.id, [...items, ''])
  }

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    onChange(campo.id, updated)
  }

  function updateItem(index: number, val: string) {
    const updated = [...items]
    updated[index] = val
    onChange(campo.id, updated)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className={labelClass}>
          {campo.label}
          {campo.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-slate-500">Nenhum item.</p>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={e => updateItem(index, e.target.value)}
              className={`${inputClass} flex-1`}
              placeholder={`Item ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="shrink-0 text-gray-400 hover:text-red-600 dark:text-slate-500"
              aria-label={`Remover item ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const FIELD_RENDERERS: Record<FieldType, React.FC<any>> = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  date: DateField,
  boolean: BooleanField,
  list: ListField,
}

export function DynamicAtaForm({ campos, defaultValues, onSubmit, isSubmitting }: DynamicAtaFormProps) {
  const [values, setValues] = useState<Record<string, any>>(() => getDefaultFieldValues(campos, defaultValues))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(fieldId: string, value: any) {
    setValues(prev => ({ ...prev, [fieldId]: value }))
    if (submitted) {
      const newErrors = validateFields({ ...values, [fieldId]: value }, campos)
      setErrors(newErrors)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const newErrors = validateFields(values, campos)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    onSubmit(values)
  }

  const sortedCampos = [...campos].sort((a, b) => a.order - b.order)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sortedCampos.map(campo => {
        const Renderer = FIELD_RENDERERS[campo.type]
        if (!Renderer) return null
        return (
          <Renderer
            key={campo.id}
            campo={campo}
            value={values[campo.id]}
            onChange={handleChange}
            error={errors[campo.id]}
          />
        )
      })}

      <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-slate-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  )
}

export { DynamicAtaForm as AtaForm }
