# G03 Backend Calendar List Sync

상태: Ready

## 1. 목적

Google calendar list/selection과 selected calendar event sync를 구현하고, 기존 Schedule API response를 Google source 계약에 맞게 확장한다.

## 2. 선행 조건

- G02가 완료되어 DB schema, connection/status/disconnect, Schedule soft delete가 동작한다.
- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`를 먼저 읽는다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽는다.

## 3. 포함 범위

- Google calendar list provider adapter
- `GET /api/schedules/google/calendars`
- `PATCH /api/schedules/google/calendars`
- `POST /api/schedules/google/sync`
- selected calendar sync
- syncToken 저장과 만료 fallback
- Google event -> Schedule field mapping
- Google description -> `Schedule.memo` 최초 import
- meeting URL extraction/validation
- local modified overwrite 방지
- Google deleted/cancelled hidden state
- calendar 선택 해제 hidden state
- provider auth/transient error mapping
- Google Events.list full/incremental request parameter 분리
- 기존 `GET /api/schedules` response 확장
- 기존 `GET /api/schedules/:scheduleId` response 확장
- 기존 `POST/PATCH /api/schedules` `meetingUrl` 지원
- weekly report API에 source/meetingUrl 확장
- Backend unit/controller/provider adapter test

## 4. 제외 범위

- OAuth connection foundation 수정
- User Web 구현
- 실제 Google provider smoke
- Google export/write
- webhook/watch
- 반복 일정 정식 모델
- attendee import/contact auto-link

## 5. Calendar list/selection API

### GET /api/schedules/google/calendars

Business logic:

- connection 없음: 404
- reconnect required: 409
- `tokenExpiresAt <= now+60초`이면 access token refresh
- refresh 실패가 `invalid_grant` 또는 revoked 계열이면 `RECONNECT_REQUIRED`
- Google CalendarList.list는 `maxResults=250`, `showDeleted=false`, `showHidden=true`로 모든 page 조회
- `ExternalCalendarSource` upsert
- primary calendar 최초 `SELECTED`
- system calendar 기본 `UNSELECTED`
- system calendar 판정: `calendarId.endsWith("#holiday@group.v.calendar.google.com")` 또는 `calendarId === "addressbook#contacts@group.v.calendar.google.com"`
- 기존 선택 상태 유지

### PATCH /api/schedules/google/calendars

Request:

```json
{
  "selectedCalendarIds": ["primary", "team-sales@example.com"]
}
```

Business logic:

- selected ids 1개 이상
- 현재 사용자 connection calendar만 허용
- 선택 해제 source schedule은 기본 목록에서 숨김
- schedule/memo/dealIds 물리 삭제 금지
- 재선택 시 sync 재개

## 6. Sync API

### POST /api/schedules/google/sync

Request:

```json
{
  "trigger": "MANUAL"
}
```

Response count:

- `importedCount`
- `updatedCount`
- `localModifiedSkippedCount`
- `googleDeletedCount`
- `hiddenByCalendarSelectionCount`
- `trashedCount`
- `reminderScheduledCount`
- `reminderCanceledCount`
- `errorCount`

Business logic:

1. connection과 selected source를 검증한다.
2. `syncLockExpiresAt > now`이면 409 `GoogleCalendarSyncInProgress`.
3. `AUTO` trigger는 10분 freshness가 유효하면 provider call 없이 200을 반환한다.
4. sync 시작 시 `syncLockExpiresAt=now+5분`, `lastSyncStartedAt=now`를 저장한다.
5. 사용자 timezone 기준 오늘 00:00에서 과거 1개월/미래 3개월 range를 계산한다.
6. selected source별로 provider event를 가져온다.
7. full sync는 `singleEvents=true`, `showDeleted=true`, `orderBy=startTime`, `timeMin`, `timeMax`, `timeZone`, `maxResults=2500`으로 호출한다.
8. incremental sync는 `syncToken`, `singleEvents=true`, `showDeleted=true`, `timeZone`, `maxResults=2500`으로 호출하고 `timeMin/timeMax/orderBy`를 보내지 않는다.
9. syncToken 410이면 source `syncToken=NULL` 저장 후 full sync를 재실행한다.
10. 새 Google event는 `Schedule`로 생성한다.
11. 기존 `SYNCED` schedule은 Google field를 갱신한다.
12. 기존 `LOCAL_MODIFIED` schedule은 로컬 field를 덮어쓰지 않는다.
13. cancelled/deleted event는 `GOOGLE_DELETED`로 두고 reminder를 취소한다.
14. 생성/갱신된 active future schedule은 reminder를 계산한다.
15. 성공/실패 모든 종료 경로에서 `syncLockExpiresAt=NULL`로 비운다.
16. provider auth failure는 connection을 `RECONNECT_REQUIRED`로 바꾼다.
17. transient provider failure는 connection 유지, failure code/time 저장이다.

## 7. Field mapping

- `summary` -> `scheduleTitle`, 없으면 `(제목 없음)`
- `start/end` -> `startAt/endAt/timeZone`
- `start.date/end.date` -> `isAllDay=true`, source timezone local 00:00 boundary
- `location` -> `location`
- `description` -> 최초 import `memo`
- `hangoutLink`, video `conferenceData.entryPoints[].uri`, description 첫 `https://` URL, location 전체값이 `https://` URL인 경우 순서 -> `meetingUrl`
- `htmlLink` -> `externalHtmlLink`
- `id` -> `externalEventId`
- `iCalUID` -> `externalEventICalUid`
- `etag` -> `externalEventEtag`
- `updated` -> `externalUpdatedAt`

## 8. 기존 Schedule API 확장

- `CreateScheduleDto`, `UpdateScheduleDto`에 `meetingUrl?: string | null`
- client source/external field 지정은 400
- `ScheduleResponse`에 `meetingUrl`, `isAllDay`, `sourceType`, `googleCalendar`, `deletedAt`, `trashExpiresAt`
- `ListSchedulesQueryDto`에 `visibility`, `sourceType`
- 기본 list/detail/week/export에서 soft-deleted schedule 제외
- `visibility=ACTIVE`에서 Google hidden status 제외
- `RECONNECT_REQUIRED` active schedule은 표시하고 badge만 연결 끊김
- Google-origin local edit 시 `LOCAL_MODIFIED`
- `isAllDay`는 04에서 client request로 받지 않는다. Google import와 response 표시만 처리한다.
- Google-origin all-day schedule에서 request에 `startAt` 또는 `endAt`이 있으면 `isAllDay=false`, `LOCAL_MODIFIED`로 저장한다.

## 9. Weekly Report 확장

- `GET /api/schedules/week` schedule item에 `meetingUrl`, `isAllDay`, `sourceType`, `googleCalendar`
- Excel export에 `출처`, `미팅 링크`
- hidden/soft-deleted schedule 제외
- memo 본문은 계속 제외

## 10. Reminder

- Google reminders import 금지
- sync import/update active future schedule은 `SCHEDULE_START_REMINDER` 계산
- Google deleted/hidden/deleted schedule은 pending reminder 취소
- local edit startAt 변경은 reminder 재계산

## 11. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- schedule
pnpm run test -- notification
pnpm run build
```

## 12. 완료 기준

- calendar list/selection/sync API가 spec과 일치한다.
- primary default selected와 system calendar default unselected가 테스트됐다.
- selected calendar만 sync된다.
- duplicate import가 방지된다.
- `LOCAL_MODIFIED` schedule이 provider sync로 덮어써지지 않는다.
- Google deleted/cancelled schedule이 hard delete되지 않는다.
- description은 최초 import 외에 memo를 덮어쓰지 않는다.
- meeting URL은 `hangoutLink`, video conference URI, description 첫 `https://` URL, location `https://` URL 순서로 저장된다.
- all-day event가 `isAllDay=true`와 local day boundary로 저장된다.
- Google-origin all-day schedule의 start/end 수정이 `isAllDay=false`, `LOCAL_MODIFIED`로 저장된다.
- Schedule list/detail/week/export response가 FE 계약과 일치한다.
- provider auth/transient failure mapping이 테스트됐다.
