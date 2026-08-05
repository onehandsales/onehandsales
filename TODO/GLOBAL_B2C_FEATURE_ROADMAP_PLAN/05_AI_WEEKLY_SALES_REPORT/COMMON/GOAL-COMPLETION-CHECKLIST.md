# Goal Completion Checklist

상태: G01-G09 Done / G10 Ready
최종 업데이트: 2026-08-05

## 1. 목적

05 AI Weekly Sales Report의 `/goal` 실행 완료 여부를 한눈에 확인하기 위한 체크리스트다.

`COMMON/REVIEW-CHECKLIST.md`는 G09 QA 검증표이고, 이 문서는 G01~G10 진행 상태판이다.

## 2. 사용 규칙

- 각 `/goal`을 시작하기 전에 이 문서를 확인한다.
- goal 완료 조건이 충족되면 해당 항목을 `[x]`로 바꾼다.
- 체크할 때 `완료일`, `증거`, `비고`를 함께 갱신한다.
- 검증 명령을 실행하지 못했으면 체크하지 않는다.
- 코드 구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다.
- 실제 Gmail/Microsoft/SMS provider smoke는 env 미준비 시 G09에서 미실행 사유를 기록한다.
- G10은 Gmail/Microsoft 실제 email provider 발송과 allowlist smoke가 끝나기 전까지 완료로 체크하지 않는다.

## 3. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [x] | G01 Planning API DB Contract | Done | 2026-07-24 | 문서 계약과 현재 코드 사실을 대조하고, G02~G09 착수 blocking 질문이 없음을 확인한다. | `G01_PLANNING_API_DB_CONTRACT.md`, `WORK_LOG.md`, `rg ...`, `git diff --check`, 2026-07-24 후속 상태 보정 | blocking 질문 없음 |
| [x] | G02 AI Report DB Prisma | Done | 2026-07-24 | 05-A DB foundation, migration, Prisma model이 spec과 일치한다. | `BE/prisma/schema.prisma`, `20260724010000_ai_weekly_report_db`, `prisma:validate`, `prisma:generate`, `typecheck`, `jest`, `build` | BE dev/runtime 프로세스 DLL lock 해소 후 generate 통과 |
| [x] | G03 AI Report Backend | Done | 2026-07-24 | 생성/조회 API, async job, AI provider log가 spec과 일치한다. | `BE/src/modules/sales-report`, 2026-07-24 `pnpm run prisma:validate`, `typecheck`, `lint`, `test -- sales-report` 3 suites / 10 tests, `build` 통과 | 구현/검토 완료 |
| [x] | G04 AI Report User Web | Done | 2026-07-24 | `/app/schedules/week` AI report UX가 FE TODO와 API 계약에 맞게 연결된다. | `FE/user-web/src/features/ai-weekly-report`, 2026-07-24 FE `typecheck`, `lint`, `build`, Chrome mobile E2E 6 tests 통과 | 구현/검토 완료 |
| [x] | G05 Follow-up DB Provider Ports | Done | 2026-07-24 | 05-B DB foundation과 provider port/redaction mapper가 준비된다. | `20260724020000_add_follow_up_delivery_foundation`, 2026-07-24 BE `prisma:validate`, `typecheck`, `lint`, `test -- follow-up` 6 suites / 29 tests, `build` 통과 | 구현/검토 완료 |
| [x] | G06 Follow-up Settings Backend | Done | 2026-07-24 | OAuth, SMS sender verification, consent notice API가 spec과 일치한다. | `/api/follow-up-delivery/*`, 2026-07-24 `test -- follow-up` 6 suites / 29 tests 통과 | 구현/검토 완료 |
| [x] | G07 Follow-up Draft Send Backend | Done | 2026-07-24 | draft, update, send, retry, list/detail API가 spec과 일치한다. | `/api/follow-up-messages/*`, 2026-07-24 `test -- follow-up` 6 suites / 29 tests 통과 | 구현/검토 완료 |
| [x] | G08 Follow-up User Web | Done | 2026-07-24 | settings, compose, send, retry, timeline UX가 FE TODO와 API 계약에 맞게 연결된다. | `FE/user-web/src/features/follow-up-delivery`, `/app/settings`, `/admin/api` 검색 no match, FE `typecheck`, `lint`, `build`, Chrome mobile E2E 6 tests 통과 | 구현/검토 완료 |
| [x] | G09 QA Review Closeout | Done | 2026-07-24 | `COMMON/REVIEW-CHECKLIST.md` critical 항목과 BE/FE 검증 명령이 완료된다. | `REVIEW-CHECKLIST.md`, `TODO_LOG/2026-07-24/G09_QA_REVIEW_CLOSEOUT/WORK_LOG.md`, BE full commands, FE full commands, mobile E2E 6 tests 통과 | 실제 provider smoke는 env/callback 미확정으로 미실행 사유 기록 |
| [ ] | G10 Follow-up Email Provider Integration | Ready | - | Gmail/Microsoft 실제 provider API 발송, reconnect-required, smoke allowlist, safe failure, FE reconnect CTA가 완료된다. | `COMMON/GOAL-SPECS/G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION.md`, `COMMON/G10_DOCUMENT_REVIEW.md` | 구현 전 |

## 4. Goal별 체크 조건

### G01 Planning API DB Contract

- [x] `COMMON/SCOPE.md`, `COMMON/API-SPEC/*`, `COMMON/ARCHITECTURE-GUARDRAILS.md`를 재확인했다.
- [x] 현재 Schedule/MeetingNote/Deal/Contact/User Web week 화면 구조를 확인했다.
- [x] API path, enum, 상태명, error code 충돌이 없다.
- [x] 현재 코드와 충돌하는 부분은 구현해야 할 변경으로 문서에 명시되어 있다.
- [x] G02~G09 구현 착수를 막는 질문이 없다.

### G02 AI Report DB Prisma

- [x] Prisma enum/model/migration이 추가됐다.
- [x] `AiWeeklySalesReport` version/failed version 저장이 가능하다.
- [x] `AiWeeklySalesReportSuggestion`이 section별 suggestion을 저장한다.
- [x] `AiJob`이 async generation job을 추적한다.
- [x] `AiProviderCallLog`가 비용/latency/safe error를 저장한다.
- [x] prompt/raw response가 DB/log에 저장되지 않는다.
- [x] BE Prisma 검증 명령을 실행했다.

### G03 AI Report Backend

- [x] `POST /api/sales-reports/weekly`가 생성 job을 만든다.
- [x] `GET /api/sales-reports/weekly`가 최신 성공/생성 중/실패 version 목록을 반환한다.
- [x] `GET /api/sales-reports/weekly/:reportId`가 상세 section을 반환한다.
- [x] `GET /api/sales-reports/weekly/:reportId/snapshot-summary`가 원문 없는 snapshot summary를 반환한다.
- [x] 생성 중복 방지와 실패 version 저장이 동작한다.
- [x] BE 검증 명령을 실행했다.

### G04 AI Report User Web

- [x] `/app/schedules/week` 기존 기능을 깨지 않고 AI section을 추가했다.
- [x] empty/generating/success/failed state가 있다.
- [x] version 목록과 실패 이력 접힘 표시가 있다.
- [x] snapshot summary는 원문을 노출하지 않는다.
- [x] 모바일 card/list layout을 확인했다.
- [x] FE 검증 명령을 실행했다.

### G05 Follow-up DB Provider Ports

- [x] 05-B Prisma enum/model/migration이 추가됐다.
- [x] `ExternalEmailOAuthState`가 state 재사용을 막는다.
- [x] token/phone 원문 암호화와 hash/masking이 분리됐다.
- [x] provider port와 safe error mapper가 있다.
- [x] body/raw response/token structured log redaction test가 있다.
- [x] BE Prisma 검증 명령을 실행했다.

### G06 Follow-up Settings Backend

- [x] settings 조회 API가 masking된 연결 상태를 반환한다.
- [x] Gmail/Microsoft connect/callback/disconnect가 동작한다.
- [x] callback은 state로 user ownership을 검증한다.
- [x] SMS sender request/verify/revoke가 동작한다.
- [x] first-send consent notice upsert가 동작한다.
- [x] BE 검증 명령을 실행했다.

### G07 Follow-up Draft Send Backend

- [x] `FOLLOW_UP` suggestion에서 draft를 만든다.
- [x] recipient/channel/language validation이 동작한다.
- [x] 사용자가 수정한 subject/body를 저장한다.
- [x] send/retry 중복 발송이 방지된다.
- [x] delivery attempt와 timeline target이 저장된다.
- [x] BE 검증 명령을 실행했다.

### G08 Follow-up User Web

- [x] `/app/settings` provider 연결 UI가 있다.
- [x] AI report follow-up suggestion에서 compose로 진입한다.
- [x] email/SMS compose 수정과 즉시 발송이 동작한다.
- [x] 실패 safe error와 retry UI가 있다.
- [x] AI report와 record timeline에 발송 이력이 표시된다.
- [x] FE 검증 명령과 mobile 확인을 실행했다.

### G09 QA Review Closeout

- [x] Backend QA 항목을 확인했다.
- [x] Frontend QA 항목을 확인했다.
- [x] Security/Privacy QA 항목을 확인했다.
- [x] `COMMON/REVIEW-CHECKLIST.md` 체크 결과를 반영했다.
- [x] README, goal spec, planning review, 상위 roadmap 상태를 구현 결과와 맞췄다.
- [x] 실제 provider smoke 실행 여부와 미실행 사유를 기록했다.

### G10 Follow-up Email Provider Integration

- [ ] `COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md` request/response 계약을 구현과 대조했다.
- [ ] Gmail API 실제 발송 adapter를 구현했다.
- [ ] Microsoft Graph 실제 발송 adapter를 구현했다.
- [ ] access token refresh 후 발송을 구현했다.
- [ ] invalid_grant/revoked/insufficient scope를 `RECONNECT_REQUIRED`로 전환했다.
- [ ] smoke allowlist env와 차단 로직을 구현했다.
- [ ] allowlist 밖 수신자는 provider 호출 없이 failed attempt만 저장한다.
- [ ] safe error와 retryable mapping을 테스트했다.
- [ ] User Web reconnect CTA와 safe error rendering을 확인했다.
- [ ] provider raw/token/body/recipient가 structured log와 Admin provider failure detail에 없는지 확인했다.
- [ ] 신규/수정 Backend/Frontend/DB 코드에 한국어 주석을 추가했다.
- [ ] BE 검증 명령을 실행했다.
- [ ] FE 검증 명령을 실행했다.
- [ ] Gmail/Microsoft production-equivalent allowlist smoke를 실행했다.
- [ ] 검토에서 이상이 있으면 수정하고 다시 검토했다.

## 4.1 2026-07-24 후속 재검토 메모

- BE: `pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build` 통과.
- FE: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build` 통과.
- Mobile: `pnpm run test:e2e:mobile` 6 tests 통과. 현재 머신에는 Microsoft Edge가 없어 Edge project는 config에서 자동 제외되며, Edge 설치 환경이나 `PLAYWRIGHT_INCLUDE_EDGE=1`에서는 Edge project를 포함한다.
- `/admin/api` 검색은 AI weekly report/follow-up/settings/deal/contact 연결 범위에서 no match다.
- 실제 Gmail/Microsoft/SMS provider smoke는 follow-up 전용 credential과 provider console callback URL 미확정으로 완료 처리하지 않았고, 미실행 사유를 G09 work log/runbook에 기록했다.

## 5. 완료 시 업데이트 예시

```markdown
| [x] | G03 AI Report Backend | Done | YYYY-MM-DD | ... | `pnpm run typecheck`, `pnpm run test -- ...`, `pnpm run build` 통과 | ... |
```
