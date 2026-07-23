# G02 Google Calendar Backend DB Connection Work Log

날짜: 2026-07-23
상태: Done
대상 goal: `COMMON/GOAL-SPECS/G02_BACKEND_DB_GOOGLE_CONNECTION.md`

## 구현 요약

- Prisma schema에 Google Calendar connection/source 모델, 관련 enum, Schedule external metadata/soft delete field/index를 추가했다.
- Google Calendar integration migration을 추가하고 로컬 migration 상태가 최신임을 확인했다.
- Schedule 삭제를 soft delete로 전환하고 기본 list/detail/week/export 조회에서 deleted schedule을 제외했다.
- Google-origin schedule의 badge/source/status 표현과 meeting URL/all-day 필드를 Schedule 응답에 반영했다.
- Trash `SCHEDULE` list/detail/restore branch를 추가하고 restore 시 future reminder 재계산을 연결했다.
- Google connect/callback/status/disconnect API를 추가했다.
- OAuth state 서명/TTL/returnTo allowlist, Google ID token 검증, token encryption adapter를 추가했다.
- disconnect `KEEP/HIDE/TRASH` 정책을 구현하고 `TRASH` schedule reminder cancel을 transaction 안에서 처리했다.

## 검증

- `pnpm.cmd run prisma:validate`: 통과
- `pnpm.cmd exec prisma migrate dev --name google_calendar_integration`: 통과
- `pnpm.cmd exec prisma migrate status`: 통과
- `pnpm.cmd run prisma:migrate --name google_calendar_integration`: 통과
- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd run lint`: 통과
- `pnpm.cmd run test -- schedule`: 통과
- `pnpm.cmd run test -- notification`: 통과
- `pnpm.cmd run test -- trash`: 통과
- `pnpm.cmd run build`: 통과

## 메모

- PowerShell 환경에서 `pnpm run prisma:migrate -- --name google_calendar_integration`는 pnpm script 인자 전달 문제로 Prisma CLI가 추가 `--`를 받은 상태에서 대기했다.
- 같은 migration 의도는 `pnpm.cmd exec prisma migrate dev --name google_calendar_integration`와 `pnpm.cmd run prisma:migrate --name google_calendar_integration`로 검증했다.
- Prisma client generate 중 기존 BE dev process가 query engine 파일을 잡고 있어 해당 BE node process만 종료한 뒤 generate를 완료했다.
- 실제 Google OAuth smoke는 G02 제외 범위라 실행하지 않았고, G05에서 실행 여부 또는 미실행 사유를 기록한다.
