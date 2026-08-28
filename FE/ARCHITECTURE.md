# Frontend Architecture

`FE`에는 독립적인 frontend 앱 두 개가 있다.

- `user-web`: 사용자가 직접 쓰는 responsive 영업 workflow 앱
- `admin-web`: 운영자를 위한 desktop-first Admin console

루트 frontend package와 공유 frontend package는 만들지 않는다. 각 앱은 자기 dependency, API client, UI primitive, test, build config를 소유한다.

## 공통 구조

두 앱 모두 feature-first 구조를 따른다.

```text
src/
  assets/
  app/
    providers/
    router/
    app.tsx
  components/
    ui/
    layout/
  features/
  hooks/
  lib/
  pages/
  store/
  styles/
  types/
  utils/
  main.tsx
```

User Web API client:

```text
FE/user-web/src/lib/api-client.ts
```

Admin Web API client:

```text
FE/admin-web/src/lib/admin-api-client.ts
```

Feature folder example:

```text
src/features/<feature>/
  components/
  api/
  hooks/
  schemas/
  types/
  index.ts
```

Page는 route entry이며 feature public export를 조합한다. API 호출, schema, business UI는 `features/<domain>`에 둔다.

## 현재 구현 스냅샷

스냅샷 기준일: 2026-08-13 FE/BE 문서 동기화

User Web 기준:

- 공개/인증 정본 route는 `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`다.
- 공개 URL locale slug 중 현재 언어 선택 UI에 노출하는 값은 `ko`, `en-us`, `en-ca`다. `ja`, `en-gb`, `en-sg`, `en-au`는 추후 확장 후보로만 보류한다.
- 호환 redirect는 `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy`를 선호 locale URL로 이동시키며, `/auth/callback`은 locale prefix 없이 유지한다.
- 보호 앱 활성 route는 `/app`, `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId`, `/app/contacts`, `/app/contacts/new`, `/app/contacts/new/full`, `/app/contacts/:contactId`, `/app/products`, `/app/products/new`, `/app/products/new/full`, `/app/products/:productId`, `/app/deals`, `/app/deals/new`, `/app/deals/new/full`, `/app/deals/:dealId`, `/app/schedules`, `/app/schedules/week`, `/app/schedules/:scheduleId`, `/app/meeting-notes`, `/app/meeting-notes/new`, `/app/meeting-notes/new/full`, `/app/meeting-notes/:meetingNoteId`, `/app/business-cards`, `/app/notifications`, `/app/import`, `/app/import/review/:importJobId`, `/app/import/:importUserLogId`, `/app/trash`, `/app/more`다. `/app/settings` 사용자-facing route는 없으며 설정은 `/app?account=settings` 또는 현재 보호 앱 route 위의 `?account=settings` query로 계정 모달을 열어 제공한다.
- legacy redirect는 `/companies`, `/contacts`, `/products`, `/deals`, `/schedules`, `/meeting-notes`, `/business-cards`, `/import`, `/trash`, `/more` 같은 기존 domain route를 대응되는 `/app/*` route로 이동시킨다. 회사/담당자/제품/딜/회의록의 legacy `/new/full` route도 대응되는 `/app/*/new/full` route로 이동하고, `/schedules/week`는 `/app/schedules/week`로, `/import/review/:importJobId`는 `/app/import/review/:importJobId`로 이동한다. `/settings` legacy route는 제거됐으며 compatibility redirect를 유지하지 않는다.
- redirect 또는 future 경계는 `/contacts/scan`과 `/app/contacts/scan`이 `/app/business-cards`로 이동하고, `/app/export`가 `/app`으로 이동하는 것이다.
- 구현된 API 연동은 Auth/User, Home, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, Weekly Schedule Report, Google Calendar Integration, MeetingNote 수동 CRUD, MeetingNote AI/STT draft, MeetingNote next action/follow-up draft, MeetingNote deal link, AI Weekly Sales Report/Follow-up, Search, Trash, Notification/Reminder, DataImport/ImportJob, Product Analytics, Account request, Company/Contact/Product/Deal domain xlsx export다.
- mock/placeholder 경계는 generic Export route/API, Billing/Paddle, Billing Admin, B2B tenant/team admin이다. Notification source/TTL/cleanup 고도화는 새 API 계약이 생기기 전까지 후속 범위로 남긴다.
- auth runtime은 Supabase OAuth provider login -> `/auth/callback` -> Backend `POST /api/auth/exchange` -> app access token/localStorage + httpOnly refresh cookie 흐름이다. User Web login/signup provider button은 가능하면 OAuth를 browser popup으로 열고, popup이 차단되면 기존 full-page redirect로 fallback한다. 개발용 mock login은 제거되었고, 로그아웃 후 선호 locale의 login URL로 이동한다. 현재 runtime provider는 Google, LINE, Apple이며, Kakao는 runtime provider로 노출하지 않는다.
- `/app/companies/new`, `/app/contacts/new`, `/app/products/new`, `/app/deals/new`는 full page create form이 아니라 각 목록 화면을 유지하고 오른쪽 문서형 생성 패널을 초기 open 상태로 연다. `/app/*/new/full`은 패널에서 확대한 page-mode 생성 route이며 route state draft를 초기값으로 복원한 뒤 생성 성공 시 목록으로 돌아간다.
- `/app/business-cards`: 명함 스캔 내역은 등록일 최신순 고정이며, 상태 다중 필터와 `상태 초기화`, `명함스캔` 모달의 이미지 업로드 -> 진행 표시 -> 결과 확인/수정 -> 저장 흐름을 제공한다.
- `/app/import`: 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 저장, 성공 내역 목록/상세 조회를 제공한다. 딜 import 누락 회사/담당자/제품 보정값은 FE API에서 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 BE confirm 경로에 전달한다.
- 2026-07-10 기준 User Web `typecheck`, `lint`, `build`, `test:e2e`, URL locale smoke, 핵심 업무 happy path 수동 QA가 통과했다.

Admin Web:

- active routes: `/login`, `/`, `/users`, `/users/:userId`, `/users/:userId/domain`, `/users/:userId/trash`, `/provider-failures`, `/account-requests`, `/trash/recovery-requests`, `/analytics`, `/audit-logs`, `/system`.
- redirects: `/organizations`, `/subscriptions`, `/support`는 `/`로 이동한다. B2B tenant, Billing Admin, support console route를 열지 않는다.
- implemented Backend integration: current 11 Admin Operation APIs under `/admin/api/*`, including `/me`, users, user activity timeline, user domain records, user trash, audit logs, sensitive raw access, provider failures, analytics overview, account deletion/data export queues, trash recovery request queue, and system operation checks.
- dormant prepared code: `src/features/admin-query` still has legacy dashboard/global-domain/raw-access expectations, but current router/menu do not expose it.

## Rules

- User Web must not call `/admin/api/*`.
- Admin Web must use `src/lib/admin-api-client.ts` and `/admin/api/*`.
- TanStack Query owns server state.
- React Hook Form and component local state own form/modal/panel state.
- Zustand is only for cross-page UI state when local state is insufficient.
- Icons in tool buttons should use `lucide-react`.
- API response types live in each feature's `types` folder or a shared app-level type only when truly cross-domain.
