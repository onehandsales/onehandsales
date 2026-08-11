# Backend API TODO

상태: Completed

## 1. API 범위

| Method | Path | 목적 | 상태 |
|---|---|---|---|
| `POST` | `/api/analytics/events` | User Web client event 수집 | G03 구현 완료 |
| 내부 | `ProductAnalyticsEventRecorder.recordServerEvent` | server-side domain event 기록 | G04 구현 완료 |
| 내부/runner | `ProcessProductAnalyticsSnapshotsUseCase` | activation/retention snapshot 계산 | G06 구현 완료 |
| 내부/runner | `PurgeProductAnalyticsRawEventsUseCase` | 365일 초과 raw event batch hard delete | G06 구현 완료 |
| 내부 | `SummarizeAiUsageUseCase` | 사용자별 AI usage 계산 | G07 구현 완료 |
| 09 제외 | `/admin/api/analytics/*` | Admin analytics 조회 | 11로 이관 |
| 09 제외 | `/api/experiments/assignments` | growth experiment assignment | 12 이후 |
| 09 제외 | `/api/feedback/churn-surveys` | churn survey 수집 | `TODO/PADDLE_PLAN`으로 이관 |

공통 API 계약은 `COMMON/API-SPEC`를 따른다.

## 2. 신규 Backend 모듈 구현 대상

```text
BE/src/modules/analytics/
  application/
    ports/
      product-analytics.repository.ts
    services/
      product-analytics-date.ts
      product-analytics-event-input-policy.ts
      product-analytics-event-recorder.ts
    use-cases/
      collect-client-analytics-event.use-case.ts
      process-product-analytics-snapshots.use-case.ts
      purge-product-analytics-raw-events.use-case.ts
      summarize-ai-usage.use-case.ts
  domain/
    product-analytics-event-taxonomy.ts
    product-analytics.errors.ts
  infrastructure/
    analytics-recorder.module.ts
    analytics.module.ts
    persistence/
      prisma-product-analytics.repository.ts
    processor/
      product-analytics-snapshot-processor.runner.ts
  presentation/
    http/
      analytics.controller.ts
      dto/
        collect-product-analytics-event.dto.ts
```

## 3. Controller / Use Case 계약

### `POST /api/analytics/events`

- AuthGuard 필수
- Request DTO: `CollectProductAnalyticsEventDto`
- Response DTO: `CollectProductAnalyticsEventResponse`
- Success status: `202 Accepted`
- Client는 `eventName`, `eventVersion`, allowlist `payload`만 보낸다.
- Backend는 `userId`, `authSessionId`, `authDeviceId`, `occurredAt`, `eventDate`, `timeZone`, `source=CLIENT`를 채운다.
- `authDeviceId`는 `ProductAnalyticsRepository.findAuthDeviceIdBySessionId(currentUser.sessionId)`로 조회하고, 세션 row가 없으면 null로 저장한다.
- `eventDate`는 `resolveProductAnalyticsEventDate(occurredAt, currentUser.timeZone)` helper로 계산한 `YYYY-MM-DD`를 저장한다.
- repository는 `eventDate`를 Prisma `DateTime @db.Date`에 넣기 전에 `toProductAnalyticsDateOnlyDate`로 UTC midnight `Date`로 변환한다.
- Client가 session/device/user id를 보내면 validation error로 거절한다.
- Invalid event는 저장하지 않는다.
- FE는 analytics 실패를 사용자에게 알리지 않는다.

### Server event recorder

- HTTP API가 아니다.
- auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product application service/use case가 성공 후 명시적으로 호출한다.
- HTTP에서 발생한 server event는 기존 controller가 `RequestWithRequestId.requestId`를 application input에 전달한다.
- transaction에 묶지 않는다. 제품 기능 성공 후 best-effort로 기록한다.
- 실패하면 `analytics.event.recordFailed` structured warning log만 남긴다.
- 모든 server event는 idempotencyKey를 필수로 사용해 retry/중복 호출 시 같은 event가 중복 저장되지 않게 한다.
- server event recorder도 `ProductAnalyticsRepository.findAuthDeviceIdBySessionId`로만 device를 보강한다.
- server event recorder도 `resolveProductAnalyticsEventDate(occurredAt, command.timeZone)` helper로 `eventDate`를 계산한다.
- background/internal 흐름만 `requestId=null`을 사용한다.

## 4. Server Event 기록 지점 구현 대상

| Event | 구현 파일 | 기록 시점 |
|---|---|---|
| `auth_signup_completed` | `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.ts` | 신규 User 생성과 session 발급 성공 후 |
| `deal_created` | `BE/src/modules/deal/application/services/deal-application.service.ts` | 딜 생성 transaction 성공 후 |
| `deal_next_action_created` | `BE/src/modules/deal/application/services/deal-application.service.ts` | 다음 행동 로그 생성 성공 후 |
| `schedule_created` | `BE/src/modules/schedule/application/services/schedule-application.service.ts` | 일정 생성 성공 후 |
| `schedule_deal_linked` | `BE/src/modules/schedule/application/services/schedule-application.service.ts` | `createSchedule`/`updateSchedule`에서 새 일정-딜 연결 추가 성공 후 |
| `meeting_note_created` | `BE/src/modules/meeting-note/application/services/meeting-note-application.service.ts` | 회의록 저장 성공 후 |
| `meeting_note_deal_linked` | `BE/src/modules/meeting-note/application/services/meeting-note-application.service.ts` | `createMeetingNote`/`updateMeetingNote`/`linkMeetingNoteDeals`에서 새 회의록-딜 연결 추가 성공 후 |
| `business_card_scan_confirmed` | `BE/src/modules/business-card/application/services/business-card-application.service.ts` | OCR 결과 확인 저장 성공 후 |
| `import_confirmed` | `BE/src/modules/data-import/application/services/data-import-application.service.ts` | import confirm 성공 후 |
| `export_downloaded` | `CompanyApplicationService.exportCompaniesXlsx`, `ContactApplicationService.exportContactsXlsx`, `ProductApplicationService.exportProductsXlsx`, `DealApplicationService.exportDealsXlsx` | 회사/담당자/제품/딜 xlsx 생성 성공 후 |

## 5. Transaction 기준

- `ProductAnalyticsEvent` 저장은 제품 mutation transaction과 분리한다.
- Analytics 저장 실패는 제품 mutation rollback 사유가 아니다.
- Snapshot runner는 batch 단위 transaction을 사용한다.
- Snapshot 재계산은 같은 날짜/사용자/metric에 대해 upsert한다.
- Retention purge는 `PurgeProductAnalyticsRawEventsUseCase`에서 `occurredAt < now - 365 days` raw event만 batch hard delete한다.
- Retention purge는 `UserActivationSnapshot`, `RetentionCohortSnapshot`, `AiProviderCallLog`를 삭제하지 않는다.

## 6. Observability 기준

| 상황 | Log event key | Level |
|---|---|---|
| client event accepted | 기본 로그 없음 또는 debug | debug |
| client event validation failed | exception filter 기준 | warn |
| server event record failed | `analytics.event.recordFailed` | warn |
| snapshot runner tick | `analytics.snapshot.processor.tick` | log |
| snapshot runner failed | `analytics.snapshot.processor.failed` | error |
| retention purge completed | `analytics.retention.purgeCompleted` | log |
| retention purge failed | `analytics.retention.purgeFailed` | error |

Redaction:

- payload에 PII/raw text가 있으면 저장하지 않는다.
- log context에 payload 원문을 남기지 않는다.
- provider raw error, prompt, response, token, email, phone, memo, meeting note body는 logging 금지다.

## 7. 코드 주석 기준

Backend 신규/수정 코드에는 아래 주석을 반드시 둔다.

- controller endpoint: `// API : ...`
- class/interface: `// 역할 : ...`
- use case/service/repository/helper: `// 기능 : ...`
- 긴 orchestration: `// 1. ...`, `// 2. ...`

## 8. G08 Closeout

- 완료일: 2026-07-30
- `POST /api/analytics/events`, server event recorder, snapshot/purge use case, AI usage summary use case 구현 상태를 확인했다.
- `/admin/api/analytics/*`, billing/paywall/churn, growth experiment API는 09에서 만들지 않았고 각각 11/12/후속 범위로 유지했다.
- Backend 검증은 `pnpm.cmd run prisma:validate`, `pnpm.cmd run prisma:generate`, `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run test`, `pnpm.cmd run build`를 통과했다.
- 실행하지 못한 G08 Backend 검증은 없다.
