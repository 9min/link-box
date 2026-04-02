import { useState, useCallback, useEffect } from 'react'
import type { Link, SortOption } from '@/lib/types'
import * as localStorage_ from '@/lib/storage'
import * as supabaseStorage from '@/lib/supabaseStorage'
import type { SaveLinkResult } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

export interface UseLinksReturn {
  links: Link[]
  isLoading: boolean
  addLink: (link: Link) => Promise<SaveLinkResult>
  removeLink: (id: string) => Promise<void>
  editLink: (id: string, patch: Partial<Link>) => Promise<void>
  clickLink: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  unassignFolder: (folderId: string) => Promise<void>
  sortOption: SortOption
  setSortOption: (opt: SortOption) => void
  getDuplicateId: (url: string) => string | undefined
  reload: () => Promise<void>
}

function sortLinks(links: Link[], sort: SortOption): Link[] {
  const copy = [...links]
  switch (sort) {
    case 'latest':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'most-visited':
      return copy.sort((a, b) => b.visitCount - a.visitCount)
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
    default:
      return copy
  }
}

export function useLinks(userId: string | null): UseLinksReturn {
  const isAuthenticated = !!userId
  const [links, setLinks] = useState<Link[]>(() =>
    isAuthenticated ? [] : localStorage_.readLinks()
  )
  const [isLoading, setIsLoading] = useState(isAuthenticated)
  const [sortOption, _setSortOption] = useState<SortOption>(
    () => localStorage_.readSortOption() as SortOption
  )

  // Reload from Supabase when authenticated
  const reload = useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const data = await supabaseStorage.readLinks()
      setLinks(data)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      reload()
    } else {
      setLinks(localStorage_.readLinks())
      setIsLoading(false)
    }
  }, [isAuthenticated, reload])

  // Realtime sync: reload links when another tab or device makes changes.
  // filter: user_id=eq.{userId} is required for RLS to apply correctly with postgres_changes.
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('links-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'links', filter: `user_id=eq.${userId}` },
        () => { void reload() }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [userId, reload])

  const sortedLinks = sortLinks(links, sortOption)

  const addLink = useCallback(async (link: Link): Promise<SaveLinkResult> => {
    if (!isAuthenticated) {
      const result = localStorage_.saveLink(link)
      if (result.ok) setLinks(localStorage_.readLinks())
      return result
    }

    // Optimistic update
    setLinks(prev => [link, ...prev])
    const result = await supabaseStorage.saveLink(link)
    if (!result.ok) {
      // Rollback
      setLinks(prev => prev.filter(l => l.id !== link.id))
    }
    return result
  }, [isAuthenticated])

  const removeLink = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setLinks(localStorage_.deleteLink(id))
      return
    }

    setLinks(prev => prev.filter(l => l.id !== id))
    try {
      await supabaseStorage.deleteLink(id)
    } catch {
      await reload()
    }
  }, [isAuthenticated, reload])

  const editLink = useCallback(async (id: string, patch: Partial<Link>) => {
    const patchWithTimestamp = { ...patch, updatedAt: new Date().toISOString() }

    if (!isAuthenticated) {
      setLinks(localStorage_.updateLink(id, patchWithTimestamp))
      return
    }

    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...patchWithTimestamp } : l))
    try {
      await supabaseStorage.updateLink(id, patchWithTimestamp)
    } catch {
      await reload()
    }
  }, [isAuthenticated, reload])

  const clickLink = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setLinks(localStorage_.incrementVisitCount(id))
      return
    }

    setLinks(prev => prev.map(l => l.id === id ? { ...l, visitCount: l.visitCount + 1 } : l))
    try {
      await supabaseStorage.incrementVisitCount(id)
    } catch {
      // Non-critical — don't rollback visit count failures
    }
  }, [isAuthenticated])

  const toggleFavorite = useCallback(async (id: string) => {
    const link = links.find(l => l.id === id)
    if (!link) return

    const newFavorite = !link.isFavorite
    const patch = { isFavorite: newFavorite, updatedAt: new Date().toISOString() }

    if (!isAuthenticated) {
      setLinks(localStorage_.updateLink(id, patch))
      return
    }

    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
    try {
      await supabaseStorage.updateLink(id, patch)
    } catch {
      await reload()
    }
  }, [isAuthenticated, links, reload])

  const unassignFolder = useCallback(async (folderId: string) => {
    if (!isAuthenticated) {
      setLinks(localStorage_.unassignFolderLinks(folderId))
      return
    }

    setLinks(prev => prev.map(l => l.folderId === folderId ? { ...l, folderId: null } : l))
    try {
      await supabaseStorage.unassignFolderLinks(folderId)
    } catch {
      await reload()
    }
  }, [isAuthenticated, reload])

  const setSortOption = useCallback((opt: SortOption) => {
    _setSortOption(opt)
    localStorage_.writeSortOption(opt)
  }, [])

  const getDuplicateId = useCallback(
    (url: string) => links.find(l => l.url === url)?.id,
    [links]
  )

  return {
    links: sortedLinks,
    isLoading,
    addLink,
    removeLink,
    editLink,
    clickLink,
    toggleFavorite,
    unassignFolder,
    sortOption,
    setSortOption,
    getDuplicateId,
    reload,
  }
}
