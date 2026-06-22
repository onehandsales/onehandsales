# Product API Detail

## 1. 목적

이 문서는 `PRODUCT_DOMAIN_PLAN`에서 사용하는 제품(Product) API의 요청값, 응답값, 내부 비즈니스 로직, 연결 DB, transaction, observability, 에러, FE/BE 처리 기준을 고정한다.

작성 기준:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`

## 2. 공통 규칙

- User API는 `/api/*`를 사용한다.
- 모든 API는 `AuthGuard`가 필요하다.
- 모든 API는 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- 모든 데이터는 현재 로그인한 `userId` ownership으로 조회, 생성, 수정, 삭제한다.
- `Product.productName`은 필수다.
- `Product.productPrice`는 필수 정수이며 0 이상만 허용한다.
- `Product.productCategoryId`는 필수다.
- `Product.productStatusId`는 필수다.
- 제품 목록은 10개 단위 페이지네이션이다.
- 제품 목록 검색은 `productName`만 대상으로 한다.
- 제품 일반/개인 비밀 메모 로그는 10개 단위 cursor 무한스크롤이다.
- 상태값만 반환하는 생성/수정/삭제 API는 response body가 없다.
- 개인 비밀 메모 원문은 DB, application log, audit log에 저장하거나 출력하지 않는다.
- 이 계획에서는 관리자 API, 휴지통, soft delete, 제품 삭제/복구, `ProductConnection`, `ProductLog`, Import 기능을 만들지 않는다. xlsx export는 추가 유지보수 범위에서 제공한다.

## 3. API 목록

1. 제품 페이지네이션 API: `GET /api/products`
2. 제품 카테고리 전체 조회 API: `GET /api/product-categories`
3. 제품 카테고리 단건 생성 API: `POST /api/product-categories`
4. 제품 카테고리 단건 삭제 API: `DELETE /api/product-categories/:categoryId`
5. 제품 상태 전체 조회 API: `GET /api/product-statuses`
6. 제품 상태 단건 생성 API: `POST /api/product-statuses`
7. 제품 상태 단건 삭제 API: `DELETE /api/product-statuses/:statusId`
8. 제품 단건 생성 API: `POST /api/products`
9. 제품 단건 조회 API: `GET /api/products/:productId`
10. 제품 기본 정보 수정 API: `PATCH /api/products/:productId`
11. 제품 일반 메모 로그 단건 생성 API: `POST /api/products/:productId/memo-logs`
12. 제품 일반 메모 로그 무한스크롤 API: `GET /api/products/:productId/memo-logs`
13. 제품 일반 메모 로그 단건 수정 API: `PATCH /api/products/:productId/memo-logs/:memoLogId`
14. 제품 개인 비밀 메모 로그 단건 생성 API: `POST /api/products/:productId/private-memo-logs`
15. 제품 개인 비밀 메모 로그 무한스크롤 API: `GET /api/products/:productId/private-memo-logs`
16. 제품 개인 비밀 메모 로그 단건 수정 API: `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId`
17. 제품 목록 xlsx 내보내기 API: `GET /api/products/export/xlsx`

## 4. API 계약 상태 요약

모든 API의 소비자는 `User Web`이며, Backend 구현과 검증이 완료되어 계약 상태는 `implemented`다.

| API | 계약 상태 | Transaction | Observability |
|---|---|---|---|
| `GET /api/products` | implemented | 없음. 조회 전용 | event key: `product.listed`, audit log: 없음, request id: 사용, redaction: 제품명 원문 logging 지양 |
| `GET /api/products/export/xlsx` | implemented | 없음. 조회 전용 | event key: `product.exported`, audit log: 없음, request id: 사용, redaction: 제품명 원문 logging 금지 |
| `GET /api/product-categories` | implemented | 없음. 조회 전용 | event key: `productCategory.listed`, audit log: 없음, request id: 사용 |
| `POST /api/product-categories` | implemented | 없음. 단일 `ProductCategory` 생성 | event key: `productCategory.created`, audit log: 없음, request id: 사용 |
| `DELETE /api/product-categories/:categoryId` | implemented | 없음. 사용 여부 검증 후 단일 삭제 | event key: `productCategory.deleted`, audit log: 없음, request id: 사용 |
| `GET /api/product-statuses` | implemented | 없음. 조회 전용 | event key: `productStatus.listed`, audit log: 없음, request id: 사용 |
| `POST /api/product-statuses` | implemented | 없음. 단일 `ProductStatus` 생성 | event key: `productStatus.created`, audit log: 없음, request id: 사용 |
| `DELETE /api/product-statuses/:statusId` | implemented | 없음. 사용 여부 검증 후 단일 삭제 | event key: `productStatus.deleted`, audit log: 없음, request id: 사용 |
| `POST /api/products` | implemented | 필요. `Product`와 조건부 `ProductMemoLog`를 같은 transaction에서 생성 | event key: `product.created`, audit log: 없음, request id: 사용, redaction: `productMemo` 원문 logging 금지 |
| `GET /api/products/:productId` | implemented | 없음. 조회 전용 | event key: `product.viewed`, audit log: 없음, request id: 사용 |
| `PATCH /api/products/:productId` | implemented | 없음. 단일 `Product` 수정 | event key: `product.updated`, audit log: 없음, request id: 사용 |
| `POST /api/products/:productId/memo-logs` | implemented | 없음. 제품 ownership 확인 후 단일 `ProductMemoLog` 생성 | event key: `productMemoLog.created`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `GET /api/products/:productId/memo-logs` | implemented | 없음. 조회 전용 | event key: `productMemoLog.listed`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `PATCH /api/products/:productId/memo-logs/:memoLogId` | implemented | 없음. 단일 `ProductMemoLog` 수정 | event key: `productMemoLog.updated`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `POST /api/products/:productId/private-memo-logs` | implemented | 없음. 암호화 후 단일 `ProductUserPrivateMemoLog` 생성 | event key: `productPrivateMemoLog.created`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |
| `GET /api/products/:productId/private-memo-logs` | implemented | 없음. 작성자 본인 로그 조회와 복호화 | event key: `productPrivateMemoLog.listed`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |
| `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId` | implemented | 없음. 암호화 후 단일 `ProductUserPrivateMemoLog` 수정 | event key: `productPrivateMemoLog.updated`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |

## 5. 제품 페이지네이션 API

- API 이름: 제품 페이지네이션 API
- API 식별자: `ListProducts`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 기존 FE product API 재정렬 필요
- Method: `GET`
- Path: `/api/products`
- 인증: Backend App access token 필요
- 권한: 본인 제품만 조회

### 목적

제품 목록 화면에서 제품명 검색, 제품 카테고리 필터, 제품 상태 필터, 10개 단위 페이지네이션을 제공한다.

### Request

- Request 이름: `ListProductsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | `page` | number | 아니오 | 정수, 1 이상 | 1부터 시작. 기본값 1 |
| query | `productName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 제품명 부분 검색어 |
| query | `productCategoryId` | string | 아니오 | UUID | 제품 카테고리 필터 ID |
| query | `productStatusId` | string | 아니오 | UUID | 제품 상태 필터 ID |
| query | `sort` | string | 아니오 | `createdAtDesc`, `dealCountDesc`, `dealCountAsc` | 정렬 조건. 기본값 `createdAtDesc` |

서버는 `pageSize`를 10으로 고정한다. FE는 `pageSize` query를 보내지 않는다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. query 조건을 validation한다.
3. `userId` 조건을 기본으로 적용한다.
4. `productName`이 있으면 `Product.productName` 부분 검색 조건을 적용한다.
5. `productCategoryId`가 있으면 현재 사용자의 `ProductCategory`인지 확인한 뒤 필터를 적용한다.
6. `productStatusId`가 있으면 현재 사용자의 `ProductStatus`인지 확인한 뒤 필터를 적용한다.
7. `sort`가 없으면 `createdAt DESC, id DESC`로 정렬한다.
8. `sort=dealCountDesc`이면 딜 수 DESC, `createdAt DESC`, `id DESC` 순서로 정렬한다.
9. `sort=dealCountAsc`이면 딜 수 ASC, `createdAt DESC`, `id DESC` 순서로 정렬한다.
10. 10개 단위로 조회한다.
11. 각 제품이 포함된 딜 수를 `dealCount`로 넣는다.
12. 목록 응답으로 변환할 때 `productPrice`, `updatedAt`은 넣지 않는다.

### Response

- Status: `200 OK`
- Response 이름: `ProductPageResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ProductListItemResponse[]` | 아니오 | 제품 목록 |
| `page` | number | 아니오 | 현재 페이지 |
| `pageSize` | number | 아니오 | 10 |
| `totalCount` | number | 아니오 | 조건에 맞는 전체 제품 수 |
| `totalPages` | number | 아니오 | 전체 페이지 수 |

`ProductListItemResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 ID |
| `productName` | string | 아니오 | 제품명 |
| `productCategory` | object | 아니오 | 제품 카테고리 |
| `productCategory.id` | string | 아니오 | 카테고리 ID |
| `productCategory.categoryName` | string | 아니오 | 카테고리명 |
| `productStatus` | object | 아니오 | 제품 상태 |
| `productStatus.id` | string | 아니오 | 상태 ID |
| `productStatus.statusName` | string | 아니오 | 상태명 |
| `dealCount` | number | 아니오 | 해당 제품이 포함된 딜 수 |
| `createdAt` | string | 아니오 | 등록일 |

### 연결된 DB 스키마

- 조회: `Product`, `ProductCategory`, `ProductStatus`, `DealProduct`
- transaction: 없음
- 감사 로그: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 잘못된 page 또는 UUID | `ValidationError` | 400 |
| 본인 소유가 아닌 카테고리 ID | `ProductCategoryNotFound` | 404 |
| 본인 소유가 아닌 상태 ID | `ProductStatusNotFound` | 404 |

## 6. 제품 카테고리 전체 조회 API

- API 이름: 제품 카테고리 전체 조회 API
- API 식별자: `ListProductCategories`
- 계약 상태: `implemented`
- Method: `GET`
- Path: `/api/product-categories`
- 인증: 필요
- 권한: 본인 제품 카테고리만 조회

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자의 `ProductCategory`를 조회한다.
3. 이름 기준으로 안정적인 정렬을 적용한다.
4. 응답에는 `createdAt`을 넣지 않는다.

### Response

- Status: `200 OK`
- Response 이름: `ProductCategoryListResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ProductCategoryResponse[]` | 아니오 | 카테고리 목록 |

`ProductCategoryResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 카테고리 ID |
| `categoryName` | string | 아니오 | 카테고리명 |

### 연결된 DB 스키마

- 조회: `ProductCategory`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |

## 7. 제품 카테고리 단건 생성 API

- API 이름: 제품 카테고리 단건 생성 API
- API 식별자: `CreateProductCategory`
- 계약 상태: `implemented`
- Method: `POST`
- Path: `/api/product-categories`
- 인증: 필요
- 권한: 본인 제품 카테고리만 생성

### Request

- Request 이름: `CreateProductCategoryRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| body | `categoryName` | string | 예 | trim 후 1자 이상 | 제품 카테고리명 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `categoryName`을 trim하고 필수값을 검증한다.
3. 같은 사용자 안에서 같은 `categoryName`이 이미 있는지 확인한다.
4. `ProductCategory`를 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 생성: `ProductCategory`
- 조회: `ProductCategory`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 같은 카테고리 중복 | `DuplicateProductCategory` | 409 |

## 8. 제품 카테고리 단건 삭제 API

- API 이름: 제품 카테고리 단건 삭제 API
- API 식별자: `DeleteProductCategory`
- 계약 상태: `implemented`
- Method: `DELETE`
- Path: `/api/product-categories/:categoryId`
- 인증: 필요
- 권한: 본인 제품 카테고리만 삭제

### Request

- Request 이름: `DeleteProductCategoryParams`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `categoryId` | string | 예 | UUID | 제품 카테고리 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `categoryId`를 validation한다.
3. 현재 사용자의 `ProductCategory`인지 확인한다.
4. 해당 카테고리를 사용하는 `Product`가 하나라도 있으면 삭제를 막는다.
5. 매핑된 제품이 없으면 `ProductCategory`를 삭제한다.
6. `204 No Content`와 빈 body를 반환한다.

### Response

- Status: `204 No Content`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 조회: `ProductCategory`, `Product`
- 삭제: `ProductCategory`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 카테고리 없음 또는 본인 소유 아님 | `ProductCategoryNotFound` | 404 |
| 이미 제품에 매핑됨 | `ProductCategoryInUse` | 409 |

## 9. 제품 상태 전체 조회 API

- API 이름: 제품 상태 전체 조회 API
- API 식별자: `ListProductStatuses`
- 계약 상태: `implemented`
- Method: `GET`
- Path: `/api/product-statuses`
- 인증: 필요
- 권한: 본인 제품 상태만 조회

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자의 `ProductStatus`를 조회한다.
3. 이름 기준으로 안정적인 정렬을 적용한다.
4. 응답에는 `createdAt`을 넣지 않는다.

### Response

- Status: `200 OK`
- Response 이름: `ProductStatusListResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ProductStatusResponse[]` | 아니오 | 제품 상태 목록 |

`ProductStatusResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 상태 ID |
| `statusName` | string | 아니오 | 상태명 |

### 연결된 DB 스키마

- 조회: `ProductStatus`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |

## 10. 제품 상태 단건 생성 API

- API 이름: 제품 상태 단건 생성 API
- API 식별자: `CreateProductStatus`
- 계약 상태: `implemented`
- Method: `POST`
- Path: `/api/product-statuses`
- 인증: 필요
- 권한: 본인 제품 상태만 생성

### Request

- Request 이름: `CreateProductStatusRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| body | `statusName` | string | 예 | trim 후 1자 이상 | 제품 상태명 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `statusName`을 trim하고 필수값을 검증한다.
3. 같은 사용자 안에서 같은 `statusName`이 이미 있는지 확인한다.
4. `ProductStatus`를 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 생성: `ProductStatus`
- 조회: `ProductStatus`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 같은 상태 중복 | `DuplicateProductStatus` | 409 |

## 11. 제품 상태 단건 삭제 API

- API 이름: 제품 상태 단건 삭제 API
- API 식별자: `DeleteProductStatus`
- 계약 상태: `implemented`
- Method: `DELETE`
- Path: `/api/product-statuses/:statusId`
- 인증: 필요
- 권한: 본인 제품 상태만 삭제

### Request

- Request 이름: `DeleteProductStatusParams`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `statusId` | string | 예 | UUID | 제품 상태 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `statusId`를 validation한다.
3. 현재 사용자의 `ProductStatus`인지 확인한다.
4. 해당 상태를 사용하는 `Product`가 하나라도 있으면 삭제를 막는다.
5. 매핑된 제품이 없으면 `ProductStatus`를 삭제한다.
6. `204 No Content`와 빈 body를 반환한다.

### Response

- Status: `204 No Content`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 조회: `ProductStatus`, `Product`
- 삭제: `ProductStatus`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 상태 없음 또는 본인 소유 아님 | `ProductStatusNotFound` | 404 |
| 이미 제품에 매핑됨 | `ProductStatusInUse` | 409 |

## 12. 제품 단건 생성 API

- API 이름: 제품 단건 생성 API
- API 식별자: `CreateProduct`
- 계약 상태: `implemented`
- Method: `POST`
- Path: `/api/products`
- 인증: 필요
- 권한: 본인 제품만 생성

### 목적

제품명, 제품가격, 제품 카테고리, 제품 상태로 새 제품을 생성한다. 선택 입력인 `productMemo`가 있으면 제품 일반 메모 로그 첫 데이터로 저장한다.

### Request

- Request 이름: `CreateProductRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| body | `productName` | string | 예 | trim 후 1자 이상 | 제품명 |
| body | `productPrice` | number | 예 | 정수, 0 이상 | 제품가격 |
| body | `productCategoryId` | string | 예 | UUID | 제품 카테고리 ID |
| body | `productStatusId` | string | 예 | UUID | 제품 상태 ID |
| body | `productMemo` | string \| null | 아니오 | trim 후 빈 문자열이면 미작성 처리 | 제품 생성 시 첫 제품 메모 로그로 저장할 일반 메모 |

`productMemo`가 있으면 서버는 첫 제품 메모 로그의 `memoType`을 `초기 메모`로 저장한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. `productCategoryId`가 현재 사용자의 `ProductCategory`인지 확인한다.
4. `productStatusId`가 현재 사용자의 `ProductStatus`인지 확인한다.
5. transaction을 시작한다.
6. `Product`를 생성한다.
7. `productMemo`가 있으면 생성된 제품 ID와 현재 userId로 `ProductMemoLog`를 생성한다. 이때 `memoType`은 `초기 메모`로 저장한다.
8. `productMemo`가 없으면 `ProductMemoLog`를 생성하지 않는다.
9. transaction을 commit한다.
10. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 생성: `Product`, `ProductMemoLog` 조건부 생성
- 조회: `ProductCategory`, `ProductStatus`
- transaction: `Product`와 조건부 `ProductMemoLog`
- 감사 로그: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 제품 카테고리 없음 또는 본인 소유 아님 | `ProductCategoryNotFound` | 404 |
| 제품 상태 없음 또는 본인 소유 아님 | `ProductStatusNotFound` | 404 |

## 13. 제품 단건 조회 API

- API 이름: 제품 단건 조회 API
- API 식별자: `GetProduct`
- 계약 상태: `implemented`
- Method: `GET`
- Path: `/api/products/:productId`
- 인증: 필요
- 권한: 본인 제품만 조회

### Request

- Request 이름: `GetProductParams`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `productId`를 validation한다.
3. `userId`와 `productId`가 모두 일치하는 제품을 조회한다.
4. 제품 카테고리와 제품 상태를 함께 조회한다.
5. 단건 응답으로 변환한다.

### Response

- Status: `200 OK`
- Response 이름: `ProductDetailResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 ID |
| `productName` | string | 아니오 | 제품명 |
| `productPrice` | number | 아니오 | 제품가격 |
| `productCategory` | object | 아니오 | 제품 카테고리 |
| `productCategory.id` | string | 아니오 | 제품 카테고리 ID |
| `productCategory.categoryName` | string | 아니오 | 제품 카테고리명 |
| `productStatus` | object | 아니오 | 제품 상태 |
| `productStatus.id` | string | 아니오 | 제품 상태 ID |
| `productStatus.statusName` | string | 아니오 | 제품 상태명 |
| `createdAt` | string | 아니오 | 등록일 |
| `updatedAt` | string | 아니오 | 최근수정일 |

### 연결된 DB 스키마

- 조회: `Product`, `ProductCategory`, `ProductStatus`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |

## 14. 제품 기본 정보 수정 API

- API 이름: 제품 기본 정보 수정 API
- API 식별자: `UpdateProduct`
- 계약 상태: `implemented`
- Method: `PATCH`
- Path: `/api/products/:productId`
- 인증: 필요
- 권한: 본인 제품만 수정

### Request

- Request 이름: `UpdateProductRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |
| body | `productName` | string | 아니오 | trim 후 1자 이상 | 수정할 제품명 |
| body | `productPrice` | number | 아니오 | 정수, 0 이상 | 수정할 제품가격 |
| body | `productCategoryId` | string | 아니오 | UUID | 수정할 제품 카테고리 ID |
| body | `productStatusId` | string | 아니오 | UUID | 수정할 제품 상태 ID |

`productName`, `productPrice`, `productCategoryId`, `productStatusId` 중 최소 1개는 필요하다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 제품이 현재 사용자의 제품인지 확인한다.
4. `productCategoryId`가 있으면 현재 사용자의 `ProductCategory`인지 확인한다.
5. `productStatusId`가 있으면 현재 사용자의 `ProductStatus`인지 확인한다.
6. 요청에 포함된 제품명, 제품가격, 제품 카테고리, 제품 상태만 수정한다.
7. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 조회: `Product`, `ProductCategory`, `ProductStatus`
- 수정: `Product`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |
| 제품 카테고리 없음 또는 본인 소유 아님 | `ProductCategoryNotFound` | 404 |
| 제품 상태 없음 또는 본인 소유 아님 | `ProductStatusNotFound` | 404 |

## 15. 제품 일반 메모 로그 단건 생성 API

- API 이름: 제품 일반 메모 로그 단건 생성 API
- API 식별자: `CreateProductMemoLog`
- 계약 상태: `implemented`
- Method: `POST`
- Path: `/api/products/:productId/memo-logs`
- 인증: 필요
- 권한: 본인 제품에만 메모 로그 생성

### Request

- Request 이름: `CreateProductMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |
| body | `memoType` | string | 예 | trim 후 1자 이상 | 메모 유형 |
| body | `memo` | string | 예 | trim 후 1자 이상 | 일반 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `productId`와 request body를 validation한다.
3. 제품이 현재 사용자의 제품인지 확인한다.
4. 현재 userId와 productId로 `ProductMemoLog`를 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 생성: `ProductMemoLog`
- 조회: `Product`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |

## 16. 제품 일반 메모 로그 무한스크롤 API

- API 이름: 제품 일반 메모 로그 무한스크롤 API
- API 식별자: `ListProductMemoLogs`
- 계약 상태: `implemented`
- Method: `GET`
- Path: `/api/products/:productId/memo-logs`
- 인증: 필요
- 권한: 본인 제품의 메모 로그만 조회

### Request

- Request 이름: `ListProductMemoLogsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |
| query | `cursor` | string | 아니오 | 서버 cursor 형식 | 다음 페이지 조회 cursor |

서버는 한 번에 10개를 반환한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `productId`와 `cursor`를 validation한다.
3. 제품이 현재 사용자의 제품인지 확인한다.
4. `ProductMemoLog`를 `createdAt DESC, id DESC` 기준으로 10개 조회한다.
5. 다음 페이지가 있으면 `nextCursor`를 반환한다.

### Response

- Status: `200 OK`
- Response 이름: `ProductMemoLogConnectionResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ProductMemoLogResponse[]` | 아니오 | 제품 일반 메모 로그 목록 |
| `nextCursor` | string \| null | 예 | 다음 페이지 cursor |
| `hasNext` | boolean | 아니오 | 다음 페이지 존재 여부 |

`ProductMemoLogResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 일반 메모 로그 ID |
| `memoType` | string | 아니오 | 메모 유형 |
| `memo` | string | 아니오 | 일반 메모 본문 |
| `createdAt` | string | 아니오 | 등록일 |

### 연결된 DB 스키마

- 조회: `Product`, `ProductMemoLog`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |
| cursor 형식 오류 | `ValidationError` | 400 |

## 17. 제품 일반 메모 로그 단건 수정 API

- API 이름: 제품 일반 메모 로그 단건 수정 API
- API 식별자: `UpdateProductMemoLog`
- 계약 상태: `implemented`
- Method: `PATCH`
- Path: `/api/products/:productId/memo-logs/:memoLogId`
- 인증: 필요
- 권한: 본인 제품의 본인 메모 로그만 수정

### Request

- Request 이름: `UpdateProductMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |
| path | `memoLogId` | string | 예 | UUID | 제품 일반 메모 로그 ID |
| body | `memoType` | string | 아니오 | trim 후 1자 이상 | 수정할 메모 유형 |
| body | `memo` | string | 아니오 | trim 후 1자 이상 | 수정할 일반 메모 본문 |

`memoType`, `memo` 중 최소 1개는 필요하다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 제품이 현재 사용자의 제품인지 확인한다.
4. 메모 로그가 같은 제품에 속하고 현재 사용자가 작성한 로그인지 확인한다.
5. 요청에 포함된 `memoType`, `memo`만 수정한다.
6. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 조회: `Product`, `ProductMemoLog`
- 수정: `ProductMemoLog`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |
| 메모 로그 없음 또는 수정 권한 없음 | `ProductMemoLogNotFound` | 404 |

## 18. 제품 개인 비밀 메모 로그 단건 생성 API

- API 이름: 제품 개인 비밀 메모 로그 단건 생성 API
- API 식별자: `CreateProductPrivateMemoLog`
- 계약 상태: `implemented`
- Method: `POST`
- Path: `/api/products/:productId/private-memo-logs`
- 인증: 필요
- 권한: 본인 제품에 본인 개인 비밀 메모 로그만 생성

### Request

- Request 이름: `CreateProductPrivateMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |
| body | `memo` | string | 예 | trim 후 1자 이상 | 개인 비밀 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 제품이 현재 사용자의 제품인지 확인한다.
4. 요청의 `memo`를 암호화한다.
5. 현재 userId와 productId로 `ProductUserPrivateMemoLog`를 생성한다.
6. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 생성: `ProductUserPrivateMemoLog`
- 조회: `Product`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |
| 비밀 메모 암호화 실패 | `PrivateMemoEncryptFailed` | 500 |

## 19. 제품 개인 비밀 메모 로그 무한스크롤 API

- API 이름: 제품 개인 비밀 메모 로그 무한스크롤 API
- API 식별자: `ListProductPrivateMemoLogs`
- 계약 상태: `implemented`
- Method: `GET`
- Path: `/api/products/:productId/private-memo-logs`
- 인증: 필요
- 권한: 본인이 작성한 제품 개인 비밀 메모 로그만 조회

### Request

- Request 이름: `ListProductPrivateMemoLogsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |
| query | `cursor` | string | 아니오 | 서버 cursor 형식 | 다음 페이지 조회 cursor |

서버는 한 번에 10개를 반환한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `productId`와 `cursor`를 validation한다.
3. 제품이 현재 사용자의 제품인지 확인한다.
4. 현재 사용자가 작성한 `ProductUserPrivateMemoLog`만 조회한다.
5. `memoCiphertext`를 복호화해 API 응답의 `memo`로 변환한다.
6. `createdAt DESC, id DESC` 기준으로 10개 조회한다.
7. 다음 페이지가 있으면 `nextCursor`를 반환한다.

### Response

- Status: `200 OK`
- Response 이름: `ProductPrivateMemoLogConnectionResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ProductPrivateMemoLogResponse[]` | 아니오 | 제품 개인 비밀 메모 로그 목록 |
| `nextCursor` | string \| null | 예 | 다음 페이지 cursor |
| `hasNext` | boolean | 아니오 | 다음 페이지 존재 여부 |

`ProductPrivateMemoLogResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 개인 비밀 메모 로그 ID |
| `memo` | string | 아니오 | 복호화된 개인 비밀 메모 |
| `createdAt` | string | 아니오 | 등록일 |

### 연결된 DB 스키마

- 조회: `Product`, `ProductUserPrivateMemoLog`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |
| cursor 형식 오류 | `ValidationError` | 400 |
| 비밀 메모 복호화 실패 | `PrivateMemoDecryptFailed` | 500 |

## 20. 제품 개인 비밀 메모 로그 단건 수정 API

- API 이름: 제품 개인 비밀 메모 로그 단건 수정 API
- API 식별자: `UpdateProductPrivateMemoLog`
- 계약 상태: `implemented`
- Method: `PATCH`
- Path: `/api/products/:productId/private-memo-logs/:privateMemoLogId`
- 인증: 필요
- 권한: 본인이 작성한 제품 개인 비밀 메모 로그만 수정

### Request

- Request 이름: `UpdateProductPrivateMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `productId` | string | 예 | UUID | 제품 ID |
| path | `privateMemoLogId` | string | 예 | UUID | 제품 개인 비밀 메모 로그 ID |
| body | `memo` | string | 예 | trim 후 1자 이상 | 수정할 개인 비밀 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 제품이 현재 사용자의 제품인지 확인한다.
4. 개인 비밀 메모 로그가 같은 제품에 속하고 현재 사용자가 작성한 로그인지 확인한다.
5. 요청의 `memo`를 암호화한다.
6. `memoCiphertext`, `memoKeyVersion`만 갱신한다.
7. `201 Created`와 빈 body를 반환한다.

### Response

- Status: `201 Created`
- Response 이름: `EmptyResponse`
- Response body 없음

### 연결된 DB 스키마

- 조회: `Product`, `ProductUserPrivateMemoLog`
- 수정: `ProductUserPrivateMemoLog`
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 제품 없음 또는 본인 소유 아님 | `ProductNotFound` | 404 |
| 개인 비밀 메모 로그 없음 또는 수정 권한 없음 | `ProductPrivateMemoLogNotFound` | 404 |
| 비밀 메모 암호화 실패 | `PrivateMemoEncryptFailed` | 500 |

## 21. 제품 목록 xlsx 내보내기 API

- API 이름: 제품 목록 xlsx 내보내기 API
- API 식별자: `ExportProductsXlsx`
- 계약 상태: `implemented`
- 소비자: User Web
- Method: `GET`
- Path: `/api/products/export/xlsx`
- 인증: Backend App access token 필요
- 권한: 본인 제품만 export

### Request

- Request 이름: `ExportProductsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | `productName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 제품명 부분 검색어 |
| query | `productCategoryId` | string | 아니오 | UUID | 제품 카테고리 필터 ID |
| query | `productStatusId` | string | 아니오 | UUID | 제품 상태 필터 ID |
| query | `sort` | string | 아니오 | `createdAtDesc`, `dealCountDesc`, `dealCountAsc` | 제품 목록 정렬 조건. 기본값 `createdAtDesc` |

`page`는 받지 않는다. export는 현재 검색어, 필터, 정렬 조건에 맞는 전체 제품을 대상으로 한다.

### 내부 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. query를 validation한다.
3. `productName`을 trim하고 값이 있으면 제품명 부분 검색 조건을 적용한다.
4. `productCategoryId`, `productStatusId`가 있으면 현재 사용자 소유인지 확인한다.
5. `Product.userId = currentUserId`와 검색/필터 조건을 적용한다.
6. `sort`에 따라 제품 목록 API와 같은 정렬을 적용한다.
7. `ProductCategory`, `ProductStatus` relation과 제품별 연결 딜 수를 포함해 조회한다.
8. ID, 제품가격, memo/private memo, 딜 연결 ID를 제외하고 xlsx 파일을 생성한다.

### Response

- Status: `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="products_YYYYMMDD_HHmmss.xlsx"`
- xlsx 컬럼: `제품명`, `카테고리`, `상태`, `딜 수`, `등록일`

### 연결된 DB 스키마

- 조회: `Product`, `ProductCategory`, `ProductStatus`, `DealProduct`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Observability

- log event key: `product.exported`
- audit log: 없음
- request id: 사용
- redaction: `productName` 원문 logging 금지

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| query validation 실패 | `ValidationError` | 400 |
| 본인 소유가 아닌 카테고리 ID | `ProductCategoryNotFound` | 404 |
| 본인 소유가 아닌 상태 ID | `ProductStatusNotFound` | 404 |
| xlsx 생성 실패 | `ProductExportFailed` | 500 |

## 22. FE/BE 처리 기준

| API | FE 처리 기준 | BE 처리 기준 | 검증 기준 |
|---|---|---|---|
| `GET /api/products` | 제품명, 카테고리, 상태, 정렬, page 변경 시 목록 query를 재조회한다. 목록에는 `dealCount`를 표시하고 `productPrice`, `updatedAt`은 표시하지 않는다. | userId ownership을 기본 조건으로 두고 sort 조건과 10개 페이지네이션을 적용한다. | 제품명 검색, 필터, 딜 수 정렬, 본인 데이터만 조회되는지 확인한다. |
| `GET /api/products/export/xlsx` | 제품 목록의 현재 검색어, 필터, 정렬을 전달하되 `page`는 전달하지 않는다. | 동일 검색/필터/정렬 조건으로 전체 제품을 조회하고 xlsx 파일을 반환한다. | 검색/필터/정렬 반영, 딜 수 컬럼, ID와 가격 제외, 다운로드 헤더를 확인한다. |
| `GET /api/product-categories` | 목록 필터와 생성/수정 form 옵션으로 사용한다. `createdAt`을 기대하지 않는다. | 현재 userId의 `ProductCategory`만 반환한다. | 다른 사용자의 카테고리가 섞이지 않는지 확인한다. |
| `POST /api/product-categories` | 성공 후 제품 카테고리 목록을 재조회한다. | 같은 userId 안에서 categoryName 중복을 막는다. | 중복 409와 정상 생성 201을 확인한다. |
| `DELETE /api/product-categories/:categoryId` | 성공 후 카테고리 목록과 필요 시 제품 목록을 재조회한다. | 매핑된 제품이 있으면 삭제를 막는다. | in-use 409와 미사용 삭제 204를 확인한다. |
| `GET /api/product-statuses` | 목록 필터와 생성/수정 form 옵션으로 사용한다. `createdAt`을 기대하지 않는다. | 현재 userId의 `ProductStatus`만 반환한다. | 다른 사용자의 상태가 섞이지 않는지 확인한다. |
| `POST /api/product-statuses` | 성공 후 제품 상태 목록을 재조회한다. | 같은 userId 안에서 statusName 중복을 막는다. | 중복 409와 정상 생성 201을 확인한다. |
| `DELETE /api/product-statuses/:statusId` | 성공 후 상태 목록과 필요 시 제품 목록을 재조회한다. | 매핑된 제품이 있으면 삭제를 막는다. | in-use 409와 미사용 삭제 204를 확인한다. |
| `POST /api/products` | `201 Created` body 없음으로 처리하고 제품 목록을 재조회한다. | transaction 안에서 `Product`를 만들고 `productMemo`가 있으면 `ProductMemoLog`를 함께 만든다. | `productMemo`가 `memoType: "초기 메모"`로 저장되는지 확인한다. |
| `GET /api/products/:productId` | 상세 화면 진입과 수정 성공 후 재조회한다. | productId와 userId를 함께 조건으로 조회한다. | 본인 소유가 아닌 제품은 404인지 확인한다. |
| `PATCH /api/products/:productId` | `201 Created` body 없음으로 처리하고 제품 단건과 목록을 필요한 범위에서 재조회한다. | 요청에 포함된 필드만 수정한다. | 최소 1개 필드 validation과 FK ownership을 확인한다. |
| `POST /api/products/:productId/memo-logs` | 성공 후 제품 메모 로그 목록을 재조회한다. | `memoType`, `memo`를 필수로 받아 현재 userId와 productId로 저장한다. | memoType 누락 validation과 정상 생성 201을 확인한다. |
| `GET /api/products/:productId/memo-logs` | infinite scroll cursor로 10개씩 추가 조회하고 `memoType`, `memo`, `createdAt`을 표시한다. | product ownership 확인 후 `createdAt DESC, id DESC`로 조회한다. | cursor 페이지, hasNext, 본인 제품 제한을 확인한다. |
| `PATCH /api/products/:productId/memo-logs/:memoLogId` | 성공 후 제품 메모 로그 목록을 재조회하거나 로컬 상태를 갱신한다. | 같은 제품과 작성자 userId를 검증한 뒤 요청 필드를 수정한다. | 타 사용자 로그 수정 차단과 `memoType`, `memo` 부분 수정을 확인한다. |
| `POST /api/products/:productId/private-memo-logs` | 성공 후 개인 비밀 메모 로그 목록을 재조회한다. | 요청 `memo`를 암호화해 `memoCiphertext`, `memoKeyVersion`으로 저장한다. | DB 평문 미저장과 정상 생성 201을 확인한다. |
| `GET /api/products/:productId/private-memo-logs` | infinite scroll cursor로 10개씩 추가 조회하고 복호화된 `memo`, `createdAt`을 표시한다. | 작성자 본인의 로그만 조회하고 복호화한 뒤 반환한다. | 타 사용자 비밀 메모 미노출과 복호화 실패 처리를 확인한다. |
| `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId` | 성공 후 개인 비밀 메모 로그 목록을 재조회하거나 로컬 상태를 갱신한다. | 작성자 본인의 로그인지 검증하고 `memo`를 다시 암호화해 저장한다. | 타 사용자 로그 수정 차단과 DB 평문 미저장을 확인한다. |

## 23. 관련 문서

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
