import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders zero-links state', () => {
    render(<EmptyState onAddLink={() => {}} />)
    expect(screen.getByText('링크를 추가해 보세요')).toBeInTheDocument()
    expect(screen.getByText('첫 링크 추가하기')).toBeInTheDocument()
  })

  it('CTA button calls onAddLink', () => {
    const onAddLink = vi.fn()
    render(<EmptyState onAddLink={onAddLink} />)
    fireEvent.click(screen.getByText('첫 링크 추가하기'))
    expect(onAddLink).toHaveBeenCalledOnce()
  })

  it('renders search-empty state', () => {
    render(<EmptyState isSearchEmpty onAddLink={() => {}} />)
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
    expect(screen.queryByText('첫 링크 추가하기')).not.toBeInTheDocument()
  })
})
