import type { Link, Folder } from '@/lib/types'

export function makeLink(overrides: Partial<Link> = {}): Link {
  const now = new Date().toISOString()
  return {
    id: `link-${Math.random().toString(36).slice(2)}`,
    url: 'https://example.com',
    title: 'Example',
    description: 'Example description',
    ogImage: null,
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    domain: 'example.com',
    categoryId: 'etc',
    folderId: null,
    isFavorite: false,
    note: '',
    visitCount: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function makeFolder(overrides: Partial<Folder> = {}): Folder {
  const now = new Date().toISOString()
  return {
    id: `folder-${Math.random().toString(36).slice(2)}`,
    name: 'Test Folder',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}
