# /goal G10 BE Product List Deal Count Sort

## /goal 입력문

아래 문서를 먼저 읽고, 제품 목록 페이지네이션 API에 제품별 딜 수 `dealCount`와 `딜 높은순`, `딜 낮은순` 정렬을 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_LIST_DEAL_COUNT_SORT_API.md`

## 목표

`GET /api/products` 응답의 `items[]`에 `dealCount: number`를 추가하고, query `sort=dealCountDesc|dealCountAsc`를 지원한다.

## 구현 범위

- `BE/src/modules/product/presentation/http/dto/product-request.dto.ts`
- `BE/src/modules/product/application/ports/product.repository.ts`
- `BE/src/modules/product/application/services/product-application.service.ts`
- `BE/src/modules/product/infrastructure/persistence/prisma-product.repository.ts`
- 필요 시 Product 정렬 enum, 응답 타입 또는 mapper
- controller/application 테스트
- 관련 API 계약 문서 상태 갱신

## 비즈니스 규칙

- 기존 검색/필터/page 동작은 유지한다.
- `dealCount`는 `DealProduct.productId = Product.id` 기준으로 계산한다.
- 현재 사용자 소유 `DealProduct`만 집계한다.
- `sort` 기본값은 `createdAtDesc`다.
- `sort=dealCountDesc`는 딜 수 DESC, `createdAt DESC`, `id DESC` 순서다.
- `sort=dealCountAsc`는 딜 수 ASC, `createdAt DESC`, `id DESC` 순서다.
- `totalCount`는 제품 개수 기준을 유지한다.

## 구현 제한

- 제품 단건 상세 응답은 변경하지 않는다.
- 제품 export 변경은 G11에서 처리한다.
- 제품 연결 딜 목록 API는 G12에서 처리한다.
- Frontend 화면은 이 goal에서 변경하지 않는다.
- N+1 count 쿼리를 만들지 않는다.

## 검증

필수 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

동작 검증:

- 딜에 포함되지 않은 제품은 `dealCount: 0`을 반환한다.
- 딜에 포함된 제품은 실제 연결 딜 수를 반환한다.
- `sort=dealCountDesc`에서 딜 수가 큰 제품이 먼저 나온다.
- `sort=dealCountAsc`에서 딜 수가 작은 제품이 먼저 나온다.
- 딜 수 동률이면 `createdAt DESC`, `id DESC` 기준이다.
- 검색/필터/정렬이 함께 적용된다.
- 다른 사용자의 딜 연결 수가 섞이지 않는다.

## 완료 보고

- 변경한 파일
- 응답 shape와 sort query 변경 내용
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
