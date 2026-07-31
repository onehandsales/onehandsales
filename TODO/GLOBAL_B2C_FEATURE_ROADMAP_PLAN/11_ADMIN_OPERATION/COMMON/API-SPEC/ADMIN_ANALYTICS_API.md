# Admin Analytics API

상태: Confirmed Planning
연결 Goal: G07
소비자: Admin Web

## 1. GET /admin/api/analytics/overview

- API 이름: Admin 운영 분석 요약 API
- API 식별자: `GetAdminAnalyticsOverview`
- Request: `GetAdminAnalyticsOverviewQuery`
- Response: `AdminAnalyticsOverviewResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `from` | ISO string | yes | UTC instant |
| `to` | ISO string | yes | UTC instant |
| `timeZone` | string | no | IANA timezone, default `Asia/Seoul` |
| `countryCode` | string | no | optional filter |
| `preferredLocale` | string | no | optional filter |

Response:

```json
{
  "range": {
    "from": "2026-07-01T00:00:00.000Z",
    "to": "2026-07-31T23:59:59.999Z",
    "timeZone": "Asia/Seoul"
  },
  "activation": {
    "activatedUsers": 120,
    "notActivatedUsers": 42,
    "activationRate": 0.7407
  },
  "retention": [
    {
      "cohortDate": "2026-07-01",
      "dayOffset": 7,
      "cohortUserCount": 40,
      "retainedUserCount": 18,
      "retentionRate": 0.45
    }
  ],
  "events": [
    {
      "eventName": "deal_created",
      "count": 340
    },
    {
      "eventName": "meeting_note_created",
      "count": 128
    }
  ],
  "routes": [
    {
      "routeKey": "deals",
      "viewCount": 820
    }
  ],
  "aiUsage": {
    "requestCount": 460,
    "successCount": 430,
    "failureCount": 30,
    "estimatedCost": "18.24"
  }
}
```

Business Logic:

1. AdminGuard를 확인한다.
2. `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`을 조회한다.
3. AI usage는 `AiProviderCallLog` aggregate를 사용한다.
4. PII/raw payload를 조회하지 않는다.
5. billing/subscription 관련 event는 11에서 만들거나 조회하지 않는다.
6. 조회 audit를 남긴다.

Transaction: 없음.

Observability:

- audit log: `ADMIN_ANALYTICS_VIEW`
- redaction: analytics payload raw dump 금지

Error:

| 상황 | code | status |
|---|---|---|
| 기간 누락 | `ADMIN_ANALYTICS_RANGE_REQUIRED` | 400 |
| 기간 과도 | `ADMIN_ANALYTICS_RANGE_TOO_LARGE` | 400 |
| timezone invalid | `ADMIN_TIMEZONE_INVALID` | 400 |
