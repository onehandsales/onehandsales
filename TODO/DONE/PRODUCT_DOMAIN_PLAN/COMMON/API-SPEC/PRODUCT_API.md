# Product API Spec

## 1. 공통 규칙

- 이 API 계약은 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- API를 수정할 때는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 함께 갱신한다.
- API별 최종 상세 명세는 `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`를 기준으로 한다.
- 대상: 사용자 페이지 API
- 관리자 페이지: 제외
- 인증: `Authorization: Bearer <backend_app_access_token>`
- 권한: 로그인한 사용자 본인 데이터만 접근 가능
- 날짜 형식: ISO 8601 string
- 제품 목록 페이지 크기: 10개 고정
- 제품 일반 메모 로그 페이지 크기: 10개 고정
- 제품 개인 비밀 메모 로그 페이지 크기: 10개 고정
- 제품 목록 검색: `productName` 부분 검색만 제공
- 제품 목록 필터: `productCategoryId`, `productStatusId`
- 제품 목록 정렬: `createdAtDesc`, `dealCountDesc`, `dealCountAsc`
- 제품 목록 응답: `productPrice`, `updatedAt` 제외
- 제품 카테고리/상태 전체 조회 응답: `createdAt` 제외
- 상태값만 반환하는 API: response body 없음
- 제품 가격: `productPrice` 정수, 0 이상
- 제품 개인 비밀 메모: API에서는 `memo`를 사용하지만 DB에는 평문 저장 금지

## 2. API 목록

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

## 2.1. API 계약 상태 요약

모든 API의 소비자는 `User Web`이다. Backend 구현과 검증이 완료되어 계약 상태는 `implemented`다.

| API | 계약 상태 | Transaction | Observability |
|---|---|---|---|
| `GET /api/products` | implemented | 없음 | `product.listed`, audit log 없음, request id 사용, `productName` 원문 logging 지양 |
| `GET /api/products/export/xlsx` | implemented | 없음 | `product.exported`, audit log 없음, request id 사용, `productName` 원문 logging 금지 |
| `GET /api/product-categories` | implemented | 없음 | `productCategory.listed`, audit log 없음, request id 사용 |
| `POST /api/product-categories` | implemented | 없음 | `productCategory.created`, audit log 없음, request id 사용 |
| `DELETE /api/product-categories/:categoryId` | implemented | 없음 | `productCategory.deleted`, audit log 없음, request id 사용 |
| `GET /api/product-statuses` | implemented | 없음 | `productStatus.listed`, audit log 없음, request id 사용 |
| `POST /api/product-statuses` | implemented | 없음 | `productStatus.created`, audit log 없음, request id 사용 |
| `DELETE /api/product-statuses/:statusId` | implemented | 없음 | `productStatus.deleted`, audit log 없음, request id 사용 |
| `POST /api/products` | implemented | 필요. `Product`와 조건부 `ProductMemoLog` | `product.created`, audit log 없음, request id 사용, `productMemo` redaction |
| `GET /api/products/:productId` | implemented | 없음 | `product.viewed`, audit log 없음, request id 사용 |
| `PATCH /api/products/:productId` | implemented | 없음 | `product.updated`, audit log 없음, request id 사용 |
| `POST /api/products/:productId/memo-logs` | implemented | 없음 | `productMemoLog.created`, audit log 없음, request id 사용, `memo` redaction |
| `GET /api/products/:productId/memo-logs` | implemented | 없음 | `productMemoLog.listed`, audit log 없음, request id 사용, `memo` redaction |
| `PATCH /api/products/:productId/memo-logs/:memoLogId` | implemented | 없음 | `productMemoLog.updated`, audit log 없음, request id 사용, `memo` redaction |
| `POST /api/products/:productId/private-memo-logs` | implemented | 없음 | `productPrivateMemoLog.created`, audit log 없음, request id 사용, private memo redaction |
| `GET /api/products/:productId/private-memo-logs` | implemented | 없음 | `productPrivateMemoLog.listed`, audit log 없음, request id 사용, private memo redaction |
| `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId` | implemented | 없음 | `productPrivateMemoLog.updated`, audit log 없음, request id 사용, private memo redaction |

## 3. 공통 응답 DTO

### ProductListItemResponse

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 ID |
| `productName` | string | 아니오 | 제품명 |
| `productCategory` | object | 아니오 | 제품 카테고리 |
| `productCategory.id` | string | 아니오 | 제품 카테고리 ID |
| `productCategory.categoryName` | string | 아니오 | 제품 카테고리명 |
| `productStatus` | object | 아니오 | 제품 상태 |
| `productStatus.id` | string | 아니오 | 제품 상태 ID |
| `productStatus.statusName` | string | 아니오 | 제품 상태명 |
| `dealCount` | number | 아니오 | 해당 제품이 포함된 딜 수 |
| `createdAt` | string | 아니오 | 등록일 ISO string |

### ProductDetailResponse

`ProductListItemResponse`의 필드에 `productPrice`, `updatedAt`을 추가한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `productPrice` | number | 아니오 | 제품 가격. 정수, 0 이상 |
| `updatedAt` | string | 아니오 | 최근수정일 ISO string |

### ProductCategoryResponse

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 카테고리 ID |
| `categoryName` | string | 아니오 | 제품 카테고리명 |

### ProductStatusResponse

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 상태 ID |
| `statusName` | string | 아니오 | 제품 상태명 |

### ProductMemoLogResponse

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 일반 메모 로그 ID |
| `memoType` | string | 아니오 | 메모 유형 |
| `memo` | string | 아니오 | 일반 메모 본문 |
| `createdAt` | string | 아니오 | 등록일 ISO string |

### ProductPrivateMemoLogResponse

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 제품 개인 비밀 메모 로그 ID |
| `memo` | string | 아니오 | 복호화된 개인 비밀 메모 |
| `createdAt` | string | 아니오 | 등록일 ISO string |

### EmptyResponse

성공 status만 반환하고 body는 없다.

### ProductExportXlsxFile

- API: `GET /api/products/export/xlsx`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="products_YYYYMMDD_HHmmss.xlsx"`
- query: `productName`, `productCategoryId`, `productStatusId`, `sort`
- `page`는 받지 않는다. 검색어, 필터, 정렬 조건에 맞는 전체 제품을 export한다.
- xlsx 컬럼: `제품명`, `카테고리`, `상태`, `딜 수`, `등록일`
- 제외 필드: 제품 ID, 카테고리 ID, 상태 ID, userId, 제품가격, memo/private memo, 딜 연결 ID

## 4. 관련 문서

- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/FE-TODO/G01-FE-PRODUCT-PAGES.goal.md`
