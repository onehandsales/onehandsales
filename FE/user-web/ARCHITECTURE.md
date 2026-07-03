# User Web 아키텍처

`FE/user-web`은 `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`의 feature-first 구조를 따른다.

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
    deal/
    contact/
    company/
    product/
    schedule/
    meeting-note/
    business-card/
    import-export/
    notification/
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
