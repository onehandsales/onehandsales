# Schedule Module

사용자 소유 일정과 일정-딜 연결을 관리하는 Backend module이다.

## API

- `GET /api/schedules/deal-options`
- `GET /api/schedules`
- `GET /api/schedules/week`
- `GET /api/schedules/week/export/xlsx`
- `GET /api/schedules/:scheduleId`
- `POST /api/schedules`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`
- `POST /api/schedules/google/connect`
- `GET /api/schedules/google/status`
- `GET /api/schedules/google/calendars`
- `PATCH /api/schedules/google/calendars`
- `POST /api/schedules/google/sync`
- `POST /api/schedules/google/disconnect`
- `GET /api/schedules/google/callback`

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
- 일정 삭제는 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 설정하는 soft delete이며, Trash에서 7일 이내 복구할 수 있다.
- Google-origin 일정을 삭제하면 local 삭제 상태를 함께 표시해 provider sync가 사용자의 local 삭제 의도를 덮어쓰지 않게 한다.
- 일정 삭제와 pending reminder 취소는 application transaction 안에서 함께 처리한다.
- 같은 일정에 같은 딜은 application validation과 DB unique 제약으로 중복 연결을 차단한다.
- 딜 옵션 조회는 일정 도메인 내부 API인 `GET /api/schedules/deal-options`를 사용한다.
- 주간 보고서와 Google Calendar read-only sync는 Schedule module 안의 현재 활성 기능이다.

## 관련 문서

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SCHEDULE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
