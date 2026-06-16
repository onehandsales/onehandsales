# Product Export Deal Count API Spec

## 1. 목적

제품 xlsx 내보내기 API에 제품별 연결 딜 수 `dealCount` 컬럼을 추가한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_XLSX_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_LIST_DEAL_COUNT_SORT_API.md`

## 2. 계약 상태

- API: `GET /api/products/export/xlsx`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 기존 xlsx 파일에 컬럼 추가, 선택 query 추가 가능
- 응답 형식: xlsx binary file

## 3. 변경 요약

제품 목록 export 파일에 `딜 수` 컬럼을 추가한다. 제품 목록에 `sort=dealCountDesc|dealCountAsc`가 추가되므로 export도 목록과 같은 정렬 조건을 반영할 수 있다.

## 4. Request

- Request 이름: `ExportProductsXlsxRequest`
- Method: `GET`
- Path: `/api/products/export/xlsx`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `productName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 제품명 부분 검색 |
| query | `productCategoryId` | string | 아니오 | UUID | 제품 카테고리 필터 |
| query | `productStatusId` | string | 아니오 | UUID | 제품 상태 필터 |
| query | `sort` | string | 아니오 | `createdAtDesc`, `dealCountDesc`, `dealCountAsc` | 목록 정렬 조건. 기본값 `createdAtDesc` |
| query | `page` | 없음 | 아니오 | 전송하지 않음 | export는 페이지네이션을 적용하지 않음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

## 5. Response

- Response 이름: `ProductExportXlsxFile`
- Status: `200 OK`
- Body: xlsx binary

파일 컬럼:

| 컬럼명 | 값 기준 | 설명 |
|---|---|---|
| `제품명` | `Product.productName` | 제품명 |
| `카테고리` | `ProductCategory.categoryName` | 제품 카테고리명 |
| `상태` | `ProductStatus.statusName` | 제품 상태명 |
| `딜 수` | `DealProduct` count | 해당 제품이 포함된 딜 수 |
| `등록일` | `Product.createdAt` | `yyyy-mm-dd` 표시 형식 |

파일에 포함하지 않는 값:

- `Product.id`
- 내부 userId
- `Product.productPrice`
- 메모 원문
- 개인 비밀 메모 원문 또는 암호문

## 6. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. export query를 validation한다.
3. 카테고리/상태 필터가 있으면 현재 사용자 소유인지 확인한다.
4. 기존 제품 목록과 같은 검색어와 필터 조건을 구성한다.
5. 페이지네이션 없이 현재 사용자 제품 전체를 조회한다.
6. `DealProduct` 기준으로 제품별 연결 딜 수를 집계한다.
7. `sort=createdAtDesc`이면 `createdAt DESC`, `id DESC`로 정렬한다.
8. `sort=dealCountDesc`이면 `dealCount DESC`, `createdAt DESC`, `id DESC`로 정렬한다.
9. `sort=dealCountAsc`이면 `dealCount ASC`, `createdAt DESC`, `id DESC`로 정렬한다.
10. xlsx row에 `딜 수`를 포함한다.
11. xlsx binary와 다운로드 header를 반환한다.

## 7. 연결 DB 스키마

- 조회: `Product`, `ProductCategory`, `ProductStatus`, `DealProduct`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

## 8. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 파일 생성 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음
- audit log 포함: 없음

## 9. Observability

- event key: `product.exported`
- audit log: 없음
- request id: 사용
- redaction: 제품명 검색어, 메모 원문, 개인 비밀 메모 원문 logging 금지
- log context 권장값: `userId`, `filterKeys`, `sort`, `rowCount`

## 10. Error

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | refresh 또는 로그인 이동 | warn |
| 잘못된 UUID 또는 sort query | `ValidationError` | 400 | 내보내기 실패 안내 | log |
| 본인 소유가 아닌 카테고리 ID | `ProductCategoryNotFound` | 404 | 필터 초기화 또는 실패 안내 | log |
| 본인 소유가 아닌 상태 ID | `ProductStatusNotFound` | 404 | 필터 초기화 또는 실패 안내 | log |
| xlsx 생성 실패 | `ProductExportFailed` | 500 | 내보내기 실패 안내 | error |

## 11. FE/BE 처리 기준

FE:

- 제품 목록의 현재 검색어, 필터, 정렬 조건을 export API에 전달한다.
- `page`는 전달하지 않는다.
- 응답은 blob으로 처리하고 `Content-Disposition` 파일명을 우선 사용한다.

BE:

- JSON 제품 목록과 같은 필터/정렬 기준을 적용한다.
- `dealCount`는 현재 사용자 소유 `DealProduct`만 집계한다.
- static route `export/xlsx`가 `:productId`보다 먼저 매칭되도록 유지한다.

## 12. 검증 기준

- 각 row의 `딜 수`가 실제 제품 연결 딜 수와 일치한다.
- `sort=dealCountDesc`일 때 딜 수가 큰 제품이 먼저 나온다.
- `sort=dealCountAsc`일 때 딜 수가 작은 제품이 먼저 나온다.
- 검색/필터/정렬 조건이 함께 적용된다.
- 다른 사용자의 딜 연결 수가 섞이지 않는다.
