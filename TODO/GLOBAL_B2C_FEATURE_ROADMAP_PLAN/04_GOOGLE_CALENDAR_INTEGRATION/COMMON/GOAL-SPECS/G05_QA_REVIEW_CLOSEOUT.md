# G05 QA Review Closeout

상태: Done

## 1. 목적

04 구현이 API/DB/FE/UXUI 계약과 일치하는지 검증하고 완료 판정을 내린다.

## 2. 선행 조건

- G02/G03/G04가 완료되어 있다.
- `COMMON/REVIEW-CHECKLIST.md`를 먼저 읽는다.
- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`를 먼저 읽는다.

## 3. 포함 범위

- Backend 전체 검증
- Frontend 전체 검증
- Prisma migration 검증
- API contract diff 검토
- Schedule soft delete/Trash restore 검토
- Google sync business rule 검토
- Reminder 생성/취소/복구 검토
- Token/log redaction 검토
- UXUI responsive 검토
- 문서 상태 업데이트

## 4. 제외 범위

- 실제 Google provider smoke를 Done blocking으로 두지 않는다.
- Google Cloud console 설정
- Admin 운영 화면
- Google export/write
- webhook/watch
- 반복 일정 정식 모델

## 5. Backend QA

검증 항목:

- OAuth connect/callback/status/disconnect
- OAuth scope `openid`, `email`, `https://www.googleapis.com/auth/calendar.readonly`
- OAuth state allowlist(`/app/schedules`, `/app/settings`)/10분 TTL
- callback ID token `iss`, `aud`, `exp`, `sub`, `email`, `email_verified=true`
- `providerAccountId=ID token sub`, API response 미노출
- token encryption/redaction과 `GoogleCalendarTokenEncryptionKeyMissing`
- connection `CONNECTED/RECONNECT_REQUIRED/DISCONNECTED`
- calendar list/selection
- Google CalendarList.list `maxResults=250`, `showDeleted=false`, `showHidden=true`, pagination
- sync selected calendar only
- sync range timezone
- sync lock `syncLockExpiresAt=now+5분`과 409 `GoogleCalendarSyncInProgress`
- Google Events.list full/incremental parameter 분리
- Google sync token 410 full sync fallback
- duplicate import unique
- `SYNCED` update
- `LOCAL_MODIFIED` overwrite 방지
- all-day event `isAllDay=true`와 source timezone day boundary
- Google-origin all-day start/end 수정 시 `isAllDay=false`, `LOCAL_MODIFIED`
- Google deleted/cancelled hidden state
- provider auth failure vs transient failure
- schedule `meetingUrl` validation
- schedule soft delete
- Trash `SCHEDULE` restore
- reminder generation/cancel/restore
- cross-user ownership isolation

명령:

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

## 6. Frontend QA

검증 항목:

- `/app/schedules` connection/status/sync UI
- `/app/settings` reconnect/manage/disconnect UI
- OAuth redirect query handling
- calendar selection modal
- manual sync pending/rapid click
- source badge display
- hidden Google filter
- all-day `종일` display
- meeting URL display/edit validation
- Google-origin schedule edit
- disconnect `KEEP/HIDE/TRASH`
- `/app/trash` `SCHEDULE` restore
- desktop/mobile responsive
- provider failure copy

명령:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 7. Security/Privacy QA

- access token/refresh token/code가 response에 없다.
- token/code/raw provider body가 structured log에 없다.
- memo/Google description 원문이 structured log에 없다.
- provider attendee email을 저장/log하지 않는다.
- meeting URL full query string을 log하지 않는다.
- cross-user calendar source/schedule/trash 접근이 404/403으로 차단된다.

## 8. 문서 업데이트

완료 시 아래를 업데이트한다.

- `README.md` 상태를 `Done`으로 변경
- 각 goal spec 상태를 `Done`으로 변경
- `COMMON/PLANNING-REVIEW.md` 구현 상태를 업데이트
- `COMMON/REVIEW-CHECKLIST.md` 체크 결과 반영
- 구현 중 계약 변경, 검증 실패, smoke 미실행 사유가 있으면 `COMMON/TODO_LOG.md` 또는 `TODO_LOG/<date>/.../WORK_LOG.md` 작성
- 상위 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`와 `COMMON/ROADMAP-OVERVIEW.md`의 04 상태 반영

## 9. 실제 Google provider smoke

자동 테스트와 build가 통과하면 04 완료 판정을 내린다.

실제 provider smoke는 아래 env 준비 후 G05 이후 실행한다.

- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`

Smoke env가 없으면 완료 보고에 "실제 Google provider smoke는 env 미준비로 미실행"이라고 명시한다.

## 10. 완료 기준

- `COMMON/REVIEW-CHECKLIST.md`의 critical 항목이 모두 통과한다.
- Backend/Frontend 검증 명령 결과를 기록했다.
- Schedule soft delete와 Google-origin restore가 확인됐다.
- `trashExpiresAt=now+7일` 정책이 확인됐다.
- token/log redaction이 확인됐다.
- 실제 Google provider smoke 실행 여부와 이유가 기록됐다.
- 문서 상태가 구현 결과와 일치한다.
