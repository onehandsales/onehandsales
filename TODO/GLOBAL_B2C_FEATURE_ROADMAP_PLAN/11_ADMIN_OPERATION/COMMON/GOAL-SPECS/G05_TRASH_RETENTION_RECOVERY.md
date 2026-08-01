# G05 Trash Retention Recovery

상태: Completed
목표: Trash 7일 이후 정책을 soft delete 보존 기준으로 확정하고, User Web 복구 문의와 Admin Trash 조회를 만든다.

## 1. 포함 범위

- User Web `/app/trash` 만료 row UX
- `POST /api/trash/recovery-requests`
- `GET /admin/api/users/:userId/trash-summary`
- `GET /admin/api/users/:userId/trash-records`
- `GET /admin/api/trash/recovery-requests`
- `TrashRecoveryRequest` schema/migration
- Trash private memo response restriction

## 2. 제외 범위

- Admin 직접 복구 실행
- 유료 복구 결제/paywall
- Trash hard delete/purge
- 결제/구독 연결

## 3. Backend 작업

1. 현재 Trash list/detail/restore response를 확인한다.
2. private memo 원문이 response에 포함되는 경로가 있으면 제거한다.
3. `restoreWindow`, `canRestore`, `canRequestRecovery` field를 추가한다.
4. `TrashRecoveryRequest` schema/migration을 만든다.
5. User API `POST /api/trash/recovery-requests`를 만든다.
6. Admin Trash summary/list API를 만든다.
7. Admin recovery request queue API를 만든다.
8. Admin Trash 조회 audit를 남긴다.

## 4. Frontend 작업

User Web:

1. `/app/trash`에서 `trashExpiresAt < now` row는 복구 버튼을 비활성화한다.
2. 만료 row에 `무료 복구 기간이 지났어요`를 표시한다.
3. `복구 문의` 버튼을 표시한다.
4. 문의 생성 후 상태를 표시한다.
5. 결제/paywall을 표시하지 않는다.

Admin Web:

1. 사용자 상세 Trash summary를 표시한다.
2. `/users/:userId/trash` 목록을 만든다.
3. `/trash/recovery-requests` queue를 만든다.

## 5. Request 계약

```http
GET /admin/api/users/:userId/trash-summary
GET /admin/api/users/:userId/trash-records?restoreWindow=EXPIRED
GET /admin/api/trash/recovery-requests?status=REQUESTED
```

```json
{
  "targetType": "DEAL",
  "targetId": "deal-id",
  "message": "무료 복구 기간을 놓쳤어요. 복구 가능 여부를 알고 싶어요."
}
```

상세 계약:

- `COMMON/API-SPEC/ADMIN_TRASH_OPERATION_API.md`
- `COMMON/API-SPEC/TRASH_USER_RECOVERY_API.md`

## 6. Response 계약

User Trash row:

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

Admin Trash summary:

```json
{
  "total": 8,
  "activeRestoreWindow": 5,
  "expiredRestoreWindow": 3,
  "recoveryRequests": {
    "requested": 1,
    "reviewing": 0,
    "closed": 0
  }
}
```

## 7. Business Logic

- `trashExpiresAt`은 무료 self-restore 만료 시각이다.
- 7일 이후에도 DB row를 hard delete하지 않는다.
- 만료 row는 User Web에서 복구 버튼을 비활성화한다.
- 복구 문의는 만료 row에만 허용한다.
- 같은 target open request는 중복 생성하지 않는다.
- private memo 원문은 User/Admin Trash response 모두 제외한다.

## 8. User Flow

1. 사용자가 Trash에서 만료 row를 본다.
2. 복구 버튼은 비활성화되어 있다.
3. 사용자가 `복구 문의`를 누른다.
4. 문의 사유를 입력한다.
5. request가 생성된다.
6. Admin이 recovery request queue에서 확인한다.

## 9. DB/Prisma 영향

신규:

- `TrashRecoveryRequest`
- `TrashRecoveryRequestStatus`

기존 soft delete field 사용:

- `deletedAt`
- `deletedByUserId`
- `trashExpiresAt`

주석 필수:

- 신규 model/field/enum에 `/// 기능 : ...`
- migration SQL COMMENT

## 10. 주석 기준

```ts
// 기능 : Trash 무료 복구 기간 만료 여부를 계산합니다.
// 기능 : 만료된 Trash record에 대한 복구 문의를 생성합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run test -- trash
pnpm run test -- admin trash
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

```powershell
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 12. Goal 체크리스트

- [x] Trash 만료 row가 hard delete되지 않는다.
- [x] `trashExpiresAt` 의미가 무료 복구 만료로 구현된다.
- [x] User Trash 만료 row는 restore disabled다.
- [x] User Trash 만료 row에서 복구 문의를 만들 수 있다.
- [x] 결제/paywall이 없다.
- [x] `TrashRecoveryRequest` schema와 migration이 있다.
- [x] private memo 원문이 Trash response에 없다.
- [x] Admin Trash summary API가 있다.
- [x] Admin Trash records API가 있다.
- [x] Admin recovery request queue API가 있다.
- [x] Admin Trash 조회 audit가 남는다.
- [x] 검증 command 결과를 기록했다.

## 12.1 완료 기록

- Backend
  - User Trash list/detail이 만료 row를 유지해 조회하고 `restoreWindow`, `canRestore`, `canRequestRecovery`, `privateMemoIncluded`, `recoveryRequest`를 반환한다.
  - `POST /api/trash/recovery-requests` 구현 완료. 만료 row만 허용하고 같은 target의 열린 요청은 기존 요청을 반환한다.
  - `GET /admin/api/users/:userId/trash-summary`, `GET /admin/api/users/:userId/trash-records`, `GET /admin/api/trash/recovery-requests` 구현 완료.
  - Admin Trash summary/list/queue 조회는 `ADMIN_TRASH_VIEW` audit를 남긴다.
- Privacy / Policy
  - Trash hard delete/purge 구현 없음.
  - 결제/paywall/구독 연결 구현 없음.
  - private memo ciphertext/key 원문은 User/Admin Trash response에서 제외한다.
  - 회의록 본문 원문은 Trash 상세에서 복구 후 확인 안내로 대체한다.
- DB
  - `TrashRecoveryRequestStatus` enum과 `TrashRecoveryRequest` model/migration 추가.
  - 열린 복구 요청 중복 방지를 위한 partial unique index 추가.
  - 신규 schema와 migration에 기능 주석/SQL COMMENT 추가.
- Frontend
  - User Web `/app/trash`에서 만료 row에 `무료 복구 기간이 지났어요` 표시.
  - 만료 row 복구 버튼 disabled 및 `복구 문의` modal 구현.
  - 문의 접수 후 목록/상세 cache 갱신과 접수 상태 표시.
  - Admin Web `/users/:userId/trash` 사용자별 Trash summary/list 구현.
  - Admin Web `/trash/recovery-requests` 복구 요청 queue 구현.
- 검증
  - `cd BE && pnpm run prisma:validate`: 통과.
  - `cd BE && pnpm run prisma:generate`: 통과.
  - `cd BE && pnpm run typecheck`: 통과.
  - `cd BE && pnpm run lint`: 통과.
  - `cd BE && pnpm run test -- trash`: 통과, 3 suites / 12 tests.
  - `cd BE && pnpm run test -- admin trash`: 통과, 10 suites / 32 tests. Jest worker 종료 경고가 1회 있었으나 테스트 실패는 없음.
  - `cd BE && pnpm run build`: 통과.
  - `cd FE/user-web && pnpm run typecheck`: 통과.
  - `cd FE/user-web && pnpm run lint`: 통과.
  - `cd FE/user-web && pnpm run build`: 통과. Vite chunk size warning만 있음.
  - `cd FE/admin-web && pnpm run typecheck`: 통과.
  - `cd FE/admin-web && pnpm run lint`: 통과.
  - `cd FE/admin-web && pnpm run build`: 통과.
