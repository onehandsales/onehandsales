# Planning Review

상태: G01-G10 Done / User-Assumed Provider Smoke Accepted
검토일: 2026-08-05
최종 반영일: 2026-08-09

## 1. 결론

- 판정: G01~G10 구현/검토 완료, provider smoke는 2026-08-09 사용자 acceptance 기준으로 closeout 완료
- 이유: 05의 제품 결정, 포함/제외 범위, API 계약, DB schema, FE 작업, goal 순서, 아키텍처/UXUI guardrail, QA 체크리스트 기준으로 Backend/DB/User Web 구현과 closeout 검증은 완료되어 있다. G10에서 Gmail/Microsoft production email send adapter와 reconnect/scope/smoke allowlist 처리를 구현했고, 2026-08-09 G01에서 OAuth connection row 확인 및 사용자 acceptance 기준으로 남은 smoke를 닫았다.
- 구현 상태: AI weekly report와 follow-up delivery foundation의 Backend/DB/User Web 구현, regression 명령, ownership/privacy/provider failure/mobile QA 문서화는 완료됐다. Gmail/Microsoft 실제 provider 발송 코드는 G10에서 구현했고, 실제 계정 기반 smoke는 사용자 acceptance 기준 assumed pass로 닫혔다.

## 2. 사용자 결정 반영

| 항목 | 반영 결과 |
|---|---|
| 작업 단위 | G01~G09로 분리 |
| 05-A 생성 방식 | 수동 생성, 비동기 job |
| report 보관 | 저장형 version, 재생성 시 새 version |
| 실패 이력 | 실패 version도 저장 |
| 삭제 정책 | AI report와 발송 로그는 사용자 삭제/숨김 불가 |
| AI 입력 | 회의록 본문 전체 포함, full input snapshot 저장 |
| 사용자 노출 | snapshot summary만 노출 |
| report 언어 | 사용자 app language 기준 |
| report section | summary, risk, next actions, follow-up draft, data cleanup |
| 자동 mutation | 금지. target record 열기만 제공 |
| follow-up 채널 | email, SMS |
| email provider | Gmail, Microsoft 365 |
| SMS | 국제 SMS, 인증 발신번호 |
| sender | 사용자 본인 연결 email 또는 인증 발신번호 |
| provider 설정 | `/app/settings`에서 관리 |
| compose | recipient/subject/body 확인과 수정 필수 |
| follow-up 언어 | compose에서 선택 |
| SMS 길이 | 1~2 segment |
| 발송 시점 | 즉시 발송만 지원 |
| 첫 발송 안내 | channel별 1회 확인 |
| 문체 | 정중하고 짧고 실무적인 톤 |
| branding | onehand.sales 문구 기본 미삽입 |
| 비용 | 내부 추적, 사용자 기본 미노출 |
| 로그 보관 | 제목/본문 전체 영구 보관, 사용자 삭제 불가 |
| 이력 표시 | AI report와 Deal/Contact/MeetingNote/Schedule timeline |
| 실패 처리 | safe error, retryable transient error 재시도 |
| Admin | masked safe error만 허용. 민감 원문 조회 제외 |

### 2026-08-05 G10 추가 결정

| 항목 | 반영 결과 |
|---|---|
| provider | Gmail과 Microsoft 365 둘 다 실제 발송 구현 |
| 발송 방식 | 사용자 본인 연결 계정으로 발송 |
| provider API | Gmail API와 Microsoft Graph API 직접 호출 |
| OAuth scope | send-only 최소 scope |
| Microsoft tenant | 기본 `common` |
| smoke allowlist | Backend env로 제한 |
| smoke 차단 | provider 호출 없이 failed attempt 저장 |
| reconnect | token/revoked/invalid_grant/insufficient scope는 `RECONNECT_REQUIRED` |
| body format | plain text |
| body storage | 기존 계약대로 `FollowUpMessage`에 subject/body 전체 저장 |
| SMS | G10 제외 |
| B2B/SMS 확장 | 별도 후속 |
| 09/11 | 신규 goal 불필요. 09 event 추가 없음, 11 `FollowUpDeliveryAttempt` source 유지 |

## 3. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`
- `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/*`
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `BE-TODO/AI_WEEKLY_REPORT_DB-SCHEMA.md`
- `BE-TODO/FOLLOW_UP_DELIVERY_DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`
- `FE-TODO/AI_WEEKLY_REPORT_USER-WEB-TODO.md`
- `FE-TODO/FOLLOW_UP_DELIVERY_USER-WEB-TODO.md`

### G01 현재 코드 대조 결과

- BE에는 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`가 이미 구현되어 있으므로 05에서 다시 만들지 않는다.
- FE에는 `/app/schedules/week` route와 `ScheduleWeekReportScreen`이 이미 구현되어 있으므로 05-A는 해당 화면에 AI report section을 추가한다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`의 `/app/schedules/week` redirect 설명은 stale 상태로 판단하고, 실제 코드와 03 완료 문서를 기준으로 삼는다.
- G01 시점에는 05 신규 AI report/follow-up API와 table이 코드에 없었으나, 2026-07-24 G02~G08에서 구현과 검토를 완료했다.
- `weekStart`, `timeZone`, error code, observability event, DB unique/index 기준의 문서 충돌을 G01에서 보정했다.
- G02~G09 구현 착수를 막는 blocking 질문은 없다.

### G02 구현 결과

- `BE/prisma/schema.prisma`에 05-A AI weekly report enum/model/relation을 추가했다.
- `BE/prisma/migrations/20260724010000_ai_weekly_report_db/migration.sql`을 추가했다.
- `AiWeeklySalesReport`는 `userId`, `weekStart`, `timeZone`, `version`, `status`, full input snapshot, metadata, output, safe error, UTC timestamp를 저장한다.
- `AiWeeklySalesReportSuggestion`은 report section별 risk/action/follow-up/cleanup suggestion을 저장한다.
- `AiJob`과 `AiProviderCallLog`는 async job, provider status, latency, token/cost, safe error를 추적한다.
- provider prompt/raw response는 저장하지 않는 조건을 schema 주석과 migration `COMMENT ON`에 반영했다.
- `prisma:validate`, `prisma:generate`, backend `typecheck`, 전체 Jest, `build`가 통과했다.

### G03~G08 구현/검토 결과

| Goal | 결과 | 증거 |
|---|---|---|
| G03 AI Report Backend | 완료 | `BE/src/modules/sales-report`, `POST/GET /api/sales-reports/weekly`, async processor, provider log 구현. 2026-07-24 `prisma:validate`, BE `typecheck`, `lint`, `test -- sales-report` 3 suites / 10 tests, `build` 통과 |
| G04 AI Report User Web | 완료 | `FE/user-web/src/features/ai-weekly-report`, `/app/schedules/week` AI report section 구현. 2026-07-24 FE `typecheck`, `lint`, `build`, Chrome mobile E2E 6 tests 통과 |
| G05 Follow-up DB Provider Ports | 완료 | `20260724020000_add_follow_up_delivery_foundation`, follow-up provider port/encryption/safe error mapper 구현. 2026-07-24 BE `prisma:validate`, `typecheck`, `lint`, `test -- follow-up` 6 suites / 29 tests, `build` 통과 |
| G06 Follow-up Settings Backend | 완료 | `/api/follow-up-delivery/*` settings/OAuth/SMS/consent API 구현. 2026-07-24 `test -- follow-up` 6 suites / 29 tests 통과 |
| G07 Follow-up Draft Send Backend | 완료 | `/api/follow-up-messages/*` draft/update/send/retry/list/detail API 구현. 2026-07-24 `test -- follow-up` 6 suites / 29 tests 통과 |
| G08 Follow-up User Web | 완료 | `FE/user-web/src/features/follow-up-delivery`, `/app/settings`, AI report compose, timeline UI 구현. `/admin/api` 검색 no match. FE 검증과 Chrome mobile E2E 통과 |
| G09 QA Review Closeout | 완료 | `COMMON/REVIEW-CHECKLIST.md` closed. BE `prisma:validate`, `typecheck`, `lint`, `test`, `build` 통과. FE `typecheck`, `lint`, `build`, `test:e2e:mobile` 통과. 당시 실제 provider smoke 미실행 사유와 runbook/release note 기록 |

### G10 문서화 결과

- `COMMON/GOAL-SPECS/G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION.md`를 추가했다.
- `COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`에 request/response, business logic, DB, transaction, observability 계약을 보강했다.
- `COMMON/FOLLOW_UP_EMAIL_PROVIDER_BUSINESS-LOGIC.md`와 `COMMON/FOLLOW_UP_EMAIL_PROVIDER_USER-FLOW.md`를 추가했다.
- `BE-TODO/FOLLOW_UP_EMAIL_PROVIDER_DB-SCHEMA.md`에 신규 migration 기본 불필요와 DB 주석 필수 기준을 기록했다.
- `COMMON/G10_CROSS_PLAN_COVERAGE.md`에 09/11 추가 문서가 필요 없는 이유를 기록했다.
- `COMMON/G10_DOCUMENT_REVIEW.md`에 문서 검토 결과를 남겼다.

## 4. 핵심 설계 판단

| 판단 | 내용 |
|---|---|
| 03 재사용 | 03 weekly schedule report는 완료 상태로 보고, 05는 AI/report/follow-up layer만 추가한다. |
| Async generation | AI report 생성은 job 기반으로 처리해 timeout과 provider latency를 분리한다. |
| Version 보존 | report 재생성은 update가 아니라 append-only version이다. |
| Failure 보존 | 실패도 감사 이력으로 저장한다. |
| Full snapshot | 상세한 report 품질을 위해 AI input snapshot은 전체 저장한다. |
| User exposure | 개인정보와 원문 과다 노출을 막기 위해 snapshot summary만 response한다. |
| Provider boundary | AI/email/SMS provider 호출은 adapter/port로 격리한다. |
| Delivery ownership | 사용자 본인 연결 계정 또는 인증 발신번호만 발송에 쓴다. |
| Compose gate | AI 초안은 바로 발송하지 않고 사용자 확인/수정을 필수로 한다. |
| Permanent log | follow-up 제목/본문 전체는 영업 활동 로그로 영구 보관한다. |
| Scope control | 예약 발송, campaign, SMTP, Admin 민감 원문 조회는 제외한다. |

## 5. 미해결 Critical/Major

G10 문서화 기준 critical/major는 없다.

G10 구현 기준 critical/major는 없다. 2026-08-05 당시 남아 있던 Gmail/Microsoft provider credential, callback URL, production-equivalent allowlist 수신자 smoke 확인은 2026-08-09 사용자 acceptance 기준으로 closeout 완료 처리했다.

## 6. G09 Closeout 결과

- OAuth callback route는 Bearer token 대신 `ExternalEmailOAuthState`로 user를 식별하는 구조로 확인했다.
- provider 호출은 DB transaction 밖에서 수행되는 구조로 확인했다.
- AI prompt, snapshot 원문, provider raw response, token, SMS code, email/SMS body는 structured log에 남기지 않는 구조와 테스트를 확인했다.
- 05-B migration은 05-A table 생성 뒤 적용되는 순서로 확인했다.
- `GENERATING` report 중복 생성과 send/retry 중복 발송 방지는 regression과 code review로 확인했다.
- 모바일 360px/390px QA는 `pnpm run test:e2e:mobile` 6 tests 통과로 닫았다.
- 실제 provider smoke는 G09 당시 follow-up 전용 provider env와 callback URL 미확정으로 완료 처리하지 않았고, 미실행 사유를 work log/runbook에 기록했다. 이후 Gmail/Microsoft provider smoke closeout은 2026-08-09 사용자 acceptance 기준으로 닫았다.

## 7. 사용자의 추가 결정이 필요한 질문

G10 문서화와 구현 착수를 막는 추가 사용자 결정은 없다.

05 범위 밖에서 별도 goal로 확정할 항목:

- 결제 plan별 AI 사용 제한
- 예약 발송
- campaign/bulk marketing
- Admin 비용/운영 화면
- 계정 삭제/법적 삭제 요청 시 영구 로그 처리 정책
- provider별 운영 credential 검수와 국가별 SMS 제한 정책

## 8. 완료 기록

- Goal completion checklist: `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- QA checklist: `COMMON/REVIEW-CHECKLIST.md`
- G09 work log: `TODO_LOG/2026-07-24/G09_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
