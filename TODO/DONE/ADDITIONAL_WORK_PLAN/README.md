# Additional Work Plan

## 1. 목적

이 계획은 기존 활성 계획에 속하지 않는 추가 유지보수 요청을 `AGENT` 정본 기준에 맞춰 실행 가능한 TODO로 정리한다.

단순 메모가 아니라, 구현 전에 필요한 공통 계약, Backend 작업 범위, Frontend 영향 여부를 분리해 관리한다.

## 2. 필수 선행 정본

이 계획의 문서를 작성하거나 수정할 때는 아래 문서를 먼저 참고한다.

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`

## 3. 문서 구조

```text
TODO/DONE/ADDITIONAL_WORK_PLAN/
  README.md
  COMMON/
    README.md
    API-SPEC/
      COMPANY_LIST_CONTACT_COUNT_API.md
      COMPANY_CONTACT_LIST_API.md
      COMPANY_EXPORT_XLSX_API.md
      CONTACT_EXPORT_XLSX_API.md
      PRODUCT_EXPORT_XLSX_API.md
      COMPANY_LIST_DEAL_COUNT_API.md
      COMPANY_EXPORT_DEAL_COUNT_API.md
      COMPANY_DEAL_LIST_API.md
      CONTACT_DEAL_LIST_API.md
      PRODUCT_LIST_DEAL_COUNT_SORT_API.md
      PRODUCT_EXPORT_DEAL_COUNT_API.md
      PRODUCT_DEAL_LIST_API.md
  BE-TODO/
    README.md
    G01-BE-COMPANY-LIST-CONTACT-COUNT.goal.md
    G02-BE-COMPANY-CONTACT-LIST.goal.md
    G03-BE-COMPANY-EXPORT-XLSX.goal.md
    G04-BE-CONTACT-EXPORT-XLSX.goal.md
    G05-BE-PRODUCT-EXPORT-XLSX.goal.md
    G06-BE-COMPANY-LIST-DEAL-COUNT.goal.md
    G07-BE-COMPANY-EXPORT-DEAL-COUNT.goal.md
    G08-BE-COMPANY-DEAL-LIST.goal.md
    G09-BE-CONTACT-DEAL-LIST.goal.md
    G10-BE-PRODUCT-LIST-DEAL-COUNT-SORT.goal.md
    G11-BE-PRODUCT-EXPORT-DEAL-COUNT.goal.md
    G12-BE-PRODUCT-DEAL-LIST.goal.md
  FE-TODO/
    README.md
    G01-FE-DEAL-COUNT-LINKED-DEAL-LISTS.goal.md
```

## 4. 진행 상태

- ADD-001 Company 목록 응답에 담당자 수 추가: 구현 완료
- ADD-002 회사 단건 페이지용 연결 Contact 전체 목록 API 추가: 구현 완료
- ADD-003 회사 목록 필터 기준 xlsx 내보내기 API 추가: 구현 완료
- ADD-004 담당자 목록 필터 기준 xlsx 내보내기 API 추가: 구현 완료
- ADD-005 제품 목록 필터 기준 xlsx 내보내기 API 추가: 구현 완료
- ADD-006 회사 목록 응답에 `dealCount` 추가: 구현 완료
- ADD-007 회사 xlsx export에 `dealCount` 추가: 구현 완료
- ADD-008 회사 단건 상세용 연결 Deal 전체 목록 API 추가: 구현 완료
- ADD-009 담당자 단건 상세용 연결 Deal 전체 목록 API 추가: 구현 완료
- ADD-010 제품 목록 응답에 `dealCount` 추가와 딜 높은순/딜 낮은순 정렬 추가: 구현 완료
- ADD-011 제품 xlsx export에 `dealCount` 추가: 구현 완료
- ADD-012 제품 단건 상세용 연결 Deal 전체 목록 API 추가: 구현 완료
- Frontend 반영: 구현 완료. User Web 회사/담당자/제품 화면에 ADD-001~012의 count, export, 연결 목록 요구사항을 반영했다.
- Frontend 완료 확인일: 2026-06-14
- Frontend 검증: `FE/user-web` typecheck/lint/build 통과

## 5. 실행 순서

1. `AGENT` 정본과 기존 Company/Contact/Product/Deal API 계약을 확인한다.
2. `COMMON/API-SPEC`에서 추가 응답 필드와 호환성 기준을 확정한다.
3. Backend 작업은 `BE-TODO` goal 기준으로 G06-G12까지 구현 완료 상태를 유지한다.
4. Frontend 표시 작업은 `FE-TODO/G01-FE-DEAL-COUNT-LINKED-DEAL-LISTS.goal.md` 기준으로 반영 완료 상태를 유지한다.
5. 후속 변경이 생기면 새 활성 계획을 만들고 관련 API 계약 문서와 TODO_LOG를 갱신한다.

## 6. 현재 범위

- `GET /api/companies` 목록 응답의 각 item에 `contactCount`를 추가했다.
- `GET /api/companies/:companyId/contacts` API를 추가해 회사에 연결된 Contact 전체 목록을 반환한다.
- `GET /api/companies/export/xlsx` API를 추가해 회사 목록 필터 조건에 맞는 전체 데이터를 xlsx로 내려준다.
- `GET /api/contacts/export/xlsx` API를 추가해 담당자 목록 필터 조건에 맞는 전체 데이터를 xlsx로 내려준다.
- `GET /api/products/export/xlsx` API를 추가해 제품 목록 필터 조건에 맞는 전체 데이터를 xlsx로 내려준다.
- `GET /api/companies` 응답에 회사별 `dealCount`를 추가한다.
- `GET /api/companies/export/xlsx` 파일에 `딜 수` 컬럼을 추가한다.
- `GET /api/companies/:companyId/deals` API를 추가해 회사에 연결된 Deal 전체 목록을 반환한다.
- `GET /api/contacts/:contactId/deals` API를 추가해 담당자에 연결된 Deal 전체 목록을 반환한다.
- `GET /api/products` 응답에 제품별 `dealCount`를 추가하고 `sort=dealCountDesc|dealCountAsc`를 지원한다.
- `GET /api/products/export/xlsx` 파일에 `딜 수` 컬럼을 추가한다.
- `GET /api/products/:productId/deals` API를 추가해 제품에 연결된 Deal 전체 목록을 반환한다.
- 모든 export API는 목록 페이지의 현재 검색어와 필터 조건을 함께 적용하고, `page`만 제외한다.
- `totalCount`, `totalPages`, 페이지네이션, 검색, 필터 동작은 기존과 동일하게 유지한다.

## 7. 현재 범위 밖

- `GET /api/companies/:companyId` 단건 응답 변경
- 기존 Contact 기본 상세 응답 변경
- 기존 Product 기본 상세 응답 변경
- 회사 연결 Contact 목록 페이지네이션
- 회사/담당자/제품 연결 Deal 목록 페이지네이션
- 범용 Import/Export 모듈 또는 ExportJob 구현
- Company 삭제, soft delete, 휴지통 기능

## 7.1. Frontend 반영 목적

이 계획의 Backend API 중 ADD-001~012는 구현 완료 상태다. Frontend 목적은 목록/상세 화면의 사용자 행동을 완성하는 것이다.

- 회사 목록: `contactCount`를 `담당자 수`로 표시해 사용자가 회사별 연결 담당자 규모를 목록에서 바로 비교하게 한다.
- 회사 목록: `dealCount`를 `딜 수`로 표시해 사용자가 회사별 영업 진행 규모를 목록에서 바로 비교하게 한다.
- 회사 단건: 연결 Contact 전체 목록을 보여 사용자가 회사 상세에서 관련 담당자를 빠르게 확인하게 한다.
- 회사 단건: 연결 Deal 전체 목록을 보여 사용자가 회사 상세에서 관련 딜을 빠르게 확인하게 한다.
- 담당자 단건: 연결 Deal 전체 목록을 보여 사용자가 담당자 기준 진행 딜을 확인하게 한다.
- 제품 목록: `dealCount`와 딜 높은순/딜 낮은순 정렬을 제공해 어떤 제품이 많이 제안/포함되는지 비교하게 한다.
- 제품 단건: 연결 Deal 전체 목록을 보여 사용자가 제품 기준 진행 딜을 확인하게 한다.
- 회사/담당자/제품 목록: 현재 검색어와 필터 기준으로 xlsx를 다운로드하게 한다.
- export UI: JSON 응답이 아니라 blob 다운로드로 처리하고, `page`를 제외한 현재 검색/필터 query만 전달한다.

## 8. 완료 기준

- 공통 API 계약이 작성되어 있다.
- Backend 구현 범위가 goal 문서로 분리되어 있다.
- `GET /api/companies` 응답의 `items[].contactCount`가 검증된다.
- `GET /api/companies/:companyId/contacts` 응답의 `items[]`가 검증된다.
- `GET /api/companies/export/xlsx`가 필터 조건에 맞는 xlsx 파일을 반환한다.
- `GET /api/contacts/export/xlsx`가 필터 조건에 맞는 xlsx 파일을 반환한다.
- `GET /api/products/export/xlsx`가 필터 조건에 맞는 xlsx 파일을 반환한다.
- `GET /api/companies` 응답의 `items[].dealCount`가 검증된다.
- `GET /api/companies/export/xlsx`가 `딜 수` 컬럼을 포함한다.
- `GET /api/companies/:companyId/deals` 응답의 `items[]`가 검증된다.
- `GET /api/contacts/:contactId/deals` 응답의 `items[]`가 검증된다.
- `GET /api/products` 응답의 `items[].dealCount`와 `sort=dealCountDesc|dealCountAsc`가 검증된다.
- `GET /api/products/export/xlsx`가 `딜 수` 컬럼을 포함한다.
- `GET /api/products/:productId/deals` 응답의 `items[]`가 검증된다.
- 기존 Company 목록 응답의 페이지네이션 의미가 유지된다.
