import { useState } from 'react'
import { MoreHorizontal, Trash2, Pencil, Eye } from 'lucide-react'
import type { Link } from '@/lib/types'
import { getCategoryById } from '@/lib/categories'

interface LinkCardProps {
  link: Link
  onOpen: (link: Link) => void
  onDelete: (id: string) => void
  onEdit: (link: Link) => void
}

function OgImage({ link }: { link: Link }) {
  const [imgError, setImgError] = useState(false)

  if (!link.ogImage || imgError) {
    const initial = link.domain.charAt(0).toUpperCase()
    return (
      <div
        className="flex items-center justify-center text-2xl font-semibold"
        style={{
          aspectRatio: '16/9',
          background: '#E5E7EB',
          color: 'var(--text-secondary)',
          fontSize: '28px',
        }}
        aria-hidden="true"
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={link.ogImage}
      alt=""
      loading="lazy"
      onError={() => setImgError(true)}
      className="w-full object-cover"
      style={{ aspectRatio: '16/9', display: 'block' }}
    />
  )
}

export function LinkCard({ link, onOpen, onDelete, onEdit }: LinkCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const category = getCategoryById(link.categoryId)

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if clicking the menu
    if ((e.target as HTMLElement).closest('[data-menu]')) return
    onOpen(link)
  }

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(link)
    }
  }

  return (
    <article
      className="link-card card-enter bg-white rounded-lg overflow-hidden cursor-pointer relative group"
      style={{ border: '1px solid var(--border)' }}
      role="article"
      aria-label={`${link.title} - ${link.domain}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
    >
      {/* OG Image */}
      <OgImage link={link} />

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3
          className="font-semibold text-sm leading-snug line-clamp-2 mb-1"
          style={{ color: 'var(--text-primary)', fontSize: '15px' }}
        >
          {link.title || link.domain}
        </h3>

        {/* Domain + favicon */}
        <div className="flex items-center gap-1 mb-2">
          <img
            src={link.favicon}
            alt=""
            width={13}
            height={13}
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <span className="text-xs truncate" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {link.domain}
          </span>
        </div>

        {/* Category badge */}
        <span
          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: category.bg,
            color: category.text,
            fontSize: '11px',
          }}
        >
          {category.label}
        </span>

        {/* Hover extras */}
        <div className="mt-2 hidden group-hover:block group-focus-within:block">
          {link.description && (
            <p
              className="text-xs line-clamp-2 mb-1"
              style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
            >
              {link.description}
            </p>
          )}
          {link.note && (
            <p
              className="text-xs italic line-clamp-1"
              style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
            >
              📝 {link.note}
            </p>
          )}
          {link.visitCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Eye size={11} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                {link.visitCount}회
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Three-dot menu */}
      <div
        data-menu
        className="absolute top-2 right-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
          style={{ border: '1px solid var(--border)', minWidth: '44px', minHeight: '44px' }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="링크 옵션"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-10 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
            style={{ border: '1px solid var(--border)' }}
            role="menu"
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
              style={{ color: 'var(--text-primary)', minHeight: '44px' }}
              onClick={() => { onEdit(link); setMenuOpen(false) }}
              role="menuitem"
            >
              <Pencil size={13} /> 편집
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50"
              style={{ color: '#DC2626', minHeight: '44px' }}
              onClick={() => { onDelete(link.id); setMenuOpen(false) }}
              role="menuitem"
            >
              <Trash2 size={13} /> 삭제
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
