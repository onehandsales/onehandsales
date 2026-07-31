# G08 Account Data Requests

상태: Policy-sensitive
목표: 사용자 데이터 export 요청과 계정 삭제 요청을 User Web/Admin Web 운영 queue로 만든다.

## 1. 포함 범위

- `UserDataExportRequest` schema/migration
- `AccountDeletionRequest` schema/migration
- `POST /api/users/me/data-export-requests`
- `GET /api/users/me/data-export-requests/:requestId`
- `POST /api/users/me/account-deletion-requests`
- `POST /api/users/me/account-deletion-requests/:requestId/cancel`
- `GET /admin/api/data-export-requests`
- `GET /admin/api/account-deletion-requests`
- User Web `/app/settings` 요청 UI
- Admin Web `/account-requests`

## 2. 제외 범위

- 결제/구독 해지
- 환불
- invoice/tax
- 실제 hard delete job 완전 구현
- 외부 storage signed URL provider 세부 구현

## 3. Backend 작업

1. `AccountDeletionRequest`와 `UserDataExportRequest` schema/migration을 만든다.
2. User data export request 생성 API를 만든다.
3. User data export request 상태 조회 API를 만든다.
4. 계정 삭제 요청 생성 API를 만든다.
5. 계정 삭제 요청 취소 API를 만든다.
6. Admin request queue API를 만든다.
7. account deletion request 생성 시 30일 유예 시각을 저장한다.
8. user-linked analytics 삭제/익명화 대상 목록을 문서와 code comment로 남긴다.
9. Admin queue 조회 audit를 남긴다.

## 4. Frontend 작업

User Web:

1. `/app/settings`에 데이터 export 요청 section을 추가한다.
2. `/app/settings`에 계정 삭제 요청 section을 추가한다.
3. 계정 삭제는 confirm text를 요구한다.
4. 계정 삭제 요청 취소 UI를 만든다.
5. 결제/구독 문구를 넣지 않는다.

Admin Web:

1. `/account-requests` page를 만든다.
2. deletion/export tab을 만든다.
3. request status filter를 만든다.
4. 사용자 email은 masked로 표시한다.

## 5. Request 계약

```json
{
  "includeSensitive": false,
  "format": "ZIP_JSON_XLSX"
}
```

```json
{
  "confirmText": "DELETE MY ACCOUNT",
  "reasonCode": "NO_LONGER_NEEDED",
  "reasonMessage": "더 이상 사용하지 않아요"
}
```

상세 계약: `COMMON/API-SPEC/ACCOUNT_DATA_REQUEST_API.md`

## 6. Response 계약

```json
{
  "id": "deletion-request-id",
  "status": "REQUESTED",
  "requestedAt": "2026-07-31T00:00:00.000Z",
  "scheduledDeletionAt": "2026-08-30T00:00:00.000Z",
  "canCancelUntil": "2026-08-30T00:00:00.000Z"
}
```

```json
{
  "id": "export-request-id",
  "status": "REQUESTED",
  "includeSensitive": false,
  "format": "ZIP_JSON_XLSX",
  "downloadUrl": null
}
```

## 7. Business Logic

- 계정 삭제는 일반 Trash soft delete와 별개다.
- 계정 삭제 요청은 30일 유예를 둔다.
- 유예 기간 내 취소할 수 있다.
- user-linked analytics raw event와 user-level snapshot은 실제 삭제 대상이다.
- export는 provider raw/token/admin audit/internal note를 포함하지 않는다.
- `includeSensitive=true`는 별도 확인 UI와 Backend validation이 필요하다.

## 8. User Flow

1. 사용자가 settings에서 데이터 export를 요청한다.
2. Backend가 request row를 만든다.
3. Admin은 queue에서 처리 상태를 확인한다.
4. 사용자가 계정 삭제를 요청한다.
5. 30일 유예가 시작된다.
6. 사용자는 유예 기간 안에 취소할 수 있다.
7. Admin은 상태를 추적한다.

## 9. DB/Prisma 영향

신규:

- `AccountDeletionRequest`
- `AccountDeletionRequestStatus`
- `UserDataExportRequest`
- `UserDataExportRequestStatus`

기존:

- `User.status`
- `User.deletedAt`
- `ProductAnalyticsEvent`
- `UserActivationSnapshot`

주석 필수:

- 신규 model/field/enum에 `/// 기능 : ...`
- migration SQL COMMENT

## 10. 주석 기준

```ts
// 기능 : 계정 삭제 요청의 30일 유예 만료 시각을 계산합니다.
// 기능 : 사용자 데이터 export 요청을 중복 없이 생성합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run test -- account deletion data-export
```

```powershell
cd FE/user-web
pnpm run build
```

```powershell
cd FE/admin-web
pnpm run build
```

## 12. Goal 체크리스트

- [ ] `AccountDeletionRequest` schema와 migration이 있다.
- [ ] `UserDataExportRequest` schema와 migration이 있다.
- [ ] 신규 Prisma 주석과 migration COMMENT가 있다.
- [ ] data export 요청 API가 있다.
- [ ] account deletion 요청 API가 있다.
- [ ] account deletion 취소 API가 있다.
- [ ] 30일 유예가 저장된다.
- [ ] 일반 Trash hard delete 정책과 섞이지 않는다.
- [ ] provider raw/token/admin audit가 export에 포함되지 않는다.
- [ ] User Web settings UI가 있다.
- [ ] Admin Web request queue가 있다.
- [ ] 결제/구독 문구가 없다.
- [ ] 검증 command 결과를 기록했다.
