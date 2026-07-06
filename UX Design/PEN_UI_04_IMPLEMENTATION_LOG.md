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
- [PEN_UI_02_BdCKEND_IMPdCT.md](</Users/user/Sales_b2c/UX Design/PEN_UI_02_BdCKEND_IMPdCT.md>)
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
- `/` 홈은 Schedule/Deal/MeetingNote API 조합 기반 대시보드로 운영
- 딜 파이프라인은 `/deals`에서 운영
- 회사/담당자/제품 목록은 제품형 `Controls Bar + Table Card + Pagination` 문법을 기준으로 맞춤
- 회사/담당자/제품 생성 모달의 연결/분류 선택은 검색 입력형 필드와 결과 없음 즉시 추가 흐름으로 맞춤
- 목록 페이지네이션은 10개 단위 `totalPages` 기준이며 `hasNext`는 상세 메모 로그 같은 cursor flow에만 사용
- 목록 정렬은 select를 기본 문법으로 사용한다. 딜 목록은 `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`을 제공한다.
- 통합검색은 `GET /api/search`와 User Web `GlobalSearch` 연결 기준으로 본다.
- MeetingNote AI/STT 초안 endpoint와 User Web draft UI 연결은 구현 완료 상태다.
- MeetingNote 작성 UX는 직접 작성/저장을 기본 흐름으로 유지하고, AI/STT는 `AI로 정리`, `음성으로 작성` 보조 액션으로 연결한다.
- MeetingNote 저장 후 딜 추가 연동 endpoint와 User Web 상세 카드 연결은 구현 완료 상태다. 활동 로그는 현재 딜 상세가 사용하는 `DealFollowingActionLog`를 재사용한다.

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

### 2026-06-19 회의록 저장 후 딜 연동 구현

- 작업자: Codex
- 유형:
  - backend
  - frontend
  - docs
- 요약:
  - 저장된 회의록에 딜을 추가 연결하는 API와 User Web 상세 화면 연동 카드를 구현했다.
  - 신규 연결 딜마다 `MeetingNoteDeal` snapshot row를 추가하고, 딜 상세 활동 로그에 회의록 링크/요약을 남기도록 연결했다.
  - 현재 별도 `DealActivity` table이 없으므로 기존 `DealFollowingActionLog`를 재사용하는 방식으로 계약을 확정했다.
- 변경 파일:
  - `BE/src/modules/meeting-note/**/*`
  - `FE/user-web/src/features/meeting-note/**/*`
  - `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
  - `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
  - `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
  - `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`
- 결정/반영 내용:
  - `POST /api/meeting-notes/:meetingNoteId/deals`를 추가했다.
  - 이미 연결된 딜은 중복 연결하지 않는다.
  - 연결 성공 후 회의록 상세와 해당 딜 상세/활동 로그 cache를 무효화한다.
- 남은 이슈:
  - 범용 `DealActivity` table과 activity type 관리는 후속 확장이다.
- 다음 작업:
  - 실제 로그인 세션과 샘플 딜 데이터로 브라우저 smoke를 수행한다.

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
  - `UX Design/PEN_UI_02_BdCKEND_IMPdCT.md`
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
  - 회사 분야/지역 생성/삭제 UI, 연결 담당자 요약, 일반 메모 로그, 개인 비밀 메모 로그, XLSX 내보내기를 추가했다.
  - response body 없는 `201`/`204` 성공 응답과 blob 다운로드를 공통 API client에서 처리하도록 보강했다.
- 변경 파일:
  - `FE/user-web/src/lib/api-client.ts`
  - `FE/user-web/src/features/company/**/*`
  - `FE/user-web/src/features/contact/**/*`
  - `FE/user-web/src/features/deal/hooks/use-deal-entity-options.ts`
  - `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
  - `FE/user-web/src/features/schedule/hooks/use-schedule-entity-options.ts`
  - `FE/user-web/src/features/product/hooks/use-product-target-options.ts`
  - `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/G01-FE-COMPANY-PdGES.goal.md`
  - `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/README.md`
- 결정/반영 내용:
  - 회사 목록은 `companyName`, `companyFieldId`, `companyRegionId`, `page`만 사용한다.
  - 회사 생성의 `companyMemo`는 첫 회사 메모 로그로 저장되는 선택 입력으로 표시한다.
  - 회사 목록/상세에는 딜 수를 표시하지 않고, 목록에는 `updateddt`을 표시하지 않는다.
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
  - `ModalInlineCreateArea`로 딜 빠른등록의 인라인 담당자/제품 생성 trigger area를 공용화했다.
  - `ModalAdvancedSection`으로 딜 고급 옵션 접힘 영역을 분리했다.
  - `ModalFooterActions`로 company/contact/product 생성 모달까지 같은 footer action 문법을 사용하게 했다.
- 적용 범위:
  - Deal Quick Create: 기본 정보, 연결 대상, 진행 상태, 고급 옵션, 인라인 담당자/제품 생성 영역에 적용
  - Company Create: 기본 정보, 첫 메모, footer action에 적용
  - Contact Create: 기본 정보, 상세 정보, 첫 메모, footer action에 적용
  - Product Create: 기본 정보, 설명, 첫 메모, footer action에 적용
- 검증:
  - `pnpm --dir FE/user-web run typecheck`: 통과
  - `pnpm --dir FE/user-web run lint`: 통과
  - `pnpm --dir FE/user-web run build`: 통과
  - `git diff --check`: 통과
- 남은 이슈:
  - 담당자 생성 모달의 회사 검색 필드는 자체 컴포넌트(`ContactCompanyField`) 구조를 유지했다.
  - 실제 브라우저 기준 modal focus trap과 ESC close는 아직 별도 UX 보강 대상이다.

---

### 2026-06-13 Desktop Deal Pipeline Home pen 기준 재구성

- 작업자: Claude Sonnet 4.6
- 유형:
  - frontend
- 요약:
  - pen의 Desktop Deal Pipeline Home을 기준으로 딜 목록을 리스트 카드에서 테이블 행 구조로 전환했다.
  - Stage Tabs를 border-bottom 기반 탭으로 교체하고 각 탭에 건수 뱃지를 붙였다.
  - DealListRow를 pen 기준 6컬럼(딜이름/회사담당자/단계/금액/다음행동/마감일) 테이블 행으로 재구성했다.
  - 우측 상세 패널은 기존 DealDetailPanel을 그대로 재사용하고 "전체 상세 열기" 링크를 패널 하단에 배치했다.
  - AppShell을 DesktopAppShell과 통합해 라우터에서 단일 AppShell로 관리하도록 변경했다.
  - 홈 경로(`/`)에서만 main을 full-height flex로 전환하고 나머지 경로는 기존 px-8 py-8 유지.
- 변경 파일:
  - `FE/user-web/src/features/deal-redesign/screens/deal-pipeline-home.tsx`
  - `FE/user-web/src/features/deal-redesign/components/deal-list-row.tsx`
  - `FE/user-web/src/components/layout/app-shell.tsx`
  - `FE/user-web/src/components/shell/desktop-app-shell.tsx`
- 결정/반영 내용:
  - Deal stage는 현재 백엔드 4단계(INITIdL_CONTdCT/IN_DISCUSSION/WON/LOST)를 그대로 유지. pen 6단계 확장은 별도 결정 필요.
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
  - Sidebar 활성 아이템: `border-[#4880EE30] bg-[#1D4ED822]`, 텍스트 `#BFDBFE`, 아이콘 `#93C5FD`.
  - Sidebar 비활성 아이템: `border-transparent`, 텍스트 `#A1A1AA`, 아이콘 `#71717A`.
  - TopBar 타이틀 18px `#111827` bold, 서브타이틀 11px `#6B7280`.
  - SearchBar(320px)는 타이틀 바로 우측. flex spacer → 오른쪽 버튼 그룹.
  - 새 딜: h-9, `#1D4ED8` bg. 내보내기: h-9, white + `#E5E7EB` border + Download 아이콘.
  - Bell: bare 20px, 박스 제거. Avatar: 32px 원형 `#4880EE`.
  - 사이드바 "담당자" 항목명 유지, 아이콘 `IdCard`.
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
  - 공용 `Pagination`을 `totalPages` 전용으로 정리하고 딜/제품/회사/담당자/회의록 목록 UX는 10개 단위 page-number pagination 기준으로 맞췄다.
  - 회사/담당자 목록을 제품형 `Controls Bar + Table Card + Pagination` 문법으로 정리했다.
  - 회사 목록에서 별도 분야/지역 관리 패널을 제거하고 `분야`, `지역` select 필터로 통합했다.
  - 담당자 목록에서 별도 부서/직급 관리 패널을 제거하고 `부서`, `직급` select 필터로 통합했다.
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
  - `hasNext`는 회사/담당자/제품 상세 메모 로그처럼 cursor 기반 incremental loading에서만 사용한다.
  - 회사 분야/지역, 담당자 부서/직급 옵션은 제품 카테고리/상태처럼 전체 옵션 API를 초회 조회한 select 필터로 사용한다.
  - 이후 현재 기준에서는 회사/담당자/제품 select 안의 `+ 추가`로 분류 관리 다이얼로그를 열어 옵션을 추가/삭제한다.
- 검증:
  - `pnpm.cmd --dir FE\user-web run typecheck`: 통과
  - `pnpm.cmd --dir FE\user-web run lint`: 통과
  - `pnpm.cmd --dir FE\user-web run build`: 통과
  - 기존 경고: Node engine/Vite Node 권장 버전, `toast.tsx` fast-refresh warning, 번들 크기 warning
- 남은 이슈:
  - 목록 컨트롤 버튼의 공통 `Button`/control button 공통화 후보가 남아 있다.
  - `/` 홈의 최종 구성은 핵심 도메인 UX 안정화 이후 재개한다.

---

### 2026-06-16 현재 FE/BE 기준 문서 정정

- 작업자: Codex
- 유형:
  - frontend
  - backend
  - docs
- 요약:
  - `BE/src/modules`, `BE/prisma/schema.prisma`, `FE/user-web/src/app/router/router.tsx`, `FE/user-web/src/features` 기준으로 UX 문서와 AGENT 문서를 재검토했다.
  - `/` 홈은 더 이상 준비중 화면이 아니라 Schedule/Deal/MeetingNote API를 조합한 실제 대시보드 화면임을 반영했다.
  - 딜 목록 정렬 UI는 chip이 아니라 select이며 `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`을 제공하도록 정정했다.
  - 담당자 목록 정렬은 `최신순`, `이름순` select 계약으로 정정했다.
  - 당시 기준의 부가 기능 미구현 목록을 재검토했다. 이후 2026-07-03 기준 BusinessCard, DataImport, Trash는 구현 완료 상태로 재정정한다. Notification, Admin 운영 조회 API, ImportJob 영속화/재개, 범용 ExportJob은 후속/비정본이다.
- 결정/반영 내용:
  - 당시 기준선은 2026-06-16 FE+BE 코드다. 최신 구현 판단은 2026-07-03 FE+BE 기준선 섹션을 우선한다.
  - 과거 2026-06-11~2026-06-15 계획/로그 항목은 역사 기록으로 남기되, 실제 구현 판단은 최신 현재 기준선 섹션을 우선한다.
  - User Web 핵심 도메인은 Auth/User, Home, Company, Contact, Product, Deal, Schedule, MeetingNote까지 실제 API 연동 완료 상태로 본다.
- 남은 이슈:
  - Admin Web 운영 조회 API는 `/admin/api/me` 외 미구현이다.
  - Notification, Admin 운영 조회 API, ImportJob 영속화/재개는 Backend 구현 계획이 필요하다. 범용 ExportJob은 비정본이며, BusinessCard, DataImport, Trash와 도메인별 xlsx export는 현재 구현 완료 상태다.

---

### 2026-06-16 목록 필터와 레이아웃 기준 정정

- 작업자: Codex
- 유형:
  - frontend
  - backend
  - docs
- 요약:
  - 딜 목록 control을 `딜이름 검색`, `전체`, `회사`, `담당자`, 정렬 select 순서로 정리했다.
  - 딜 목록, stage counts, export가 `search`, `companyId`, `contactId` 필터를 공유하는 현재 API 계약을 문서에 반영했다.
  - 회사/담당자/제품 목록 필터 select의 `+ 추가` 분류 관리 흐름을 현재 기준으로 정정했다.
  - 제품 목록 정렬 라벨을 `딜 높은순`, `딜 낮은순` 기준으로 정리하고, API code는 `dealCountDesc`, `dealCountAsc`를 기준으로 명시했다.
  - 회사/담당자/제품/딜/회의록 목록 pagination은 공용 `Pagination` 48px(`h-12`), 미리보기 header와 table header는 44px(`h-11`) 기준으로 맞춘 상태를 문서에 반영했다.
- 변경 파일:
  - `UX Design/FE_DOMAIN_COMPLETION_STdTUS.md`
  - `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
  - `UX Design/PEN_UI_02_BdCKEND_IMPdCT.md`
  - `UX Design/PEN_UI_03_COMMON_DECISIONS.md`
  - `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`
  - `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`
  - `UX Design/PEN_UI_06_SHdRED_FIRST_WORK_ORDER.md`
  - `AGENT/**`
  - `TODO/**`
- 결정/반영 내용:
  - 딜 stage count는 stage tab 자체와 독립적으로 검색/회사/담당자 필터 결과 수를 표시한다.
  - `GET /api/deals/contact-options` 응답의 `companyId`를 이용해 FE에서 회사 선택 시 담당자 목록을 좁힌다.
  - 분류 select의 `+ 추가`는 목록 페이지 안에서 옵션 생성/삭제를 관리하는 현재 UX로 본다.
- 남은 이슈:
  - 목록 control button/select를 코드 수준에서 공용 컴포넌트로 더 묶을지 결정이 필요하다.

---

### 2026-06-19 생성 모달 입력 검색형 inline create 반영

- 작업자: Codex
- 유형:
  - frontend
  - docs
- 요약:
  - 회사/담당자/제품 생성 모달의 연결/분류 선택을 딜 추가 모달과 같은 입력 검색형 UX로 맞췄다.
  - 회사 추가 모달의 분야/지역, 담당자 추가 모달의 부서/직급, 제품 추가 모달의 카테고리/상태는 검색 결과가 없으면 현재 입력값으로 바로 추가하고 자동 선택한다.
  - 담당자 추가 모달의 회사 검색 결과가 없으면 회사 생성 모달을 열고, 생성 후 회사 옵션을 다시 조회해 자동 선택한다.
  - Search와 MeetingNote AI/STT의 현재 코드 상태를 문서 기준선에 반영한다.
- 변경 파일:
  - `FE/user-web/src/components/ui/managed-taxonomy-dropdown.tsx`
  - `FE/user-web/src/features/company/components/company-create-dialog.tsx`
  - `FE/user-web/src/features/contact/components/contact-company-field.tsx`
  - `FE/user-web/src/features/contact/components/contact-create-dialog.tsx`
  - `FE/user-web/src/features/product/components/product-create-dialog.tsx`
  - `TODO_LOG/2026-06-19/INLINE_CREATE_SEARCH_FIELDS/WORK_LOG.md`
  - `UX Design/**`
  - `AGENT/UXUI_AGENT/DECISIONS/008_uxui_inline_entity_creation.md`
- 결정/반영 내용:
  - quick create inline 생성 범위는 딜 추가와 핵심 생성 모달의 연결/분류 선택까지 포함한다.
  - 별도 quick create candidate search endpoint는 현재 필수 요구가 아니며, 기존 옵션 조회/생성 API와 refetch 조합을 baseline으로 둔다.
  - Search는 Backend `search` module과 User Web `GlobalSearch` 연결 상태로 본다.
  - MeetingNote AI/STT는 당시 Backend endpoint 구현, FE draft UI 후속 상태로 보았고, 이후 2026-06-19 User Web 연결 작업에서 완료했다.
- 검증:
  - `pnpm --dir FE/user-web exec eslint src/components/ui/managed-taxonomy-dropdown.tsx src/features/company/components/company-create-dialog.tsx src/features/contact/components/contact-company-field.tsx src/features/contact/components/contact-create-dialog.tsx src/features/product/components/product-create-dialog.tsx`
  - `pnpm --dir FE/user-web typecheck`
  - `git diff --check`
- 남은 이슈:
  - 실제 브라우저 세션에서 생성 모달별 검색/추가/자동선택 smoke 확인 필요
  - 목록 control button/select 공통화 후보가 남아 있다.

---

### 2026-06-19 MeetingNote AI/STT 사용자 플로우 동기화

- 작업자: Codex
- 유형:
  - docs
  - planning
- 요약:
  - 회의록 작성 화면의 기본 흐름을 `직접 작성 후 저장`으로 확정하고, AI/STT는 선택 보조 액션으로 문서화했다.
  - 텍스트 AI는 `AI로 정리`, STT+AI는 `음성으로 작성` 버튼으로 form field를 채우되 자동 저장하지 않는 흐름으로 정리했다.
  - 저장 후 `영업 딜과 연동`은 회의록 상세의 별도 액션으로 분리했다.
- 변경 파일:
  - `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/USER-FLOW.md`
  - `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
  - `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/GOAL-SPECS/G02-FE-MEETING-NOTE-AI-STT-DRAFT.md`
  - `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/FE-TODO/G02-FE-MEETING-NOTE-AI-STT-DRAFT.goal.md`
  - `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
  - `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
  - `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
  - `AGENT/PM_AGENT/PLANNING/SERVICE_OVERVIEW.md`
  - `AGENT/PM_AGENT/PLANNING/PRD.md`
  - `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
  - `UX Design/**`
- 결정/반영 내용:
  - 직접 작성 저장은 `sourceType: MANUAL`이며 AI/STT draft API를 호출하지 않는다.
  - AI/STT 초안 저장은 최종 `POST /api/meeting-notes`에 `TEXT_AI` 또는 `STT_AI` sourceType을 전달한다.
  - User Web `CreateMeetingNoteInput` 확장은 이후 2026-06-19 User Web 연결 작업에서 완료했다.
- 남은 이슈:
  - 저장 후 딜 활동기록 자동 생성 API 계약은 이후 2026-06-19 회의록 저장 후 딜 연동 작업에서 확정/구현했다.

---

### 2026-06-19 MeetingNote AI/STT User Web 연결

- 작업자: Codex
- 유형:
  - frontend
  - docs
- 요약:
  - 회의록 생성 모달에 `AI 정리` 섹션을 추가하고 텍스트 `AI로 정리`, 음성 파일 `음성으로 작성` 흐름을 연결했다.
  - `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft` API client/hook을 추가했다.
  - AI/STT 결과는 form field에만 반영하고 자동 저장하지 않는다.
  - 직접 저장은 `MANUAL`, 텍스트 AI 저장은 `TEXT_AI`, STT+AI 저장은 `STT_AI` sourceType을 기존 `POST /api/meeting-notes`에 전달한다.
  - STT transcript는 검토용으로 표시하고 최종 저장 payload에는 포함하지 않는다.
- 변경 파일:
  - `FE/user-web/src/features/meeting-note/types/meeting-note.ts`
  - `FE/user-web/src/features/meeting-note/api/meeting-note-api.ts`
  - `FE/user-web/src/features/meeting-note/hooks/use-meeting-note-mutations.ts`
  - `FE/user-web/src/features/meeting-note/schemas/meeting-note-schema.ts`
  - `FE/user-web/src/features/meeting-note/components/meeting-note-create-dialog.tsx`
  - `FE/user-web/src/features/meeting-note/index.ts`
  - `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/**`
  - `AGENT/**`
  - `UX Design/**`
- 검증:
  - `pnpm --dir FE/user-web typecheck`
  - `pnpm --dir FE/user-web exec eslint src/features/meeting-note/types/meeting-note.ts src/features/meeting-note/api/meeting-note-api.ts src/features/meeting-note/hooks/use-meeting-note-mutations.ts src/features/meeting-note/schemas/meeting-note-schema.ts src/features/meeting-note/components/meeting-note-create-dialog.tsx src/features/meeting-note/index.ts`
  - `pnpm --dir FE/user-web build`
  - `git diff --check`
- 남은 이슈:
  - 저장 후 딜 활동기록 자동 생성 API 계약은 이후 2026-06-19 회의록 저장 후 딜 연동 작업에서 확정/구현했다.

---

### 2026-06-22 통합검색 및 회의록 AI/STT 완료 상태 동기화

- 목적:
  - `BE`와 `FE/user-web` 실제 구현 기준으로 Search와 MeetingNote AI/STT의 완료 상태를 재확인했다.
  - 완료된 `TODO/DONE/INTEGRdTED_SEARCH_PLAN`, `TODO/DONE/MEETING_NOTE_AI_STT_PLAN`으로 이동했다.
  - AGENT, FE, UX Design 문서의 현재 구현 스냅샷에서 오래된 “진행 중/후속” 표현을 제거했다.
- 확인 결과:
  - Search는 Backend `GET /api/search`와 User Web GlobalSearch가 연결되어 있고, 결과 선택은 `targetPath`로 이동한다.
  - 일정 검색 결과는 `/schedules/:scheduleId` 상세 route와 `GET /api/schedules/{scheduleId}`를 사용한다.
  - MeetingNote AI/STT draft UI와 저장 후 딜 추가 연동은 Backend API와 연결되어 있다.
- 검증:
  - `pnpm run typecheck` (`BE`, `FE/user-web`)
  - `pnpm run lint` (`BE`, `FE/user-web`)
  - `pnpm test` (`BE`)
  - `pnpm run build` (`BE`, `FE/user-web`)

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
- [x] 회사/담당자/제품 생성 모달 입력 검색형 선택 및 결과 없음 즉시 추가
- [x] Mobile Deal Detail Page (`mobile-deal-detail-page.tsx`) — 6단계 반영 완료
- [x] DealStage 6단계 FE/BE 계약 반영 완료
- [x] Company/Contact/Product 제품형 목록 문법 정리
- [x] Page-number 목록 pagination `totalPages` 기준 정리
- [x] Deal 목록 정렬 select 전환
- [x] Deal 목록 회사/담당자 select 필터 반영
- [x] 회사/담당자/제품 필터 select `+ 추가` 분류 관리 반영
- [x] 목록 미리보기 header/table header 44px 기준 반영
- [x] GlobalSearch API 연결 및 `targetPath` 이동
- [x] MeetingNote AI/STT draft UI 연결
- [ ] 목록 컨트롤 버튼 공통화

### 백엔드 / 계약

- [x] deal stage 전략 확정 — FE/BE 6단계 계약 반영 완료
- [x] `/` 홈은 신규 aggregate 없이 기존 Schedule/Deal/MeetingNote API 조합으로 구현
- [x] Deal 목록/stage-count/export 회사·담당자 필터 계약 반영
- [x] quick create inline 생성 범위 확정
- [ ] navigation badge count 필요 여부 확정

---

## 현재 블로커

- 목록 컨트롤 버튼 공통화 미완료
- Admin 운영 조회 API, Notification, ImportJob 영속화/재개 미구현. BusinessCard, DataImport, Trash는 현재 구현 완료 상태다.
- 범용 DealActivity table과 activity type 관리 미구현

---

## 다음 작업 우선순위

1. 브라우저 실제 세션 smoke 확인 (생성 모달 입력 검색형 추가/자동선택, 홈/딜/회사/담당자/제품/일정/회의록 목록과 상세)
2. 회사/담당자/제품/딜 목록 컨트롤 버튼 공통화
3. Admin 운영 조회 API 또는 미구현 FE feature의 Backend 계획 수립
