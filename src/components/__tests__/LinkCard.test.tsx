import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LinkCard } from '../LinkCard'
import { makeLink } from '@/test/factories'

describe('LinkCard', () => {
  const defaultProps = {
    onOpen: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  }

  it('renders title and domain', () => {
    const link = makeLink({ title: 'My Link', domain: 'example.com' })
    render(<LinkCard link={link} {...defaultProps} />)
    expect(screen.getByText('My Link')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('shows domain initial placeholder when no ogImage', () => {
    const link = makeLink({ ogImage: null, domain: 'example.com' })
    render(<LinkCard link={link} {...defaultProps} />)
    expect(screen.getByText('E')).toBeInTheDocument()
  })

  it('calls onOpen when card is clicked', () => {
    const onOpen = vi.fn()
    const link = makeLink()
    render(<LinkCard link={link} onOpen={onOpen} onDelete={vi.fn()} onEdit={vi.fn()} />)
    fireEvent.click(screen.getByRole('article'))
    expect(onOpen).toHaveBeenCalledWith(link)
  })

  it('calls onOpen on Enter key', () => {
    const onOpen = vi.fn()
    const link = makeLink()
    render(<LinkCard link={link} onOpen={onOpen} onDelete={vi.fn()} onEdit={vi.fn()} />)
    fireEvent.keyDown(screen.getByRole('article'), { key: 'Enter' })
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('has correct aria-label', () => {
    const link = makeLink({ title: 'My Link', domain: 'example.com' })
    render(<LinkCard link={link} {...defaultProps} />)
    expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'My Link - example.com')
  })

  it('calls onToggleFavorite when star button is clicked', () => {
    const onToggleFavorite = vi.fn()
    const link = makeLink({ isFavorite: false })
    render(<LinkCard link={link} {...defaultProps} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getByRole('button', { name: '즐겨찾기 추가' }))
    expect(onToggleFavorite).toHaveBeenCalledWith(link.id)
  })

  it('shows filled star for favorite links', () => {
    const link = makeLink({ isFavorite: true })
    render(<LinkCard link={link} {...defaultProps} onToggleFavorite={vi.fn()} />)
    expect(screen.getByRole('button', { name: '즐겨찾기 해제' })).toBeInTheDocument()
  })

  it('does not render star button when onToggleFavorite not provided', () => {
    const link = makeLink({ isFavorite: false })
    render(<LinkCard link={link} {...defaultProps} />)
    expect(screen.queryByRole('button', { name: '즐겨찾기 추가' })).not.toBeInTheDocument()
  })
})
