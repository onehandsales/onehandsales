# Admin Web 아키텍처

`FE/admin-web`은 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`의 feature-first 구조를 따른다.

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
    admin-query/
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
src/features/admin-query/
  api/
    admin-query-api.ts
    admin-query-keys.ts
  components/
    admin-dashboard-screen.tsx
    admin-users-screen.tsx
    admin-domain-data-screen.tsx
    admin-audit-logs-screen.tsx
    sensitive-raw-dialog.tsx
  hooks/
    use-admin-query.ts
  types/
    admin-query.ts
  index.ts
```

`admin-query`는 후속 Backend 운영 조회 API를 전제로 한 준비 코드다. 현재 router와 메뉴에서는 노출하지 않는다.

## 3. 현재 라우트 기준

현재 `FE/admin-web/src/app/router/router.tsx` 기준:

- `/login`
- `/`
- `/users`, `/users/:userId`, `/organizations`, `/subscriptions`, `/analytics`, `/audit-logs`, `/system`, `/support`는 모두 `/`로 redirect한다.

실제 Backend API 연동 완료 범위는 `GET /admin/api/me`뿐이다. `admin-query`의 dashboard/users/domain/audit/sensitive raw 화면은 Backend API 구현 전까지 route와 메뉴에서 노출하지 않는다.

## 4. 현재 검증 상태

2026-07-10 기준 Admin Web `typecheck`, `lint`, `build` 선택 점검은 통과했다. Backend Admin API는 현재 `GET /admin/api/me`만 구현되어 있으므로, 운영 화면 E2E는 관리자 페이지 본 구현 전까지 release gate로 보지 않는다.
