# Account Settings Modal Plan Archive

작업 일자: 2026-08-23
상태: 완료

## 1. 작업 목적

`TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN`은 Account settings modal migration과 `/app/settings` route removal이 완료된 계획이다.

이번 작업은 완료된 계획을 `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN`으로 이동하고, 활성 TODO 문서와 완료 보관 문서의 참조를 최신 상태로 정리한다.

## 2. 관련 문서

- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/README.md`
- `TODO/DONE/README.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 3. 예정 범위

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN`을 `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN`으로 이동
- `TODO/README.md`의 폴더 구조, 활성/보류/완료 목록 갱신
- `TODO/DONE/README.md`의 보관 목록 갱신
- 이동된 계획 내부의 자기 참조 경로를 `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN`으로 정리
- `rg`와 `git status`로 변경 범위 검증

## 4. 제외 범위

- `FE/user-web` 구현 변경
- `FE/admin-web` 변경
- `BE` API/Prisma 변경
- 추가 QA 실행

## 5. 진행 기록

- 완료 계획의 README, SCOPE, GOAL-WORK-ORDER, FE TODO 상태가 `Implemented`임을 확인했다.
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN` 기존 경로가 없음을 확인했다.
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN`을 `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN`으로 이동했다.
- `TODO/README.md`, `TODO/DONE/README.md`, `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`, `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`, `TODO/SERVICE_QA_PLAN`의 settings QA 참조를 최신 경로와 modal-open 기준으로 갱신했다.

## 6. 검증 결과

- `test -d TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN && test ! -e TODO/ACCOUNT_SETTINGS_MODAL_PLAN && echo moved`: 통과
- `rg -n "TODO/ACCOUNT_SETTINGS_MODAL_PLAN" TODO AGENT TODO_LOG`: 예전 활성 경로 참조는 작업 로그의 이동 기록에만 남음
- `rg -n "/app/settings|/settings|app\\?account=settings" TODO/SERVICE_QA_PLAN ...`: 활성 QA/UX 문서의 settings 기준이 `/app?account=settings`와 route 제거 기준으로 갱신됐음을 확인
- `git diff --check`: 통과

## 7. 남은 리스크

- 코드 구현이나 QA 실행은 수행하지 않았다. 이번 작업은 완료 계획 이동과 문서 참조 정리만 포함한다.
