# Company Module

## 현재 범위

- `GET /api/companies`
- `GET /api/company-fields`
- `GET /api/company-regions`
- `GET /api/companies/:companyId`
- `GET /api/companies/:companyId/contacts`
- `GET /api/companies/export/xlsx`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`
- `POST /api/companies/:companyId/memo-logs`
- `GET /api/companies/:companyId/memo-logs`
- `PATCH /api/companies/:companyId/memo-logs/:memoLogId`
- `POST /api/companies/:companyId/private-memo-logs`
- `GET /api/companies/:companyId/private-memo-logs`
- `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`

이 모듈은 User Web에서 사용하는 회사, 회사 분야, 회사 지역, 회사 일반 메모 로그, 회사 개인 비밀 메모 로그 API를 담당한다.

## 구현 기준

- 모든 API는 `AuthGuard`를 사용한다.
- 모든 조회와 변경은 현재 사용자 `userId` ownership 기준으로 처리한다.
- 회사 목록 응답에는 회사별 연결 담당자 수 `contactCount`와 딜 수 `dealCount`를 포함한다.
- 회사 연결 담당자 목록 응답에는 이름, 휴대폰 번호, 이메일, 부서, 직급을 포함한다.
- 회사 export는 검색/다중 필터/정렬 조건을 적용하고 `page` 없이 전체 대상 xlsx를 반환한다.
- 회사 생성 시 `companyMemo`가 있으면 같은 transaction에서 `CompanyMemoLog` 첫 데이터로 저장한다.
- 개인 비밀 메모 평문은 API DTO에서만 `memo`로 다루고, DB에는 `memoCiphertext`, `memoKeyVersion`만 저장한다.
- API 계약은 `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`를 따른다.
