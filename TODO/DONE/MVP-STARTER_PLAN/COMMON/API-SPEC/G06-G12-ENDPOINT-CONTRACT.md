# 현재 핵심 도메인 엔드포인트 구현 계약

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 1. 목적

이 문서는 현재 활성화된 Company 엔드포인트를 구현자가 바로 대조할 수 있도록 request, 처리 기준, response, 연결 DB, transaction, 에러 기준으로 정리한다.

Contact, Product, Deal, Schedule 엔드포인트는 현재 Backend 런타임과 Prisma schema에 없으므로 이 문서의 구현 계약에 포함하지 않는다.

## 2. 공통 처리 기준

- 모든 Company API는 `AuthGuard`로 현재 사용자 context를 확보한다.
- 단건 조회와 수정은 path id와 `userId`를 함께 조건으로 검증한다.
- 생성/수정 API는 빈 문자열을 trim한 뒤 validation한다.
- 다른 사용자 소유 분야/지역 연결은 허용하지 않는다.
- Company 생성/수정/조회는 현재 단일 row 또는 조회 전용 조합으로 처리한다.
- 회사 보조 기록 전용 endpoint는 제공하지 않는다.

## 3. Company 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 회사 목록 조회 | `ListCompanies` | `ListCompaniesQueryDto`: `page`, `companyName`, `companyFieldId`, `companyFieldIds`, `companyRegionId`, `companyRegionIds`, `sort`, `locale`, `timeZone` | 인증 사용자의 회사만 조회한다. 회사명, 분야, 지역 필터와 정렬을 적용한다. | `CompanyListResponse`: `items`, `page`, `pageSize`, `totalCount`, `hasNext`, 필터 옵션에 필요한 회사 정보 | `Company` 조회와 count. transaction 없음. | `Unauthorized` 401, `ValidationError` 400 |
| 회사 목록 xlsx 내보내기 | `ExportCompaniesXlsx` | `ExportCompaniesQueryDto`: `companyName`, `companyFieldId`, `companyFieldIds`, `companyRegionId`, `companyRegionIds`, `sort` | 목록 필터와 같은 조건으로 전체 결과를 조회해 xlsx workbook을 만든다. | xlsx stream, `Content-Disposition` 다운로드 파일명 | `Company` 조회. xlsx adapter 사용. transaction 없음. | `Unauthorized` 401, `ValidationError` 400 |
| 회사 단건 조회 | `GetCompany` | path `companyId` | 회사 ID와 현재 사용자 ID를 함께 확인한다. 분야/지역 표시 정보를 포함한다. | `CompanyDetail`: 회사 기본 정보와 분야/지역 표시값 | `Company` 단건 조회. transaction 없음. | `CompanyNotFound` 404 |
| 회사 생성 | `CreateCompany` | `CreateCompanyDto`: `companyName`, `companyFieldId`, `companyRegionId`, `address` | 분야/지역 소유권을 확인한 뒤 회사 row를 생성한다. | `201` empty body | `Company` insert. transaction 없음. | `CompanyFieldNotFound` 404, `CompanyRegionNotFound` 404, `ValidationError` 400 |
| 회사 수정 | `UpdateCompany` | path `companyId`, `UpdateCompanyDto`: `companyName`, `companyFieldId`, `companyRegionId`, `address` | 회사 소유권을 확인한다. 변경할 분야/지역이 있으면 소유권을 확인하고 전달된 필드만 갱신한다. | `201` empty body | `Company` update. transaction 없음. | `CompanyNotFound` 404, `CompanyFieldNotFound` 404, `CompanyRegionNotFound` 404, `ValidationError` 400 |

## 4. Company Field 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 회사 분야 목록 조회 | `ListCompanyFields` | 없음 | 현재 사용자의 분야를 조회한다. | `CompanyFieldListResponse`: `items` | `CompanyField` 조회. transaction 없음. | `Unauthorized` 401 |
| 회사 분야 생성 | `CreateCompanyField` | `CreateCompanyFieldDto`: `field` | 같은 사용자 안에서 분야명 중복을 막고 생성한다. | `201` empty body | `CompanyField` insert. transaction 없음. | `DuplicateCompanyField` 409, `ValidationError` 400 |
| 회사 분야 삭제 | `DeleteCompanyField` | path `fieldId` | 분야 소유권을 확인하고, 연결된 회사가 없을 때만 삭제한다. | `204` empty body | `CompanyField` delete. transaction 없음. | `CompanyFieldNotFound` 404, `CompanyFieldInUse` 409 |

## 5. Company Region 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 회사 지역 목록 조회 | `ListCompanyRegions` | 없음 | 현재 사용자의 지역을 조회한다. | `CompanyRegionListResponse`: `items` | `CompanyRegion` 조회. transaction 없음. | `Unauthorized` 401 |
| 회사 지역 생성 | `CreateCompanyRegion` | `CreateCompanyRegionDto`: `region`, `countryCode`, `regionCode` | 표준 지역 코드 입력을 정규화하고 같은 사용자 안에서 지역명 중복을 막아 생성한다. | `201` empty body | `CompanyRegion` insert. transaction 없음. | `DuplicateCompanyRegion` 409, `ValidationError` 400 |
| 회사 지역 삭제 | `DeleteCompanyRegion` | path `regionId` | 지역 소유권을 확인하고, 연결된 회사가 없을 때만 삭제한다. | `204` empty body | `CompanyRegion` delete. transaction 없음. | `CompanyRegionNotFound` 404, `CompanyRegionInUse` 409 |

## 6. 관련 문서

- `BE/src/modules/company/README.md`
- `BE/src/modules/company/presentation/http/company.controller.ts`
- `BE/src/modules/company/presentation/http/dto/company-request.dto.ts`
- `FE/user-web/src/features/company/api/company-api.ts`
- `FE/user-web/src/app/router/router.tsx`
- `BE/prisma/schema.prisma`
