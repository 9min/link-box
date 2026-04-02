import { useState, useCallback, useEffect } from 'react'
import type { Folder } from '@/lib/types'
import * as localStorage_ from '@/lib/storage'
import * as supabaseStorage from '@/lib/supabaseStorage'

export interface UseFoldersReturn {
  folders: Folder[]
  addFolder: (folder: Folder) => Promise<void>
  removeFolder: (id: string) => Promise<void>
  renameFolder: (id: string, name: string) => Promise<void>
  reload: () => Promise<void>
}

export function useFolders(isAuthenticated: boolean): UseFoldersReturn {
  const [folders, setFolders] = useState<Folder[]>(() =>
    isAuthenticated ? [] : localStorage_.readFolders()
  )

  const reload = useCallback(async () => {
    if (!isAuthenticated) return
    const data = await supabaseStorage.readFolders()
    setFolders(data)
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      reload()
    } else {
      setFolders(localStorage_.readFolders())
    }
  }, [isAuthenticated, reload])

  const addFolder = useCallback(async (folder: Folder) => {
    if (!isAuthenticated) {
      setFolders(localStorage_.saveFolder(folder))
      return
    }

    setFolders(prev => [...prev, folder])
    try {
      await supabaseStorage.saveFolder(folder)
    } catch {
      await reload()
    }
  }, [isAuthenticated, reload])

  const removeFolder = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setFolders(localStorage_.deleteFolder(id))
      return
    }

    setFolders(prev => prev.filter(f => f.id !== id))
    try {
      await supabaseStorage.deleteFolder(id)
    } catch {
      await reload()
    }
  }, [isAuthenticated, reload])

  const renameFolder = useCallback(async (id: string, name: string) => {
    const patch = { name, updatedAt: new Date().toISOString() }

    if (!isAuthenticated) {
      setFolders(localStorage_.updateFolder(id, patch))
      return
    }

    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f))
    try {
      await supabaseStorage.updateFolder(id, patch)
    } catch {
      await reload()
    }
  }, [isAuthenticated, reload])

  return { folders, addFolder, removeFolder, renameFolder, reload }
}
