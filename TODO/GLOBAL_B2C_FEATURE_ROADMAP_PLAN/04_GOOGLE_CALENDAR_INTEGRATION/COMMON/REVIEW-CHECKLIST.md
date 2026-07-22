# Review Checklist

상태: Confirmed
최종 업데이트: 2026-07-22

## 1. 계약 일치

- [ ] `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`와 구현 API가 일치한다.
- [ ] `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`, `FE-TODO/USER-WEB-TODO.md`와 충돌이 없다.
- [ ] 기존 Schedule/Trash/Weekly Report API 타입이 FE/BE에서 동시에 갱신됐다.
- [ ] DB migration이 Prisma schema와 일치한다.

## 2. Backend

- [ ] Google login OAuth와 Calendar OAuth scope가 분리되어 있다.
- [ ] Calendar OAuth scope가 `openid`, `email`, `https://www.googleapis.com/auth/calendar.readonly` 3개로 고정되어 있다.
- [ ] OAuth URL에 `response_type=code`, `access_type=offline`, `prompt=consent`, `include_granted_scopes=true`가 있다.
- [ ] callback에서 Google ID token의 `iss`, `aud`, `exp`, `sub`, `email`, `email_verified=true`를 검증한다.
- [ ] `providerAccountId`에 Google OIDC `sub`를 저장하고 API response에는 노출하지 않는다.
- [ ] OAuth state allowlist(`/app/schedules`, `/app/settings`)와 10분 TTL 검증이 있다.
- [ ] token/code/raw provider body가 log/response에 노출되지 않는다.
- [ ] Calendar token encryption key가 없을 때 Google Calendar API가 500 `GoogleCalendarTokenEncryptionKeyMissing`으로 실패한다.
- [ ] connection/status/connect/callback/disconnect API가 ownership 기준을 지킨다.
- [ ] calendar list/selection API가 primary default selected와 system calendar default unselected를 지킨다.
- [ ] Google CalendarList.list가 `maxResults=250`, `showDeleted=false`, `showHidden=true`로 모든 page를 조회한다.
- [ ] sync가 selected calendar만 대상으로 한다.
- [ ] sync range가 사용자 timezone 기준 과거 1개월/미래 3개월이다.
- [ ] sync 중복 실행이 `syncLockExpiresAt=now+5분` lock과 409 `GoogleCalendarSyncInProgress`로 막힌다.
- [ ] Google Events.list full sync와 incremental sync 파라미터가 분리되어 있다.
- [ ] incremental sync에서 `timeMin/timeMax/orderBy`를 보내지 않는다.
- [ ] Google sync token 410 응답 시 source `syncToken`을 비우고 full sync로 재시도한다.
- [ ] duplicate import 방지 unique 기준이 있다.
- [ ] `SYNCED`와 `LOCAL_MODIFIED` overwrite 정책이 테스트됐다.
- [ ] all-day event가 `isAllDay=true`와 source timezone day boundary로 저장된다.
- [ ] Google deleted/cancelled event가 hard delete되지 않는다.
- [ ] provider auth failure가 `RECONNECT_REQUIRED`로 전환된다.
- [ ] transient provider failure가 connection을 끊지 않는다.

## 3. Schedule/Trash/Reminder

- [ ] `DELETE /api/schedules/:scheduleId`가 hard delete를 하지 않는다.
- [ ] schedule soft delete가 `deletedAt/deletedByUserId/trashExpiresAt`을 채운다.
- [ ] `trashExpiresAt`은 `createTrashRetentionTimestamps(now)` 기준 `now+7일`이다.
- [ ] soft-deleted schedule은 기본 list/week/home upcoming에서 제외된다.
- [ ] `SCHEDULE` Trash list/detail/restore가 동작한다.
- [ ] Google-origin restore가 `LOCAL_MODIFIED`로 복구된다.
- [ ] schedule delete/hidden/Google deleted에서 pending reminder가 취소된다.
- [ ] restore/future schedule/update에서 reminder가 다시 계산된다.
- [ ] Google reminders는 import되지 않는다.

## 4. Frontend

- [ ] `/app/schedules`에 compact connection/status/sync UI가 있다.
- [ ] `/app/settings`에 reconnect/manage calendars/disconnect UI가 있다.
- [ ] calendar selection modal에서 primary와 system calendar 표시 정책이 맞다.
- [ ] manual sync pending/rapid click guard가 있다.
- [ ] source badge 문구가 확정값과 일치한다.
- [ ] hidden Google filter가 기본 일정과 분리되어 있다.
- [ ] schedule form/detail/list/week에 meeting URL이 표시/수정된다.
- [ ] `meetingUrl`은 `https://`만 허용한다.
- [ ] `isAllDay=true` schedule은 list/detail/week에서 `종일`로 표시된다.
- [ ] Google-origin all-day schedule에서 start/end를 수정하면 `isAllDay=false`, `LOCAL_MODIFIED`가 된다.
- [ ] disconnect modal이 `KEEP`, `HIDE`, `TRASH`를 제공하고 기본값은 `KEEP`이다.
- [ ] `/app/trash`에서 `SCHEDULE` 복구가 동작한다.
- [ ] 모바일/데스크톱 text overlap이 없다.

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
pnpm run build
```

Frontend:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 6. 실제 Google provider smoke

- 자동 테스트와 코드 검증이 통과하면 04 Done 판정을 내린다.
- 실제 Google OAuth/provider smoke는 아래 env가 준비된 뒤 G05 이후 점검한다.
  - `GOOGLE_CALENDAR_CLIENT_ID`
  - `GOOGLE_CALENDAR_CLIENT_SECRET`
  - `GOOGLE_CALENDAR_REDIRECT_URI`
