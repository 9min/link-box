import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000 // seconds

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Domains where the path after the hostname gives meaningful context.
// Value = number of path segments to include (e.g. github.com/org/repo = 2).
const PATH_DOMAINS: Record<string, number> = {
  'github.com': 2,
  'gitlab.com': 2,
  'gist.github.com': 2,
  'npmjs.com': 2,
  'pypi.org': 2,
  'crates.io': 2,
  'pkg.go.dev': 2,
  'hub.docker.com': 3,
}

export function getDisplayLabel(url: string, domain: string): string {
  const depth = PATH_DOMAINS[domain]
  if (!depth) return domain
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean).slice(0, depth)
    if (segments.length === 0) return domain
    return `${domain}/${segments.join('/')}`
  } catch {
    return domain
  }
}
