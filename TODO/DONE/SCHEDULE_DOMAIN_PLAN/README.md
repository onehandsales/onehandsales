# Schedule Domain Plan

## 1. 목적

이 계획은 User Web 일정 화면과 Backend Schedule API를 현재 프로젝트 구조에 맞게 구현하기 위한 실행 문서다.

일정은 영업 담당자가 미팅, 통화, 방문, 팔로업을 월간/주간 단위로 확인하고, 하나의 일정에 여러 딜을 연결할 수 있게 하는 도메인이다. 일정과 딜은 N:N 관계이며, 연결은 `ScheduleDeal`이 담당한다.

## 2. 현재 상태

- 2026-06-14 기준 Backend `schedule` 모듈과 Prisma `Schedule`, `ScheduleDeal` 모델이 구현됐다.
- User Web `/schedules`, `/schedules/week` 라우트는 Backend Schedule API 계약에 맞게 연동됐다.
- 일정 명세는 루트 `schedule.md`와 본 계획의 `COMMON/API-SPEC/SCHEDULE_API.md`에 반영되어 있다.
- 본 계획의 API 계약 상태는 `implemented`다. 완료 이력은 `TODO_LOG/2026-06-14/G01_BE_SCHEDULE_DOMAIN/WORK_LOG.md`, `TODO_LOG/2026-06-14/G02_FE_SCHEDULE_PAGES/WORK_LOG.md`에 기록했다.

## 3. 범위

포함:

- `Schedule`, `ScheduleDeal` DB 모델과 migration
- `GET /api/schedules/deal-options`
- `GET /api/schedules`
- `GET /api/schedules/:scheduleId`
- `POST /api/schedules`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`
- 일정 생성/수정 시 `ScheduleDeal` 연결 생성, 추가, 삭제
- 일정 삭제 시 soft delete가 아닌 실제 row 삭제
- User Web 일정 월간/주간 화면, 생성/수정/삭제 UI, 딜 연결 UI

제외:

- Google Calendar 실연동
- 일정 알림
- 반복 일정
- 참석자 관리
- 일정 휴지통
- 딜 연결 개별 추가/삭제 API
- 일정별 활동 로그 자동 생성
- Admin Schedule API

## 4. 문서 지도

- 공통 사용자 흐름: `COMMON/USER-FLOW.md`
- 작업 순서: `COMMON/GOAL-WORK-ORDER.md`
- 계획 검토 결과: `COMMON/PLANNING-REVIEW.md`
- API 계약: `COMMON/API-SPEC/SCHEDULE_API.md`
- BE goal 상세: `COMMON/GOAL-SPECS/G01-BE-SCHEDULE-DOMAIN.md`
- FE goal 상세: `COMMON/GOAL-SPECS/G02-FE-SCHEDULE-PAGES.md`
- BE DB 스키마: `BE-TODO/DB-SCHEMA.md`
- BE 실행 문서: `BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- FE 실행 문서: `FE-TODO/G02-FE-SCHEDULE-PAGES.goal.md`

## 5. `/goal` 실행 순서

> 완료 보관 문서다. 새 후속 작업은 이 폴더를 직접 수정하지 않고 활성 `TODO` 아래에 새 계획으로 작성한다.

1. `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/GOAL-WORK-ORDER.md`를 읽는다.
2. 해당 goal의 `COMMON/GOAL-SPECS/*.md`를 읽는다.
3. API 구현 또는 연동이 있으면 `COMMON/API-SPEC/SCHEDULE_API.md`를 읽는다.
4. Backend 작업은 `BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`를 따른다.
5. Frontend 작업은 `FE-TODO/G02-FE-SCHEDULE-PAGES.goal.md`를 따른다.

## 6. 완료 기준

- Backend Schedule API가 명세대로 구현되고 테스트가 통과한다.
- User Web 일정 화면이 새 API 계약만 사용한다.
- 일정 생성/수정 시 `dealIds` 중복 요청을 application validation에서 차단한다.
- 같은 일정에 같은 딜이 중복 연결되지 않도록 DB unique 제약이 있다.
- 일정 수정 시 `dealIds` 요청 배열을 최종 연결 상태로 보고 `ScheduleDeal`을 추가/삭제한다.
- 일정 삭제는 `Schedule`과 `ScheduleDeal`을 실제 삭제한다.
- 일정 시간 처리는 UTC instant + IANA `timeZone` 정책을 따른다.
- 완료 후 `TODO_LOG`에 작업 결과와 검증 결과를 남긴다.

## 7. 관련 정본

- `schedule.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
