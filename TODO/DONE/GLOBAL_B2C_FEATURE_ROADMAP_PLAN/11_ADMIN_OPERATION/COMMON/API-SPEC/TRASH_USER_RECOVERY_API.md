# Trash User Recovery API

상태: Implemented
연결 Goal: G05
소비자: User Web

## 1. POST /api/trash/recovery-requests

- API 이름: 사용자 Trash 복구 문의 생성 API
- API 식별자: `CreateTrashRecoveryRequest`
- Method: `POST`
- Request: `CreateTrashRecoveryRequestDto`
- Response: `TrashRecoveryRequestResponse`
- Status: `201`

Body:

```json
{
  "targetType": "DEAL",
  "targetId": "deal-id",
  "message": "무료 복구 기간을 놓쳤어요. 복구 가능 여부를 알고 싶어요."
}
```

Response:

```json
{
  "id": "request-id",
  "targetType": "DEAL",
  "targetId": "deal-id",
  "status": "REQUESTED",
  "createdAt": "2026-07-31T00:00:00.000Z"
}
```

Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. target이 현재 사용자의 deleted row인지 확인한다.
3. `trashExpiresAt < now`인 경우에만 복구 문의를 허용한다.
4. 같은 target에 open request가 있으면 기존 request를 반환한다.
5. 결제/paywall은 표시하거나 생성하지 않는다.
6. private memo 원문은 request/response에 포함하지 않는다.

Transaction:

- 필요: 있음
- 변경 model: `TrashRecoveryRequest`
- rollback 범위: request 생성
- audit log: User API audit는 없음. Admin audit와 분리

Error:

| 상황 | code | status |
|---|---|---|
| 삭제 row가 아님 | `TRASH_RECORD_NOT_FOUND` | 404 |
| 아직 무료 복구 가능 | `TRASH_RECOVERY_REQUEST_NOT_ALLOWED_BEFORE_EXPIRY` | 409 |
| targetType 미지원 | `TRASH_TARGET_TYPE_UNSUPPORTED` | 400 |

## 2. User Web 표시 기준

`GET /api/trash` 또는 detail response는 G05에서 아래 field를 포함하도록 보강한다.

```json
{
  "targetType": "DEAL",
  "targetId": "deal-id",
  "title": "삼성전자 갱신 딜",
  "deletedAt": "2026-07-20T00:00:00.000Z",
  "trashExpiresAt": "2026-07-27T00:00:00.000Z",
  "restoreWindow": "EXPIRED",
  "canRestore": false,
  "canRequestRecovery": true,
  "hasPrivateMemo": false,
  "privateMemoIncluded": false,
  "recoveryRequest": null
}
```

## 3. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 User Web 전용 Trash 복구 문의 생성 API 보관 문서다. G05에서는 Admin Trash queue 조회 API와 prefix/소비자를 분리하고, User Web error 처리와 observability 계약을 보강한다. 기존 request/response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 기존 `/api/trash/recovery-requests` POST 계약 유지. breaking change 없음
- 권한: User `AuthGuard`, 현재 사용자 소유 deleted row만 대상
- Admin 경계: Admin Web은 `/admin/api/trash/recovery-requests` queue 조회만 사용하며 User 복구 문의 생성 API를 호출하지 않는다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 사용자 Trash 복구 문의 생성 API | `CreateTrashRecoveryRequest` | `POST` | `/api/trash/recovery-requests` | `CreateTrashRecoveryRequestDto` / FE `CreateTrashRecoveryRequestInput` | `TrashRecoveryRequestResponse` |

연결된 DB 스키마:

- 조회: deleted 상태의 사용자 소유 `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`
- 생성/조회: `TrashRecoveryRequest`

Transaction:

- 필요 여부: 필요. 복구 대상 조회, 만료 여부 검증, 같은 target의 open request 조회, 신규 `TrashRecoveryRequest` 생성을 같은 repository transaction으로 묶는다.
- rollback 범위: 신규 recovery request 생성. 기존 open request를 반환하는 경우 신규 row를 만들지 않는다.
- audit log: User API audit는 없음. Admin queue 조회 audit와 분리한다.
- 외부 Provider: 없음.

Observability:

- log event key: 현재 구현상 별도 application log event 없음
- audit log: 없음. User request 생성은 Admin audit에 기록하지 않는다.
- request id: 공통 request id middleware/exception context 기준으로 추적한다.
- masking/redaction: request `message`, private memo 원문, deleted row 상세 원문은 application log에 남기지 않는다.
- 민감정보: response는 target 식별자, status, createdAt만 반환하고 memo/body 원문은 포함하지 않는다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| targetType 미지원 | `TRASH_TARGET_TYPE_UNSUPPORTED` | 400 | 복구 문의 dialog 닫기 또는 목록 재조회 | warn |
| message 공백/1000자 초과 | validation error | 400 | message textarea inline 오류 | warn |
| 삭제 row 없음 또는 소유권 없음 | `TRASH_RECORD_NOT_FOUND` | 404 | 대상이 없다는 안전 문구 표시 후 Trash 목록 재조회 | warn |
| 아직 무료 복구 가능 | `TRASH_RECOVERY_REQUEST_NOT_ALLOWED_BEFORE_EXPIRY` | 409 | 셀프 복구 CTA를 우선 안내하고 복구 문의 CTA 숨김 | warn |
| 인증 없음 | 인증 오류 | 401 | 로그인/토큰 갱신 흐름 | warn |
| recovery request 저장 실패 | 내부 오류 | 500 | 복구 문의 실패 안내와 재시도 제공 | error |

FE/BE 처리 기준:

- FE는 `canRequestRecovery=true`이고 `recoveryRequest=null`인 만료 row에서만 복구 문의 CTA를 노출한다.
- FE는 성공 후 `trashQueryKeys.lists()`와 해당 detail query를 무효화해 `recoveryRequest` 표시를 갱신한다.
- BE는 복구 문의가 이미 열려 있으면 기존 request를 반환해 중복 생성을 막는다.
- Admin 검토/상태 변경 API는 이 User API 계약에 추가하지 않는다.
