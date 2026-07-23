# Review Checklist

상태: Done
최종 업데이트: 2026-07-23

## 1. 계약 일치

- [x] `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`와 구현 API가 일치한다.
- [x] `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`, `FE-TODO/USER-WEB-TODO.md`와 충돌이 없다.
- [x] 기존 Schedule/Trash/Weekly Report API 타입이 FE/BE에서 동시에 갱신됐다.
- [x] DB migration이 Prisma schema와 일치한다.

근거:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260723010000_google_calendar_integration/migration.sql`
- `BE/src/modules/schedule`
- `BE/src/modules/trash`
- `FE/user-web/src/features/schedule`
- `FE/user-web/src/features/trash`

## 2. Backend

- [x] Google login OAuth와 Calendar OAuth scope가 분리되어 있다.
- [x] Calendar OAuth scope가 `openid`, `email`, `https://www.googleapis.com/auth/calendar.readonly` 3개로 고정되어 있다.
- [x] OAuth URL에 `response_type=code`, `access_type=offline`, `prompt=consent`, `include_granted_scopes=true`가 있다.
- [x] callback에서 Google ID token의 `iss`, `aud`, `exp`, `sub`, `email`, `email_verified=true`를 검증한다.
- [x] `providerAccountId`에 Google OIDC `sub`를 저장하고 API response에는 노출하지 않는다.
- [x] OAuth state allowlist(`/app/schedules`, `/app/settings`)와 10분 TTL 검증이 있다.
- [x] token/code/raw provider body가 log/response에 노출되지 않는다.
- [x] Calendar token encryption key가 없을 때 Google Calendar API가 500 `GoogleCalendarTokenEncryptionKeyMissing`으로 실패한다.
- [x] connection/status/connect/callback/disconnect API가 ownership 기준을 지킨다.
- [x] calendar list/selection API가 primary default selected와 system calendar default unselected를 지킨다.
- [x] Google CalendarList.list가 `maxResults=250`, `showDeleted=false`, `showHidden=true`로 모든 page를 조회한다.
- [x] sync가 selected calendar만 대상으로 한다.
- [x] sync range가 사용자 timezone 기준 과거 1개월/미래 3개월이다.
- [x] sync 중복 실행이 `syncLockExpiresAt=now+5분` lock과 409 `GoogleCalendarSyncInProgress`로 막힌다.
- [x] Google Events.list full sync와 incremental sync 파라미터가 분리되어 있다.
- [x] incremental sync에서 `timeMin/timeMax/orderBy`를 보내지 않는다.
- [x] Google sync token 410 응답 시 source `syncToken`을 비우고 full sync로 재시도한다.
- [x] duplicate import 방지 unique 기준이 있다.
- [x] `SYNCED`와 `LOCAL_MODIFIED` overwrite 정책이 테스트됐다.
- [x] all-day event가 `isAllDay=true`와 source timezone day boundary로 저장된다.
- [x] Google deleted/cancelled event가 hard delete되지 않는다.
- [x] provider auth failure가 `RECONNECT_REQUIRED`로 전환된다.
- [x] transient provider failure가 connection을 끊지 않는다.

근거:

- `google-calendar-connection.service.ts`, `google-calendar-oauth.provider.ts`, `node-google-calendar-token-encryption.adapter.ts`
- `google-calendar-sync.service.ts`, `google-calendar-read.provider.ts`, `prisma-google-calendar-sync.repository.ts`
- `google-calendar-connection.service.spec.ts`, `google-calendar-sync.service.spec.ts`, `google-calendar-read.provider.spec.ts`
- `prisma-google-calendar-connection.repository.spec.ts`, `prisma-google-calendar-sync.repository.spec.ts`

## 3. Schedule/Trash/Reminder

- [x] `DELETE /api/schedules/:scheduleId`가 hard delete를 하지 않는다.
- [x] schedule soft delete가 `deletedAt/deletedByUserId/trashExpiresAt`을 채운다.
- [x] `trashExpiresAt`은 `createTrashRetentionTimestamps(now)` 기준 `now+7일`이다.
- [x] soft-deleted schedule은 기본 list/week/home upcoming에서 제외된다.
- [x] `SCHEDULE` Trash list/detail/restore가 동작한다.
- [x] Google-origin restore가 `LOCAL_MODIFIED`로 복구된다.
- [x] schedule delete/hidden/Google deleted에서 pending reminder가 취소된다.
- [x] restore/future schedule/update에서 reminder가 다시 계산된다.
- [x] Google reminders는 import되지 않는다.

근거:

- `schedule-application.service.ts`
- `prisma-schedule.repository.ts`
- `prisma-trash.repository.ts`
- `trash-application.service.ts`
- `schedule-application.service.spec.ts`
- `trash-application.service.spec.ts`
- `prisma-trash.repository.spec.ts`

G05 보정:

- `SCHEDULE` Trash detail의 `Schedule time`, `Location`, `Linked deals` label을 API 계약의 `일정 시간`, `장소`, `연결 딜`로 수정했다.
- internal schedule의 Trash source label을 사용자 문구에 맞춰 `한손`으로 수정했다.

## 4. Frontend

- [x] `/app/schedules`에 compact connection/status/sync UI가 있다.
- [x] `/app/settings`에 reconnect/manage calendars/disconnect UI가 있다.
- [x] calendar selection modal에서 primary와 system calendar 표시 정책이 맞다.
- [x] manual sync pending/rapid click guard가 있다.
- [x] source badge 문구가 확정값과 일치한다.
- [x] hidden Google filter가 기본 일정과 분리되어 있다.
- [x] schedule form/detail/list/week에 meeting URL이 표시/수정된다.
- [x] `meetingUrl`은 `https://`만 허용한다.
- [x] `isAllDay=true` schedule은 list/detail/week에서 `종일`로 표시된다.
- [x] Google-origin all-day schedule에서 start/end를 수정하면 `isAllDay=false`, `LOCAL_MODIFIED`가 된다.
- [x] disconnect modal이 `KEEP`, `HIDE`, `TRASH`를 제공하고 기본값은 `KEEP`이다.
- [x] `/app/trash`에서 `SCHEDULE` 복구가 동작한다.
- [x] 모바일/데스크톱 text overlap이 없다.

근거:

- `FE/user-web/src/features/schedule/components/schedule-screen.tsx`
- `FE/user-web/src/features/schedule/components/google-calendar-settings-section.tsx`
- `FE/user-web/src/features/schedule/components/schedule-form-dialog.tsx`
- `FE/user-web/src/features/schedule/components/schedule-detail-screen.tsx`
- `FE/user-web/src/features/schedule/components/schedule-week-report-screen.tsx`
- `FE/user-web/tests/e2e/google-calendar-ux.spec.ts`
- `FE/user-web/tests/e2e/weekly-schedule-report-ux.spec.ts`

## 5. 검증 명령

Backend:

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- schedule
pnpm run test -- notification
pnpm run test -- trash
pnpm run test -- ownership
pnpm run build
```

결과: 통과.

Frontend:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm exec playwright test tests/e2e/google-calendar-ux.spec.ts --project=chromium
pnpm exec playwright test tests/e2e/weekly-schedule-report-ux.spec.ts --project=chromium
```

결과: 통과.

참고:

- G04 Playwright를 build/다른 Playwright와 병렬 실행했을 때 dev server 대기 중 1회 timeout이 있었고, 단독 재실행은 3/3 통과했다.
- FE build의 Tailwind `duration-[500ms]` ambiguous class 경고와 Vite chunk size 경고는 기존 경고이며 G05 blocker가 아니다.

## 6. 실제 Google provider smoke

- 자동 테스트와 코드 검증 통과로 04 Done 판정 조건은 충족했다.
- 실제 Google OAuth/provider smoke는 env 미준비로 미실행했다.
  - `GOOGLE_CALENDAR_CLIENT_ID`: 미설정
  - `GOOGLE_CALENDAR_CLIENT_SECRET`: 미설정
  - `GOOGLE_CALENDAR_REDIRECT_URI`: 미설정

## 7. Security/Privacy

- [x] access token/refresh token/code가 response에 없다.
- [x] token/code/raw provider body가 structured log에 없다.
- [x] memo/Google description 원문이 structured log에 없다.
- [x] provider attendee email을 저장/log하지 않는다.
- [x] meeting URL full query string을 structured log에 남기지 않는다.
- [x] cross-user calendar source/schedule/trash 접근이 ownership 기준으로 차단된다.

근거:

- Google Calendar log event는 `userId`, `connectionId`, count, trigger, range, error code만 기록한다.
- token은 AES-GCM envelope로 저장하고 response DTO에 포함하지 않는다.
- Google provider event mapper는 attendee를 읽거나 저장하지 않는다.
- `pnpm run test -- ownership`: 통과.
