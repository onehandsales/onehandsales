# References

상태: Confirmed
최종 업데이트: 2026-07-22

## 전체 참조

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/REFERENCE-MAP.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/ROADMAP-OVERVIEW.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`

## Software Agent 참조

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SCHEDULE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## UXUI Agent 참조

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/012_uxui_schedule_meeting_link.md`
- `AGENT/UXUI_AGENT/CONVENTION/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/REVIEW/UX_REVIEW_CHECKLIST.md`

## 기존 계획 참조

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md` Google Calendar 결정
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md` Schedule 모듈
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`

## Google 공식 문서 참조

- Google Calendar API scope: `https://developers.google.com/workspace/calendar/api/auth`
- Google Calendar CalendarList.list: `https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list`
- Google Calendar Events.list: `https://developers.google.com/workspace/calendar/api/v3/reference/events/list`
- Google OpenID Connect server flow/id token 검증: `https://developers.google.com/identity/openid-connect/openid-connect`

## 현재 코드 참조

- `BE/src/modules/schedule`
- `BE/src/modules/notification`
- `BE/src/modules/trash`
- `BE/prisma/schema.prisma`
- `FE/user-web/src/features/schedule`
- `FE/user-web/src/features/notification`
- `FE/user-web/src/features/trash`
- `FE/user-web/src/pages/settings`

## 확인한 현재 구현 사실

- `Schedule`은 현재 `scheduleTitle`, `startAt`, `endAt`, `timeZone`, `location`, `memo`와 `ScheduleDeal`을 가진다.
- `Schedule`은 현재 `meetingUrl`, `deletedAt`, `trashExpiresAt`, Google source metadata가 없다.
- `ScheduleApplicationService.deleteSchedule`은 현재 hard delete를 수행한다.
- `ScheduleNotificationReminderUseCase`는 `SCHEDULE_START_REMINDER`를 생성하고, 일정 삭제 시 cancel use case가 있다.
- Trash target type에는 현재 `SCHEDULE`이 없다.
