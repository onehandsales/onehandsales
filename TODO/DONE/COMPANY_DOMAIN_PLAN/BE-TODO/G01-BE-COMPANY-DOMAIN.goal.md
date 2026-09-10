# G01 BE Company Domain

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 현재 완료 기준

- `Company`, `CompanyField`, `CompanyRegion` schema가 현재 Prisma schema에 있다.
- Company API는 current user ownership을 적용한다.
- 회사 생성 요청은 회사명, 회사 분야 ID, 회사 지역 ID, 선택 주소를 받는다.
- 회사 수정 요청은 회사명, 회사 분야 ID, 회사 지역 ID, 선택 주소를 변경한다.
- 분야/지역 삭제는 이미 회사에 연결된 옵션을 거부한다.
- Company xlsx export는 검색어와 분야/지역 필터를 반영하고 page 조건은 제외한다.

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
