# Goal Completion Checklist

상태: G08 Completed
최종 업데이트: 2026-07-30

## 1. 목적

09 Product Analytics의 `/goal` 실행 완료 여부를 확인한다.

구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다. 실제 실행하지 못한 검증이 있으면 체크하지 않고 사유를 남긴다.

## 2. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [x] | G01 Document Contract Sync | Completed | 2026-07-30 | 현재 코드/문서 대조와 blocking 해소 | G01 실행 결과, DB-SCHEMA event name 동기화, rg 검색, BE prisma validate | G02~G08 blocking 없음 |
| [x] | G02 DB Schema Event Foundation | Completed | 2026-07-30 | Prisma schema/migration/repository 기반 | `ProductAnalyticsEvent`/snapshot schema, migration COMMENT, AnalyticsModule/repository/date/taxonomy/input policy, DB_SCHEMA 문서, BE prisma validate/generate/typecheck/lint/product-analytics test | G03 blocking 없음 |
| [x] | G03 Analytics Collector API | Completed | 2026-07-30 | `POST /api/analytics/events` 구현 | AuthGuard controller, request DTO, collect use case, payload/routeKey/PII validation, session/device/timezone enrichment, BE test/typecheck/lint | G04 blocking 없음 |
| [x] | G04 Server Event Logging | Completed | 2026-07-30 | 핵심 server event 기록 지점 연결 | `ProductAnalyticsEventRecorder`, AnalyticsRecorderModule wiring, auth/deal/schedule/meeting-note/business-card/data-import/export server event 연결, requestId 전달, BE typecheck/lint/targeted test | G05 blocking 없음 |
| [x] | G05 User Web Client Events | Completed | 2026-07-30 | core `/app` route view wrapper 구현 | `features/analytics` API/client hook/route mapper, AppShell 연결, `VITE_PRODUCT_ANALYTICS_ENABLED`, User Web unit/E2E/typecheck/lint/build | G06 blocking 없음 |
| [x] | G06 Snapshot Retention Batch | Completed | 2026-07-30 | activation/retention snapshot 계산 | snapshot/purge use case, optional runner, repository query/upsert/purge, env 문서, BE typecheck/lint/analytics test/build | G07 blocking 없음 |
| [x] | G07 AI Usage And Billing Reserved | Completed | 2026-07-30 | AI usage 요약과 billing reserved 정리 | `SummarizeAiUsageUseCase`, AI usage repository source query, reserved taxonomy spec, BE typecheck/lint/analytics+meeting-note test/build | G08 blocking 없음 |
| [x] | G08 QA Document Closeout | Completed | 2026-07-30 | 검증과 문서 closeout | BE prisma validate/generate/typecheck/lint/test/build, User Web typecheck/lint/build, taxonomy/privacy 검색, 문서 상태 동기화 | 09 완료 |

## 3. 공통 Contract Gate

- [x] 각 goal은 request 계약을 명시했거나 영향 없음으로 기록했다.
- [x] 각 goal은 response 계약을 명시했거나 영향 없음으로 기록했다.
- [x] 각 goal은 business logic을 명시했다.
- [x] 각 goal은 user flow를 명시했다.
- [x] 각 goal은 DB/Prisma 영향을 명시했거나 변경 없음으로 기록했다.
- [x] 각 goal은 코드 주석 기준을 명시했다.
- [x] 각 goal은 `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`의 실제 수정 대상 파일과 완료 산출물을 확인했다.
- [x] API가 있는 goal은 계약 상태, 소비자, 호환성, DTO 이름, success status를 기록했다.
- [x] mutation/processor가 있는 goal은 transaction 필요 여부와 rollback 범위를 기록했다.
- [x] mutation/provider/batch가 있는 goal은 observability event key, request id, redaction 기준을 기록했다.
- [x] DB 변경 goal은 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`를 확인했다.
- [x] 새 table/column/enum/index에는 Prisma schema 한글 주석과 migration SQL COMMENT가 있다.
- [x] 신규/수정 Backend 코드에는 `// API : ...`, `// 역할 : ...`, `// 기능 : ...` 주석이 있다.
- [x] 신규/수정 Frontend 코드에는 `// 기능 : ...` 주석이 있다.

## 4. Goal별 체크 조건

### G01 Document Contract Sync

- [x] 09 확정 결정과 현재 BE/FE/Prisma 구조를 대조했다.
- [x] `AuthSession`, `AuthDevice`, `AiProviderCallLog` 현재 구조를 확인했다.
- [x] Admin analytics가 11 범위임을 다시 확인했다.
- [x] Billing/paywall/churn이 12 범위임을 다시 확인했다.
- [x] `COMMON/API-SPEC`, `BE-TODO`, `FE-TODO`, `DB-SCHEMA` event 이름이 일치한다.

### G02 DB Schema Event Foundation

- [x] `ProductAnalyticsEventSource` enum이 추가됐다.
- [x] `UserActivationStatus` enum이 추가됐다.
- [x] `ProductAnalyticsTargetType` enum이 추가됐다.
- [x] `ProductAnalyticsEvent` model이 추가됐다.
- [x] `UserActivationSnapshot` model이 추가됐다.
- [x] `RetentionCohortSnapshot` model이 추가됐다.
- [x] `occurredAt`, `eventDate`, `timeZone` 의미가 schema/comment/API spec에 일치한다.
- [x] `occurredAt`, `authSessionId`, `authDeviceId`, activation snapshot, retention cohort index가 있다.
- [x] migration SQL에 enum/table/column/index COMMENT가 있다.
- [x] raw event retention과 account deletion 기준을 방해하지 않는다.

### G03 Analytics Collector API

- [x] `POST /api/analytics/events`가 구현됐다.
- [x] AuthGuard가 적용됐다.
- [x] Client request에 user/session/device id가 허용되지 않는다.
- [x] Backend가 user/session/device/timezone을 보강한다.
- [x] `app_route_viewed` routeKey allowlist가 적용됐다.
- [x] invalid payload는 저장되지 않는다.

### G04 Server Event Logging

- [x] `auth_signup_completed`가 신규 가입에 기록된다.
- [x] `deal_created`가 딜 생성 성공 후 기록된다.
- [x] `deal_next_action_created`가 다음 행동 생성 성공 후 기록된다.
- [x] `schedule_created`가 일정 생성 성공 후 기록된다.
- [x] `schedule_deal_linked`가 일정-딜 연결 성공 후 기록된다.
- [x] `meeting_note_created`가 회의록 생성 성공 후 기록된다.
- [x] `meeting_note_deal_linked`가 회의록-딜 연결 성공 후 기록된다.
- [x] `business_card_scan_confirmed`가 명함 스캔 확인 저장 성공 후 기록된다.
- [x] `import_confirmed`가 import 확정 성공 후 기록된다.
- [x] `export_downloaded`가 xlsx 생성 성공 후 기록된다.
- [x] analytics 저장 실패가 제품 API 실패로 전파되지 않는다.

### G05 User Web Client Events

- [x] `features/analytics` API client가 생겼다.
- [x] route view hook/wrapper가 core `/app` route만 추적한다.
- [x] raw URL/query/UUID param이 payload에 없다.
- [x] public/auth/legacy redirect route는 추적하지 않는다.
- [x] `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 `VITE_PRODUCT_ANALYTICS_ENABLED`가 반영됐다.
- [x] analytics 실패가 사용자에게 보이지 않는다.

### G06 Snapshot Retention Batch

- [x] activation snapshot upsert가 구현됐다.
- [x] D1/D7/D30 retention cohort snapshot이 구현됐다.
- [x] optional processor runner가 env flag로 켜지고 꺼진다.
- [x] `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 snapshot/purge 환경 변수가 반영됐다.
- [x] 365일 raw event purge use case가 있다.
- [x] snapshot log는 count/date 중심이고 payload 원문을 남기지 않는다.

### G07 AI Usage And Billing Reserved

- [x] `AiProviderCallLog` 기반 AI usage summary가 구현됐다.
- [x] request/success/failure/token/cost가 계산된다.
- [x] `AiUsageDaily`는 만들지 않았다.
- [x] billing/paywall/churn event는 runtime 구현되지 않고 reserved 상태다.
- [x] 12에서 결정할 고려사항이 문서에 남았다.

### G08 QA Document Closeout

- [x] Backend `pnpm.cmd run prisma:validate` 통과
- [x] Backend `pnpm.cmd run prisma:generate` 통과
- [x] Backend `pnpm.cmd run typecheck` 통과
- [x] Backend `pnpm.cmd run lint` 통과
- [x] Backend `pnpm.cmd run test` 통과: 76 suites / 391 tests
- [x] Backend `pnpm.cmd run build` 통과
- [x] User Web `pnpm.cmd run typecheck` 통과
- [x] User Web `pnpm.cmd run lint` 통과
- [x] User Web `pnpm.cmd run build` 통과
- [x] README, BE-TODO, FE-TODO, DB-SCHEMA, API-SPEC이 구현 결과와 일치한다.
- [x] 실행하지 못한 G08 검증은 없다.

## 5. 현재 기록

- 2026-07-29: 09 구현 전 `/goal` 착수용 문서 작성. 구현은 아직 시작하지 않았다.
- 2026-07-30: G01 Document Contract Sync 완료. UXUI/SOFTWARE/PM/Prisma/BE/FE/Admin/10/11/12 경계를 확인했고, `DB-SCHEMA.md`에 event name 동기화 기준을 보완했다. 검증은 rg 검색과 BE `pnpm run prisma:validate`를 통과했다. G02~G08 착수 blocking 질문은 없다.
- 2026-07-30: G01 재검토 완료. 상위 README/GOAL-WORK-ORDER 상태를 G01 완료 기준으로 동기화했고, AI usage `groupBy=DAY`가 필요한 `User.timeZone` 조회 계약을 `AI_USAGE_ANALYTICS_CONTRACT.md`와 `G07_AI_USAGE_AND_BILLING_RESERVED.md`에 보완했다.
- 2026-07-30: G01 추가 재검토 완료. `ProductAnalyticsEventRecorder` 명칭을 BE TODO와 G04 명세 사이에 맞췄고, G04 server event 구현 범위에 HTTP controller `RequestWithRequestId.requestId` 전달 작업과 controller spec 검증 기준을 추가했다. G02 idempotency 설명에서 G03/G04 역할을 분리했다.
- 2026-07-30: G01 최종 재검토 완료. G01 상세 명세 상단 상태를 Completed로 동기화했고, G05/G06 신규 환경 변수는 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md` 정본 갱신까지 구현 완료 조건에 포함하도록 보강했다. event/routeKey/reference path/BE Prisma validate 재확인을 통과했다.
- 2026-07-30: G02 DB Schema Event Foundation 완료. Prisma event/snapshot schema와 migration COMMENT, AnalyticsModule/repository/date/taxonomy/input policy를 추가했고, DB_SCHEMA 문서를 갱신했다. BE `pnpm run prisma:validate`, `pnpm run prisma:generate`, `pnpm run test -- product-analytics`, `pnpm run typecheck`, `pnpm run lint`를 통과했다.
- 2026-07-30: G03 Analytics Collector API 완료. `POST /api/analytics/events`에 AuthGuard, DTO, use case, routeKey/surface allowlist, PII key 차단, authSession/authDevice/timezone 보강을 연결했다. BE `pnpm run test -- analytics`, `pnpm run typecheck`, `pnpm run lint`를 통과했다.
- 2026-07-30: G04 Server Event Logging 완료. `ProductAnalyticsEventRecorder`와 AnalyticsRecorderModule을 추가하고 auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product server event 기록 지점을 연결했다. HTTP controller requestId 전달, payload allowlist/PII 차단, best-effort warning log를 검증했고 BE `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- auth deal schedule meeting-note business-card data-import analytics`를 통과했다.
- 2026-07-30: G05 User Web Client Events 완료. `FE/user-web/src/features/analytics`에 collector API client, routeKey mapper, `useAppRouteAnalytics` hook을 추가하고 `AppShell`에 1회 연결했다. `VITE_PRODUCT_ANALYTICS_ENABLED`가 `true`일 때만 `app_route_viewed`를 보내며 public/auth/legacy/redirect-only route와 raw query/UUID payload를 제외했다. FE `pnpm run test -- src/features/analytics`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e:analytics`를 통과했다.
- 2026-07-30: G06 Snapshot Retention Batch 완료. `ProcessProductAnalyticsSnapshotsUseCase`, `PurgeProductAnalyticsRawEventsUseCase`, `ProductAnalyticsSnapshotProcessorRunner`와 Prisma repository query/upsert/purge를 추가했다. activation은 첫 deal 생성과 첫 의미 행동 중 늦은 row의 eventDate/timeZone을 쓰고, retention은 D1/D7/D30 aggregate snapshot만 저장하며, purge는 365일 초과 `ProductAnalyticsEvent`만 삭제한다. BE `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run test -- analytics`, `pnpm.cmd run build`를 통과했다.
- 2026-07-30: G07 AI Usage And Billing Reserved 완료. `SummarizeAiUsageUseCase`와 `AiProviderCallLog` summary source query를 추가해 USER/DAY/OPERATION 기준 request/status/token/cost를 계산한다. DAY 집계는 현재 `User.timeZone`을 조회하고, prompt/raw response/provider raw response는 조회하지 않는다. billing/paywall/churn event는 reserved taxonomy로만 유지하며 12 Billing 고려사항을 문서에 남겼다. BE `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run test -- analytics meeting-note`, `pnpm.cmd run build`를 통과했다.
- 2026-07-30: G08 QA Document Closeout 완료. BE `pnpm.cmd run prisma:validate`, `pnpm.cmd run prisma:generate`, `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run test`, `pnpm.cmd run build`를 통과했고 전체 test는 76 suites / 391 tests가 통과했다. User Web `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run build`를 통과했고 build는 Vite chunk size warning만 있었다. event taxonomy/privacy 검색과 문서 상태 동기화를 완료했으며 실행하지 못한 G08 검증은 없다.
