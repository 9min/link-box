import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import * as localStorage_ from '@/lib/storage'
import * as supabaseStorage from '@/lib/supabaseStorage'
import { toast } from 'sonner'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately from localStorage —
    // no network request needed. This is robust against createClient failures.
    let initialized = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        // Clear loading on first event regardless of type
        if (!initialized) {
          initialized = true
          setLoading(false)
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const localLinks = localStorage_.readLinks()
          const localFolders = localStorage_.readFolders()

          if (localLinks.length > 0 || localFolders.length > 0) {
            try {
              const { links, folders } = await supabaseStorage.migrateFromLocalStorage(
                localLinks,
                localFolders,
                session.user.id
              )
              if (links > 0 || folders > 0) {
                toast.success(`${links}개 링크, ${folders}개 폴더를 클라우드로 이전했습니다`)
              }
            } catch {
              toast.error('데이터 이전 중 오류가 발생했습니다')
            }
          }
        }
      }
    )

    // Safety fallback: if onAuthStateChange never fires within 3s, unblock UI
    const fallback = setTimeout(() => {
      if (!initialized) {
        initialized = true
        setLoading(false)
      }
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) toast.error('로그인에 실패했습니다')
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    // Always clear local state regardless of API error
    setSession(null)
    setUser(null)
    if (error) {
      // If the server-side signout fails, at minimum the local session is cleared
      console.warn('signOut API error (local session cleared anyway):', error.message)
    }
    toast.success('로그아웃 되었습니다')
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
