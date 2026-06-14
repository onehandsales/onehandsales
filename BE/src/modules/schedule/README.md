# Schedule Module

사용자 소유 일정과 일정-딜 연결을 관리하는 Backend module이다.

## API

- `GET /api/schedules/deal-options`
- `GET /api/schedules`
- `GET /api/schedules/:scheduleId`
- `POST /api/schedules`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`

## 구현 구조

```text
schedule/
  application/
    ports/
      schedule.repository.ts
    services/
      schedule-application.service.ts
      schedule-application.service.spec.ts
  domain/
    schedule.errors.ts
  infrastructure/
    persistence/
      prisma-schedule.repository.ts
    schedule.module.ts
  presentation/
    http/
      dto/
        schedule-request.dto.ts
      schedule.controller.ts
```

## 정책

- 모든 조회와 mutation은 현재 사용자 `userId` ownership 기준으로 처리한다.
- 일정 생성은 `Schedule`과 `ScheduleDeal` 생성을 같은 transaction에서 처리한다.
- 일정 수정은 요청 `dealIds`를 최종 연결 상태로 보고 `ScheduleDeal`을 추가/삭제한다.
- 일정 삭제는 soft delete가 아니라 hard delete다.
- 같은 일정에 같은 딜은 application validation과 DB unique 제약으로 중복 연결을 차단한다.
- 딜 옵션 조회는 일정 도메인 내부 API인 `GET /api/schedules/deal-options`를 사용한다.

## 관련 문서

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SCHEDULE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
