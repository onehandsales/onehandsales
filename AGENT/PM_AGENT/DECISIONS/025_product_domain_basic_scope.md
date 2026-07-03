# 제품 도메인 기본 기능 구현 범위 확정

## 1. 결정 배경

제품 도메인은 회사, 담당자 다음에 구현할 사용자 페이지 영업 기본 도메인이다.

기존 장기 기획에는 제품 단가 선택 입력, 제품 연결, 제품 객관 로그, 휴지통이 포함되어 있었지만, 다음 구현 단계에서는 사용자 제품 관리에 필요한 기본 CRUD와 메모 흐름을 먼저 고정한다.

실제 구현은 `TODO/DONE/PRODUCT_DOMAIN_PLAN`을 기준으로 진행한다. 이 문서는 AGENT 정본에서 현재 Product 계획의 범위와 구현 상태를 빠르게 확인하기 위한 결정 기록이다.

## 2. 현재 상태

- `TODO/DONE/PRODUCT_DOMAIN_PLAN` 문서는 작성되어 있다.
- Product BE는 구현 완료 상태다.
- `BE/src/modules/product` 모듈과 `BE/prisma/schema.prisma`의 Product 관련 모델이 현재 Backend 기준이다.
- User Web 제품 페이지는 구현 완료 상태다.
- 제품 목록 xlsx 내보내기 API는 추가 유지보수 범위에서 구현 완료 상태다.
- 제품 soft delete와 Trash 복구도 추가 유지보수 범위에서 구현 완료 상태다.

## 3. 확정 테이블

다음 테이블을 Product 기본 도메인 1차 구현 범위로 확정한다.

- `Product`
- `ProductCategory`
- `ProductStatus`
- `ProductMemoLog`
- `ProductUserPrivateMemoLog`

## 4. 핵심 정책

- UI 용어는 `제품`을 사용한다.
- 코드, DB, API 도메인명은 `Product`를 사용한다.
- `상품`, `영업상품` 표현은 정본 문서와 UI에서 `제품`으로 정리한다.
- 제품 목록은 `createdAt DESC` 기준으로 정렬한다.
- 제품 목록 응답에는 `productPrice`, `updatedAt`을 포함하지 않는다.
- 제품 목록 검색은 `productName`만 대상으로 한다.
- 제품 목록 필터는 `productCategoryId`, `productStatusId`만 제공한다.
- 제품 목록 xlsx 내보내기는 현재 검색어와 필터를 반영하고, 파일에는 제품명, 카테고리, 상태, 등록일만 포함한다.
- 제품 목록 xlsx 내보내기에는 ID와 제품 가격을 포함하지 않는다.
- 제품 카테고리 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 제품 상태 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 제품 생성과 수정에서 `productPrice`는 필수 정수이며 0 이상이어야 한다.
- 제품 생성 요청의 `productMemo`는 `Product` 테이블 컬럼이 아니라 `ProductMemoLog` 첫 데이터로 저장한다.
- 제품 생성 요청의 `productMemo`로 만들어지는 첫 메모 로그는 `memoType`을 `초기 메모`로 저장한다.
- 제품 생성 시 `productMemo`가 없으면 메모 로그를 만들지 않는다.
- 독립적인 제품 일반 메모 로그 생성 API는 `memoType`, `memo`를 필수로 받는다.
- 제품 일반 메모 로그 수정 API는 `memoType`, `memo` 중 최소 1개를 수정할 수 있다.
- 제품 개인 비밀 메모 로그 생성/수정 API는 `memo`만 받는다.
- 제품 카테고리와 제품 상태는 생성과 삭제만 제공하고 수정은 제공하지 않는다.
- 이미 제품에 매핑된 제품 카테고리와 제품 상태는 삭제할 수 없다.

## 5. 현재 만들지 않는 기능

다음 항목은 Product 기본 도메인 1차 구현 범위에서 제외한다.

- 관리자 제품 관리 화면
- Product 기본 도메인 1차 구현 당시 제외했던 제품 휴지통, soft delete, 삭제/복구 API. 현재 soft delete와 7일 이내 Trash 복구는 추가 유지보수로 구현되어 있으며, 영구삭제 API는 제공하지 않는다.
- 제품 카테고리 수정 API
- 제품 상태 수정 API
- `ProductConnection`
- `ProductLog`
- 기존 `ProductMemo` 또는 공통 `PersonalMemo(targetType=PRODUCT)` 방식
- `initialMemo` 요청 필드명
- `unitPrice`, `currency`, `description` 필드
- 제품 목록의 최근 수정일 표시
- 제품 목록의 가격 표시
- 딜 생성 중 제품 inline creation 연동
- 범용 Import/OCR 연동
- ExportJob 기반 비동기 내보내기. 현재 제품 export는 `GET /api/products/export/xlsx` 도메인 API로 처리한다.

## 6. API 범위

현재 Product 관련 User API 목록은 17개다. 이 중 16개는 Product 기본 도메인 API이고, `GET /api/products/export/xlsx`는 추가 유지보수 범위에서 구현된 xlsx 내보내기 API다.

1. `GET /api/products`
2. `GET /api/products/export/xlsx`
3. `GET /api/product-categories`
4. `POST /api/product-categories`
5. `DELETE /api/product-categories/:categoryId`
6. `GET /api/product-statuses`
7. `POST /api/product-statuses`
8. `DELETE /api/product-statuses/:statusId`
9. `POST /api/products`
10. `GET /api/products/:productId`
11. `PATCH /api/products/:productId`
12. `POST /api/products/:productId/memo-logs`
13. `GET /api/products/:productId/memo-logs`
14. `PATCH /api/products/:productId/memo-logs/:memoLogId`
15. `POST /api/products/:productId/private-memo-logs`
16. `GET /api/products/:productId/private-memo-logs`
17. `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId`

## 7. API 상태값

- 제품 생성 성공: `201 Created`, response body 없음
- 제품 기본 정보 수정 성공: `201 Created`, response body 없음
- 제품 카테고리 생성 성공: `201 Created`, response body 없음
- 제품 카테고리 삭제 성공: `204 No Content`, response body 없음
- 제품 상태 생성 성공: `201 Created`, response body 없음
- 제품 상태 삭제 성공: `204 No Content`, response body 없음
- 제품 일반 메모 로그 생성 성공: `201 Created`, response body 없음
- 제품 일반 메모 로그 수정 성공: `201 Created`, response body 없음
- 제품 개인 비밀 메모 로그 생성 성공: `201 Created`, response body 없음
- 제품 개인 비밀 메모 로그 수정 성공: `201 Created`, response body 없음
- 제품 목록 xlsx 내보내기 성공: `200 OK`, xlsx binary body

## 8. 비밀 메모 보안

`ProductUserPrivateMemoLog`의 메모 원문은 데이터베이스에 평문으로 저장하지 않는다.

API 요청/응답에서는 `memo`라는 이름을 사용하지만, DB에는 암호화된 본문과 key version을 저장한다. 관리자는 원문을 볼 수 없고 작성자 본인만 복호화된 값을 볼 수 있다.

## 9. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/README.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
