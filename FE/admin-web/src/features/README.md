# 기능

Admin 비즈니스 feature slice를 이곳에 둔다.

`admin-auth` feature example:

```text
features/admin-auth/
  api/
    admin-auth-api.ts
    admin-auth-query-keys.ts
  components/
    admin-auth-status.tsx
  hooks/
    use-admin-auth-status.ts
  types/
    admin-auth.ts
  index.ts
```

page는 내부 feature 파일이 아니라 `@/features/admin-auth`에서 import해야 한다.
