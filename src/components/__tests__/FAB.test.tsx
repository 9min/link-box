import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FAB } from '../FAB'

describe('FAB', () => {
  it('renders with aria-label', () => {
    render(<FAB onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: '링크 추가' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<FAB onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: '링크 추가' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
