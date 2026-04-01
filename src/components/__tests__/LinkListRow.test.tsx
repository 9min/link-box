import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LinkListRow } from '../LinkListRow'
import { makeLink } from '@/test/factories'

describe('LinkListRow', () => {
  const defaultProps = {
    onOpen: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  }

  it('renders valid OG title as-is', () => {
    const link = makeLink({ title: 'facebook / react', url: 'https://github.com/facebook/react', domain: 'github.com' })
    render(<LinkListRow link={link} {...defaultProps} />)
    expect(screen.getByText('facebook / react')).toBeInTheDocument()
  })

  it('falls back to parsed path when title equals domain', () => {
    const link = makeLink({ title: 'github.com', url: 'https://github.com/facebook/react', domain: 'github.com' })
    render(<LinkListRow link={link} {...defaultProps} />)
    expect(screen.getByText('facebook / react')).toBeInTheDocument()
  })

  it('shows note when present', () => {
    const link = makeLink({ title: 'github.com', url: 'https://github.com/org/repo', domain: 'github.com', note: 'React 참고용' })
    render(<LinkListRow link={link} {...defaultProps} />)
    expect(screen.getByText('React 참고용')).toBeInTheDocument()
  })

  it('hides note row when note is empty', () => {
    const link = makeLink({ note: '' })
    const { container } = render(<LinkListRow link={link} {...defaultProps} />)
    // note span is conditionally rendered only when link.note is truthy
    const spans = container.querySelectorAll('.flex-1 span')
    expect(spans).toHaveLength(1)
  })

  it('aria-label uses display title', () => {
    const link = makeLink({ title: 'github.com', url: 'https://github.com/org/repo', domain: 'github.com' })
    render(<LinkListRow link={link} {...defaultProps} />)
    expect(screen.getByRole('row')).toHaveAttribute('aria-label', 'org / repo - github.com')
  })

  it('calls onOpen when row is clicked', () => {
    const onOpen = vi.fn()
    const link = makeLink()
    render(<LinkListRow link={link} onOpen={onOpen} onDelete={vi.fn()} onEdit={vi.fn()} />)
    fireEvent.click(screen.getByRole('row'))
    expect(onOpen).toHaveBeenCalledWith(link)
  })
})
