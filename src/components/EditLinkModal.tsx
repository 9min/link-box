import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Link } from '@/lib/types'
import { CATEGORIES } from '@/lib/categories'

interface EditLinkModalProps {
  link: Link | null
  open: boolean
  onClose: () => void
  onSave: (id: string, patch: Partial<Link>) => void
  folders: { id: string; name: string }[]
}

export function EditLinkModal({ link, open, onClose, onSave, folders }: EditLinkModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [categoryId, setCategoryId] = useState('etc')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (link && open) {
      setTitle(link.title)
      setDescription(link.description)
      setUrl(link.url)
      setCategoryId(link.categoryId)
      setFolderId(link.folderId)
      setNote(link.note)
    }
  }, [link, open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  const handleSave = () => {
    if (!link) return
    if (!title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    setSaving(true)
    try {
      onSave(link.id, { title, description, url, categoryId, folderId, note })
      onClose()
    } catch {
      toast.error('저장 실패')
    } finally {
      setSaving(false)
    }
  }

  if (!open || !link) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="링크 편집"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            링크 편집
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="닫기"
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {/* URL */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              설명
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg resize-none"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              카테고리
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', background: 'white' }}
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Folder */}
          {folders.length > 0 && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                폴더
              </label>
              <select
                value={folderId ?? ''}
                onChange={e => setFolderId(e.target.value || null)}
                className="w-full px-3 py-2 text-sm rounded-lg"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', background: 'white' }}
              >
                <option value="">없음</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              메모 <span style={{ color: 'var(--text-tertiary)' }}>({note.length}/500)</span>
            </label>
            <textarea
              value={note}
              onChange={e => {
                if (e.target.value.length <= 500) setNote(e.target.value)
              }}
              rows={3}
              placeholder="개인 메모를 남겨보세요"
              className="w-full px-3 py-2 text-sm rounded-lg resize-none"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg hover:bg-gray-100"
            style={{ color: 'var(--text-secondary)', minHeight: '40px' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--accent)', minHeight: '40px' }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
