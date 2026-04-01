import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFolders } from '../useFolders'
import { makeFolder } from '@/test/factories'

describe('useFolders', () => {
  it('starts with empty folders', () => {
    const { result } = renderHook(() => useFolders())
    expect(result.current.folders).toHaveLength(0)
  })

  it('addFolder adds a folder', () => {
    const { result } = renderHook(() => useFolders())
    act(() => { result.current.addFolder(makeFolder()) })
    expect(result.current.folders).toHaveLength(1)
  })

  it('removeFolder removes by id', () => {
    const { result } = renderHook(() => useFolders())
    const folder = makeFolder()
    act(() => { result.current.addFolder(folder) })
    act(() => { result.current.removeFolder(folder.id) })
    expect(result.current.folders).toHaveLength(0)
  })

  it('renameFolder updates name', () => {
    const { result } = renderHook(() => useFolders())
    const folder = makeFolder({ name: 'Old' })
    act(() => { result.current.addFolder(folder) })
    act(() => { result.current.renameFolder(folder.id, 'New') })
    expect(result.current.folders[0].name).toBe('New')
  })
})
