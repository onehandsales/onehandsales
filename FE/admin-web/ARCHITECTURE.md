# Admin Web 아키텍처

`FE/admin-web`은 `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`의 feature-first 구조를 따른다.

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
    admin-api-client.ts
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
src/features/deal-management/
  components/
    admin-deal-table.tsx
    admin-deal-detail-panel.tsx
    sensitive-raw-view-dialog.tsx
  api/
    admin-deal.api.ts
    admin-deal.queries.ts
  hooks/
    use-admin-deal-table-state.ts
  schemas/
    sensitive-raw-view.schema.ts
  types/
    admin-deal.types.ts
  index.ts
```

route page 예시:

```text
src/pages/deals/index.tsx
```

page는 `@/features/deal-management`에서 export한 feature component를 조합한다. feature 내부 파일을 직접 import하지 않는다.
