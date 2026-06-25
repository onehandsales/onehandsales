# Deal Module

## 현재 범위

- `GET /api/deals/stage-counts`
- `GET /api/deals`
- `GET /api/deals/export/xlsx`
- `GET /api/deals/company-options`
- `GET /api/deals/contact-options`
- `GET /api/deals/product-options`
- `POST /api/deals`
- `GET /api/deals/:dealId`
- `PATCH /api/deals/:dealId`
- `DELETE /api/deals/:dealId`
- `POST /api/deals/:dealId/following-action-logs`
- `GET /api/deals/:dealId/following-action-logs`
- `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `DELETE /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `POST /api/deals/:dealId/memo-logs`
- `GET /api/deals/:dealId/memo-logs`
- `PATCH /api/deals/:dealId/memo-logs/:memoLogId`
- `DELETE /api/deals/:dealId/memo-logs/:memoLogId`

## 구현 기준

- 모든 API는 `AuthGuard`를 사용한다.
- 모든 조회와 변경은 현재 사용자 `userId` ownership 기준으로 처리한다.
- 딜은 `DealCompany`, `DealContact`, `DealProduct`를 통해 회사/담당자/제품과 N:M으로 연결한다.
- 딜 생성/수정 시 선택한 담당자는 선택한 회사 중 하나에 소속되어야 한다.
- 딜 삭제는 실제 row 삭제가 아니라 `deletedAt`, `deletedByUserId`, `trashExpiresAt` 설정으로 처리한다.
- 일반 목록/상세/검색/export와 일정/회의록 딜 옵션은 `deletedAt IS NULL` 딜만 대상으로 한다.
- 딜 기존 연결 응답은 삭제된 회사/담당자/제품 이력을 유지할 수 있도록 연결 대상에 `isDeleted`를 포함한다.
