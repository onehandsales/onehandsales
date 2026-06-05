# Admin Web 아키텍처

`FE/admin-web`은 `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`의 feature-first 구조를 따른다.

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
    user-management/
    organization-management/
    subscription-management/
    usage-analytics/
    audit-log/
    system-config/
    support/
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

## 2. 기능 확장 예시

```text
src/features/user-management/
  api/
    admin-user-api.ts
    admin-user-query-keys.ts
  components/
    user-filter-bar.tsx
    user-table.tsx
    user-status-dialog.tsx
  hooks/
    use-admin-user-list.ts
    use-admin-user-mutation.ts
  schemas/
    admin-user-schema.ts
  types/
    admin-user.ts
  index.ts
```

## 3. 라우트 페이지 기준

```text
src/pages/users/index.tsx
```

페이지는 `@/features/user-management`에서 export한 feature component를 조합한다. feature 내부 파일을 직접 import하지 않는다.
