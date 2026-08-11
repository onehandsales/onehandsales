# G04 User Web Google Calendar UX Work Log

날짜: 2026-07-23
상태: Done
대상 goal: `COMMON/GOAL-SPECS/G04_USER_WEB_GOOGLE_CALENDAR_UX.md`

## 구현 요약

- User Web schedule 타입/API/schema/query key/hook/mutation을 Google Calendar API 계약에 맞게 확장했다.
- `/app/schedules`에 Google Calendar connection status, OAuth redirect result, hidden Google filter, manual sync, auto sync trigger, source badge, meeting URL icon을 연결했다.
- `/app/settings`에 Google Calendar 연결/재연결, calendar selection modal, disconnect `KEEP/HIDE/TRASH` modal을 추가했다.
- schedule form에 `meetingUrl` 입력과 `https://` validation을 추가하고, all-day 토글은 추가하지 않았다.
- schedule detail/week/list에서 Google source badge, meeting URL, external Google link, hidden banner, `종일` 표시를 반영했다.
- Trash `SCHEDULE` target/domain label을 User Web에 추가하고 restore 이후 schedule/trash cache invalidation 흐름을 유지했다.
- Playwright 공용 API mock에 Google Calendar status/calendars/sync/disconnect와 schedule extension fields를 추가했다.
- G04 전용 Playwright spec을 추가해 schedules/settings Google Calendar UX 핵심 흐름을 검증했다.

## 검증

- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd run lint`: 통과
- `pnpm.cmd run build`: 통과
- `pnpm.cmd exec playwright test tests/e2e/google-calendar-ux.spec.ts --project=chromium`: 통과
- `pnpm.cmd exec playwright test tests/e2e/weekly-schedule-report-ux.spec.ts --project=chromium`: 통과
- `git diff --check`: 통과
- Vite dev server 확인: `http://localhost:5173`

## 메모

- build 중 기존 Tailwind `duration-[500ms]` ambiguous class 경고와 Vite chunk size 경고가 표시됐지만 G04 변경으로 새로 발생한 실패는 아니다.
- 실제 Google provider OAuth smoke는 G04 범위 밖이며 G05에서 실행 여부 또는 미실행 사유를 기록한다.
