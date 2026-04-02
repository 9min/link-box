import { useState, useRef, useEffect } from 'react'
import { X, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Link } from '@/lib/types'
import { fetchOgData, isValidUrl, normalizeUrl } from '@/lib/og'
import { suggestCategory } from '@/lib/categories'

interface AddLinkModalProps {
  open: boolean
  onClose: () => void
  onSave: (link: Link) => Promise<{ ok: boolean; error?: string }>
}

export function AddLinkModal({ open, onClose, onSave }: AddLinkModalProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setUrl('')
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter') handleSave()
  }

  const handleSave = async () => {
    const normalized = normalizeUrl(url)
    if (!isValidUrl(normalized)) {
      toast.error('올바른 URL을 입력해주세요')
      return
    }

    setLoading(true)
    // Close modal immediately — skeleton card will appear
    onClose()

    try {
      const ogData = await fetchOgData(normalized)
      if (!ogData) {
        toast.error('미리보기를 가져올 수 없습니다')
      }

      const now = new Date().toISOString()
      const domain = ogData?.domain ?? new URL(normalized).hostname
      const suggestedCategory = suggestCategory(domain)

      const newLink: Link = {
        id: crypto.randomUUID(),
        url: normalized,
        title: ogData?.title ?? domain,
        description: ogData?.description ?? '',
        ogImage: ogData?.ogImage ?? null,
        favicon: ogData?.favicon ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        domain,
        categoryId: suggestedCategory,
        folderId: null,
        isFavorite: false,
        note: '',
        visitCount: 0,
        createdAt: now,
        updatedAt: now,
      }

      const result = await onSave(newLink)
      if (!result.ok && result.error === 'QUOTA_EXCEEDED') {
        toast.error('저장 공간이 부족합니다')
      } else if (result.ok) {
        if (!ogData) {
          toast.warning('미리보기를 가져올 수 없습니다', { description: '편집 모달에서 직접 수정할 수 있어요' })
        }
      }
    } catch {
      toast.error('링크를 저장하지 못했습니다')
    } finally {
      setLoading(false)
      setUrl('')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ paddingTop: '20vh' }}
      role="dialog"
      aria-modal="true"
      aria-label="링크 추가"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-4"
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <LinkIcon size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="URL을 붙여넣거나 입력하세요"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)', fontSize: '15px' }}
            disabled={loading}
            aria-label="URL 입력"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="닫기"
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>
        <div
          className="mt-3 pt-3 flex justify-end gap-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100"
            style={{ color: 'var(--text-secondary)', minHeight: '36px' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !url.trim()}
            className="px-4 py-1.5 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--accent)', minHeight: '36px' }}
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
