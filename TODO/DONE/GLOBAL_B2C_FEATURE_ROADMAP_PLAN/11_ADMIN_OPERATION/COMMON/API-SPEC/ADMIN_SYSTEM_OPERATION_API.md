# Admin System Operation API

상태: Implemented
연결 Goal: G09
소비자: Admin Web

## 1. GET /admin/api/system/operation-checks/latest

- API 이름: Admin 운영 gate 최신 상태 API
- API 식별자: `GetLatestAdminOperationCheck`
- Response: `AdminOperationCheckRunResponse | null`
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

최신 점검 기록이 없으면 body는 `null`이다.

Business Logic:

1. AdminGuard를 확인한다.
2. 최신 `AdminOperationCheckRun`을 조회한다.
3. secret, DB URL, token을 반환하지 않는다.
4. `ADMIN_SYSTEM_CHECK_VIEW` audit를 남긴다.

Transaction:

- 필요: 있음
- 변경 model: `AdminAuditLog`
- 외부 provider 호출: 없음
- rollback 범위: latest 조회 audit log

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

Validation:

| field | 허용 값 |
|---|---|
| `environment` | `local`, `qa`, `staging`, `production` |
| `status` | `PASS`, `WARN`, `FAIL` |
| `items.*` | `PASS`, `WARN`, `FAIL` |
| `notes` | 2000자 이하, DB URL/token/secret 의심 pattern 금지 |

Business Logic:

1. AdminGuard를 확인한다.
2. request body를 validation한다.
3. DB URL, secret, token 같은 금지 문자열 pattern을 notes에서 차단한다.
4. `AdminOperationCheckRun`을 생성한다.
5. `ADMIN_SYSTEM_CHECK_RECORDED` audit를 남긴다.
6. Admin API가 migrate/seed/backup/restore를 직접 실행하지 않는다.

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

## 3. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 Admin Web 전용 운영 gate 점검 조회/기록 API 보관 문서다. G05에서는 최신 조회 API의 Method/Path/Request 이름과 현재 구현의 audit transaction, secret redaction, FE/BE 처리 기준을 보강한다. Admin API가 migration/seed/backup/restore를 직접 실행하지 않는 기존 의미는 유지한다.

- 계약 상태: `implemented`
- 소비자: Admin Web
- 호환성: 기존 `/admin/api/system/operation-checks/*` 계약 유지. breaking change 없음
- 권한: `AuthGuard` + `AdminGuard`, application service의 `assertAdmin`
- FE 호출 경계: `adminApiClient` 상대 경로 `/system/operation-checks/latest`, `/system/operation-checks`

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| Admin 운영 gate 최신 상태 API | `GetLatestAdminOperationCheck` | `GET` | `/admin/api/system/operation-checks/latest` | 없음 | `AdminOperationCheckRunResponse | null` / FE `AdminOperationCheckRun | null` |
| Admin 운영 gate 점검 기록 API | `CreateAdminOperationCheckRun` | `POST` | `/admin/api/system/operation-checks` | `CreateAdminOperationCheckRunDto` / FE `CreateAdminOperationCheckRunInput` | `AdminOperationCheckRunResponse` / FE `AdminOperationCheckRun` |

연결된 DB 스키마:

- 조회/생성: `AdminOperationCheckRun`
- audit: `AdminAuditLog`

Transaction:

- `GET /admin/api/system/operation-checks/latest`: 필요. 최신 점검 조회와 `ADMIN_SYSTEM_CHECK_VIEW` audit 생성을 같은 application transaction으로 묶는다.
- `POST /admin/api/system/operation-checks`: 필요. `AdminOperationCheckRun` 생성과 `ADMIN_SYSTEM_CHECK_RECORDED` audit 생성을 같은 application transaction으로 묶는다.
- rollback 범위: latest 조회 audit log, check run 생성과 audit log 생성 전체
- 외부 Provider: 없음. provider smoke 결과는 입력된 점검 결과를 기록할 뿐 Admin API가 provider 호출을 직접 실행하지 않는다.

Observability:

- log event key: 별도 application log event 없음. audit action은 `ADMIN_SYSTEM_CHECK_VIEW`, `ADMIN_SYSTEM_CHECK_RECORDED`
- audit log: 필수. metadata는 endpoint, environment, status, items, hasLatest 같은 safe summary만 저장한다.
- request id: controller에서 application metadata로 전달해 audit에 저장한다.
- masking/redaction: DB URL, token, secret 의심 문자열은 `notes` 저장 전 차단하고 response/log/audit metadata에 남기지 않는다.
- 민감정보: 운영 점검 응답에 secret, DB URL, token field를 추가하지 않는다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| environment 미지원 | `ADMIN_SYSTEM_ENVIRONMENT_UNSUPPORTED` | 400 | 환경 선택값 오류 표시 | warn |
| status/items invalid | `ADMIN_SYSTEM_CHECK_STATUS_INVALID` | 400 | 항목별 상태 입력 오류 | warn |
| notes secret 의심값 포함 | `ADMIN_SYSTEM_SECRET_IN_NOTE_BLOCKED` | 400 | secret 제거 안내, 저장 차단 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin shell 접근 차단 | warn |
| check run/audit 저장 실패 | 내부 오류 | 500 | 점검 기록 저장 실패 안내와 재시도 제공 | error |

FE/BE 처리 기준:

- FE는 운영 점검 명령을 서버에 실행시키지 않고 점검 결과 기록만 전송한다.
- BE는 `notes`에서 secret 의심 패턴을 저장 전에 차단한다.
- latest 조회 결과가 없으면 response body는 `null`이며 FE는 empty state로 처리한다.
- DB migration, seed, backup, restore 실행은 이 Admin API 계약 밖 운영 절차다.
