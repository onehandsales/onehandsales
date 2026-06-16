# Company Export Deal Count API Spec

## 1. 목적

회사 xlsx 내보내기 API에 회사별 연결 딜 수 `dealCount` 컬럼을 추가한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_EXPORT_XLSX_API.md`

## 2. 계약 상태

- API: `GET /api/companies/export/xlsx`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 기존 xlsx 파일에 컬럼 추가
- 응답 형식: xlsx binary file

## 3. 변경 요약

회사 목록 export 파일에 `딜 수` 컬럼을 추가한다. 기존 검색/필터 조건과 페이지 제외 규칙은 유지한다.

## 4. Request

기존 `GET /api/companies/export/xlsx` 요청값을 변경하지 않는다.

- Request 이름: `ExportCompaniesXlsxRequest`
- Method: `GET`
- Path: `/api/companies/export/xlsx`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `companyName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 회사명 부분 검색 |
| query | `companyFieldId` | string | 아니오 | UUID | 회사 분야 필터 |
| query | `companyRegionId` | string | 아니오 | UUID | 회사 지역 필터 |
| query | `page` | 없음 | 아니오 | 전송하지 않음 | export는 페이지네이션을 적용하지 않음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

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
| `회사명` | `Company.companyName` | 회사명 |
| `분야` | `CompanyField.field` | 회사 분야 |
| `지역` | `CompanyRegion.region` | 회사 지역 |
| `담당자 수` | `Contact` count | 기존 contactCount |
| `딜 수` | `Deal` count | 추가 dealCount |
| `등록일` | `Company.createdAt` | `yyyy-mm-dd` 표시 형식 |

파일에 포함하지 않는 값:

- `Company.id`
- 내부 userId
- 메모 원문
- 개인 비밀 메모 원문 또는 암호문

## 6. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. export query를 validation한다.
3. 회사 분야/지역 필터가 있으면 현재 사용자 소유인지 확인한다.
4. 기존 회사 목록과 동일한 검색/필터 조건을 구성한다.
5. 페이지네이션 없이 현재 사용자 회사 전체를 조회한다.
6. `Contact` 개수와 `Deal` 개수를 회사별로 집계한다.
7. xlsx row에 `담당자 수`, `딜 수`를 포함한다.
8. xlsx binary와 다운로드 header를 반환한다.

## 7. 연결 DB 스키마

- 조회: `Company`, `CompanyField`, `CompanyRegion`, `Contact`, `Deal`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

## 8. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 파일 생성 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음
- audit log 포함: 없음

## 9. Observability

- event key: `company.exported`
- audit log: 없음
- request id: 사용
- redaction: 회사 검색어 원문, 메모 원문 logging 금지
- log context 권장값: `userId`, `filterKeys`, `rowCount`

## 10. Error

기존 회사 export 에러 정책을 유지한다.

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | refresh 또는 로그인 이동 | warn |
| 잘못된 UUID query | `ValidationError` | 400 | 내보내기 실패 안내 | log |
| 본인 소유가 아닌 분야 ID | `CompanyFieldNotFound` | 404 | 필터 초기화 또는 실패 안내 | log |
| 본인 소유가 아닌 지역 ID | `CompanyRegionNotFound` | 404 | 필터 초기화 또는 실패 안내 | log |
| xlsx 생성 실패 | `CompanyExportFailed` | 500 | 내보내기 실패 안내 | error |

## 11. FE/BE 처리 기준

FE:

- 회사 목록의 현재 검색어와 필터만 전달하고 `page`는 제거한다.
- 응답은 blob으로 처리한다.
- 파일명은 `Content-Disposition`을 우선 사용한다.

BE:

- JSON 목록 응답과 동일한 필터 기준을 적용한다.
- `dealCount`는 현재 사용자 소유 딜만 집계한다.
- static route `export/xlsx`가 `:companyId`보다 먼저 매칭되도록 유지한다.

## 12. 검증 기준

- 필터가 없으면 현재 사용자 전체 회사가 xlsx에 포함된다.
- 필터가 있으면 조건에 맞는 회사만 포함된다.
- 각 row의 `딜 수`가 실제 회사 연결 딜 수와 일치한다.
- 다른 사용자의 딜 수가 섞이지 않는다.
