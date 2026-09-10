# 현재 핵심 도메인 API 명세

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 1. 목적

이 문서는 현재 `BE`와 `FE/user-web`에 남아 있는 활성 핵심 도메인 API 계약을 정의한다.

과거 MVP 계획의 Contact, Product, Deal, Schedule 세부 구현 계약은 현재 런타임 코드와 Prisma schema에서 제거되어 이 문서의 활성 계약으로 보지 않는다.

## 2. 현재 활성 도메인

| 도메인 | 상태 | 기준 |
|---|---|---|
| Company | 활성 | `BE/src/modules/company`, `FE/user-web/src/features/company`, `BE/prisma/schema.prisma` |
| Contact | 비활성 | `BE/src/modules/contact/README.md`만 남아 있고 `/api/contacts`는 제공하지 않는다. |
| Product | 비활성 | `BE/src/modules/product/README.md`만 남아 있고 `/api/products`는 제공하지 않는다. |
| Deal | 비활성 | `BE/src/modules/deal/README.md`만 남아 있고 `/api/deals`는 제공하지 않는다. |
| Schedule | 비활성 | `BE/src/modules/schedule/README.md`만 남아 있고 `/api/schedules`는 제공하지 않는다. |

## 3. Company API

### 3.1 목록

| API 이름 | Method | Path | Request | Response | 연결 DB |
|---|---|---|---|---|---|
| 회사 목록 조회 | `GET` | `/api/companies` | `ListCompaniesQueryDto` | `CompanyListResponse` | `Company`, `CompanyField`, `CompanyRegion` |
| 회사 목록 xlsx 내보내기 | `GET` | `/api/companies/export/xlsx` | `ExportCompaniesQueryDto` | xlsx stream | `Company`, `CompanyField`, `CompanyRegion` |
| 회사 단건 조회 | `GET` | `/api/companies/:companyId` | path `companyId` | `CompanyDetail` | `Company`, `CompanyField`, `CompanyRegion` |
| 회사 생성 | `POST` | `/api/companies` | `CreateCompanyDto` | `201` empty body | `Company` |
| 회사 수정 | `PATCH` | `/api/companies/:companyId` | path `companyId`, `UpdateCompanyDto` | `201` empty body | `Company` |
| 회사 분야 목록 | `GET` | `/api/company-fields` | 없음 | `CompanyFieldListResponse` | `CompanyField` |
| 회사 분야 생성 | `POST` | `/api/company-fields` | `CreateCompanyFieldDto` | `201` empty body | `CompanyField` |
| 회사 분야 삭제 | `DELETE` | `/api/company-fields/:fieldId` | path `fieldId` | `204` empty body | `CompanyField` |
| 회사 지역 목록 | `GET` | `/api/company-regions` | 없음 | `CompanyRegionListResponse` | `CompanyRegion` |
| 회사 지역 생성 | `POST` | `/api/company-regions` | `CreateCompanyRegionDto` | `201` empty body | `CompanyRegion` |
| 회사 지역 삭제 | `DELETE` | `/api/company-regions/:regionId` | path `regionId` | `204` empty body | `CompanyRegion` |

### 3.2 Query

| 필드 | 타입 | 필수 | 적용 API |
|---|---|---|---|
| `page` | number | 선택 | 회사 목록 조회 |
| `companyName` | string | 선택 | 회사 목록 조회, xlsx 내보내기 |
| `companyFieldId` | uuid | 선택 | 회사 목록 조회, xlsx 내보내기 |
| `companyFieldIds` | uuid[] | 선택 | 회사 목록 조회, xlsx 내보내기 |
| `companyRegionId` | uuid | 선택 | 회사 목록 조회, xlsx 내보내기 |
| `companyRegionIds` | uuid[] | 선택 | 회사 목록 조회, xlsx 내보내기 |
| `sort` | `CompanyListSort` | 선택 | 회사 목록 조회, xlsx 내보내기 |
| `locale` | string | 선택 | 회사 목록 조회 |
| `timeZone` | string | 선택 | 회사 목록 조회 |

`companyFieldIds`와 `companyRegionIds`는 반복 query와 comma-separated query를 모두 허용한다.

### 3.3 Body

| DTO | 필드 |
|---|---|
| `CreateCompanyDto` | `companyName:string`, `companyFieldId:uuid`, `companyRegionId:uuid`, `address?:string|null` |
| `UpdateCompanyDto` | `companyName?:string`, `companyFieldId?:uuid`, `companyRegionId?:uuid`, `address?:string|null` |
| `CreateCompanyFieldDto` | `field:string` |
| `CreateCompanyRegionDto` | `region:string`, `countryCode?:string|null`, `regionCode?:string|null` |

### 3.4 처리 기준

1. 모든 Company API는 `AuthGuard`로 현재 사용자를 확인한다.
2. 회사 단건 조회와 수정은 `companyId`와 `userId`를 함께 조건으로 검증한다.
3. 회사 생성과 수정은 분야/지역 ID가 현재 사용자 소유인지 확인한다.
4. 회사 분야와 지역은 사용자 단위로 고유해야 한다.
5. 사용 중인 회사 분야와 지역은 삭제할 수 없다.
6. 회사 row에는 사용자용 제거 상태 컬럼을 두지 않는다.
7. 회사 보조 기록 전용 API는 현재 계약에 포함하지 않는다.

## 4. 현재 Schema

| 모델 | 주요 필드 |
|---|---|
| `Company` | `id`, `userId`, `companyName`, `companyFieldId`, `companyRegionId`, `address`, `createdAt`, `updatedAt` |
| `CompanyField` | `id`, `userId`, `field`, `createdAt` |
| `CompanyRegion` | `id`, `userId`, `region`, `countryCode`, `regionCode`, `createdAt` |

## 5. User Web 활성 페이지

| Path | 화면 |
|---|---|
| `/app` | 홈 |
| `/app/companies` | 회사 목록 |
| `/app/companies/new` | 회사 간단 생성 |
| `/app/companies/new/full` | 회사 전체 생성 |
| `/app/companies/:companyId` | 회사 상세 |
| `/app/more` | 더보기 |

`/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 현재 `/app`으로 redirect한다.

## 6. 상세 계약

엔드포인트별 구현 상세는 `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`를 따른다.
