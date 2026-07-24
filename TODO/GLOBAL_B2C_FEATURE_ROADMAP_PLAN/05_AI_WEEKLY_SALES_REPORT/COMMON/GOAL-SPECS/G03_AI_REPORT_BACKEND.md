# G03 AI Report Backend

상태: Ready
완료일:

## 1. 목적

AI weekly report 생성 요청 API, 조회 API, async job 처리, AI provider port/adapter, provider call log 저장을 구현한다.

## 2. 선행 조건

- G02가 완료되어 Prisma model과 migration이 준비되어 있다.
- `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`를 먼저 읽는다.
- `COMMON/AI_WEEKLY_REPORT_BUSINESS-LOGIC.md`를 먼저 읽는다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽는다.

## 3. 포함 범위

- `POST /api/sales-reports/weekly`
- `GET /api/sales-reports/weekly`
- `GET /api/sales-reports/weekly/:reportId`
- `GET /api/sales-reports/weekly/:reportId/snapshot-summary`
- AI weekly report module/application service
- AI provider port와 dev/test adapter
- job processor 또는 기존 worker 패턴 연결
- provider call log 저장
- 실패 version 저장
- Backend unit/controller/application test

## 4. 제외 범위

- 05-B email/SMS 발송
- report UI 구현
- Deal/Schedule/Contact/MeetingNote 자동 수정
- 결제 plan별 AI 제한

## 5. API 계약

`COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`의 request/response 이름과 body/query를 그대로 따른다.

핵심 response:

- 생성 요청은 `202 Accepted`와 job/report id를 반환한다.
- week 조회는 최신 성공 report, 생성 중 report, 실패 version 목록을 반환한다.
- 상세 조회는 summary/risk/next action/follow-up/data cleanup section을 반환한다.
- snapshot summary는 source count/range/hash 수준만 반환한다.

## 6. Business Logic

- `weekStartDate`는 월요일 date-only로 검증한다.
- `timeZone`은 IANA timezone으로 검증한다.
- report language는 사용자 app language를 따른다.
- AI 입력에는 주간 일정, 딜, 회의록 본문 전체, 다음 행동, 데이터 품질 context를 포함한다.
- 같은 user/week/timeZone에 `GENERATING`이 있으면 중복 생성을 막는다.
- 재생성은 기존 report를 덮지 않고 새 version을 만든다.
- 실패도 report version으로 저장한다.
- provider 호출은 transaction 밖에서 수행한다.
- mutation과 audit성 log 저장은 transaction 안에서 처리한다.

## 7. Error/Observability

- `AiWeeklyReportAlreadyGenerating`
- `AiWeeklyReportWeekStartInvalid`
- `AiWeeklyReportNotFound`
- `AiWeeklyReportGenerationFailed`
- `aiWeeklyReport.generationRequested`
- `aiWeeklyReport.generationSucceeded`
- `aiWeeklyReport.generationFailed`
- prompt, snapshot 원문, 회의록 본문, provider raw response logging 금지

## 8. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- sales-report
pnpm run build
```

## 9. 완료 기준

- 생성/조회 API가 spec과 일치한다.
- 생성 중복 방지와 실패 version 저장이 동작한다.
- provider call log가 비용/latency/safe error를 기록한다.
- prompt/raw response가 log/response/test snapshot에 노출되지 않는다.

## 10. 작업 로그 경로

- `TODO_LOG/<date>/G03_AI_REPORT_BACKEND/WORK_LOG.md`
