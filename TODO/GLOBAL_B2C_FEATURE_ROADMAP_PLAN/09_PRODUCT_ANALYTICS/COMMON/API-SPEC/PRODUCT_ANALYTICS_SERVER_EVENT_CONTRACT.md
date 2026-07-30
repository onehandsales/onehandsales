# Product Analytics Server Event Contract

상태: Implemented

## 1. 목적

Backend auth/deal/schedule/meeting-note/business-card/data-import/export use case와 application service에서 발생한 핵심 성공 행동을 `ProductAnalyticsEvent`에 server event로 기록한다.

이 문서는 HTTP API가 아니라 application 내부 contract다.

## 2. 계약 개요

- 계약 상태: implemented
- 소비자: Backend internal
- 호환성: 신규 내부 contract, 기존 API response 변경 없음
- 인증: 각 caller use case의 기존 AuthGuard/CurrentUserContext 사용
- 권한: auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product caller가 기존 user ownership을 먼저 확인해야 한다.

## 3. Internal API

- API 이름: 제품 분석 server event 기록 contract
- API 식별자: RecordProductAnalyticsServerEvent
- 호출 방식: application service/use case method
- Request 이름: `RecordProductAnalyticsServerEventCommand`
- Response 이름: 없음
- Success: void

### Request

```ts
type ProductAnalyticsTargetTypeCode =
  | "USER"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "BUSINESS_CARD_SCAN"
  | "IMPORT_JOB"
  | "EXPORT";

interface RecordProductAnalyticsServerEventCommand {
  readonly userId: string;
  readonly authSessionId: string | null;
  readonly requestId: string | null;
  readonly eventName: ProductAnalyticsServerEventName;
  readonly eventVersion?: number;
  readonly occurredAt?: Date;
  readonly timeZone: string;
  readonly idempotencyKey: string;
  readonly targetType: ProductAnalyticsTargetTypeCode;
  readonly targetId?: string | null;
  readonly payload?: Record<string, unknown>;
}
```

필드 의미:

| 필드 | 설명 |
|---|---|
| `userId` | 현재 사용자 ID |
| `authSessionId` | 현재 session ID. 없으면 null 허용 |
| `requestId` | HTTP 요청에서 발생한 event는 `RequestWithRequestId.requestId`, background/internal event는 null |
| `eventName` | server event allowlist 이름 |
| `eventVersion` | 기본 1 |
| `occurredAt` | 없으면 server now |
| `timeZone` | 현재 사용자 IANA timezone |
| `idempotencyKey` | 중복 server event 방지 key. server event에서는 필수 |
| `targetType` | 안전한 대상 타입. 예: `DEAL`, `SCHEDULE`, `MEETING_NOTE`, `IMPORT_JOB` |
| `targetId` | 대상 UUID. payload에 중복 저장하지 않는다. |
| `payload` | event별 allowlist summary |

### Response

없음.

Caller는 analytics 실패를 제품 API 실패로 전파하지 않는다.

## 4. Server Event Allowlist

Event별 target, idempotencyKey, payload field 타입은 `COMMON/EVENT-TAXONOMY.md`를 정본으로 한다. 아래 표는 API contract 요약이다.

| Event | targetType | payload allowlist |
|---|---|---|
| `auth_signup_completed` | `USER` | `provider`, `locale`, `countryCode`, `timeZone` |
| `deal_created` | `DEAL` | `dealStatus`, `currencyCode`, `hasCompany`, `hasContact`, `hasProduct` |
| `deal_next_action_created` | `DEAL` | `source` |
| `schedule_created` | `SCHEDULE` | `sourceType`, `isAllDay`, `hasDealLink` |
| `schedule_deal_linked` | `SCHEDULE` | `linkCountBucket` |
| `meeting_note_created` | `MEETING_NOTE` | `sourceType`, `hasDealLink`, `hasAiDraft` |
| `meeting_note_deal_linked` | `MEETING_NOTE` | `linkCountBucket` |
| `business_card_scan_confirmed` | `BUSINESS_CARD_SCAN` | `companyResolution`, `contactResolution`, `createdCompany`, `createdContact` |
| `import_confirmed` | `IMPORT_JOB` | `importType`, `rowCountBucket`, `importedRowCount` |
| `export_downloaded` | `EXPORT` | `exportType`, `rowCountBucket`, `locale` |

금지:

- 회사명, 담당자명, 제품명, 딜명
- memo/meeting note body
- phone/email
- AI prompt/raw response
- provider raw response

## 5. Business Logic

1. Caller use case/application service가 기존 mutation을 성공시킨다.
2. Caller는 response 구성에 필요한 값을 확보한다.
3. Caller는 analytics recorder를 try/catch로 호출한다.
4. Recorder는 eventName/version/payload allowlist를 검증한다.
5. Recorder는 `idempotencyKey`가 비어 있으면 저장하지 않고 `analytics.event.recordFailed` warning log를 남긴다.
6. Recorder는 `authSessionId`가 있으면 `ProductAnalyticsRepository.findAuthDeviceIdBySessionId`로 authDeviceId를 조회한다.
7. authSessionId가 없거나 세션 row가 없으면 `authDeviceId=null`로 저장을 계속한다.
8. Recorder는 `resolveProductAnalyticsEventDate(occurredAt, command.timeZone)`로 user timezone 기준 eventDate를 계산한다.
9. repository는 `toProductAnalyticsDateOnlyDate(eventDate)`로 Prisma `DateTime @db.Date` 저장용 `Date`를 만든다.
10. Recorder는 `source=SERVER`로 event를 저장한다.
11. 저장 실패 시 `analytics.event.recordFailed` warning log에 `requestId`, `userId`, `eventName`, `targetType`, `targetId`만 남긴다.

## 6. 연결된 DB 스키마

- 조회: AuthSession
- 생성: ProductAnalyticsEvent
- 수정: 없음
- 참조: User, AuthDevice

## 7. Transaction

- 필요 여부: 없음
- 이유: analytics 저장은 제품 mutation transaction과 분리한다.
- rollback 범위: analytics insert 단일 statement
- 제품 mutation rollback: analytics failure로 발생하지 않는다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

## 8. Observability

- log event key: `analytics.event.recordFailed`
- audit log: 없음
- request id: HTTP controller에서 시작된 흐름은 `RequestWithRequestId.requestId`를 command에 넣는다. background/internal 흐름은 `requestId=null`을 명시한다.
- redaction: payload 원문 logging 금지
- provider error context: 없음

## 9. 구현 지점

- `AuthController.exchange`
- `DealController`의 딜 생성, 다음 행동 생성, export handler
- `ScheduleController`의 일정 생성/수정 handler
- `MeetingNoteController`의 회의록 생성/수정/딜 연결 handler
- `BusinessCardController.confirmScanLog`
- `ImportJobController.confirmImportJob`
- `CompanyController.exportCompaniesXlsx`
- `ContactController.exportContactsXlsx`
- `ProductController.exportProductsXlsx`
- `ExchangeExternalAuthTokenUseCase`
- `DealApplicationService`
- `ScheduleApplicationService`
- `MeetingNoteApplicationService`
- `BusinessCardApplicationService`
- `DataImportApplicationService`
- `CompanyApplicationService.exportCompaniesXlsx`
- `ContactApplicationService.exportContactsXlsx`
- `ProductApplicationService.exportProductsXlsx`
- `DealApplicationService.exportDealsXlsx`

각 수정 지점에는 한국어 `// 기능 : ...` 또는 numbered step comment를 둔다.

## 10. 구현 결과

- 2026-07-30 G04에서 `ProductAnalyticsEventRecorder`와 `AnalyticsRecorderModule` 구현 완료
- auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product caller wiring 완료
- HTTP 기반 server event의 `RequestWithRequestId.requestId` 전달 완료
- 검증: `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- auth deal schedule meeting-note business-card data-import analytics` 통과
