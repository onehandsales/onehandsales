# Company Export XLSX API Spec

## 1. 목적

이 문서는 회사 목록 페이지의 내보내기 버튼에서 사용할 xlsx 다운로드 API 계약을 정의한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_CONTACT_COUNT_API.md`

## 2. 계약 상태

- API: `GET /api/companies/export/xlsx`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 신규 API
- 대상 화면: 회사 목록 페이지
- 응답 형식: xlsx binary file

## 3. API 요약

회사 목록 페이지에서 현재 적용된 검색/필터 조건에 맞는 회사 전체 데이터를 xlsx 파일로 다운로드한다.

- 페이지네이션 없음
- `page` query는 사용하지 않는다.
- `companyName` 검색어는 export에도 적용한다.
- `companyFieldId`, `companyRegionId` 필터는 export에도 적용한다.
- 검색어와 필터가 동시에 있으면 두 조건을 모두 만족하는 회사 전체를 내보낸다.
- 필터가 있으면 필터링된 전체 회사 데이터를 내보낸다.
- 필터가 없으면 현재 사용자의 전체 회사 데이터를 내보낸다.
- 정렬: `createdAt DESC`, 보조 정렬 `id DESC`
- id 계열 값은 파일에 포함하지 않는다.

## 4. Request

- Request 이름: `ExportCompaniesXlsxRequest`
- Method: `GET`
- Path: `/api/companies/export/xlsx`
- 인증: Backend App access token 필요
- 권한: 본인 회사만 내보내기 가능

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `companyName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 회사 이름 부분 검색어 |
| query | `companyFieldId` | string | 아니오 | UUID | 회사 분야 필터 ID |
| query | `companyRegionId` | string | 아니오 | UUID | 회사 지역 필터 ID |
| query | `page` | 없음 | 아니오 | 전송하지 않음 | 내보내기는 페이지네이션을 적용하지 않음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

FE는 회사 목록 화면의 현재 검색어와 필터 query를 전달하되 `page`는 제거한다.

## 5. Response

- Response 이름: `CompanyExportXlsxFile`
- Status: `200 OK`
- Body: xlsx binary

권장 header:

| Header | Value |
|---|---|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename="companies_YYYYMMDD_HHmmss.xlsx"` |

파일 컬럼:

| 컬럼명 | 값 기준 | 설명 |
|---|---|---|
| `회사이름` | `Company.companyName` | 회사 이름 |
| `회사분야` | `CompanyField.field` | 회사 분야 표시값 |
| `회사지역` | `CompanyRegion.region` | 회사 지역 표시값 |
| `담당자 수` | 연결된 `Contact` 개수 | 해당 회사에 연결된 담당자 수 |
| `등록일` | `Company.createdAt` | `yyyy-mm-dd` 표시 형식 |

파일에 포함하지 않는 값:

- `Company.id`
- `CompanyField.id`
- `CompanyRegion.id`
- `Contact.id`
- 내부 userId
- 메모 원문
- 개인 비밀 메모 원문 또는 암호문

## 6. 필터링 예시

회사 목록 화면에서 다음 조건이 적용된 상태라고 가정한다.

- 회사명 검색어: `테크`
- 회사분야: `IT`
- 회사지역: `서울`

회사 목록 API:

```http
GET /api/companies?page=1&companyName=테크&companyFieldId=field-it&companyRegionId=region-seoul
```

내보내기 API:

```http
GET /api/companies/export/xlsx?companyName=테크&companyFieldId=field-it&companyRegionId=region-seoul
```

이때 `page=1`은 export에 적용하지 않는다. xlsx에는 회사명에 `테크`가 포함되고, 회사분야가 `field-it`이며, 회사지역이 `region-seoul`인 회사 전체가 들어간다.

xlsx 예시:

| 회사이름 | 회사분야 | 회사지역 | 담당자 수 | 등록일 |
|---|---|---|---:|---|
| 테크솔루션 | IT | 서울 | 4 | 2026-06-12 |
| 미래테크 | IT | 서울 | 2 | 2026-06-10 |
| 한빛테크 | IT | 서울 | 0 | 2026-06-07 |

지역만 필터링한 경우:

```http
GET /api/companies/export/xlsx?companyRegionId=region-busan
```

xlsx 예시:

| 회사이름 | 회사분야 | 회사지역 | 담당자 수 | 등록일 |
|---|---|---|---:|---|
| 부산세일즈랩 | 유통 | 부산 | 3 | 2026-06-11 |
| 해운대파트너스 | 금융 | 부산 | 1 | 2026-06-08 |

필터가 없는 경우:

```http
GET /api/companies/export/xlsx
```

현재 사용자의 전체 회사가 `createdAt DESC` 기준으로 내려간다.

## 7. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. export query를 validation한다.
3. `companyFieldId`, `companyRegionId`가 있으면 현재 사용자 소유인지 검증한다.
4. 기존 회사 목록과 같은 검색어와 필터 조건을 구성한다.
5. `Company.userId = currentUserId` ownership 조건을 기본으로 적용한다.
6. 페이지네이션 없이 조건에 맞는 전체 회사를 조회한다.
7. 각 회사의 연결 Contact 개수를 함께 계산한다.
8. `createdAt DESC`, `id DESC`로 정렬한다.
9. id 계열 값과 민감 원문을 제외하고 xlsx row를 만든다.
10. xlsx binary와 다운로드 header를 반환한다.

## 8. 연결 DB 스키마

- 조회: `Company`, `CompanyField`, `CompanyRegion`, `Contact`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

관계 기준:

- `Contact.companyId`는 `Company.id`를 참조한다.
- `Company`, `Contact`는 모두 `userId`를 가진 사용자 소유 데이터다.

## 9. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 파일 생성 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음

## 10. Observability

- event key: `company.exported`
- audit log: 없음
- request id: 사용
- redaction: 회사 검색어 원문, 메모 원문, 개인 비밀 메모 원문 logging 금지
- log context 권장값: `userId`, `filterKeys`, `rowCount`

## 11. Error

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 잘못된 UUID query | `ValidationError` | 400 | 내보내기 실패 안내 | log |
| 본인 소유가 아닌 분야 ID | `CompanyFieldNotFound` | 404 | 필터 초기화 또는 내보내기 실패 안내 | log |
| 본인 소유가 아닌 지역 ID | `CompanyRegionNotFound` | 404 | 필터 초기화 또는 내보내기 실패 안내 | log |
| xlsx 생성 실패 | `CompanyExportFailed` | 500 | 내보내기 실패 안내 | error |

## 12. FE/BE 처리 기준

FE:

- 회사 목록 화면의 현재 검색어와 필터 query를 export API에 전달한다.
- `page`는 전달하지 않는다.
- 응답은 JSON이 아니라 blob으로 처리한다.
- 다운로드 파일명은 Backend의 `Content-Disposition` header를 우선 사용한다.

BE:

- 기존 `GET /api/companies` JSON 응답은 변경하지 않는다.
- export API는 xlsx binary를 반환한다.
- 파일 컬럼명은 `회사이름`, `회사분야`, `회사지역`, `담당자 수`, `등록일`로 고정한다.
- N+1 count 쿼리가 생기지 않도록 회사 조회 단계에서 담당자 수를 함께 집계한다.
- 범용 `ExportJob`이나 비동기 export queue는 이 API 범위에 포함하지 않는다.

## 13. 검증 기준

- 필터가 없으면 현재 사용자의 전체 회사가 xlsx에 포함된다.
- `companyName` 필터가 있으면 해당 검색어 조건에 맞는 회사만 포함된다.
- `companyFieldId`, `companyRegionId` 필터가 있으면 해당 조건에 맞는 회사만 포함된다.
- `companyName`, `companyFieldId`, `companyRegionId`가 함께 있으면 세 조건을 모두 만족하는 회사만 포함된다.
- xlsx 컬럼명은 `회사이름`, `회사분야`, `회사지역`, `담당자 수`, `등록일`이다.
- id 계열 값은 xlsx에 포함되지 않는다.
- 정렬은 `createdAt DESC`, `id DESC` 기준이다.
- 다른 사용자의 회사나 담당자 수가 섞이지 않는다.
