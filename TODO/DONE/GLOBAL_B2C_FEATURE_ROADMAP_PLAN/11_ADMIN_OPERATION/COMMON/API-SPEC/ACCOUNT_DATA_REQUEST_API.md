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

## 7. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 User Web의 본인 계정 데이터 요청 API와 Admin Web의 운영 queue 조회 API가 함께 들어 있는 보관 문서다. G05에서는 파일을 분리하지 않고 prefix, 소비자, 권한, audit 경계를 명시해 같은 계약 안에서 role 분기로 오해하지 않도록 보강한다. 기존 API path, request, response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web, Admin Web
- 호환성: 기존 구현 API 문서 보강만 수행. breaking change 없음, FE migration 없음
- User API prefix: `/api/users/me/*`, `AuthGuard`, 현재 사용자 본인 request만 생성/조회/취소
- Admin API prefix: `/admin/api/*`, `AuthGuard` + `AdminGuard`, Admin Web queue 조회 전용
- 민감정보 원문 정책: `includeSensitive=true` export는 현재 미지원이며 provider raw, token, Admin audit/internal note는 export 대상이 아니다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 소비자 |
|---|---|---|---|---|---|---|
| 내 데이터 export 요청 API | `CreateMyDataExportRequest` | `POST` | `/api/users/me/data-export-requests` | `CreateMyDataExportRequestDto` / FE `CreateDataExportRequestInput` | `UserDataExportRequestResponse` | User Web |
| 내 데이터 export 요청 상태 조회 API | `GetMyDataExportRequest` | `GET` | `/api/users/me/data-export-requests/:requestId` | path param `requestId` | `UserDataExportRequestResponse` | User Web |
| 내 계정 삭제 요청 API | `CreateMyAccountDeletionRequest` | `POST` | `/api/users/me/account-deletion-requests` | `CreateMyAccountDeletionRequestDto` / FE `CreateAccountDeletionRequestInput` | `AccountDeletionRequestResponse` | User Web |
| 내 계정 삭제 요청 취소 API | `CancelMyAccountDeletionRequest` | `POST` | `/api/users/me/account-deletion-requests/:requestId/cancel` | path param `requestId` | `CancelAccountDeletionRequestResponse` | User Web |
| Admin 계정 삭제 요청 queue API | `ListAdminAccountDeletionRequests` | `GET` | `/admin/api/account-deletion-requests` | `ListAdminAccountDeletionRequestsQueryDto` / FE `AdminAccountDeletionRequestsParams` | `AdminAccountDeletionRequestsResponse` | Admin Web |
| Admin 데이터 export 요청 queue API | `ListAdminDataExportRequests` | `GET` | `/admin/api/data-export-requests` | `ListAdminDataExportRequestsQueryDto` / FE `AdminDataExportRequestsParams` | `AdminDataExportRequestsResponse` | Admin Web |

연결된 DB 스키마:

- User API 생성/조회: `UserDataExportRequest`, `AccountDeletionRequest`
- Admin queue 조회: `UserDataExportRequest`, `AccountDeletionRequest`, `User`
- Admin audit: `AdminAuditLog`

Transaction:

- `POST /api/users/me/data-export-requests`: 필요. 만료 `READY` export 정리, open request 조회, 신규 `UserDataExportRequest` 생성을 같은 repository transaction에서 처리한다.
- `GET /api/users/me/data-export-requests/:requestId`: 필요 여부 없음. 현재 사용자 소유 request 조회 전용이다.
- `POST /api/users/me/account-deletion-requests`: 필요. open deletion request 조회와 신규 `AccountDeletionRequest` 생성을 같은 repository transaction에서 처리한다.
- `POST /api/users/me/account-deletion-requests/:requestId/cancel`: 필요. 현재 사용자 소유 확인과 취소 상태 변경을 같은 repository transaction에서 처리한다.
- Admin queue 조회: 필요. queue 조회와 `AdminAuditLog` 생성을 같은 application transaction으로 묶는다.
- 외부 Provider: 없음. export artifact 생성/다운로드 worker, 실제 계정 삭제/익명화 job은 이 API transaction 밖 후속 정책이다.

Observability:

- User API audit log: 없음. 본인 요청 생성/조회/취소는 Admin audit와 분리한다.
- Admin audit log: `ADMIN_ACCOUNT_DELETION_VIEW`, `ADMIN_DATA_EXPORT_VIEW`
- request id: Admin queue 조회는 controller에서 application metadata로 전달한다. User API는 공통 request id middleware/exception context를 따른다.
- masking: Admin queue response는 `userEmailMasked`만 반환한다.
- redaction: `reasonMessage`, provider raw, token, export artifact storage path, Admin internal note 원문을 application log/audit metadata에 저장하지 않는다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| `includeSensitive=true` | `DATA_EXPORT_INCLUDE_SENSITIVE_UNSUPPORTED` | 400 | 민감정보 포함 export 미지원 안내, 해당 옵션 재시도 차단 | warn |
| 지원하지 않는 export format | `DATA_EXPORT_FORMAT_UNSUPPORTED` | 400 | 설정 form inline 오류 | warn |
| requestId 형식 오류 | `DATA_EXPORT_REQUEST_ID_INVALID` / `ACCOUNT_DELETION_REQUEST_ID_INVALID` | 400 | 상태 조회/취소 화면에서 잘못된 요청 안내 후 목록 또는 설정 화면 복귀 | warn |
| 요청 없음 또는 소유권 없음 | `DATA_EXPORT_REQUEST_NOT_FOUND` / `ACCOUNT_DELETION_REQUEST_NOT_FOUND` | 404 | 존재 여부를 자세히 노출하지 않고 요청 상태를 다시 조회 | warn |
| confirmText 불일치 | `ACCOUNT_DELETION_CONFIRM_TEXT_INVALID` | 400 | 확인 문구 field 오류 | warn |
| 취소 불가 상태 또는 유예 만료 | `ACCOUNT_DELETION_REQUEST_NOT_CANCELABLE` | 409 | 취소 불가 안내와 최신 상태 재조회 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin Web 접근 차단 또는 login 화면 이동 | warn |
| Admin queue audit 저장 실패 | 내부 오류 | 500 | 운영 queue 화면 오류 상태, 재시도 버튼 제공 | error |

FE/BE 처리 기준:

- User Web은 `FE/user-web/src/features/account-request/api/account-request-api.ts`의 `/api/users/me/*` client만 사용한다.
- Admin Web은 `FE/admin-web/src/features/account-request-management/api/admin-account-request-api.ts`에서 `adminApiClient` 상대 경로를 사용하며 최종 호출 prefix는 `/admin/api/*`다.
- BE는 User API에서 현재 사용자 소유권을 숨긴 404로 처리하고, Admin queue에서는 `AdminGuard`와 application `assertAdmin`을 모두 통과해야 한다.
- Admin response에는 사용자 이메일 원문과 삭제 요청 `reasonMessage` 원문을 포함하지 않는다.
