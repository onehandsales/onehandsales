# Product Export XLSX API Spec

## 1. 목적

이 문서는 제품 목록 페이지의 내보내기 버튼에서 사용할 xlsx 다운로드 API 계약을 정의한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`

## 2. 계약 상태

- API: `GET /api/products/export/xlsx`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 신규 API
- 대상 화면: 제품 목록 페이지
- 응답 형식: xlsx binary file

## 3. API 요약

제품 목록 페이지에서 현재 적용된 검색/필터 조건에 맞는 제품 전체 데이터를 xlsx 파일로 다운로드한다.

- 페이지네이션 없음
- `page` query는 사용하지 않는다.
- `productName` 검색어는 export에도 적용한다.
- `productCategoryId`, `productStatusId` 필터는 export에도 적용한다.
- `sort` 정렬 조건은 export에도 적용한다.
- 검색어와 필터가 동시에 있으면 모든 조건을 만족하는 제품 전체를 내보낸다.
- 필터가 있으면 필터링된 전체 제품 데이터를 내보낸다.
- 필터가 없으면 현재 사용자의 전체 제품 데이터를 내보낸다.
- 기본 정렬: `createdAt DESC`, 보조 정렬 `id DESC`
- id 계열 값은 파일에 포함하지 않는다.
- 제품 가격은 이번 내보내기 범위에 포함하지 않는다.

## 4. Request

- Request 이름: `ExportProductsXlsxRequest`
- Method: `GET`
- Path: `/api/products/export/xlsx`
- 인증: Backend App access token 필요
- 권한: 본인 제품만 내보내기 가능

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `productName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 제품명 부분 검색어 |
| query | `productCategoryId` | string | 아니오 | UUID | 제품 카테고리 필터 ID |
| query | `productStatusId` | string | 아니오 | UUID | 제품 상태 필터 ID |
| query | `sort` | string | 아니오 | `createdAtDesc`, `dealCountDesc`, `dealCountAsc` | 제품 목록 정렬 조건. 기본값 `createdAtDesc` |
| query | `page` | 없음 | 아니오 | 전송하지 않음 | 내보내기는 페이지네이션을 적용하지 않음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

FE는 제품 목록 화면의 현재 검색어, 필터, 정렬 query를 전달하되 `page`는 제거한다.

## 5. Response

- Response 이름: `ProductExportXlsxFile`
- Status: `200 OK`
- Body: xlsx binary

권장 header:

| Header | Value |
|---|---|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename="products_YYYYMMDD_HHmmss.xlsx"` |

파일 컬럼:

| 컬럼명 | 값 기준 | 설명 |
|---|---|---|
| `제품명` | `Product.productName` | 제품명 |
| `카테고리` | `ProductCategory.categoryName` | 제품 카테고리명 |
| `상태` | `ProductStatus.statusName` | 제품 상태명 |
| `딜 수` | 연결된 `DealProduct` 개수 | 해당 제품이 포함된 딜 수 |
| `등록일` | `Product.createdAt` | `yyyy-mm-dd` 표시 형식 |

파일에 포함하지 않는 값:

- `Product.id`
- `ProductCategory.id`
- `ProductStatus.id`
- `DealProduct.id`
- 내부 userId
- `Product.productPrice`
- 메모 원문
- 개인 비밀 메모 원문 또는 암호문

## 6. 필터링 예시

제품 목록 화면에서 다음 조건이 적용된 상태라고 가정한다.

- 제품명 검색어: `보험`
- 카테고리: `보험`
- 상태: `판매중`

제품 목록 API:

```http
GET /api/products?page=1&productName=보험&productCategoryId=category-1&productStatusId=status-1&sort=createdAtDesc
```

내보내기 API:

```http
GET /api/products/export/xlsx?productName=보험&productCategoryId=category-1&productStatusId=status-1&sort=createdAtDesc
```

이때 `page=1`은 export에 적용하지 않는다. xlsx에는 제품명에 `보험`이 포함되고, 카테고리와 상태 필터를 모두 만족하는 제품 전체가 들어간다.

xlsx 예시:

| 제품명 | 카테고리 | 상태 | 딜 수 | 등록일 |
|---|---|---|---:|---|
| 암보험 플랜 A | 보험 | 판매중 | 3 | 2026-06-12 |
| 실손보험 패키지 | 보험 | 판매중 | 1 | 2026-06-09 |

카테고리만 필터링한 경우:

```http
GET /api/products/export/xlsx?productCategoryId=category-1
```

xlsx 예시:

| 제품명 | 카테고리 | 상태 | 딜 수 | 등록일 |
|---|---|---|---:|---|
| 암보험 플랜 A | 보험 | 판매중 | 3 | 2026-06-12 |
| 연금보험 플랜 B | 보험 | 준비중 | 0 | 2026-06-08 |

필터가 없는 경우:

```http
GET /api/products/export/xlsx
```

현재 사용자의 전체 제품이 `createdAt DESC` 기준으로 내려간다.

## 7. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. export query를 validation한다.
3. `productCategoryId`가 있으면 현재 사용자 소유 카테고리인지 검증한다.
4. `productStatusId`가 있으면 현재 사용자 소유 상태인지 검증한다.
5. 기존 제품 목록과 같은 검색어, 필터, 정렬 조건을 구성한다.
6. `Product.userId = currentUserId` ownership 조건을 기본으로 적용한다.
7. 페이지네이션 없이 조건에 맞는 전체 제품을 조회한다.
8. `ProductCategory`, `ProductStatus` relation과 제품별 연결 딜 수를 함께 조회한다.
9. `sort`에 따라 목록 API와 같은 정렬을 적용한다. 기본값은 `createdAt DESC`, `id DESC`다.
10. id 계열 값과 범위 밖 필드를 제외하고 xlsx row를 만든다.
11. xlsx binary와 다운로드 header를 반환한다.

## 8. 연결 DB 스키마

- 조회: `Product`, `ProductCategory`, `ProductStatus`, `DealProduct`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

관계 기준:

- `Product.productCategoryId`는 `ProductCategory.id`를 참조한다.
- `Product.productStatusId`는 `ProductStatus.id`를 참조한다.
- `DealProduct.productId`는 `Product.id`를 참조한다.
- `Product`, `ProductCategory`, `ProductStatus`, `DealProduct`는 모두 `userId`를 가진 사용자 소유 데이터다.

## 9. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 파일 생성 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음

## 10. Observability

- event key: `product.exported`
- audit log: 없음
- request id: 사용
- redaction: 제품명 검색어, 메모 원문, 개인 비밀 메모 원문 logging 금지
- log context 권장값: `userId`, `filterKeys`, `rowCount`

## 11. Error

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 잘못된 UUID query | `ValidationError` | 400 | 내보내기 실패 안내 | log |
| 본인 소유가 아닌 카테고리 ID | `ProductCategoryNotFound` | 404 | 필터 초기화 또는 내보내기 실패 안내 | log |
| 본인 소유가 아닌 상태 ID | `ProductStatusNotFound` | 404 | 필터 초기화 또는 내보내기 실패 안내 | log |
| xlsx 생성 실패 | `ProductExportFailed` | 500 | 내보내기 실패 안내 | error |

## 12. FE/BE 처리 기준

FE:

- 제품 목록 화면의 현재 검색어, 필터, 정렬 query를 export API에 전달한다.
- `page`는 전달하지 않는다.
- 응답은 JSON이 아니라 blob으로 처리한다.
- 다운로드 파일명은 Backend의 `Content-Disposition` header를 우선 사용한다.

BE:

- 기존 `GET /api/products` JSON 응답은 변경하지 않는다.
- export API는 xlsx binary를 반환한다.
- 파일 컬럼명은 `제품명`, `카테고리`, `상태`, `딜 수`, `등록일`로 고정한다.
- 범용 `ExportJob`이나 비동기 export queue는 이 API 범위에 포함하지 않는다.
- 구현 시 static route인 `export/xlsx`가 `:productId` path보다 먼저 매칭되도록 route 선언 순서를 주의한다.

## 13. 검증 기준

- 필터가 없으면 현재 사용자의 전체 제품이 xlsx에 포함된다.
- `productName` 필터가 있으면 해당 검색어 조건에 맞는 제품만 포함된다.
- `productCategoryId`, `productStatusId` 필터가 있으면 해당 조건에 맞는 제품만 포함된다.
- `productName`, `productCategoryId`, `productStatusId`가 함께 있으면 세 조건을 모두 만족하는 제품만 포함된다.
- `sort`는 목록 API와 같은 기준으로 적용된다.
- xlsx 컬럼명은 `제품명`, `카테고리`, `상태`, `딜 수`, `등록일`이다.
- id 계열 값과 제품 가격은 xlsx에 포함되지 않는다.
- 기본 정렬은 `createdAt DESC`, `id DESC` 기준이다.
- 다른 사용자의 제품, 카테고리, 상태가 섞이지 않는다.
