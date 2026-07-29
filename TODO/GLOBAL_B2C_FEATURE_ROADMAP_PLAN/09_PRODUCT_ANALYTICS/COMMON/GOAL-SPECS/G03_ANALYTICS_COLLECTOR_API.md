# G03 Analytics Collector API

상태: Ready
목표: User Web client event 수집 API `POST /api/analytics/events`를 구현한다.

## 1. 목적

G03은 client event를 안전하게 수집하는 Backend API를 만든다. Client는 eventName과 allowlist payload만 보내고, Backend가 user/session/device/timezone을 채운다.

## 2. 포함 범위

- Analytics controller
- Request/response DTO
- Client event collect use case
- Payload allowlist validation
- AuthSession/AuthDevice enrichment
- Repository insert 연결
- Controller/use case spec

## 3. 제외 범위

- User Web route wrapper
- Server event 기록 지점 연결
- Snapshot batch
- Admin API/UI
- Billing/paywall/churn runtime event

## 4. 작업

1. `AnalyticsController`를 만든다.
2. `CollectProductAnalyticsEventDto`를 만든다.
3. `CollectClientAnalyticsEventUseCase`를 만든다.
4. `app_route_viewed` payload schema를 allowlist로 검증한다.
5. request body에 user/session/device/timezone/source/occurredAt/idempotencyKey/targetType/targetId가 들어오면 거절한다.
6. current user와 auth session에서 user/session/device context를 채운다.
7. `resolveProductAnalyticsEventDate(serverNow, currentUser.timeZone)`로 사용자 timezone 기준 `eventDate`를 계산한다.
8. `ProductAnalyticsEvent`를 저장한다.
9. `202 Accepted` response를 반환한다.

## 5. Request 계약

API spec: `COMMON/API-SPEC/PRODUCT_ANALYTICS_EVENT_API.md`

```json
{
  "eventName": "app_route_viewed",
  "eventVersion": 1,
  "payload": {
    "routeKey": "deals"
  }
}
```

허용 event:

- `app_route_viewed`

금지 body field:

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

## 6. Response 계약

Status: `202 Accepted`

```json
{
  "accepted": true
}
```

Error:

- `ANALYTICS_EVENT_UNSUPPORTED`
- `ANALYTICS_EVENT_VERSION_UNSUPPORTED`
- `ANALYTICS_PAYLOAD_INVALID`
- `ANALYTICS_PAYLOAD_PII_REJECTED`
- `ANALYTICS_ROUTE_KEY_UNSUPPORTED`

## 7. Business Logic

1. AuthGuard로 현재 사용자를 확인한다.
2. DTO validation을 수행한다.
3. event taxonomy allowlist를 검증한다.
4. payload schema allowlist를 검증한다.
5. PII/raw text 금지 key를 검사한다.
6. `ProductAnalyticsRepository.findAuthDeviceIdBySessionId(CurrentUserContext.sessionId)`로 `authDeviceId`를 조회한다.
7. 조회 결과가 없으면 `authDeviceId=null`로 event row 저장을 계속한다.
8. `occurredAt`은 server now로 둔다.
9. `eventDate`는 `resolveProductAnalyticsEventDate(occurredAt, currentUser.timeZone)` 결과로 계산한다.
10. repository는 `toProductAnalyticsDateOnlyDate(eventDate)`로 Prisma `DateTime @db.Date` 저장용 `Date`를 만든다.
11. repository에 저장한다.

## 8. User Flow

1. 사용자가 `/app/deals`로 이동한다.
2. G05에서 만든 User Web wrapper가 `app_route_viewed`를 보낸다.
3. G03 API가 event를 저장한다.
4. 실패해도 사용자에게 표시되지 않는다.

## 9. DB/Prisma 영향

G03은 G02에서 만든 schema를 사용한다.

- 조회: User, AuthSession
- 생성: ProductAnalyticsEvent
- 수정: 없음
- transaction: 없음

## 10. 코드 주석 기준

Backend:

- `AnalyticsController`: `// 역할 : 제품 분석 API 요청을 application 계층으로 위임합니다.`
- endpoint: `// API : 제품 분석, client event 수집`
- use case class: `// 역할 : client 분석 이벤트를 검증하고 저장하는 application use case입니다.`
- validation/helper method: `// 기능 : ...`
- eventDate helper: `// 기능 : UTC instant를 사용자 timezone 기준 eventDate로 변환합니다.`

## 11. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- analytics
```

## 12. Goal 검토 체크리스트

- [ ] `POST /api/analytics/events`가 AuthGuard를 사용한다.
- [ ] request DTO가 금지 field를 거절한다.
- [ ] `app_route_viewed` payload routeKey allowlist가 동작한다.
- [ ] Backend가 authSessionId/authDeviceId를 보강한다.
- [ ] `occurredAt`은 server now다.
- [ ] `eventDate`는 사용자 timezone 기준이다.
- [ ] invalid payload가 저장되지 않는다.
- [ ] 신규/수정 코드에 한국어 주석이 있다.
