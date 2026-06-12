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

- 상태: `준비 단계`
- pen 분석: 완료
- 프론트 계획 문서: 완료
- 백엔드 영향 문서: 완료
- 공통 결정사항 문서: 완료
- API 변경 추적 문서: 완료
- 실제 UI 구현: 미착수

### 현재 확정된 방향

- 1차 범위는 `딜 중심`
- UI는 신규 구조 병행 추가 후 교체
- 데이터 로직은 재사용 우선
- stage는 1차에서 프론트 임시 매핑 우선
- mobile / desktop 기준은 `768px`
- 토큰은 `CSS 변수 + Tailwind semantic mapping` 병행

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
- [ ] Desktop App Shell
- [ ] Mobile App Shell
- [ ] Modal Shell
- [ ] Toast 구조
- [ ] StageBadge
- [ ] FilterChip
- [ ] MobileDealCard
- [ ] DealListRow
- [ ] Desktop Deal Pipeline Home
- [ ] Mobile Deal Pipeline Home
- [ ] Deal Quick Create Modal
- [ ] Mobile Deal Detail Page

### 백엔드 / 계약

- [ ] deal stage 전략 확정
- [ ] mobile home aggregate API 필요 여부 확정
- [ ] quick create inline 생성 범위 확정
- [ ] navigation badge count 필요 여부 확정

---

## 현재 블로커

- Deal stage 4단계 vs pen 6단계 미확정
- Quick Create modal의 inline entity create 범위 미확정
- aggregate endpoint 필요 여부 미확정

---

## 다음 작업 우선순위

1. 디자인 토큰 파일 초안 생성
2. Desktop/Mobile App Shell 구조 생성
3. 딜 UI 공통 컴포넌트 1차 생성
4. 딜 홈 2개 화면 구현
5. Quick Create / Mobile Detail 연결
