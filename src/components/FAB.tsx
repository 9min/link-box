import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label="링크 추가"
      title="링크 추가 (Cmd+K)"
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  )
}
