import { useState } from 'react'
import { MoreHorizontal, Trash2, Pencil, Eye } from 'lucide-react'
import type { Link } from '@/lib/types'
import { getCategoryById } from '@/lib/categories'
import { formatRelativeTime, getDisplayLabel, getDisplayTitle } from '@/lib/utils'

interface LinkListRowProps {
  link: Link
  onOpen: (link: Link) => void
  onDelete: (id: string) => void
  onEdit: (link: Link) => void
}

export function LinkListRow({ link, onOpen, onDelete, onEdit }: LinkListRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const category = getCategoryById(link.categoryId)

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-menu]')) return
    onOpen(link)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(link)
    }
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer relative group border-b border-gray-100 last:border-b-0"
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      aria-label={`${getDisplayTitle(link)} - ${link.domain}`}
    >
      {/* Favicon */}
      <img
        src={link.favicon}
        alt=""
        width={16}
        height={16}
        loading="lazy"
        className="flex-shrink-0"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />

      {/* Title + note */}
      <div className="flex-1 min-w-0">
        <span
          className="block font-medium text-sm truncate"
          style={{ color: 'var(--text-primary)', fontSize: '14px' }}
        >
          {getDisplayTitle(link)}
        </span>
        {link.note && (
          <span
            className="block truncate"
            style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
          >
            {link.note}
          </span>
        )}
      </div>

      {/* Domain */}
      <span
        className="hidden sm:block text-xs max-w-[200px] truncate flex-shrink-0"
        style={{ color: 'var(--text-secondary)', fontSize: '12px' }}
      >
        {getDisplayLabel(link.url, link.domain)}
      </span>

      {/* Category badge */}
      <span
        className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: category.bg, color: category.text, fontSize: '11px' }}
      >
        {category.label}
      </span>

      {/* Visit count */}
      {link.visitCount > 0 && (
        <span
          className="hidden sm:flex items-center gap-1 flex-shrink-0 text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Eye size={11} />
          {link.visitCount}
        </span>
      )}

      {/* Time */}
      <span
        className="hidden md:block flex-shrink-0 text-xs"
        style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}
      >
        {formatRelativeTime(link.createdAt)}
      </span>

      {/* Three-dot menu */}
      <div
        data-menu
        className="flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="w-8 h-8 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
          style={{ minWidth: '44px', minHeight: '44px' }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="링크 옵션"
        >
          <MoreHorizontal size={14} />
        </button>
        {menuOpen && (
          <div
            className="absolute right-4 top-12 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
            style={{ border: '1px solid var(--border)' }}
            role="menu"
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
              style={{ color: 'var(--text-primary)', minHeight: '44px' }}
              onClick={() => { onEdit(link); setMenuOpen(false) }}
            >
              <Pencil size={13} /> 편집
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50"
              style={{ color: '#DC2626', minHeight: '44px' }}
              onClick={() => { onDelete(link.id); setMenuOpen(false) }}
            >
              <Trash2 size={13} /> 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
