# Backend API TODO

상태: Confirmed
최종 업데이트: 2026-07-22
상세 계약: `../COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`

## 1. 신규 Google Calendar API

| Method | Path | 목적 |
|---|---|---|
| `POST` | `/api/schedules/google/connect` | Google Calendar OAuth 연결 URL 생성 |
| `GET` | `/api/schedules/google/callback` | OAuth callback 처리 후 시작 화면으로 redirect |
| `GET` | `/api/schedules/google/status` | 연결 상태 조회 |
| `GET` | `/api/schedules/google/calendars` | 연결 계정의 calendar 목록과 선택 상태 조회 |
| `PATCH` | `/api/schedules/google/calendars` | sync 대상 calendar 선택 저장 |
| `POST` | `/api/schedules/google/sync` | 선택 calendar event sync |
| `POST` | `/api/schedules/google/disconnect` | 연결 해제와 가져온 schedule 처리 |

## 2. 기존 Schedule API 변경

| Method | Path | 변경 |
|---|---|---|
| `GET` | `/api/schedules` | `meetingUrl`, `isAllDay`, `sourceType`, `googleCalendar` 응답 필드 추가. 기본 조회는 soft-deleted/hidden Google schedule 제외 |
| `GET` | `/api/schedules/:scheduleId` | Google source 상태, meeting URL, `isAllDay`, 편집 허용 여부 필드 추가 |
| `POST` | `/api/schedules` | `meetingUrl` request/response 추가. client가 source/external 필드를 지정하는 것은 금지 |
| `PATCH` | `/api/schedules/:scheduleId` | `meetingUrl` request/response 추가. Google-origin schedule의 로컬 수정 상태 전환 |
| `DELETE` | `/api/schedules/:scheduleId` | hard delete에서 soft delete/Trash 이동으로 변경 |
| `GET` | `/api/schedules/week` | Google-origin active schedule과 `meetingUrl`, source badge 포함. hidden/soft-deleted schedule 제외 |
| `GET` | `/api/schedules/week/export/xlsx` | Google source badge와 meeting URL column 포함. hidden/soft-deleted schedule 제외 |

## 3. 기존 Trash API 변경

| Method | Path | 변경 |
|---|---|---|
| `GET` | `/api/trash` | `targetType=SCHEDULE`, `domain=SCHEDULE` 지원 |
| `GET` | `/api/trash/:targetType/:targetId` | `SCHEDULE` 상세 지원 |
| `POST` | `/api/trash/:targetType/:targetId/restore` | `SCHEDULE` 복구 지원. Google-origin이면 `LOCAL_MODIFIED`로 복구 |

## 4. 핵심 비즈니스 로직

- `POST /api/schedules/google/connect`는 `returnTo`를 `/app/schedules`, `/app/settings` 중 하나로 검증하고 signed state를 만든다.
- OAuth callback은 Google ID token의 `iss`, `aud`, `exp`, `sub`, `email`, `email_verified=true`를 검증한 뒤 token을 저장하고, calendar list/sync는 `/api/schedules/google/calendars`, `/api/schedules/google/sync`에서 수행한다.
- `providerAccountId`는 ID token `sub`로 저장하고 API response에는 노출하지 않는다.
- token은 암호화 저장하고 log/response에 절대 노출하지 않는다.
- token encryption key는 `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`, 없으면 `ENCRYPTION_MASTER_KEY`를 사용한다.
- token encryption key가 없으면 Google Calendar API는 500 `GoogleCalendarTokenEncryptionKeyMissing`으로 실패한다.
- `invalid_grant`, revoked, insufficient scope는 connection을 `RECONNECT_REQUIRED`로 바꾸고 자동 sync를 멈춘다.
- `5xx`, network timeout, rate limit은 connection을 끊지 않고 마지막 sync 실패 상태로만 남긴다.
- Google CalendarList.list는 `maxResults=250`, `showDeleted=false`, `showHidden=true`로 모든 page를 조회한다.
- sync는 선택된 calendar만 대상으로 한다.
- sync range는 사용자 timezone 기준 오늘 00:00에서 과거 1개월, 미래 3개월이다.
- sync 중복 실행은 `ExternalCalendarConnection.syncLockExpiresAt=now+5분` lock으로 막고, lock이 살아 있으면 409 `GoogleCalendarSyncInProgress`를 반환한다.
- Google Events.list full sync는 `timeMin`, `timeMax`, `orderBy=startTime`, `singleEvents=true`, `showDeleted=true`, `timeZone`, `maxResults=2500`을 사용한다.
- Google Events.list incremental sync는 `syncToken`, `singleEvents=true`, `showDeleted=true`, `timeZone`, `maxResults=2500`을 사용하고 `timeMin/timeMax/orderBy`를 보내지 않는다.
- Google Events.list 410 응답은 source `syncToken`을 비우고 full sync를 다시 수행한다.
- 중복 import 기준은 `userId + externalCalendarSourceId + externalEventId` unique다.
- `SYNCED` schedule만 Google 변경으로 title/time/location/meetingUrl/isAllDay를 갱신한다.
- `LOCAL_MODIFIED` schedule은 Google sync가 로컬 필드를 덮어쓰지 않는다.
- Google all-day event는 `isAllDay=true`와 source timezone day boundary로 저장한다.
- Google-origin all-day schedule에서 사용자가 `startAt` 또는 `endAt`을 수정하면 `isAllDay=false`, `LOCAL_MODIFIED`로 전환한다.
- Google event cancelled/deleted는 `GOOGLE_DELETED`로 보존하고 기본 목록에서 숨긴다.
- calendar 선택 해제 schedule은 숨김/보존한다.
- disconnect `KEEP`은 schedule을 유지하고 badge를 `Google · 연결 끊김`으로 표시한다.
- disconnect `HIDE`는 Google-origin schedule을 기본 목록에서 숨긴다.
- disconnect `TRASH`는 Google-origin schedule을 soft delete로 휴지통에 보낸다.
- 일정 삭제는 모든 source에서 soft delete다. `trashExpiresAt`은 `createTrashRetentionTimestamps(now)` 기준 현재 `now+7일`이다. pending schedule reminder는 취소한다.
- 일정 복구 시 reminder를 다시 계산한다.

## 5. DTO/Response 작업

- `CreateScheduleDto`, `UpdateScheduleDto`, FE schema에 `meetingUrl?: string | null` 추가
- `ScheduleResponse`와 FE type에 `isAllDay: boolean` 추가. 내부 일정 생성/수정 request는 04에서 `isAllDay`를 받지 않고 기본 `false`다.
- `ListSchedulesQueryDto`에 `visibility?: ACTIVE | HIDDEN_GOOGLE | ALL`, `sourceType?: ALL | INTERNAL | GOOGLE` 추가
- `ScheduleResponse`에 `meetingUrl`, `isAllDay`, `sourceType`, `googleCalendar`, `deletedAt`, `trashExpiresAt` 추가
- Google Calendar 전용 DTO 추가:
  - `StartGoogleCalendarConnectDto`
  - `GoogleCalendarStatusResponse`
  - `GoogleCalendarSourceResponse`
  - `UpdateGoogleCalendarSelectionDto`
  - `SyncGoogleCalendarDto`
  - `GoogleCalendarSyncResponse`
  - `DisconnectGoogleCalendarDto`

## 6. Error code

| 상황 | HTTP | code |
|---|---:|---|
| 연결 없음 | 404 | `GoogleCalendarConnectionNotFound` |
| 재연결 필요 | 409 | `GoogleCalendarReconnectRequired` |
| calendar 선택 없음 | 400 | `GoogleCalendarSourceSelectionRequired` |
| OAuth state invalid/expired | 400 | `GoogleCalendarOAuthStateInvalid` |
| provider 권한 거절 | redirect | `googleCalendar=denied` |
| provider 일시 실패 | 502 | `GoogleCalendarProviderUnavailable` |
| meeting URL validation 실패 | 400 | `ScheduleMeetingUrlInvalid` |
| sync 진행 중 | 409 | `GoogleCalendarSyncInProgress` |
| token encryption key 없음 | 500 | `GoogleCalendarTokenEncryptionKeyMissing` |

## 7. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- schedule
pnpm run test -- notification
pnpm run test -- trash
pnpm run build
```
