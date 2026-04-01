import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import type { Link } from '@/lib/types'
import { useSearch } from '@/hooks/useSearch'

interface SearchOverlayProps {
  open: boolean
  links: Link[]
  onClose: () => void
  onOpen: (link: Link) => void
}

export function SearchOverlay({ open, links, onClose, onOpen }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { query, setQuery, filteredLinks } = useSearch(links)
  const listRef = useRef<HTMLDivElement>(null)
  const selectedIndexRef = useRef(0)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      selectedIndexRef.current = 0
    } else {
      setQuery('')
    }
  }, [open, setQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndexRef.current = Math.min(
        selectedIndexRef.current + 1,
        filteredLinks.length - 1
      )
      const el = listRef.current?.children[selectedIndexRef.current] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, 0)
      const el = listRef.current?.children[selectedIndexRef.current] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
      return
    }
    if (e.key === 'Enter' && filteredLinks[selectedIndexRef.current]) {
      onOpen(filteredLinks[selectedIndexRef.current])
      onClose()
    }
  }

  if (!open) return null

  const displayLinks = query.trim() ? filteredLinks : links.slice(0, 10)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{ paddingTop: '20vh' }}
      role="search"
      aria-label="링크 검색"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Search panel */}
      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl overflow-hidden"
        style={{ border: '1px solid var(--border)', maxHeight: '60vh' }}
        onKeyDown={handleKeyDown}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              selectedIndexRef.current = 0
            }}
            placeholder="링크 검색..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)', fontSize: '15px' }}
            aria-label="검색어 입력"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="검색어 지우기"
              style={{ minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 56px)' }}>
          {displayLinks.length === 0 && query.trim() ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              검색 결과가 없습니다
            </div>
          ) : (
            displayLinks.map((link, i) => (
              <button
                key={link.id}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                style={{
                  background: i === selectedIndexRef.current ? '#EFF6FF' : undefined,
                  minHeight: '52px',
                }}
                onClick={() => { onOpen(link); onClose() }}
              >
                <img
                  src={link.favicon}
                  alt=""
                  width={16}
                  height={16}
                  loading="lazy"
                  className="flex-shrink-0"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {link.title || link.domain}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.domain}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2 flex gap-4 text-xs"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}
        >
          <span>↵ 열기</span>
          <span>↑↓ 이동</span>
          <span>Esc 닫기</span>
        </div>
      </div>
    </div>
  )
}
