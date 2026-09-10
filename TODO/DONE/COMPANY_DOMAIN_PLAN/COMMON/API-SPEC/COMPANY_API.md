# Company API

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 목록

| 기능 | Method | Path |
| --- | --- | --- |
| 회사 목록 | GET | `/api/companies` |
| 회사 xlsx export | GET | `/api/companies/export/xlsx` |
| 회사 상세 | GET | `/api/companies/:companyId` |
| 회사 생성 | POST | `/api/companies` |
| 회사 수정 | PATCH | `/api/companies/:companyId` |
| 회사 분야 목록 | GET | `/api/company-fields` |
| 회사 분야 생성 | POST | `/api/company-fields` |
| 회사 분야 삭제 | DELETE | `/api/company-fields/:fieldId` |
| 회사 지역 목록 | GET | `/api/company-regions` |
| 회사 지역 생성 | POST | `/api/company-regions` |
| 회사 지역 삭제 | DELETE | `/api/company-regions/:regionId` |

## 공통

- 모든 API는 로그인 사용자를 기준으로 동작한다.
- 회사 목록/export는 검색어, 회사 분야, 회사 지역 필터를 공유한다.
- export는 페이지네이션을 적용하지 않는다.
- 생성/수정 성공은 response body를 기대하지 않는다.
