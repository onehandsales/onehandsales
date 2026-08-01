# Admin Trash Operation API

상태: Implemented
연결 Goal: G05
소비자: Admin Web

## 1. GET /admin/api/users/:userId/trash-summary

- API 이름: Admin 사용자 Trash 요약 API
- API 식별자: `GetAdminUserTrashSummary`
- Response: `AdminUserTrashSummaryResponse`
- Status: `200`

Response:

```json
{
  "userId": "user-id",
  "total": 8,
  "activeRestoreWindow": 5,
  "expiredRestoreWindow": 3,
  "byDomain": {
    "COMPANY": { "active": 1, "expired": 0 },
    "CONTACT": { "active": 2, "expired": 1 },
    "PRODUCT": { "active": 0, "expired": 0 },
    "DEAL": { "active": 1, "expired": 2 },
    "SCHEDULE": { "active": 1, "expired": 0 },
    "MEETING_NOTE": { "active": 0, "expired": 0 }
  },
  "recoveryRequests": {
    "requested": 1,
    "reviewing": 0,
    "closed": 0
  }
}
```

Business Logic:

1. `deletedAt != null`인 user-owned 도메인 row를 count한다.
2. `trashExpiresAt >= now`는 active restore window로 본다.
3. `trashExpiresAt < now`는 expired restore window로 본다.
4. hard delete/purge는 수행하지 않는다.
5. 조회 audit를 남긴다.

## 2. GET /admin/api/users/:userId/trash-records

- API 이름: Admin 사용자 Trash 목록 API
- API 식별자: `ListAdminUserTrashRecords`
- Request: `ListAdminUserTrashRecordsQuery`
- Response: `AdminUserTrashRecordsResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `domain` | string | no | domain allowlist |
| `restoreWindow` | string | no | `ACTIVE`, `EXPIRED`, `ALL` |
| `cursor` | string | no | opaque |
| `limit` | number | no | 1~100, default 30 |

Response:

```json
{
  "items": [
    {
      "targetType": "DEAL",
      "targetId": "deal-id",
      "titleSnapshot": "삼성전자 갱신 딜",
      "deletedAt": "2026-07-20T00:00:00.000Z",
      "trashExpiresAt": "2026-07-27T00:00:00.000Z",
      "restoreWindow": "EXPIRED",
      "userCanSelfRestore": false,
      "sensitiveFlags": {
        "hasMemo": true,
        "hasPrivateMemo": false,
        "privateMemoIncluded": false
      },
      "recoveryRequest": {
        "id": "request-id",
        "status": "REQUESTED",
        "createdAt": "2026-07-31T00:00:00.000Z"
      }
    }
  ],
  "nextCursor": null
}
```

Business Logic:

1. domain별 deleted row를 safe select한다.
2. private memo 원문은 포함하지 않는다.
3. 만료 row도 목록에 포함할 수 있다.
4. Admin 직접 restore mutation은 제공하지 않는다.

## 3. GET /admin/api/trash/recovery-requests

- API 이름: Admin 복구 문의 목록 API
- API 식별자: `ListAdminTrashRecoveryRequests`
- Response: `AdminTrashRecoveryRequestListResponse`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `status` | string | no | `REQUESTED`, `REVIEWING`, `WAITING_RECOVERY_POLICY`, `RECOVERY_AVAILABLE`, `REJECTED`, `CLOSED` |
| `targetType` | string | no | domain allowlist |
| `cursor` | string | no | opaque |
| `limit` | number | no | 1~100 |

Response:

```json
{
  "items": [
    {
      "id": "request-id",
      "userId": "user-id",
      "userEmailMasked": "lo***@example.com",
      "targetType": "DEAL",
      "targetId": "deal-id",
      "titleSnapshot": "삼성전자 갱신 딜",
      "status": "REQUESTED",
      "deletedAt": "2026-07-20T00:00:00.000Z",
      "trashExpiresAt": "2026-07-27T00:00:00.000Z",
      "createdAt": "2026-07-31T00:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

Transaction: 목록 조회는 없음. 상태 변경 API를 후속 추가하면 audit와 같은 transaction 필요.

Observability:

- audit log: Trash user summary/list, recovery request queue 조회
- redaction: user email masked
