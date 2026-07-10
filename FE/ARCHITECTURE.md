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
- protected app routes: `/app`, `/app/companies`, `/app/companies/new`, `/app/companies/:companyId`, `/app/contacts`, `/app/contacts/:contactId`, `/app/products`, `/app/products/new`, `/app/products/:productId`, `/app/deals`, `/app/deals/new`, `/app/deals/:dealId`, `/app/schedules`, `/app/schedules/:scheduleId`, `/app/meeting-notes`, `/app/meeting-notes/:meetingNoteId`, `/app/business-cards`, `/app/import`, `/app/import/:importUserLogId`, `/app/trash`, `/app/settings`, `/app/more`
- legacy redirects: old domain routes such as `/companies`, `/contacts`, `/products`, `/deals`, `/schedules`, `/meeting-notes`, `/business-cards`, `/import`, `/trash`, `/settings`, `/more` redirect to matching `/app/*` routes.
- hidden/future routes: `/app/notifications` and `/app/export` redirect to `/app`; `/app/schedules/week` redirects to `/app/schedules`.
- implemented API integration: Auth/User, Home, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote manual CRUD, MeetingNote AI/STT draft, MeetingNote deal link, Search, Trash, DataImport, Company/Contact/Product/Deal domain xlsx export
- mock/placeholder boundary: generic Export route/API, Notification
- auth runtime: Supabase OAuth provider login -> `/auth/callback` -> Backend `POST /api/auth/exchange` -> app access token/localStorage + httpOnly refresh cookie. User Web login/signup provider buttons open OAuth in a browser popup when possible and fall back to the existing full-page redirect if popup opening is blocked. 개발용 mock login은 제거되었고, 로그아웃 후 선호 locale의 login URL로 이동한다. Google OAuth는 QA 통과, Kakao는 Kakao Developers `account_email` 동의항목 설정 후 검증한다.
- `/app/companies/new`: full page create form이 아니라 `/app/companies`의 목록 화면을 유지하고 오른쪽 문서형 생성 패널을 초기 open 상태로 연다. 데스크톱은 full-height fixed side panel이며 사용자가 resize할 수 있다. 패널 폭은 최소 `420px`, 최대 화면/작업영역의 `70%`이고 목록은 컬럼을 숨기지 않고 horizontal scroll로 대응한다.
- `/app/business-cards`: 명함 스캔 내역은 등록일 최신순 고정이며, 상태 다중 필터와 `상태 초기화`, `명함스캔` 모달의 이미지 업로드 -> 진행 표시 -> 결과 확인/수정 -> 저장 흐름을 제공한다.
- `/app/import`: 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 저장, 성공 내역 목록/상세 조회를 제공한다. 딜 import 누락 회사/담당자/제품 보정값은 FE API에서 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 BE confirm 경로에 전달한다.
- 2026-07-10 기준 User Web `typecheck`, `lint`, `build`, `test:e2e`, URL locale smoke, 핵심 업무 happy path 수동 QA가 통과했다.

Admin Web:

- routes: `/login`, `/`. `/users`, `/users/:userId`, `/organizations`, `/subscriptions`, `/analytics`, `/audit-logs`, `/system`, `/support`는 현재 `/`로 redirect한다.
- implemented Backend integration: `/admin/api/me`
- expected but Backend-pending APIs: `/admin/api/dashboard`, `/admin/api/users`, `/admin/api/companies`, `/admin/api/contacts`, `/admin/api/products`, `/admin/api/deals`

## Rules

- User Web must not call `/admin/api/*`.
- Admin Web must use `src/lib/admin-api-client.ts` and `/admin/api/*`.
- TanStack Query owns server state.
- React Hook Form and component local state own form/modal/panel state.
- Zustand is only for cross-page UI state when local state is insufficient.
- Icons in tool buttons should use `lucide-react`.
- API response types live in each feature's `types` folder or a shared app-level type only when truly cross-domain.
