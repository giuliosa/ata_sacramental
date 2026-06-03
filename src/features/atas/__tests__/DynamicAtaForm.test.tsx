import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DynamicAtaForm } from '@/features/atas/AtaForm'
import type { ModeloCampo } from '@/types/domain'

const campos: ModeloCampo[] = [
  { id: 'titulo', label: 'Título', type: 'text', required: true, order: 1 },
  { id: 'membros', label: 'Membros presentes', type: 'number', required: false, order: 2 },
  { id: 'aprovado', label: 'Aprovado', type: 'boolean', required: true, order: 3 },
]

describe('DynamicAtaForm', () => {
  it('renders fields by their labels', () => {
    render(<DynamicAtaForm campos={campos} onSubmit={vi.fn()} isSubmitting={false} />)
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Membros presentes')).toBeInTheDocument()
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
  })

  it('submits the form with values', () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <DynamicAtaForm campos={campos} onSubmit={onSubmit} isSubmitting={false} />,
    )

    const tituloInput = container.querySelector('input[type="text"]')!
    const membrosInput = container.querySelector('input[type="number"]')!
    const aprovadoCheckbox = screen.getByRole('checkbox')

    fireEvent.change(tituloInput, { target: { value: 'Sacramental' } })
    fireEvent.change(membrosInput, { target: { value: '50' } })
    fireEvent.click(aprovadoCheckbox)

    fireEvent.click(screen.getByText('Salvar'))

    expect(onSubmit).toHaveBeenCalledWith({
      titulo: 'Sacramental',
      membros: '50',
      aprovado: true,
    })
  })
})
