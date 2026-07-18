# Product Schema

## 1. 현재 상태

이 문서는 제품(Product) 도메인의 현재 구현 데이터베이스 구조를 설명한다.

현재 Product 도메인은 `BE/prisma/schema.prisma`와 `BE/prisma/migrations/20260611020000_add_product_domain/migration.sql`에 반영되어 있다. 딜-제품 다중 연결 관계는 Deal 도메인 migration `20260612010000_add_deal_product_join`에서 `DealProduct`로 추가되었다.

구현 기준 문서:

- `TODO/DONE/PRODUCT_DOMAIN_PLAN/README.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260611020000_add_product_domain/migration.sql`
- `BE/prisma/migrations/20260625010000_add_log_soft_delete_columns/migration.sql`
- `BE/prisma/migrations/20260625020000_add_core_entity_soft_delete_columns/migration.sql`

## 2. 테이블 목록

Product 기본 도메인 1차 구현 범위는 다음 테이블만 포함한다.

- `Product`
- `ProductCategory`
- `ProductStatus`
- `ProductMemoLog`
- `ProductUserPrivateMemoLog`

## 3. Product

사용자가 영업하는 제품의 기본 정보를 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 제품 ID |
| `userId` | uuid | 아니오 | 제품을 소유한 사용자 ID |
| `productName` | string | 아니오 | 제품명 |
| `productPrice` | int | 아니오 | 제품가격. 정수, 0 이상 |
| `productCategoryId` | uuid | 아니오 | 제품 카테고리 ID |
| `productStatusId` | uuid | 아니오 | 제품 상태 ID |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |
| `deletedAt` | timestamptz | 예 | 삭제 버튼을 누른 UTC 시각. `null`이면 활성 제품 |
| `deletedByUserId` | uuid | 예 | 삭제를 수행한 `User.id` |
| `trashExpiresAt` | timestamptz | 예 | 무료 복구 가능 기간 종료 시각. 현재 정책은 `deletedAt + 7일` |

관계:

- `Product.userId` -> `User.id`
- `Product.productCategoryId` -> `ProductCategory.id`
- `Product.productStatusId` -> `ProductStatus.id`
- `Product` 1:N `ProductMemoLog`
- `Product` 1:N `ProductUserPrivateMemoLog`
- `Product` 1:N `DealProduct`
- `Product` 1:N `MeetingNoteProduct`

목록 API 기준:

- 목록 API는 15개 단위 page-number pagination이며 `totalCount`, `totalPages`를 반환한다.
- `createdAt DESC`, `id DESC`로 정렬한다.
- 검색은 `productName`만 대상으로 한다.
- 필터는 `productCategoryId`, `productStatusId`만 제공한다.
- 목록 응답에는 `productPrice`, `updatedAt`을 포함하지 않는다.
- 제품 하나는 `DealProduct`를 통해 여러 딜에 포함될 수 있다.
- 제품 하나는 `MeetingNoteProduct`를 통해 여러 회의록 snapshot에 연결될 수 있다.
- 목록 응답에는 `DealProduct` 기준 `dealCount`를 포함한다.
- 목록 정렬은 기본 `createdAt DESC`, `id DESC`이며 `sort=dealCountDesc`일 때 `dealCount DESC`, `createdAt DESC`, `id DESC`, `sort=dealCountAsc`일 때 `dealCount ASC`, `createdAt DESC`, `id DESC`를 적용한다.

삭제 정책:

- 제품 삭제 API는 row를 실제 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- 일반 목록/상세/검색/옵션/export와 연결 딜 목록은 `deletedAt IS NULL` 제품만 대상으로 한다.

## 4. ProductCategory

사용자별 제품 카테고리 옵션을 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 제품 카테고리 ID |
| `userId` | uuid | 아니오 | 카테고리를 소유한 사용자 ID |
| `categoryName` | string | 아니오 | 제품 카테고리명 |
| `createdAt` | datetime | 아니오 | 생성일 |

정책:

- 같은 사용자 안에서 `categoryName`은 중복될 수 없다.
- 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 제품에 매핑된 카테고리는 삭제할 수 없다.
- 수정 API는 제공하지 않는다.

## 5. ProductStatus

사용자별 제품 상태 옵션을 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 제품 상태 ID |
| `userId` | uuid | 아니오 | 상태를 소유한 사용자 ID |
| `statusName` | string | 아니오 | 제품 상태명 |
| `createdAt` | datetime | 아니오 | 생성일 |

정책:

- 같은 사용자 안에서 `statusName`은 중복될 수 없다.
- 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 제품에 매핑된 상태는 삭제할 수 없다.
- 수정 API는 제공하지 않는다.

## 6. ProductMemoLog

제품에 대한 일반 메모 로그를 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 제품 일반 메모 로그 ID |
| `productId` | uuid | 아니오 | 제품 ID |
| `userId` | uuid | 아니오 | 작성자 사용자 ID |
| `memoType` | string | 아니오 | 메모 설명/유형 |
| `memo` | string | 아니오 | 메모 본문 |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |
| `deletedAt` | timestamptz | 예 | 삭제 버튼을 누른 UTC 시각. `null`이면 일반 화면에 노출되는 활성 로그 |
| `deletedByUserId` | uuid | 예 | 삭제를 실행한 내부 `User.id` |
| `trashExpiresAt` | timestamptz | 예 | 무료 복구 가능 기간 종료 시각. 현재 정책은 `deletedAt + 7일` |

정책:

- 제품 생성 요청의 `productMemo`가 있으면 같은 transaction에서 첫 `ProductMemoLog`를 만든다.
- 이때 `memoType`은 서버가 `초기 메모`로 저장한다.
- 독립적인 일반 메모 로그 생성 API는 `memoType`, `memo`를 필수로 받는다.
- 일반 메모 로그 수정 API는 `memoType`, `memo` 중 최소 1개를 수정할 수 있다.
- 목록 조회는 10개 단위 cursor 기반 무한스크롤로 제공한다.
- 삭제 API는 row를 실제 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- 일반 조회와 수정은 `deletedAt IS NULL`인 로그만 대상으로 한다.

## 7. ProductUserPrivateMemoLog

제품에 대한 사용자 개인 비밀 메모 로그를 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 제품 개인 비밀 메모 로그 ID |
| `productId` | uuid | 아니오 | 제품 ID |
| `userId` | uuid | 아니오 | 작성자 사용자 ID |
| `memoCiphertext` | string | 아니오 | 암호화된 메모 본문 |
| `memoKeyVersion` | string | 아니오 | 암호화 키 버전 |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |
| `deletedAt` | timestamptz | 예 | 삭제 버튼을 누른 UTC 시각. `null`이면 일반 화면에 노출되는 활성 로그 |
| `deletedByUserId` | uuid | 예 | 삭제를 실행한 내부 `User.id` |
| `trashExpiresAt` | timestamptz | 예 | 무료 복구 가능 기간 종료 시각. 현재 정책은 `deletedAt + 7일` |

정책:

- API 요청과 응답에서는 평문 필드명을 `memo`로 사용한다.
- DB에는 `memoCiphertext`, `memoKeyVersion`만 저장한다.
- 목록 응답은 작성자 본인의 로그만 복호화해서 반환한다.
- 관리자도 개인 비밀 메모 원문을 볼 수 없다.
- 목록 조회는 10개 단위 cursor 기반 무한스크롤로 제공한다.
- 삭제 API는 row를 실제 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- 일반 조회와 수정은 `deletedAt IS NULL`인 로그만 대상으로 한다.
- 삭제 로그도 암호문은 변경하지 않는다. 복구/유료 복구 정책을 위해 원문 복구 가능성을 유지한다.

## 8. 권장 인덱스

- `Product.userId + Product.createdAt`
- `Product.userId + Product.productName`
- `Product.userId + Product.productCategoryId`
- `Product.userId + Product.productStatusId`
- `Product.userId + Product.deletedAt`
- `Product.userId + Product.trashExpiresAt`
- `ProductCategory.userId + ProductCategory.categoryName`
- `ProductStatus.userId + ProductStatus.statusName`
- `ProductMemoLog.productId + ProductMemoLog.createdAt`
- `ProductMemoLog.userId + ProductMemoLog.productId`
- `ProductMemoLog.userId + ProductMemoLog.deletedAt`
- `ProductMemoLog.userId + ProductMemoLog.trashExpiresAt`
- `ProductUserPrivateMemoLog.productId + ProductUserPrivateMemoLog.createdAt`
- `ProductUserPrivateMemoLog.userId + ProductUserPrivateMemoLog.productId`
- `ProductUserPrivateMemoLog.userId + ProductUserPrivateMemoLog.deletedAt`
- `ProductUserPrivateMemoLog.userId + ProductUserPrivateMemoLog.trashExpiresAt`
- `DealProduct.userId + DealProduct.productId`

## 9. 현재 제외 범위

다음 테이블과 필드는 Product 기본 도메인 1차 구현에 포함하지 않는다.

- `ProductConnection`
- `ProductLog`
- `ProductMemo`
- `PersonalMemo(targetType=PRODUCT)`
- 제품 본문 row의 복구/영구삭제 API와 `permanentDeleteAt`
- `unitPrice`
- `currency`
- `description`
- `metadata`

참고:

- `DealProduct`는 Product 기본 도메인의 독립 기능이 아니라 Deal 도메인의 딜-제품 N:M 연결 테이블이다.
- `ProductConnection`은 회사/담당자와 제품의 후속 확장 연결 후보로 남기며, 현재 딜-제품 연결에는 사용하지 않는다.

## 10. 관련 문서

- `AGENT/PM_AGENT/DECISIONS/025_product_domain_basic_scope.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
