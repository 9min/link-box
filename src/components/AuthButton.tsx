import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return null

  if (user) {
    const name = user.user_metadata?.full_name ?? user.email ?? '사용자'
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined

    return (
      <div className="flex items-center gap-2 px-2 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-6 h-6 rounded-full flex-shrink-0" />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)', color: 'white', fontSize: '11px', fontWeight: 600 }}
          >
            <User size={12} />
          </div>
        )}
        <span
          className="text-xs flex-1 truncate"
          style={{ color: 'var(--text-secondary)' }}
          title={name}
        >
          {name}
        </span>
        <button
          onClick={signOut}
          className="p-1 rounded hover:bg-gray-100 flex-shrink-0"
          aria-label="로그아웃"
          title="로그아웃"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <LogOut size={13} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100 mt-auto"
      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
    >
      <LogIn size={14} />
      <span>Google로 로그인</span>
    </button>
  )
}
