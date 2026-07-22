# G02 Backend DB Google Connection

상태: Ready

## 1. 목적

Google Calendar integration의 DB foundation, Schedule soft delete/Trash foundation, OAuth connection/status/disconnect API를 구현한다.

## 2. 선행 조건

- G01이 완료되어 문서 계약 충돌이 없다.
- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`를 먼저 읽는다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽는다.
- DB migration 실행이 허용되어 있다.
- 실제 Google OAuth smoke에는 `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI`가 필요하다. env가 없으면 provider adapter test double로 자동 테스트를 닫는다.

## 3. 포함 범위

- Prisma enum/model/field/migration 추가
- 기존 Schedule row `sourceType=INTERNAL` 호환 처리
- `ExternalCalendarConnection` repository/application/service foundation
- `ExternalCalendarSource` 기본 model/repository foundation
- OAuth state 생성/검증
- Google Calendar provider port와 test double
- `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT`와 infrastructure token encryption adapter
- `POST /api/schedules/google/connect`
- `GET /api/schedules/google/callback`
- `GET /api/schedules/google/status`
- `POST /api/schedules/google/disconnect`
- `DELETE /api/schedules/:scheduleId` soft delete 전환
- Trash `SCHEDULE` list/detail/restore
- Schedule restore 시 reminder 재계산
- disconnect `KEEP/HIDE/TRASH` schedule 처리
- Backend unit/controller/repository test

## 4. 제외 범위

- Google calendar list provider fetch UI 연결
- `GET/PATCH /api/schedules/google/calendars`
- `POST /api/schedules/google/sync` event import
- User Web 구현
- 실제 Google OAuth smoke
- Google export/write
- webhook/watch
- 반복 일정 정식 모델

## 5. DB 작업

`BE-TODO/DB-SCHEMA.md` 기준으로 아래를 구현한다.

- enum:
  - `ExternalCalendarProvider`
  - `ExternalCalendarConnectionStatus`
  - `ExternalCalendarSourceStatus`
  - `ScheduleSourceType`
  - `ScheduleExternalSyncStatus`
- model:
  - `ExternalCalendarConnection`
  - `ExternalCalendarSource`
- `ExternalCalendarConnection`에는 표시용 `providerAccountEmail`과 내부 식별용 `providerAccountId`를 둔다.
- `providerAccountId`는 Google OIDC `sub` claim이며 API response에 노출하지 않는다.
- `Schedule` 추가 field:
  - `meetingUrl`
  - `isAllDay`
  - `sourceType`
  - `externalCalendarSourceId`
  - `externalEventId`
  - `externalEventICalUid`
  - `externalEventEtag`
  - `externalHtmlLink`
  - `externalUpdatedAt`
  - `lastExternalSyncedAt`
  - `externalDeletedAt`
  - `externalSyncStatus`
  - `deletedAt`
  - `deletedByUserId`
  - `trashExpiresAt`
- indexes/unique:
  - `@@unique([userId, externalCalendarSourceId, externalEventId])`
  - schedule delete/source 관련 indexes
  - connection/source ownership indexes
  - `@@index([userId, syncLockExpiresAt])`

## 6. API 계약

### POST /api/schedules/google/connect

Request:

```json
{
  "returnTo": "/app/schedules"
}
```

Response:

```json
{
  "connectUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "expiresAt": "2026-07-22T01:10:00.000Z",
  "returnTo": "/app/schedules"
}
```

Business logic:

- returnTo allowlist 적용
- signed state 10분 TTL
- OAuth scope 고정: `openid`, `email`, `https://www.googleapis.com/auth/calendar.readonly`
- OAuth URL parameter 고정: `response_type=code`, `access_type=offline`, `prompt=consent`, `include_granted_scopes=true`
- log에 state/token/code 원문 금지

### GET /api/schedules/google/callback

Query: `code`, `state`, `error`

Business logic:

- state 검증
- Google token exchange
- ID token signature, `iss`, `aud`, `exp`, `sub`, `email`, `email_verified=true` 검증
- `providerAccountId=ID token sub`, `providerAccountEmail=verified email` 저장
- encrypted token 저장
- connection `CONNECTED` upsert
- 실패/거절 시 returnTo redirect
- callback에서 event sync 금지

### GET /api/schedules/google/status

Business logic:

- connection 없음도 200 `connected=false`
- `CONNECTED`이면 auto sync freshness 정보 반환
- `RECONNECT_REQUIRED`이면 auto sync disabled
- token 반환 금지

### POST /api/schedules/google/disconnect

Request:

```json
{
  "scheduleAction": "KEEP"
}
```

Business logic:

- token 폐기
- connection `DISCONNECTED`
- `KEEP`: active schedule 유지, badge는 연결 끊김 상태
- `HIDE`: source를 `UNSELECTED`로 바꾸고 active Google-origin schedule 기본 목록에서 숨김
- `TRASH`: Google-origin schedule soft delete, hard delete 금지
- `TRASH` 대상 reminder 취소

## 7. Schedule soft delete

- repository `deleteScheduleHard` 호출을 제거하거나 내부적으로 soft delete로 대체한다.
- `DELETE /api/schedules/:scheduleId` 응답은 `204 No Content`다.
- soft-deleted schedule은 기존 list/detail/week/export 기본 조회에서 제외한다.
- `ScheduleDeal`은 유지한다.
- pending reminder는 취소한다.
- `trashExpiresAt`은 `createTrashRetentionTimestamps(now)`로 계산하며 현재 값은 `now+7일`이다.
- structured log에는 memo/title 원문을 남기지 않는다.

## 8. Trash SCHEDULE

- `TrashTargetType`에 `SCHEDULE` 추가
- `TrashDomainFilter`에 `SCHEDULE` 추가
- list/detail/restore repository branch 추가
- restore 시 Google-origin schedule은 `LOCAL_MODIFIED`
- restore 시 future schedule reminder 재계산

## 9. Error/Observability

- `GoogleCalendarConnectionNotFound`
- `GoogleCalendarReconnectRequired`
- `GoogleCalendarOAuthStateInvalid`
- `GoogleCalendarTokenEncryptionKeyMissing`
- `ScheduleMeetingUrlInvalid`
- `schedule.google.connect.started`
- `schedule.google.connect.completed`
- `schedule.google.connect.failed`
- `schedule.google.disconnect.completed`
- `schedule.deleted`
- `schedule.restored`

## 10. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:migrate -- --name google_calendar_integration
pnpm run typecheck
pnpm run lint
pnpm run test -- schedule
pnpm run test -- notification
pnpm run test -- trash
pnpm run build
```

## 11. 완료 기준

- Prisma migration이 생성되고 validate/typecheck가 통과한다.
- 기존 schedule row가 `INTERNAL`로 정상 조회된다.
- Schedule hard delete가 soft delete로 바뀐다.
- Trash `SCHEDULE` list/detail/restore가 동작한다.
- Google connection/status/connect/callback/disconnect API가 spec과 일치한다.
- token/code/raw provider body가 log/response/test snapshot에 노출되지 않는다.
- disconnect `KEEP/HIDE/TRASH`가 schedule과 reminder를 올바르게 처리한다.
