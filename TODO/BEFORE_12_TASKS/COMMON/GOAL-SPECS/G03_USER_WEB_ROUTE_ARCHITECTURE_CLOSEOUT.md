# G03 User Web Route Architecture Closeout

상태: Draft / Skeleton
연결 PRE12 ID: `PRE12-F32`

## 1. 목표

User Web route와 architecture 문서를 실제 코드 상태에 맞춘다.

## 2. 포함 범위

- `/app/notifications` 활성 상태 문서 반영
- `/app/export` redirect 상태 문서 반영
- Notification Backend/API 존재 상태 문서 반영
- generic export 잔여 FE 코드와 post-12 후보 상태 구분
- AGENT UXUI/SOFTWARE 문서 중 route 상태가 stale인 부분 확인

## 3. 제외 범위

- `/app/notifications` rollback
- `/app/export` 활성화
- generic ExportJob API/DB/화면 활성화
- Notification 신규 source/TTL/cleanup 정책 구현

## 4. 확인 대상

- `FE/user-web/src/app/router/router.tsx`
- `FE/user-web/src/features/notification`
- `FE/user-web/src/features/import-export`
- `FE/ARCHITECTURE.md`
- `FE/user-web/ARCHITECTURE.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`

## 5. 완료 기준

- [ ] User Web architecture 문서가 `/app/notifications` 활성 상태를 반영한다.
- [ ] User Web architecture 문서가 `/app/export` redirect 상태를 반영한다.
- [ ] AGENT 문서의 stale route 설명이 실제 코드와 충돌하지 않게 정리됐다.
- [ ] route 정합성을 위해 코드를 되돌리거나 새 route를 열지 않았다.

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/FE-TODO/USER-WEB-TODO.md`
