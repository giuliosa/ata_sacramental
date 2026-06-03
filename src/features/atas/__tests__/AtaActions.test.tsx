import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AtaActions } from '@/features/atas/AtaActions'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/hooks/useAtas', () => ({
  useDeleteAta: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/components/ui/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}))

describe('AtaActions', () => {
  it('renders Edit, Delete, Print and Compartilhar buttons for adm role', () => {
    render(<AtaActions ataId="1" role="adm" />)
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Excluir')).toBeInTheDocument()
    expect(screen.getByText('Imprimir')).toBeInTheDocument()
    expect(screen.getByText('Compartilhar')).toBeInTheDocument()
    expect(screen.getByText('Voltar')).toBeInTheDocument()
  })

  it('renders only Print and Voltar for reader role', () => {
    render(<AtaActions ataId="1" role="reader" />)
    expect(screen.getByText('Imprimir')).toBeInTheDocument()
    expect(screen.getByText('Voltar')).toBeInTheDocument()
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
    expect(screen.queryByText('Excluir')).not.toBeInTheDocument()
    expect(screen.queryByText('Compartilhar')).not.toBeInTheDocument()
  })
})
