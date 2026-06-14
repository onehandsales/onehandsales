# G01 BE Schedule Domain Work Log

## 작업명

Backend Schedule 도메인 DB와 User API 구현

## 작업 일자

2026-06-14

## 관련 계획

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`

## 적용 범위

- Prisma `Schedule`, `ScheduleDeal` 모델과 relation 추가
- Schedule 도메인 module, controller, DTO, application service, repository port, Prisma repository 추가
- User API 구현
  - `GET /api/schedules/deal-options`
  - `GET /api/schedules`
  - `GET /api/schedules/:scheduleId`
  - `POST /api/schedules`
  - `PATCH /api/schedules/:scheduleId`
  - `DELETE /api/schedules/:scheduleId`
- 일정 생성/수정/삭제 transaction 구현
- `dealIds` 중복 validation과 DB unique 제약 추가
- 일정 수정 시 `dealIds` 최종 목록 기준 ScheduleDeal diff 처리
- 일정 삭제 hard delete 구현
- 구조화 application log event 추가
- Schedule application service 테스트 추가

## 주요 변경 파일

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`
- `BE/src/app.module.ts`
- `BE/src/modules/schedule/**`

## 검증 결과

- `pnpm --dir BE run prisma:generate`: 통과
- `pnpm --dir BE run prisma:validate`: 통과
- `pnpm --dir BE run typecheck`: 통과
- `pnpm --dir BE run lint`: 통과
- `pnpm --dir BE run test -- schedule-application.service`: 통과, 5 tests
- `pnpm --dir BE run test`: 통과, 8 suites / 30 tests
- `pnpm --dir BE run build`: 통과

## 검토 결과

통과.

## 남은 리스크

- 현재 실행 환경 Node가 `v22.21.1`이라 package `engines`의 `>=24 <25`와 맞지 않아 pnpm engine warning이 발생한다. 명령은 모두 성공했다.
- 실제 DB migration 적용은 별도 환경에서 `prisma migrate deploy` 또는 배포 절차로 확인해야 한다.

## 다음 권장 작업

- 배포 전 실제 개발 DB에 migration 적용 후 Schedule API smoke test를 실행한다.
