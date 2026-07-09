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

Snapshot date: 2026-07-09

User Web:

- public/auth routes: `/`, `/login`, `/signup`, `/auth/callback`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy`
- protected app routes: `/app`, `/app/companies`, `/app/companies/new`, `/app/companies/:companyId`, `/app/contacts`, `/app/contacts/:contactId`, `/app/products`, `/app/products/new`, `/app/products/:productId`, `/app/deals`, `/app/deals/new`, `/app/deals/:dealId`, `/app/schedules`, `/app/schedules/:scheduleId`, `/app/meeting-notes`, `/app/meeting-notes/:meetingNoteId`, `/app/business-cards`, `/app/import`, `/app/import/:importUserLogId`, `/app/trash`, `/app/settings`, `/app/more`
- legacy redirects: old domain routes such as `/companies`, `/contacts`, `/products`, `/deals`, `/schedules`, `/meeting-notes`, `/business-cards`, `/import`, `/trash`, `/settings`, `/more` redirect to matching `/app/*` routes.
- hidden/future routes: `/app/notifications` and `/app/export` redirect to `/app`; `/app/schedules/week` redirects to `/app/schedules`.
- implemented API integration: Auth/User, Home, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote manual CRUD, MeetingNote AI/STT draft, MeetingNote deal link, Search, Trash, DataImport, Company/Contact/Product/Deal domain xlsx export
- mock/placeholder boundary: generic Export route/API, Notification
- auth runtime: Supabase OAuth provider login -> `/auth/callback` -> Backend `POST /api/auth/exchange` -> app access token/localStorage + httpOnly refresh cookie. 개발용 mock login은 제거되었고, 로그아웃 후 `/login`으로 이동한다. Google OAuth는 QA 통과, Kakao는 Kakao Developers `account_email` 동의항목 설정 후 검증한다.
- `/app/business-cards`: 명함 스캔 내역은 등록일 최신순 고정이며, 상태 다중 필터와 `상태 초기화`, `명함스캔` 모달의 이미지 업로드 -> 진행 표시 -> 결과 확인/수정 -> 저장 흐름을 제공한다.
- `/app/import`: 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 확정 저장, 성공 내역 목록/상세 조회를 제공한다. 딜 import 누락 회사/담당자/제품 보정값은 FE API에서 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 BE confirm 경로에 전달한다.

Admin Web:

- routes: `/login`, `/`. `/users`, `/users/:userId`, `/organizations`, `/subscriptions`, `/analytics`, `/audit-logs`, `/system`, `/support`는 현재 `/`로 redirect한다.
- implemented Backend integration: `/admin/api/me`
- expected but Backend-pending APIs: `/admin/api/dashboard`, `/admin/api/users`, `/admin/api/companies`, `/admin/api/contacts`, `/admin/api/products`, `/admin/api/deals`

## Rules

- User Web must not call `/admin/api/*`.
- Admin Web must use `src/lib/admin-api-client.ts` and `/admin/api/*`.
- TanStack Query owns server state.
- React Hook Form and component local state own form/modal state.
- Zustand is only for cross-page UI state when local state is insufficient.
- Icons in tool buttons should use `lucide-react`.
- API response types live in each feature's `types` folder or a shared app-level type only when truly cross-domain.
