# Product List Deal Count Sort API Spec

## 1. 목적

제품 목록 페이지네이션 API 응답에 제품별 연결 딜 수 `dealCount`를 추가하고, 정렬 조건에 딜 높은순과 딜 낮은순을 추가한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`

## 2. 계약 상태

- API: `GET /api/products`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 기존 응답 item에 필수 숫자 필드 추가, 선택 query 추가
- 변경 대상 응답: `ProductListItemResponse`

## 3. 변경 요약

제품 목록의 각 item에 해당 제품이 포함된 딜 개수를 추가한다. 딜-제품 관계는 `DealProduct` 중간 테이블 기준으로 집계한다.

추가 필드:

```ts
dealCount: number
```

추가 query:

```ts
sort?: "createdAtDesc" | "dealCountDesc" | "dealCountAsc"
```

## 4. Request

- Request 이름: `ListProductsQuery`
- Method: `GET`
- Path: `/api/products`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `page` | number | 아니오 | 정수, 1 이상 | 1부터 시작. 기본값 1 |
| query | `productName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 제품명 부분 검색 |
| query | `productCategoryId` | string | 아니오 | UUID | 제품 카테고리 필터 |
| query | `productStatusId` | string | 아니오 | UUID | 제품 상태 필터 |
| query | `sort` | string | 아니오 | enum | 기본값 `createdAtDesc` |

정렬 enum:

| 값 | 의미 |
|---|---|
| `createdAtDesc` | 등록일 최신순. 기존 기본 정렬 |
| `dealCountDesc` | 연결 딜 높은순. 동률이면 `createdAt DESC`, `id DESC` |
| `dealCountAsc` | 연결 딜 낮은순. 동률이면 `createdAt DESC`, `id DESC` |

## 5. Response

- Response 이름: `ProductPageResponse`
- Status: `200 OK`
- Body: 있음

```json
{
  "items": [
    {
      "id": "product-id",
      "productName": "프리미엄 상품",
      "productCategory": {
        "id": "category-id",
        "categoryName": "보험"
      },
      "productStatus": {
        "id": "status-id",
        "statusName": "판매중"
      },
      "dealCount": 8,
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 100,
  "totalPages": 10
}
```

`ProductListItemResponse` 변경:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `dealCount` | number | 아니오 | 해당 제품이 포함된 딜 수 |

## 6. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. query 조건을 validation한다.
3. `Product.userId = currentUserId` 조건을 기본으로 적용한다.
4. 제품명/카테고리/상태 필터를 기존과 동일하게 적용한다.
5. `DealProduct.productId = Product.id`, `DealProduct.userId = currentUserId` 기준으로 연결 딜 수를 집계한다.
6. `sort=createdAtDesc`이면 기존처럼 `Product.createdAt DESC`, `Product.id DESC`로 정렬한다.
7. `sort=dealCountDesc`이면 연결 딜 수 DESC, `Product.createdAt DESC`, `Product.id DESC`로 정렬한다.
8. `sort=dealCountAsc`이면 연결 딜 수 ASC, `Product.createdAt DESC`, `Product.id DESC`로 정렬한다.
9. 10개 단위 페이지네이션을 적용한다.
9. 각 item에 `dealCount`를 포함해 반환한다.

## 7. 연결 DB 스키마

- 조회: `Product`, `ProductCategory`, `ProductStatus`, `DealProduct`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

관계 기준:

- `DealProduct.productId`는 `Product.id`를 참조한다.
- `DealProduct.dealId`는 `Deal.id`를 참조한다.
- `Product`, `DealProduct`, `Deal`은 모두 현재 사용자 `userId` 기준으로 분리된다.

## 8. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음
- audit log 포함: 없음

## 9. Observability

- event key: `product.listed`
- audit log: 없음
- request id: 사용
- redaction: 제품명 검색어 원문, 메모 원문 logging 금지
- log context 권장값: `userId`, `filterKeys`, `sort`, `page`, `itemCount`

## 10. Error

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | refresh 또는 로그인 이동 | warn |
| 잘못된 page, UUID, sort | `ValidationError` | 400 | 목록 오류 상태 | log |
| 본인 소유가 아닌 카테고리 ID | `ProductCategoryNotFound` | 404 | 필터 초기화 또는 오류 표시 | log |
| 본인 소유가 아닌 상태 ID | `ProductStatusNotFound` | 404 | 필터 초기화 또는 오류 표시 | log |

## 11. FE/BE 처리 기준

FE:

- 제품 목록 item에서 `dealCount`를 `딜 수`로 표시한다.
- 정렬 UI에 `딜 높은순`, `딜 낮은순`을 추가하고 각각 `sort=dealCountDesc`, `sort=dealCountAsc`를 보낸다.
- 검색/필터/정렬 변경 시 page를 1로 초기화한다.

BE:

- `dealCount` 계산이 N+1이 되지 않도록 group by 또는 relation count 집계를 사용한다.
- `dealCountDesc`, `dealCountAsc` 정렬은 count 집계 결과와 안정적인 보조 정렬을 함께 적용한다.
- 다른 사용자의 `DealProduct`가 집계에 섞이지 않도록 `userId` 조건을 유지한다.

## 12. 검증 기준

- 딜에 포함되지 않은 제품은 `dealCount: 0`을 반환한다.
- 딜에 포함된 제품은 실제 연결 딜 수를 반환한다.
- `sort=dealCountDesc`에서 딜 수가 큰 제품이 먼저 나온다.
- `sort=dealCountAsc`에서 딜 수가 작은 제품이 먼저 나온다.
- 동률이면 `createdAt DESC`, `id DESC` 기준으로 안정적으로 정렬된다.
- 검색/필터 조건과 정렬이 함께 적용된다.
