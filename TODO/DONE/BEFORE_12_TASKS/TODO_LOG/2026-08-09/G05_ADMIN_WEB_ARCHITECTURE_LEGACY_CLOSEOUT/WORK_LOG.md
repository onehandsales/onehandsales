# G05 Admin Web Architecture Legacy Closeout 작업 로그

작업일: 2026-08-09
대상 goal: `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md`
결론: Admin Web architecture와 legacy route 설명을 실제 11 Admin Web route/API 기준으로 맞췄다.

## 1. 확인한 실제 상태

- `FE/admin-web/src/app/router/router.tsx` 기준 active route는 `/users`, `/users/:userId`, `/users/:userId/domain`, `/users/:userId/trash`, `/provider-failures`, `/account-requests`, `/trash/recovery-requests`, `/analytics`, `/audit-logs`, `/system`이다.
- `FE/admin-web/src/app/router/router.tsx` 기준 `/organizations`, `/subscriptions`, `/support`는 `/`로 redirect한다.
- `FE/admin-web/src/components/layout/admin-shell.tsx` navigation에는 active 운영 route만 노출되고 `/organizations`, `/subscriptions`, `/support`는 노출되지 않는다.
- `FE/admin-web/src/features/admin-query`는 과거 dashboard, 전역 domain list/detail, legacy raw access path를 기대하는 준비 코드이며 현재 router와 menu에 연결되지 않는다.
- `FE/admin-web/src/pages/dashboard/index.tsx`와 `FE/admin-web/src/pages/organizations/index.tsx`는 `admin-query` 화면을 import하지만 현재 router에 등록되지 않는다.
- `FE/admin-web/src/pages/subscriptions/index.tsx`와 `FE/admin-web/src/pages/support/index.tsx`는 placeholder page지만 현재 router에서 직접 쓰지 않는다.
- `organization-management`, `subscription-management`, `support` feature 폴더는 빈 scaffold다.
- `FE/admin-web/src/lib/admin-api-client.ts`는 모든 요청을 `/admin/api${path}`로 보낸다.
- `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 현재 Admin route, non-admin 차단, reason modal validation, provider/analytics/account/trash/system route smoke를 확인한다.

## 2. 보정한 문서

- `FE/admin-web/ARCHITECTURE.md`에서 active route, redirect route, active Admin API, legacy `admin-query`, inactive page 상태를 현재 기준으로 정리했다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`에서 Admin Web을 현재 11 Admin Operation 운영 도구 기준으로 정리했다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`에서 Admin Web E2E 설명을 현재 smoke test 상태와 맞췄다.
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`에서 Admin Web 화면 목록과 현재 router 상태를 actual route 기준으로 보정했다.
- `TODO/BEFORE_12_TASKS/FE-TODO/ADMIN-WEB-TODO.md`와 G05 관련 상태 문서를 완료 상태로 보정했다.

## 3. 제외한 범위

- 새 Admin Web route를 활성화하지 않았다.
- `/organizations`, `/subscriptions`, `/support`를 활성 운영 화면으로 열지 않았다.
- legacy `admin-query` route/API를 되살리지 않았다.
- 새 Admin API client 또는 User API 호출을 추가하지 않았다.
- request/response, business logic, user flow, DB/Prisma 변경을 만들지 않았다.
- Billing Admin, Customer/B2B tenant admin, Admin direct mutation을 구현하지 않았다.
- legacy code 삭제나 격리는 필요하지 않다고 판단했다. 현재 route/menu 미연결 상태이고 typecheck/lint 충돌이 없기 때문이다.

## 4. 검증 결과

- `FE/admin-web`에서 `pnpm run typecheck`를 실행했고 통과했다.
- `FE/admin-web`에서 `pnpm run lint`를 실행했고 통과했다.
- `FE/admin-web`에서 `pnpm run test:e2e`를 실행했고 현재 Admin route smoke 1건이 통과했다.
- Admin Web `/api/*` 정적 검색을 실행했고 일반 User API 호출이 없음을 확인했다.
- Admin Web의 실제 `fetch(` 호출은 `src/lib/admin-api-client.ts`의 `/admin/api${path}` 1곳뿐임을 확인했다.
- `organizations|subscriptions|support|admin-query` 문서 정적 검색을 실행했고 redirect, inactive, legacy boundary 문맥으로만 남아 있음을 확인했다.
- `git diff --check`를 실행했고 통과했다.

## 5. 최종 판정

검증 명령과 2차 정적 검토를 통과했으므로 G05는 완료로 판정한다.
