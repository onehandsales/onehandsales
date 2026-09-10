# Deal Module

딜 도메인은 사용자 소유 거래 정보, 연결 회사/담당자/제품, 다음 행동, 메모, 활동 로그, 휴지통 복구, xlsx export를 관리한다.

## 주요 API

- `GET /api/deals/stage-counts`
- `GET /api/deals`
- `GET /api/deals/export/xlsx`
- `GET /api/deals/:dealId`
- `POST /api/deals`
- `PATCH /api/deals/:dealId`
- `DELETE /api/deals/:dealId`
- `GET /api/deals/company-options`
- `GET /api/deals/contact-options`
- `GET /api/deals/product-options`
- `GET /api/deals/:dealId/following-action-logs`
- `POST /api/deals/:dealId/following-action-logs`
- `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `DELETE /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `GET /api/deals/:dealId/memo-logs`
- `POST /api/deals/:dealId/memo-logs`
- `PATCH /api/deals/:dealId/memo-logs/:memoLogId`
- `DELETE /api/deals/:dealId/memo-logs/:memoLogId`
- `GET /api/deals/:dealId/activities`
- `POST /api/deals/:dealId/activities`
- `PATCH /api/deals/:dealId/activities/:activityId`

## 정책

- 일반 목록/상세/검색/export는 `deletedAt IS NULL` 딜만 대상으로 한다.
- 삭제는 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 설정하는 soft delete다.
- 복구 기간 안의 row만 Trash API에서 복구할 수 있다.
- 딜 생성/수정은 연결 제품과 첫 다음 행동 변경을 transaction 안에서 처리한다.
