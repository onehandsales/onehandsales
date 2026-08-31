# Admin Domain Readonly API

상태: Implemented
연결 Goal: G04
소비자: Admin Web

## 1. GET /admin/api/users/:userId/domain-records

- API 이름: Admin 사용자 도메인 read-only 목록 API
- API 식별자: `ListAdminUserDomainRecords`
- Method: `GET`
- Request: `ListAdminUserDomainRecordsQuery`
- Response: `AdminUserDomainRecordsResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `domain` | string | yes | `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`, `SCHEDULE`, `MEETING_NOTE`, `BUSINESS_CARD_SCAN`, `IMPORT_JOB` |
| `q` | string | no | trim 1~100 |
| `includeDeleted` | boolean | no | default false |
| `cursor` | string | no | opaque |
| `limit` | number | no | 1~100, default 30 |
| `sort` | string | no | domain별 allowlist |

Company Response 예시:

```json
{
  "domain": "COMPANY",
  "items": [
    {
      "id": "company-id",
      "displayTitle": "삼성전자",
      "status": "ACTIVE",
      "summary": {
        "field": "반도체/모바일/가전",
        "region": "경기 수원 디지털시티",
        "contacts": 4,
        "deals": 3
      },
      "sensitiveFlags": {
        "hasMemo": true,
        "hasPrivateMemo": true,
        "privateMemoIncluded": false
      },
      "createdAt": "2026-07-01T00:00:00.000Z",
      "updatedAt": "2026-07-30T00:00:00.000Z",
      "deletedAt": null,
      "trashExpiresAt": null
    }
  ],
  "nextCursor": null
}
```

MeetingNote Response 예시:

```json
{
  "domain": "MEETING_NOTE",
  "items": [
    {
      "id": "meeting-note-id",
      "displayTitle": "삼성전자 meeting note",
      "status": "ACTIVE",
      "summary": {
        "meetingAt": "2026-07-31T01:00:00.000Z",
        "sourceType": "STT_AI",
        "linkedDeals": 2,
        "bodyPreview": "본문 숨김"
      },
      "sensitiveFlags": {
        "hasBody": true,
        "rawBodyIncluded": false
      },
      "createdAt": "2026-07-31T02:00:00.000Z",
      "updatedAt": "2026-07-31T02:00:00.000Z",
      "deletedAt": null,
      "trashExpiresAt": null
    }
  ],
  "nextCursor": null
}
```

Business Logic:

1. AdminGuard를 확인한다.
2. `userId` 소유 데이터만 조회한다.
3. domain별 safe select를 사용한다.
4. private memo 원문, meeting note body 원문, provider raw는 포함하지 않는다.
5. `includeDeleted=true`일 때도 Trash private memo 원문은 제외한다.
6. `ADMIN_DOMAIN_RECORDS_VIEW` audit를 남긴다.

Transaction: 목록 조회 + audit 기록 transaction 후보.

Observability:

- audit log: 필수
- redaction: q 원문 log 금지

Error:

| 상황 | code | status |
|---|---|---|
| domain 미지원 | `ADMIN_DOMAIN_UNSUPPORTED` | 400 |
| 사용자 없음 | `ADMIN_TARGET_NOT_FOUND` | 404 |

## 2. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 Admin Web 전용 사용자 도메인 read-only 목록 API 보관 문서다. G05에서는 누락된 Path, 권한, transaction, observability, FE/BE 처리 기준을 현재 구현 기준으로 보강하며 safe select response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: Admin Web
- 호환성: 기존 `/admin/api/users/:userId/domain-records` GET 계약 유지. breaking change 없음
- 권한: `AuthGuard` + `AdminGuard`, application service의 `assertAdmin`
- FE 호출 경계: `adminApiClient` 상대 경로 `/users/${userId}/domain-records`, 최종 path `/admin/api/users/:userId/domain-records`

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| Admin 사용자 도메인 read-only 목록 API | `ListAdminUserDomainRecords` | `GET` | `/admin/api/users/:userId/domain-records` | path param `userId` + `ListAdminDomainRecordsQueryDto` / FE `AdminDomainRecordsParams` | `AdminDomainRecordsResponse` |

연결된 DB 스키마:

- 대상 사용자 확인: `User`
- domain별 조회: `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`, `BusinessCardScanLog`, `ImportJob`
- audit: `AdminAuditLog`

Transaction:

- 필요 여부: 필요. 대상 사용자 확인, domain safe select, `AdminAuditLog` 생성을 같은 application transaction으로 묶는다.
- rollback 범위: 조회 audit log 생성. 본 데이터는 read-only이며 수정하지 않는다.
- 외부 Provider: 없음.

Observability:

- log event key: 별도 application log event 없음. audit action은 `ADMIN_DOMAIN_RECORDS_VIEW`
- audit log: 필수. metadata는 domain, filter key, qLength, includeDeleted, limit, sort만 저장한다.
- request id: controller에서 application metadata로 전달해 audit에 저장한다.
- masking/redaction: q 원문, private memo 원문, meeting note body/rawText, provider raw/prompt/token/cost, import raw row data logging 금지
- 민감정보: response는 `sensitiveFlags`와 safe summary만 반환하고 원문 조회는 `/admin/api/sensitive/raw-access`로 분리한다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| domain 미지원 | `ADMIN_DOMAIN_UNSUPPORTED` | 400 | domain tab 선택값 초기화 또는 오류 안내 | warn |
| 사용자 없음 | `ADMIN_TARGET_NOT_FOUND` | 404 | 사용자 상세 화면에서 안전한 not found 상태 표시 | warn |
| sort/includeDeleted/query validation 실패 | validation error | 400 | filter inline 오류 또는 기본값 재조회 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin shell 접근 차단 | warn |
| audit 저장 실패 | 내부 오류 | 500 | domain 목록을 표시하지 않고 재시도 안내 | error |

FE/BE 처리 기준:

- FE는 사용자 상세의 domain tab에서만 이 API를 호출하고 User Web API와 섞지 않는다.
- BE는 `userId` 대상 사용자를 확인한 뒤 해당 사용자 소유 row만 조회한다.
- `includeDeleted=true`여도 Trash/private memo 원문은 포함하지 않는다.
- 민감 원문 확인이 필요하면 Admin 민감 원문 조회 API의 reason + audit flow를 사용한다.
