# Company API Detail

## 1. 목적

이 문서는 사용자 페이지 회사 도메인 API의 요청값, 응답값, 내부 비즈니스 로직, 연결 DB, 에러, FE/BE 처리 기준을 API별로 고정한다.

작성 기준:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`

## 2. 공통 규칙

- 대상은 사용자 페이지 API다. 관리자 API는 현재 범위가 아니다.
- 모든 API는 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- 모든 조회/생성/수정/삭제는 현재 로그인한 `userId` ownership을 검증한다.
- response body 없는 성공 응답은 FE가 status code만 보고 성공 처리한다.
- 날짜는 ISO 8601 string으로 반환한다.
- 회사 목록 page size는 20개 고정이다.
- 회사 메모 로그와 개인 비밀 메모 로그 page size는 10개 고정이다.
- 회사 개인 비밀 메모는 API에서는 `memo`를 사용하지만 DB에는 평문으로 저장하지 않는다.

## 3. API 목록

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

## 3.1. API 계약 운영 기준

모든 API의 소비자는 `User Web`이며, 계약 상태는 현재 Backend 구현과 검증 대상 기준으로 `implemented`로 둔다.

| API | 계약 상태 | Transaction | Observability |
|---|---|---|---|
| `GET /api/companies` | implemented | 없음. 조회 전용 | event key: `company.listed`, audit log: 없음, request id: 사용, redaction: 회사 검색어 원문 logging 금지 |
| `GET /api/company-fields` | implemented | 없음. 조회 전용 | event key: `companyField.listed`, audit log: 없음, request id: 사용, redaction: 없음 |
| `GET /api/company-regions` | implemented | 없음. 조회 전용 | event key: `companyRegion.listed`, audit log: 없음, request id: 사용, redaction: 없음 |
| `GET /api/companies/:companyId` | implemented | 없음. 조회 전용 | event key: `company.viewed`, audit log: 없음, request id: 사용, redaction: 회사명 원문 logging 금지 |
| `GET /api/companies/:companyId/contacts` | implemented | 없음. 조회 전용 | event key: `company.contactsListed`, audit log: 없음, request id: 사용, redaction: 담당자명 원문 logging 금지 |
| `GET /api/companies/export/xlsx` | implemented | 없음. 조회 전용 | event key: `company.exported`, audit log: 없음, request id: 사용, redaction: 회사 검색어 원문 logging 금지 |
| `POST /api/companies` | implemented | 필요. `Company`와 조건부 `CompanyMemoLog`를 같은 transaction에서 생성 | event key: `company.created`, audit log: 없음, request id: 사용, redaction: `companyMemo` 원문 logging 금지 |
| `PATCH /api/companies/:companyId` | implemented | 없음. 단일 `Company` 수정 | event key: `company.updated`, audit log: 없음, request id: 사용, redaction: 회사명 원문 logging 금지 |
| `POST /api/company-fields` | implemented | 없음. 단일 `CompanyField` 생성 | event key: `companyField.created`, audit log: 없음, request id: 사용, redaction: 없음 |
| `DELETE /api/company-fields/:fieldId` | implemented | 없음. 사용 여부 검증 후 단일 삭제 | event key: `companyField.deleted`, audit log: 없음, request id: 사용, redaction: 없음 |
| `POST /api/company-regions` | implemented | 없음. 단일 `CompanyRegion` 생성 | event key: `companyRegion.created`, audit log: 없음, request id: 사용, redaction: 없음 |
| `DELETE /api/company-regions/:regionId` | implemented | 없음. 사용 여부 검증 후 단일 삭제 | event key: `companyRegion.deleted`, audit log: 없음, request id: 사용, redaction: 없음 |
| `POST /api/companies/:companyId/memo-logs` | implemented | 없음. 회사 ownership 확인 후 단일 `CompanyMemoLog` 생성 | event key: `companyMemoLog.created`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `GET /api/companies/:companyId/memo-logs` | implemented | 없음. 조회 전용 | event key: `companyMemoLog.listed`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `PATCH /api/companies/:companyId/memo-logs/:memoLogId` | implemented | 없음. 단일 `CompanyMemoLog.memoType`, `CompanyMemoLog.memo` 수정 | event key: `companyMemoLog.updated`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `POST /api/companies/:companyId/private-memo-logs` | implemented | 없음. 암호화 후 단일 `CompanyUserPrivateMemoLog` 생성 | event key: `companyPrivateMemoLog.created`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |
| `GET /api/companies/:companyId/private-memo-logs` | implemented | 없음. 작성자 본인 로그 조회와 복호화 | event key: `companyPrivateMemoLog.listed`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |
| `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId` | implemented | 없음. 암호화 후 단일 `CompanyUserPrivateMemoLog` 수정 | event key: `companyPrivateMemoLog.updated`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |

위 event key는 structured log나 error context에서 사용할 표준 이름이다. 현재 scope에서는 관리자 감사 로그가 없으므로 audit log는 모두 `없음`으로 둔다.

## 4. 회사 페이지네이션 API

- API 이름: 회사 페이지네이션 API
- API 식별자: `ListCompanies`
- Method: `GET`
- Path: `/api/companies`
- 인증: Backend App access token
- 권한: 본인 회사만 조회

### Request

- Request 이름: `ListCompaniesQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `page` | number | 아니오 | 1 이상 정수. 기본 1 | 현재 페이지 |
| query | `companyName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 회사 이름 부분 검색어 |
| query | `companyFieldId` | string | 아니오 | UUID | 회사 분야 필터 ID |
| query | `companyRegionId` | string | 아니오 | UUID | 회사 지역 필터 ID |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. query를 validation하고 page 기본값을 1로 정한다.
3. 기본 where 조건에 `Company.userId = currentUserId`를 적용한다.
4. `companyName`이 있으면 회사 이름 부분 검색 조건을 적용한다.
5. `companyFieldId`가 있으면 같은 userId의 `CompanyField`인지 확인한 뒤 필터를 적용한다.
6. `companyRegionId`가 있으면 같은 userId의 `CompanyRegion`인지 확인한 뒤 필터를 적용한다.
7. `createdAt DESC, id DESC`로 정렬한다.
8. page size 20으로 `items`, `totalCount`를 조회한다.
9. 각 회사에 연결된 `Contact` 개수를 계산해 `contactCount`로 넣는다.
10. `CompanyField`, `CompanyRegion` relation을 포함해 list item DTO로 변환한다.
11. 목록 응답에는 `updatedAt`을 넣지 않는다.

### Response

- Response 이름: `CompanyPageResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `CompanyListItemResponse[]` | 아니오 | 회사 목록 |
| `items[].id` | string | 아니오 | 회사 ID |
| `items[].companyName` | string | 아니오 | 회사 이름 |
| `items[].companyField.id` | string | 아니오 | 회사 분야 ID |
| `items[].companyField.field` | string | 아니오 | 회사 분야 이름 |
| `items[].companyRegion.id` | string | 아니오 | 회사 지역 ID |
| `items[].companyRegion.region` | string | 아니오 | 회사 지역 이름 |
| `items[].contactCount` | number | 아니오 | 해당 회사에 연결된 담당자 수 |
| `items[].createdAt` | string | 아니오 | 회사 등록일 |
| `page` | number | 아니오 | 현재 페이지 |
| `pageSize` | number | 아니오 | 20 |
| `totalCount` | number | 아니오 | 전체 개수 |
| `totalPages` | number | 아니오 | 전체 페이지 수 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyField`, `CompanyRegion`, `Contact`, `Deal`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| query validation 실패 | `ValidationError` | 400 |
| 본인 소유가 아닌 분야 ID | `CompanyFieldNotFound` | 404 |
| 본인 소유가 아닌 지역 ID | `CompanyRegionNotFound` | 404 |

### FE/BE 처리 기준

- FE: 검색어/필터/page 변경 시 목록 query를 재조회한다.
- FE: 회사 목록에는 최근 수정일을 표시하지 않는다. 담당자 수는 `contactCount`, 딜 수는 `dealCount`를 사용한다.
- BE: repository는 항상 userId 조건을 포함한다.
- 검증: 검색, 필터, 페이지네이션, 타 사용자 데이터 미노출을 확인한다.

## 5. 회사 분야 전체 조회 API

- API 이름: 회사 분야 전체 조회 API
- API 식별자: `ListCompanyFields`
- Method: `GET`
- Path: `/api/company-fields`
- 인증: Backend App access token
- 권한: 본인 회사 분야만 조회

### Request

- Request 이름: `ListCompanyFieldsRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| query | 없음 | 없음 | 아니오 | 없음 | query 없음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. 현재 userId의 `CompanyField` 목록을 조회한다.
3. `field ASC, id ASC`로 안정적인 정렬을 적용한다.
4. `id`, `field`만 response DTO로 변환한다.
5. `createdAt`은 응답하지 않는다.

### Response

- Response 이름: `CompanyFieldListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `CompanyFieldResponse[]` | 아니오 | 회사 분야 목록 |
| `items[].id` | string | 아니오 | 회사 분야 ID |
| `items[].field` | string | 아니오 | 회사 분야 이름 |

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

### FE/BE 처리 기준

- FE: 회사 목록 필터, 회사 생성, 회사 수정 form 옵션으로 사용한다.
- FE: `createdAt` 필드를 기대하지 않는다.
- BE: 현재 userId의 분야만 반환한다.
- 검증: 타 사용자 분야가 섞이지 않는지 확인한다.

## 6. 회사 지역 전체 조회 API

- API 이름: 회사 지역 전체 조회 API
- API 식별자: `ListCompanyRegions`
- Method: `GET`
- Path: `/api/company-regions`
- 인증: Backend App access token
- 권한: 본인 회사 지역만 조회

### Request

- Request 이름: `ListCompanyRegionsRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| query | 없음 | 없음 | 아니오 | 없음 | query 없음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. 현재 userId의 `CompanyRegion` 목록을 조회한다.
3. `region ASC, id ASC`로 안정적인 정렬을 적용한다.
4. `id`, `region`만 response DTO로 변환한다.
5. `createdAt`은 응답하지 않는다.

### Response

- Response 이름: `CompanyRegionListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `CompanyRegionResponse[]` | 아니오 | 회사 지역 목록 |
| `items[].id` | string | 아니오 | 회사 지역 ID |
| `items[].region` | string | 아니오 | 회사 지역 이름 |

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

### FE/BE 처리 기준

- FE: 회사 목록 필터, 회사 생성, 회사 수정 form 옵션으로 사용한다.
- FE: `createdAt` 필드를 기대하지 않는다.
- BE: 현재 userId의 지역만 반환한다.
- 검증: 타 사용자 지역이 섞이지 않는지 확인한다.

## 7. 회사 단건 조회 API

- API 이름: 회사 단건 조회 API
- API 식별자: `GetCompany`
- Method: `GET`
- Path: `/api/companies/:companyId`
- 인증: Backend App access token
- 권한: 본인 회사만 조회

### Request

- Request 이름: `GetCompanyRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `companyId` path param을 validation한다.
3. `Company.id = companyId`와 `Company.userId = currentUserId`를 함께 조건으로 조회한다.
4. `CompanyField`, `CompanyRegion` relation을 함께 조회한다.
5. 상세 response DTO로 변환한다.
6. 단건 응답에서는 `contactCount`, `dealCount`를 계산하지 않는다. 회사 목록의 담당자 수와 딜 수는 `GET /api/companies` 응답의 `contactCount`, `dealCount`를 사용한다.

### Response

- Response 이름: `CompanyDetailResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 회사 ID |
| `companyName` | string | 아니오 | 회사 이름 |
| `companyField.id` | string | 아니오 | 회사 분야 ID |
| `companyField.field` | string | 아니오 | 회사 분야 이름 |
| `companyRegion.id` | string | 아니오 | 회사 지역 ID |
| `companyRegion.region` | string | 아니오 | 회사 지역 이름 |
| `createdAt` | string | 아니오 | 회사 등록일 |
| `updatedAt` | string | 아니오 | 회사 최근 수정일 |

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
| companyId 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |

### FE/BE 처리 기준

- FE: 상세 진입, 회사 수정 성공 후 재조회한다.
- FE: 회사 단건 응답 자체에서 담당자 수와 딜 수를 기대하지 않는다. 연결 Contact 목록은 `GET /api/companies/:companyId/contacts`, 연결 Deal 목록은 `GET /api/companies/:companyId/deals`로 별도 조회한다.
- BE: 타 사용자 회사는 404로 숨긴다.
- 검증: 본인 회사 조회 성공, 타 사용자 회사 404를 확인한다.

## 8. 회사 단건 생성 API

- API 이름: 회사 단건 생성 API
- API 식별자: `CreateCompany`
- Method: `POST`
- Path: `/api/companies`
- 인증: Backend App access token
- 권한: 본인 회사만 생성

### Request

- Request 이름: `CreateCompanyRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| body | `companyName` | string | 예 | trim 후 1자 이상 | 회사 이름 |
| body | `companyFieldId` | string | 예 | UUID | 회사 분야 ID |
| body | `companyRegionId` | string | 예 | UUID | 회사 지역 ID |
| body | `companyMemo` | string \| null | 아니오 | trim 후 빈 문자열이면 미생성 | 첫 회사 메모 로그 내용 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. request body를 validation한다.
3. `companyFieldId`가 현재 userId의 `CompanyField`인지 확인한다.
4. `companyRegionId`가 현재 userId의 `CompanyRegion`인지 확인한다.
5. transaction을 시작한다.
6. `Company`를 생성한다.
7. `companyMemo`가 있으면 `CompanyMemoLog`를 함께 생성한다.
8. 회사 생성 시 만들어지는 첫 메모 로그의 `memoType`은 서버가 `초기 메모`로 저장한다.
9. transaction을 commit한다.
10. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: `Company`, `CompanyMemoLog` 조건부
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

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 회사 목록을 재조회한다.
- FE: `companyMemo`는 Company 컬럼이 아니라 첫 메모 로그라는 UI 문구를 사용한다.
- BE: transaction은 application use case에서 시작한다.
- 검증: 메모 없는 생성, 메모 있는 생성, FK ownership 실패를 확인한다.

## 9. 회사 기본 정보 수정 API

- API 이름: 회사 기본 정보 수정 API
- API 식별자: `UpdateCompany`
- Method: `PATCH`
- Path: `/api/companies/:companyId`
- 인증: Backend App access token
- 권한: 본인 회사만 수정

### Request

- Request 이름: `UpdateCompanyRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| body | `companyName` | string | 아니오 | 포함 시 trim 후 1자 이상 | 수정할 회사 이름 |
| body | `companyFieldId` | string | 아니오 | 포함 시 UUID | 수정할 회사 분야 ID |
| body | `companyRegionId` | string | 아니오 | 포함 시 UUID | 수정할 회사 지역 ID |

`companyName`, `companyFieldId`, `companyRegionId` 중 최소 1개는 필요하다.

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `companyId`와 body를 validation한다.
3. `Company.id = companyId`, `Company.userId = currentUserId` 조건으로 회사를 조회한다.
4. `companyFieldId`가 있으면 현재 userId의 `CompanyField`인지 확인한다.
5. `companyRegionId`가 있으면 현재 userId의 `CompanyRegion`인지 확인한다.
6. 요청에 포함된 필드만 `Company`에 반영한다.
7. `updatedAt`은 DB의 `@updatedAt` 정책으로 갱신된다.
8. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyField` 조건부, `CompanyRegion` 조건부
- 수정: `Company`
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 수정 필드 없음 또는 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| 회사 분야 없음 또는 본인 소유 아님 | `CompanyFieldNotFound` | 404 |
| 회사 지역 없음 또는 본인 소유 아님 | `CompanyRegionNotFound` | 404 |

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 상세와 목록을 필요한 범위에서 재조회한다.
- BE: 회사 분야/지역 값 자체를 수정하지 않고 Company FK만 변경한다.
- 검증: 각 필드 단독 수정, 복합 수정, FK ownership 실패를 확인한다.

## 10. 회사 분야 단건 생성 API

- API 이름: 회사 분야 단건 생성 API
- API 식별자: `CreateCompanyField`
- Method: `POST`
- Path: `/api/company-fields`
- 인증: Backend App access token
- 권한: 본인 회사 분야만 생성

### Request

- Request 이름: `CreateCompanyFieldRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| body | `field` | string | 예 | trim 후 1자 이상 | 회사 분야 이름 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `field`를 validation하고 trim한다.
3. 같은 userId 안에서 동일한 `field`가 있는지 확인한다.
4. 없으면 `CompanyField`를 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

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
| field 누락 또는 형식 오류 | `ValidationError` | 400 |
| 같은 분야 중복 | `DuplicateCompanyField` | 409 |

### FE/BE 처리 기준

- FE: 성공 시 회사 분야 목록을 재조회한다.
- BE: userId + field unique 정책을 지킨다.
- 검증: 정상 생성, 중복 생성 409를 확인한다.

## 11. 회사 분야 단건 삭제 API

- API 이름: 회사 분야 단건 삭제 API
- API 식별자: `DeleteCompanyField`
- Method: `DELETE`
- Path: `/api/company-fields/:fieldId`
- 인증: Backend App access token
- 권한: 본인 회사 분야만 삭제

### Request

- Request 이름: `DeleteCompanyFieldRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `fieldId` | string | 예 | UUID | 회사 분야 ID |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `fieldId`를 validation한다.
3. 현재 userId의 `CompanyField`인지 확인한다.
4. 해당 fieldId를 사용하는 `Company`가 하나라도 있는지 확인한다.
5. 매핑된 회사가 있으면 삭제하지 않고 `CompanyFieldInUse`를 반환한다.
6. 매핑된 회사가 없으면 `CompanyField`를 삭제한다.
7. `204 No Content`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `204 No Content`
- Body: 없음

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
| fieldId 형식 오류 | `ValidationError` | 400 |
| 분야 없음 또는 본인 소유 아님 | `CompanyFieldNotFound` | 404 |
| 이미 회사에 매핑됨 | `CompanyFieldInUse` | 409 |

### FE/BE 처리 기준

- FE: 성공 시 회사 분야 목록을 재조회한다.
- FE: 409는 "사용 중인 분야는 삭제할 수 없음"으로 표시한다.
- BE: FK 참조가 있는 삭제를 application use case에서 사전 차단한다.
- 검증: 미사용 삭제 204, 사용 중 삭제 409를 확인한다.

## 12. 회사 지역 단건 생성 API

- API 이름: 회사 지역 단건 생성 API
- API 식별자: `CreateCompanyRegion`
- Method: `POST`
- Path: `/api/company-regions`
- 인증: Backend App access token
- 권한: 본인 회사 지역만 생성

### Request

- Request 이름: `CreateCompanyRegionRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| body | `region` | string | 예 | trim 후 1자 이상 | 회사 지역 이름 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `region`을 validation하고 trim한다.
3. 같은 userId 안에서 동일한 `region`이 있는지 확인한다.
4. 없으면 `CompanyRegion`을 생성한다.
5. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

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
| region 누락 또는 형식 오류 | `ValidationError` | 400 |
| 같은 지역 중복 | `DuplicateCompanyRegion` | 409 |

### FE/BE 처리 기준

- FE: 성공 시 회사 지역 목록을 재조회한다.
- BE: userId + region unique 정책을 지킨다.
- 검증: 정상 생성, 중복 생성 409를 확인한다.

## 13. 회사 지역 단건 삭제 API

- API 이름: 회사 지역 단건 삭제 API
- API 식별자: `DeleteCompanyRegion`
- Method: `DELETE`
- Path: `/api/company-regions/:regionId`
- 인증: Backend App access token
- 권한: 본인 회사 지역만 삭제

### Request

- Request 이름: `DeleteCompanyRegionRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `regionId` | string | 예 | UUID | 회사 지역 ID |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `regionId`를 validation한다.
3. 현재 userId의 `CompanyRegion`인지 확인한다.
4. 해당 regionId를 사용하는 `Company`가 하나라도 있는지 확인한다.
5. 매핑된 회사가 있으면 삭제하지 않고 `CompanyRegionInUse`를 반환한다.
6. 매핑된 회사가 없으면 `CompanyRegion`을 삭제한다.
7. `204 No Content`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `204 No Content`
- Body: 없음

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
| regionId 형식 오류 | `ValidationError` | 400 |
| 지역 없음 또는 본인 소유 아님 | `CompanyRegionNotFound` | 404 |
| 이미 회사에 매핑됨 | `CompanyRegionInUse` | 409 |

### FE/BE 처리 기준

- FE: 성공 시 회사 지역 목록을 재조회한다.
- FE: 409는 "사용 중인 지역은 삭제할 수 없음"으로 표시한다.
- BE: FK 참조가 있는 삭제를 application use case에서 사전 차단한다.
- 검증: 미사용 삭제 204, 사용 중 삭제 409를 확인한다.

## 14. 회사 메모 로그 단건 생성 API

- API 이름: 회사 메모 로그 단건 생성 API
- API 식별자: `CreateCompanyMemoLog`
- Method: `POST`
- Path: `/api/companies/:companyId/memo-logs`
- 인증: Backend App access token
- 권한: 본인 회사에만 생성

### Request

- Request 이름: `CreateCompanyMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| body | `memoType` | string | 예 | trim 후 1자 이상 | 메모 설명. 예: 첫 접촉, 전화 통화, 영업 방문 |
| body | `memo` | string | 예 | trim 후 1자 이상 | 회사 특징 메모 본문 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `companyId`, `memoType`, `memo`를 validation한다.
3. 회사가 현재 userId의 회사인지 확인한다.
4. `CompanyMemoLog`를 생성한다.
5. `CompanyMemoLog.userId`에는 현재 userId를 저장한다.
6. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

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

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 메모 로그 목록을 재조회한다.
- FE: `memoType`은 짧은 유형 입력으로 받는다.
- BE: 현재 회사 ownership 검증 후 저장한다.
- 검증: 정상 생성, memoType 누락, 타 사용자 회사 생성을 확인한다.

## 15. 회사 메모 로그 무한스크롤 API

- API 이름: 회사 메모 로그 무한스크롤 API
- API 식별자: `ListCompanyMemoLogs`
- Method: `GET`
- Path: `/api/companies/:companyId/memo-logs`
- 인증: Backend App access token
- 권한: 본인 회사의 메모 로그만 조회

### Request

- Request 이름: `ListCompanyMemoLogsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| query | `cursor` | string | 아니오 | 서버 발급 cursor | 다음 페이지 cursor |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `companyId`, `cursor`를 validation한다.
3. 회사가 현재 userId의 회사인지 확인한다.
4. `CompanyMemoLog.companyId = companyId` 조건으로 조회한다.
5. `createdAt DESC, id DESC` 기준으로 10개 조회한다.
6. 11번째 데이터 존재 여부 또는 cursor 방식으로 `hasNext`, `nextCursor`를 계산한다.
7. `id`, `memoType`, `memo`, `createdAt`만 응답한다.

### Response

- Response 이름: `CompanyMemoLogConnectionResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `CompanyMemoLogResponse[]` | 아니오 | 메모 로그 목록 |
| `items[].id` | string | 아니오 | 메모 로그 ID |
| `items[].memoType` | string | 아니오 | 메모 설명/유형 |
| `items[].memo` | string | 아니오 | 메모 본문 |
| `items[].createdAt` | string | 아니오 | 등록일 |
| `nextCursor` | string | 예 | 다음 페이지 cursor |
| `hasNext` | boolean | 아니오 | 다음 페이지 존재 여부 |

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
| cursor 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |

### FE/BE 처리 기준

- FE: infinite scroll로 `nextCursor`가 있을 때 다음 10개를 요청한다.
- FE: `memoType`, `memo`, `createdAt`을 표시한다.
- BE: 회사 ownership 확인 후 로그를 조회한다.
- 검증: 첫 페이지, 다음 페이지, 타 사용자 회사 차단을 확인한다.

## 16. 회사 메모 로그 단건 수정 API

- API 이름: 회사 메모 로그 단건 수정 API
- API 식별자: `UpdateCompanyMemoLog`
- Method: `PATCH`
- Path: `/api/companies/:companyId/memo-logs/:memoLogId`
- 인증: Backend App access token
- 권한: 본인 회사의 본인 메모 로그만 수정

### Request

- Request 이름: `UpdateCompanyMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| path | `memoLogId` | string | 예 | UUID | 메모 로그 ID |
| body | `memoType` | string | 예 | trim 후 1자 이상 | 수정할 메모 설명/유형 |
| body | `memo` | string | 예 | trim 후 1자 이상 | 수정할 메모 본문 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. params와 body를 validation한다.
3. 회사가 현재 userId의 회사인지 확인한다.
4. 메모 로그가 같은 companyId에 속하는지 확인한다.
5. 메모 로그의 userId가 현재 userId인지 확인한다.
6. `memoType`, `memo`를 수정한다.
7. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyMemoLog`
- 수정: `CompanyMemoLog.memoType`, `CompanyMemoLog.memo`
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

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 목록 재조회 또는 로컬 상태 갱신을 한다.
- BE: `memoType`, `memo`를 함께 validation하고 수정한다.
- 검증: 타 사용자 로그 수정 차단, `memoType`과 `memo` 동시 수정을 확인한다.

## 17. 회사 개인 비밀 메모 로그 단건 생성 API

- API 이름: 회사 개인 비밀 메모 로그 단건 생성 API
- API 식별자: `CreateCompanyPrivateMemoLog`
- Method: `POST`
- Path: `/api/companies/:companyId/private-memo-logs`
- 인증: Backend App access token
- 권한: 본인 회사에 본인 비밀 메모만 생성

### Request

- Request 이름: `CreateCompanyPrivateMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| body | `memo` | string | 예 | trim 후 1자 이상 | 개인 비밀 메모 본문 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `companyId`, `memo`를 validation한다.
3. 회사가 현재 userId의 회사인지 확인한다.
4. application port인 `EncryptionPort`로 `memo`를 암호화한다.
5. `CompanyUserPrivateMemoLog`를 생성한다.
6. DB에는 `memoCiphertext`, `memoKeyVersion`만 저장하고 평문 `memo`는 저장하지 않는다.
7. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

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

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 개인 비밀 메모 목록을 재조회한다.
- FE: 암호화/복호화 로직을 직접 구현하지 않는다.
- BE: 평문 memo를 DB에 저장하지 않는다.
- 검증: DB 평문 미저장, 암호화 실패 처리, 타 사용자 회사 차단을 확인한다.

## 18. 회사 개인 비밀 메모 로그 무한스크롤 API

- API 이름: 회사 개인 비밀 메모 로그 무한스크롤 API
- API 식별자: `ListCompanyPrivateMemoLogs`
- Method: `GET`
- Path: `/api/companies/:companyId/private-memo-logs`
- 인증: Backend App access token
- 권한: 본인이 작성한 회사 개인 비밀 메모만 조회

### Request

- Request 이름: `ListCompanyPrivateMemoLogsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| query | `cursor` | string | 아니오 | 서버 발급 cursor | 다음 페이지 cursor |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `companyId`, `cursor`를 validation한다.
3. 회사가 현재 userId의 회사인지 확인한다.
4. `CompanyUserPrivateMemoLog.companyId = companyId`와 `userId = currentUserId` 조건으로 조회한다.
5. `createdAt DESC, id DESC` 기준으로 10개 조회한다.
6. 각 row의 `memoCiphertext`를 `EncryptionPort`로 복호화한다.
7. 복호화된 `memo`, `id`, `createdAt`으로 response DTO를 만든다.
8. `hasNext`, `nextCursor`를 계산한다.

### Response

- Response 이름: `CompanyPrivateMemoLogConnectionResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `CompanyPrivateMemoLogResponse[]` | 아니오 | 개인 비밀 메모 로그 목록 |
| `items[].id` | string | 아니오 | 개인 비밀 메모 로그 ID |
| `items[].memo` | string | 아니오 | 복호화된 개인 비밀 메모 |
| `items[].createdAt` | string | 아니오 | 등록일 |
| `nextCursor` | string | 예 | 다음 페이지 cursor |
| `hasNext` | boolean | 아니오 | 다음 페이지 존재 여부 |

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
| cursor 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |
| 비밀 메모 복호화 실패 | `PrivateMemoDecryptFailed` | 500 |

### FE/BE 처리 기준

- FE: infinite scroll로 `nextCursor`가 있을 때 다음 10개를 요청한다.
- FE: 복호화된 `memo`, `createdAt`만 표시한다.
- BE: 작성자 본인의 로그만 조회하고 관리자도 원문을 볼 수 없다.
- 검증: 타 사용자 비밀 메모 미노출, 복호화 실패 처리를 확인한다.

## 19. 회사 개인 비밀 메모 로그 단건 수정 API

- API 이름: 회사 개인 비밀 메모 로그 단건 수정 API
- API 식별자: `UpdateCompanyPrivateMemoLog`
- Method: `PATCH`
- Path: `/api/companies/:companyId/private-memo-logs/:privateMemoLogId`
- 인증: Backend App access token
- 권한: 본인이 작성한 회사 개인 비밀 메모만 수정

### Request

- Request 이름: `UpdateCompanyPrivateMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | Bearer token | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| path | `privateMemoLogId` | string | 예 | UUID | 개인 비밀 메모 로그 ID |
| body | `memo` | string | 예 | trim 후 1자 이상 | 수정할 개인 비밀 메모 본문 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. params와 body를 validation한다.
3. 회사가 현재 userId의 회사인지 확인한다.
4. 개인 비밀 메모 로그가 같은 companyId에 속하는지 확인한다.
5. 개인 비밀 메모 로그의 userId가 현재 userId인지 확인한다.
6. 요청 `memo`를 `EncryptionPort`로 암호화한다.
7. `memoCiphertext`, `memoKeyVersion`만 갱신한다.
8. 평문 `memo`는 DB에 저장하지 않는다.
9. `201 Created`와 빈 body를 반환한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `CompanyUserPrivateMemoLog`
- 수정: `CompanyUserPrivateMemoLog.memoCiphertext`, `CompanyUserPrivateMemoLog.memoKeyVersion`
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

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 목록 재조회 또는 로컬 상태 갱신을 한다.
- FE: 암호화/복호화 로직을 직접 구현하지 않는다.
- BE: memo 평문을 저장하지 않고 암호화된 값만 갱신한다.
- 검증: 타 사용자 로그 수정 차단, DB 평문 미저장, 암호화 실패 처리를 확인한다.

## 20. 추가 유지보수 API

### 20.1. 회사 연결 Contact 전체 조회 API

- API 이름: 회사 연결 Contact 전체 조회 API
- API 식별자: `ListCompanyContacts`
- 계약 상태: `implemented`
- 소비자: User Web
- Method: `GET`
- Path: `/api/companies/:companyId/contacts`
- 인증: Backend App access token
- 권한: 본인 회사에 연결된 담당자만 조회

#### Request

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `companyId` | string | 예 | UUID | 회사 ID |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

#### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. `companyId` path param을 validation한다.
3. `Company.id = companyId`, `Company.userId = currentUserId` 조건으로 회사 ownership을 확인한다.
4. `Contact.companyId = companyId`, `Contact.userId = currentUserId` 조건으로 연결 담당자 전체 목록을 조회한다.
5. `createdAt DESC, id DESC`로 정렬한다.
6. `id`, `username`, `contactDepartment.id`, `contactDepartment.departmentName`만 응답한다.

#### Response

- Status: `200 OK`
- Response 이름: `CompanyContactListResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `CompanyContactItemResponse[]` | 아니오 | 회사에 연결된 담당자 목록 |
| `items[].id` | string | 아니오 | 담당자 ID |
| `items[].username` | string | 아니오 | 담당자 이름 |
| `items[].contactDepartment.id` | string | 아니오 | 담당자 부서 ID |
| `items[].contactDepartment.departmentName` | string | 아니오 | 담당자 부서명 |

#### 연결된 DB 스키마

- 조회: `Company`, `Contact`, `ContactDepartment`
- transaction: 없음. 조회 전용
- 감사 로그: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| companyId 형식 오류 | `ValidationError` | 400 |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 |

### 20.2. 회사 목록 xlsx 내보내기 API

- API 이름: 회사 목록 xlsx 내보내기 API
- API 식별자: `ExportCompaniesXlsx`
- 계약 상태: `implemented`
- 소비자: User Web
- Method: `GET`
- Path: `/api/companies/export/xlsx`
- 인증: Backend App access token
- 권한: 본인 회사만 export

#### Request

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | `companyName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 회사 이름 부분 검색어 |
| query | `companyFieldId` | string | 아니오 | UUID | 회사 분야 필터 ID |
| query | `companyRegionId` | string | 아니오 | UUID | 회사 지역 필터 ID |

`page`는 받지 않는다. export는 현재 검색어와 필터 조건에 맞는 전체 데이터를 대상으로 한다.

#### Response

- Status: `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="companies_YYYYMMDD_HHmmss.xlsx"`
- xlsx 컬럼: `회사이름`, `회사분야`, `회사지역`, `담당자 수`, `등록일`
- xlsx 제외 필드: 회사 ID, 분야 ID, 지역 ID, userId, memo/private memo

#### 내부 비즈니스 로직

1. AuthGuard로 현재 userId를 확인한다.
2. query를 validation한다.
3. `companyFieldId`, `companyRegionId`가 있으면 현재 userId 소유인지 확인한다.
4. `page` 없이 `Company.userId = currentUserId`와 검색/필터 조건을 적용한다.
5. `createdAt DESC, id DESC`로 정렬한다.
6. 각 회사의 연결 담당자 수를 `담당자 수` 컬럼으로 넣는다.
7. xlsx 파일을 생성해 다운로드 응답으로 반환한다.

#### 연결된 DB 스키마

- 조회: `Company`, `CompanyField`, `CompanyRegion`, `Contact`
- transaction: 없음. 조회 전용
- 감사 로그: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| query validation 실패 | `ValidationError` | 400 |
| 본인 소유가 아닌 분야 ID | `CompanyFieldNotFound` | 404 |
| 본인 소유가 아닌 지역 ID | `CompanyRegionNotFound` | 404 |
| xlsx 생성 실패 | `CompanyExportFailed` | 500 |

## 21. 관련 문서

- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
