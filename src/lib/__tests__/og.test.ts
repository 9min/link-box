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
  it('leaves https:// URLs alone', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
  })

  it('prepends https:// when missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
  })

  it('trims whitespace', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com')
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
