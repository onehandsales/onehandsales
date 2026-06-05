# Features

Admin 비즈니스 feature slice를 이곳에 둔다.

`user-management` feature를 구현할 때의 예시:

```text
features/user-management/
  components/
    admin-user-table.tsx
    admin-user-detail-panel.tsx
    user-status-dialog.tsx
  api/
    admin-user.api.ts
    admin-user.queries.ts
  hooks/
    use-admin-user-table-state.ts
  schemas/
    user-status.schema.ts
  types/
    admin-user.types.ts
  index.ts
```

page는 내부 feature 파일이 아니라 `@/features/user-management`에서 import해야 한다.
