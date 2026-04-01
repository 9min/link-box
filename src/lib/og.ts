import type { OgData } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const OG_FUNCTION_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/og-meta`
  : null

export async function fetchOgData(url: string): Promise<OgData | null> {
  if (!OG_FUNCTION_URL) {
    // Fallback: extract domain only
    return buildFallback(url)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(OG_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) return buildFallback(url)

    const data = await res.json() as Partial<OgData>
    return {
      title: data.title || extractDomain(url),
      description: data.description || '',
      ogImage: data.ogImage || null,
      favicon: data.favicon || getFaviconUrl(extractDomain(url)),
      domain: data.domain || extractDomain(url),
    }
  } catch {
    clearTimeout(timeout)
    return buildFallback(url)
  }
}

function buildFallback(url: string): OgData {
  const domain = extractDomain(url)
  return {
    title: domain,
    description: '',
    ogImage: null,
    favicon: getFaviconUrl(domain),
    domain,
  }
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  const withScheme =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`
  try {
    return new URL(withScheme).href
  } catch {
    return withScheme
  }
}
