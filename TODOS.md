# link-box TODO

## 1단계: 핵심 저장 + 프리뷰

- [x] React + Vite 프로젝트 초기화
- [x] Tailwind CSS v4 + shadcn/ui 세팅
- [x] 데이터 모델 및 타입 정의 (Link, Folder, Category 상수)
- [x] `useLinks` / `useFolders` 훅 구현 (storage-agnostic 인터페이스)
- [x] Supabase Edge Function: OG 메타데이터 추출 API
- [x] FAB 버튼 + URL 입력 모달 (Cmd+K 단축키 포함)
- [x] 링크 카드 컴포넌트 (OG 이미지 16:9, 제목, 도메인+favicon, 카테고리 뱃지 — 기본 4요소만 표시, hover 시 설명/visitCount/note 표시)
- [x] 반응형 카드 그리드 레이아웃 (CSS Grid auto-fill minmax(280px, 1fr))
- [x] 리스트 뷰 토글 (Grid ↔ List), 선택 localStorage 저장
- [x] 카드 클릭 핸들러 (`handleCardClick`) — 새 탭 열기 + visitCount +1
- [x] 카드 삭제 기능
- [x] 링크 편집 모달 (title, description, category, folder, note, URL)
- [x] 검색 오버레이 (title/URL/domain/note 대상, 300ms debounce, `/` 단축키)
- [x] OG placeholder (ogImage null 시 도메인 첫 글자)
- [x] 빈 상태 UI — "링크를 추가해 보세요" + CTA 버튼

## 2단계: 정리 기능

- [ ] 사이드바: 전체/즐겨찾기/최근(7일) 필터
- [ ] 카테고리 필터 (9개 고정 카테고리)
- [ ] 폴더 CRUD (삭제 시 링크 folderId = null, AlertDialog 확인)
- [ ] 링크에 카테고리/폴더 할당
- [x] 자동 카테고리 제안 (tldts 기반 도메인 규칙 매칭, `src/lib/categories.ts`)
- [x] 정렬 드롭다운 (최신순 / 방문 많은 순 / A-Z), 전역 설정, localStorage 저장
- [ ] 즐겨찾기 토글 (낙관적 업데이트, 아이콘 위치/UX 구현 직전 결정)
- [ ] 모바일 하단 탭 네비게이션 (Home / 즐겨찾기 / 폴더 / 검색 — 4개)
- [ ] 모바일 수평 스크롤 필터 칩 (All / 최근 / 카테고리 / 폴더)
- [ ] 중복 URL + 필터 활성 시 scroll-to-card 처리 (구현 직전 결정)

## 3단계: 인증 + 클라우드

- [ ] Supabase Auth + Google OAuth 설정
- [ ] Supabase 테이블 생성 (links, folders) + RLS
- [ ] 로그인/로그아웃 UI
- [ ] 최초 로그인 시 localStorage → Supabase 마이그레이션 (URL 기준 dedup)
- [ ] 오프라인 감지 (`navigator.onLine`) + 온라인 복귀 시 last-write-wins 동기화

## 4단계: 배포 + 마무리

- [ ] PWA manifest + 아이콘
- [ ] Vercel 배포
- [ ] 실사용 시작

## 품질 / 기술 부채

- [ ] `useLinks` / `useFolders` 훅 단위테스트 (Supabase 마이그레이션 시 회귀 방지) — 58개 테스트 구현됨, Phase 3 마이그레이션 시 확장 필요
- [ ] 카테고리 뱃지 9개 색상 WCAG AA (4.5:1) 컨트라스트 검증 — Badge 구현 시점에 실행
- [ ] DESIGN.md 생성 (`/gstack-design-consultation`) — Phase 3 신규 화면(로그인, 설정) 추가 전

## 디자인 리뷰 후 추가 (2026-04-01)

- [ ] DESIGN.md 생성 — Phase 3 신규 화면 추가 전 `/gstack-design-consultation` 실행
- [ ] 카테고리 뱃지 WCAG AA 검증 — 9개 배지 색상 4.5:1 이상 확인
- [ ] 검색 Phase 1 이동 반영 ✅ — SearchOverlay 구현 완료

## 향후 (선택)

- [ ] Chrome/Firefox 북마크 HTML import (M노력, OG rate-limit 리스크 — Phase 2 안정화 후)
- [ ] 브라우저 확장 프로그램
- [ ] 링크 아카이빙 (스크린샷/페이지 캐시)
- [ ] 공유 기능
- [ ] AI 자동 분류 (실사용 후 필요성 확인 시 추가, OpenAI 무료 대안 검토)
