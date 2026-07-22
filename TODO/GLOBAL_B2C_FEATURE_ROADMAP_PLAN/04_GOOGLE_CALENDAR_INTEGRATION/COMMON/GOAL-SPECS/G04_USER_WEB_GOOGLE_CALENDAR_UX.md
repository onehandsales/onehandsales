# G04 User Web Google Calendar UX

상태: Ready

## 1. 목적

User Web에서 Google Calendar 연결, calendar 선택, sync, source badge, meeting URL, soft delete/restore UX를 구현한다.

## 2. 선행 조건

- G02/G03 Backend API가 구현되어 있다.
- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`를 먼저 읽는다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽는다.
- `FE-TODO/USER-WEB-TODO.md`를 먼저 읽는다.

## 3. 포함 범위

- schedule API client/type/schema 확장
- Google Calendar API client/hooks/query keys
- `/app/schedules` connection/status/calendar summary/manual sync/hidden filter
- `/app/settings` connection/reconnect/manage calendars/disconnect
- calendar selection modal
- OAuth redirect result 처리
- schedule form `meetingUrl` field
- schedule list/detail/week source badge와 meeting URL button
- Google-origin schedule local edit UX
- disconnect modal `KEEP/HIDE/TRASH`
- Trash `SCHEDULE` type 표시/restore
- cache invalidation
- responsive/mobile layout 검증

## 4. 제외 범위

- Backend 구현
- 실제 Google provider smoke
- landing/marketing 설명 화면
- Google export/write UX
- webhook/watch UX
- 반복 일정 UI
- attendee/contact auto-link UI

## 5. API Client 작업

- `features/schedule/api/schedule-api.ts`
  - `startGoogleCalendarConnect`
  - `getGoogleCalendarStatus`
  - `listGoogleCalendars`
  - `updateGoogleCalendarSelection`
  - `syncGoogleCalendar`
  - `disconnectGoogleCalendar`
- `features/schedule/api/schedule-query-keys.ts`
  - google status/calendars keys
- `features/schedule/hooks`
  - query/mutation hooks 추가
- `features/schedule/types/schedule.ts`
  - `meetingUrl`
  - `isAllDay`
  - `sourceType`
  - `googleCalendar`
  - Google calendar status/source/sync types
- `features/schedule/schemas/schedule-schema.ts`
  - `meetingUrl` `https://` validation
  - `isAllDay` input은 추가하지 않는다.
- `features/trash/types/trash.ts`
  - `SCHEDULE` target/domain 추가

## 6. /app/schedules UX

- 첫 진입 시 `getGoogleCalendarStatus`를 조회한다.
- connection이 없으면 compact 연결 CTA를 표시한다.
- connection이 `CONNECTED`이면 last sync, selected calendar count, manual sync button을 표시한다.
- `shouldSyncOnScheduleEntry=true`면 자동 sync mutation을 조용히 실행한다.
- manual sync pending 중 버튼 disabled.
- manual sync 성공 또는 실패 응답 후 10초 동안 같은 버튼 disabled.
- sync success 문구는 status row의 `마지막 동기화 방금 전` 갱신으로 처리한다.
- sync failure 문구는 status row에 `Google Calendar와 연결하지 못했어요. 다시 시도해 주세요.`로 표시한다.
- hidden filter:
  - `기본 일정`
  - `숨긴 Google 일정`
  - `전체`
- schedule cards/rows에 source badge와 meeting URL icon button을 표시한다.

## 7. /app/settings UX

- Google Calendar integration section을 추가한다.
- 연결 없음: 연결 버튼
- 연결됨: 계정 email, status, selected calendar count, last sync
- 재연결 필요: 재연결 버튼과 간결한 안내
- manage calendars: `캘린더 선택` 버튼으로 calendar selection modal open
- disconnect: `KEEP/HIDE/TRASH` modal
- disconnect default: `KEEP`

## 8. Calendar selection UX

- checkbox list로 제공한다.
- primary calendar는 기본 checked.
- system calendar는 label로 구분하고 기본 unchecked.
- calendar name이 길면 ellipsis/wrap 처리.
- 저장 후 status/calendars/schedules/week query invalidation.
- 선택 해제 안내는 "기존 일정은 삭제되지 않고 기본 화면에서 숨겨집니다." 수준으로 간결하게 둔다.

## 9. Schedule form/detail UX

- `meetingUrl` input 추가.
- `https://`만 허용하고 error copy는 `https://로 시작하는 링크를 입력해 주세요.`
- Google-origin schedule도 일반 일정과 같은 form으로 수정한다.
- source/external fields는 form에 노출하지 않는다.
- `isAllDay=true` schedule은 list/detail/week에서 시간 대신 `종일`을 표시한다.
- 04의 schedule form은 종일 토글을 제공하지 않는다.
- Google-origin all-day schedule에서 사용자가 `startAt` 또는 `endAt`을 수정해 저장하면 시간 지정 일정으로 전환된다.
- title/time/location/meetingUrl/memo/dealIds 중 하나라도 수정하면 badge가 `Google · 로컬 수정`으로 갱신된다.
- detail에는 meeting URL button을 domain label과 external-link icon으로 표시한다.
- `externalHtmlLink`가 있으면 `Google에서 열기` secondary action을 표시한다.

## 10. Trash UX

- Trash filter/type label에 `일정`을 추가한다.
- Schedule trash item detail fields:
  - 일정 시간
  - 장소
  - 출처
  - 미팅 링크
  - 연결 딜
- restore 후 schedule list/week/home/trash query invalidation.
- Google-origin restore 후 badge는 `Google · 로컬 수정`.

## 11. Responsive/UXUI

- card-in-card layout을 피한다.
- 작업 화면 밀도를 유지한다.
- source badge는 compact pill로 처리하되 text overflow를 막는다.
- icon button에는 tooltip/aria-label을 둔다.
- calendar selection과 disconnect modal은 모바일에서 화면 밖으로 넘치지 않는다.
- 긴 URL, calendar name, schedule title이 서로 겹치지 않게 min-width, overflow, wrap을 설정한다.

## 12. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

G04 완료 전 dev server로 수동 브라우저 검증을 실행한다. 실행할 수 없으면 완료 보고에 이유를 기록한다.

```powershell
cd FE/user-web
pnpm run dev
```

## 13. 완료 기준

- `/app/schedules`와 `/app/settings`에서 연결 상태가 일관되게 표시된다.
- OAuth redirect 결과가 시작 화면에서 처리된다.
- calendar 선택 저장과 manual sync가 cache를 갱신한다.
- Google badge 4종이 확정 문구와 일치한다.
- hidden Google filter가 동작한다.
- meeting URL 표시/수정/validation이 동작한다.
- disconnect `KEEP/HIDE/TRASH` UX가 API와 일치한다.
- Google-origin all-day schedule이 `종일`로 표시되고 start/end 수정 후 `Google · 로컬 수정`으로 전환된다.
- `/app/trash`에서 `SCHEDULE` 복구가 동작한다.
- desktop/mobile에서 text overlap이 없다.
