import { describe, it, expect, vi } from 'vitest'
import { formatRelativeTime, debounce, getDisplayLabel } from '../utils'

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

describe('getDisplayLabel', () => {
  it('shows org/repo for github.com', () => {
    expect(getDisplayLabel('https://github.com/facebook/react', 'github.com'))
      .toBe('github.com/facebook/react')
  })

  it('shows package name for npmjs.com', () => {
    expect(getDisplayLabel('https://www.npmjs.com/package/react', 'npmjs.com'))
      .toBe('npmjs.com/package/react')
  })

  it('shows 3 segments for hub.docker.com', () => {
    expect(getDisplayLabel('https://hub.docker.com/r/library/node', 'hub.docker.com'))
      .toBe('hub.docker.com/r/library/node')
  })

  it('falls back to domain for unknown domains', () => {
    expect(getDisplayLabel('https://example.com/some/path', 'example.com'))
      .toBe('example.com')
  })

  it('falls back to domain when path is empty', () => {
    expect(getDisplayLabel('https://github.com/', 'github.com'))
      .toBe('github.com')
  })

  it('falls back to domain on URL parse failure', () => {
    expect(getDisplayLabel('not-a-url', 'github.com'))
      .toBe('github.com')
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
