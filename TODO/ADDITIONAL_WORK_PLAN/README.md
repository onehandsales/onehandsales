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
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`

## 3. 문서 구조

```text
TODO/ADDITIONAL_WORK_PLAN/
  README.md
  COMMON/
    README.md
    API-SPEC/
      COMPANY_LIST_CONTACT_COUNT_API.md
      COMPANY_CONTACT_LIST_API.md
      COMPANY_EXPORT_XLSX_API.md
      CONTACT_EXPORT_XLSX_API.md
      PRODUCT_EXPORT_XLSX_API.md
  BE-TODO/
    README.md
    G01-BE-COMPANY-LIST-CONTACT-COUNT.goal.md
    G02-BE-COMPANY-CONTACT-LIST.goal.md
    G03-BE-COMPANY-EXPORT-XLSX.goal.md
    G04-BE-CONTACT-EXPORT-XLSX.goal.md
    G05-BE-PRODUCT-EXPORT-XLSX.goal.md
  FE-TODO/
    README.md
```

## 4. 진행 상태

- ADD-001 Company 목록 응답에 거래처 수 추가: 요청됨
- ADD-002 회사 단건 페이지용 연결 Contact 전체 목록 API 추가: 요청됨
- ADD-003 회사 목록 필터 기준 xlsx 내보내기 API 추가: 요청됨
- ADD-004 거래처 목록 필터 기준 xlsx 내보내기 API 추가: 요청됨
- ADD-005 제품 목록 필터 기준 xlsx 내보내기 API 추가: 요청됨

## 5. 실행 순서

1. `AGENT` 정본과 기존 Company/Contact API 계약을 확인한다.
2. `COMMON/API-SPEC`에서 추가 응답 필드와 호환성 기준을 확정한다.
3. Backend 작업은 `BE-TODO` goal 기준으로 구현한다.
4. Frontend 표시 작업이 필요해지면 `FE-TODO`에 별도 goal을 추가한다.
5. 구현 후 관련 API 계약 문서와 TODO_LOG를 갱신한다.

## 6. 현재 범위

- `GET /api/companies` 목록 응답의 각 item에 `contactCount`를 추가한다.
- `GET /api/companies/:companyId/contacts` API를 추가해 회사에 연결된 Contact 전체 목록을 반환한다.
- `GET /api/companies/export/xlsx` API를 추가해 회사 목록 필터 조건에 맞는 전체 데이터를 xlsx로 내려준다.
- `GET /api/contacts/export/xlsx` API를 추가해 거래처 목록 필터 조건에 맞는 전체 데이터를 xlsx로 내려준다.
- `GET /api/products/export/xlsx` API를 추가해 제품 목록 필터 조건에 맞는 전체 데이터를 xlsx로 내려준다.
- 모든 export API는 목록 페이지의 현재 검색어와 필터 조건을 함께 적용하고, `page`만 제외한다.
- `totalCount`, `totalPages`, 페이지네이션, 검색, 필터 동작은 기존과 동일하게 유지한다.

## 7. 현재 범위 밖

- `GET /api/companies/:companyId` 단건 응답 변경
- 기존 Contact API 변경
- 기존 Product API 변경
- Frontend 화면 표시 변경
- 회사 연결 Contact 목록 페이지네이션
- 범용 Import/Export 모듈 또는 ExportJob 구현
- Company 삭제, soft delete, 휴지통 기능

## 8. 완료 기준

- 공통 API 계약이 작성되어 있다.
- Backend 구현 범위가 goal 문서로 분리되어 있다.
- 구현 시 `GET /api/companies` 응답의 `items[].contactCount`가 검증된다.
- 구현 시 `GET /api/companies/:companyId/contacts` 응답의 `items[]`가 검증된다.
- 구현 시 `GET /api/companies/export/xlsx`가 필터 조건에 맞는 xlsx 파일을 반환한다.
- 구현 시 `GET /api/contacts/export/xlsx`가 필터 조건에 맞는 xlsx 파일을 반환한다.
- 구현 시 `GET /api/products/export/xlsx`가 필터 조건에 맞는 xlsx 파일을 반환한다.
- 기존 Company 목록 응답의 페이지네이션 의미가 유지된다.
