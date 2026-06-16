# /goal G01 FE Deal Count And Linked Deal Lists

## /goal 입력문

아래 문서를 먼저 읽고, User Web의 회사/담당자/제품 화면에 새 딜 count와 연결 딜 목록 API를 반영해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_DEAL_COUNT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_EXPORT_DEAL_COUNT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_DEAL_LIST_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_DEAL_LIST_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_LIST_DEAL_COUNT_SORT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_DEAL_COUNT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_DEAL_LIST_API.md`
- `FE/user-web/src/features/company/**`
- `FE/user-web/src/features/contact/**`
- `FE/user-web/src/features/product/**`
- `FE/user-web/src/features/deal/**`
- `FE/user-web/src/lib/api-client.ts`

## 목표

Backend 추가 API가 구현된 뒤 User Web에서 회사/담당자/제품 화면에 연결 딜 정보를 표시한다.

## 선행 조건

아래 Backend goal이 구현되어 있어야 한다.

- `G06-BE-COMPANY-LIST-DEAL-COUNT`
- `G07-BE-COMPANY-EXPORT-DEAL-COUNT`
- `G08-BE-COMPANY-DEAL-LIST`
- `G09-BE-CONTACT-DEAL-LIST`
- `G10-BE-PRODUCT-LIST-DEAL-COUNT-SORT`
- `G11-BE-PRODUCT-EXPORT-DEAL-COUNT`
- `G12-BE-PRODUCT-DEAL-LIST`

## 구현 범위

### 1. 회사 목록

- `CompanyListItem` 타입에 `dealCount: number`를 추가한다.
- 회사 목록 UI에 `딜 수`를 표시한다.
- 기존 `담당자 수` 표시가 있으면 함께 유지한다.
- 회사 목록 export 다운로드는 변경된 xlsx 컬럼을 별도 파싱하지 않고 기존 blob 다운로드 흐름을 유지한다.

### 2. 회사 상세

- `GET /api/companies/:companyId/deals` API client, query key, hook을 추가한다.
- 회사 상세 화면에 연결 딜 목록을 표시한다.
- 표시 필드: 딜 이름, 딜 금액, 등록일
- item 클릭 시 `/deals/:dealId`로 이동할 수 있게 한다.
- 연결 딜이 없으면 빈 상태를 표시한다.
- 페이지네이션은 만들지 않는다.

### 3. 담당자 상세

- `GET /api/contacts/:contactId/deals` API client, query key, hook을 추가한다.
- 담당자 상세 화면에 연결 딜 목록을 표시한다.
- 표시 필드: 딜 이름, 딜 금액, 등록일
- item 클릭 시 `/deals/:dealId`로 이동할 수 있게 한다.
- 연결 딜이 없으면 빈 상태를 표시한다.
- 페이지네이션은 만들지 않는다.

### 4. 제품 목록

- Product 목록 타입에 `dealCount: number`를 추가한다.
- 제품 목록 UI에 `딜 수`를 표시한다.
- 제품 목록 정렬 UI에 `딜 높은순`, `딜 낮은순`을 추가한다.
- `딜 높은순` 선택 시 `GET /api/products?sort=dealCountDesc`, `딜 낮은순` 선택 시 `GET /api/products?sort=dealCountAsc`를 호출한다.
- 검색/필터/정렬 변경 시 page를 1로 초기화한다.
- 제품 export는 현재 검색어, 필터, 정렬 조건을 전달하고 `page`는 제거한다.

### 5. 제품 상세

- `GET /api/products/:productId/deals` API client, query key, hook을 추가한다.
- 제품 상세 화면에 연결 딜 목록을 표시한다.
- 표시 필드: 딜 이름, 딜 금액, 딜 상태, 등록일
- `dealStatus`는 현재 DealStatus label mapper로 표시한다.
- item 클릭 시 `/deals/:dealId`로 이동할 수 있게 한다.
- 연결 딜이 없으면 빈 상태를 표시한다.
- 페이지네이션은 만들지 않는다.

## 구현 제한

- Backend 코드는 이 goal에서 수정하지 않는다.
- Admin Web은 이 goal 범위가 아니다.
- 회사/담당자/제품의 기존 생성/수정/메모 동작을 변경하지 않는다.
- 딜 생성/수정 API stale contract 정렬은 이 goal 범위가 아니다. 단, 타입 충돌이 생기면 필요한 최소 보정만 한다.
- 제품 화면이 아직 구 API 계약이면 `PRODUCT_DOMAIN_PLAN/FE-TODO/G01-FE-PRODUCT-PAGES.goal.md`와 충돌하지 않게 새 Backend 계약 기준으로 정렬한다.

## 검증

권장 검증:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

동작 검증:

- 회사 목록에서 `딜 수`가 표시된다.
- 회사 상세에서 연결 딜 목록이 `createdAt DESC` 순서로 보인다.
- 담당자 상세에서 연결 딜 목록이 `createdAt DESC` 순서로 보인다.
- 제품 목록에서 `딜 수`가 표시된다.
- 제품 목록에서 `딜 높은순` 정렬을 선택하면 `sort=dealCountDesc`, `딜 낮은순` 정렬을 선택하면 `sort=dealCountAsc`가 전달된다.
- 제품 상세에서 연결 딜 목록과 딜 상태가 표시된다.
- 연결 딜이 없는 경우 빈 상태가 표시된다.
- export 요청에는 `page`가 포함되지 않는다.

## 완료 보고

- 수정한 파일
- 추가한 API client/hook/query key
- 변경한 화면과 표시 필드
- 실행한 검증 명령과 결과
- 수동 검증하지 못한 항목과 이유
