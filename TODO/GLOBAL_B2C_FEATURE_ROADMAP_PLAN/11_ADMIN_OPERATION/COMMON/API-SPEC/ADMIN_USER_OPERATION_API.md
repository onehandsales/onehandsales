# Admin User Operation API

상태: Implemented
연결 Goal: G03
소비자: Admin Web

## 1. GET /admin/api/users

- API 이름: Admin 사용자 목록 API
- API 식별자: `ListAdminUsers`
- Method: `GET`
- Request: `ListAdminUsersQuery`
- Response: `AdminUserListResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `q` | string | no | email/name 검색어, trim 1~100 |
| `status` | string | no | `ACTIVE`, `SUSPENDED`, `DELETED` |
| `countryCode` | string | no | `KR`, `US` 우선 |
| `preferredLocale` | string | no | `ko-KR`, `en` |
| `cursor` | string | no | opaque |
| `limit` | number | no | 1~100, default 50 |
| `sort` | string | no | `createdAt.desc`, `lastLoginAt.desc` |

Response:

```json
{
  "items": [
    {
      "id": "user-id",
      "emailMasked": "lo***@example.com",
      "displayNameMasked": "로컬 관**",
      "role": "USER",
      "status": "ACTIVE",
      "preferredLocale": "ko-KR",
      "timeZone": "Asia/Seoul",
      "countryCode": "KR",
      "defaultCurrencyCode": "KRW",
      "createdAt": "2026-07-01T00:00:00.000Z",
      "lastLoginAt": "2026-07-31T01:00:00.000Z",
      "domainCounts": {
        "companies": 12,
        "contacts": 48,
        "products": 7,
        "deals": 19,
        "schedules": 6,
        "meetingNotes": 8,
        "trashActive": 3,
        "trashExpired": 1
      }
    }
  ],
  "nextCursor": null
}
```

Business Logic:

1. AdminGuard를 확인한다.
2. User 목록을 조건별로 조회한다.
3. email/name은 response에서 masked 처리한다.
4. domain count는 userId 기준으로 aggregate한다.
5. 목록 조회 audit를 남긴다.

Transaction: 없음.

Observability:

- audit log: `ADMIN_USER_LIST_VIEW`
- redaction: 검색어 q가 email일 수 있으므로 원문 log 금지

## 2. GET /admin/api/users/:userId

- API 이름: Admin 사용자 상세 요약 API
- API 식별자: `GetAdminUserOverview`
- Request: path param `userId`
- Response: `AdminUserOverviewResponse`
- Status: `200`

Response:

```json
{
  "id": "user-id",
  "profile": {
    "emailMasked": "lo***@example.com",
    "displayNameMasked": "로컬 사**",
    "role": "USER",
    "status": "ACTIVE",
    "preferredLocale": "ko-KR",
    "timeZone": "Asia/Seoul",
    "countryCode": "KR",
    "defaultCurrencyCode": "KRW",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "lastLoginAt": "2026-07-31T01:00:00.000Z"
  },
  "domainCounts": {
    "companies": 12,
    "contacts": 48,
    "products": 7,
    "deals": 19,
    "schedules": 6,
    "meetingNotes": 8,
    "businessCardScans": 4,
    "imports": 2,
    "exports": 5
  },
  "trashSummary": {
    "active": 3,
    "expired": 1,
    "recoveryRequests": 0
  },
  "analyticsSummary": {
    "activationStatus": "ACTIVATED",
    "activatedAt": "2026-07-05T00:00:00.000Z",
    "lastActiveEventAt": "2026-07-31T00:00:00.000Z",
    "aiRequestCount30d": 14,
    "aiEstimatedCost30d": "0.42"
  },
  "notificationSummary": {
    "browserPushEnabled": true,
    "activeBrowserPushSubscriptions": 1,
    "revokedBrowserPushSubscriptions": 0,
    "lastBrowserPushDeliveryStatus": "SENT",
    "lastDeliveryFailureSafeErrorCode": null
  }
}
```

Business Logic:

1. AdminGuard를 확인한다.
2. `userId`로 User를 조회한다.
3. User 소유 도메인 count를 계산한다.
4. Trash active/expired count를 계산한다.
5. 09 snapshot과 `AiProviderCallLog` 기반 summary를 결합한다.
6. 10번 notification permission UX 운영 확인을 위해 `UserNotificationSetting`, `BrowserPushSubscription`, `NotificationDeliveryAttempt`에서 safe notification summary를 계산한다.
7. `ADMIN_USER_DETAIL_VIEW` audit를 남긴다.

Transaction: audit 기록이 있으면 단일 transaction 후보.

Observability:

- audit log: 필수
- redaction: email/displayName 원문 log 금지, browser push endpoint/key/userAgent 원문 response/log 금지

## 3. GET /admin/api/users/:userId/activity-timeline

- API 이름: Admin 사용자 활동 timeline API
- API 식별자: `ListAdminUserActivityTimeline`
- Request: `ListAdminUserActivityTimelineQuery`
- Response: `AdminUserActivityTimelineResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `cursor` | string | no | opaque |
| `limit` | number | no | 1~100, default 30 |
| `from` | ISO string | no | UTC instant |
| `to` | ISO string | no | UTC instant |
| `eventType` | string | no | allowlist |

Response:

```json
{
  "items": [
    {
      "id": "event-id",
      "eventType": "deal_created",
      "source": "PRODUCT_ANALYTICS_EVENT",
      "targetType": "DEAL",
      "targetId": "deal-id",
      "title": "딜 생성",
      "summary": "딜 1건을 만들었어요",
      "occurredAt": "2026-07-31T00:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

Business Logic:

1. `ProductAnalyticsEvent`와 필요한 domain createdAt 기반으로 timeline을 만든다.
2. title/summary는 안전한 문구로 생성한다.
3. 도메인 원문 body/memo/private memo는 포함하지 않는다.

Transaction: 없음.
