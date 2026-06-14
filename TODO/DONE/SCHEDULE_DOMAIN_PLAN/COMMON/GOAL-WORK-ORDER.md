# Schedule Goal Work Order

## 1. 목표 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
|---:|---|---|---|---|
| 1 | `G01-BE-SCHEDULE-DOMAIN` | Backend | completed | Auth/User, Deal Backend 구현 완료 |
| 2 | `G02-FE-SCHEDULE-PAGES` | Frontend | completed | `G01-BE-SCHEDULE-DOMAIN` 완료 |

완료 기록:

- Backend: `TODO_LOG/2026-06-14/G01_BE_SCHEDULE_DOMAIN/WORK_LOG.md`
- Frontend: `TODO_LOG/2026-06-14/G02_FE_SCHEDULE_PAGES/WORK_LOG.md`

## 2. G01-BE-SCHEDULE-DOMAIN

목적:

- Schedule DB 모델과 User API를 구현한다.
- Frontend가 실제 계약으로 일정 화면을 만들 수 있게 한다.

읽을 문서:

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/README.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/GOAL-SPECS/G01-BE-SCHEDULE-DOMAIN.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`

완료 조건:

- Prisma schema와 migration에 `Schedule`, `ScheduleDeal`이 추가된다.
- `/api/schedules/*` 계약 API가 모두 구현된다.
- 일정 생성/수정/삭제의 transaction이 구현된다.
- 같은 일정에 같은 딜이 중복 연결되지 않는다.
- ownership과 관련 딜 검증이 구현된다.
- Backend typecheck/lint/test/build가 통과한다.

## 3. G02-FE-SCHEDULE-PAGES

목적:

- User Web 일정 월간/주간 화면을 새 Backend 계약과 연결한다.

읽을 문서:

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/README.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/GOAL-SPECS/G02-FE-SCHEDULE-PAGES.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/FE-TODO/G02-FE-SCHEDULE-PAGES.goal.md`

완료 조건:

- 일정 목록/상세/생성/수정/삭제가 실제 API와 연결된다.
- 일정 생성/수정 form은 local date-time과 IANA `timeZone`을 함께 보낸다.
- Frontend는 입력 local date-time을 `toISOString()`으로 임의 변환하지 않는다.
- 딜 선택 UI는 `GET /api/schedules/deal-options`를 사용한다.
- 연결 딜 중복 선택을 UI에서 차단한다.
- User Web typecheck/lint/build가 통과한다.

## 4. 병렬 처리 기준

- G02는 API client type과 화면 틀 정리는 선행할 수 있지만, 실제 mutation 동작 완료 판정은 G01 완료 후에 한다.
- API path, request, response가 바뀌면 `COMMON/API-SPEC/SCHEDULE_API.md`를 먼저 갱신한다.
