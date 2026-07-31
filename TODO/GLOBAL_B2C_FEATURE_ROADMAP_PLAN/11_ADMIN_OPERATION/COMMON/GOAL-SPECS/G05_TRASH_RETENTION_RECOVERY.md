# G05 Trash Retention Recovery

상태: Ready after G02
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

- [ ] Trash 만료 row가 hard delete되지 않는다.
- [ ] `trashExpiresAt` 의미가 무료 복구 만료로 구현된다.
- [ ] User Trash 만료 row는 restore disabled다.
- [ ] User Trash 만료 row에서 복구 문의를 만들 수 있다.
- [ ] 결제/paywall이 없다.
- [ ] `TrashRecoveryRequest` schema와 migration이 있다.
- [ ] private memo 원문이 Trash response에 없다.
- [ ] Admin Trash summary API가 있다.
- [ ] Admin Trash records API가 있다.
- [ ] Admin recovery request queue API가 있다.
- [ ] Admin Trash 조회 audit가 남는다.
- [ ] 검증 command 결과를 기록했다.
