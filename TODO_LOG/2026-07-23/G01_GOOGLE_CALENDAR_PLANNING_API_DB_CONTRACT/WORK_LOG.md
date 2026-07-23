# G01 Google Calendar Planning API DB Contract Work Log

상태: Done
작업일: 2026-07-23
대상: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md`

## 1. 목적

04 Google Calendar Integration 구현 전에 문서 계약과 현재 코드 사실을 대조하고, G02~G05 구현 착수를 막는 blocking 질문이 없는지 확인한다.

## 2. 확인한 현재 코드 사실

- `BE/prisma/schema.prisma`의 `Schedule`에는 아직 `meetingUrl`, Google source metadata, `deletedAt`, `trashExpiresAt`이 없다.
- `BE/src/modules/schedule/application/services/schedule-application.service.ts`의 `deleteSchedule`은 현재 `deleteScheduleHard` 경로를 사용한다.
- `BE/src/modules/trash`와 `FE/user-web/src/features/trash`의 target/domain type에는 아직 `SCHEDULE`이 없다.
- `BE/src/modules/notification`에는 `SCHEDULE_START_REMINDER`가 있다.
- `FE/user-web/src/features/schedule`은 `memo`, `dealIds`를 지원하지만 `meetingUrl`, `isAllDay`, `googleCalendar` 타입은 아직 없다.
- `FE/user-web/src/pages/settings`는 `/app/settings` entry point로 연결되어 있다.

## 3. 문서 보정

- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`
  - token encryption key 우선순위를 추가했다.
  - 500 `GoogleCalendarTokenEncryptionKeyMissing` error contract를 추가했다.
  - 최종 업데이트일을 2026-07-23으로 변경했다.
- `COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md`
  - 상태를 `Done`으로 변경하고 완료 결과를 추가했다.
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`
  - G01 완료 상태와 세부 체크 항목을 `[x]`로 갱신했다.

## 4. 검증

실행:

```powershell
rg -n "LOCAL_MODIFIED|GOOGLE_DELETED|SCHEDULE_START_REMINDER|meetingUrl|isAllDay|syncLockExpiresAt|Events.list|CalendarList.list|returnTo|KEEP|HIDE|TRASH" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION
rg -n "GoogleCalendarTokenEncryptionKeyMissing|Token encryption|GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY|ENCRYPTION_MASTER_KEY" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/BE-TODO TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/ARCHITECTURE-GUARDRAILS.md
git diff --check
```

결과:

- G01 필수 키워드가 04 문서 전반에 명시되어 있음을 확인했다.
- API spec, BE TODO, DB schema, architecture guardrail의 token encryption missing-key 계약이 정렬됐다.
- `git diff --check`는 통과했다. Windows 줄바꿈 경고만 출력됐다.

## 5. 결론

- G02~G05 구현 착수를 막는 blocking 질문은 없다.
- 현재 코드와 충돌하는 부분은 모두 구현해야 할 변경으로 문서에 명시되어 있다.
- G01은 완료로 판정한다.
