export interface Link {
  id: string
  url: string
  title: string
  description: string
  ogImage: string | null
  favicon: string
  domain: string
  categoryId: string
  folderId: string | null
  isFavorite: boolean
  note: string
  visitCount: number
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type SortOption = 'latest' | 'most-visited' | 'az'

export type ViewMode = 'grid' | 'list'

export interface OgData {
  title: string
  description: string
  ogImage: string | null
  favicon: string
  domain: string
}

export type SaveLinkInput = Pick<Link, 'url' | 'title' | 'description' | 'ogImage' | 'favicon' | 'domain' | 'categoryId' | 'folderId' | 'note'>

export type EditLinkInput = Partial<Pick<Link, 'url' | 'title' | 'description' | 'categoryId' | 'folderId' | 'note'>>
