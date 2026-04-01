import { useState, useEffect, useCallback, useRef } from 'react'
import { LayoutGrid, List, ChevronDown, Search, Plus, X, Inbox, Star, Clock, FolderOpen, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Link, SortOption, ViewMode } from '@/lib/types'
import { useLinks } from '@/hooks/useLinks'
import { useFolders } from '@/hooks/useFolders'
import { useSearch } from '@/hooks/useSearch'
import { LinkCard } from '@/components/LinkCard'
import { LinkListRow } from '@/components/LinkListRow'
import { FAB } from '@/components/FAB'
import { AddLinkModal } from '@/components/AddLinkModal'
import { EditLinkModal } from '@/components/EditLinkModal'
import { SearchOverlay } from '@/components/SearchOverlay'
import { EmptyState } from '@/components/EmptyState'
import * as storage from '@/lib/storage'

const SORT_LABELS: Record<SortOption, string> = {
  'latest': '최신순',
  'most-visited': '많이 본 순',
  'az': '이름 순',
}

export function HomePage() {
  const { links, addLink, removeLink, editLink, clickLink, unassignFolder, sortOption, setSortOption, getDuplicateId } = useLinks()
  const { folders, addFolder, removeFolder } = useFolders()
  const { filteredLinks, hasQuery } = useSearch(links)

  const [viewMode, setViewMode] = useState<ViewMode>(() => storage.readViewMode() as ViewMode)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Link | null>(null)
  const [sortDropOpen, setSortDropOpen] = useState(false)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [folderInputVisible, setFolderInputVisible] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const cardRefs = useRef<Record<string, HTMLDivElement>>({})

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      // Cmd+K / Ctrl+K → Add link
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setAddModalOpen(true)
        return
      }

      // / → Search (only when not in input)
      if (e.key === '/' && !inInput) {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      // Esc → close search
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
    clickLink(link.id)
  }, [clickLink])

  const handleDelete = useCallback((id: string) => {
    removeLink(id)
    toast.success('삭제되었습니다')
  }, [removeLink])

  const handleEditOpen = useCallback((link: Link) => {
    setEditTarget(link)
    setEditModalOpen(true)
  }, [])

  const handleFolderCreate = useCallback(() => {
    const name = newFolderName.trim()
    if (!name) return
    addFolder({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    setNewFolderName('')
    setFolderInputVisible(false)
  }, [newFolderName, addFolder])

  const handleFolderDelete = useCallback((id: string) => {
    unassignFolder(id)
    removeFolder(id)
    if (activeFolderId === id) setActiveFolderId(null)
  }, [unassignFolder, removeFolder, activeFolderId])

  const handleEditSave = useCallback((id: string, patch: Partial<Link>) => {
    editLink(id, patch)
  }, [editLink])

  const handleAddLinkSave = useCallback((link: Link) => {
    const result = addLink(link)
    if (!result.ok && result.error === 'DUPLICATE_URL') {
      const dupId = getDuplicateId(link.url)
      if (dupId) {
        toast.error('이미 저장된 링크입니다', {
          action: {
            label: '바로 가기',
            onClick: () => {
              const el = cardRefs.current[dupId]
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            },
          },
        })
      }
    }
    return result
  }, [addLink, getDuplicateId])

  const displayLinks = activeFolderId
    ? filteredLinks.filter(l => l.folderId === activeFolderId)
    : filteredLinks

  const activeFolder = folders.find(f => f.id === activeFolderId)
  const pageTitle = activeFolder ? activeFolder.name : '모든 북마크'

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Sidebar — desktop only */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full overflow-y-auto py-4 px-3"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
        role="navigation"
        aria-label="필터"
      >
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

        <div className="space-y-0.5">
          <button
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: activeFolderId === null ? 'var(--accent)' : 'var(--text-secondary)',
              background: activeFolderId === null ? 'var(--accent-subtle)' : undefined,
            }}
            onClick={() => setActiveFolderId(null)}
          >
            <Inbox size={15} style={{ flexShrink: 0 }} />
            전체
            <span className="ml-auto text-xs font-normal" style={{ color: activeFolderId === null ? 'var(--accent)' : 'var(--text-tertiary)' }}>{links.length}</span>
          </button>
          <button
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Star size={15} style={{ flexShrink: 0 }} />
            즐겨찾기
          </button>
          <button
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Clock size={15} style={{ flexShrink: 0 }} />
            최근 7일
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center px-2 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide flex-1" style={{ color: 'var(--text-tertiary)' }}>
              폴더
            </p>
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
              style={{ color: 'var(--text-tertiary)' }}
              onClick={() => { setFolderInputVisible(true); setNewFolderName('') }}
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
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleFolderCreate()
                  if (e.key === 'Escape') { setFolderInputVisible(false); setNewFolderName('') }
                }}
                onBlur={() => { if (!newFolderName.trim()) setFolderInputVisible(false) }}
                placeholder="폴더 이름"
                className="w-full px-2 py-1 text-sm rounded border outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          )}

          {folders.map(f => (
            <div
              key={f.id}
              className="flex items-center group rounded-lg"
              style={{ background: activeFolderId === f.id ? 'var(--accent-subtle)' : undefined }}
            >
              <button
                className="flex items-center gap-2.5 flex-1 px-2.5 py-2 rounded-lg text-sm hover:bg-gray-100 text-left transition-colors"
                style={{ color: activeFolderId === f.id ? 'var(--accent)' : 'var(--text-secondary)' }}
                onClick={() => setActiveFolderId(activeFolderId === f.id ? null : f.id)}
              >
                <FolderOpen size={14} style={{ flexShrink: 0 }} />
                <span className="truncate">{f.name}</span>
              </button>
              <button
                className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 mr-1"
                style={{ color: 'var(--text-tertiary)' }}
                onClick={() => handleFolderDelete(f.id)}
                aria-label={`${f.name} 삭제`}
              >
                <X size={11} />
              </button>
            </div>
          ))}
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

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
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
              {displayLinks.map(link => (
                <div
                  key={link.id}
                  ref={el => { if (el) cardRefs.current[link.id] = el }}
                >
                  <LinkListRow
                    link={link}
                    onOpen={handleCardOpen}
                    onDelete={handleDelete}
                    onEdit={handleEditOpen}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
