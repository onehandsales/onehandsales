# G01 Planning API DB Contract

상태: Done
완료일: 2026-07-23

## 1. 목적

04 Google Calendar Integration 구현 전에 문서 계약과 현재 코드가 충돌하지 않는지 최종 확인한다.

## 2. 선행 조건

- `COMMON/SCOPE.md` 상태가 `Confirmed`다.
- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md` 상태가 `confirmed`다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽고 따른다.
- Backend/DB/Frontend 구조는 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- UX/UI와 문구는 `AGENT/UXUI_AGENT` 기준을 따른다.

## 3. 포함 범위

- 04 문서 계약 검토
- 현재 Schedule/Trash/Notification/User Web 구조 재확인
- API request/response shape와 FE 타입 변경 필요성 점검
- DB migration scope 점검
- blocking 질문 여부 확인
- 문서 간 충돌이 있으면 문서 보정

## 4. 제외 범위

- Backend 코드 구현
- Frontend 코드 구현
- Prisma migration 생성
- Google Cloud console 설정
- 실제 Google OAuth smoke test

## 5. 확인해야 할 현재 코드 사실

- `BE/prisma/schema.prisma`의 `Schedule`에는 아직 `meetingUrl`, Google source metadata, `deletedAt`, `trashExpiresAt`이 없다.
- `BE/src/modules/schedule/application/services/schedule-application.service.ts`의 delete는 현재 hard delete다.
- `BE/src/modules/trash` target type에는 아직 `SCHEDULE`이 없다.
- `BE/src/modules/notification`에는 `SCHEDULE_START_REMINDER`가 있고 schedule create/update/delete에서 use case를 호출한다.
- `FE/user-web/src/features/schedule`은 `memo`, `dealIds`를 지원하지만 `meetingUrl`과 Google source badge는 없다.
- `FE/user-web/src/pages/settings`는 연동 설정 entry point로 사용한다.

## 6. 검토 체크

- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`가 모든 신규 Google API의 request/response/business logic을 담고 있는가?
- 기존 Schedule API 변경이 명시되어 있는가?
- Schedule soft delete와 Trash restore가 명시되어 있는가?
- Google description -> `Schedule.memo` 최초 import 정책이 명시되어 있는가?
- `meetingUrl` validation과 UI 표시 정책이 명시되어 있는가?
- Google-origin schedule reminder 정책이 명시되어 있는가?
- 연결 해제 `KEEP/HIDE/TRASH` 정책이 명시되어 있는가?
- OAuth returnTo allowlist가 명시되어 있는가?
- OAuth scope와 callback ID token 검증값이 명시되어 있는가?
- Google CalendarList.list와 Events.list request parameter가 full/incremental 기준으로 명시되어 있는가?
- `syncLockExpiresAt` lock과 409 `GoogleCalendarSyncInProgress`가 명시되어 있는가?
- Google all-day event의 `isAllDay` 저장/표시/로컬 수정 전환 정책이 명시되어 있는가?
- token encryption env 우선순위와 missing-key error가 명시되어 있는가?
- Schedule soft delete retention이 `now+7일`로 명시되어 있는가?
- 실제 Google provider smoke가 Done blocking이 아님이 명시되어 있는가?

## 7. 검증 명령

문서 검토 goal이므로 build/test는 필수 아님. 파일 구조와 검색 검증을 수행한다.

```powershell
rg -n "LOCAL_MODIFIED|GOOGLE_DELETED|SCHEDULE_START_REMINDER|meetingUrl|isAllDay|syncLockExpiresAt|Events.list|CalendarList.list|returnTo|KEEP|HIDE|TRASH" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION
git diff --check
```

## 8. 완료 기준

- G02~G05 구현 착수를 막는 미해결 질문이 없다.
- 문서 간 API path, enum, 상태명, badge 문구가 일치한다.
- 현재 코드와 충돌하는 부분은 "구현해야 할 변경"으로 문서에 명시되어 있다.
- 필요한 문서 보정이 끝났다.

## 9. 완료 결과

- 선행 문서 `COMMON/SCOPE.md`, `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`, `COMMON/ARCHITECTURE-GUARDRAILS.md`, `COMMON/REVIEW-CHECKLIST.md`, `BE-TODO/*`, `FE-TODO/*`를 재확인했다.
- 현재 코드 사실을 확인했다.
  - `BE/prisma/schema.prisma`의 `Schedule`에는 아직 `meetingUrl`, Google source metadata, `deletedAt`, `trashExpiresAt`이 없다.
  - `ScheduleApplicationService.deleteSchedule`은 현재 `deleteScheduleHard` 경로를 사용한다.
  - `BE/src/modules/trash`와 `FE/user-web/src/features/trash`의 target/domain type에는 아직 `SCHEDULE`이 없다.
  - `BE/src/modules/notification`에는 `SCHEDULE_START_REMINDER`가 있다.
  - `FE/user-web/src/features/schedule`은 `memo`, `dealIds`를 지원하지만 `meetingUrl`, `isAllDay`, `googleCalendar` 타입은 아직 없다.
  - `FE/user-web/src/pages/settings`는 `/app/settings` entry point로 연결되어 있다.
- 문서 보정:
  - `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`에 token encryption key 우선순위와 500 `GoogleCalendarTokenEncryptionKeyMissing` error contract를 추가했다.
- G02~G05 구현 착수를 막는 blocking 질문은 없다.
- G01 검증 검색과 `git diff --check`를 실행했다.
