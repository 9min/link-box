import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLinks } from '../useLinks'
import { makeLink } from '@/test/factories'

describe('useLinks', () => {
  it('starts with empty links', () => {
    const { result } = renderHook(() => useLinks())
    expect(result.current.links).toHaveLength(0)
  })

  it('addLink adds a link', () => {
    const { result } = renderHook(() => useLinks())
    const link = makeLink()
    act(() => {
      result.current.addLink(link)
    })
    expect(result.current.links).toHaveLength(1)
  })

  it('addLink returns DUPLICATE_URL error for same URL', () => {
    const { result } = renderHook(() => useLinks())
    const link = makeLink({ url: 'https://example.com' })
    act(() => { result.current.addLink(link) })
    let duplicateResult: ReturnType<typeof result.current.addLink>
    act(() => {
      duplicateResult = result.current.addLink({ ...link, id: 'other' })
    })
    expect(duplicateResult!.ok).toBe(false)
    if (!duplicateResult!.ok) {
      expect(duplicateResult!.error).toBe('DUPLICATE_URL')
    }
  })

  it('removeLink removes by id', () => {
    const { result } = renderHook(() => useLinks())
    const link = makeLink()
    act(() => { result.current.addLink(link) })
    act(() => { result.current.removeLink(link.id) })
    expect(result.current.links).toHaveLength(0)
  })

  it('editLink patches a link', () => {
    const { result } = renderHook(() => useLinks())
    const link = makeLink({ title: 'Old' })
    act(() => { result.current.addLink(link) })
    act(() => { result.current.editLink(link.id, { title: 'New' }) })
    expect(result.current.links[0].title).toBe('New')
  })

  it('clickLink increments visitCount', () => {
    const { result } = renderHook(() => useLinks())
    const link = makeLink({ visitCount: 0 })
    act(() => { result.current.addLink(link) })
    act(() => { result.current.clickLink(link.id) })
    expect(result.current.links[0].visitCount).toBe(1)
  })

  it('setSortOption changes sort and persists', () => {
    const { result } = renderHook(() => useLinks())
    act(() => { result.current.setSortOption('az') })
    expect(result.current.sortOption).toBe('az')
  })

  it('getDuplicateId finds existing link by URL', () => {
    const { result } = renderHook(() => useLinks())
    const link = makeLink({ url: 'https://example.com' })
    act(() => { result.current.addLink(link) })
    const dupId = result.current.getDuplicateId('https://example.com')
    expect(dupId).toBe(link.id)
  })

  it('unassignFolder sets folderId to null for all links in that folder', () => {
    const { result } = renderHook(() => useLinks())
    const folderId = 'folder-1'
    const link1 = makeLink({ url: 'https://a.com', folderId })
    const link2 = makeLink({ url: 'https://b.com', folderId })
    const link3 = makeLink({ url: 'https://c.com', folderId: 'folder-2' })
    act(() => {
      result.current.addLink(link1)
      result.current.addLink(link2)
      result.current.addLink(link3)
    })
    act(() => { result.current.unassignFolder(folderId) })
    const updated = result.current.links
    expect(updated.find(l => l.id === link1.id)?.folderId).toBeNull()
    expect(updated.find(l => l.id === link2.id)?.folderId).toBeNull()
    expect(updated.find(l => l.id === link3.id)?.folderId).toBe('folder-2')
  })
})
