import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { LayoutGrid, List, ChevronDown, Search, Plus, X, Inbox, Star, Clock, FolderOpen, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Link, SortOption, ViewMode } from '@/lib/types'
import { useLinks } from '@/hooks/useLinks'
import { useFolders } from '@/hooks/useFolders'
import { useSearch } from '@/hooks/useSearch'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIES } from '@/lib/categories'
import { LinkCard } from '@/components/LinkCard'
import { LinkListRow } from '@/components/LinkListRow'
import { FAB } from '@/components/FAB'
import { AddLinkModal } from '@/components/AddLinkModal'
import { EditLinkModal } from '@/components/EditLinkModal'
import { SearchOverlay } from '@/components/SearchOverlay'
import { EmptyState } from '@/components/EmptyState'
import { AuthButton, AuthIconButton } from '@/components/AuthButton'
import * as storage from '@/lib/storage'

const SORT_LABELS: Record<SortOption, string> = {
  'latest': '최신순',
  'most-visited': '많이 본 순',
  'az': '이름 순',
}

type ActiveFilter = 'all' | 'favorites' | 'recent'

interface SidebarContentProps {
  activeFilter: ActiveFilter
  activeFolderId: string | null
  activeCategoryId: string | null
  totalCount: number
  favoriteCount: number
  recentCount: number
  categoryCounts: Record<string, number>
  folders: import('@/lib/types').Folder[]
  folderInputVisible: boolean
  newFolderName: string
  deletingFolderId: string | null
  onFilterChange: (filter: ActiveFilter) => void
  onCategoryFilter: (catId: string) => void
  onFolderSelect: (folderId: string) => void
  onFolderInputOpen: () => void
  onFolderNameChange: (name: string) => void
  onFolderCreate: () => void
  onFolderInputClose: () => void
  onDeleteRequest: (id: string) => void
  onDeleteCancel: () => void
  onDeleteConfirm: (id: string) => void
}

function SidebarContent({
  activeFilter,
  activeFolderId,
  activeCategoryId,
  totalCount,
  favoriteCount,
  recentCount,
  categoryCounts,
  folders,
  folderInputVisible,
  newFolderName,
  deletingFolderId,
  onFilterChange,
  onCategoryFilter,
  onFolderSelect,
  onFolderInputOpen,
  onFolderNameChange,
  onFolderCreate,
  onFolderInputClose,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="mb-5 px-2 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <Link2 size={14} color="white" />
        </div>
        <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          link-box
        </h1>
      </div>

      {/* Main filters */}
      <div className="space-y-0.5">
        <button
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: activeFilter === 'all' && !activeFolderId && !activeCategoryId ? 'var(--accent)' : 'var(--text-secondary)',
            background: activeFilter === 'all' && !activeFolderId && !activeCategoryId ? 'var(--accent-subtle)' : undefined,
          }}
          onClick={() => onFilterChange('all')}
        >
          <Inbox size={15} style={{ flexShrink: 0 }} />
          전체
          <span className="ml-auto text-xs font-normal" style={{ color: activeFilter === 'all' && !activeFolderId && !activeCategoryId ? 'var(--accent)' : 'var(--text-tertiary)' }}>{totalCount}</span>
        </button>
        <button
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm transition-colors"
          style={{
            color: activeFilter === 'favorites' ? 'var(--accent)' : 'var(--text-secondary)',
            background: activeFilter === 'favorites' ? 'var(--accent-subtle)' : undefined,
            fontWeight: activeFilter === 'favorites' ? 500 : undefined,
          }}
          onClick={() => onFilterChange('favorites')}
        >
          <Star
            size={15}
            style={{ flexShrink: 0 }}
            fill={activeFilter === 'favorites' ? 'var(--accent)' : 'none'}
          />
          즐겨찾기
          {favoriteCount > 0 && (
            <span className="ml-auto text-xs font-normal" style={{ color: activeFilter === 'favorites' ? 'var(--accent)' : 'var(--text-tertiary)' }}>{favoriteCount}</span>
          )}
        </button>
        <button
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm transition-colors"
          style={{
            color: activeFilter === 'recent' ? 'var(--accent)' : 'var(--text-secondary)',
            background: activeFilter === 'recent' ? 'var(--accent-subtle)' : undefined,
            fontWeight: activeFilter === 'recent' ? 500 : undefined,
          }}
          onClick={() => onFilterChange('recent')}
        >
          <Clock size={15} style={{ flexShrink: 0 }} />
          최근 7일
          {recentCount > 0 && (
            <span className="ml-auto text-xs font-normal" style={{ color: activeFilter === 'recent' ? 'var(--accent)' : 'var(--text-tertiary)' }}>{recentCount}</span>
          )}
        </button>
      </div>

      {/* Category filter */}
      <div className="mt-4">
        <div className="flex items-center px-2 mb-1">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
            카테고리
          </p>
        </div>
        <div className="space-y-0.5">
          {CATEGORIES.filter(c => categoryCounts[c.id] > 0).map(cat => (
            <button
              key={cat.id}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                color: activeCategoryId === cat.id ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeCategoryId === cat.id ? 'var(--accent-subtle)' : undefined,
                fontWeight: activeCategoryId === cat.id ? 500 : undefined,
              }}
              onClick={() => onCategoryFilter(cat.id)}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.text }}
              />
              <span className="truncate text-xs">{cat.label}</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                {categoryCounts[cat.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Folders */}
      <div className="mt-4">
        <div className="flex items-center px-2 mb-1">
          <p className="text-xs font-semibold uppercase tracking-wide flex-1" style={{ color: 'var(--text-tertiary)' }}>
            폴더
          </p>
          <button
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={onFolderInputOpen}
            aria-label="새 폴더"
          >
            <Plus size={12} />
          </button>
        </div>

        {folderInputVisible && (
          <div className="px-2 mb-1">
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={e => onFolderNameChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onFolderCreate()
                if (e.key === 'Escape') onFolderInputClose()
              }}
              onBlur={() => { if (!newFolderName.trim()) onFolderInputClose() }}
              placeholder="폴더 이름"
              className="w-full px-2 py-1 text-sm rounded border outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </div>
        )}

        {folders.map(f => (
          <div key={f.id}>
            {deletingFolderId === f.id ? (
              <div
                className="mx-1 px-3 py-2.5 rounded-lg text-xs"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
              >
                <p className="font-medium mb-2" style={{ color: '#991B1B' }}>
                  "{f.name}" 폴더를 삭제할까요?
                </p>
                <p className="mb-2.5" style={{ color: '#6B7280' }}>
                  폴더 안 링크는 삭제되지 않습니다.
                </p>
                <div className="flex gap-1.5">
                  <button
                    className="flex-1 px-2 py-1 rounded text-xs font-medium"
                    style={{ background: '#DC2626', color: 'white' }}
                    onClick={() => onDeleteConfirm(f.id)}
                  >
                    삭제
                  </button>
                  <button
                    className="flex-1 px-2 py-1 rounded text-xs font-medium"
                    style={{ background: '#F3F4F6', color: 'var(--text-secondary)' }}
                    onClick={onDeleteCancel}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center group rounded-lg"
                style={{ background: activeFolderId === f.id ? 'var(--accent-subtle)' : undefined }}
              >
                <button
                  className="flex items-center gap-2.5 flex-1 px-2.5 py-2 rounded-lg text-sm hover:bg-gray-100 text-left transition-colors"
                  style={{ color: activeFolderId === f.id ? 'var(--accent)' : 'var(--text-secondary)' }}
                  onClick={() => onFolderSelect(f.id)}
                >
                  <FolderOpen size={14} style={{ flexShrink: 0 }} />
                  <span className="truncate">{f.name}</span>
                </button>
                <button
                  className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 mr-1"
                  style={{ color: 'var(--text-tertiary)' }}
                  onClick={() => onDeleteRequest(f.id)}
                  aria-label={`${f.name} 삭제`}
                >
                  <X size={11} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </>
  )
}

function isRecent(link: Link): boolean {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return new Date(link.createdAt).getTime() >= sevenDaysAgo
}

export function HomePage() {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const { links, addLink, removeLink, editLink, clickLink, toggleFavorite, unassignFolder, sortOption, setSortOption, getDuplicateId } = useLinks(isAuthenticated)
  const { folders, addFolder, removeFolder } = useFolders(isAuthenticated)
  const { filteredLinks, hasQuery } = useSearch(links)

  const [viewMode, setViewMode] = useState<ViewMode>(() => storage.readViewMode() as ViewMode)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Link | null>(null)
  const [sortDropOpen, setSortDropOpen] = useState(false)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [folderInputVisible, setFolderInputVisible] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement>>({})

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setAddModalOpen(true)
        return
      }

      if (e.key === '/' && !inInput) {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      if (e.key === 'Escape') {
        setSearchOpen(false)
        setAddModalOpen(false)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleToggleView = () => {
    const next: ViewMode = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(next)
    storage.writeViewMode(next)
  }

  const handleCardOpen = useCallback((link: Link) => {
    window.open(link.url, '_blank', 'noopener,noreferrer')
    void clickLink(link.id)
  }, [clickLink])

  const handleDelete = useCallback((id: string) => {
    void removeLink(id)
    toast.success('삭제되었습니다')
  }, [removeLink])

  const handleEditOpen = useCallback((link: Link) => {
    setEditTarget(link)
    setEditModalOpen(true)
  }, [])

  const handleFolderCreate = useCallback(() => {
    const name = newFolderName.trim()
    if (!name) return
    void addFolder({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    setNewFolderName('')
    setFolderInputVisible(false)
  }, [newFolderName, addFolder])

  const handleFolderDelete = useCallback((id: string) => {
    void unassignFolder(id)
    void removeFolder(id)
    if (activeFolderId === id) setActiveFolderId(null)
    setDeletingFolderId(null)
  }, [unassignFolder, removeFolder, activeFolderId])

  const handleEditSave = useCallback((id: string, patch: Partial<Link>) => {
    void editLink(id, patch)
  }, [editLink])

  const handleAddLinkSave = useCallback(async (link: Link) => {
    const result = await addLink(link)
    if (!result.ok && result.error === 'DUPLICATE_URL') {
      const dupId = getDuplicateId(link.url)
      if (dupId) {
        toast.error('이미 저장된 링크입니다', {
          action: {
            label: '바로 가기',
            onClick: () => {
              // Clear filters so the card is visible before scrolling
              setActiveFilter('all')
              setActiveCategoryId(null)
              setActiveFolderId(null)
              setTimeout(() => {
                const el = cardRefs.current[dupId]
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }, 50)
            },
          },
        })
      }
    }
    return result
  }, [addLink, getDuplicateId])

  const handleSidebarFilter = useCallback((filter: ActiveFilter) => {
    setActiveFilter(filter)
    setActiveFolderId(null)
    setActiveCategoryId(null)
  }, [])

  const handleCategoryFilter = useCallback((catId: string) => {
    setActiveCategoryId(prev => prev === catId ? null : catId)
    setActiveFolderId(null)
    setActiveFilter('all')
  }, [])

  const handleFolderSelect = useCallback((folderId: string) => {
    setActiveFolderId(prev => prev === folderId ? null : folderId)
    setActiveFilter('all')
    setActiveCategoryId(null)
  }, [])

  // Build category counts from all links
  const categoryCounts = useMemo(
    () => CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
      acc[cat.id] = links.filter(l => l.categoryId === cat.id).length
      return acc
    }, {}),
    [links]
  )

  // Apply filters
  let displayLinks = filteredLinks
  if (activeFilter === 'favorites') {
    displayLinks = displayLinks.filter(l => l.isFavorite)
  } else if (activeFilter === 'recent') {
    displayLinks = displayLinks.filter(isRecent)
  }
  if (activeCategoryId) {
    displayLinks = displayLinks.filter(l => l.categoryId === activeCategoryId)
  }
  if (activeFolderId) {
    displayLinks = displayLinks.filter(l => l.folderId === activeFolderId)
  }

  const favoriteCount = links.filter(l => l.isFavorite).length
  const recentCount = links.filter(isRecent).length
  const activeFolder = folders.find(f => f.id === activeFolderId)

  let pageTitle = '모든 북마크'
  if (activeFilter === 'favorites') pageTitle = '즐겨찾기'
  else if (activeFilter === 'recent') pageTitle = '최근 7일'
  else if (activeCategoryId) pageTitle = CATEGORIES.find(c => c.id === activeCategoryId)?.label ?? '카테고리'
  else if (activeFolder) pageTitle = activeFolder.name

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Sidebar — desktop only */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
        role="navigation"
        aria-label="필터"
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-4 px-3 min-h-0">
          <SidebarContent
            activeFilter={activeFilter}
            activeFolderId={activeFolderId}
            activeCategoryId={activeCategoryId}
            totalCount={links.length}
            favoriteCount={favoriteCount}
            recentCount={recentCount}
            categoryCounts={categoryCounts}
            folders={folders}
            folderInputVisible={folderInputVisible}
            newFolderName={newFolderName}
            deletingFolderId={deletingFolderId}
            onFilterChange={handleSidebarFilter}
            onCategoryFilter={handleCategoryFilter}
            onFolderSelect={handleFolderSelect}
            onFolderInputOpen={() => { setFolderInputVisible(true); setNewFolderName('') }}
            onFolderNameChange={setNewFolderName}
            onFolderCreate={handleFolderCreate}
            onFolderInputClose={() => { setFolderInputVisible(false); setNewFolderName('') }}
            onDeleteRequest={setDeletingFolderId}
            onDeleteCancel={() => setDeletingFolderId(null)}
            onDeleteConfirm={handleFolderDelete}
          />
        </div>
        {/* Fixed bottom — always visible */}
        <div className="flex-shrink-0 px-3 pb-3">
          <AuthButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Link2 size={12} color="white" />
            </div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>link-box</h1>
          </div>

          {/* Desktop page title */}
          <div className="hidden lg:block flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h2>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{displayLinks.length}개</p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            {/* Auth icon — mobile only */}
            <div className="lg:hidden">
              <AuthIconButton />
            </div>

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="검색 (/)"
              style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Search size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>

            {/* View toggle */}
            <button
              onClick={handleToggleView}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label={viewMode === 'grid' ? '리스트 뷰로 전환' : '그리드 뷰로 전환'}
              style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {viewMode === 'grid'
                ? <List size={16} style={{ color: 'var(--text-secondary)' }} />
                : <LayoutGrid size={16} style={{ color: 'var(--text-secondary)' }} />
              }
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortDropOpen(v => !v)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
                style={{ color: 'var(--text-secondary)', minHeight: '44px' }}
                aria-label="정렬"
                aria-haspopup="listbox"
                aria-expanded={sortDropOpen}
              >
                {SORT_LABELS[sortOption]}
                <ChevronDown size={13} />
              </button>
              {sortDropOpen && (
                <div
                  className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-1 z-20 min-w-[140px]"
                  style={{ border: '1px solid var(--border)' }}
                  role="listbox"
                >
                  {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([k, v]) => (
                    <button
                      key={k}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                      style={{
                        color: k === sortOption ? 'var(--accent)' : 'var(--text-primary)',
                        fontWeight: k === sortOption ? 600 : 400,
                        minHeight: '44px',
                      }}
                      role="option"
                      aria-selected={k === sortOption}
                      onClick={() => { setSortOption(k); setSortDropOpen(false) }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile filter chips */}
        <div
          className="lg:hidden chips-scroll flex items-center gap-2 px-4 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
        >
          {/* Static filters */}
          {([
            { key: 'all', label: '전체', count: links.length },
            { key: 'favorites', label: '즐겨찾기', count: favoriteCount },
            { key: 'recent', label: '최근 7일', count: recentCount },
          ] as { key: ActiveFilter; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => handleSidebarFilter(key)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: activeFilter === key && !activeCategoryId && !activeFolderId ? 'var(--accent)' : 'var(--bg-page)',
                color: activeFilter === key && !activeCategoryId && !activeFolderId ? 'white' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: activeFilter === key && !activeCategoryId && !activeFolderId ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {label}
              {count > 0 && key !== 'all' && <span className="opacity-70">{count}</span>}
            </button>
          ))}

          {/* Separator */}
          <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border)' }} />

          {/* Category chips (only non-zero) */}
          {CATEGORIES.filter(c => categoryCounts[c.id] > 0).map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: activeCategoryId === cat.id ? cat.text : cat.bg,
                color: activeCategoryId === cat.id ? 'white' : cat.text,
                border: '1px solid transparent',
              }}
            >
              {cat.label}
              <span className="opacity-70">{categoryCounts[cat.id]}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 pb-20 lg:pb-5">
          {displayLinks.length === 0 ? (
            <EmptyState
              isSearchEmpty={hasQuery}
              onAddLink={() => setAddModalOpen(true)}
            />
          ) : viewMode === 'grid' ? (
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
              }}
              role="feed"
              aria-label="저장된 링크"
            >
              {displayLinks.map(link => (
                <div
                  key={link.id}
                  ref={el => { if (el) cardRefs.current[link.id] = el }}
                >
                  <LinkCard
                    link={link}
                    onOpen={handleCardOpen}
                    onDelete={handleDelete}
                    onEdit={handleEditOpen}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="bg-white rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
              role="feed"
              aria-label="저장된 링크"
            >
              {displayLinks.map((link, idx) => (
                <div
                  key={link.id}
                  ref={el => { if (el) cardRefs.current[link.id] = el }}
                  className={idx === displayLinks.length - 1 ? '[&>div]:border-b-0' : ''}
                >
                  <LinkListRow
                    link={link}
                    onOpen={handleCardOpen}
                    onDelete={handleDelete}
                    onEdit={handleEditOpen}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center bg-white"
        style={{ borderTop: '1px solid var(--border)', zIndex: 30, paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="하단 탭"
      >
        {([
          { key: 'all', label: '전체', icon: <Inbox size={20} /> },
          { key: 'favorites', label: '즐겨찾기', icon: <Star size={20} /> },
          { key: 'recent', label: '최근', icon: <Clock size={20} /> },
          { key: 'search', label: '검색', icon: <Search size={20} /> },
        ] as { key: string; label: string; icon: React.ReactNode }[]).map(tab => {
          const isActive = tab.key === 'search'
            ? searchOpen
            : tab.key === activeFilter && !activeCategoryId && !activeFolderId
          return (
            <button
              key={tab.key}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                minHeight: '56px',
              }}
              onClick={() => {
                if (tab.key === 'search') {
                  setSearchOpen(true)
                } else {
                  handleSidebarFilter(tab.key as ActiveFilter)
                }
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon}
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* FAB */}
      <FAB onClick={() => setAddModalOpen(true)} />

      {/* Modals */}
      <AddLinkModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddLinkSave}
      />

      <EditLinkModal
        link={editTarget}
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditTarget(null) }}
        onSave={handleEditSave}
        folders={folders}
      />

      <SearchOverlay
        open={searchOpen}
        links={links}
        onClose={() => setSearchOpen(false)}
        onOpen={handleCardOpen}
      />
    </div>
  )
}
