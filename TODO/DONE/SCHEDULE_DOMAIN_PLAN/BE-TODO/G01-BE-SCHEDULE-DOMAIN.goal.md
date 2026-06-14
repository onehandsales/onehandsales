# /goal G01-BE-SCHEDULE-DOMAIN

## 1. Goal

Backend Schedule 도메인 DB와 User API를 구현한다.

## 2. 먼저 읽을 문서

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/README.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/GOAL-SPECS/G01-BE-SCHEDULE-DOMAIN.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

## 3. 작업 체크리스트

- [x] Prisma schema에 `Schedule`, `ScheduleDeal`과 relation을 추가한다.
- [x] migration을 생성한다.
- [x] Prisma Client를 생성한다.
- [x] `schedule` module을 기존 Backend module 구조에 맞춰 추가한다.
- [x] DTO validation을 작성한다.
- [x] timeZone validation과 일정 range 계산 helper를 구현한다.
- [x] repository port를 작성한다.
- [x] Prisma repository에서 ownership 조건을 포함한 query를 작성한다.
- [x] application service에서 생성/수정/삭제 transaction을 구현한다.
- [x] `GET /api/schedules/deal-options`를 구현한다.
- [x] `GET /api/schedules`를 구현한다.
- [x] `GET /api/schedules/:scheduleId`를 구현한다.
- [x] `POST /api/schedules`를 구현한다.
- [x] `PATCH /api/schedules/:scheduleId`를 구현한다.
- [x] `DELETE /api/schedules/:scheduleId`를 구현한다.
- [x] observability event를 남긴다.
- [x] 정상/에러/ownership/transaction 테스트를 추가한다.
- [x] typecheck/lint/test/build를 실행한다.

## 4. API 완료 목록

- [x] `GET /api/schedules/deal-options`
- [x] `GET /api/schedules`
- [x] `GET /api/schedules/:scheduleId`
- [x] `POST /api/schedules`
- [x] `PATCH /api/schedules/:scheduleId`
- [x] `DELETE /api/schedules/:scheduleId`

## 5. Acceptance Criteria

- 인증 없이는 401을 반환한다.
- 타 사용자 일정 또는 관련 딜 접근은 404를 반환한다.
- `dealIds` 중복 요청은 400을 반환한다.
- 같은 일정에 같은 딜이 DB에서 중복 연결되지 않는다.
- 일정 생성은 `Schedule`, `ScheduleDeal`을 같은 transaction에서 생성한다.
- 일정 수정은 요청 `dealIds`를 최종 연결 목록으로 보고 diff 처리한다.
- 일정 삭제는 soft delete가 아니라 hard delete다.
- 일정 목록 범위 계산은 요청 `timeZone` 또는 사용자 `timeZone` 기준이다.
- response 시간 필드는 ISO 8601 UTC string이다.

## 6. 완료 기록

완료 기록: `TODO_LOG/2026-06-14/G01_BE_SCHEDULE_DOMAIN/WORK_LOG.md`

- 구현한 API 목록
- migration 이름
- 실행한 검증 명령과 결과
- 남은 이슈 또는 후속 작업
