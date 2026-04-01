import { useState, useCallback } from 'react'
import type { Link, SortOption } from '@/lib/types'
import * as storage from '@/lib/storage'

export interface UseLinksReturn {
  links: Link[]
  addLink: (link: Link) => storage.SaveLinkResult
  removeLink: (id: string) => void
  editLink: (id: string, patch: Partial<Link>) => void
  clickLink: (id: string) => void
  sortOption: SortOption
  setSortOption: (opt: SortOption) => void
  getDuplicateId: (url: string) => string | undefined
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

export function useLinks(): UseLinksReturn {
  const [links, setLinks] = useState<Link[]>(() => storage.readLinks())
  const [sortOption, _setSortOption] = useState<SortOption>(
    () => storage.readSortOption() as SortOption
  )

  const sortedLinks = sortLinks(links, sortOption)

  const addLink = useCallback((link: Link): storage.SaveLinkResult => {
    const result = storage.saveLink(link)
    if (result.ok) {
      setLinks(storage.readLinks())
    }
    return result
  }, [])

  const removeLink = useCallback((id: string) => {
    const updated = storage.deleteLink(id)
    setLinks(updated)
  }, [])

  const editLink = useCallback((id: string, patch: Partial<Link>) => {
    const updated = storage.updateLink(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
    setLinks(updated)
  }, [])

  const clickLink = useCallback((id: string) => {
    const updated = storage.incrementVisitCount(id)
    setLinks(updated)
  }, [])

  const setSortOption = useCallback((opt: SortOption) => {
    _setSortOption(opt)
    storage.writeSortOption(opt)
  }, [])

  const getDuplicateId = useCallback(
    (url: string) => links.find(l => l.url === url)?.id,
    [links]
  )

  return {
    links: sortedLinks,
    addLink,
    removeLink,
    editLink,
    clickLink,
    sortOption,
    setSortOption,
    getDuplicateId,
  }
}
