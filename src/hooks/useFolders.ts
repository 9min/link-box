import { useState, useCallback } from 'react'
import type { Folder } from '@/lib/types'
import * as storage from '@/lib/storage'

export interface UseFoldersReturn {
  folders: Folder[]
  addFolder: (folder: Folder) => void
  removeFolder: (id: string) => void
  renameFolder: (id: string, name: string) => void
}

export function useFolders(): UseFoldersReturn {
  const [folders, setFolders] = useState<Folder[]>(() => storage.readFolders())

  const addFolder = useCallback((folder: Folder) => {
    const updated = storage.saveFolder(folder)
    setFolders(updated)
  }, [])

  const removeFolder = useCallback((id: string) => {
    const updated = storage.deleteFolder(id)
    setFolders(updated)
  }, [])

  const renameFolder = useCallback((id: string, name: string) => {
    const updated = storage.updateFolder(id, {
      name,
      updatedAt: new Date().toISOString(),
    })
    setFolders(updated)
  }, [])

  return { folders, addFolder, removeFolder, renameFolder }
}
