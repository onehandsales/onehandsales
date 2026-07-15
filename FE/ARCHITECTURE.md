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

Snapshot date: 2026-07-10

User Web:

- public/auth canonical routes: `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`
- supported public URL locale slugs: `ko`, `ja`, `zh-tw`, `en-us`, `en-gb`, `en-sg`, `en-au`, `en-ca`
- compatibility redirects: `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy` redirect to the preferred locale URL; `/auth/callback` stays unlocalized.
- protected app routes: `/app`, `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId`, `/app/contacts`, `/app/contacts/scan`, `/app/contacts/new`, `/app/contacts/new/full`, `/app/contacts/:contactId`, `/app/products`, `/app/products/new`, `/app/products/new/full`, `/app/products/:productId`, `/app/deals`, `/app/deals/new`, `/app/deals/new/full`, `/app/deals/:dealId`, `/app/schedules`, `/app/schedules/:scheduleId`, `/app/meeting-notes`, `/app/meeting-notes/new`, `/app/meeting-notes/new/full`, `/app/meeting-notes/:meetingNoteId`, `/app/business-cards`, `/app/import`, `/app/import/:importUserLogId`, `/app/trash`, `/app/settings`, `/app/more`
- legacy redirects: old domain routes such as `/companies`, `/contacts`, `/products`, `/deals`, `/schedules`, `/meeting-notes`, `/business-cards`, `/import`, `/trash`, `/settings`, `/more` redirect to matching `/app/*` routes. Legacy `/new/full` routes for companies/contacts/products/deals/meeting-notes also redirect to matching `/app/*/new/full` routes.
- hidden/future routes: `/app/notifications` and `/app/export` redirect to `/app`; `/app/schedules/week` redirects to `/app/schedules`.
- implemented API integration: Auth/User, Home, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote manual CRUD, MeetingNote AI/STT draft, MeetingNote deal link, Search, Trash, DataImport, Company/Contact/Product/Deal domain xlsx export
- mock/placeholder boundary: generic Export route/API, Notification
- auth runtime: Supabase OAuth provider login -> `/auth/callback` -> Backend `POST /api/auth/exchange` -> app access token/localStorage + httpOnly refresh cookie. User Web login/signup provider buttons open OAuth in a browser popup when possible and fall back to the existing full-page redirect if popup opening is blocked. 개발용 mock login은 제거되었고, 로그아웃 후 선호 locale의 login URL로 이동한다. 현재 활성 provider는 Google만이며, Apple은 iOS 대응 시, LINE은 일본/대만 확장 시 별도 구현한다.
- `/app/companies/new`, `/app/contacts/new`, `/app/products/new`, `/app/deals/new`: full page create form이 아니라 각 목록 화면을 유지하고 오른쪽 문서형 생성 패널을 초기 open 상태로 연다. `/app/*/new/full`은 패널에서 확대한 page-mode 생성 route이며 route state draft를 초기값으로 복원한 뒤 생성 성공 시 목록으로 돌아간다.
- `/app/business-cards`: 명함 스캔 내역은 등록일 최신순 고정이며, 상태 다중 필터와 `상태 초기화`, `명함스캔` 모달의 이미지 업로드 -> 진행 표시 -> 결과 확인/수정 -> 저장 흐름을 제공한다.
- `/app/import`: 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 저장, 성공 내역 목록/상세 조회를 제공한다. 딜 import 누락 회사/담당자/제품 보정값은 FE API에서 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 BE confirm 경로에 전달한다.
- 2026-07-10 기준 User Web `typecheck`, `lint`, `build`, `test:e2e`, URL locale smoke, 핵심 업무 happy path 수동 QA가 통과했다.

Admin Web:

- routes: `/login`, `/`. `/users`, `/users/:userId`, `/organizations`, `/subscriptions`, `/analytics`, `/audit-logs`, `/system`, `/support`는 현재 `/`로 redirect한다.
- implemented Backend integration: `/admin/api/me`
- dormant prepared code: `src/features/admin-query` has dashboard/users/domain/audit/sensitive raw screens, hooks, types, and API client functions, but current router/menu do not expose them.
- expected but Backend-pending APIs: `/admin/api/dashboard`, `/admin/api/users`, `/admin/api/companies`, `/admin/api/contacts`, `/admin/api/products`, `/admin/api/deals`, audit log APIs, sensitive raw APIs

## Rules

- User Web must not call `/admin/api/*`.
- Admin Web must use `src/lib/admin-api-client.ts` and `/admin/api/*`.
- TanStack Query owns server state.
- React Hook Form and component local state own form/modal/panel state.
- Zustand is only for cross-page UI state when local state is insufficient.
- Icons in tool buttons should use `lucide-react`.
- API response types live in each feature's `types` folder or a shared app-level type only when truly cross-domain.
