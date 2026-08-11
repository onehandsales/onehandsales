# G03 Google Calendar Backend Calendar List Sync Work Log

날짜: 2026-07-23
상태: Done
대상 goal: `COMMON/GOAL-SPECS/G03_BACKEND_CALENDAR_LIST_SYNC.md`

## 구현 요약

- Google Calendar read provider adapter를 추가해 refresh token 갱신, CalendarList.list, Events.list를 분리 구현했다.
- `GET /api/schedules/google/calendars`, `PATCH /api/schedules/google/calendars`, `POST /api/schedules/google/sync`를 추가했다.
- Google calendar source upsert/selection, selected source sync, connection sync lock, provider auth/transient mapping을 구현했다.
- Full sync와 incremental sync의 Events.list parameter를 분리하고, syncToken 410 시 source token을 비운 뒤 full sync로 fallback한다.
- Google event를 Schedule로 import/update하며 description은 최초 import 때만 memo로 저장하고, LOCAL_MODIFIED 일정은 external metadata만 갱신한다.
- Google cancelled/deleted event는 `GOOGLE_DELETED`로 숨김 처리하고 reminder cancel 대상에 포함한다.
- all-day event local boundary, meeting URL 우선순위, incremental range 밖 신규 이벤트 skip을 반영했다.
- Schedule list에 `visibility/sourceType` 필터를 추가하고 weekly xlsx/Trash source label을 API 계약에 맞췄다.
- provider adapter, sync service, Prisma sync repository, controller, Schedule application service 테스트를 추가/수정했다.

## 검증

- `pnpm.cmd run prisma:validate`: 통과
- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd run lint`: 통과
- `pnpm.cmd run test -- schedule`: 통과
- `pnpm.cmd run test -- notification`: 통과
- `pnpm.cmd run build`: 통과
- `git diff --check`: 통과

## 메모

- 실제 Google provider smoke는 G03 범위 밖이며 G05에서 수행 여부나 미수행 사유를 기록한다.
- DB schema 변경은 G02에서 완료되어 G03에서는 신규 migration을 추가하지 않았다.
