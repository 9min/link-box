# Changelog

All notable changes to link-box are documented here.

## [0.0.3.0] - 2026-04-01

### Added
- Folder CRUD in desktop sidebar — create folders inline (Enter to confirm, Esc to cancel), click to filter, hover X to delete
- `unassignFolder(folderId)` in `useLinks` — batch sets `folderId = null` on all links in the deleted folder
- `unassignFolderLinks(folderId)` in `storage.ts` — atomic batch update for folder link reassignment
- Folder filter composes with text search: search operates within the active folder
- Active folder and "전체" button highlight with accent color
- 1 new unit test for `unassignFolder`

## [0.0.2.0] - 2026-04-01

### Fixed
- List view domain column now uses `max-w-[200px]` instead of fixed `w-28`, preventing path-extended labels like `github.com/org/repo` from truncating

### Added
- `getDisplayLabel(url, domain)` utility — shows path context for code/package hosting domains (github.com, gitlab.com, npmjs.com, pypi.org, crates.io, pkg.go.dev, hub.docker.com, gist.github.com)
- Card and list views now display `github.com/org/repo` instead of just `github.com`
- 6 new unit tests covering `getDisplayLabel` (path domains, fallback, empty path, URL parse failure)

## [0.1.0.0] - 2026-04-01

### Added
- React 19 + Vite + Tailwind CSS v4 project scaffold with TypeScript
- `Link` and `Folder` data models with `note`, `visitCount`, and `isFavorite` fields
- `useLinks` hook — save, delete, edit, click (visitCount++), sort (latest/most-visited/A-Z), duplicate URL detection
- `useFolders` hook — add, remove, rename folders
- `useSearch` hook — 300ms debounced client-side search across title, URL, domain, note, description
- localStorage storage layer — all CRUD operations, QuotaExceededError handling, graceful JSON recovery
- 9-category system (dev/design/video/news/doc/shopping/recipe/reference/etc) with WCAG AA badge colors
- Auto-category suggestion via eTLD+1 domain rule matching (`suggestCategory`)
- OG metadata fetching via Supabase Edge Function (5s timeout, domain fallback on failure)
- FAB button (56px, `Cmd+K` shortcut) — opens URL input modal
- URL input modal — normalizes URLs, triggers OG fetch, saves with skeleton placeholder pattern
- Link card grid — 16:9 OG image, title, domain+favicon, category badge. Hover: description/note/visitCount
- Link list row — favicon, title, domain, category badge, visitCount, relative time
- CSS Grid auto-fill `minmax(280px, 1fr)` responsive layout with 12px gap
- Grid ↔ List view toggle (preference persisted to localStorage)
- Card click opens URL in new tab and increments `visitCount`
- Card three-dot menu — edit and delete actions (44×44px touch targets)
- Link edit modal — URL, title, description, category, folder, note (500 char max)
- Search overlay (cmdk-style) — `/` shortcut, arrow-key navigation, `Enter` to open
- OG image placeholder — domain initial letter on neutral background when no image
- Empty state — bookmark icon + CTA "첫 링크 추가하기" opens URL modal directly
- Duplicate URL toast with scroll-to-card action
- Sort dropdown (latest / most visited / A-Z) persisted to localStorage
- Desktop sidebar — All / Favorites / Recent / Folders navigation
- Responsive layout — desktop sidebar, tablet hamburger (planned), mobile filter chips (planned)
- Supabase Edge Function `og-meta` — OG tag extraction, CORS, Origin-based rate limiting, 5s timeout
- 58 tests (Vitest + React Testing Library) — 9 test files covering storage, categories, OG utils, hooks, and components

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
