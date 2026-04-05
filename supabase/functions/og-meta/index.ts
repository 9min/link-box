import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

interface OgData {
  title: string
  description: string
  ogImage: string | null
  favicon: string
  domain: string
}

const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') ?? ['*']

function corsHeaders(origin: string): Record<string, string> {
  const allowed =
    ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

function parseMeta(html: string, baseUrl: string): OgData {
  const domain = extractDomain(baseUrl)

  const get = (pattern: RegExp): string => {
    const m = html.match(pattern)
    return m ? m[1].trim() : ''
  }

  const ogImage =
    get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
    null

  const title =
    get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
    get(/<title[^>]*>([^<]+)<\/title>/i) ||
    domain

  const description =
    get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
    get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
    ''

  // Resolve relative og:image URLs
  let resolvedImage: string | null = null
  if (ogImage) {
    try {
      resolvedImage = new URL(ogImage, baseUrl).href
    } catch {
      resolvedImage = ogImage
    }
  }

  return {
    title: decodeHtmlEntities(title),
    description: decodeHtmlEntities(description),
    ogImage: resolvedImage,
    favicon: getFaviconUrl(domain),
    domain,
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
}

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return true
  if (h.startsWith('10.')) return true
  if (h.startsWith('192.168.')) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (h === '169.254.169.254') return true // AWS/GCP metadata
  if (h.startsWith('fd') || h.startsWith('fc')) return true // IPv6 ULA
  if (h.endsWith('.local') || h.endsWith('.internal')) return true
  return false
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin') ?? ''
  const headers = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const { url } = body
  if (!url) {
    return new Response(JSON.stringify({ error: 'url is required' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  // Validate URL — only http/https allowed
  let parsed: URL
  try {
    parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Invalid protocol')
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  // Block SSRF — reject private/internal network ranges
  if (isPrivateHost(parsed.hostname)) {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  // Fetch the page (follow redirects up to 3 hops, blocking SSRF at each hop)
  try {
    let currentUrl = parsed.href
    let res: Response | null = null

    for (let hop = 0; hop <= 3; hop++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      res = await fetch(currentUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; link-box-bot/1.0)',
          Accept: 'text/html',
        },
        redirect: 'manual',
      })

      clearTimeout(timeout)

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location || hop === 3) {
          // Too many redirects or no location — fallback
          clearTimeout(timeout)
          const domain = extractDomain(url)
          return new Response(
            JSON.stringify({ title: domain, description: '', ogImage: null, favicon: getFaviconUrl(domain), domain }),
            { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
          )
        }
        // Resolve relative redirect and SSRF-check the destination
        let nextUrl: URL
        try {
          nextUrl = new URL(location, currentUrl)
          if (nextUrl.protocol !== 'https:' && nextUrl.protocol !== 'http:') throw new Error()
        } catch {
          clearTimeout(timeout)
          const domain = extractDomain(url)
          return new Response(
            JSON.stringify({ title: domain, description: '', ogImage: null, favicon: getFaviconUrl(domain), domain }),
            { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
          )
        }
        if (isPrivateHost(nextUrl.hostname)) {
          clearTimeout(timeout)
          return new Response(JSON.stringify({ error: 'Invalid URL' }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' },
          })
        }
        currentUrl = nextUrl.href
        continue
      }

      break
    }

    if (!res) throw new Error('No response')

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${res.status}` }),
        { status: 502, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      // Not HTML — return domain fallback
      const domain = extractDomain(url)
      return new Response(
        JSON.stringify({
          title: domain,
          description: '',
          ogImage: null,
          favicon: getFaviconUrl(domain),
          domain,
        }),
        { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    // Read up to 100KB to avoid huge responses
    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const chunks: Uint8Array[] = []
    let totalBytes = 0
    const maxBytes = 100 * 1024

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      totalBytes += value.length
      if (totalBytes >= maxBytes) {
        reader.cancel()
        break
      }
    }

    const html = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length)
        merged.set(acc)
        merged.set(chunk, acc.length)
        return merged
      }, new Uint8Array())
    )

    const ogData = parseMeta(html, parsed.href)

    return new Response(JSON.stringify(ogData), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})
