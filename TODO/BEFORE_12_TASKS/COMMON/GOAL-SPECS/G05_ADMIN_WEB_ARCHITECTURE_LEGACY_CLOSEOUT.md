# G05 Admin Web Architecture Legacy Closeout

상태: Draft / Skeleton
연결 PRE12 ID: `PRE12-F34`

## 1. 목표

Admin Web architecture와 legacy route 설명을 실제 11 Admin Web route/API 기준으로 정리한다.

## 2. 포함 범위

- 활성 Admin Web route 문서 반영
- redirect Admin Web route 문서 반영
- legacy `features/admin-query` 상태 문서화
- `pages/dashboard`, `pages/organizations` 같은 inactive page 상태 문서화
- Admin Web E2E 설명이 실제 현재 test와 충돌하는지 확인

## 3. 제외 범위

- legacy `admin-query` route/API 활성화
- `/organizations` 고객/tenant admin으로 활성화
- `/subscriptions` Billing Admin으로 활성화
- `/support` 운영 지원 화면 활성화
- Admin Web에서 User Web API/client import
- 새로운 Admin mutation 추가

## 4. 확인 대상

- `FE/admin-web/ARCHITECTURE.md`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/components/layout/admin-shell.tsx`
- `FE/admin-web/src/features/admin-query`
- `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`

## 5. 완료 기준

- [ ] 활성 route와 redirect route가 문서에서 분리됐다.
- [ ] legacy `admin-query`가 현재 주력 route/API 계약이 아님을 명시했다.
- [ ] Admin Web E2E 설명이 현재 test 상태와 충돌하지 않는다.
- [ ] Billing Admin/customer tenant admin을 추가하지 않았다.

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/FE-TODO/ADMIN-WEB-TODO.md`
