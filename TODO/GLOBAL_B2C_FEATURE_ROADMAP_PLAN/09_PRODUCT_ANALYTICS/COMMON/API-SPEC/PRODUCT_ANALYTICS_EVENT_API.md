# Product Analytics Event API

상태: Confirmed Plan

## 1. 목적

User Web의 core `/app` route view 같은 client event를 자체 DB `ProductAnalyticsEvent`에 저장한다.

## 2. 계약 개요

- 계약 상태: confirmed
- 소비자: User Web
- 호환성: 신규 API, breaking change 없음
- 인증: User AuthGuard
- 권한: 현재 로그인 사용자 본인 event만 수집

## 3. POST /api/analytics/events

- API 이름: 제품 분석 client event 수집 API
- API 식별자: CollectProductAnalyticsEvent
- Method: POST
- Path: `/api/analytics/events`
- Request 이름: `CollectProductAnalyticsEventDto`
- Response 이름: `CollectProductAnalyticsEventResponse`
- Status: `202 Accepted`

### Request

Headers:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `Authorization` | Bearer token | 필수 | 기존 User Web app access token |

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `eventName` | string | 필수 | allowlist event 이름. 09 1차 client event는 `app_route_viewed`만 허용한다. |
| `eventVersion` | number | 필수 | payload schema version. 09 1차는 `1`만 허용한다. |
| `payload` | object | 필수 | event별 allowlist schema를 통과한 비식별 payload |

요청 예시:

```json
{
  "eventName": "app_route_viewed",
  "eventVersion": 1,
  "payload": {
    "routeKey": "deals"
  }
}
```

금지 request field:

- `userId`
- `authSessionId`
- `authDeviceId`
- `deviceId`
- `occurredAt`
- `eventDate`
- `timeZone`
- `source`
- `idempotencyKey`
- `targetType`
- `targetId`

Client가 위 필드를 보내면 `ANALYTICS_PAYLOAD_INVALID`로 거절한다.

### Response

```json
{
  "accepted": true
}
```

Response field:

| 필드 | 타입 | 설명 |
|---|---|---|
| `accepted` | boolean | event가 validation을 통과해 저장 요청이 accepted 됐는지 여부 |

## 4. app_route_viewed payload schema

정본 schema는 `COMMON/EVENT-TAXONOMY.md`의 `app_route_viewed` 섹션을 따른다.

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `routeKey` | string | 필수 | route allowlist key |
| `surface` | string | 선택 | FE가 진입 surface를 명시적으로 알 때만 `sidebar`, `bottom_nav`, `direct`, `redirect`, `unknown` 중 하나 |

Route key allowlist:

- `home`
- `companies`
- `company_create`
- `company_detail`
- `contacts`
- `contact_create`
- `contact_detail`
- `products`
- `product_create`
- `product_detail`
- `deals`
- `deal_create`
- `deal_detail`
- `schedules`
- `schedule_week`
- `schedule_detail`
- `meeting_notes`
- `meeting_note_create`
- `meeting_note_detail`
- `business_cards`
- `notifications`
- `import`
- `import_review`
- `import_detail`
- `trash`
- `settings`
- `more`

금지:

- route mapper에서 exact/static route와 `new`/`new/full` route보다 dynamic `:id` route를 먼저 검사하는 구현
- UUID path param
- raw URL
- query string
- public/auth route
- legacy redirect route
- `/app/contacts/scan`, `/app/meeting-notes/new`, `/app/export` redirect-only route

## 5. Business Logic

1. AuthGuard로 현재 사용자를 확인한다.
2. request body DTO를 validation한다.
3. `eventName`과 `eventVersion` allowlist를 확인한다.
4. payload schema allowlist를 확인한다.
5. payload에 PII/raw text 금지 field가 들어왔는지 확인한다.
6. `ProductAnalyticsRepository.findAuthDeviceIdBySessionId(CurrentUserContext.sessionId)`로 AuthSession의 `authDeviceId`를 조회한다.
7. 조회 결과가 없으면 `authDeviceId=null`로 저장을 계속한다.
8. `resolveProductAnalyticsEventDate(serverNow, currentUser.timeZone)`로 `eventDate`를 계산한다.
9. `RequestWithRequestId.requestId`를 structured log context로 전달한다.
10. `source=CLIENT`, `occurredAt=serverNow`로 `ProductAnalyticsEvent`를 저장한다.
11. `202 Accepted` response를 반환한다.

## 6. 연결된 DB 스키마

- 조회: User, AuthSession
- 생성: ProductAnalyticsEvent
- 수정: 없음
- transaction: 없음

## 7. Transaction

- 필요 여부: 없음
- 이유: 단일 analytics event insert이며 제품 mutation과 묶이지 않는다.
- rollback 범위: event insert 단일 statement
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

## 8. Observability

- log event key: 기본 성공 로그 없음. 실패는 exception filter 또는 `analytics.event.collectFailed`
- audit log: 없음
- request id: 사용
- redaction: payload 원문, email, phone, companyName, contactName, memo, meeting note body, AI prompt/raw response logging 금지
- provider error context: 없음

## 9. Error Response

| 상황 | Error code | HTTP | FE 처리 | Log |
|---|---|---|---|---|
| 인증 없음 | `Unauthorized` | 401 | 기존 auth refresh flow 이후 조용히 중단 | normal |
| eventName 미지원 | `ANALYTICS_EVENT_UNSUPPORTED` | 400 | 사용자 표시 없음 | warn |
| eventVersion 누락 또는 미지원 | `ANALYTICS_EVENT_VERSION_UNSUPPORTED` | 400 | 사용자 표시 없음 | warn |
| payload schema 불일치 | `ANALYTICS_PAYLOAD_INVALID` | 400 | 사용자 표시 없음 | warn |
| PII 의심 payload | `ANALYTICS_PAYLOAD_PII_REJECTED` | 400 | 사용자 표시 없음 | warn |
| routeKey 미지원 | `ANALYTICS_ROUTE_KEY_UNSUPPORTED` | 400 | 사용자 표시 없음 | warn |

## 10. FE/BE 처리 기준

FE:

- `FE/user-web/src/features/analytics/api/analytics-api.ts`에서 API client 함수를 만든다.
- `FE/user-web/src/features/analytics/hooks/use-app-route-analytics.ts`에서 route change를 감지한다.
- public/auth route와 legacy redirect route에서는 호출하지 않는다.
- analytics 실패는 사용자에게 표시하지 않는다.
- 신규/수정 함수에는 `// 기능 : ...` 주석을 둔다.

BE:

- `AnalyticsController` endpoint에 `// API : 제품 분석, client event 수집` 주석을 둔다.
- Controller method는 `@Req() request: RequestWithRequestId`를 받아 request id를 use case로 전달한다.
- `CollectClientAnalyticsEventUseCase`는 event taxonomy validation과 user/session/device enrichment를 담당한다.
- auth device 보강은 `ProductAnalyticsRepository.findAuthDeviceIdBySessionId`만 사용한다.
- `eventDate` 계산은 `product-analytics-date.ts`의 `resolveProductAnalyticsEventDate` helper만 사용한다.
- retention date offset 계산은 같은 파일의 `addDaysToProductAnalyticsDate` helper만 사용한다.
- Prisma `DateTime @db.Date` 저장 변환은 같은 파일의 `toProductAnalyticsDateOnlyDate` helper만 사용한다.
- Prisma `DateTime @db.Date` 조회 변환은 같은 파일의 `formatProductAnalyticsDateOnlyDate` helper만 사용한다.
- repository는 Prisma JSON 저장 전에 application allowlist를 통과한 payload만 받는다.
