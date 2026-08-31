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

Observability:

- audit log: 현재 구현은 timeline 조회 audit를 생성하지 않는다.
- redaction: timeline title/summary에는 domain 원문 memo/body/private memo를 포함하지 않는다.

## 4. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 Admin Web 전용 사용자 운영 조회 API 보관 문서다. G05에서는 세 API의 Method/Path/Request 이름, 현재 구현의 audit transaction 여부, masking, FE/BE 처리 기준을 보강하며 response shape 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: Admin Web
- 호환성: 기존 `/admin/api/users*` GET 계약 유지. breaking change 없음
- 권한: `AuthGuard` + `AdminGuard`, application service의 `assertAdmin`
- FE 호출 경계: `adminApiClient` 상대 경로 `/users`, `/users/:userId`, `/users/:userId/activity-timeline`

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| Admin 사용자 목록 API | `ListAdminUsers` | `GET` | `/admin/api/users` | `ListAdminUsersQueryDto` / FE `AdminUserListParams` | `AdminUserListResponse` |
| Admin 사용자 상세 요약 API | `GetAdminUserOverview` | `GET` | `/admin/api/users/:userId` | path param `userId` | `AdminUserOverviewResponse` |
| Admin 사용자 활동 timeline API | `ListAdminUserActivityTimeline` | `GET` | `/admin/api/users/:userId/activity-timeline` | path param `userId` + `ListAdminUserActivityTimelineQueryDto` / FE `AdminUserActivityTimelineParams` | `AdminUserActivityTimelineResponse` |

연결된 DB 스키마:

- 조회: `User`, `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`, `BusinessCardScanLog`, `ImportJob`, `ProductAnalyticsEvent`, `AiProviderCallLog`, `UserActivationSnapshot`, `UserNotificationSetting`, `BrowserPushSubscription`, `NotificationDeliveryAttempt`
- audit: `AdminAuditLog`

Transaction:

- `GET /admin/api/users`: 필요 여부 없음. 현재 구현은 목록과 domain count를 transaction 밖에서 조회한 뒤 `ADMIN_USER_LIST_VIEW` audit를 append-only로 생성한다.
- `GET /admin/api/users/:userId`: 필요 여부 없음. 현재 구현은 summary를 transaction 밖에서 조회한 뒤 `ADMIN_USER_DETAIL_VIEW` audit를 append-only로 생성한다.
- `GET /admin/api/users/:userId/activity-timeline`: 필요 여부 없음. safe timeline 조회 전용이며 현재 audit를 생성하지 않는다.
- 외부 Provider: 없음. 저장된 analytics/provider log summary만 조회한다.

Observability:

- log event key: 별도 application log event 없음. audit action은 `ADMIN_USER_LIST_VIEW`, `ADMIN_USER_DETAIL_VIEW`
- audit log: 사용자 목록/상세는 필수. timeline 조회는 현재 구현 기준 미기록이다.
- request id: 목록/상세는 controller에서 application metadata로 전달해 audit에 저장한다. timeline은 현재 request id를 application metadata로 전달하지 않는다.
- masking: response mapper가 `emailMasked`, `displayNameMasked`만 반환한다.
- redaction: 검색어 q 원문, email/displayName 원문, notification push endpoint/key/userAgent, domain memo/body/private memo 원문을 response/log/audit metadata에 넣지 않는다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| userId 형식 오류 | pipe validation | 400 | 잘못된 사용자 상세 경로 안내 | warn |
| 사용자 없음 | `ADMIN_USER_NOT_FOUND` | 404 | 사용자 not found 상태 표시 | warn |
| q 길이 초과/status/sort/eventType/date invalid | validation error | 400 | filter inline 오류 또는 기본값 재조회 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin shell 접근 차단 | warn |
| 목록/상세 audit 저장 실패 | 내부 오류 | 500 | 사용자 화면 오류 상태와 재시도 제공 | error |

FE/BE 처리 기준:

- FE는 Admin Web 사용자 관리 기능에서만 이 API를 호출하며 User Web 계정 API와 섞지 않는다.
- BE는 목록/상세 response에서 원문 email/displayName을 mapper 단계에서 masking한다.
- 활동 timeline은 안전한 title/summary만 반환하고 domain 원문 content를 표시하지 않는다.
- 민감 원문 조회는 `/admin/api/sensitive/raw-access`의 reason + audit flow로 분리한다.
