# User Web 아키텍처

`FE/user-web`은 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`의 feature-first 구조를 따른다.

## 1. 현재 구조

```text
src/
  assets/
  app/
    providers/
    router/
    app.tsx
  components/
    layout/
    ui/
  features/
    auth/
    business-card/
    company/
    contact/
    deal/
    deal-redesign/
    import-export/
    meeting-note/
    notification/
    product/
    public-site/
    schedule/
    search/
    trash/
  hooks/
  lib/
    api-client.ts
    env.ts
    query-client.ts
  pages/
  store/
  styles/
  types/
  utils/
  main.tsx
```

## 2. 기능 확장 예시

```text
src/features/company/
  api/
    company-api.ts
    company-query-keys.ts
  components/
    company-create-dialog.tsx
    company-detail-screen.tsx
    company-edit-dialog.tsx
    company-edit-form.tsx
    company-list-screen.tsx
    company-log-section.tsx
    company-taxonomy-create-dialog.tsx
  hooks/
    use-company-detail.ts
    use-company-list.ts
    use-company-mutations.ts
  schemas/
    company-schema.ts
  types/
    company.ts
  index.ts
```

## 2A. 회사 생성 패널 기준

회사 생성은 `/app/companies` 목록 위에서 오른쪽 문서형 생성 패널을 여는 방식이 정본이다.

- `/app/companies/new`는 full page form이 아니라 `CompanyListScreen`에 `initialCreateOpen`을 전달한다.
- 패널을 닫으면 `/app/companies`로 replace navigate한다.
- 데스크톱 기준 패널은 `fixed inset-y-0 right-0`로 화면 최상단~최하단까지 붙는다.
- resize handle은 패널 왼쪽 edge에 있고, 폭은 `window.innerWidth - event.clientX`로 계산한다.
- 패널 폭은 최소 `420px`, 최대 화면/작업영역의 `70%`다.
- 사용자가 조절한 폭은 `onehand.company.createPanelWidth` localStorage key에 저장한다.
- 패널이 열려도 회사 목록의 6개 컬럼은 줄이거나 합치지 않는다. 목록 공간이 부족하면 table area에서 horizontal scroll을 사용한다.
- 데스크톱 미만 viewport에서는 오른쪽 overlay panel로 열어 목록 레이아웃을 깨지 않게 한다.

## 3. 라우트 페이지 기준

```text
src/pages/companies/index.tsx
```

페이지는 `@/features/company`에서 export한 feature component를 조합한다. feature 내부 파일을 직접 import하지 않는다.

## 4. 현재 라우트 기준

`/`는 공개 랜딩/진입 화면이고, 실제 로그인 후 앱 홈은 `/app`이다.

- Public/auth canonical routes use URL locale prefixes: `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`.
- Supported URL locale slugs: `ko`, `ja`, `zh-tw`, `en-us`, `en-gb`, `en-sg`, `en-au`, `en-ca`.
- Compatibility redirects: `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy` redirect to the preferred locale URL.
- OAuth callback remains shared and unlocalized: `/auth/callback`.
- 보호 앱: `/app`, `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId`, `/app/contacts`, `/app/contacts/scan`, `/app/contacts/new`, `/app/contacts/new/full`, `/app/contacts/:contactId`, `/app/products`, `/app/products/new`, `/app/products/new/full`, `/app/products/:productId`, `/app/deals`, `/app/deals/new`, `/app/deals/new/full`, `/app/deals/:dealId`, `/app/schedules`, `/app/schedules/:scheduleId`, `/app/meeting-notes`, `/app/meeting-notes/new`, `/app/meeting-notes/new/full`, `/app/meeting-notes/:meetingNoteId`, `/app/business-cards`, `/app/import`, `/app/import/:importUserLogId`, `/app/trash`, `/app/settings`, `/app/more`
- 생성 route 기준: `/app/companies/new`, `/app/contacts/new`, `/app/products/new`, `/app/deals/new`은 각 목록 위 오른쪽 생성 패널을 초기 open 상태로 연다. `/app/companies/new/full`, `/app/contacts/new/full`, `/app/products/new/full`, `/app/deals/new/full`, `/app/meeting-notes/new/full`은 패널에서 확대한 page-mode 생성 route다. `/app/meeting-notes/new`는 `/app/meeting-notes?create=1`로 redirect한다.
- legacy redirect: 기존 `/companies`, `/contacts`, `/products`, `/deals`, `/schedules`, `/meeting-notes`, `/business-cards`, `/import`, `/trash`, `/settings`, `/more`와 각 상세/생성/`new/full` 경로는 대응되는 `/app/*`로 이동한다.
- 숨김/후속: `/app/notifications`와 `/app/export`는 `/app`으로 redirect한다. `/app/schedules/week`는 `/app/schedules`로 redirect한다.
- legacy app redirect: `/app/contacts/scan`은 `/app/business-cards`로 redirect한다.

## 5. 현재 인증 기준

- `/{locale}/login` and `/{locale}/signup` use the same Supabase OAuth provider login flow. Existing `/login` and `/signup` redirect to the preferred locale URL.
- 로그인/회원가입 provider 버튼은 가능한 경우 Supabase OAuth URL을 browser popup으로 열고, popup이 차단되면 기존 full-page redirect를 사용한다.
- OAuth callback은 `/auth/callback`에서 Supabase session을 읽고 Backend `POST /api/auth/exchange`로 앱 session을 교환한다.
- popup OAuth callback도 같은 `/auth/callback`을 사용하며 app session 저장 후 popup을 닫아 부모 창이 session을 복원한다.
- 개발용 mock login은 User Web에서 제거되어 있다.
- 현재 로그인 화면 노출 provider는 Google 하나다. Google 가입/로그인은 QA 통과 상태다.
- Kakao는 로그인 기능에서 제거했다. Apple login은 iOS 대응 시, LINE login은 일본/대만 확장 시 별도 구현한다.
- Logout redirects to the preferred locale login URL such as `/ko/login` or `/en-us/login`.
- User Web은 화면 폭 `767px 이하`를 `mobile`, 그 외를 `personal_laptop` device slot으로 보낸다. `work_laptop` slot은 Backend에는 있지만 현재 User Web에서 사용하지 않는다.
- 같은 slot의 다른 브라우저/기기로 로그인하면 기존 slot의 active device/session을 교체한다. 같은 브라우저 재로그인은 기존 session의 refresh token을 회전한다.
- 로그인 국가 코드는 브라우저가 보내지 않는다. Backend가 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 헤더를 받을 때만 `signupCountryCode`/`lastLoginCountryCode`가 저장된다.

## 6. 현재 검증 상태

2026-07-10 기준 User Web `typecheck`, `lint`, `build`, `test:e2e`, URL locale smoke, 핵심 업무 happy path 수동 QA는 통과했다. DataImport preview validation은 누락된 셀에만 메시지를 표시하는 기준으로 정리되어 있다.
