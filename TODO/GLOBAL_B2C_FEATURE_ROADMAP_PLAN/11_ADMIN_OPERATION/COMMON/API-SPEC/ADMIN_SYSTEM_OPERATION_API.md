# Admin System Operation API

상태: Confirmed Planning
연결 Goal: G09
소비자: Admin Web

## 1. GET /admin/api/system/operation-checks/latest

- API 이름: Admin 운영 gate 최신 상태 API
- API 식별자: `GetLatestAdminOperationCheck`
- Response: `AdminOperationCheckRunResponse`
- Status: `200`

Response:

```json
{
  "id": "check-run-id",
  "environment": "production",
  "status": "PASS",
  "checkedAt": "2026-07-31T00:00:00.000Z",
  "checkedByAdminUserId": "admin-user-id",
  "items": {
    "prismaValidate": "PASS",
    "prismaGenerate": "PASS",
    "migrationStatus": "PASS",
    "seedNotRunOnSharedDb": "PASS",
    "backupVerified": "PASS",
    "restoreDryRun": "WARN",
    "providerSmoke": "WARN"
  },
  "notes": "restore dry-run은 staging 기준으로만 확인했어요"
}
```

Business Logic:

1. AdminGuard를 확인한다.
2. 최신 `AdminOperationCheckRun`을 조회한다.
3. secret, DB URL, token을 반환하지 않는다.
4. 조회 audit를 남긴다.

## 2. POST /admin/api/system/operation-checks

- API 이름: Admin 운영 gate 점검 기록 API
- API 식별자: `CreateAdminOperationCheckRun`
- Request: `CreateAdminOperationCheckRunDto`
- Response: `AdminOperationCheckRunResponse`
- Status: `201`

Body:

```json
{
  "environment": "production",
  "status": "PASS",
  "items": {
    "prismaValidate": "PASS",
    "prismaGenerate": "PASS",
    "migrationStatus": "PASS",
    "seedNotRunOnSharedDb": "PASS",
    "backupVerified": "PASS",
    "restoreDryRun": "WARN",
    "providerSmoke": "WARN"
  },
  "notes": "restore dry-run은 staging 기준으로만 확인했어요"
}
```

Business Logic:

1. AdminGuard를 확인한다.
2. request body를 validation한다.
3. DB URL, secret, token 같은 금지 문자열 pattern을 notes에서 차단한다.
4. `AdminOperationCheckRun`을 생성한다.
5. `ADMIN_SYSTEM_CHECK_RECORDED` audit를 남긴다.
6. Admin API가 migrate/seed를 직접 실행하지 않는다.

Transaction:

- 필요: 있음
- 변경 model: `AdminOperationCheckRun`, `AdminAuditLog`
- 외부 provider 호출: 없음
- rollback 범위: check run과 audit log

Observability:

- audit log: 필수
- redaction: secret/DB URL/token 저장 금지

Error:

| 상황 | code | status |
|---|---|---|
| environment 미지원 | `ADMIN_SYSTEM_ENVIRONMENT_UNSUPPORTED` | 400 |
| notes에 secret 의심값 포함 | `ADMIN_SYSTEM_SECRET_IN_NOTE_BLOCKED` | 400 |
| status/item invalid | `ADMIN_SYSTEM_CHECK_STATUS_INVALID` | 400 |
