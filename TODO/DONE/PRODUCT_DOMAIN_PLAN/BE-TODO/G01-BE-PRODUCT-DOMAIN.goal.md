# /goal G01 BE Product Domain

## /goal 입력문

아래 문서를 먼저 읽고, 사용자 페이지 제품(Product) 도메인 백엔드 구현을 완료해줘.

필수 문서:
- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/README.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`

현재 코드 확인:
- `BE/ARCHITECTURE.md`
- `BE/prisma/schema.prisma`
- `BE/src/modules/**`
- `BE/src/common/**`
- `BE/src/generated/prisma/**`
- `BE/.env.example`

## 목표

사용자 페이지 제품(Product) 도메인의 DB 스키마, Prisma 마이그레이션, API, 비즈니스 로직, 관측성 로그, API 계약 문서를 구현한다.

제품은 사용자가 영업하는 상품이다. `상품`, `제품`, `Product`는 같은 의미이며, UI 문구는 `제품`, 코드/DB/API 도메인명은 `Product`를 사용한다.

## 구현 범위

### 1. DB 스키마

다음 모델을 추가하거나 현재 코드 구조에 맞게 정리한다.

- `Product`
- `ProductCategory`
- `ProductStatus`
- `ProductMemoLog`
- `ProductUserPrivateMemoLog`

필드 기준:
- `Product.id`: uuid
- `Product.userId`: uuid FK
- `Product.productName`: string, 필수
- `Product.productPrice`: int, 필수
- `Product.productCategoryId`: uuid FK
- `Product.productStatusId`: uuid FK
- `Product.createdAt`: 생성일
- `Product.updatedAt`: 수정일
- `ProductCategory.id`: uuid
- `ProductCategory.userId`: uuid FK
- `ProductCategory.categoryName`: string
- `ProductCategory.createdAt`: 생성일
- `ProductStatus.id`: uuid
- `ProductStatus.userId`: uuid FK
- `ProductStatus.statusName`: string
- `ProductStatus.createdAt`: 생성일
- `ProductMemoLog.id`: uuid
- `ProductMemoLog.productId`: uuid FK
- `ProductMemoLog.userId`: uuid FK
- `ProductMemoLog.memoType`: string
- `ProductMemoLog.memo`: string
- `ProductMemoLog.createdAt`: 생성일
- `ProductMemoLog.updatedAt`: 수정일
- `ProductUserPrivateMemoLog.id`: uuid
- `ProductUserPrivateMemoLog.productId`: uuid FK
- `ProductUserPrivateMemoLog.userId`: uuid FK
- `ProductUserPrivateMemoLog.memoCiphertext`: string
- `ProductUserPrivateMemoLog.memoKeyVersion`: string
- `ProductUserPrivateMemoLog.createdAt`: 생성일
- `ProductUserPrivateMemoLog.updatedAt`: 수정일

권장 인덱스:
- `Product.userId + Product.createdAt`
- `Product.userId + Product.productName`
- `Product.userId + Product.productCategoryId`
- `Product.userId + Product.productStatusId`
- `ProductCategory.userId + ProductCategory.categoryName`
- `ProductStatus.userId + ProductStatus.statusName`
- `ProductMemoLog.productId + ProductMemoLog.createdAt`
- `ProductUserPrivateMemoLog.productId + ProductUserPrivateMemoLog.createdAt`

### 2. API 구현

`TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`를 기준으로 아래 API를 구현한다.

- `GET /api/products`
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

### 3. 비즈니스 규칙

- 모든 API는 인증된 `userId` 소유 데이터만 접근한다.
- 제품 목록 검색은 `productName`만 대상으로 한다.
- 제품 목록 필터는 `productCategoryId`, `productStatusId`만 지원한다.
- 제품 목록 페이지 크기 기본값은 10개다.
- 제품 목록은 `createdAt DESC`로 정렬한다.
- 제품 목록 응답에는 `productPrice`, `updatedAt`을 포함하지 않는다.
- 필터 옵션 API는 드롭다운 선택에 필요한 `id`와 표시명을 반환한다.
- 제품 생성/수정 시 `productPrice`는 정수, 0 이상만 허용한다.
- `productCategoryId`, `productStatusId`는 해당 사용자의 데이터인지 검증한다.
- 제품 생성 시 `productMemo`가 있으면 같은 트랜잭션에서 `ProductMemoLog`를 생성한다.
- 제품 생성 시 `productMemo`가 없으면 `ProductMemoLog`를 생성하지 않는다.
- 제품 생성 시 초기 일반 메모의 `memoType`은 `"초기 메모"`로 저장한다.
- 제품 일반 메모 수정 API는 `memoType`, `memo` 중 최소 1개를 수정할 수 있어야 한다.
- 제품 개인 비밀 메모는 평문을 DB에 저장하지 않는다.
- 제품 개인 비밀 메모 목록 응답은 복호화된 `memo`를 반환한다.
- 제품 카테고리/상태 삭제는 사용 중이면 `409 Conflict`를 반환한다.
- 본 작업에 제품 삭제/복구/영구삭제 API를 만들지 않는다.
- 본 작업에 `ProductConnection`, `ProductLog`, `PersonalMemo(targetType=PRODUCT)`를 만들지 않는다.

### 4. 아키텍처 규칙

- 기존 백엔드의 모듈, 컨트롤러, 서비스, 저장소, DTO 패턴을 따른다.
- 컨트롤러는 인증/요청 매핑을 담당하고, 비즈니스 로직은 application service 계층에 둔다.
- 저장소는 DB 접근만 담당한다.
- API별 주석을 컨트롤러 엔드포인트 위에 작성한다.
- API 내부 단계는 `// 1.`, `// 2.`, `// 3.` 형식으로 작성한다.
- API 내부 기능 메서드는 `// 기능 : ...` 주석을 작성한다.
- 모든 클래스와 인터페이스에는 `// 역할 : ...` 주석을 작성한다.
- 트랜잭션 경계는 service 계층에서 명확하게 보이도록 작성한다.
- 주요 생성/수정/삭제/비밀 메모 작업에는 구조화 로그를 남긴다.
- 로그에는 비밀 메모 평문, 암호문, 민감한 입력값을 남기지 않는다.

### 5. 개인 비밀 메모 암호화

- Company/Contact 개인 비밀 메모 구현 패턴을 따른다.
- `.env.example`에 `PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY`, `PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION`을 추가한다.
- 공통 `ENCRYPTION_MASTER_KEY`, `ENCRYPTION_KEY_VERSION` fallback이 이미 있으면 기존 패턴과 일관되게 사용한다.
- 비밀 메모 원문은 API DTO와 복호화 응답에서만 다루고 DB에는 저장하지 않는다.

### 6. API 계약 문서와 AGENT 문서

백엔드 구현 후 실제 코드와 맞도록 아래 문서를 업데이트한다.

- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- 필요 시 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `BE/README.md`
- `BE/ARCHITECTURE.md`
- 필요 시 `BE/restdoc/product-domain.http`

## 완료 체크리스트

- [x] DB 모델과 관계가 구현되어 있다.
- [x] Prisma migration이 생성되어 있다.
- [x] 모든 Product API가 구현되어 있다.
- [x] 제품 목록 검색은 `productName`만 대상으로 한다.
- [x] 제품 생성 + 선택적 초기 메모 생성이 한 트랜잭션으로 처리된다.
- [x] 개인 비밀 메모는 암호화 저장되고 응답에서만 복호화된다.
- [x] 일반 메모 수정에서 `memoType`과 `memo` 중 최소 1개를 수정할 수 있다.
- [x] 개인 비밀 메모 수정 API가 존재한다.
- [x] 카테고리/상태 삭제 시 사용 중이면 `409 Conflict`를 반환한다.
- [x] API별 주석, 기능 주석, 클래스/인터페이스 역할 주석이 반영되어 있다.
- [x] 관측성 로그가 민감정보 없이 작성되어 있다.
- [x] API 계약 문서가 실제 구현과 일치한다.
- [x] AGENT/BE 문서가 Product 구현 상태와 일치한다.
- [x] 아래 검증 명령을 실행하고 결과를 보고했다.

## 검증 명령

프로젝트 스크립트 이름은 현재 `BE/package.json`을 기준으로 확인한 뒤 실행한다.

권장 검증:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c\BE
pnpm.cmd run prisma:validate
pnpm.cmd run prisma:generate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test
pnpm.cmd run build
```

문서/계약 확인:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c
rg -n "unitPrice|currency|description|initialMemo|ProductConnection|ProductLog|DELETE /api/products|restore|permanentDeleteAt" BE TODO/DONE/PRODUCT_DOMAIN_PLAN AGENT/SOFTWARE_AGENT
rg -n "API :|기능 :|역할" BE/src/modules/product
git diff --check
```

## 제외 범위

- 프론트엔드 구현
- 관리자 페이지 구현
- 제품 삭제/복구/영구삭제
- 제품 휴지통 또는 soft delete
- 제품 카테고리/상태 수정 API
- ProductConnection
- ProductLog
- 딜 생성 중 제품 inline creation 연동
- 범용 Import/Export/OCR 연동
- ExportJob 기반 비동기 내보내기

## 후속 추가 구현

이 기본 goal 완료 이후 `TODO/DONE/ADDITIONAL_WORK_PLAN`에서 `GET /api/products/export/xlsx`가 추가 구현됐다.

따라서 현재 FE 작업자는 제품 목록 내보내기 버튼에서 현재 검색어와 필터를 export API에 전달하고, `page`는 전달하지 않는다. 범용 Import/Export 화면, ExportJob, OCR 연동은 여전히 범위 밖이다.
- 비밀 메모 평문 저장
