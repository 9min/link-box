/**
 * Supabase storage backend — mirrors the localStorage storage API
 * but persists to Supabase Postgres (for authenticated users).
 */
import type { Link, Folder } from './types'
import type { SaveLinkResult } from './storage'
import { supabase, type LinkRow, type FolderRow } from './supabase'

// ---- Mappers ----

function rowToLink(row: LinkRow): Link {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description,
    ogImage: row.og_image,
    favicon: row.favicon,
    domain: row.domain,
    categoryId: row.category_id,
    folderId: row.folder_id,
    isFavorite: row.is_favorite,
    note: row.note,
    visitCount: row.visit_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function linkToRow(link: Link, userId: string): Omit<LinkRow, 'user_id'> & { user_id: string } {
  return {
    id: link.id,
    user_id: userId,
    url: link.url,
    title: link.title,
    description: link.description,
    og_image: link.ogImage,
    favicon: link.favicon,
    domain: link.domain,
    category_id: link.categoryId,
    folder_id: link.folderId,
    is_favorite: link.isFavorite,
    note: link.note,
    visit_count: link.visitCount,
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  }
}

function rowToFolder(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ---- Links ----

export async function readLinks(): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as LinkRow[]).map(rowToLink)
}

export async function saveLink(link: Link): Promise<SaveLinkResult> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'UNKNOWN' }

  // Check duplicate
  const { data: existing } = await supabase
    .from('links')
    .select('id')
    .eq('url', link.url)
    .maybeSingle()
  if (existing) return { ok: false, error: 'DUPLICATE_URL' }

  const { error } = await supabase
    .from('links')
    .insert(linkToRow(link, user.id))
  if (error) return { ok: false, error: 'UNKNOWN' }
  return { ok: true, link }
}

export async function deleteLink(id: string): Promise<void> {
  const { error } = await supabase.from('links').delete().eq('id', id)
  if (error) throw error
}

export async function updateLink(id: string, patch: Partial<Link>): Promise<void> {
  const dbPatch: Partial<LinkRow> = {}
  if (patch.url !== undefined) dbPatch.url = patch.url
  if (patch.title !== undefined) dbPatch.title = patch.title
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.ogImage !== undefined) dbPatch.og_image = patch.ogImage
  if (patch.favicon !== undefined) dbPatch.favicon = patch.favicon
  if (patch.domain !== undefined) dbPatch.domain = patch.domain
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId
  if (patch.folderId !== undefined) dbPatch.folder_id = patch.folderId
  if (patch.isFavorite !== undefined) dbPatch.is_favorite = patch.isFavorite
  if (patch.note !== undefined) dbPatch.note = patch.note
  if (patch.visitCount !== undefined) dbPatch.visit_count = patch.visitCount
  if (patch.updatedAt !== undefined) dbPatch.updated_at = patch.updatedAt

  const { error } = await supabase.from('links').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function incrementVisitCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_visit_count', { link_id: id })
  if (error) {
    // Fallback: read-modify-write
    const { data } = await supabase.from('links').select('visit_count').eq('id', id).single()
    if (data) {
      await supabase.from('links').update({ visit_count: data.visit_count + 1 }).eq('id', id)
    }
  }
}

export async function unassignFolderLinks(folderId: string): Promise<void> {
  const { error } = await supabase
    .from('links')
    .update({ folder_id: null })
    .eq('folder_id', folderId)
  if (error) throw error
}

// ---- Folders ----

export async function readFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as FolderRow[]).map(rowToFolder)
}

export async function saveFolder(folder: Folder): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('folders').insert({
    id: folder.id,
    user_id: user.id,
    name: folder.name,
    created_at: folder.createdAt,
    updated_at: folder.updatedAt,
  })
  if (error) throw error
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase.from('folders').delete().eq('id', id)
  if (error) throw error
}

export async function updateFolder(id: string, patch: Partial<Folder>): Promise<void> {
  const dbPatch: Partial<FolderRow> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.updatedAt !== undefined) dbPatch.updated_at = patch.updatedAt

  const { error } = await supabase.from('folders').update(dbPatch).eq('id', id)
  if (error) throw error
}

// ---- Migration: localStorage → Supabase ----

/**
 * Copies all links and folders from localStorage to Supabase on first login.
 * Uses URL-based dedup so running this multiple times is safe.
 */
export async function migrateFromLocalStorage(
  localLinks: Link[],
  localFolders: Folder[],
  userId: string
): Promise<{ links: number; folders: number }> {
  if (localLinks.length === 0 && localFolders.length === 0) {
    return { links: 0, folders: 0 }
  }

  // Get existing URLs to avoid duplicates
  const { data: existingLinks } = await supabase.from('links').select('url')
  const existingUrls = new Set((existingLinks ?? []).map((r: { url: string }) => r.url))

  const { data: existingFolders } = await supabase.from('folders').select('id')
  const existingFolderIds = new Set((existingFolders ?? []).map((r: { id: string }) => r.id))

  const newFolders = localFolders.filter(f => !existingFolderIds.has(f.id))
  const newLinks = localLinks.filter(l => !existingUrls.has(l.url))

  if (newFolders.length > 0) {
    await supabase.from('folders').insert(
      newFolders.map(f => ({
        id: f.id,
        user_id: userId,
        name: f.name,
        created_at: f.createdAt,
        updated_at: f.updatedAt,
      }))
    )
  }

  if (newLinks.length > 0) {
    await supabase.from('links').insert(
      newLinks.map(l => linkToRow(l, userId))
    )
  }

  return { links: newLinks.length, folders: newFolders.length }
}
