# Admin Web 아키텍처

`FE/admin-web`은 관리자 권한 확인만 남긴 별도 React 앱이다.

스냅샷 기준일: 2026-09-10 관리자 권한 확인 범위 반영

## 1. 현재 구조

```text
src/
  app/
    providers/
    router/
    app.tsx
  features/
    auth/
  lib/
    admin-api-client.ts
    env.ts
  pages/
    home/
    login/
  main.tsx
```

## 2. 현재 route 기준

현재 `FE/admin-web/src/app/router/router.tsx` 기준이다.

| 상태 | Route | 화면 |
| --- | --- | --- |
| 공개 | `/login` | Admin login |
| 보호 active | `/` | Admin auth 확인 화면 |
| redirect | `*` | `/`로 이동 |

## 3. 현재 API 연동 상태

Admin Web의 실제 호출은 `src/lib/admin-api-client.ts`를 통해 나간다.

- `GET /admin/api/me`

Admin Web은 일반 User API인 `/api/*`를 호출하지 않는다.

## 4. Auth 상태

Admin Web은 `GET /admin/api/me`로 관리자 권한을 확인한다. 보호 route는 `ProtectedAdminRoute`가 감싼 `HomePage`에서 렌더링된다.

## 5. 현재 검증 상태

`FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 관리자 token 통과, non-admin 차단, `GET /admin/api/me` 호출만 확인한다.

필수 검증 gate는 `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e`다.
