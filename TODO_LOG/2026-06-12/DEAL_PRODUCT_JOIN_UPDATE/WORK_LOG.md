# Deal Product Join Update Work Log

## 1. 작업명

Deal-Product N:M 관계 변경

## 2. 작업 일자

2026-06-12

## 3. 요청

- 회사-담당자 관계는 `Company 1:N Contact`, `Contact N:1 Company`로 유지한다.
- 딜은 회사 1개, 담당자 1개에 연결된다.
- 딜 하나는 제품 여러 개를 포함할 수 있다.
- 제품 하나는 여러 딜에 포함될 수 있다.
- 기존 Deal 단일 `productId` 구조를 중간 테이블 구조로 변경한다.

## 4. 변경

- Prisma schema에 `DealProduct` 중간 테이블을 추가했다.
- `Deal.productId` 단일 FK를 제거했다.
- `Product.deals` 직접 relation을 `Product.dealProducts` relation으로 변경했다.
- `Deal.dealProducts` relation을 추가했다.
- `20260612010000_add_deal_product_join` migration을 추가했다.
- 기존 `Deal.productId` 값은 migration에서 `DealProduct`로 backfill한 뒤 컬럼을 제거한다.
- `POST /api/deals` body를 `productId`에서 `productIds` 배열로 변경했다.
- `PATCH /api/deals/:dealId` body에 선택적 `productIds` 배열을 추가했다.
- `GET /api/deals/:dealId` 상세 응답을 `product` 단건에서 `products` 배열로 변경했다.
- 딜 생성/수정 시 `contact.companyId === companyId`를 검증하도록 변경했다.
- `productIds`는 최소 1개 이상이며 중복을 허용하지 않는다.
- AGENT DB schema, PM data model, Deal API/TODO/goal 문서를 새 관계 기준으로 갱신했다.

## 5. 검증

- `pnpm prisma validate` 통과
- `pnpm prisma generate` 통과
- `pnpm run typecheck` 통과
- `pnpm test -- --runInBand` 통과, 6 suites / 17 tests
- `pnpm run lint` 통과
- `pnpm run build` 통과
- `git diff --check` 통과
- 임시 clean schema `codex_deal_join_verify_*`에 migration 5개 적용 성공
- 임시 clean schema에서 `DealProduct` 테이블, `Deal.productId` 컬럼 제거, `DealProduct_dealId_productId_key` unique index 확인 후 schema 삭제

## 6. 남은 확인

- local public DB는 기존 migration drift가 있으므로 public schema 직접 적용은 별도 정리 후 진행한다.
- Frontend `G02-FE-DEAL-PAGES`에서는 생성/수정 form을 `productIds` 다중 선택으로 구현해야 한다.
