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

## 4. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 Admin Web 전용 Trash 운영 조회 API 보관 문서다. G05에서는 현재 구현 기준으로 세 조회 API의 Method/Path/Request 이름, transaction/audit, masking, FE/BE error 처리를 보강한다. Admin 직접 restore mutation을 추가하지 않는다.

- 계약 상태: `implemented`
- 소비자: Admin Web
- 호환성: 기존 `/admin/api/users/:userId/trash-*`, `/admin/api/trash/recovery-requests` GET 계약 유지. breaking change 없음
- 권한: `AuthGuard` + `AdminGuard`, application service의 `assertAdmin`
- FE 호출 경계: `adminApiClient` 상대 경로 `/users/:userId/trash-summary`, `/users/:userId/trash-records`, `/trash/recovery-requests`

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| Admin 사용자 Trash 요약 API | `GetAdminUserTrashSummary` | `GET` | `/admin/api/users/:userId/trash-summary` | path param `userId` | `AdminTrashSummaryResponse` |
| Admin 사용자 Trash 목록 API | `ListAdminUserTrashRecords` | `GET` | `/admin/api/users/:userId/trash-records` | path param `userId` + `ListAdminTrashRecordsQueryDto` / FE `AdminTrashRecordsParams` | `AdminTrashRecordsResponse` |
| Admin 복구 문의 목록 API | `ListAdminTrashRecoveryRequests` | `GET` | `/admin/api/trash/recovery-requests` | `ListAdminTrashRecoveryRequestsQueryDto` / FE `AdminTrashRecoveryRequestsParams` | `AdminTrashRecoveryRequestsResponse` |

연결된 DB 스키마:

- 대상 사용자 확인: `User`
- Trash row safe 조회: `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`, `TrashRecoveryRequest`
- Admin recovery queue 조회: `TrashRecoveryRequest`, `User`
- audit: `AdminAuditLog`

Transaction:

- 세 API 모두 필요. 현재 구현은 대상 사용자 확인 또는 queue 조회와 `ADMIN_TRASH_VIEW` audit 생성을 같은 application transaction으로 묶는다.
- rollback 범위: 조회 audit log 생성. Trash 원본 row와 recovery request 상태는 수정하지 않는다.
- 외부 Provider: 없음.
- 상태 변경 API 후속 추가 시 본 데이터 변경과 audit log를 같은 transaction으로 묶어야 한다.

Observability:

- log event key: 별도 application log event 없음. audit action은 `ADMIN_TRASH_VIEW`
- audit log: 필수. metadata는 endpoint, domain/status/targetType filter, restoreWindow, limit, cursor 유무, summary total 같은 safe 값만 저장한다.
- request id: controller에서 application metadata로 전달해 audit에 저장한다.
- masking: recovery queue response는 `userEmailMasked`만 반환한다.
- redaction: private memo 원문, deleted row 상세 민감 원문, recovery request message 원문은 Admin Trash 목록/summary/queue response와 audit metadata에 넣지 않는다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| userId 형식 오류 | pipe validation | 400 | 사용자 상세/Trash 화면에서 잘못된 경로 안내 | warn |
| 대상 사용자 없음 | `ADMIN_TARGET_NOT_FOUND` | 404 | 사용자 not found 상태 표시 | warn |
| domain 미지원 | `ADMIN_DOMAIN_UNSUPPORTED` | 400 | domain filter 초기화 또는 inline 오류 | warn |
| restoreWindow/status/targetType invalid | validation error | 400 | filter 값 초기화 또는 inline 오류 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin shell 접근 차단 | warn |
| safe 조회/audit 저장 실패 | 내부 오류 | 500 | Trash 운영 화면 오류 상태와 재시도 제공 | error |

FE/BE 처리 기준:

- FE는 Admin Trash 화면에서 `userCanSelfRestore`, `restoreWindow`, `recoveryRequest`를 표시만 하고 Admin restore mutation을 호출하지 않는다.
- BE는 Admin Trash API에서 hard delete/purge/restore를 수행하지 않는다.
- User Web 복구 문의 생성은 `/api/trash/recovery-requests`로 분리되어 있으며 Admin queue 조회 API와 같은 소비자로 묶지 않는다.
- 민감 원문이 필요한 경우 Admin 민감 원문 조회 API의 reason + audit flow로 분리한다.
