import { useState, useCallback, useEffect } from 'react'
import type { Folder } from '@/lib/types'
import * as localStorage_ from '@/lib/storage'
import * as supabaseStorage from '@/lib/supabaseStorage'
import { supabase } from '@/lib/supabase'

export interface UseFoldersReturn {
  folders: Folder[]
  addFolder: (folder: Folder) => Promise<void>
  removeFolder: (id: string) => Promise<void>
  renameFolder: (id: string, name: string) => Promise<void>
  reload: () => Promise<void>
}

export function useFolders(userId: string | null): UseFoldersReturn {
  const isAuthenticated = !!userId
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

  // Realtime sync: reload folders when another tab or device makes changes.
  // filter: user_id=eq.{userId} is required for RLS to apply correctly with postgres_changes.
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('folders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'folders', filter: `user_id=eq.${userId}` },
        () => { void reload() }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [userId, reload])

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
