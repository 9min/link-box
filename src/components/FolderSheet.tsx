import { useState, useRef, useEffect, useCallback } from 'react'
import { X, FolderOpen, Plus, Trash2 } from 'lucide-react'
import type { Folder, Link } from '@/lib/types'

interface FolderSheetProps {
  open: boolean
  onClose: () => void
  folders: Folder[]
  links: Link[]
  activeFolderId: string | null
  onSelect: (folderId: string | null) => void
  onCreate: (folder: Folder) => Promise<void>
  onDelete: (folderId: string) => void
}

export function FolderSheet({
  open,
  onClose,
  folders,
  links,
  activeFolderId,
  onSelect,
  onCreate,
  onDelete,
}: FolderSheetProps) {
  const [inputVisible, setInputVisible] = useState(false)
  const [newName, setNewName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isCreating = useRef(false)

  // Swipe-to-dismiss
  const touchStartY = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (inputVisible) setTimeout(() => inputRef.current?.focus(), 50)
  }, [inputVisible])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setInputVisible(false)
      setNewName('')
      setDeletingId(null)
    }
  }, [open])

  const handleCreate = useCallback(async () => {
    if (isCreating.current) return
    const name = newName.trim()
    if (!name) return
    isCreating.current = true
    setNewName('')
    setInputVisible(false)
    try {
      await onCreate({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    } catch {
      setNewName(name)
      setInputVisible(true)
    } finally {
      isCreating.current = false
    }
  }, [newName, onCreate])

  const handleSelect = useCallback((folderId: string) => {
    onSelect(activeFolderId === folderId ? null : folderId)
    onClose()
  }, [activeFolderId, onSelect, onClose])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 50) onClose()
    touchStartY.current = null
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white"
        style={{ border: '1px solid var(--border)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
        role="dialog"
        aria-modal="true"
        aria-label="폴더"
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing flex-shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>폴더</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setInputVisible(true); setNewName('') }}
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-page)' }}
              aria-label="새 폴더"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{ color: 'var(--text-tertiary)', background: 'var(--bg-page)' }}
              aria-label="닫기"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-3 py-2">
          {/* New folder input */}
          {inputVisible && (
            <div className="px-1 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleCreate()
                  if (e.key === 'Escape') { setInputVisible(false); setNewName('') }
                }}
                onBlur={() => { if (!newName.trim()) setInputVisible(false) }}
                placeholder="폴더 이름"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ borderColor: 'var(--accent)', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>
          )}

          {/* Empty state */}
          {folders.length === 0 && !inputVisible && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <FolderOpen size={32} style={{ color: 'var(--text-tertiary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>폴더가 없습니다</p>
              <button
                onClick={() => { setInputVisible(true); setNewName('') }}
                className="mt-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                첫 폴더 만들기
              </button>
            </div>
          )}

          {/* Folder list */}
          {folders.map(f => {
            const count = links.filter(l => l.folderId === f.id).length
            const isActive = activeFolderId === f.id

            if (deletingId === f.id) {
              return (
                <div
                  key={f.id}
                  className="mx-0 px-3 py-2.5 rounded-xl mb-1 text-xs"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
                >
                  <p className="font-medium mb-2" style={{ color: '#991B1B' }}>"{f.name}" 폴더를 삭제할까요?</p>
                  <p className="mb-2.5" style={{ color: '#6B7280' }}>폴더 안 링크는 삭제되지 않습니다.</p>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#DC2626', color: 'white' }}
                      onClick={() => { onDelete(f.id); setDeletingId(null) }}
                    >
                      삭제
                    </button>
                    <button
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#F3F4F6', color: 'var(--text-secondary)' }}
                      onClick={() => setDeletingId(null)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={f.id}
                className="flex items-center group rounded-xl mb-0.5"
                style={{ background: isActive ? 'var(--accent-subtle)' : undefined }}
              >
                <button
                  className="flex items-center gap-2.5 flex-1 px-3 py-3 rounded-xl text-sm text-left"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)', minHeight: '44px' }}
                  onClick={() => handleSelect(f.id)}
                >
                  <FolderOpen size={15} style={{ flexShrink: 0 }} />
                  <span className="flex-1 truncate font-medium">{f.name}</span>
                  {count > 0 && (
                    <span className="text-xs ml-auto" style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                      {count}
                    </span>
                  )}
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 mr-1 flex-shrink-0"
                  style={{ color: 'var(--text-tertiary)' }}
                  onClick={() => setDeletingId(f.id)}
                  aria-label={`${f.name} 삭제`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom safe area */}
        <div style={{ height: 'env(safe-area-inset-bottom)', flexShrink: 0 }} />
      </div>
    </>
  )
}
