# Product Module

## 현재 범위

- `GET /api/products`
- `GET /api/products/export/xlsx`
- `GET /api/product-categories`
- `POST /api/product-categories`
- `DELETE /api/product-categories/:categoryId`
- `GET /api/product-statuses`
- `POST /api/product-statuses`
- `DELETE /api/product-statuses/:statusId`
- `POST /api/products`
- `GET /api/products/:productId`
- `PATCH /api/products/:productId`
- `POST /api/products/:productId/memo-logs`
- `GET /api/products/:productId/memo-logs`
- `PATCH /api/products/:productId/memo-logs/:memoLogId`
- `POST /api/products/:productId/private-memo-logs`
- `GET /api/products/:productId/private-memo-logs`
- `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId`

이 모듈은 User Web에서 사용하는 제품, 제품 카테고리, 제품 상태, 제품 일반 메모 로그, 제품 개인 비밀 메모 로그 API를 담당한다.

## 구현 기준

- 모든 API는 `AuthGuard`를 사용한다.
- 모든 조회와 변경은 현재 사용자 `userId` ownership 기준으로 처리한다.
- 제품 목록 응답에는 제품별 연결 딜 수 `dealCount`를 포함한다.
- 제품 export는 검색/필터/정렬 조건을 적용하고 `page` 없이 전체 대상 xlsx를 반환한다.
- 제품 생성 시 `productMemo`가 있으면 같은 transaction에서 `ProductMemoLog` 첫 데이터로 저장한다.
- 제품 생성 시 초기 메모의 `memoType`은 서버가 `초기 메모`로 저장한다.
- 개인 비밀 메모 평문은 API DTO에서만 `memo`로 다루고, DB에는 `memoCiphertext`, `memoKeyVersion`만 저장한다.
- API 계약은 `TODO/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`를 따른다.
