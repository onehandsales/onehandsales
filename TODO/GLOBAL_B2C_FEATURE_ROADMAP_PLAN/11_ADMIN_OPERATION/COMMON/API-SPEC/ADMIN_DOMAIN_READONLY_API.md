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
