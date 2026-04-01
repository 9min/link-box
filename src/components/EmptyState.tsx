import { Bookmark } from 'lucide-react'

interface EmptyStateProps {
  isSearchEmpty?: boolean
  onAddLink: () => void
}

export function EmptyState({ isSearchEmpty = false, onAddLink }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
      role="status"
      aria-label={isSearchEmpty ? '검색 결과 없음' : '저장된 링크 없음'}
    >
      <div
        className="mb-4 p-4 rounded-full"
        style={{ background: '#EFF6FF' }}
      >
        <Bookmark size={32} style={{ color: 'var(--accent)' }} />
      </div>
      {isSearchEmpty ? (
        <>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            검색 결과가 없습니다
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            다른 키워드로 검색해 보세요
          </p>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            링크를 추가해 보세요
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            URL을 저장하면 자동으로 예쁜 카드가 만들어져요
          </p>
          <button
            onClick={onAddLink}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--accent)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            첫 링크 추가하기
          </button>
        </>
      )}
    </div>
  )
}
