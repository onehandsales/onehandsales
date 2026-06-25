# Log Soft Delete API

- 계약 상태: implemented
- 소비자: User Web
- 호환성: 신규 DELETE API 추가. 기존 조회/생성/수정 response shape 변경 없음
- 인증: `AuthGuard`
- 권한: 현재 로그인 사용자가 소유한 parent entity와 log만 삭제 가능

## 목적

회사, 담당자, 제품, 딜 상세 화면의 로그 삭제 버튼을 처리한다. 삭제는 실제 row 삭제가 아니라 휴지통 상태 전환이며, 일반 목록과 수정 대상에서는 삭제된 로그를 제외한다.

## 공통 삭제 정책

1. 현재 사용자를 인증한다.
2. path param UUID validation을 통과한 parent ID와 log ID를 application 계층으로 전달한다.
3. application service는 parent entity가 현재 사용자 소유인지 확인한다.
4. repository는 `id`, parent ID, `userId`, `deletedAt IS NULL` 조건으로 대상 log를 찾는다.
5. 대상 log의 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
6. 대상이 없거나 이미 삭제된 log면 기존 log not-found error를 반환한다.
7. 성공 시 `204 No Content`를 반환하고 response body는 없다.

삭제 시각 기준:

- `deletedAt`: 현재 UTC instant
- `deletedByUserId`: 현재 `User.id`
- `trashExpiresAt`: `deletedAt + 7일`

후속 범위:

- 휴지통 목록 API
- 무료 복구 API
- 7일 후 유료 복구 API
- 실제 DB row hard delete

## Endpoint 목록

| API 이름 | Method | Path | Application method | Soft delete model | Log event key |
|---|---|---|---|---|---|
| 회사 일반 메모 로그 삭제 | DELETE | `/api/companies/{companyId}/memo-logs/{memoLogId}` | `CompanyApplicationService.deleteMemoLog` | `CompanyMemoLog` | `companyMemoLog.deleted` |
| 회사 비밀 메모 로그 삭제 | DELETE | `/api/companies/{companyId}/private-memo-logs/{privateMemoLogId}` | `CompanyApplicationService.deletePrivateMemoLog` | `CompanyUserPrivateMemoLog` | `companyPrivateMemoLog.deleted` |
| 담당자 일반 메모 로그 삭제 | DELETE | `/api/contacts/{contactId}/memo-logs/{memoLogId}` | `ContactApplicationService.deleteMemoLog` | `ContactMemoLog` | `contactMemoLog.deleted` |
| 담당자 비밀 메모 로그 삭제 | DELETE | `/api/contacts/{contactId}/private-memo-logs/{privateMemoLogId}` | `ContactApplicationService.deletePrivateMemoLog` | `ContactUserPrivateMemoLog` | `contactPrivateMemoLog.deleted` |
| 제품 일반 메모 로그 삭제 | DELETE | `/api/products/{productId}/memo-logs/{memoLogId}` | `ProductApplicationService.deleteMemoLog` | `ProductMemoLog` | `productMemoLog.deleted` |
| 제품 비밀 메모 로그 삭제 | DELETE | `/api/products/{productId}/private-memo-logs/{privateMemoLogId}` | `ProductApplicationService.deletePrivateMemoLog` | `ProductUserPrivateMemoLog` | `productPrivateMemoLog.deleted` |
| 딜 다음 행동 로그 삭제 | DELETE | `/api/deals/{dealId}/following-action-logs/{followingActionLogId}` | `DealApplicationService.deleteFollowingActionLog` | `DealFollowingActionLog` | `deal.following_action.deleted` |
| 딜 메모 로그 삭제 | DELETE | `/api/deals/{dealId}/memo-logs/{memoLogId}` | `DealApplicationService.deleteMemoLog` | `DealMemoLog` | `deal.memo.deleted` |

## Request

- Request body: 없음

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| path | `companyId` / `contactId` / `productId` / `dealId` | UUID string | 예 | 로그가 속한 parent entity ID |
| path | `memoLogId` / `privateMemoLogId` / `followingActionLogId` | UUID string | 예 | 삭제할 로그 ID |

## Response

- Status: `204 No Content`
- Body: 없음

## 관련 DB 스키마

| 모델 | 추가 컬럼 | 일반 조회/수정 제외 조건 | 인덱스 |
|---|---|---|---|
| `CompanyMemoLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |
| `CompanyUserPrivateMemoLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |
| `ContactMemoLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |
| `ContactUserPrivateMemoLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |
| `ProductMemoLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |
| `ProductUserPrivateMemoLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |
| `DealFollowingActionLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |
| `DealMemoLog` | `deletedAt`, `deletedByUserId`, `trashExpiresAt` | `deletedAt IS NULL` | `userId + deletedAt`, `userId + trashExpiresAt` |

## Transaction

- 필요 여부: 없음
- 이유: 단일 로그 row의 상태 컬럼만 update한다.
- rollback 범위: 단일 update statement
- 외부 Provider 호출: 없음
- audit log 포함: 없음

## Observability

- structured log: 각 application service의 delete event key 사용
- request id: 공통 request context 사용
- redaction: 메모 원문, 비밀 메모 평문, 암호문, 딜 금액은 로그에 남기지 않는다.
- provider error context: 없음

## 오류 응답

| 상황 | Error | HTTP |
|---|---|---:|
| 인증 없음 | Unauthorized | 401 |
| path param UUID 형식 오류 | ValidationError | 400 |
| parent entity 없음 또는 타 사용자 소유 | 기존 parent not-found error | 404 |
| log 없음, 타 사용자 소유, 다른 parent 소속, 이미 삭제됨 | 기존 log not-found error | 404 |

## FE/BE 처리 기준

- FE: 휴지통 아이콘 클릭 시 확인 모달을 띄운다.
- FE: 확인 문구는 `데이터를 삭제하시겠습니까?`, 버튼은 `아니요`, `예`를 사용한다.
- FE: 성공 시 관련 로그 query를 invalidate하고 `삭제가 완료되었습니다.`와 `7일안으로 휴지통에서 복구가 가능합니다.`를 표시한다.
- BE: controller는 application service로만 위임한다.
- BE: repository는 Prisma `updateMany`로 ownership, parent, active 상태를 한 번에 제한한다.
- BE: 비밀 메모 삭제 시 암호문과 key version을 변경하지 않는다.

## 관련 문서

- `AGENT/PM_AGENT/PLANNING/TRASH_DELETE_POLICY_BACKEND_GUIDE.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
