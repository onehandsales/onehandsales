# User Web TODO

상태: Draft / Skeleton
계약 상태: Documentation closeout only

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 User Web 관련 작업 범위를 기록한다.

## 2. 포함 범위

- `/app/notifications` 활성 상태 문서 정리
- `/app/export` redirect 상태 문서 정리
- 10 Mobile Field Use FE TODO/checklist 정합성 정리
- AGENT/FE architecture 문서 중 User Web route 상태가 stale인 부분 확인

## 3. 제외 범위

- `/app/notifications` 숨김/rollback
- `/app/export` 활성화
- generic export 화면/API 연결
- PWA/offline/native 구현
- server draft 구현

## 4. 확인 대상

- `FE/user-web/src/app/router/router.tsx`
- `FE/user-web/src/features/notification`
- `FE/user-web/src/features/import-export`
- `FE/ARCHITECTURE.md`
- `FE/user-web/ARCHITECTURE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/FE-TODO/USER-WEB-TODO.md`

## 5. 완료 기준

- [ ] User Web 문서가 실제 route 상태와 맞는다.
- [ ] 10 Mobile checklist가 실제 구현 상태와 맞는다.
- [ ] route 정합성 closeout 때문에 제품 동작이 변경되지 않았다.

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`
