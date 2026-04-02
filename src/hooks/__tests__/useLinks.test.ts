import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLinks } from '../useLinks'
import { makeLink } from '@/test/factories'

// All tests use isAuthenticated=false (localStorage mode)
const useLocalLinks = () => useLinks(false)

describe('useLinks (local mode)', () => {
  it('starts with empty links', () => {
    const { result } = renderHook(useLocalLinks)
    expect(result.current.links).toHaveLength(0)
  })

  it('addLink adds a link', async () => {
    const { result } = renderHook(useLocalLinks)
    const link = makeLink()
    await act(async () => {
      await result.current.addLink(link)
    })
    expect(result.current.links).toHaveLength(1)
  })

  it('addLink returns DUPLICATE_URL error for same URL', async () => {
    const { result } = renderHook(useLocalLinks)
    const link = makeLink({ url: 'https://example.com' })
    await act(async () => { await result.current.addLink(link) })
    let duplicateResult: Awaited<ReturnType<typeof result.current.addLink>>
    await act(async () => {
      duplicateResult = await result.current.addLink({ ...link, id: 'other' })
    })
    expect(duplicateResult!.ok).toBe(false)
    if (!duplicateResult!.ok) {
      expect(duplicateResult!.error).toBe('DUPLICATE_URL')
    }
  })

  it('removeLink removes by id', async () => {
    const { result } = renderHook(useLocalLinks)
    const link = makeLink()
    await act(async () => { await result.current.addLink(link) })
    await act(async () => { await result.current.removeLink(link.id) })
    expect(result.current.links).toHaveLength(0)
  })

  it('editLink patches a link', async () => {
    const { result } = renderHook(useLocalLinks)
    const link = makeLink({ title: 'Old' })
    await act(async () => { await result.current.addLink(link) })
    await act(async () => { await result.current.editLink(link.id, { title: 'New' }) })
    expect(result.current.links[0].title).toBe('New')
  })

  it('clickLink increments visitCount', async () => {
    const { result } = renderHook(useLocalLinks)
    const link = makeLink({ visitCount: 0 })
    await act(async () => { await result.current.addLink(link) })
    await act(async () => { await result.current.clickLink(link.id) })
    expect(result.current.links[0].visitCount).toBe(1)
  })

  it('setSortOption changes sort and persists', () => {
    const { result } = renderHook(useLocalLinks)
    act(() => { result.current.setSortOption('az') })
    expect(result.current.sortOption).toBe('az')
  })

  it('getDuplicateId finds existing link by URL', async () => {
    const { result } = renderHook(useLocalLinks)
    const link = makeLink({ url: 'https://example.com' })
    await act(async () => { await result.current.addLink(link) })
    const dupId = result.current.getDuplicateId('https://example.com')
    expect(dupId).toBe(link.id)
  })

  it('toggleFavorite flips isFavorite', async () => {
    const { result } = renderHook(useLocalLinks)
    const link = makeLink({ isFavorite: false })
    await act(async () => { await result.current.addLink(link) })
    await act(async () => { await result.current.toggleFavorite(link.id) })
    expect(result.current.links[0].isFavorite).toBe(true)
    await act(async () => { await result.current.toggleFavorite(link.id) })
    expect(result.current.links[0].isFavorite).toBe(false)
  })

  it('unassignFolder sets folderId to null for all links in that folder', async () => {
    const { result } = renderHook(useLocalLinks)
    const folderId = 'folder-1'
    const link1 = makeLink({ url: 'https://a.com', folderId })
    const link2 = makeLink({ url: 'https://b.com', folderId })
    const link3 = makeLink({ url: 'https://c.com', folderId: 'folder-2' })
    await act(async () => {
      await result.current.addLink(link1)
      await result.current.addLink(link2)
      await result.current.addLink(link3)
    })
    await act(async () => { await result.current.unassignFolder(folderId) })
    const updated = result.current.links
    expect(updated.find(l => l.id === link1.id)?.folderId).toBeNull()
    expect(updated.find(l => l.id === link2.id)?.folderId).toBeNull()
    expect(updated.find(l => l.id === link3.id)?.folderId).toBe('folder-2')
  })
})
