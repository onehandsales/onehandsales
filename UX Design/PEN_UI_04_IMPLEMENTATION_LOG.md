# PEN UI 04 Implementation Log

## 목적

이 문서는 `/Users/user/Sales_b2c/UX Design/onehand_sales.pen` 기준 CRM 리디자인 구현 과정을 추적하기 위한 작업 로그 문서다.

사용 목적:
- Codex / Claude / 사람 작업자가 번갈아 작업할 때 현재 상태를 공유한다.
- 어떤 결정을 이미 반영했는지 기록한다.
- 구현 범위, 남은 작업, 블로커를 빠르게 파악한다.
- PR/커밋/문서 변경 이력을 한 군데에서 따라갈 수 있게 한다.

관련 문서:
- [PEN_UI_01_FRONTEND_PLAN.md](</Users/user/Sales_b2c/UX Design/PEN_UI_01_FRONTEND_PLAN.md>)
- [PEN_UI_02_BACKEND_IMPACT.md](</Users/user/Sales_b2c/UX Design/PEN_UI_02_BACKEND_IMPACT.md>)
- [PEN_UI_03_COMMON_DECISIONS.md](</Users/user/Sales_b2c/UX Design/PEN_UI_03_COMMON_DECISIONS.md>)
- [PEN_UI_05_API_CHANGE_TRACKER.md](</Users/user/Sales_b2c/UX Design/PEN_UI_05_API_CHANGE_TRACKER.md>)

---

## 현재 목표

1차 목표:
- 디자인 토큰 정리
- 새 App Shell 구축
- Desktop Deal Pipeline Home 구현
- Mobile Deal Pipeline Home 구현
- Deal Quick Create Modal 구현
- Mobile Deal Detail Page 구현

---

## 현재 상태 요약

### 전체 진행 상태

- 상태: `핵심 도메인 UX 정리 진행 중`
- pen 분석: 완료
- 프론트 계획 문서: 완료
- 백엔드 영향 문서: 완료
- 공통 결정사항 문서: 완료
- API 변경 추적 문서: 완료
- 실제 UI 구현: 진행 중

### 현재 확정된 방향

- 1차 범위는 `딜 중심`
- UI는 신규 구조 병행 추가 후 교체
- 데이터 로직은 재사용 우선
- stage는 FE/BE 모두 6단계 계약으로 정리
- mobile / desktop 기준은 `768px`
- 토큰은 `CSS 변수 + Tailwind semantic mapping` 병행
- `/` 홈은 현재 `화면 준비중입니다` 준비 상태로 두고, 딜 파이프라인은 `/deals`에서 운영
- 회사/거래처/제품 목록은 제품형 `Controls Bar + Table Card + Pagination` 문법을 기준으로 맞춤
- 목록 페이지네이션은 `totalPages` 기준이며 `hasNext`는 상세 메모 로그 같은 cursor flow에만 사용

---

## 작업 로그 규칙

각 로그는 아래 형식을 따른다.

```md
### YYYY-MM-DD HH:mm KST

- 작업자:
- 유형:
  - analysis / design / frontend / backend / docs / review
- 요약:
- 변경 파일:
  - ...
- 결정/반영 내용:
  - ...
- 남은 이슈:
  - ...
- 다음 작업:
  - ...
```

---

## 작업 로그

### 2026-06-11 초기 문서화

- 작업자: Codex
- 유형:
  - docs
  - analysis
- 요약:
  - pen 파일 구조를 확인했다.
  - 프론트 계획 문서, 백엔드 영향 문서, 공통 결정사항 문서를 작성했다.
  - BE 계약 추적을 위한 API 변경 추적 문서를 준비했다.
- 변경 파일:
  - `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
  - `UX Design/PEN_UI_02_BACKEND_IMPACT.md`
  - `UX Design/PEN_UI_03_COMMON_DECISIONS.md`
  - `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`
  - `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`
- 결정/반영 내용:
  - 1차 범위는 딜 중심으로 제한
  - App Shell은 신규 구조 병행 후 교체
  - BE stage 6단계 확장은 별도 결정 필요
- 남은 이슈:
  - 실제 UI 구현 시작 전, shell/tokens/component 구조 세부 설계 필요
  - API 변경 여부는 아직 미확정
- 다음 작업:
  - 새 shell/navigation 구조 구현 착수

### 2026-06-11 auth 흐름 정리

- 작업자: Codex
- 유형:
  - frontend
  - docs
- 요약:
  - `/login`을 pen 스타일 랜딩 + 로그인 모달 구조로 재구성했다.
  - auth 흐름을 `provider login -> Supabase access token -> /api/auth/exchange -> app access token`으로 정리했다.
  - mock fallback을 유지하되 개발 세션이 실제로 보호 라우트로 진입하도록 복구했다.
- 변경 파일:
  - `FE/user-web/src/pages/login/index.tsx`
  - `FE/user-web/src/features/auth/auth-provider.tsx`
  - `FE/user-web/src/features/auth/auth-service.ts`
  - `FE/user-web/src/features/auth/components/auth-landing-page.tsx`
  - `FE/user-web/src/features/auth/components/auth-login-modal.tsx`
  - `FE/user-web/README.md`
- 결정/반영 내용:
  - `/login`은 로그인 여부와 무관하게 랜딩을 보여준다.
  - `/auth/callback`에서만 Supabase 세션 exchange를 수행한다.
  - provider 목록 실패 시 fallback provider 버튼을 보여준다.
  - mock login은 개발 흐름을 끊지 않는 보조 경로로 유지한다.
- 남은 이슈:
  - 실제 Supabase provider env 연결은 별도 설정 필요
  - desktop auth screen은 pen 기준으로 추가 미세조정 가능
- 다음 작업:
  - company 화면 작업으로 이동

### 2026-06-12 20:20 KST

- 작업자: Codex
- 유형:
  - frontend
  - docs
- 요약:
  - User Web 회사 목록/상세/생성 화면을 새 Company API 계약 기준으로 재구현했다.
  - 회사 분야/지역 생성/삭제 UI, 연결 거래처 요약, 일반 메모 로그, 개인 비밀 메모 로그, XLSX 내보내기를 추가했다.
  - response body 없는 `201`/`204` 성공 응답과 blob 다운로드를 공통 API client에서 처리하도록 보강했다.
- 변경 파일:
  - `FE/user-web/src/lib/api-client.ts`
  - `FE/user-web/src/features/company/**/*`
  - `FE/user-web/src/features/contact/**/*`
  - `FE/user-web/src/features/deal/hooks/use-deal-entity-options.ts`
  - `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
  - `FE/user-web/src/features/schedule/hooks/use-schedule-entity-options.ts`
  - `FE/user-web/src/features/product/hooks/use-product-target-options.ts`
  - `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/G01-FE-COMPANY-PAGES.goal.md`
  - `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/README.md`
- 결정/반영 내용:
  - 회사 목록은 `companyName`, `companyFieldId`, `companyRegionId`, `page`만 사용한다.
  - 회사 생성의 `companyMemo`는 첫 회사 메모 로그로 저장되는 선택 입력으로 표시한다.
  - 회사 목록/상세에는 딜 수를 표시하지 않고, 목록에는 `updatedAt`을 표시하지 않는다.
  - 딜 생성 모달의 회사 inline create는 새 필수 분야/지역 입력이 없어 회사 화면 등록 안내로 축소했다.
- 검증:
  - `pnpm --dir FE/user-web run typecheck`: 통과
  - `pnpm --dir FE/user-web run lint`: 통과
  - `pnpm --dir FE/user-web run build`: 통과
  - Node engine warning: 로컬 `v20.20.2`, 프로젝트 요구사항 `>=24 <25`
- 남은 이슈:
  - 인증 세션과 테스트 데이터가 준비된 상태의 브라우저 수동 검증은 별도 실행 필요
  - Vite build에서 500kB 초과 chunk warning이 기존 번들 크기로 표시됨
- 다음 작업:
  - 실제 BE 세션/데이터로 회사 생성, 상세, 메모 수정, 내보내기 수동 smoke 확인

### 2026-06-12 공통 Modal/State UI 기준 정리

- 작업자: Codex
- 유형:
  - frontend
  - docs
- 요약:
  - pen 기준 빠른등록 Modal을 기준으로 공통 `ModalShell` 문법을 추가했다.
  - 로그인 모달, 딜 빠른등록 모달, company/contact/product 생성 모달을 공통 shell 기반으로 전환했다.
  - 도메인 공용 상태 UI로 `LoadingState`, `EmptyState`, `ErrorState`, `SuccessToast`를 추가했다.
- 변경 파일:
  - `FE/user-web/src/components/ui/modal-shell.tsx`
  - `FE/user-web/src/components/ui/state.tsx`
  - `FE/user-web/src/features/auth/components/auth-login-modal.tsx`
  - `FE/user-web/src/features/auth/components/auth-landing-page.tsx`
  - `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
  - `FE/user-web/src/features/company/components/company-create-dialog.tsx`
  - `FE/user-web/src/features/contact/components/contact-create-dialog.tsx`
  - `FE/user-web/src/features/product/components/product-create-dialog.tsx`
  - `FE/user-web/src/components/ui/README.md`
- 결정/반영 내용:
  - modal footer submit은 form body와 `form` 속성으로 연결한다.
  - 공통 modal은 overlay, close button, header, scroll body, footer를 소유한다.
  - 성공 피드백은 `SuccessToast`로 고정하고 company 화면 notice에 먼저 적용했다.
- 검증:
  - `pnpm --dir FE/user-web run typecheck`: 통과
  - `pnpm --dir FE/user-web run lint`: 통과
  - `pnpm --dir FE/user-web run build`: 통과
- 남은 이슈:
  - Loading/Empty/Error 상태는 아직 전체 도메인 화면에 일괄 치환하지 않았다.
  - 실제 브라우저에서 modal focus trap과 ESC close는 별도 UX 보강 대상이다.
- 다음 작업:
  - company/contact/product 생성 폼 내부 레이아웃을 Quick Create 기준 field group 문법으로 더 정리

---

### 2026-06-12 Quick Create 내부 폼 문법 정리

- 작업자: Codex
- 유형:
  - frontend
  - docs
- 요약:
  - pen 빠른등록 모달 구조를 기준으로 Quick Create 계열 모달의 내부 폼 문법을 `modal-form.tsx`로 분리했다.
  - field group, section header, form row, inline create trigger area, modal footer action area, advanced section, helper/error text area를 공용 단위로 정리했다.
  - 딜 빠른등록과 company/contact/product 생성 모달에 같은 내부 visual grammar를 적용했다.
- 변경 파일:
  - `FE/user-web/src/components/ui/modal-form.tsx`
  - `FE/user-web/src/components/ui/README.md`
  - `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
  - `FE/user-web/src/features/company/components/company-create-dialog.tsx`
  - `FE/user-web/src/features/contact/components/contact-create-dialog.tsx`
  - `FE/user-web/src/features/product/components/product-create-dialog.tsx`
- 결정/반영 내용:
  - `ModalFormSection` + `ModalSectionHeader`로 모달 내부 섹션 타이틀/설명 문법을 고정했다.
  - `ModalFormRow`로 desktop 2/3열, mobile 1열 반응형 form row를 통일했다.
  - `ModalFieldGroup`으로 label, helper, error text 위치를 통일했다.
  - `ModalInlineCreateArea`로 딜 빠른등록의 인라인 거래처/제품 생성 trigger area를 공용화했다.
  - `ModalAdvancedSection`으로 딜 고급 옵션 접힘 영역을 분리했다.
  - `ModalFooterActions`로 company/contact/product 생성 모달까지 같은 footer action 문법을 사용하게 했다.
- 적용 범위:
  - Deal Quick Create: 기본 정보, 연결 대상, 진행 상태, 고급 옵션, 인라인 거래처/제품 생성 영역에 적용
  - Company Create: 기본 정보, 첫 메모, footer action에 적용
  - Contact Create: 기본 정보, 상세 정보, 첫 메모, footer action에 적용
  - Product Create: 기본 정보, 설명, 첫 메모, footer action에 적용
- 검증:
  - `pnpm --dir FE/user-web run typecheck`: 통과
  - `pnpm --dir FE/user-web run lint`: 통과
  - `pnpm --dir FE/user-web run build`: 통과
  - `git diff --check`: 통과
- 남은 이슈:
  - 거래처 생성 모달의 회사 검색 필드는 자체 컴포넌트(`ContactCompanyField`) 구조를 유지했다.
  - 실제 브라우저 기준 modal focus trap과 ESC close는 아직 별도 UX 보강 대상이다.

---

### 2026-06-13 Desktop Deal Pipeline Home pen 기준 재구성

- 작업자: Claude Sonnet 4.6
- 유형:
  - frontend
- 요약:
  - pen의 Desktop Deal Pipeline Home을 기준으로 딜 목록을 리스트 카드에서 테이블 행 구조로 전환했다.
  - Stage Tabs를 border-bottom 기반 탭으로 교체하고 각 탭에 건수 뱃지를 붙였다.
  - DealListRow를 pen 기준 6컬럼(딜명/회사담당자/단계/금액/다음행동/마감일) 테이블 행으로 재구성했다.
  - 우측 상세 패널은 기존 DealDetailPanel을 그대로 재사용하고 "전체 상세 열기" 링크를 패널 하단에 배치했다.
  - AppShell을 DesktopAppShell과 통합해 라우터에서 단일 AppShell로 관리하도록 변경했다.
  - 홈 경로(`/`)에서만 main을 full-height flex로 전환하고 나머지 경로는 기존 px-8 py-8 유지.
- 변경 파일:
  - `FE/user-web/src/features/deal-redesign/screens/deal-pipeline-home.tsx`
  - `FE/user-web/src/features/deal-redesign/components/deal-list-row.tsx`
  - `FE/user-web/src/components/layout/app-shell.tsx`
  - `FE/user-web/src/components/shell/desktop-app-shell.tsx`
- 결정/반영 내용:
  - Deal stage는 현재 백엔드 4단계(INITIAL_CONTACT/IN_DISCUSSION/WON/LOST)를 그대로 유지. pen 6단계 확장은 별도 결정 필요.
  - DealListRow에서 단계 변경 select는 제거. 단계 변경은 우측 패널에서만 수행.
- 검증:
  - `pnpm --dir FE/user-web run typecheck`: 통과
  - `pnpm --dir FE/user-web run lint`: 에러 없음 (warning 1건 — fast refresh)
  - `pnpm --dir FE/user-web run build`: 통과
- 남은 이슈:
  - pen Stage Tab은 6단계(초기접촉/니즈확인/제안견적/협상/성사/실패). 현재 코드는 4단계.
  - 테이블 위 컨트롤바 FilterChip(정렬/금액/마감일)은 미구현.
  - 브라우저 실제 세션 smoke 확인 필요.

---

### 2026-06-13 DealStage 6단계 확장 (FE 전체)

- 작업자: Claude Sonnet 4.6
- 유형:
  - frontend
- 요약:
  - `IN_DISCUSSION` 제거, `NEEDS_ANALYSIS` / `PROPOSAL` / `NEGOTIATION` 추가 → FE 기준 6단계로 확장.
  - types, schema, utils, 모든 select/option, stageTabs, badge 전체 일괄 교체.
  - `DealStageSummary`를 `Partial<Record<DealStage, number>>`로 변경해 응답 부분 매핑 안전 처리.
  - WON → "성사", LOST → "실패" (기존 수주/실주에서 변경).
- 변경 파일:
  - `FE/user-web/src/features/deal/types/deal.ts`
  - `FE/user-web/src/features/deal/schemas/deal-schema.ts`
  - `FE/user-web/src/features/deal/utils/deal-display.ts`
  - `FE/user-web/src/features/deal-redesign/components/stage-badge.tsx`
  - `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
  - `FE/user-web/src/features/deal/components/deal-detail-panel.tsx`
  - `FE/user-web/src/features/deal/components/deal-list-screen.tsx`
  - `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`
  - `FE/user-web/src/features/deal-redesign/screens/mobile-deal-detail-page.tsx`
  - `FE/user-web/src/features/import-export/schemas/import-export-schema.ts`
- 결정/반영 내용:
  - FE는 6단계로 완전 전환. BE enum 변경은 별도 작업으로 진행 예정.
  - `emptyStageSummary = {}`, `getStageCount`는 `Object.values(summary).reduce`로 교체.
- 검증:
  - `pnpm --dir FE/user-web run typecheck`: 통과
- 남은 이슈:
  - 백엔드 DealStage enum은 아직 4단계. BE Prisma schema + migration 별도 필요.

---

### 2026-06-13 Sidebar & TopBar pen 기준 반영

- 작업자: Claude Sonnet 4.6
- 유형:
  - frontend
  - design
- 요약:
  - pen Sidebar (node: NB6r5), TopBar (node: R5ECb) 스펙 기준으로 전면 교체.
  - Sidebar에 3그룹 레이블 구조(주요 메뉴/업무/관리) 및 pen 활성/비활성 색상 토큰 적용.
  - TopBar에서 SearchBar를 타이틀 바로 우측으로 이동하고 버튼 배치/크기/스타일 pen 기준으로 정정.
- 변경 파일:
  - `FE/user-web/src/components/navigation/sidebar-nav.tsx`
  - `FE/user-web/src/components/layout/app-shell.tsx`
  - `FE/user-web/src/components/shell/desktop-app-shell.tsx`
- 결정/반영 내용:
  - Sidebar 활성 아이템: `border-[#2563EB30] bg-[#1D4ED822]`, 텍스트 `#BFDBFE`, 아이콘 `#93C5FD`.
  - Sidebar 비활성 아이템: `border-transparent`, 텍스트 `#A1A1AA`, 아이콘 `#71717A`.
  - TopBar 타이틀 18px `#111827` bold, 서브타이틀 11px `#6B7280`.
  - SearchBar(320px)는 타이틀 바로 우측. flex spacer → 오른쪽 버튼 그룹.
  - 새 딜: h-9, `#1D4ED8` bg. 내보내기: h-9, white + `#E5E7EB` border + Download 아이콘.
  - Bell: bare 20px, 박스 제거. Avatar: 32px 원형 `#2563EB`.
  - 사이드바 "거래처" 항목명 유지, 아이콘 `IdCard`.
- 검증:
  - `pnpm --dir FE/user-web run typecheck`: 통과

---

### 2026-06-15 목록 UX와 필터 계약 정리

- 작업자: Codex
- 유형:
  - frontend
  - docs
- 요약:
  - `/` 홈을 `화면 준비중입니다` 준비 상태로 전환했다.
  - Sidebar에서 후순위 기능인 `IMPORT`, `휴지통`을 숨김 처리했다.
  - 공용 `Pagination`을 `totalPages` 전용으로 정리하고 딜/제품/회사/거래처/회의록 목록 UX는 page-number pagination 기준으로 맞췄다.
  - 회사/거래처 목록을 제품형 `Controls Bar + Table Card + Pagination` 문법으로 정리했다.
  - 회사 목록에서 분야/지역 생성·삭제 관리 패널을 제거하고 `분야 ▾`, `지역 ▾` select 필터만 남겼다.
  - 거래처 목록에서 부서/직급 생성·삭제 관리 패널을 제거하고 `부서 ▾`, `직급 ▾` select 필터만 남겼다.
- 변경 파일:
  - `FE/user-web/src/pages/home/index.tsx`
  - `FE/user-web/src/components/layout/app-shell.tsx`
  - `FE/user-web/src/components/navigation/sidebar-nav.tsx`
  - `FE/user-web/src/components/ui/pagination.tsx`
  - `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`
  - `FE/user-web/src/features/company/components/company-list-screen.tsx`
  - `FE/user-web/src/features/contact/components/contact-list-screen.tsx`
  - `FE/user-web/src/features/product/components/product-list-screen.tsx`
  - `FE/user-web/src/features/meeting-note/components/meeting-note-list-screen.tsx`
- 결정/반영 내용:
  - 목록 페이지에서는 `hasNext`를 사용하지 않는다.
  - `hasNext`는 회사/거래처/제품 상세 메모 로그처럼 cursor 기반 incremental loading에서만 사용한다.
  - 회사 분야/지역, 거래처 부서/직급 옵션은 제품 카테고리/상태처럼 전체 옵션 API를 초회 조회한 select 필터로 사용한다.
  - 목록 페이지에서는 옵션 생성/삭제 UX를 제공하지 않는다. 해당 관리는 상세/설정/관리 화면에서 다룬다.
- 검증:
  - `pnpm.cmd --dir FE\user-web run typecheck`: 통과
  - `pnpm.cmd --dir FE\user-web run lint`: 통과
  - `pnpm.cmd --dir FE\user-web run build`: 통과
  - 기존 경고: Node engine/Vite Node 권장 버전, `toast.tsx` fast-refresh warning, 번들 크기 warning
- 남은 이슈:
  - 목록 컨트롤 버튼의 공통 `Button`/control button 공통화 후보가 남아 있다.
  - `/` 홈의 최종 구성은 핵심 도메인 UX 안정화 이후 재개한다.

---

## 현재 구현 체크리스트

### 문서

- [x] Frontend Plan
- [x] Backend Impact
- [x] Common Decisions
- [x] Implementation Log
- [x] API Change Tracker

### 프론트

- [ ] 디자인 토큰 정의
- [x] Desktop App Shell — Sidebar 3그룹 + pen 색상 토큰, TopBar SearchBar 위치/버튼 pen 기준 전환 완료
- [x] Mobile App Shell (MobileAppHeader + BottomTabBar)
- [x] Modal Shell (`modal-shell.tsx`, `modal-form.tsx`)
- [x] Toast 구조 (`SuccessToast` in `state.tsx`)
- [x] StageBadge (`stage-badge.tsx`) — 6단계 반영 완료
- [x] FilterChip (`filter-chip.tsx`)
- [x] MobileDealCard (`mobile-deal-card.tsx`)
- [x] DealListRow — pen 기준 6컬럼 테이블 행 + 6단계 완료
- [x] Desktop Deal Pipeline Home — 테이블 + 우측 패널 구조 + 6단계 Stage Tabs 완료
- [x] Mobile Deal Pipeline Home
- [x] Deal Quick Create Modal (`deal-create-dialog.tsx` + ModalShell) — 6단계 반영 완료
- [x] Mobile Deal Detail Page (`mobile-deal-detail-page.tsx`) — 6단계 반영 완료
- [x] DealStage 6단계 FE/BE 계약 반영 완료
- [x] Company/Contact/Product 제품형 목록 문법 정리
- [x] Page-number 목록 pagination `totalPages` 기준 정리
- [ ] 목록 컨트롤 버튼 공통화

### 백엔드 / 계약

- [x] deal stage 전략 확정 — FE/BE 6단계 계약 반영 완료
- [ ] mobile home aggregate API 필요 여부 확정
- [ ] quick create inline 생성 범위 확정
- [ ] navigation badge count 필요 여부 확정

---

## 현재 블로커

- `/` 홈 최종 구성은 보류 중이다. 현재는 `화면 준비중입니다`를 표시한다.
- Quick Create modal의 inline entity create 범위 미확정
- 목록 컨트롤 버튼 공통화 미완료

---

## 다음 작업 우선순위

1. 회사/거래처/제품/딜 목록 컨트롤 버튼 공통화
2. `/` 홈 최종 구성 재개 여부 결정
3. 브라우저 실제 세션 smoke 확인 (딜/회사/거래처/제품/회의록 목록과 상세)
