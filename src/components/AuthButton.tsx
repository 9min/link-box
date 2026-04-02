import { useState } from 'react'
import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

function UserAvatar({ url, name, size }: { url: string | undefined; name: string; size: 'sm' | 'md' }) {
  const [imgError, setImgError] = useState(false)
  const px = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
  const iconSize = size === 'sm' ? 12 : 14

  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={name}
        className={`${px} rounded-full flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`${px} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ background: 'var(--accent)', color: 'white' }}
    >
      <User size={iconSize} />
    </div>
  )
}

// Full version — used in the desktop sidebar
export function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return null

  if (user) {
    const name = user.user_metadata?.full_name ?? user.email ?? '사용자'
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined

    return (
      <div className="flex items-center gap-2 px-2 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <UserAvatar url={avatarUrl} name={name} size="sm" />
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
      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100"
      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
    >
      <LogIn size={14} />
      <span>Google로 로그인</span>
    </button>
  )
}

// Compact icon version — used in the mobile header
export function AuthIconButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) return null

  if (user) {
    const name = user.user_metadata?.full_name ?? user.email ?? '사용자'
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined

    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex items-center justify-center rounded-full"
          aria-label="계정 메뉴"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <UserAvatar url={avatarUrl} name={name} size="md" />
        </button>
        {menuOpen && (
          <>
            {/* backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            {/* dropdown */}
            <div
              className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg py-1 min-w-[160px]"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); void signOut() }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-gray-50"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut size={14} />
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"
      aria-label="Google로 로그인"
      title="Google로 로그인"
      style={{ minWidth: '44px', minHeight: '44px', color: 'var(--text-secondary)' }}
    >
      <LogIn size={16} />
    </button>
  )
}
