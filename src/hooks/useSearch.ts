import { useState, useMemo, useEffect, useRef } from 'react'
import type { Link } from '@/lib/types'

export function useSearch(links: Link[]) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timerRef.current)
  }, [query])

  const filteredLinks = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()
    if (!q) return links
    return links.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q) ||
        l.note.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    )
  }, [links, debouncedQuery])

  return { query, setQuery, filteredLinks, hasQuery: debouncedQuery.trim().length > 0 }
}
