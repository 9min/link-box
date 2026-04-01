import { describe, it, expect } from 'vitest'
import { isValidUrl, normalizeUrl, extractDomain } from '../og'

describe('isValidUrl', () => {
  it('accepts https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('accepts http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('rejects non-http protocols', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects plain strings', () => {
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })
})

describe('normalizeUrl', () => {
  it('normalizes bare hostname to canonical form with trailing slash', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com/')
  })

  it('prepends https:// when missing and normalizes', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/')
  })

  it('trims whitespace and normalizes', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com/')
  })

  it('removes default https port 443', () => {
    expect(normalizeUrl('https://example.com:443/path')).toBe('https://example.com/path')
  })

  it('lowercases hostname', () => {
    expect(normalizeUrl('https://EXAMPLE.COM/path')).toBe('https://example.com/path')
  })

  it('preserves path and query string', () => {
    expect(normalizeUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1')
  })
})

describe('extractDomain', () => {
  it('extracts hostname from URL', () => {
    expect(extractDomain('https://www.example.com/path')).toBe('www.example.com')
  })

  it('returns input on invalid URL', () => {
    expect(extractDomain('not-a-url')).toBe('not-a-url')
  })
})
