# User Web 아키텍처

`FE/user-web`은 `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`의 feature-first 구조를 따른다.

현재 구조:

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

기능 확장 예시:

```text
src/features/company/
  components/
    company-list.tsx
    company-create-dialog.tsx
    company-detail-summary.tsx
  api/
    company.api.ts
    company.queries.ts
  hooks/
    use-company-list-params.ts
  schemas/
    company.schema.ts
  types/
    company.types.ts
  index.ts
```

route page 예시:

```text
src/pages/companies/index.tsx
```

page는 `@/features/company`에서 export한 feature component를 조합한다. feature 내부 파일을 직접 import하지 않는다.
