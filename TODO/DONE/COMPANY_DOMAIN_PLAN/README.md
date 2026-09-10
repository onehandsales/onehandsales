# Company Domain Plan

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 현재 기준

- Backend는 `Company`, `CompanyField`, `CompanyRegion` 기반 API와 Company xlsx export만 제공한다.
- User Web은 `/app` 회사 목록 맥락과 `/app/companies/new`, `/app/companies/new/full` 회사 생성 화면을 유지한다.
- 회사 상세 확장 영역과 다른 도메인 연결 화면은 현재 활성 범위가 아니다.

## 현재 API

- `GET /api/companies`
- `GET /api/companies/export/xlsx`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `GET /api/company-fields`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `GET /api/company-regions`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`

## 정본

- `BE/src/modules/company/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/PM_AGENT/DECISIONS/023_company_domain_basic_scope.md`
