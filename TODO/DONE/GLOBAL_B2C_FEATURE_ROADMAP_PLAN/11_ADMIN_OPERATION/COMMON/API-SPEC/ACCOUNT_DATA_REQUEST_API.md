# Account Data Request API

상태: Implemented
연결 Goal: G08
소비자: User Web, Admin Web

## 1. POST /api/users/me/data-export-requests

- API 이름: 내 데이터 export 요청 API
- API 식별자: `CreateMyDataExportRequest`
- Request: `CreateMyDataExportRequestDto`
- Response: `UserDataExportRequestResponse`
- Status: `201`

Body:

```json
{
  "includeSensitive": false,
  "format": "ZIP_JSON_XLSX"
}
```

Response:

```json
{
  "id": "export-request-id",
  "status": "REQUESTED",
  "includeSensitive": false,
  "format": "ZIP_JSON_XLSX",
  "requestedAt": "2026-07-31T00:00:00.000Z",
  "expiresAt": null,
  "downloadUrl": null
}
```

Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. open export request가 있으면 중복 생성하지 않는다.
3. 만료된 `READY` request는 `EXPIRED`로 전환한 뒤 open request를 판단한다.
4. request row를 만든다.
5. provider raw, token, Admin audit/internal note는 export 대상에서 제외한다.

Error:

| 상황 | code | status |
|---|---|---|
| `includeSensitive=true` | `DATA_EXPORT_INCLUDE_SENSITIVE_UNSUPPORTED` | 400 |
| 지원하지 않는 format | `DATA_EXPORT_FORMAT_UNSUPPORTED` | 400 |

## 2. GET /api/users/me/data-export-requests/:requestId

- API 이름: 내 데이터 export 요청 상태 조회 API
- API 식별자: `GetMyDataExportRequest`
- Request: path param `requestId`
- Response: `UserDataExportRequestResponse`
- Status: `200`

Response:

```json
{
  "id": "export-request-id",
  "status": "READY",
  "includeSensitive": false,
  "format": "ZIP_JSON_XLSX",
  "requestedAt": "2026-07-31T00:00:00.000Z",
  "expiresAt": "2026-08-07T00:00:00.000Z",
  "downloadUrl": "/api/users/me/data-export-requests/export-request-id/download"
}
```

Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자 소유 request만 조회한다.
3. `READY` 상태이고 `expiresAt > now`일 때만 `downloadUrl`을 반환한다.
4. 만료된 request는 `EXPIRED`로 보거나 만료 상태를 response에 반영한다.
5. 다른 사용자의 request 존재 여부는 노출하지 않는다.

Error:

| 상황 | code | status |
|---|---|---|
| 요청 없음 또는 소유권 없음 | `DATA_EXPORT_REQUEST_NOT_FOUND` | 404 |
| requestId 형식 오류 | `DATA_EXPORT_REQUEST_ID_INVALID` | 400 |

## 3. POST /api/users/me/account-deletion-requests

- API 이름: 내 계정 삭제 요청 API
- API 식별자: `CreateMyAccountDeletionRequest`
- Request: `CreateMyAccountDeletionRequestDto`
- Response: `AccountDeletionRequestResponse`
- Status: `201`

Body:

```json
{
  "confirmText": "DELETE MY ACCOUNT",
  "reasonCode": "NO_LONGER_NEEDED",
  "reasonMessage": "더 이상 사용하지 않아요"
}
```

Response:

```json
{
  "id": "deletion-request-id",
  "status": "REQUESTED",
  "requestedAt": "2026-07-31T00:00:00.000Z",
  "scheduledDeletionAt": "2026-08-30T00:00:00.000Z",
  "canCancelUntil": "2026-08-30T00:00:00.000Z"
}
```

Business Logic:

1. confirmText를 정확히 검증한다.
2. 기존 open deletion request가 있으면 기존 request를 반환한다.
3. `scheduledDeletionAt = now + 30일`로 저장한다.
4. 유예 기간 중 취소 flow를 유지하기 위해 G08에서는 세션 revoke/접근 차단을 적용하지 않는다.
5. 세션 revoke/접근 차단은 실제 삭제/익명화 job 정책에서 확정한다.
6. 일반 Trash row hard delete와 섞지 않는다.

Error:

| 상황 | code | status |
|---|---|---|
| confirmText 불일치 | `ACCOUNT_DELETION_CONFIRM_TEXT_INVALID` | 400 |

## 4. POST /api/users/me/account-deletion-requests/:requestId/cancel

Response:

```json
{
  "id": "deletion-request-id",
  "status": "CANCELLED",
  "cancelledAt": "2026-08-01T00:00:00.000Z"
}
```

Business Logic:

1. requestId UUID 형식을 검증한다.
2. 현재 사용자 소유 request만 취소한다.
3. `canCancelUntil` 이전 request만 취소할 수 있다.
4. 이미 processing/completed면 취소할 수 없다.

Error:

| 상황 | code | status |
|---|---|---|
| 요청 없음 또는 소유권 없음 | `ACCOUNT_DELETION_REQUEST_NOT_FOUND` | 404 |
| requestId 형식 오류 | `ACCOUNT_DELETION_REQUEST_ID_INVALID` | 400 |
| 취소 불가 상태 또는 유예 만료 | `ACCOUNT_DELETION_REQUEST_NOT_CANCELABLE` | 409 |

## 5. GET /admin/api/account-deletion-requests

Query:

| field | 설명 |
|---|---|
| `status` | `REQUESTED`, `CANCELLED`, `PROCESSING`, `COMPLETED`, `ALL` |
| `cursor` | 이전 응답의 `nextCursor` |
| `limit` | 기본 30, 최대 100 |

Response:

```json
{
  "items": [
    {
      "id": "deletion-request-id",
      "userId": "user-id",
      "userEmailMasked": "lo***@example.com",
      "status": "REQUESTED",
      "requestedAt": "2026-07-31T00:00:00.000Z",
      "scheduledDeletionAt": "2026-08-30T00:00:00.000Z",
      "reasonCode": "NO_LONGER_NEEDED"
    }
  ],
  "nextCursor": null
}
```

## 6. GET /admin/api/data-export-requests

Query:

| field | 설명 |
|---|---|
| `status` | `REQUESTED`, `PROCESSING`, `READY`, `EXPIRED`, `FAILED`, `ALL` |
| `cursor` | 이전 응답의 `nextCursor` |
| `limit` | 기본 30, 최대 100 |

Response:

```json
{
  "items": [
    {
      "id": "export-request-id",
      "userId": "user-id",
      "userEmailMasked": "lo***@example.com",
      "status": "READY",
      "includeSensitive": false,
      "format": "ZIP_JSON_XLSX",
      "requestedAt": "2026-07-31T00:00:00.000Z",
      "expiresAt": "2026-08-07T00:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

Transaction:

- request 생성/취소: 필요
- Admin 목록 조회: queue 조회와 audit 기록을 같은 transaction으로 묶음

Observability:

- audit log: Admin request queue 조회
- redaction: reasonMessage는 log 원문 저장 금지
