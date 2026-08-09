# Admin Web 아키텍처

`FE/admin-web`은 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`의 feature-first 구조를 따른다.

스냅샷 기준일: 2026-08-09 G05 Admin Web architecture legacy closeout

## 1. 현재 구조

```text
src/
  app/
    providers/
    router/
    app.tsx
  components/
    layout/
    ui/
  features/
    account-request-management/
    admin-query/
    audit-log/
    auth/
    organization-management/
    provider-failure-management/
    subscription-management/
    support/
    system-config/
    trash-management/
    usage-analytics/
    user-management/
  lib/
    admin-api-client.ts
    env.ts
    query-client.ts
  pages/
  main.tsx
```

## 2. 현재 route 기준

현재 `FE/admin-web/src/app/router/router.tsx` 기준이다.

| 상태 | Route | 화면 |
| --- | --- | --- |
| 공개 | `/login` | Admin login |
| 보호 active | `/` | Admin root placeholder |
| 보호 active | `/users` | 사용자 목록 |
| 보호 active | `/users/:userId` | 사용자 상세 overview |
| 보호 active | `/users/:userId/domain` | 사용자 도메인 read-only 탭 |
| 보호 active | `/users/:userId/trash` | 사용자 Trash |
| 보호 active | `/provider-failures` | Provider failure 운영 |
| 보호 active | `/account-requests` | 계정/데이터 요청 queue |
| 보호 active | `/trash/recovery-requests` | Trash 복구 요청 queue |
| 보호 active | `/analytics` | 운영 분석 요약 |
| 보호 active | `/audit-logs` | 감사 로그 |
| 보호 active | `/system` | 운영 gate |
| redirect | `/organizations` | `/`로 이동하며 Customer/B2B tenant admin을 열지 않는다. |
| redirect | `/subscriptions` | `/`로 이동하며 Billing Admin을 열지 않는다. |
| redirect | `/support` | `/`로 이동하며 운영 지원 화면을 열지 않는다. |

`AdminShell` navigation에는 active 운영 route만 노출한다. `/organizations`, `/subscriptions`, `/support`는 router에 redirect 경계로 남아 있지만 메뉴에는 없다.

## 3. 현재 API 연동 상태

Admin Web의 실제 호출은 `src/lib/admin-api-client.ts`를 통해 `/admin/api/*`로만 나간다. 일반 User API인 `/api/*`를 호출하지 않는다.

현재 active feature가 사용하는 Admin API:

- `GET /admin/api/me`
- `GET /admin/api/users`
- `GET /admin/api/users/:userId`
- `GET /admin/api/users/:userId/activity-timeline`
- `GET /admin/api/users/:userId/domain-records`
- `GET /admin/api/users/:userId/trash-summary`
- `GET /admin/api/users/:userId/trash-records`
- `GET /admin/api/audit-logs`
- `POST /admin/api/sensitive/raw-access`
- `GET /admin/api/provider-failures`
- `GET /admin/api/provider-failures/:failureId`
- `GET /admin/api/analytics/overview`
- `GET /admin/api/account-deletion-requests`
- `GET /admin/api/data-export-requests`
- `GET /admin/api/trash/recovery-requests`
- `GET /admin/api/system/operation-checks/latest`
- `POST /admin/api/system/operation-checks`

## 4. legacy와 inactive 경계

`src/features/admin-query`는 현재 주력 route/API 계약이 아니다. 이 feature는 과거 dashboard, 전역 도메인 목록, 전역 도메인 상세, legacy 민감 원문 조회 path를 기대하는 준비 코드이며 active router와 `AdminShell` navigation에 연결하지 않는다.

`src/pages/dashboard/index.tsx`와 `src/pages/organizations/index.tsx`는 `admin-query` 화면을 import하지만 현재 router에 등록되어 있지 않다. `src/pages/subscriptions/index.tsx`와 `src/pages/support/index.tsx`도 현재 router에서 직접 사용하지 않는다.

`organization-management`, `subscription-management`, `support` feature 폴더는 빈 scaffold다. G05 기준 삭제나 격리는 필요하지 않으며, Billing/B2B/customer admin route를 새로 열지 않는다.

## 5. 현재 검증 상태

`FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 현재 Admin route, non-admin 차단, reason modal validation, provider/analytics/account/trash/system 운영 route smoke를 확인한다.

G05 closeout의 검증 gate는 문서 정합성 기준으로 `pnpm run typecheck`, `pnpm run lint`, Admin Web `/api/*` 정적 검색, `git diff --check`다. E2E는 현재 route와 충돌하지 않는 상태로 문서화한다.
