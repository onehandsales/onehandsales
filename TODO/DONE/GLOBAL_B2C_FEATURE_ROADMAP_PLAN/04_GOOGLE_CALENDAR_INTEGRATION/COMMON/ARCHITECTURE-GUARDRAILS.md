# Architecture Guardrails

상태: Confirmed
최종 업데이트: 2026-07-22

## 1. 선행 기준

- Backend/DB/Frontend 구조는 `AGENT/SOFTWARE_AGENT`를 따른다.
- UX/UI와 문구는 `AGENT/UXUI_AGENT`를 따른다.
- API 계약은 `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`를 우선한다.
- DB migration을 만든다.
- DB 관련 코드와 Prisma schema에는 한글 `/// 기능 : ...` 또는 `// 기능 : ...` 주석을 둔다.

## 2. Backend 계층

- controller는 request validation과 application service 호출만 담당한다.
- application service는 Prisma를 직접 import하지 않는다.
- provider 호출은 Google Calendar provider port/adapter로 격리한다.
- token 암호화/복호화는 `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT` application port와 infrastructure adapter로 감싼다.
- token 암호화 key 우선순위는 `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`, `ENCRYPTION_MASTER_KEY`다.
- sync business logic은 controller가 아니라 application use case에서 처리한다.
- sync 중복 실행 방지는 `ExternalCalendarConnection.syncLockExpiresAt=now+5분`으로 처리한다.
- sync 중 Schedule 생성/수정, source metadata 갱신, reminder 생성/취소는 provider page 단위 또는 source 단위의 짧은 transaction에서 처리한다.
- provider 호출 자체는 DB transaction 밖에서 수행하고, provider response를 정규화한 뒤 짧은 DB transaction으로 저장한다.
- ownership 조건은 모든 repository method에 `userId`로 들어간다.

## 3. DB/Migration

- 기존 schedule row는 `sourceType=INTERNAL`으로 migrate한다.
- 기존 schedule row의 `deletedAt/trashExpiresAt`은 `NULL`이다.
- Google token field는 nullable로 두고 disconnect 시 폐기할 수 있어야 한다.
- `ExternalCalendarConnection.syncLockExpiresAt`을 추가한다.
- `ExternalCalendarConnection`은 04에서 사용자당 provider 1개 unique로 시작한다.
- `ExternalCalendarConnection.providerAccountId`에는 Google OIDC `sub`를 저장하고 API response에는 노출하지 않는다.
- `ExternalCalendarConnection.providerAccountEmail`은 사용자 표시용 email로만 사용한다.
- `ExternalCalendarSource`는 calendar id별 선택 상태와 sync token을 저장한다.
- `Schedule`은 Google event mapping을 직접 가진다. 04에서 event mapping table을 만들지 않는다.
- `ScheduleDeal` row는 schedule soft delete 때 삭제하지 않는다.
- 모든 schedule 기본 조회에는 `deletedAt IS NULL`을 추가한다.

## 4. Schedule/Trash

- `DELETE /api/schedules/:scheduleId`는 hard delete가 아니다.
- schedule 삭제는 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 채우고 pending reminder를 취소한다.
- `trashExpiresAt`은 `createTrashRetentionTimestamps(now)`를 사용하며 현재 정책은 `now+7일`이다.
- Google-origin schedule 삭제는 `externalSyncStatus=LOCAL_DELETED`를 함께 저장한다.
- Trash restore는 schedule soft delete fields를 비우고, Google-origin이면 `LOCAL_MODIFIED`로 복구한다.
- Trash restore 후 future schedule reminder를 다시 계산한다.
- 기존 Trash module에 `SCHEDULE` target/domain을 추가하되 기존 target type 동작을 깨지 않는다.

## 5. Google Sync

- Google Calendar scope는 login OAuth와 분리한다.
- 04 Calendar OAuth scope는 `openid`, `email`, `https://www.googleapis.com/auth/calendar.readonly`로 고정한다.
- callback은 ID token signature와 `iss`, `aud`, `exp`, `sub`, `email`, `email_verified=true`를 검증한다.
- 실제 provider 연결 env:
  - `GOOGLE_CALENDAR_CLIENT_ID`
  - `GOOGLE_CALENDAR_CLIENT_SECRET`
  - `GOOGLE_CALENDAR_REDIRECT_URI`
- 실제 provider 연결 env 외 token 암호화 env:
  - `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`
  - `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY_VERSION`
  - fallback: `ENCRYPTION_MASTER_KEY`, `ENCRYPTION_KEY_VERSION`
- provider token/code/raw body는 log와 response에 남기지 않는다.
- `providerAccountId`는 response/log에 남기지 않는다.
- sync range는 사용자 timezone 기준 오늘 00:00에서 과거 1개월, 미래 3개월이다.
- selected calendar만 sync한다.
- primary calendar는 최초 기본 selected다.
- Google CalendarList.list는 `maxResults=250`, `showDeleted=false`, `showHidden=true`로 모든 page를 조회한다.
- Google Events.list full sync는 `singleEvents=true`, `showDeleted=true`, `orderBy=startTime`, `timeMin`, `timeMax`, `timeZone`, `maxResults=2500`으로 호출한다.
- Google Events.list incremental sync는 `syncToken`, `singleEvents=true`, `showDeleted=true`, `timeZone`, `maxResults=2500`으로 호출하고 `timeMin/timeMax/orderBy`를 보내지 않는다.
- Google event create/update/delete는 idempotent해야 한다.
- duplicate 방지는 `userId + externalCalendarSourceId + externalEventId` unique로 한다.
- `LOCAL_MODIFIED` schedule의 title/time/location/meetingUrl/isAllDay/memo/dealIds는 sync가 덮어쓰지 않는다.
- Google description은 최초 import 때만 `Schedule.memo`에 저장한다.
- meeting URL은 `hangoutLink`, video `conferenceData.entryPoints[].uri`, description 첫 `https://` URL, location 전체값이 `https://` URL인 경우 순서로 저장한다.
- all-day Google event는 `Schedule.isAllDay=true`로 저장한다.

## 6. Notification

- Google reminders는 import하지 않는다.
- Google-origin schedule도 한손 `SCHEDULE_START_REMINDER`를 사용한다.
- hidden/deleted schedule은 pending reminder를 취소한다.
- `startAt` 변경과 restore는 reminder 재계산 대상이다.
- 과거 schedule reminder 생성 금지는 기존 알림 정책을 따른다.

## 7. Frontend

- `/app/schedules`는 작업 화면이다. landing/hero 설명 화면을 만들지 않는다.
- `/app/settings`는 연결 설정과 disconnect/manage selection을 담당한다.
- schedule form은 `meetingUrl`을 추가하되 source/external 필드는 숨긴다.
- schedule form은 04에서 `isAllDay` 입력을 추가하지 않는다. Google all-day schedule은 detail/list/week에서 `종일`로 표시한다.
- Google-origin schedule도 동일한 form으로 수정한다.
- Google-origin all-day schedule에서 사용자가 start/end를 수정하면 `isAllDay=false`, `LOCAL_MODIFIED`로 저장한다.
- source badge는 compact하게 표시하고 긴 텍스트가 모바일에서 겹치지 않게 한다.
- reconnect/provider failure 문구는 내부 error code를 노출하지 않는다.
- sync success toast를 띄우지 않고 status row의 `마지막 동기화 방금 전` 문구만 갱신한다.

## 8. Observability

- operation log는 sync/connection/debug에 필요한 count와 error code만 남긴다.
- token, provider raw body, memo body, description 원문, attendee email, full meeting URL query string은 log에 남기지 않는다.
- product analytics taxonomy는 04에서 만들지 않는다.

## 9. 금지

- Google Calendar write/export API 구현 금지
- Google webhook/watch channel 구현 금지
- 반복 일정 정식 모델 구현 금지
- attendee import/contact auto-link 구현 금지
- 여러 Google 계정 동시 연결 구현 금지
- Admin provider failure 화면 구현 금지
- DB seed나 기존 사용자 데이터 파괴 작업 금지
