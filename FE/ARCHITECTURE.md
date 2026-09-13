# Frontend Architecture

`FE`에는 독립적인 frontend 앱 두 개가 있다.

- `user-web`: 사용자가 직접 쓰는 responsive OneHand CRM 앱
- `admin-web`: 운영자를 위한 desktop-first Admin console

루트 frontend package와 공유 frontend package는 만들지 않는다. 각 앱은 자기 dependency, API client, UI primitive, test, build config를 소유한다.

## Web 앱 공통 구조

User Web과 Admin Web은 feature-first 구조를 따른다.

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

스냅샷 기준일: 2026-09-13 OneHand CRM pivot 문서 동기화

User Web 기준:

- 공개/인증 정본 route는 `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/product`, `/{locale}/features`, `/{locale}/features/customers`, `/{locale}/features/pipeline`, `/{locale}/features/schedules-follow-up`, `/{locale}/features/activity-records`, `/{locale}/features/ai-sales-assistant`, `/{locale}/features/reports`, `/{locale}/pricing`, `/{locale}/solutions`, `/{locale}/solutions/personal`, `/{locale}/solutions/real-estate`, `/{locale}/solutions/insurance-auto`, `/{locale}/solutions/b2b-field`, `/{locale}/download`, `/{locale}/help`, `/{locale}/faq`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`다.
- 공개 URL locale slug 중 현재 언어 선택 UI에 노출하는 값은 `ko`, `en-us`, `en-ca`다. `ja`, `en-gb`, `en-sg`, `en-au`는 추후 확장 후보로만 보류한다.
- 호환 redirect는 locale 없는 공개 URL을 선호 locale URL로 이동시키며, `/auth/callback`은 locale prefix 없이 유지한다.
- 보호 앱 활성 route는 `/app`, `/app/more`다. `/app/settings` 사용자-facing route는 없으며 설정은 `/app?account=settings` 또는 현재 보호 앱 route 위의 `?account=settings` query로 계정 모달을 열어 제공한다. `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 `/app`으로 redirect한다. legacy top-level `/contacts/*`, `/products/*`, `/deals/*`, `/more`도 현재 보호 앱 route로 redirect한다.
- 구현된 API 연동은 Auth/User, Home, More, Error Report, Support Request, Public Contact Request다.
- auth runtime은 Supabase OAuth provider login -> `/auth/callback` -> Backend `POST /api/auth/exchange` -> app access token/localStorage + httpOnly refresh cookie 흐름이다. User Web login/signup provider button은 가능하면 OAuth를 browser popup으로 열고, popup이 차단되면 기존 full-page redirect로 fallback한다. 개발용 mock login은 제거되었고, 로그아웃 후 선호 locale의 login URL로 이동한다. 현재 runtime provider는 Google, LINE, Apple이며, Kakao는 runtime provider로 노출하지 않는다.
- 고정형 `Company`/`Search`/`Company xlsx export` 화면과 API는 OneHand CRM 방향 전환에 맞춰 제거했다. 다음 CRM 화면은 Workspace/Kit/Object/Attribute/Relationship/Record/List/View 구조가 확정된 뒤 새 feature로 추가한다.
- 문서와 코드 변경 후에는 User Web `typecheck`, `lint`, `test`, `build`, `test:e2e`를 다시 실행한다.

Admin Web:

- active routes: `/login`, `/`.
- redirects: 그 외 route는 `/`로 이동한다.
- implemented Backend integration: `GET /admin/api/me`.

## Rules

- User Web must call only the general user API contract under `/api/*`.
- Admin Web must use `src/lib/admin-api-client.ts` and currently call only `GET /admin/api/me`.
- User Web uses TanStack Query for server state where needed.
- React Hook Form and component local state own form/modal/panel state.
- Zustand is only for cross-page UI state when local state is insufficient.
- Web icon buttons should use `lucide-react`.
- API response types live in each feature's `types` folder or a shared app-level type only when truly cross-domain.
