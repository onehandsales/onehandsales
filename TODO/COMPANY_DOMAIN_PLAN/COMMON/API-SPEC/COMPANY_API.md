# Company API Spec

## 1. 공통 규칙

- 이 API 계약은 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- API를 수정할 때는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 함께 갱신한다.
- API별 최종 상세 명세는 `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`를 기준으로 한다.
- 대상: 사용자 페이지 API
- 관리자 페이지: 제외
- 인증: `Authorization: Bearer <backend_app_access_token>`
- 권한: 로그인한 사용자 본인 데이터만 접근 가능
- 날짜 형식: ISO 8601 string
- 회사 목록 페이지 크기: 20개 고정
- 회사 메모 로그 페이지 크기: 10개 고정
- 회사 개인 비밀 메모 로그 페이지 크기: 10개 고정
- 회사 목록 정렬: `createdAt DESC`
- 회사 목록 응답: `updatedAt` 제외
- 회사 분야/지역 전체 조회 응답: `createdAt` 제외
- 상태값만 반환하는 API: response body 없음
- 회사 개인 비밀 메모: API에서는 `memo`를 사용하지만 DB에는 평문 저장 금지

## 2. API 목록

1. 회사 페이지네이션 API: `GET /api/companies`
2. 회사 분야 전체 조회 API: `GET /api/company-fields`
3. 회사 지역 전체 조회 API: `GET /api/company-regions`
4. 회사 단건 조회 API: `GET /api/companies/:companyId`
5. 회사 단건 생성 API: `POST /api/companies`
6. 회사 기본 정보 수정 API: `PATCH /api/companies/:companyId`
7. 회사 분야 단건 생성 API: `POST /api/company-fields`
8. 회사 분야 단건 삭제 API: `DELETE /api/company-fields/:fieldId`
9. 회사 지역 단건 생성 API: `POST /api/company-regions`
10. 회사 지역 단건 삭제 API: `DELETE /api/company-regions/:regionId`
11. 회사 메모 로그 단건 생성 API: `POST /api/companies/:companyId/memo-logs`
12. 회사 메모 로그 무한스크롤 API: `GET /api/companies/:companyId/memo-logs`
13. 회사 메모 로그 단건 수정 API: `PATCH /api/companies/:companyId/memo-logs/:memoLogId`
14. 회사 개인 비밀 메모 로그 단건 생성 API: `POST /api/companies/:companyId/private-memo-logs`
15. 회사 개인 비밀 메모 로그 무한스크롤 API: `GET /api/companies/:companyId/private-memo-logs`
16. 회사 개인 비밀 메모 로그 단건 수정 API: `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`
17. 회사 연결 Contact 전체 조회 API: `GET /api/companies/:companyId/contacts`
18. 회사 목록 xlsx 내보내기 API: `GET /api/companies/export/xlsx`

## 2.1. API 계약 상태 요약

모든 API의 소비자는 `User Web`이다.

| API | 계약 상태 | Transaction | Observability |
|---|---|---|---|
| `GET /api/companies` | implemented | 없음 | `company.listed`, audit log 없음, request id 사용 |
| `GET /api/company-fields` | implemented | 없음 | `companyField.listed`, audit log 없음, request id 사용 |
| `GET /api/company-regions` | implemented | 없음 | `companyRegion.listed`, audit log 없음, request id 사용 |
| `GET /api/companies/:companyId` | implemented | 없음 | `company.viewed`, audit log 없음, request id 사용 |
| `GET /api/companies/:companyId/contacts` | implemented | 없음 | `company.contactsListed`, audit log 없음, request id 사용 |
| `GET /api/companies/export/xlsx` | implemented | 없음 | `company.exported`, audit log 없음, request id 사용, `companyName` 원문 logging 금지 |
| `POST /api/companies` | implemented | 필요. `Company`와 조건부 `CompanyMemoLog` | `company.created`, audit log 없음, request id 사용, `companyMemo` redaction |
| `PATCH /api/companies/:companyId` | implemented | 없음 | `company.updated`, audit log 없음, request id 사용 |
| `POST /api/company-fields` | implemented | 없음 | `companyField.created`, audit log 없음, request id 사용 |
| `DELETE /api/company-fields/:fieldId` | implemented | 없음 | `companyField.deleted`, audit log 없음, request id 사용 |
| `POST /api/company-regions` | implemented | 없음 | `companyRegion.created`, audit log 없음, request id 사용 |
| `DELETE /api/company-regions/:regionId` | implemented | 없음 | `companyRegion.deleted`, audit log 없음, request id 사용 |
| `POST /api/companies/:companyId/memo-logs` | implemented | 없음 | `companyMemoLog.created`, audit log 없음, request id 사용, `memo` redaction |
| `GET /api/companies/:companyId/memo-logs` | implemented | 없음 | `companyMemoLog.listed`, audit log 없음, request id 사용, `memo` redaction |
| `PATCH /api/companies/:companyId/memo-logs/:memoLogId` | implemented | 없음 | `companyMemoLog.updated`, audit log 없음, request id 사용, `memo` redaction |
| `POST /api/companies/:companyId/private-memo-logs` | implemented | 없음 | `companyPrivateMemoLog.created`, audit log 없음, request id 사용, private memo redaction |
| `GET /api/companies/:companyId/private-memo-logs` | implemented | 없음 | `companyPrivateMemoLog.listed`, audit log 없음, request id 사용, private memo redaction |
| `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId` | implemented | 없음 | `companyPrivateMemoLog.updated`, audit log 없음, request id 사용, private memo redaction |

## 3. 회사 페이지네이션 API

- API 이름: 회사 페이지네이션 API
- API 식별자: ListCompanies
- Method: `GET`
- Path: `/api/companies`
- 인증: 필요
- 권한: 본인 회사만 조회

### 목적

회사 목록 화면에서 회사 이름 검색, 회사 분야 필터, 회사 지역 필터, 20개 단위 페이지네이션을 제공한다.

### Request

- Request 이름: `ListCompaniesQuery`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `page` | number | 선택 | 1부터 시작. 기본값은 1 |
| `companyName` | string | 선택 | 회사 이름 부분 검색어 |
| `companyFieldId` | string | 선택 | 회사 분야 필터 ID |
| `companyRegionId` | string | 선택 | 회사 지역 필터 ID |

서버는 `pageSize`를 20으로 고정한다. FE는 `pageSize` query를 보내지 않는다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. query를 validation한다.
3. `userId` 조건을 기본으로 적용한다.
4. `companyName`이 있으면 회사 이름 부분 검색 조건을 적용한다.
5. `companyFieldId`가 있으면 같은 사용자의 회사 분야 ID인지 확인한 뒤 필터를 적용한다.
6. `companyRegionId`가 있으면 같은 사용자의 회사 지역 ID인지 확인한 뒤 필터를 적용한다.
7. `createdAt DESC`로 정렬하고 20개 단위로 조회한다.
8. 각 회사에 연결된 `Contact` 개수를 계산해 `contactCount`로 넣는다.
9. 목록 응답으로 변환할 때 `updatedAt`은 넣지 않는다.

### Response

- Response 이름: `CompanyPageResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `CompanyListItemResponse[]` | 회사 목록 |
| `page` | number | 현재 페이지 |
| `pageSize` | number | 20 |
| `totalCount` | number | 조건에 맞는 전체 회사 수 |
| `totalPages` | number | 전체 페이지 수 |

`CompanyListItemResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 회사 ID |
| `companyName` | string | 회사 이름 |
| `companyField` | object | 회사 분야 |
| `companyField.id` | string | 회사 분야 ID |
| `companyField.field` | string | 회사 분야 이름 |
| `companyRegion` | object | 회사 지역 |
| `companyRegion.id` | string | 회사 지역 ID |
| `companyRegion.region` | string | 회사 지역 이름 |
| `contactCount` | number | 해당 회사에 연결된 거래처 수 |
| `createdAt` | string | 회사 등록일 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyField`, `CompanyRegion`, `Contact`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 잘못된 page | `ValidationError` | 400 |
| 본인 소유가 아닌 분야 ID | `CompanyFieldNotFound` | 404 |
| 본인 소유가 아닌 지역 ID | `CompanyRegionNotFound` | 404 |

## 4. 회사 분야 전체 조회 API

- API 이름: 회사 분야 전체 조회 API
- API 식별자: ListCompanyFields
- Method: `GET`
- Path: `/api/company-fields`
- 인증: 필요
- 권한: 본인 회사 분야만 조회

### 목적

회사 목록 필터와 회사 생성 화면에서 사용할 회사 분야 옵션을 제공한다.

### Request

- Request 이름: 없음

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자의 `CompanyField`를 조회한다.
3. 이름 기준으로 안정적인 정렬을 적용한다.
4. 응답에는 `createdAt`을 넣지 않는다.

### Response

- Response 이름: `CompanyFieldListResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `CompanyFieldResponse[]` | 회사 분야 목록 |

`CompanyFieldResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 회사 분야 ID |
| `field` | string | 회사 분야 이름 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `CompanyField`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |

## 5. 회사 지역 전체 조회 API

- API 이름: 회사 지역 전체 조회 API
- API 식별자: ListCompanyRegions
- Method: `GET`
- Path: `/api/company-regions`
- 인증: 필요
- 권한: 본인 회사 지역만 조회

### 목적

회사 목록 필터와 회사 생성 화면에서 사용할 회사 지역 옵션을 제공한다.

### Request

- Request 이름: 없음

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자의 `CompanyRegion`을 조회한다.
3. 이름 기준으로 안정적인 정렬을 적용한다.
4. 응답에는 `createdAt`을 넣지 않는다.

### Response

- Response 이름: `CompanyRegionListResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `CompanyRegionResponse[]` | 회사 지역 목록 |

`CompanyRegionResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 회사 지역 ID |
| `region` | string | 회사 지역 이름 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `CompanyRegion`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |

## 6. 회사 단건 조회 API

- API 이름: 회사 단건 조회 API
- API 식별자: GetCompany
- Method: `GET`
- Path: `/api/companies/:companyId`
- 인증: 필요
- 권한: 본인 회사만 조회

### 목적

회사 단건 화면에서 회사 기본 정보를 제공한다.

### Request

- Request 이름: `GetCompanyParams`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `companyId`를 validation한다.
3. `userId`와 `companyId`가 모두 일치하는 회사를 조회한다.
4. 회사 분야와 회사 지역을 함께 조회한다.
5. 단건 응답으로 변환한다.

### Response

- Response 이름: `CompanyDetailResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 회사 ID |
| `companyName` | string | 회사 이름 |
| `companyField` | object | 회사 분야 |
| `companyField.id` | string | 회사 분야 ID |
| `companyField.field` | string | 회사 분야 이름 |
| `companyRegion` | object | 회사 지역 |
| `companyRegion.id` | string | 회사 지역 ID |
| `companyRegion.region` | string | 회사 지역 이름 |
| `createdAt` | string | 회사 등록일 |
| `updatedAt` | string | 회사 최근 수정일 |

단건 응답에는 `contactCount`, `dealCount`를 넣지 않는다. 회사 목록의 거래처 수와 딜 수는 `GET /api/companies` 응답의 `contactCount`, `dealCount`를 사용한다. 회사 단건의 연결 Deal 목록은 `GET /api/companies/:companyId/deals` 별도 API로 조회한다.

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyField`, `CompanyRegion`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |

## 7. 회사 단건 생성 API

- API 이름: 회사 단건 생성 API
- API 식별자: CreateCompany
- Method: `POST`
- Path: `/api/companies`
- 인증: 필요
- 권한: 본인 회사만 생성

### 목적

회사 이름, 회사 분야, 회사 지역으로 새 회사를 생성한다. 선택 입력인 `companyMemo`가 있으면 회사 일반 메모 로그 첫 데이터로 저장한다.

### Request

- Request 이름: `CreateCompanyRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyName` | string | 필수 | 회사 이름 |
| `companyFieldId` | string | 필수 | 회사 분야 ID |
| `companyRegionId` | string | 필수 | 회사 지역 ID |
| `companyMemo` | string | 선택 | 회사 생성 시 첫 회사 메모 로그로 저장할 일반 메모 |

`companyMemo`가 있으면 서버는 첫 회사 메모 로그의 `memoType`을 `초기 메모`로 저장한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. `companyFieldId`가 현재 사용자의 `CompanyField`인지 확인한다.
4. `companyRegionId`가 현재 사용자의 `CompanyRegion`인지 확인한다.
5. transaction을 시작한다.
6. `Company`를 생성한다.
7. `companyMemo`가 있으면 생성된 회사 ID와 현재 userId로 `CompanyMemoLog`를 생성한다. 이때 `memoType`은 `초기 메모`로 저장한다.
8. transaction을 commit한다.
9. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: `Company`, `CompanyMemoLog` 조건부 생성
- 조회: `CompanyField`, `CompanyRegion`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: `Company`와 조건부 `CompanyMemoLog`

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 회사 분야 없음 또는 본인 소유 아님 | `CompanyFieldNotFound` | 404 |
| 회사 지역 없음 또는 본인 소유 아님 | `CompanyRegionNotFound` | 404 |

## 8. 회사 기본 정보 수정 API

- API 이름: 회사 기본 정보 수정 API
- API 식별자: UpdateCompany
- Method: `PATCH`
- Path: `/api/companies/:companyId`
- 인증: 필요
- 권한: 본인 회사만 수정

### 목적

회사명, 회사 분야, 회사 지역을 수정한다.

### Request

- Request 이름: `UpdateCompanyRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |
| `companyName` | string | 선택 | 수정할 회사 이름 |
| `companyFieldId` | string | 선택 | 수정할 회사 분야 ID |
| `companyRegionId` | string | 선택 | 수정할 회사 지역 ID |

`companyName`, `companyFieldId`, `companyRegionId` 중 최소 1개는 필요하다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 회사가 현재 사용자의 회사인지 확인한다.
4. `companyFieldId`가 있으면 현재 사용자의 `CompanyField`인지 확인한다.
5. `companyRegionId`가 있으면 현재 사용자의 `CompanyRegion`인지 확인한다.
6. 요청에 포함된 회사명, 회사 분야, 회사 지역만 수정한다.
7. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyField`, `CompanyRegion`
- 수정: `Company`
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| 회사 분야 없음 또는 본인 소유 아님 | `CompanyFieldNotFound` | 404 |
| 회사 지역 없음 또는 본인 소유 아님 | `CompanyRegionNotFound` | 404 |

## 9. 회사 분야 단건 생성 API

- API 이름: 회사 분야 단건 생성 API
- API 식별자: CreateCompanyField
- Method: `POST`
- Path: `/api/company-fields`
- 인증: 필요
- 권한: 본인 회사 분야만 생성

### Request

- Request 이름: `CreateCompanyFieldRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `field` | string | 필수 | 회사 분야 이름 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. 같은 사용자 안에서 같은 `field`가 이미 있는지 확인한다.
4. `CompanyField`를 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: `CompanyField`
- 조회: `CompanyField`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 같은 분야 중복 | `DuplicateCompanyField` | 409 |

## 10. 회사 분야 단건 삭제 API

- API 이름: 회사 분야 단건 삭제 API
- API 식별자: DeleteCompanyField
- Method: `DELETE`
- Path: `/api/company-fields/:fieldId`
- 인증: 필요
- 권한: 본인 회사 분야만 삭제

### Request

- Request 이름: `DeleteCompanyFieldParams`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `fieldId` | string | 필수 | 회사 분야 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `fieldId`를 validation한다.
3. 현재 사용자의 `CompanyField`인지 확인한다.
4. 해당 분야를 사용하는 `Company`가 하나라도 있으면 삭제를 막는다.
5. 매핑된 회사가 없으면 `CompanyField`를 삭제한다.
6. `204 No Content`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `204 No Content`

Response body 없음.

### 연결된 DB 스키마

- 생성: 없음
- 조회: `CompanyField`, `Company`
- 수정: 없음
- 삭제: `CompanyField`
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 분야 없음 또는 본인 소유 아님 | `CompanyFieldNotFound` | 404 |
| 이미 회사에 매핑됨 | `CompanyFieldInUse` | 409 |

## 11. 회사 지역 단건 생성 API

- API 이름: 회사 지역 단건 생성 API
- API 식별자: CreateCompanyRegion
- Method: `POST`
- Path: `/api/company-regions`
- 인증: 필요
- 권한: 본인 회사 지역만 생성

### Request

- Request 이름: `CreateCompanyRegionRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `region` | string | 필수 | 회사 지역 이름 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. 같은 사용자 안에서 같은 `region`이 이미 있는지 확인한다.
4. `CompanyRegion`을 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: `CompanyRegion`
- 조회: `CompanyRegion`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 같은 지역 중복 | `DuplicateCompanyRegion` | 409 |

## 12. 회사 지역 단건 삭제 API

- API 이름: 회사 지역 단건 삭제 API
- API 식별자: DeleteCompanyRegion
- Method: `DELETE`
- Path: `/api/company-regions/:regionId`
- 인증: 필요
- 권한: 본인 회사 지역만 삭제

### Request

- Request 이름: `DeleteCompanyRegionParams`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `regionId` | string | 필수 | 회사 지역 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `regionId`를 validation한다.
3. 현재 사용자의 `CompanyRegion`인지 확인한다.
4. 해당 지역을 사용하는 `Company`가 하나라도 있으면 삭제를 막는다.
5. 매핑된 회사가 없으면 `CompanyRegion`을 삭제한다.
6. `204 No Content`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `204 No Content`

Response body 없음.

### 연결된 DB 스키마

- 생성: 없음
- 조회: `CompanyRegion`, `Company`
- 수정: 없음
- 삭제: `CompanyRegion`
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 지역 없음 또는 본인 소유 아님 | `CompanyRegionNotFound` | 404 |
| 이미 회사에 매핑됨 | `CompanyRegionInUse` | 409 |

## 13. 회사 메모 로그 단건 생성 API

- API 이름: 회사 메모 로그 단건 생성 API
- API 식별자: CreateCompanyMemoLog
- Method: `POST`
- Path: `/api/companies/:companyId/memo-logs`
- 인증: 필요
- 권한: 본인 회사에만 메모 로그 생성

### 목적

회사 단건 화면에서 회사 특징에 대한 일반 메모 로그를 독립적으로 추가한다.

### Request

- Request 이름: `CreateCompanyMemoLogRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |
| `memoType` | string | 필수 | 메모의 간단한 설명 또는 유형. 예: 첫 접촉, 전화 통화, 영업 방문 |
| `memo` | string | 필수 | 회사 특징 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 회사가 현재 사용자의 회사인지 확인한다.
4. 현재 userId와 companyId로 `CompanyMemoLog`를 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: `CompanyMemoLog`
- 조회: `Company`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |

## 14. 회사 메모 로그 무한스크롤 API

- API 이름: 회사 메모 로그 무한스크롤 API
- API 식별자: ListCompanyMemoLogs
- Method: `GET`
- Path: `/api/companies/:companyId/memo-logs`
- 인증: 필요
- 권한: 본인 회사의 메모 로그만 조회

### Request

- Request 이름: `ListCompanyMemoLogsQuery`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |
| `cursor` | string | 선택 | 다음 페이지 조회 cursor |

서버는 한 번에 10개를 반환한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `companyId`와 `cursor`를 validation한다.
3. 회사가 현재 사용자의 회사인지 확인한다.
4. `CompanyMemoLog`를 `createdAt DESC, id DESC` 기준으로 10개 조회한다.
5. 다음 페이지가 있으면 `nextCursor`를 반환한다.

### Response

- Response 이름: `CompanyMemoLogConnectionResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `CompanyMemoLogResponse[]` | 회사 메모 로그 목록 |
| `nextCursor` | string \| null | 다음 페이지 cursor |
| `hasNext` | boolean | 다음 페이지 존재 여부 |

`CompanyMemoLogResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 회사 메모 로그 ID |
| `memoType` | string | 메모의 간단한 설명 또는 유형 |
| `memo` | string | 회사 특징 메모 |
| `createdAt` | string | 메모 등록일 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyMemoLog`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| cursor 형식 오류 | `ValidationError` | 400 |

## 15. 회사 메모 로그 단건 수정 API

- API 이름: 회사 메모 로그 단건 수정 API
- API 식별자: UpdateCompanyMemoLog
- Method: `PATCH`
- Path: `/api/companies/:companyId/memo-logs/:memoLogId`
- 인증: 필요
- 권한: 본인 회사의 본인 메모 로그만 수정

### Request

- Request 이름: `UpdateCompanyMemoLogRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |
| `memoLogId` | string | 필수 | 회사 메모 로그 ID |
| `memoType` | string | 필수 | 수정할 메모 설명/유형 |
| `memo` | string | 필수 | 수정할 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 회사가 현재 사용자의 회사인지 확인한다.
4. 메모 로그가 같은 회사에 속하고 현재 사용자가 작성한 로그인지 확인한다.
5. `memoType`, `memo`를 수정한다.
6. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyMemoLog`
- 수정: `CompanyMemoLog`
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| 메모 로그 없음 또는 수정 권한 없음 | `CompanyMemoLogNotFound` | 404 |

## 16. 회사 개인 비밀 메모 로그 단건 생성 API

- API 이름: 회사 개인 비밀 메모 로그 단건 생성 API
- API 식별자: CreateCompanyPrivateMemoLog
- Method: `POST`
- Path: `/api/companies/:companyId/private-memo-logs`
- 인증: 필요
- 권한: 본인 회사에 본인 개인 비밀 메모 로그만 생성

### 목적

회사 단건 화면에서 본인만 볼 수 있는 개인 비밀 메모 로그를 독립적으로 추가한다.

### Request

- Request 이름: `CreateCompanyPrivateMemoLogRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |
| `memo` | string | 필수 | 개인 비밀 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 회사가 현재 사용자의 회사인지 확인한다.
4. 요청의 `memo`를 암호화한다.
5. 현재 userId와 companyId로 `CompanyUserPrivateMemoLog`를 생성한다.
6. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: `CompanyUserPrivateMemoLog`
- 조회: `Company`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| 비밀 메모 암호화 실패 | `PrivateMemoEncryptFailed` | 500 |

## 17. 회사 개인 비밀 메모 로그 무한스크롤 API

- API 이름: 회사 개인 비밀 메모 로그 무한스크롤 API
- API 식별자: ListCompanyPrivateMemoLogs
- Method: `GET`
- Path: `/api/companies/:companyId/private-memo-logs`
- 인증: 필요
- 권한: 본인이 작성한 회사 개인 비밀 메모 로그만 조회

### Request

- Request 이름: `ListCompanyPrivateMemoLogsQuery`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |
| `cursor` | string | 선택 | 다음 페이지 조회 cursor |

서버는 한 번에 10개를 반환한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `companyId`와 `cursor`를 validation한다.
3. 회사가 현재 사용자의 회사인지 확인한다.
4. 현재 사용자가 작성한 `CompanyUserPrivateMemoLog`만 조회한다.
5. `memoCiphertext`를 복호화해 API 응답의 `memo`로 변환한다.
6. `createdAt DESC, id DESC` 기준으로 10개 조회한다.
7. 다음 페이지가 있으면 `nextCursor`를 반환한다.

### Response

- Response 이름: `CompanyPrivateMemoLogConnectionResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `CompanyPrivateMemoLogResponse[]` | 회사 개인 비밀 메모 로그 목록 |
| `nextCursor` | string \| null | 다음 페이지 cursor |
| `hasNext` | boolean | 다음 페이지 존재 여부 |

`CompanyPrivateMemoLogResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 회사 개인 비밀 메모 로그 ID |
| `memo` | string | 복호화된 개인 비밀 메모 |
| `createdAt` | string | 메모 등록일 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyUserPrivateMemoLog`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| cursor 형식 오류 | `ValidationError` | 400 |
| 비밀 메모 복호화 실패 | `PrivateMemoDecryptFailed` | 500 |

## 18. 회사 개인 비밀 메모 로그 단건 수정 API

- API 이름: 회사 개인 비밀 메모 로그 단건 수정 API
- API 식별자: UpdateCompanyPrivateMemoLog
- Method: `PATCH`
- Path: `/api/companies/:companyId/private-memo-logs/:privateMemoLogId`
- 인증: 필요
- 권한: 본인이 작성한 회사 개인 비밀 메모 로그만 수정

### Request

- Request 이름: `UpdateCompanyPrivateMemoLogRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `companyId` | string | 필수 | 회사 ID |
| `privateMemoLogId` | string | 필수 | 회사 개인 비밀 메모 로그 ID |
| `memo` | string | 필수 | 수정할 개인 비밀 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. params와 request body를 validation한다.
3. 회사가 현재 사용자의 회사인지 확인한다.
4. 개인 비밀 메모 로그가 같은 회사에 속하고 현재 사용자가 작성한 로그인지 확인한다.
5. 요청의 `memo`를 암호화한다.
6. `memoCiphertext`, `memoKeyVersion`만 갱신한다.
7. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`

Response body 없음.

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyUserPrivateMemoLog`
- 수정: `CompanyUserPrivateMemoLog`
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 필수값 누락 또는 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| 개인 비밀 메모 로그 없음 또는 수정 권한 없음 | `CompanyPrivateMemoLogNotFound` | 404 |
| 비밀 메모 암호화 실패 | `PrivateMemoEncryptFailed` | 500 |

## 19. FE/BE 처리 기준

| API | FE 처리 기준 | BE 처리 기준 | 검증 기준 |
|---|---|---|---|
| `GET /api/companies` | 검색어, 분야, 지역, page 변경 시 목록 query를 재조회한다. 목록에는 `updatedAt`을 표시하지 않는다. | userId ownership을 기본 조건으로 두고 `createdAt DESC`와 20개 페이지네이션을 적용한다. | 검색, 필터, 페이지 이동, 본인 데이터만 조회를 확인한다. |
| `GET /api/companies/:companyId/contacts` | 회사 단건 화면에서 연결된 거래처 목록을 표시한다. 페이지네이션을 기대하지 않는다. | company ownership 확인 후 `Contact.createdAt DESC, id DESC`로 전체 목록을 반환한다. | 타 사용자 회사 404, 부서 객체 응답, 정렬을 확인한다. |
| `GET /api/companies/export/xlsx` | 회사 목록의 현재 검색어와 필터를 전달하되 `page`는 전달하지 않는다. | 동일 검색/필터 조건으로 전체 회사를 조회하고 xlsx 파일을 반환한다. | 검색/필터 반영, ID 제외, 컬럼명, 다운로드 헤더를 확인한다. |
| `GET /api/company-fields` | 회사 목록 필터와 생성/수정 form 옵션으로 사용한다. `createdAt`을 기대하지 않는다. | 현재 userId의 `CompanyField`만 반환한다. | 다른 사용자의 분야가 섞이지 않는지 확인한다. |
| `GET /api/company-regions` | 회사 목록 필터와 생성/수정 form 옵션으로 사용한다. `createdAt`을 기대하지 않는다. | 현재 userId의 `CompanyRegion`만 반환한다. | 다른 사용자의 지역이 섞이지 않는지 확인한다. |
| `GET /api/companies/:companyId` | 상세 화면 진입과 수정 성공 후 재조회한다. | companyId와 userId를 함께 조건으로 조회한다. | 본인 소유가 아닌 회사는 404인지 확인한다. |
| `POST /api/companies` | `201 Created` body 없음으로 처리하고 회사 목록을 재조회한다. | transaction 안에서 `Company`를 만들고 `companyMemo`가 있으면 `CompanyMemoLog`를 함께 만든다. | `companyMemo`가 `memoType: "초기 메모"`로 저장되는지 확인한다. |
| `PATCH /api/companies/:companyId` | `201 Created` body 없음으로 처리하고 회사 단건과 목록을 필요한 범위에서 재조회한다. | 회사명, 분야, 지역 중 요청에 포함된 값만 수정한다. | 최소 1개 필드 validation과 FK ownership을 확인한다. |
| `POST /api/company-fields` | 성공 후 회사 분야 목록을 재조회한다. | 같은 userId 안에서 field 중복을 막는다. | 중복 field 409와 정상 생성 201을 확인한다. |
| `DELETE /api/company-fields/:fieldId` | 성공 후 회사 분야 목록과 필요 시 회사 목록을 재조회한다. | 매핑된 회사가 있으면 삭제를 막는다. | in-use 409와 미사용 삭제 204를 확인한다. |
| `POST /api/company-regions` | 성공 후 회사 지역 목록을 재조회한다. | 같은 userId 안에서 region 중복을 막는다. | 중복 region 409와 정상 생성 201을 확인한다. |
| `DELETE /api/company-regions/:regionId` | 성공 후 회사 지역 목록과 필요 시 회사 목록을 재조회한다. | 매핑된 회사가 있으면 삭제를 막는다. | in-use 409와 미사용 삭제 204를 확인한다. |
| `POST /api/companies/:companyId/memo-logs` | `201 Created` body 없음으로 처리하고 회사 메모 로그 목록을 재조회한다. | `memoType`, `memo`를 필수로 받아 현재 userId와 companyId로 저장한다. | memoType 누락 validation과 정상 생성 201을 확인한다. |
| `GET /api/companies/:companyId/memo-logs` | infinite scroll cursor로 10개씩 추가 조회하고 `memoType`, `memo`, `createdAt`을 표시한다. | company ownership 확인 후 `createdAt DESC, id DESC`로 조회한다. | cursor 페이지, hasNext, 본인 회사 제한을 확인한다. |
| `PATCH /api/companies/:companyId/memo-logs/:memoLogId` | `201 Created` body 없음으로 처리하고 메모 로그 목록을 재조회하거나 로컬 상태를 갱신한다. | 같은 회사와 작성자 userId를 검증한 뒤 `memoType`, `memo`를 수정한다. | 타 사용자 로그 수정 차단과 `memoType`, `memo` 동시 수정을 확인한다. |
| `POST /api/companies/:companyId/private-memo-logs` | `201 Created` body 없음으로 처리하고 개인 비밀 메모 로그 목록을 재조회한다. | 요청 `memo`를 암호화해 `memoCiphertext`, `memoKeyVersion`으로 저장한다. | DB 평문 미저장과 정상 생성 201을 확인한다. |
| `GET /api/companies/:companyId/private-memo-logs` | infinite scroll cursor로 10개씩 추가 조회하고 복호화된 `memo`, `createdAt`을 표시한다. | 작성자 본인의 로그만 조회하고 복호화한 뒤 반환한다. | 타 사용자 비밀 메모 미노출과 복호화 실패 처리를 확인한다. |
| `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId` | `201 Created` body 없음으로 처리하고 개인 비밀 메모 로그 목록을 재조회하거나 로컬 상태를 갱신한다. | 작성자 본인의 로그인지 검증하고 `memo`를 다시 암호화해 저장한다. | 타 사용자 로그 수정 차단과 DB 평문 미저장을 확인한다. |

## 20. 관련 문서

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/DECISIONS/023_company_domain_basic_scope.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
