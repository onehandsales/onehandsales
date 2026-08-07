# Admin Web TODO

상태: Draft / Skeleton
계약 상태: Documentation closeout only

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 Admin Web 관련 작업 범위를 기록한다.

## 2. 포함 범위

- 11 Admin Operation FE TODO/checklist 정합성 정리
- Admin Web architecture 문서 정리
- 활성 Admin route와 redirect route 구분
- legacy `admin-query` 상태 문서화
- Admin Web E2E 설명과 현재 test 상태 대조

## 3. 제외 범위

- `/organizations` 활성화
- `/subscriptions` 활성화
- `/support` 활성화
- Billing Admin 구현
- Customer/B2B tenant admin 구현
- legacy `admin-query` route/API 활성화
- Admin direct mutation UI 추가

## 4. 확인 대상

- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/components/layout/admin-shell.tsx`
- `FE/admin-web/src/features`
- `FE/admin-web/src/features/admin-query`
- `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`
- `FE/admin-web/ARCHITECTURE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/FE-TODO/ADMIN-WEB-TODO.md`

## 5. 완료 기준

- [ ] Admin Web 문서가 실제 route/API 상태와 맞는다.
- [ ] 11 Admin checklist가 실제 구현 상태와 맞는다.
- [ ] legacy code가 현재 활성 계약으로 오해되지 않는다.
- [ ] Billing/B2B/customer admin 기능이 추가되지 않았다.

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md`
