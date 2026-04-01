import { describe, it, expect } from 'vitest'
import { suggestCategory, getCategoryById, CATEGORIES } from '../categories'

describe('suggestCategory', () => {
  it('matches exact domain', () => {
    expect(suggestCategory('github.com')).toBe('dev')
    expect(suggestCategory('youtube.com')).toBe('video')
    expect(suggestCategory('figma.com')).toBe('design')
    expect(suggestCategory('amazon.com')).toBe('shopping')
  })

  it('matches subdomain via eTLD+1', () => {
    expect(suggestCategory('blog.github.com')).toBe('dev')
    expect(suggestCategory('docs.github.com')).toBe('dev')
  })

  it('returns etc for unknown domain', () => {
    expect(suggestCategory('unknownsite12345.com')).toBe('etc')
    expect(suggestCategory('')).toBe('etc')
  })
})

describe('getCategoryById', () => {
  it('returns matching category', () => {
    const cat = getCategoryById('dev')
    expect(cat.id).toBe('dev')
    expect(cat.label).toBe('개발')
  })

  it('falls back to etc for unknown id', () => {
    const cat = getCategoryById('nonexistent')
    expect(cat.id).toBe('etc')
  })
})

describe('CATEGORIES', () => {
  it('has exactly 9 categories', () => {
    expect(CATEGORIES).toHaveLength(9)
  })

  it('all categories have bg and text colors', () => {
    for (const cat of CATEGORIES) {
      expect(cat.bg).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(cat.text).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})
