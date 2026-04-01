import { describe, it, expect, vi } from 'vitest'
import { formatRelativeTime, debounce, getDisplayLabel, getDisplayTitle } from '../utils'

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

describe('getDisplayTitle', () => {
  const make = (title: string, url: string, domain = 'github.com') =>
    ({ title, url, domain })

  it('returns OG title when it differs from domain', () => {
    expect(getDisplayTitle(make('React — A JS library', 'https://github.com/facebook/react')))
      .toBe('React — A JS library')
  })

  it('falls back to path when title equals domain', () => {
    expect(getDisplayTitle(make('github.com', 'https://github.com/facebook/react')))
      .toBe('facebook / react')
  })

  it('falls back to path when title is empty', () => {
    expect(getDisplayTitle(make('', 'https://github.com/facebook/react')))
      .toBe('facebook / react')
  })

  it('case-insensitive domain match', () => {
    expect(getDisplayTitle(make('GitHub.com', 'https://github.com/facebook/react')))
      .toBe('facebook / react')
  })

  it('parses GitHub issue URL', () => {
    expect(getDisplayTitle(make('github.com', 'https://github.com/facebook/react/issues/123')))
      .toBe('facebook / react #123')
  })

  it('parses GitHub pull request URL', () => {
    expect(getDisplayTitle(make('github.com', 'https://github.com/org/repo/pull/42')))
      .toBe('org / repo #42')
  })

  it('parses gitlab.com URL', () => {
    expect(getDisplayTitle(make('gitlab.com', 'https://gitlab.com/inkscape/inkscape', 'gitlab.com')))
      .toBe('inkscape / inkscape')
  })

  it('returns domain for root URL with no path', () => {
    expect(getDisplayTitle(make('github.com', 'https://github.com/')))
      .toBe('github.com')
  })

  it('returns domain for single-segment github URL', () => {
    expect(getDisplayTitle(make('github.com', 'https://github.com/facebook')))
      .toBe('facebook')
  })

  it('generic domain uses last 2 path segments', () => {
    expect(getDisplayTitle({ title: 'example.com', url: 'https://example.com/blog/my-post', domain: 'example.com' }))
      .toBe('blog / my post')
  })

  it('hyphens in generic path become spaces', () => {
    expect(getDisplayTitle({ title: 'example.com', url: 'https://example.com/docs/getting-started', domain: 'example.com' }))
      .toBe('docs / getting started')
  })

  it('returns OG title even if domain matches subdomain without eTLD+1', () => {
    // "Go" should NOT be treated as meaningless for go.dev — it doesn't match "go.dev"
    expect(getDisplayTitle({ title: 'Go', url: 'https://go.dev/', domain: 'go.dev' }))
      .toBe('Go')
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
