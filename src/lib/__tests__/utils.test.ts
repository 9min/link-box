import { describe, it, expect, vi } from 'vitest'
import { formatRelativeTime, debounce } from '../utils'

describe('formatRelativeTime', () => {
  it('shows 방금 전 for < 1 min', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('방금 전')
  })

  it('shows minutes for < 1 hour', () => {
    const d = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(d.toISOString())).toBe('5분 전')
  })

  it('shows hours for < 1 day', () => {
    const d = new Date(Date.now() - 3 * 3600 * 1000)
    expect(formatRelativeTime(d.toISOString())).toBe('3시간 전')
  })
})

describe('debounce', () => {
  it('calls fn after delay', async () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 50)
    debounced()
    expect(fn).not.toHaveBeenCalled()
    await new Promise(r => setTimeout(r, 100))
    expect(fn).toHaveBeenCalledOnce()
  })

  it('cancels earlier calls', async () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 50)
    debounced()
    debounced()
    debounced()
    await new Promise(r => setTimeout(r, 100))
    expect(fn).toHaveBeenCalledOnce()
  })
})
