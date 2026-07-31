# Trash User Recovery API

상태: Confirmed Planning
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
