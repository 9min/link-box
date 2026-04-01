export interface Category {
  id: string
  label: string
  bg: string
  text: string
}

export const CATEGORIES: Category[] = [
  { id: 'dev',       label: '개발',    bg: '#DBEAFE', text: '#1D4ED8' },
  { id: 'design',    label: '디자인',  bg: '#FCE7F3', text: '#BE185D' },
  { id: 'video',     label: '동영상',  bg: '#FEF3C7', text: '#B45309' },
  { id: 'news',      label: '뉴스',    bg: '#E0E7FF', text: '#4338CA' },
  { id: 'doc',       label: '문서',    bg: '#D1FAE5', text: '#065F46' },
  { id: 'shopping',  label: '쇼핑',    bg: '#FEE2E2', text: '#991B1B' },
  { id: 'recipe',    label: '레시피',  bg: '#FFEDD5', text: '#9A3412' },
  { id: 'reference', label: '참고',    bg: '#F3E8FF', text: '#6B21A8' },
  { id: 'etc',       label: '기타',    bg: '#F3F4F6', text: '#374151' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

export function getCategoryById(id: string): Category {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP['etc']
}

// Domain rules for auto-category suggestion
// eTLD+1 matching via tldts in categories.ts consumers
const DOMAIN_RULES: Record<string, string> = {
  // dev
  'github.com': 'dev',
  'gitlab.com': 'dev',
  'stackoverflow.com': 'dev',
  'npmjs.com': 'dev',
  'pypi.org': 'dev',
  'crates.io': 'dev',
  'developer.mozilla.org': 'dev',
  'devdocs.io': 'dev',
  'codesandbox.io': 'dev',
  'codepen.io': 'dev',
  'replit.com': 'dev',
  'vercel.com': 'dev',
  'netlify.com': 'dev',
  'railway.app': 'dev',
  'supabase.com': 'dev',
  'prisma.io': 'dev',
  'trpc.io': 'dev',
  // design
  'figma.com': 'design',
  'dribbble.com': 'design',
  'behance.net': 'design',
  'awwwards.com': 'design',
  'ui8.net': 'design',
  'sketch.com': 'design',
  'framer.com': 'design',
  'coolors.co': 'design',
  'unsplash.com': 'design',
  'pexels.com': 'design',
  'flaticon.com': 'design',
  'fontawesome.com': 'design',
  // video
  'youtube.com': 'video',
  'vimeo.com': 'video',
  'twitch.tv': 'video',
  'netflix.com': 'video',
  'tiktok.com': 'video',
  'dailymotion.com': 'video',
  // news
  'nytimes.com': 'news',
  'bbc.com': 'news',
  'bbc.co.uk': 'news',
  'reuters.com': 'news',
  'apnews.com': 'news',
  'techcrunch.com': 'news',
  'theverge.com': 'news',
  'wired.com': 'news',
  'hacker-news.firebaseapp.com': 'news',
  'news.ycombinator.com': 'news',
  // doc
  'notion.so': 'doc',
  'confluence.atlassian.com': 'doc',
  'docs.google.com': 'doc',
  'wikipedia.org': 'doc',
  'gitbook.com': 'doc',
  'readthedocs.io': 'doc',
  // shopping
  'amazon.com': 'shopping',
  'amazon.co.kr': 'shopping',
  'coupang.com': 'shopping',
  'ebay.com': 'shopping',
  'etsy.com': 'shopping',
  'aliexpress.com': 'shopping',
  '11st.co.kr': 'shopping',
  'gmarket.co.kr': 'shopping',
  // recipe
  'maangchi.com': 'recipe',
  'allrecipes.com': 'recipe',
  'food.com': 'recipe',
  'epicurious.com': 'recipe',
  'seriouseats.com': 'recipe',
  'cooking.nytimes.com': 'recipe',
}

export function suggestCategory(domain: string): string {
  if (!domain) return 'etc'
  const d = domain.toLowerCase()
  // Exact match first
  if (DOMAIN_RULES[d]) return DOMAIN_RULES[d]
  // Subdomain match (e.g. blog.github.com → github.com)
  const parts = d.split('.')
  if (parts.length > 2) {
    const registeredDomain = parts.slice(-2).join('.')
    if (DOMAIN_RULES[registeredDomain]) return DOMAIN_RULES[registeredDomain]
  }
  return 'etc'
}
