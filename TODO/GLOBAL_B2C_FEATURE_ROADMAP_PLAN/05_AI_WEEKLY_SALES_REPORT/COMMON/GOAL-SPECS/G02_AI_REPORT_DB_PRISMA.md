# G02 AI Report DB Prisma

상태: Ready
완료일:

## 1. 목적

AI weekly report의 저장형 version, suggestion, async job, AI provider call log DB foundation을 구현한다.

## 2. 선행 조건

- G01이 완료되어 문서 계약 충돌이 없다.
- `BE-TODO/AI_WEEKLY_REPORT_DB-SCHEMA.md`를 먼저 읽는다.
- `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`를 먼저 읽는다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽는다.
- DB migration 실행이 허용되어 있다.

## 3. 포함 범위

- Prisma enum/model 추가
- migration SQL 생성
- `AiWeeklySalesReport`
- `AiWeeklySalesReportSuggestion`
- `AiJob`
- `AiProviderCallLog`
- User model relation 추가
- partial unique index로 생성 중복 방지
- Prisma validate/generate

## 4. 제외 범위

- AI provider 호출 구현
- AI report controller/application service 구현
- User Web 구현
- 05-B follow-up delivery table

## 5. DB 작업

`BE-TODO/AI_WEEKLY_REPORT_DB-SCHEMA.md` 기준으로 아래를 구현한다.

- enum:
  - `AiWeeklySalesReportStatus`
  - `AiWeeklySalesReportSuggestionType`
  - `AiSuggestionPriority`
  - `AiJobStatus`
  - `AiProviderOperation`
  - `AiProviderCallStatus`
- model:
  - `AiWeeklySalesReport`
  - `AiWeeklySalesReportSuggestion`
  - `AiJob`
  - `AiProviderCallLog`
- indexes:
  - user/week/timeZone/version unique
  - user/week/timeZone `GENERATING` partial unique
  - report/suggestion 조회 index
  - job processor 조회 index
  - provider call 운영 조회 index

## 6. 구현 체크

- `AiWeeklySalesReport`는 `userId`, `weekStart`, `timeZone`, `version`, `status`를 가진다.
- 성공 version과 실패 version을 모두 저장할 수 있다.
- `inputSnapshotJson`은 전체 AI 입력 snapshot 저장 용도다.
- `inputMetadataJson`은 count/hash/schema version 등 원문 없는 요약 metadata다.
- `outputJson`은 strict JSON schema 통과 결과만 저장한다.
- `AiProviderCallLog`에는 prompt 원문과 raw response 원문을 저장하지 않는다.
- 모든 timestamp는 UTC instant 기준이다.
- 모든 신규 SQL에 table/column/index comment가 있다.

## 7. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
```

## 8. 완료 기준

- Prisma migration이 생성되고 validate/generate가 통과한다.
- 05-A API 구현자가 추가 DB 결정을 하지 않아도 된다.
- prompt/raw response 저장 금지 조건이 schema/comment에 반영되어 있다.

## 9. 작업 로그 경로

- `TODO_LOG/<date>/G02_AI_REPORT_DB_PRISMA/WORK_LOG.md`
