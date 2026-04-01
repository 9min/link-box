import { describe, it, expect } from 'vitest'
import {
  readLinks, saveLink, deleteLink, updateLink, incrementVisitCount,
  readFolders, saveFolder, deleteFolder,
  readSortOption, writeSortOption, readViewMode, writeViewMode,
} from '../storage'
import { makeLink, makeFolder } from '@/test/factories'

describe('storage — links', () => {
  it('readLinks returns empty array when nothing stored', () => {
    expect(readLinks()).toEqual([])
  })

  it('saveLink adds a new link', () => {
    const link = makeLink({ url: 'https://example.com' })
    const result = saveLink(link)
    expect(result.ok).toBe(true)
    expect(readLinks()).toHaveLength(1)
  })

  it('saveLink rejects duplicate URL', () => {
    const link = makeLink({ url: 'https://example.com' })
    saveLink(link)
    const result = saveLink({ ...link, id: 'other-id' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('DUPLICATE_URL')
    expect(readLinks()).toHaveLength(1)
  })

  it('saveLink prepends (newest first)', () => {
    saveLink(makeLink({ url: 'https://first.com', title: 'First' }))
    saveLink(makeLink({ url: 'https://second.com', title: 'Second' }))
    const links = readLinks()
    expect(links[0].title).toBe('Second')
  })

  it('deleteLink removes by id', () => {
    const link = makeLink()
    saveLink(link)
    const remaining = deleteLink(link.id)
    expect(remaining).toHaveLength(0)
    expect(readLinks()).toHaveLength(0)
  })

  it('updateLink patches fields', () => {
    const link = makeLink({ title: 'Old' })
    saveLink(link)
    const updated = updateLink(link.id, { title: 'New' })
    expect(updated[0].title).toBe('New')
  })

  it('incrementVisitCount increments by 1', () => {
    const link = makeLink({ visitCount: 5 })
    saveLink(link)
    incrementVisitCount(link.id)
    expect(readLinks()[0].visitCount).toBe(6)
  })

  it('readLinks recovers gracefully from corrupt JSON', () => {
    localStorage.setItem('link-box:links', 'not-valid-json')
    expect(readLinks()).toEqual([])
  })
})

describe('storage — folders', () => {
  it('readFolders returns empty array initially', () => {
    expect(readFolders()).toEqual([])
  })

  it('saveFolder appends a folder', () => {
    const folder = makeFolder()
    saveFolder(folder)
    expect(readFolders()).toHaveLength(1)
  })

  it('deleteFolder removes by id and unlinks are caller responsibility', () => {
    const folder = makeFolder()
    saveFolder(folder)
    const remaining = deleteFolder(folder.id)
    expect(remaining).toHaveLength(0)
  })
})

describe('storage — preferences', () => {
  it('readSortOption defaults to latest', () => {
    expect(readSortOption()).toBe('latest')
  })

  it('writeSortOption persists', () => {
    writeSortOption('az')
    expect(readSortOption()).toBe('az')
  })

  it('readViewMode defaults to grid', () => {
    expect(readViewMode()).toBe('grid')
  })

  it('writeViewMode persists', () => {
    writeViewMode('list')
    expect(readViewMode()).toBe('list')
  })
})
