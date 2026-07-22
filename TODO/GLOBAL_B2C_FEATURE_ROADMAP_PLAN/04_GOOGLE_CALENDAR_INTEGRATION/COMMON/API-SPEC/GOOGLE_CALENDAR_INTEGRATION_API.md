# Google Calendar Integration API

상태: confirmed
최종 업데이트: 2026-07-22
소비자: User Web
호환성: 신규 Google Calendar API + 기존 Schedule/Trash API 확장
아키텍처/UXUI 기준: `../ARCHITECTURE-GUARDRAILS.md`

## 1. 결정 요약

04에서 바로 구현할 Google Calendar API는 아래 7개다.

| API | 상태 | 목적 |
|---|---|---|
| `POST /api/schedules/google/connect` | confirmed | Calendar OAuth 연결 URL 생성 |
| `GET /api/schedules/google/callback` | confirmed | OAuth callback 처리 후 User Web으로 redirect |
| `GET /api/schedules/google/status` | confirmed | 연결, calendar 선택, sync 상태 조회 |
| `GET /api/schedules/google/calendars` | confirmed | Google calendar 목록과 선택 상태 조회 |
| `PATCH /api/schedules/google/calendars` | confirmed | 선택 calendar 저장 |
| `POST /api/schedules/google/sync` | confirmed | 선택 calendar event sync |
| `POST /api/schedules/google/disconnect` | confirmed | 연결 해제와 가져온 schedule 처리 |

기존 API는 아래처럼 확장한다.

| API | 변경 |
|---|---|
| `GET /api/schedules` | `meetingUrl`, source metadata, hidden Google filter 추가 |
| `GET /api/schedules/:scheduleId` | `meetingUrl`, source metadata, editability 추가 |
| `POST /api/schedules` | `meetingUrl` request/response 추가. client source 지정 금지 |
| `PATCH /api/schedules/:scheduleId` | `meetingUrl` request/response 추가. Google-origin local modified 전환 |
| `DELETE /api/schedules/:scheduleId` | hard delete에서 soft delete/Trash 이동으로 변경 |
| `GET /api/schedules/week` | Google-origin active schedule source/meetingUrl 포함 |
| `GET /api/schedules/week/export/xlsx` | Google-origin active schedule source/meetingUrl 포함 |
| `/api/trash` | `SCHEDULE` target/domain/restore 지원 |

04에서 만들지 않는 API:

| API/기능 | 처리 |
|---|---|
| Google export/write API | 제외. 04는 read-only provider import다. |
| Google push webhook/watch | 제외. 04는 진입 시 freshness sync와 수동 sync다. |
| 반복 일정 API | 제외. 04는 `singleEvents=true`로 펼쳐진 instance만 저장한다. |
| Attendee/contact auto-link API | 제외. 참석자는 저장하지 않는다. |
| Admin provider failure API | 제외. 운영/Admin 추적은 11에서 다룬다. |

## 2. 공통 계약

### 인증과 권한

- User API는 `Authorization: Bearer <app_access_token>`을 사용한다.
- Guard는 기존 User Web AuthGuard를 따른다.
- 모든 조회/수정/삭제는 `currentUser.id` ownership으로 제한한다.
- Admin API는 만들지 않는다.
- User Web은 `/admin/api/*`를 호출하지 않는다.

### OAuth scope

- Google login OAuth와 Calendar OAuth는 분리한다.
- Calendar scope는 사용자가 연결 버튼을 누를 때만 요청한다.
- 04 OAuth scope는 아래 3개로 고정한다.
  - `openid`
  - `email`
  - `https://www.googleapis.com/auth/calendar.readonly`
- `profile` scope는 요청하지 않는다.
- ID token의 `iss`, `aud`, `exp`, `sub`, `email`, `email_verified`를 검증한다.
- `sub`가 없거나 `email` claim이 없거나 `email_verified !== true`이면 callback을 실패 처리하고 connection을 만들지 않는다.
- `providerAccountId`에는 Google OIDC `sub`를 저장한다. `providerAccountId`는 API response에 노출하지 않는다.
- Google OAuth URL query parameter는 아래 값을 반드시 포함한다.
  - `response_type=code`
  - `client_id=${GOOGLE_CALENDAR_CLIENT_ID}`
  - `redirect_uri=${GOOGLE_CALENDAR_REDIRECT_URI}`
  - `scope=openid email https://www.googleapis.com/auth/calendar.readonly`
  - `access_type=offline`
  - `prompt=consent`
  - `include_granted_scopes=true`
  - `state=<signed-state>`

### OAuth returnTo

- `returnTo` 허용값:
  - `/app/schedules`
  - `/app/settings`
- invalid `returnTo`는 `/app/schedules`로 fallback한다.
- OAuth state에는 user id, returnTo, nonce, issuedAt, expiresAt을 넣고 서명한다.
- state TTL은 10분이다.

### Sync range

- 기준 timezone은 `currentUser.timeZone`이다.
- 유효하지 않으면 `Asia/Seoul`로 fallback한다.
- range는 사용자 timezone 기준 오늘 local 00:00에서:
  - 과거 1개월
  - 미래 3개월
- local boundary를 UTC instant로 변환해 provider query에 사용한다.
- 포함 조건은 `timeMin <= event.start < timeMax`다.
- multi-day event가 range와 겹치면 포함한다.
- 예시: now가 `2026-07-22T10:00:00+09:00`, timezone이 `Asia/Seoul`이면 local range는 `[2026-06-22T00:00:00+09:00, 2026-10-22T00:00:00+09:00)`이고 provider UTC range는 `[2026-06-21T15:00:00.000Z, 2026-10-21T15:00:00.000Z)`다.

### 자동/수동 sync

- `/app/schedules` 진입 시 status를 조회한다.
- connection이 `CONNECTED`이고 마지막 성공/시도 sync가 10분 이상 지났으면 자동 sync를 실행한다.
- manual sync는 10분 freshness를 우회한다.
- manual sync rapid click은 FE pending disabled와 BE connection-level lock으로 막는다.
- BE sync lock은 `ExternalCalendarConnection.syncLockExpiresAt`을 사용한다.
- sync 시작 시 `syncLockExpiresAt=now+5분`으로 저장한다.
- sync 성공/실패 처리 후 `syncLockExpiresAt=NULL`로 비운다.
- `syncLockExpiresAt > now`이면 `409 GoogleCalendarSyncInProgress`를 반환한다.
- `/app/schedules/week`는 `/app/schedules`와 같은 cache/status를 사용한다. week route 진입만으로 자동 sync를 강제하지 않는다.

### Calendar 선택

- primary calendar는 기본 selected다.
- 사용자는 calendar 선택 API/UX에서 추가 calendar를 선택한다.
- holidays/birthdays 같은 system calendar는 목록에 표시하지만 기본 selected가 아니다.
- 선택 해제한 calendar의 기존 schedule은 물리 삭제하지 않고 기본 일정 화면에서 숨긴다.
- 재선택하면 sync를 재개한다.

### Schedule source 상태

Schedule source type:

| 값 | 설명 |
|---|---|
| `INTERNAL` | 한손에서 직접 만든 일정 |
| `GOOGLE` | Google Calendar에서 import된 일정 |

Google sync status:

| 값 | 기본 표시 | 설명 |
|---|---|---|
| `SYNCED` | 표시 | Google과 동기화된 상태 |
| `LOCAL_MODIFIED` | 표시 | 사용자가 로컬 필드를 수정했고 Google sync가 덮어쓰지 않는 상태 |
| `GOOGLE_DELETED` | 숨김 | Google에서 cancelled/deleted된 상태 |
| `LOCAL_DELETED` | Trash | 사용자가 한손에서 삭제한 상태 |

연결 끊김과 calendar 선택 해제는 `ScheduleExternalSyncStatus`가 아니라 connection/source 상태로 계산한다.

- connection `RECONNECT_REQUIRED`: 기존 active Google schedule은 표시하고 badge는 `Google · 연결 끊김`
- disconnect `KEEP`: connection `DISCONNECTED`, source `SELECTED` 유지, 기존 active Google schedule은 표시하고 badge는 `Google · 연결 끊김`
- disconnect `HIDE`: connection `DISCONNECTED`, source `UNSELECTED` 처리, 기존 Google schedule은 기본 목록에서 숨김
- calendar 선택 해제: source `UNSELECTED`, 기존 Google schedule은 기본 목록에서 숨김

Badge:

| 조건 | badge |
|---|---|
| `sourceType=GOOGLE`, connection `CONNECTED`, status `SYNCED` | `Google` |
| connection `RECONNECT_REQUIRED` 또는 disconnect `KEEP` | `Google · 연결 끊김` |
| status `LOCAL_MODIFIED` | `Google · 로컬 수정` |
| status `LOCAL_DELETED` 또는 Trash detail | `Google · 로컬 삭제` |

### Google event field mapping

| Google event | Schedule field | 정책 |
|---|---|---|
| `summary` | `scheduleTitle` | 없으면 `(제목 없음)` |
| `start.dateTime/start.date` | `startAt` | timed event는 provider instant, all-day event는 source timezone local 00:00 |
| `end.dateTime/end.date` | `endAt` | Google end exclusive semantics 유지 |
| `start.date/end.date` 존재 여부 | `isAllDay` | all-day event면 `true`, 그 외 `false` |
| `location` | `location` | 200자 제한 |
| `description` | `memo` | 최초 import 때만 HTML 제거/엔티티 decode/trim 후 2000자 제한 |
| 안전 URL 추출 결과 | `meetingUrl` | 아래 우선순위로 첫 안전 `https://` URL 선택 |
| `htmlLink` | `externalHtmlLink` | Google event 원본 링크 |
| `id` | `externalEventId` | unique key |
| `iCalUID` | `externalEventICalUid` | 참고 key |
| `etag` | `externalEventEtag` | 변경 감지 |
| `updated` | `externalUpdatedAt` | 변경 감지 |

Timed/all-day 저장:

- `event.start.dateTime`이 있으면 timed event다.
- timed event의 `startAt/endAt`은 Google이 반환한 RFC3339 instant를 UTC `DateTime`으로 저장한다.
- timed event의 `timeZone`은 `event.start.timeZone || ExternalCalendarSource.calendarTimeZone || currentUser.timeZone || "Asia/Seoul"`이다.
- `event.start.date`가 있으면 all-day event다.
- all-day event의 `startAt`은 `event.start.date`를 source timezone local 00:00으로 해석한 UTC instant다.
- all-day event의 `endAt`은 Google의 exclusive `event.end.date`를 source timezone local 00:00으로 해석한 UTC instant다.
- all-day event의 `isAllDay`는 `true`다.
- timed event의 `isAllDay`는 `false`다.

Meeting URL validation:

- 허용: `https://...`
- 차단: `http://`, `javascript:`, `data:`, `file:`, scheme 없음, 공백만 있는 값
- 저장 전 trim한다.
- URL 추출 우선순위:
  1. `hangoutLink`
  2. `conferenceData.entryPoints[].uri` 중 `entryPointType === "video"`인 첫 값
  3. `description` 안의 URL을 문서 순서대로 스캔한 첫 `https://` 값
  4. `location` 전체 값이 `https://` URL이면 그 값
- 여러 `https://` URL이 있으면 위 우선순위에서 가장 먼저 발견된 1개만 저장한다.
- FE 표시는 domain 중심 label과 external-link icon 버튼을 사용한다.
- 열 때 `target="_blank"`와 `rel="noopener noreferrer"`를 사용한다.

Description -> memo 정규화:

- HTML tag는 제거한다.
- `<br>`, `<p>`, `<div>`, `<li>` 경계는 newline으로 바꾼다.
- HTML entity는 plain text로 decode한다.
- 연속 공백은 single space로 줄인다.
- 연속 newline은 최대 2개로 줄인다.
- trim 후 2000자를 초과하면 2000자에서 자른다.

### Reminder

- Google reminders는 가져오지 않는다.
- Google-origin schedule도 한손 `SCHEDULE_START_REMINDER` 대상이다.
- 사용자의 알림 설정을 따른다.
- 과거 일정은 reminder를 만들지 않는다.
- `startAt` 변경 시 reminder를 재계산한다.
- hidden/deleted schedule은 pending reminder를 취소한다.
- Trash restore 시 reminder를 다시 계산한다.

### Logging

Structured log event key:

| event | 발생 |
|---|---|
| `schedule.google.connect.started` | connect URL 생성 |
| `schedule.google.connect.completed` | token 저장 성공 |
| `schedule.google.connect.failed` | OAuth/provider 실패 |
| `schedule.google.calendar_selection.updated` | 선택 calendar 저장 |
| `schedule.google.sync.started` | sync 시작 |
| `schedule.google.sync.completed` | sync 성공 |
| `schedule.google.sync.failed` | sync 실패 |
| `schedule.google.disconnect.completed` | 연결 해제 |
| `schedule.deleted` | schedule soft delete |
| `schedule.restored` | schedule restore |

Log에 남겨도 되는 값:

- `userId`
- `connectionId`
- `calendarSourceCount`
- `selectedCalendarSourceCount`
- `trigger`
- `rangeStartAt`
- `rangeEndAt`
- count 값
- error code

Log에 남기지 않는 값:

- access token
- refresh token
- authorization code
- provider raw response body
- Google event description 원문
- schedule memo 본문
- provider attendee email
- full meeting URL query string

## 3. 공통 Response Object

### GoogleCalendarConnection

```json
{
  "provider": "GOOGLE",
  "status": "CONNECTED",
  "providerAccountEmail": "sales@example.com",
  "connectedAt": "2026-07-22T01:00:00.000Z",
  "reconnectRequiredAt": null,
  "disconnectedAt": null,
  "lastSyncedAt": "2026-07-22T01:10:00.000Z",
  "lastSyncStartedAt": "2026-07-22T01:10:00.000Z",
  "lastSyncFailedAt": null,
  "lastSyncErrorCode": null,
  "syncLockExpiresAt": null
}
```

### GoogleCalendarSource

```json
{
  "id": "f1bdb58a-5c47-42b3-b02a-5a6d73382198",
  "calendarId": "primary",
  "calendarName": "sales@example.com",
  "calendarTimeZone": "Asia/Seoul",
  "isPrimary": true,
  "isSystemCalendar": false,
  "status": "SELECTED",
  "lastSyncedAt": "2026-07-22T01:10:00.000Z",
  "lastSyncFailedAt": null,
  "lastSyncErrorCode": null
}
```

### ScheduleGoogleCalendar

```json
{
  "sourceId": "f1bdb58a-5c47-42b3-b02a-5a6d73382198",
  "calendarId": "primary",
  "calendarName": "sales@example.com",
  "syncStatus": "LOCAL_MODIFIED",
  "badgeLabel": "Google · 로컬 수정",
  "externalHtmlLink": "https://calendar.google.com/calendar/event?eid=...",
  "lastExternalSyncedAt": "2026-07-22T01:10:00.000Z",
  "externalDeletedAt": null,
  "isHidden": false,
  "canEditLocalFields": true
}
```

### Schedule response extension

기존 `ScheduleResponse`에 아래 필드를 추가한다.

```json
{
  "meetingUrl": "https://meet.google.com/abc-defg-hij",
  "isAllDay": false,
  "sourceType": "GOOGLE",
  "googleCalendar": {
    "sourceId": "f1bdb58a-5c47-42b3-b02a-5a6d73382198",
    "calendarId": "primary",
    "calendarName": "sales@example.com",
    "syncStatus": "SYNCED",
    "badgeLabel": "Google",
    "externalHtmlLink": "https://calendar.google.com/calendar/event?eid=...",
    "lastExternalSyncedAt": "2026-07-22T01:10:00.000Z",
    "externalDeletedAt": null,
    "isHidden": false,
    "canEditLocalFields": true
  },
  "deletedAt": null,
  "trashExpiresAt": null
}
```

Internal schedule:

```json
{
  "meetingUrl": null,
  "isAllDay": false,
  "sourceType": "INTERNAL",
  "googleCalendar": null,
  "deletedAt": null,
  "trashExpiresAt": null
}
```

## 4. POST /api/schedules/google/connect

- API 이름: Google Calendar 연결 시작 API
- API 식별자: `StartGoogleCalendarConnect`
- Method: `POST`
- Path: `/api/schedules/google/connect`
- 인증: AuthGuard
- Request 이름: `StartGoogleCalendarConnectDto`
- Response 이름: `StartGoogleCalendarConnectResponse`

### Request

```json
{
  "returnTo": "/app/schedules"
}
```

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `returnTo` | string | 아니오 | `/app/schedules`, `/app/settings`만 허용. invalid는 fallback | OAuth 완료 후 돌아갈 User Web path |

### Response

Status: `200 OK`

```json
{
  "connectUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "expiresAt": "2026-07-22T01:10:00.000Z",
  "returnTo": "/app/schedules"
}
```

### Business logic

1. 현재 사용자의 `returnTo`를 allowlist로 정규화한다.
2. state nonce를 만들고 user id, returnTo, issuedAt, expiresAt을 서명한다.
3. 확정 OAuth scope와 query parameter로 Google OAuth URL을 만든다.
4. token/code/state 원문은 log에 남기지 않는다.
5. 기존 connection이 `RECONNECT_REQUIRED`여도 같은 API로 재연결 URL을 만든다.

## 5. GET /api/schedules/google/callback

- API 이름: Google Calendar OAuth Callback API
- API 식별자: `HandleGoogleCalendarCallback`
- Method: `GET`
- Path: `/api/schedules/google/callback`
- 인증: OAuth state 기반. Bearer token을 요구하지 않는다.
- Response: HTTP redirect

### Request

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `code` | string | 조건부 | Google authorization code |
| `state` | string | 예 | signed OAuth state |
| `error` | string | 조건부 | Google OAuth denial/error |

### Redirect

성공:

```text
302 /app/schedules?googleCalendar=connected
```

권한 거절:

```text
302 /app/schedules?googleCalendar=denied
```

실패:

```text
302 /app/schedules?googleCalendar=failed
```

### Business logic

1. state 서명, TTL, user id, returnTo를 검증한다.
2. `error`가 있으면 token exchange 없이 returnTo로 실패 redirect한다.
3. `code`를 Google token endpoint에서 교환한다.
4. refresh token이 없고 기존 refresh token도 없으면 연결 실패로 처리한다.
5. ID token signature와 `iss`, `aud`, `exp`를 검증한다.
6. ID token에서 `sub`, `email`, `email_verified`를 검증한다.
7. `sub`가 없거나 `email_verified !== true`이면 연결 실패로 처리한다.
8. `providerAccountId`에는 Google OIDC `sub`를 저장한다.
9. `providerAccountEmail`에는 검증된 email을 저장한다.
10. `ExternalCalendarConnection`을 `CONNECTED`로 upsert한다.
11. encrypted token, scopes, token expiry를 저장한다.
12. callback에서는 대량 event sync를 실행하지 않는다.
13. FE는 redirect 후 status/calendars를 조회하고 calendars 조회를 실행한다.

## 6. GET /api/schedules/google/status

- API 이름: Google Calendar 상태 조회 API
- API 식별자: `GetGoogleCalendarStatus`
- Method: `GET`
- Path: `/api/schedules/google/status`
- 인증: AuthGuard
- Response 이름: `GoogleCalendarStatusResponse`

### Response

Status: `200 OK`

연결 없음:

```json
{
  "connected": false,
  "connection": null,
  "selectedCalendarCount": 0,
  "availableCalendarCount": 0,
  "autoSync": {
    "enabled": false,
    "freshnessMinutes": 10,
    "shouldSyncOnScheduleEntry": false,
    "nextAutoSyncAvailableAt": null
  }
}
```

연결됨:

```json
{
  "connected": true,
  "connection": {
    "provider": "GOOGLE",
    "status": "CONNECTED",
    "providerAccountEmail": "sales@example.com",
    "connectedAt": "2026-07-22T01:00:00.000Z",
    "reconnectRequiredAt": null,
    "disconnectedAt": null,
    "lastSyncedAt": "2026-07-22T01:10:00.000Z",
    "lastSyncStartedAt": "2026-07-22T01:10:00.000Z",
    "lastSyncFailedAt": null,
    "lastSyncErrorCode": null,
    "syncLockExpiresAt": null
  },
  "selectedCalendarCount": 1,
  "availableCalendarCount": 4,
  "autoSync": {
    "enabled": true,
    "freshnessMinutes": 10,
    "shouldSyncOnScheduleEntry": false,
    "nextAutoSyncAvailableAt": "2026-07-22T01:20:00.000Z"
  }
}
```

### Business logic

- connection이 없으면 200 with `connected=false`를 반환한다.
- `CONNECTED`이고 freshness 기준 시각에서 10분 이상 지났으면 `shouldSyncOnScheduleEntry=true`다.
- freshness 기준 시각은 `max(lastSyncedAt, lastSyncStartedAt, lastSyncFailedAt)`이다.
- `RECONNECT_REQUIRED`이면 `connected=true`, `autoSync.enabled=false`다.
- `syncLockExpiresAt > now`이면 `autoSync.shouldSyncOnScheduleEntry=false`다.
- token은 절대 반환하지 않는다.

## 7. GET /api/schedules/google/calendars

- API 이름: Google Calendar 목록 조회 API
- API 식별자: `ListGoogleCalendars`
- Method: `GET`
- Path: `/api/schedules/google/calendars`
- 인증: AuthGuard
- Response 이름: `ListGoogleCalendarsResponse`

### Response

Status: `200 OK`

```json
{
  "connection": {
    "provider": "GOOGLE",
    "status": "CONNECTED",
    "providerAccountEmail": "sales@example.com",
    "connectedAt": "2026-07-22T01:00:00.000Z",
    "reconnectRequiredAt": null,
    "disconnectedAt": null,
    "lastSyncedAt": null,
    "lastSyncStartedAt": null,
    "lastSyncFailedAt": null,
    "lastSyncErrorCode": null
  },
  "calendars": [
    {
      "id": "f1bdb58a-5c47-42b3-b02a-5a6d73382198",
      "calendarId": "primary",
      "calendarName": "sales@example.com",
      "calendarTimeZone": "Asia/Seoul",
      "isPrimary": true,
      "isSystemCalendar": false,
      "status": "SELECTED",
      "lastSyncedAt": null,
      "lastSyncFailedAt": null,
      "lastSyncErrorCode": null
    }
  ]
}
```

### Business logic

1. connection이 없으면 404 `GoogleCalendarConnectionNotFound`.
2. connection이 `RECONNECT_REQUIRED`이면 409 `GoogleCalendarReconnectRequired`.
3. `tokenExpiresAt <= now+60초`이면 access token refresh를 먼저 실행한다.
4. refresh 실패가 `invalid_grant` 또는 revoked 계열이면 connection을 `RECONNECT_REQUIRED`로 바꾸고 409를 반환한다.
5. Google `CalendarList.list`를 `maxResults=250`, `showDeleted=false`, `showHidden=true`로 호출하고 pageToken을 끝까지 순회한다.
6. Google list 결과를 `ExternalCalendarSource`로 upsert한다.
7. 첫 조회 때 `primary === true` calendar를 `SELECTED`로 둔다.
8. system calendar는 `UNSELECTED` 기본값으로 둔다.
9. system calendar 판정은 `calendarId.endsWith("#holiday@group.v.calendar.google.com")` 또는 `calendarId === "addressbook#contacts@group.v.calendar.google.com"`이다.
10. 기존 사용자가 선택한 상태는 provider list refresh 후에도 유지한다.

## 8. PATCH /api/schedules/google/calendars

- API 이름: Google Calendar 선택 저장 API
- API 식별자: `UpdateGoogleCalendarSelection`
- Method: `PATCH`
- Path: `/api/schedules/google/calendars`
- 인증: AuthGuard
- Request 이름: `UpdateGoogleCalendarSelectionDto`
- Response 이름: `ListGoogleCalendarsResponse`

### Request

```json
{
  "selectedCalendarIds": ["primary", "team-sales@example.com"]
}
```

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `selectedCalendarIds` | string[] | 예 | 1개 이상, 중복 없음, 현재 connection calendar id만 허용 | sync 대상 Google calendar ids |

### Response

Status: `200 OK`

`GET /api/schedules/google/calendars`와 같은 shape.

### Business logic

1. connection과 provider calendar list를 확인한다.
2. 요청 ids가 현재 사용자 connection calendar인지 검증한다.
3. 선택된 source는 `SELECTED`, 선택 해제된 source는 `UNSELECTED`로 저장한다.
4. 선택 해제된 source의 기존 active Google-origin schedule은 기본 목록에서 숨긴다.
5. 선택 해제 시 schedule row를 삭제하거나 memo/dealIds를 지우지 않는다.
6. 재선택 시 다음 sync부터 다시 provider 변경을 반영한다.
7. 선택 저장 후 schedule list/week/status query를 invalidation해야 한다.

## 9. POST /api/schedules/google/sync

- API 이름: Google Calendar Sync API
- API 식별자: `SyncGoogleCalendar`
- Method: `POST`
- Path: `/api/schedules/google/sync`
- 인증: AuthGuard
- Request 이름: `SyncGoogleCalendarDto`
- Response 이름: `GoogleCalendarSyncResponse`

### Request

```json
{
  "trigger": "MANUAL"
}
```

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `trigger` | `AUTO` \| `MANUAL` | 아니오 | 기본 `MANUAL` | sync 실행 원인 |

### Response

Status: `200 OK`

```json
{
  "trigger": "MANUAL",
  "connectionStatus": "CONNECTED",
  "rangeStartAt": "2026-06-21T15:00:00.000Z",
  "rangeEndAt": "2026-10-21T15:00:00.000Z",
  "startedAt": "2026-07-22T01:12:00.000Z",
  "finishedAt": "2026-07-22T01:12:03.000Z",
  "selectedCalendarCount": 2,
  "result": {
    "importedCount": 12,
    "updatedCount": 8,
    "localModifiedSkippedCount": 3,
    "googleDeletedCount": 1,
    "hiddenByCalendarSelectionCount": 0,
    "trashedCount": 0,
    "reminderScheduledCount": 15,
    "reminderCanceledCount": 1,
    "errorCount": 0
  },
  "nextAutoSyncAvailableAt": "2026-07-22T01:22:03.000Z"
}
```

### Business logic

1. connection이 없으면 404.
2. `RECONNECT_REQUIRED`이면 409.
3. `syncLockExpiresAt > now`이면 409 `GoogleCalendarSyncInProgress`.
4. `AUTO` trigger이고 10분 freshness가 아직 유효하면 provider call 없이 200을 반환한다. count는 0이다.
5. selected calendar가 없으면 400 `GoogleCalendarSourceSelectionRequired`.
6. connection row에 `syncLockExpiresAt=now+5분`, `lastSyncStartedAt=now`를 저장한다.
7. selected source별로 Google Events.list를 호출한다.
8. source에 `syncToken`이 없으면 full sync를 실행한다.
9. source에 `syncToken`이 있으면 incremental sync를 실행한다.
10. provider가 syncToken 만료/410을 주면 해당 source의 `syncToken=NULL`로 저장하고 full sync를 즉시 다시 실행한다.
11. provider event id 기준 기존 schedule을 찾는다.
12. 새 event는 `Schedule`로 생성한다.
13. 기존 `SYNCED` schedule은 Google title/time/location/meetingUrl/isAllDay/external metadata를 갱신한다.
14. 기존 `LOCAL_MODIFIED` schedule은 external metadata만 갱신하고 로컬 title/time/location/meetingUrl/isAllDay/memo/dealIds를 덮어쓰지 않는다.
15. Google event cancelled/deleted는 `GOOGLE_DELETED`, `externalDeletedAt=now`로 표시하고 pending reminder를 취소한다.
16. selected source에서 더 이상 조회되지 않는 event는 provider 응답이 deletion을 명확히 줄 때만 `GOOGLE_DELETED`로 둔다.
17. Google description은 새 schedule 생성 때만 `memo`에 저장한다.
18. sync로 생성/갱신된 active future schedule은 onehand reminder를 계산한다.
19. sync 성공 시 connection/source의 `lastSyncedAt=finishedAt`, `lastSyncFailedAt=NULL`, `lastSyncErrorCode=NULL`, `syncLockExpiresAt=NULL`을 저장한다.
20. provider auth failure는 connection을 `RECONNECT_REQUIRED`, `syncLockExpiresAt=NULL`로 전환하고 409를 반환한다.
21. transient provider failure는 connection을 유지하고 `lastSyncFailedAt=now`, `lastSyncErrorCode`, `syncLockExpiresAt=NULL`을 저장한 뒤 502를 반환한다.

### Google Events.list provider parameters

Full sync request:

| parameter | value |
|---|---|
| `calendarId` | `ExternalCalendarSource.calendarId` |
| `singleEvents` | `true` |
| `showDeleted` | `true` |
| `orderBy` | `startTime` |
| `timeMin` | sync range start RFC3339 UTC |
| `timeMax` | sync range end RFC3339 UTC |
| `timeZone` | resolved user timezone |
| `maxResults` | `2500` |
| `pageToken` | Google `nextPageToken`이 있을 때만 다음 호출에 사용 |

Full sync 저장:

- 모든 page를 끝까지 가져온다.
- 마지막 page의 `nextSyncToken`을 `ExternalCalendarSource.syncToken`에 저장한다.
- `nextPageToken`이 남아 있으면 `nextSyncToken`을 저장하지 않는다.

Incremental sync request:

| parameter | value |
|---|---|
| `calendarId` | `ExternalCalendarSource.calendarId` |
| `syncToken` | `ExternalCalendarSource.syncToken` |
| `singleEvents` | `true` |
| `showDeleted` | `true` |
| `timeZone` | resolved user timezone |
| `maxResults` | `2500` |
| `pageToken` | Google `nextPageToken`이 있을 때만 다음 호출에 사용 |

Incremental sync 금지 parameter:

- `timeMin`
- `timeMax`
- `orderBy`
- `updatedMin`
- `q`
- `iCalUID`
- `privateExtendedProperty`
- `sharedExtendedProperty`

Incremental sync 적용:

- 기존 schedule이 있는 event는 sync range 밖으로 이동했어도 metadata를 갱신한다.
- 기존 schedule이 없는 event가 현재 sync range와 겹치지 않으면 새 schedule을 만들지 않는다.
- cancelled/deleted event는 기존 schedule이 있을 때만 `GOOGLE_DELETED`로 반영한다.
- 마지막 page의 `nextSyncToken`으로 source `syncToken`을 교체한다.
- 410 Gone은 source local sync state를 버리고 full sync를 다시 실행한다.

Recurring event 처리:

- 04는 recurrence model을 만들지 않는다.
- Google Events.list는 `singleEvents=true`로 호출한다.
- 반복 event instance는 Google이 확장한 instance를 개별 `Schedule` row로 저장한다.
- unique key는 instance의 `event.id`를 사용한다.

## 10. POST /api/schedules/google/disconnect

- API 이름: Google Calendar 연결 해제 API
- API 식별자: `DisconnectGoogleCalendar`
- Method: `POST`
- Path: `/api/schedules/google/disconnect`
- 인증: AuthGuard
- Request 이름: `DisconnectGoogleCalendarDto`
- Response 이름: `DisconnectGoogleCalendarResponse`

### Request

```json
{
  "scheduleAction": "KEEP"
}
```

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleAction` | `KEEP` \| `HIDE` \| `TRASH` | 아니오 | 기본 `KEEP` | 가져온 Google schedule 처리 |

### Response

Status: `200 OK`

```json
{
  "connectionStatus": "DISCONNECTED",
  "scheduleAction": "KEEP",
  "affectedScheduleCount": 24,
  "trashedScheduleCount": 0,
  "hiddenScheduleCount": 0,
  "keptScheduleCount": 24,
  "disconnectedAt": "2026-07-22T01:20:00.000Z"
}
```

### Business logic

1. connection이 없으면 404.
2. encrypted token을 폐기한다.
3. connection을 `DISCONNECTED`로 바꾼다.
4. `KEEP`: active Google-origin schedule을 유지하고 badge는 `Google · 연결 끊김`으로 보이게 한다.
5. `HIDE`: source를 `UNSELECTED`로 바꾸고 active Google-origin schedule을 기본 목록에서 숨긴다.
6. `TRASH`: active Google-origin schedule을 soft delete하고 `LOCAL_DELETED`로 둔다. hard delete가 아니다.
7. `TRASH` 대상 schedule의 pending reminder를 취소한다.
8. memo, dealIds, source metadata는 지우지 않는다.

## 11. 기존 Schedule API 변경 계약

### GET /api/schedules

기존 query에 아래 optional query를 추가한다.

| 필드 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `visibility` | `ACTIVE` \| `HIDDEN_GOOGLE` \| `ALL` | `ACTIVE` | Google hidden schedule 조회 범위 |
| `sourceType` | `ALL` \| `INTERNAL` \| `GOOGLE` | `ALL` | source filter |

기본 조회 조건:

- `deletedAt IS NULL`
- `visibility=ACTIVE`이면 아래 hidden Google schedule 제외:
  - `GOOGLE_DELETED`
  - calendar source `UNSELECTED`
  - disconnect action `HIDE`로 source가 `UNSELECTED` 처리된 schedule
- connection이 `RECONNECT_REQUIRED`인 기존 active Google schedule은 숨기지 않는다. badge만 `Google · 연결 끊김`이다.

Response:

- 기존 `ScheduleResponse`에 `meetingUrl`, `sourceType`, `googleCalendar`, `deletedAt`, `trashExpiresAt` 필드를 추가한다.
- 기존 `ScheduleResponse`에 `isAllDay` 필드를 추가한다.

### GET /api/schedules/:scheduleId

- soft-deleted schedule은 기본 상세에서 404다. Trash detail에서 확인한다.
- hidden Google schedule은 직접 URL 접근 시 현재 사용자의 schedule이면 상세를 반환한다.
- FE는 `googleCalendar.isHidden`으로 hidden banner를 표시한다.

### POST /api/schedules

Request extension:

```json
{
  "scheduleTitle": "제품 데모",
  "startAt": "2026-07-22T02:00:00.000Z",
  "endAt": "2026-07-22T03:00:00.000Z",
  "timeZone": "Asia/Seoul",
  "location": "Zoom",
  "meetingUrl": "https://zoom.us/j/123",
  "memo": "데모 준비",
  "dealIds": ["7d5cf9ef-fcbb-4d4c-b3c0-33ce5f8ef3a0"]
}
```

Business logic:

- client request에 `sourceType`, `externalEventId`, `externalCalendarSourceId`, `externalSyncStatus`가 있으면 400이다.
- 생성 schedule은 항상 `sourceType=INTERNAL`이다.
- `meetingUrl`은 `https://`만 허용한다.
- 생성 후 reminder를 기존 정책대로 계산한다.

### PATCH /api/schedules/:scheduleId

Request extension은 `POST /api/schedules`와 같다. 모든 필드는 optional이다.

Business logic:

- `sourceType=INTERNAL`은 기존 수정 규칙과 동일하다.
- `sourceType=GOOGLE`인 schedule은 title/startAt/endAt/timeZone/location/meetingUrl/memo/dealIds 수정을 허용한다.
- Google-origin schedule에서 허용된 필드 중 하나라도 바뀌면 `externalSyncStatus=LOCAL_MODIFIED`가 된다.
- Google-origin all-day schedule에서 request에 `startAt` 또는 `endAt`이 있으면 저장 후 `isAllDay=false`, `externalSyncStatus=LOCAL_MODIFIED`가 된다.
- memo/dealIds만 바뀐 경우도 `LOCAL_MODIFIED`로 전환한다. 이후 Google sync는 memo/dealIds를 덮어쓰지 않는다.
- source/external 필드 수정 request는 400이다.
- startAt/endAt 변경 시 reminder를 재계산한다.

### DELETE /api/schedules/:scheduleId

Response:

Status: `204 No Content`

Business logic:

- hard delete를 하지 않는다.
- `deletedAt=now`, `deletedByUserId=currentUser.id`, `trashExpiresAt=createTrashRetentionTimestamps(now).trashExpiresAt`으로 soft delete한다.
- 현재 `trashExpiresAt` 정책은 `now+7일`이다.
- `sourceType=GOOGLE`이면 `externalSyncStatus=LOCAL_DELETED`로 둔다.
- `ScheduleDeal`은 삭제하지 않는다.
- pending reminder를 취소한다.
- 기본 schedule list/week/home upcoming에서 제외한다.

## 12. 기존 Weekly Report API 변경 계약

`GET /api/schedules/week`:

- hidden Google schedule과 soft-deleted schedule은 제외한다.
- schedule item에 `meetingUrl`, `sourceType`, `googleCalendar`를 추가한다.
- schedule item에 `isAllDay`를 추가한다.
- 일정 메모 본문은 계속 제외하고 `hasMemo`만 유지한다.

`GET /api/schedules/week/export/xlsx`:

- hidden Google schedule과 soft-deleted schedule은 제외한다.
- column 추가:
  - `출처`
  - `미팅 링크`
- source badge label은 export에는 text로 넣는다.
- meeting URL은 query string 포함 원문을 export에 넣는다. log에는 query string 포함 원문을 남기지 않는다.

## 13. Trash API 변경 계약

### Target type

`TrashTargetType`에 `SCHEDULE`을 추가한다.

`TrashDomainFilter`에 `SCHEDULE`을 추가한다.

### GET /api/trash

- `targetType=SCHEDULE` filter를 지원한다.
- Schedule trash item title은 `scheduleTitle`이다.
- parent는 없다.
- summary는 `일정` domain 기준으로 표시한다.

### GET /api/trash/SCHEDULE/:scheduleId

Response detail fields:

| label | value |
|---|---|
| 일정 시간 | 사용자 timezone 표시 문자열 |
| 장소 | `location` |
| 출처 | source badge |
| 미팅 링크 | meeting URL domain 또는 URL |
| 연결 딜 | 연결된 deal count |

memo 본문은 Trash detail `content`에 넣는다. 단 structured log에는 남기지 않는다.

### POST /api/trash/SCHEDULE/:scheduleId/restore

Business logic:

- `deletedAt/trashExpiresAt`이 없는 schedule은 404.
- restore 시 `deletedAt/deletedByUserId/trashExpiresAt=NULL`.
- Google-origin schedule은 `externalSyncStatus=LOCAL_MODIFIED`로 복구한다.
- future schedule이면 reminder를 다시 계산한다.
- 복구 후 기본 일정 화면에 표시된다.

## 14. Error Contract

| 상황 | HTTP | code | FE message |
|---|---:|---|---|
| 인증 없음 | 401 | `Unauthorized` | 로그인으로 이동 |
| connection 없음 | 404 | `GoogleCalendarConnectionNotFound` | Google Calendar를 연결해 주세요. |
| 재연결 필요 | 409 | `GoogleCalendarReconnectRequired` | Google Calendar를 다시 연결해 주세요. |
| calendar 선택 없음 | 400 | `GoogleCalendarSourceSelectionRequired` | 가져올 캘린더를 선택해 주세요. |
| OAuth state invalid/expired | 400 | `GoogleCalendarOAuthStateInvalid` | 연결을 다시 시작해 주세요. |
| provider auth failure | 409 | `GoogleCalendarReconnectRequired` | Google Calendar를 다시 연결해 주세요. |
| provider transient failure | 502 | `GoogleCalendarProviderUnavailable` | Google Calendar와 연결하지 못했어요. 잠시 후 다시 시도해 주세요. |
| sync 진행 중 | 409 | `GoogleCalendarSyncInProgress` | Google Calendar 동기화가 이미 진행 중이에요. |
| meeting URL invalid | 400 | `ScheduleMeetingUrlInvalid` | `https://`로 시작하는 링크를 입력해 주세요. |
| schedule 없음 또는 타 사용자 | 404 | `ScheduleNotFound` | 일정을 찾을 수 없어요. |

## 15. 구현 검증 기준

- 신규 Google API request/response가 이 문서와 일치한다.
- 기존 Schedule API response type이 FE와 BE에서 동시에 확장된다.
- Schedule hard delete가 남아 있지 않다.
- soft-deleted schedule은 기본 list/week/home upcoming에서 제외된다.
- `SCHEDULE` Trash list/detail/restore가 동작한다.
- Google-origin schedule을 수정하면 local modified 상태가 보존된다.
- Google description은 최초 import 외에는 memo를 덮어쓰지 않는다.
- Google provider auth failure가 `RECONNECT_REQUIRED`로 전환된다.
- token/raw provider body/memo body가 structured log에 남지 않는다.
