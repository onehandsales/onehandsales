# G02 AI Report DB Prisma Work Log

상태: Done
작성일: 2026-07-24
완료일: 2026-07-24

## 작업 내용

- `BE-TODO/AI_WEEKLY_REPORT_DB-SCHEMA.md`, `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`, `COMMON/ARCHITECTURE-GUARDRAILS.md` 기준으로 05-A DB foundation을 구현했다.
- `BE/prisma/schema.prisma`에 AI weekly report enum, model, User relation을 추가했다.
- `BE/prisma/migrations/20260724010000_ai_weekly_report_db/migration.sql`을 추가했다.
- 생성 중복 방지를 위해 `status = 'GENERATING'` partial unique index를 migration SQL에 직접 추가했다.
- prompt/raw response 저장 금지 조건을 schema 주석과 migration `COMMENT ON`에 반영했다.

## 생성 DB 대상

- `AiWeeklySalesReport`
- `AiWeeklySalesReportSuggestion`
- `AiJob`
- `AiProviderCallLog`

## 핵심 계약

- report version은 `userId + weekStart + timeZone + version`으로 중복을 막는다.
- 생성 중 report는 `userId + weekStart + timeZone` 기준으로 `GENERATING` 하나만 허용한다.
- 실패 report도 `FAILED` version으로 남기고 삭제/숨김 기능은 만들지 않는다.
- `inputSnapshotJson`은 full input snapshot 저장용이며 일반 response에 원문 전체를 반환하지 않는다.
- `AiProviderCallLog.metadataJson`에는 redacted metadata만 저장하고 prompt, raw response, API key, quota detail은 저장하지 않는다.

## 검증

- `pnpm.cmd exec prisma format`: 통과
- `pnpm.cmd run prisma:validate`: 통과
- `pnpm.cmd run prisma:generate`: 통과
- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd exec jest --runInBand`: 통과, 39 suites / 228 tests
- `pnpm.cmd run build`: 통과

## 이슈 및 처리

- 최초 `prisma:generate`는 실행 중인 BE dev/runtime 프로세스가 Prisma engine DLL을 잠그고 있어 `EPERM rename`으로 실패했다.
- `BE` 관련 Node 프로세스만 중지한 뒤 `prisma:generate`를 재실행해 통과했다.

## 비고

- G02는 05-B follow-up delivery table을 만들지 않는다.
- G03에서는 이 DB foundation 위에 AI weekly report 생성/조회 API와 async job 처리를 구현한다.
