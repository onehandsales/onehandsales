# Admin Audit Security API

상태: Implemented
연결 Goal: G02
소비자: Admin Web

## 1. GET /admin/api/me

- API 이름: 관리자 본인 확인 API
- API 식별자: `GetAdminMe`
- Method: `GET`
- Path: `/admin/api/me`
- Request: 없음
- Response: `AdminMeResponse`
- Status: `200`

Response:

```json
{
  "id": "00000000-0000-4000-8000-000000000002",
  "email": "local.admin@example.com",
  "displayName": "로컬 관리자",
  "role": "ADMIN"
}
```

Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. AdminGuard로 `role=ADMIN`을 확인한다.
3. 현재 관리자 기본 정보를 반환한다.
4. email은 Admin 본인 확인 화면에서는 원문 반환 가능하지만 log에는 원문 저장하지 않는다.

Transaction: 없음.

Observability:

- audit log: Admin shell 진입 최초 1회 기록 후보
- redaction: email 원문 log 금지

## 2. GET /admin/api/audit-logs

- API 이름: Admin 감사 로그 목록 API
- API 식별자: `ListAdminAuditLogs`
- Method: `GET`
- Path: `/admin/api/audit-logs`
- Request: `ListAdminAuditLogsQuery`
- Response: `AdminAuditLogListResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `cursor` | string | no | opaque cursor |
| `limit` | number | no | 1~100, default 50 |
| `adminUserId` | uuid | no | 관리자 사용자 ID |
| `targetUserId` | uuid | no | 대상 사용자 ID |
| `action` | string | no | `AdminAuditAction` |
| `result` | string | no | `SUCCESS`, `DENIED`, `FAILED` |
| `from` | ISO string | no | UTC instant |
| `to` | ISO string | no | UTC instant |

Response:

```json
{
  "items": [
    {
      "id": "audit-id",
      "adminUserId": "admin-user-id",
      "adminEmailMasked": "lo***@example.com",
      "targetUserId": "target-user-id",
      "targetType": "USER",
      "targetId": "target-user-id",
      "action": "ADMIN_USER_DETAIL_VIEW",
      "result": "SUCCESS",
      "reasonPreview": null,
      "requestId": "req-123",
      "createdAt": "2026-07-31T02:10:00.000Z"
    }
  ],
  "nextCursor": null
}
```

Business Logic:

1. AdminGuard를 확인한다.
2. query를 validation한다.
3. `AdminAuditLog`를 최신순으로 조회한다.
4. email은 User join 후 masked로만 반환한다.
5. reason은 목록에서 preview만 반환하고 전체 사유는 detail drawer에서 필요 시 표시한다.

Transaction: 없음.

Observability:

- audit log: audit log 목록 조회 자체는 낮은 가치이므로 기본 미기록. 정책상 필요하면 `ADMIN_AUDIT_LOG_VIEW`를 추가한다.
- redaction: IP hash/userAgent hash는 원문으로 복원하지 않는다.

## 3. POST /admin/api/sensitive/raw-access

- API 이름: Admin 민감 원문 조회 API
- API 식별자: `AccessAdminSensitiveRawData`
- Method: `POST`
- Path: `/admin/api/sensitive/raw-access`
- Request: `AdminSensitiveRawAccessRequest`
- Response: `AdminSensitiveRawAccessResponse`
- Status: `200`

Body:

```json
{
  "targetUserId": "user-id",
  "targetType": "MEETING_NOTE",
  "targetId": "meeting-note-id",
  "fieldSet": "MEETING_NOTE_BODY",
  "reason": "사용자가 회의록 복구 문의를 남겨 본문 확인이 필요해요"
}
```

Response:

```json
{
  "accessId": "sensitive-access-log-id",
  "targetUserId": "user-id",
  "targetType": "MEETING_NOTE",
  "targetId": "meeting-note-id",
  "fieldSet": "MEETING_NOTE_BODY",
  "data": {
    "title": "삼성전자 meeting note",
    "details": "허용된 원문 본문",
    "nextPlan": "허용된 원문",
    "requiredAction": "허용된 원문"
  },
  "createdAt": "2026-07-31T02:10:00.000Z"
}
```

Validation:

- `reason`: trim 후 10~1000자
- `targetType`: 허용 enum
- `fieldSet`: 허용 enum
- provider raw/prompt/token/quota detail fieldSet은 존재하지 않는다.

Business Logic:

1. AdminGuard를 확인한다.
2. request body를 validation한다.
3. target user와 target record를 확인한다.
4. fieldSet별 허용 field만 select한다.
5. 같은 transaction에서 `AdminAuditLog`와 `AdminSensitiveAccessLog`를 생성한다.
6. 원문 data를 반환한다.

Transaction:

- 필요: 있음
- 변경 model: `AdminAuditLog`, `AdminSensitiveAccessLog`
- rollback 범위: audit/sensitive log 생성
- 외부 provider 호출: 없음
- audit log transaction 포함: 필수

Observability:

- log event key: `admin.sensitiveRawAccess.requested`
- audit log: 필수
- request id: 필수
- redaction: 응답 data 원문은 application log에 남기지 않는다.

Error:

| 상황 | code | status |
|---|---|---|
| reason 누락 | `ADMIN_REASON_REQUIRED` | 400 |
| 관리자 아님 | `ADMIN_FORBIDDEN` | 403 |
| 대상 없음 또는 접근 불가 | `ADMIN_TARGET_NOT_FOUND` | 404 |
| fieldSet 허용 안 됨 | `ADMIN_SENSITIVE_FIELDSET_UNSUPPORTED` | 400 |

## 4. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 Admin Web 인증 확인, 감사 로그 조회, 민감 원문 조회 계약을 함께 담은 보관 문서다. G05에서는 현재 구현에서 허용하는 민감 원문 조합과 FE error 처리/log level을 명확히 보강하며 기존 raw response shape는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: Admin Web
- 호환성: 기존 `/admin/api/me`, `/admin/api/audit-logs`, `/admin/api/sensitive/raw-access` 계약 유지. breaking change 없음
- 권한: 세 API 모두 `AuthGuard` + `AdminGuard`, application service의 `assertAdmin`
- FE 호출 경계: Admin Web `adminApiClient` 상대 경로 `/me`, `/audit-logs`, `/sensitive/raw-access`

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 관리자 본인 확인 API | `GetAdminMe` | `GET` | `/admin/api/me` | 없음 | `AdminMeResponse` / FE `AdminMe` |
| Admin 감사 로그 목록 API | `ListAdminAuditLogs` | `GET` | `/admin/api/audit-logs` | `ListAdminAuditLogsQueryDto` / FE `AdminAuditLogListParams` | `AdminAuditLogListResponse` |
| Admin 민감 원문 조회 API | `AccessAdminSensitiveRawData` | `POST` | `/admin/api/sensitive/raw-access` | `AdminSensitiveRawAccessRequestDto` / FE `AdminSensitiveRawAccessRequest` | `AdminSensitiveRawAccessResponse` |

현재 구현 기준 민감 원문 allowlist:

| targetType | fieldSet | 반환 가능한 원문 field | 비고 |
|---|---|---|---|
| `USER` | `USER_CONTACT` | `email`, `displayName` | `targetId`와 `targetUserId`가 같은 사용자여야 한다. |
| `MEETING_NOTE` | `MEETING_NOTE_BODY` | `title`, `details`, `nextPlan`, `requiredAction` | `rawText`, provider transcript/raw response는 select하지 않는다. |

연결된 DB 스키마:

- Admin me/audit 조회: `User`, `AdminAuditLog`
- 민감 원문 조회: `User`, `MeetingNote`, `AdminAuditLog`, `AdminSensitiveAccessLog`

Transaction:

- `GET /admin/api/me`: 필요 여부 없음. 현재 관리자 본인 정보 조회 전용이다.
- `GET /admin/api/audit-logs`: 필요 여부 없음. 감사 로그 목록 조회 전용이며 목록 조회 자체 audit는 생성하지 않는다.
- `POST /admin/api/sensitive/raw-access`: 필요. 원문 조회, `AdminAuditLog`, `AdminSensitiveAccessLog` 생성을 같은 transaction으로 묶는다.
- rollback 범위: 민감 원문 조회의 audit/access log 생성 전체. 원문 data는 저장하지 않는다.

Observability:

- log event key: `admin.sensitiveRawAccess.requested`
- audit log: 민감 원문 조회는 `ADMIN_SENSITIVE_RAW_ACCESS` 필수. 감사 로그 목록 조회 자체는 현재 구현상 미기록이다.
- request id: 민감 원문 조회는 controller에서 application metadata로 전달하고 audit/access log에 연결한다.
- masking: 감사 로그 목록은 `adminEmailMasked`와 `reasonPreview`만 반환한다.
- redaction: 응답 `data` 원문, IP 원문, User-Agent 원문은 application log/audit metadata에 저장하지 않는다. IP/User-Agent는 hash만 저장한다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| access token 없음/만료 | 인증 오류 | 401 | Admin login 또는 token 재획득 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin shell 접근 차단 | warn |
| 민감 원문 사유 누락/길이 오류 | `ADMIN_REASON_REQUIRED` | 400 | reason textarea inline 오류, submit 차단 | warn |
| target/fieldSet 조합 미지원 | `ADMIN_SENSITIVE_FIELDSET_UNSUPPORTED` | 400 | raw 조회 버튼 비활성 또는 지원 범위 안내 | warn |
| 대상 없음 또는 접근 불가 | `ADMIN_TARGET_NOT_FOUND` | 404 | 대상이 없다는 안전 문구 표시, 원문 존재 여부 추가 노출 금지 | warn |
| audit/access log 저장 실패 | 내부 오류 | 500 | 원문 표시하지 않고 재시도 안내 | error |

FE/BE 처리 기준:

- FE는 민감 원문 dialog에서 10~1000자 reason을 선검증하고, BE 실패 시 원문 data 영역을 비운다.
- BE는 원문 조회 전에 reason과 allowlist 조합을 검증하고, 허용 field만 select한다.
- 원문은 성공 response body로만 반환하며 application log, audit metadata, TODO_LOG에 기록하지 않는다.
- provider raw/prompt/token/quota detail fieldSet은 현재 구현에 없다.
