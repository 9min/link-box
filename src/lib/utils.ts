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

// Title parsers for specific domains (registry pattern — add parsers as needed).
// Each parser receives the URL pathname and returns a human-readable title.
const TITLE_PARSERS: Record<string, (pathname: string) => string> = {
  'github.com': parseGitHubPath,
  'gitlab.com': parseGitHubPath,
  'gist.github.com': parseGitHubPath,
}

function parseGitHubPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return ''
  if (segments.length === 1) return segments[0]
  // issues/pull/discussions: org / repo #number
  const issueKeywords = ['issues', 'pull', 'discussions', 'releases']
  const keywordIdx = segments.findIndex(s => issueKeywords.includes(s))
  if (keywordIdx >= 2 && segments[keywordIdx + 1]) {
    return `${segments[0]} / ${segments[1]} #${segments[keywordIdx + 1]}`
  }
  return `${segments[0]} / ${segments[1]}`
}

function parseGenericPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return ''
  const clean = (s: string) => {
    try { s = decodeURIComponent(s) } catch { /* keep original */ }
    return s.replace(/[-_]/g, ' ').trim()
  }
  const last = segments.slice(-2).map(clean).filter(Boolean)
  const title = last.join(' / ')
  return title.length > 60 ? title.slice(0, 57) + '...' : title
}

function isTitleMeaningless(title: string, domain: string): boolean {
  if (!title || !title.trim()) return true
  const t = title.trim().toLowerCase()
  // Exact match with eTLD+1
  if (t === domain.toLowerCase()) return true
  // Exact match with www. prefix
  if (t === `www.${domain.toLowerCase()}`) return true
  return false
}

export function getDisplayTitle(link: { title: string; url: string; domain: string }): string {
  if (!isTitleMeaningless(link.title, link.domain)) return link.title
  try {
    const { pathname } = new URL(link.url)
    const parser = TITLE_PARSERS[link.domain]
    const parsed = parser ? parser(pathname) : parseGenericPath(pathname)
    return parsed || link.domain
  } catch {
    return link.domain
  }
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
