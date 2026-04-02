import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFolders } from '../useFolders'
import { makeFolder } from '@/test/factories'

const useLocalFolders = () => useFolders(null)

describe('useFolders (local mode)', () => {
  it('starts with empty folders', () => {
    const { result } = renderHook(useLocalFolders)
    expect(result.current.folders).toHaveLength(0)
  })

  it('addFolder adds a folder', async () => {
    const { result } = renderHook(useLocalFolders)
    await act(async () => { await result.current.addFolder(makeFolder()) })
    expect(result.current.folders).toHaveLength(1)
  })

  it('removeFolder removes by id', async () => {
    const { result } = renderHook(useLocalFolders)
    const folder = makeFolder()
    await act(async () => { await result.current.addFolder(folder) })
    await act(async () => { await result.current.removeFolder(folder.id) })
    expect(result.current.folders).toHaveLength(0)
  })

  it('renameFolder updates name', async () => {
    const { result } = renderHook(useLocalFolders)
    const folder = makeFolder({ name: 'Old' })
    await act(async () => { await result.current.addFolder(folder) })
    await act(async () => { await result.current.renameFolder(folder.id, 'New') })
    expect(result.current.folders[0].name).toBe('New')
  })
})
