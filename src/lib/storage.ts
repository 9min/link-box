import type { Link, Folder } from './types'

const LINKS_KEY = 'link-box:links'
const FOLDERS_KEY = 'link-box:folders'
const SORT_KEY = 'link-box:sort'
const VIEW_KEY = 'link-box:view'

// ── Links ──────────────────────────────────────────────────────────────────

export function readLinks(): Link[] {
  try {
    const raw = localStorage.getItem(LINKS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Link[]
  } catch {
    return []
  }
}

export function writeLinks(links: Link[]): void {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('QUOTA_EXCEEDED')
    }
    throw e
  }
}

export type SaveLinkResult =
  | { ok: true; link: Link }
  | { ok: false; error: 'DUPLICATE_URL' | 'QUOTA_EXCEEDED' | 'UNKNOWN' }

export function saveLink(link: Link): SaveLinkResult {
  try {
    const links = readLinks()
    if (links.some(l => l.url === link.url)) {
      return { ok: false, error: 'DUPLICATE_URL' }
    }
    writeLinks([link, ...links])
    return { ok: true, link }
  } catch (e) {
    if (e instanceof Error && e.message === 'QUOTA_EXCEEDED') {
      return { ok: false, error: 'QUOTA_EXCEEDED' }
    }
    return { ok: false, error: 'UNKNOWN' }
  }
}

export function deleteLink(id: string): Link[] {
  const links = readLinks().filter(l => l.id !== id)
  writeLinks(links)
  return links
}

export function updateLink(id: string, patch: Partial<Link>): Link[] {
  const links = readLinks().map(l =>
    l.id === id ? { ...l, ...patch } : l
  )
  writeLinks(links)
  return links
}

export function incrementVisitCount(id: string): Link[] {
  const links = readLinks().map(l =>
    l.id === id ? { ...l, visitCount: l.visitCount + 1 } : l
  )
  writeLinks(links)
  return links
}

// ── Folders ────────────────────────────────────────────────────────────────

export function readFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Folder[]
  } catch {
    return []
  }
}

export function writeFolders(folders: Folder[]): void {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('QUOTA_EXCEEDED')
    }
    throw e
  }
}

export function saveFolder(folder: Folder): Folder[] {
  const folders = [...readFolders(), folder]
  writeFolders(folders)
  return folders
}

export function deleteFolder(id: string): Folder[] {
  const folders = readFolders().filter(f => f.id !== id)
  writeFolders(folders)
  return folders
}

export function unassignFolderLinks(folderId: string): Link[] {
  const links = readLinks().map(l =>
    l.folderId === folderId ? { ...l, folderId: null } : l
  )
  writeLinks(links)
  return links
}

export function updateFolder(id: string, patch: Partial<Folder>): Folder[] {
  const folders = readFolders().map(f =>
    f.id === id ? { ...f, ...patch } : f
  )
  writeFolders(folders)
  return folders
}

// ── Preferences ────────────────────────────────────────────────────────────

export function readSortOption(): string {
  return localStorage.getItem(SORT_KEY) ?? 'latest'
}

export function writeSortOption(value: string): void {
  localStorage.setItem(SORT_KEY, value)
}

export function readViewMode(): string {
  return localStorage.getItem(VIEW_KEY) ?? 'grid'
}

export function writeViewMode(value: string): void {
  localStorage.setItem(VIEW_KEY, value)
}
