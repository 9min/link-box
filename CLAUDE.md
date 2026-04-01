# link-box

개인 링크 북마크/큐레이션 웹 앱. URL을 저장하면 OG 메타데이터를 자동 추출하여 시각적 카드 그리드로 표시.

## Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** 없음 (Phase 1+2는 단일 페이지). Phase 3에서 auth 페이지 필요 시 추가.
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **테스트:** Vitest + React Testing Library
- **로컬 저장:** localStorage (비로그인 시)
- **인증:** Supabase Auth (Google OAuth) — Phase 3
- **데이터베이스:** Supabase (PostgreSQL) — Phase 3
- **OG 추출:** Supabase Edge Function (Phase 1 유일한 Supabase 의존성)
- **배포:** Vercel 또는 Cloudflare Pages
- **도메인 파싱:** `tldts` — eTLD+1 추출 (`.co.uk`, `github.io` 등 올바른 처리)
- **검색 UI:** `cmdk` 패턴 — command palette 스타일 SearchOverlay

## Project Structure

```
src/
  components/       # UI 컴포넌트
    ui/             # shadcn/ui 컴포넌트
  hooks/            # 커스텀 훅 (useLinks, useFolders — storage-agnostic 인터페이스)
  lib/              # 유틸리티, Supabase 클라이언트, 타입 정의
    categories.ts   # 고정 카테고리 상수 + 자동 분류 도메인 규칙
supabase/
  functions/        # Edge Functions (og-fetch)
  migrations/       # DB 마이그레이션
```

## Commands

```bash
npm run dev          # 개발 서버 (Vite)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 프리뷰
npm run lint         # ESLint
npm run test         # Vitest 단위/컴포넌트 테스트
```

## Key Conventions

- 한국어 UI, 영어 코드
- 고정 카테고리 9개: dev, design, video, news, doc, shopping, recipe, reference, etc
- 카테고리는 코드 상수로 관리 (DB 테이블 없음)
- 폴더만 사용자가 자유 생성
- 비로그인 시 localStorage, 로그인 시 Supabase가 primary storage
- 신규 링크의 기본 카테고리는 "etc" (기타)
- **URL 정규화:** 저장/비교 전 반드시 `new URL(input).href`로 정규화 (trailing slash, hostname case, 기본 포트 처리). 중복 감지의 핵심.
- **storage-agnostic hooks:** `useLinks` / `useFolders`의 인터페이스는 Phase 3 Supabase 마이그레이션 시 내부 구현만 교체되도록 추상화.
- **낙관적 업데이트:** localStorage 연산은 모두 즉시 UI 반영 후 에러 시 롤백. 로딩 스피너 없음.
- **updatedAt 규칙:** visitCount 증가 시 `updatedAt` 갱신 안 함. 명시적 편집(edit modal, favorites toggle)에서만 갱신.
- **이미지 최적화:** OG 이미지에 `loading="lazy"` 필수 적용.
- **접근성:** WCAG AA 준수 (컨트라스트 4.5:1), 터치 타겟 44×44px 최소, 키보드 내비게이션 지원 (Tab/Enter/Esc), ARIA 랜드마크 (feed, navigation, search).
- **테스트 컨벤션:** hooks 단위테스트 (useLinks, useFolders) + 컴포넌트 테스트 (LinkCard, URLInput 등). Phase 1과 함께 작성. 총 24개 (유닛 17 + 컴포넌트 7).

## Data Model

```typescript
interface Link {
  id: string;
  url: string;            // unique, http/https only, normalized
  title: string;
  description: string;
  ogImage: string | null; // null → domain-initial placeholder
  favicon: string;
  domain: string;         // eTLD+1, tldts 라이브러리로 추출
  categoryId: string;     // default "etc"
  folderId: string | null;
  isFavorite: boolean;    // Phase 1 데이터 모델에 포함, UI는 Phase 2
  note: string;           // personal memo, max 500chars, searchable
  visitCount: number;     // increments on card click
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601 — NOT updated on visitCount increment
}

interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

## Component Map (shadcn/ui)

| 컴포넌트 | 용도 |
|---------|------|
| `Dialog` | URL 입력 모달, 편집 모달 |
| `Input` | URL 필드, 검색 필드, 편집 필드 |
| `Select` | 정렬 드롭다운, 편집 모달 카테고리 선택 |
| `Badge` | 카테고리 뱃지 (9개 커스텀 색상) |
| `AlertDialog` | 폴더 삭제 확인 |
| `Sonner` | 에러/성공 토스트 |

커스텀 컴포넌트 (shadcn 외):
- `LinkCard` — OG 이미지 히어로 카드, hover 상태 포함
- `FAB` — 56px 원형 플로팅 액션 버튼
- `SearchOverlay` — cmd+k 스타일 전체 검색
- `SidebarNav` — 카테고리/폴더 필터 사이드바

## Visual Spec

**앱 타입:** APP UI (데이터 중심, 유틸리티 앱)

**타이포그래피:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- 카드 제목: 15px/semibold | 도메인: 13px/regular | 뱃지: 11px/medium | 섹션 헤더: 13px/semibold uppercase

**CSS Variables:**
```css
--bg-page: #FAFAFA;
--bg-card: #FFFFFF;
--bg-sidebar: #F9FAFB;
--accent: #2563EB;
--accent-hover: #1D4ED8;
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--border: #E5E7EB;
```

**카테고리 뱃지 색상 (bg / text):**
| dev | #DBEAFE / #1D4ED8 | design | #FCE7F3 / #BE185D |
| video | #FEF3C7 / #B45309 | news | #E0E7FF / #4338CA |
| doc | #D1FAE5 / #065F46 | shopping | #FEE2E2 / #991B1B |
| recipe | #FFEDD5 / #9A3412 | reference | #F3E8FF / #6B21A8 |
| etc | #F3F4F6 / #374151 |

**카드 스타일:**
- 배경 white, 1px border `var(--border)`, border-radius 8px
- 기본 shadow 없음, hover 시 `0 2px 8px rgba(0,0,0,0.08)`
- OG 이미지: 16:9 aspect-ratio, object-fit cover, radius 8px 8px 0 0
- 이미지 아래 padding: 12px

**레이아웃:**
- 데스크톱(1024px+): 240px 고정 사이드바 + 메인 CSS Grid `auto-fill minmax(280px, 1fr)`, gap 12px
- 태블릿(768~1023px): 사이드바 → 햄버거, 2열 그리드
- 모바일(<768px): 사이드바 없음, 수평 스크롤 필터 칩, 2열 그리드, 하단 탭바 4개

**FAB:** 56px 원형, `var(--accent)`, 우하단 24px 인셋, shadow `0 4px 12px rgba(0,0,0,0.15)`

**모션:** 카드 hover scale 1.01 (100ms ease), skeleton shimmer pulse (1.5s), 카드 fade-in (200ms)

## Behavior Specs

**URL 입력:** `http://`, `https://`만 허용. 그 외 → 토스트 "올바른 URL을 입력해주세요".

**카드 클릭:** 새 탭으로 URL 열기 + `visitCount` +1. `handleCardClick()`에서 localStorage 배열 업데이트.

**OG 추출 실패:** title=domain, description='', ogImage=null로 저장. 토스트 "미리보기를 가져올 수 없습니다". 사용자가 편집 모달로 수정 가능.

**중복 URL:** 토스트 "이미 저장된 링크입니다" + 기존 카드로 스크롤. 중복 생성 안 함.

**자동 카테고리:** OG fetch 후 카테고리 드롭다운 사전 채움. eTLD+1 기준 도메인 매칭 (tldts). 규칙은 `src/lib/categories.ts`. 미매칭 시 "etc". 저장 전 사용자 변경 가능.

**키보드 단축키:** `Cmd+K` / `Ctrl+K` → URL 입력 모달. `/` → 검색 오버레이 (input/textarea 포커스 중에는 비활성).

**검색 오버레이:** 뷰포트 상단 20%, max-width 640px, 배경 딤. 대상: title, URL, domain, note. 300ms debounce.

**폴더 삭제:** 해당 폴더의 모든 링크 `folderId = null`. 링크 삭제 안 함.

**note 필드:** 최대 500자, 검색 대상 포함.

**빈 상태:** 링크 없음 → 아이콘 + "링크를 추가해 보세요" + "첫 링크 추가하기" 버튼(URL 모달 열기).

**OG Edge Function:** Phase 1+2 유일한 Supabase 의존성. 인증 불필요 public function. Origin 헤더로 오픈 프록시 악용 방지.

## Phase 구분

**Phase 1 (핵심 저장 + 프리뷰 + 검색):**
프로젝트 초기화, 타입 정의, localStorage 훅, OG Edge Function, FAB + URL 입력 모달, 링크 카드 (그리드/리스트), 카드 클릭/삭제, 편집 모달, 검색 오버레이 (Phase 2에서 이동됨), OG placeholder, 빈 상태 UI, 테스트 24개.

**Phase 2 (정리 기능):**
사이드바 필터 (전체/즐겨찾기/최근), 카테고리 필터, 폴더 CRUD, 자동 카테고리 제안, 정렬 드롭다운, 즐겨찾기 토글, 모바일 하단 탭, 모바일 필터 칩.

**Phase 3 (인증 + 클라우드):** Supabase Auth, DB, 동기화. **Phase 4 (배포):** PWA, Vercel.

## Design Doc

- 상세 기획 (office-hours): `~/.gstack/projects/link-box/gm-unknown-design-20260401-174044.md`
- CEO + Eng + Design 리뷰 완료 기획서: `~/.gstack/projects/link-box/ceo-plans/2026-04-01-link-box-phase1-2.md`
- 테스트 플랜: `~/.gstack/projects/link-box/gm-main-eng-review-test-plan-20260401-095500.md`

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
