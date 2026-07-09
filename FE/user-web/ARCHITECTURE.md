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
    company-form.tsx
    company-list.tsx
    company-selector.tsx
  hooks/
    use-company-list.ts
    use-company-mutation.ts
  schemas/
    company-schema.ts
  types/
    company.ts
  index.ts
```

## 3. 라우트 페이지 기준

```text
src/pages/companies/index.tsx
```

페이지는 `@/features/company`에서 export한 feature component를 조합한다. feature 내부 파일을 직접 import하지 않는다.

## 4. 현재 라우트 기준

`/`는 공개 랜딩/진입 화면이고, 실제 로그인 후 앱 홈은 `/app`이다.

- 공개/인증: `/`, `/login`, `/signup`, `/auth/callback`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy`
- 보호 앱: `/app`, `/app/companies`, `/app/contacts`, `/app/products`, `/app/deals`, `/app/schedules`, `/app/meeting-notes`, `/app/business-cards`, `/app/import`, `/app/trash`, `/app/settings`, `/app/more`
- legacy redirect: 기존 `/companies`, `/contacts`, `/products`, `/deals`, `/schedules`, `/meeting-notes`, `/business-cards`, `/import`, `/trash`, `/settings`, `/more`는 대응되는 `/app/*`로 이동한다.
- 숨김/후속: `/app/notifications`와 `/app/export`는 `/app`으로 redirect한다. `/app/schedules/week`는 `/app/schedules`로 redirect한다.
