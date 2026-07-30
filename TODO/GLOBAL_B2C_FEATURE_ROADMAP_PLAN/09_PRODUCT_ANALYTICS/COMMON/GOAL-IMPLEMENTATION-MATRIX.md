# Goal Implementation Matrix

상태: Confirmed

목적: 09의 각 `/goal`을 바로 구현할 수 있도록 실제 수정 대상 파일, 생성 대상 파일, API/DB 산출물, 검증 기준을 고정한다.

## 0. 공통 실행 규칙

각 `/goal` 시작 시 먼저 실행한다.

```powershell
git status --short
rg -n "analytics|ProductAnalytics|AiProviderCallLog|AuthSession|AuthDevice|CurrentUserContext|app_route_viewed|paywall|churn" BE FE AGENT TODO
```

DB 변경 goal은 구현 전 반드시 아래 파일을 연다.

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`

코드 주석은 아래 기준을 지킨다.

- BE controller method: `// API : ...`
- BE class/interface: `// 역할 : ...`
- BE use case/service/repository/helper: `// 기능 : ...`
- FE component/hook/function/event/API client: `// 기능 : ...`

## G01 Document Contract Sync

목표: 09 구현 전에 현재 코드와 문서 계약을 대조하고 blocking을 해소한다.

반드시 확인할 기존 문서:

- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

완료 산출물:

- G02~G08 blocking 질문이 없다.
- `COMMON/API-SPEC`과 `BE-TODO`, `FE-TODO`, `DB-SCHEMA`가 같은 event 이름을 말한다.
- 12 Billing reserved 범위가 09 구현 범위와 섞이지 않는다.

## G02 DB Schema Event Foundation

목표: 제품 분석 raw event와 snapshot schema를 만든다.

수정 대상:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/{신규}_add_product_analytics/migration.sql`
- `BE/src/modules/analytics/domain/product-analytics-event-taxonomy.ts`
- `BE/src/modules/analytics/application/services/product-analytics-date.ts`
- `BE/src/modules/analytics/application/ports/product-analytics.repository.ts`
- `BE/src/modules/analytics/infrastructure/persistence/prisma-product-analytics.repository.ts`
- `BE/src/modules/analytics/infrastructure/analytics.module.ts`
- `BE/src/app.module.ts`

DB 산출물:

- `ProductAnalyticsEventSource`
- `UserActivationStatus`
- `ProductAnalyticsTargetType`
- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`

테스트 기준:

- `BE/src/modules/analytics/infrastructure/persistence/prisma-product-analytics.repository.spec.ts`
- `cd BE && pnpm run prisma:validate`
- `cd BE && pnpm run prisma:generate`

완료 산출물:

- Prisma schema validation/generate가 통과한다.
- 신규 schema/migration에 한국어 주석/COMMENT가 있다.
- PII payload 차단은 application allowlist에서 처리된다는 문서와 code hook이 있다.

## G03 Analytics Collector API

목표: User Web client event 수집 API를 만든다.

생성/수정 대상:

- `BE/src/modules/analytics/presentation/http/analytics.controller.ts`
- `BE/src/modules/analytics/presentation/http/dto/collect-product-analytics-event.dto.ts`
- `BE/src/modules/analytics/application/use-cases/collect-client-analytics-event.use-case.ts`
- `BE/src/modules/analytics/domain/product-analytics.errors.ts`
- `BE/src/modules/analytics/domain/product-analytics-event-taxonomy.ts`
- `BE/src/modules/analytics/application/services/product-analytics-event-recorder.ts`
- `BE/src/modules/analytics/application/services/product-analytics-date.ts`
- `BE/src/shared/application/context/current-user.context.ts`는 필요 시만 확장

API 산출물:

- `POST /api/analytics/events`
- Request DTO: `CollectProductAnalyticsEventDto`
- Response DTO: `CollectProductAnalyticsEventResponse`

테스트 기준:

- `BE/src/modules/analytics/presentation/http/analytics.controller.spec.ts`
- `BE/src/modules/analytics/application/use-cases/collect-client-analytics-event.use-case.spec.ts`

완료 산출물:

- Client는 user/session/device id를 보낼 수 없다.
- Backend가 current user/session/device/timezone을 채운다.
- invalid event/payload는 저장되지 않는다.

## G04 Server Event Logging

목표: 핵심 server-side 성공 event를 auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product use case와 application service에 연결한다.

수정 대상:

- `BE/src/modules/auth/presentation/http/auth.controller.ts`: `auth_signup_completed` requestId 전달
- `BE/src/modules/deal/presentation/http/deal.controller.ts`: deal/export server event requestId 전달
- `BE/src/modules/schedule/presentation/http/schedule.controller.ts`: schedule server event requestId 전달
- `BE/src/modules/meeting-note/presentation/http/meeting-note.controller.ts`: meeting-note server event requestId 전달
- `BE/src/modules/business-card/presentation/http/business-card.controller.ts`: business-card server event requestId 전달
- `BE/src/modules/data-import/presentation/http/import-job.controller.ts`: import server event requestId 전달
- `BE/src/modules/company/presentation/http/company.controller.ts`: export server event requestId 전달
- `BE/src/modules/contact/presentation/http/contact.controller.ts`: export server event requestId 전달
- `BE/src/modules/product/presentation/http/product.controller.ts`: export server event requestId 전달
- `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.ts`: `auth_signup_completed`
- `BE/src/modules/deal/application/services/deal-application.service.ts`: `createDeal`, `createFollowingActionLog`, `exportDealsXlsx`
- `BE/src/modules/schedule/application/services/schedule-application.service.ts`: `createSchedule`, `updateSchedule`
- `BE/src/modules/meeting-note/application/services/meeting-note-application.service.ts`: `createMeetingNote`, `updateMeetingNote`, `linkMeetingNoteDeals`
- `BE/src/modules/business-card/application/services/business-card-application.service.ts`: `confirmScanLog`
- `BE/src/modules/data-import/application/services/data-import-application.service.ts`: `confirmImportJob`
- `BE/src/modules/company/application/services/company-application.service.ts`: `exportCompaniesXlsx`
- `BE/src/modules/contact/application/services/contact-application.service.ts`: `exportContactsXlsx`
- `BE/src/modules/product/application/services/product-application.service.ts`: `exportProductsXlsx`
- `BE/src/modules/auth/infrastructure/auth.module.ts`
- `BE/src/modules/deal/infrastructure/deal.module.ts`
- `BE/src/modules/schedule/infrastructure/schedule.module.ts`
- `BE/src/modules/meeting-note/infrastructure/meeting-note.module.ts`
- `BE/src/modules/business-card/infrastructure/business-card.module.ts`
- `BE/src/modules/data-import/infrastructure/data-import.module.ts`
- `BE/src/modules/company/infrastructure/company.module.ts`
- `BE/src/modules/contact/infrastructure/contact.module.ts`
- `BE/src/modules/product/infrastructure/product.module.ts`

테스트 기준:

- 수정된 controller spec에서 `RequestWithRequestId.requestId`가 application input으로 전달되는지 확인
- auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product service spec에서 recorder mock 호출 확인
- recorder failure가 product mutation success를 막지 않는 spec

완료 산출물:

- `auth_signup_completed`, `deal_created`, `deal_next_action_created`, `schedule_created`, `schedule_deal_linked`, `meeting_note_created`, `meeting_note_deal_linked`, `business_card_scan_confirmed`, `import_confirmed`, `export_downloaded`가 taxonomy와 같은 이름으로 기록된다.
- `deal_created`, `deal_next_action_created`, `schedule_deal_linked`, `meeting_note_deal_linked`가 activation 계산에 충분히 기록된다.
- analytics failure가 제품 API 실패로 전파되지 않는다.
- server event payload에 PII/raw text가 없다.

## G05 User Web Client Events

목표: User Web core `/app` route view event wrapper를 만든다.

생성/수정 대상:

- `FE/user-web/src/features/analytics/api/analytics-api.ts`
- `FE/user-web/src/features/analytics/hooks/use-app-route-analytics.ts`
- `FE/user-web/src/features/analytics/types/analytics.ts`
- `FE/user-web/src/features/analytics/utils/analytics-route-key.ts`
- `FE/user-web/src/components/layout/app-shell.tsx`
- `FE/user-web/src/lib/env.ts`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`

참조 대상:

- `FE/user-web/src/app/router/router.tsx`

테스트 기준:

- route key mapper unit test
- User Web E2E 또는 mock API test
- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`

완료 산출물:

- core `/app` route view만 전송된다.
- public/auth/legacy redirect route는 전송되지 않는다.
- `/app/contacts/scan`, `/app/meeting-notes/new`, `/app/export` redirect-only route는 전송되지 않는다.
- `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때만 User Web client event가 전송된다.
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 `VITE_PRODUCT_ANALYTICS_ENABLED`가 반영된다.
- UUID path param/raw query가 payload에 없다.
- analytics failure가 사용자 UX를 막지 않는다.

## G06 Snapshot Retention Batch

목표: activation/retention snapshot 계산과 raw event retention purge를 구현한다.

생성/수정 대상:

- `BE/src/modules/analytics/application/use-cases/process-product-analytics-snapshots.use-case.ts`
- `BE/src/modules/analytics/application/use-cases/purge-product-analytics-raw-events.use-case.ts`
- `BE/src/modules/analytics/infrastructure/processor/product-analytics-snapshot-processor.runner.ts`
- `BE/src/modules/analytics/application/ports/product-analytics.repository.ts`
- `BE/src/modules/analytics/infrastructure/persistence/prisma-product-analytics.repository.ts`
- `BE/src/modules/analytics/infrastructure/analytics.module.ts`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`

환경 변수:

- `PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_ENABLED`
- `PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_INTERVAL_MS`
- `PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_BATCH_SIZE`
- `PRODUCT_ANALYTICS_RETENTION_PURGE_ENABLED`
- `PRODUCT_ANALYTICS_RETENTION_PURGE_BATCH_SIZE`

테스트 기준:

- activation 계산 spec
- D1/D7/D30 retention 계산 spec
- purge cutoff/batch delete spec

완료 산출물:

- `UserActivationSnapshot`이 activation 기준으로 upsert된다.
- `RetentionCohortSnapshot`이 userId 없이 aggregate로 upsert된다.
- `PurgeProductAnalyticsRawEventsUseCase`가 365일 초과 raw event만 batch hard delete한다.
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 snapshot/purge 환경 변수가 반영된다.

## G07 AI Usage And Billing Reserved

목표: AI usage 1차 요약과 billing reserved taxonomy를 코드/문서에 연결한다.

생성/수정 대상:

- `BE/src/modules/analytics/application/use-cases/summarize-ai-usage.use-case.ts`
- `BE/src/modules/analytics/application/ports/product-analytics.repository.ts`
- `BE/src/modules/analytics/infrastructure/persistence/prisma-product-analytics.repository.ts`
- `BE/src/modules/analytics/domain/product-analytics-event-taxonomy.ts`
- 11/12에 넘길 TODO 주석은 문서에만 남기고 12 코드는 건드리지 않는다.

테스트 기준:

- `AiProviderCallLog` aggregation spec
- `groupBy=DAY` 현재 `User.timeZone` 기준 dateKey spec
- reserved event가 09 runtime allowlist에서 발생하지 않는 spec

완료 산출물:

- 사용자별 AI request/success/failure/pending/canceled/cost 집계 use case가 있다.
- `AiUsageDaily`는 생성하지 않는다.
- billing/paywall/churn event는 reserved 상태로 남는다.

## G08 QA Document Closeout

목표: 09 구현 결과를 검증하고 문서를 closeout한다.

검증 기준:

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

완료 산출물:

- README/SCOPE/BE-TODO/FE-TODO/DB-SCHEMA/API-SPEC/GOAL-SPECS가 구현 결과와 일치한다.
- 실행한 검증 명령과 결과가 `COMMON/GOAL-COMPLETION-CHECKLIST.md`에 기록된다.
- 실행하지 못한 검증은 사유가 기록된다.
