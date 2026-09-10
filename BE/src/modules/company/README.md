# Company Module

## 현재 범위

- `GET /api/companies`
- `GET /api/company-fields`
- `GET /api/company-regions`
- `GET /api/companies/:companyId`
- `GET /api/companies/export/xlsx`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`

이 모듈은 User Web에서 사용하는 회사, 회사 분야, 회사 지역 API와 회사 XLSX export를 담당한다.

## 구현 기준

- 모든 API는 `AuthGuard`를 사용한다.
- 모든 조회와 변경은 현재 사용자 `userId` ownership 기준으로 처리한다.
- 회사 export는 검색/다중 필터/정렬 조건을 적용하고 `page` 없이 전체 대상 xlsx를 반환한다.
- 회사 삭제 API와 회사 메모/개인 비밀 메모 로그 API는 현재 범위에서 제거되어 있다.
- Contact/Deal 연결 목록 API와 `contactCount`, `dealCount` 응답은 현재 controller와 Prisma schema에 없다.
- API 계약은 현재 controller와 `AGENT/SOFTWARE_AGENT/COMMON/API_SAMPLE.md`를 기준으로 확인한다.
