# ImportJob Persistence API

계약 상태: confirmed
소비자:
- User Web

호환성:
- breaking change 여부: 있음. 기존 `/api/imports` 계열은 in-memory job store에서 DB persisted job store로 동작 의미가 바뀐다.
- 기존 FE 영향: `/app/import`는 job resume, row patch, validate, cancel 흐름을 추가해야 한다.
- migration 또는 fallback: `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` migration이 선행되어야 한다. 기존 `ImportUserLog`, `ImportUserLogRow`는 성공 이력으로 유지한다.

## 1. 공통 계약

### 인증과 권한

- 모든 API는 `AuthGuard`가 필요하다.
- 모든 조회와 변경은 `userId = currentUser.id` 기준 ownership을 적용한다.
- 다른 사용자의 `importJobId`에 접근하면 존재 여부를 노출하지 않고 `ImportJobNotFound`로 처리한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.

### 상태 enum

`ImportJobStatus`

| 값 | 의미 |
|---|---|
| `UPLOADED` | 파일을 받았고 row를 저장했다. |
| `MAPPED` | AI/rule mapping이 저장됐다. |
| `NEEDS_REVIEW` | 사용자가 mapping 또는 오류 row를 확인해야 한다. |
| `READY_TO_CONFIRM` | confirm 가능한 상태다. |
| `CONFIRMING` | confirm transaction 진행 중이다. |
| `CONFIRMED` | confirm 성공 후 성공 로그가 생성됐다. |
| `FAILED` | job 전체 처리 실패 상태다. |
| `CANCELED` | 사용자가 취소했다. |
| `EXPIRED` | TTL이 만료됐다. |

`ImportJobRowStatus`

| 값 | 의미 |
|---|---|
| `PENDING` | 아직 검증 전이다. |
| `VALID` | 저장 가능한 row다. |
| `INVALID` | 수정이 필요한 row다. |
| `EXCLUDED` | 사용자가 가져오기에서 제외한 row다. |
| `IMPORTED` | confirm 성공으로 실제 데이터에 반영됐다. |
| `FAILED` | confirm 중 해당 row 처리에 실패했다. |

`ImportJobMappingSource`

| 값 | 의미 |
|---|---|
| `NONE` | mapping 전이다. |
| `AI` | AI mapping 결과다. |
| `RULE_BASED` | 규칙 기반 mapping 결과다. |
| `USER` | 사용자가 직접 수정한 mapping이다. |

### 공통 response object

`ImportJobSummaryResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | no | ImportJob ID |
| `targetType` | `COMPANY \| CONTACT \| PRODUCT \| DEAL` | no | 가져오기 대상 |
| `status` | `ImportJobStatus` | no | job 상태 |
| `mappingSource` | `ImportJobMappingSource` | no | 현재 mapping 출처 |
| `originalFileName` | string | no | 업로드 파일명 |
| `totalRowCount` | number | no | 전체 row 수 |
| `validRowCount` | number | no | 유효 row 수 |
| `invalidRowCount` | number | no | 수정 필요 row 수 |
| `importedRowCount` | number | no | confirm된 row 수 |
| `failedRowCount` | number | no | 실패 row 수 |
| `importUserLogId` | string | yes | confirm 성공 후 생성된 성공 이력 ID |
| `expiresAt` | string | no | UTC ISO string |
| `createdAt` | string | no | UTC ISO string |
| `updatedAt` | string | no | UTC ISO string |

`ImportJobDetailResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `job` | `ImportJobSummaryResponse` | no | job 요약 |
| `templateColumns` | `ImportTemplateColumn[]` | no | 확정 당시 template column snapshot |
| `mapping` | object | no | 업로드 파일 header -> template field mapping |
| `rows` | `ImportJobRowResponse[]` | no | preview rows |
| `errors` | `ImportJobErrorResponse[]` | no | job 단위 최신 오류. UI 기본 화면에서는 숨길 수 있다. |

`ImportJobRowResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `rowId` | string | no | ImportJobRow ID |
| `rowNumber` | number | no | 원본 파일 row 번호 |
| `status` | `ImportJobRowStatus` | no | row 상태 |
| `data` | object | no | 현재 화면에 보여줄 mapped data |
| `targetLabel` | string | yes | 생성 대상 대표 label |
| `errors` | `ImportCellValidationError[]` | no | cell 단위 오류 |

`ImportCellValidationError`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `fieldKey` | string | no | template field key |
| `message` | string | no | 사용자에게 보여줄 해요체 오류 문구 |
| `code` | string | no | validation code |

`ImportJobErrorResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | no | ImportJobError ID |
| `rowId` | string | yes | row 오류면 row ID |
| `rowNumber` | number | yes | row 번호 |
| `fieldKey` | string | yes | field 오류면 field key |
| `errorType` | string | no | `PARSE`, `AI_MAPPING`, `VALIDATION`, `CONFIRM`, `STORAGE`, `SYSTEM` |
| `errorCode` | string | no | 내부 domain/application error code |
| `severity` | string | no | `INFO`, `WARNING`, `ERROR` |
| `safeMessage` | string | no | 사용자에게 보여도 되는 문구 |
| `retryable` | boolean | no | 재시도 가능 여부 |
| `createdAt` | string | no | UTC ISO string |

### 공통 transaction/observability

- import confirm은 batch mutation이므로 transaction이 필요하다.
- upload, map, mapping update, row update, validate, cancel도 여러 model을 함께 바꾸므로 transaction을 사용한다.
- AI mapping provider 호출은 DB transaction 밖에서 실행한다. provider 결과만 transaction 안에서 저장한다.
- 원본 파일 storage write/delete는 DB transaction과 완전히 원자화할 수 없으므로 실패 시 `ImportJobError`와 file status로 추적한다.
- application log event key는 `importJob.*` dot notation을 사용한다.
- PII, row raw data, 전화번호, 이메일, 회사명, 담당자명, provider raw response는 structured log에 평문으로 남기지 않는다.

## 2. 진행 중 작업 목록 API

- API 이름: 진행 중 가져오기 조회 API
- API 식별자: ListActiveImportJobs
- 계약 상태: confirmed
- 소비자: User Web
- Method: GET
- Path: `/api/imports/active`
- 인증: AuthGuard
- 권한: current user owned jobs only

### 목적

`/app/import` 진입 시 사용자가 이어서 할 수 있는 active import job을 보여준다.

### Request

- Request 이름: ListActiveImportJobsRequest

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `targetType` | enum | 선택 | 대상별 active job 필터 |
| `limit` | number | 선택 | 기본 5, 최대 10 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `expiresAt < now`인 active job을 `EXPIRED`로 전환한다.
3. 현재 사용자 job 중 active status만 조회한다.
4. `createdAt DESC`로 정렬한다.
5. `ImportJobSummaryResponse[]`로 반환한다.

### Response

- Response 이름: ActiveImportJobsResponse
- Status: 200
- Body:

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `ImportJobSummaryResponse[]` | 진행 중 job 목록 |

### 연결된 DB 스키마

- 조회: `ImportJob`
- 수정: 만료된 `ImportJob`
- transaction: 만료 전환 시 필요

### Transaction

- 필요 여부: 필요
- 이유: 조회 전에 만료 job 상태를 정리할 수 있다.
- transaction model: `ImportJob`
- rollback 범위: 만료 상태 변경
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.activeListed`
- audit log: 없음
- request id: 사용
- redaction: file name 외 raw row logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면으로 이동 | warn |
| query validation 실패 | `ValidationError` | 400 | 필터 값을 초기화 | warn |

### FE/BE 처리 기준

- FE: `/app/import` 진입 시 호출하고, 진행 중 card를 보여준다.
- BE: active status와 ownership을 반드시 적용한다.
- 검증: 다른 사용자 job이 목록에 나오지 않아야 한다.

## 3. 파일 업로드 및 job 생성 API

- API 이름: 가져오기 파일 업로드 API
- API 식별자: CreateImportJob
- 계약 상태: confirmed
- 소비자: User Web
- Method: POST
- Path: `/api/imports`
- 인증: AuthGuard
- 권한: current user

### 목적

사용자가 CSV/XLS/XLSX 파일을 올리면 확정 전 job, uploaded file metadata, parsed rows를 DB에 저장한다.

### Request

- Request 이름: CreateImportJobRequest
- Content-Type: `multipart/form-data`

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `targetType` | enum | 필수 | `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL` |
| `templateId` | string | 필수 | 활성 import template ID |
| `file` | file | 필수 | CSV/XLS/XLSX. 현재 파일 크기 제한은 기존 구현 제한을 유지한다. |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. multipart request를 validation한다.
3. `templateId`, `targetType`, `isActive = true`인 template을 조회한다.
4. 파일명, MIME, byte size, checksum을 계산한다.
5. 원본 파일을 storage adapter에 저장한다.
6. 파일을 parsing해 raw row를 만든다.
7. `expiresAt = now + 48시간`으로 계산한다.
8. transaction 안에서 `ImportJob`, `ImportUploadedFile`, `ImportJobRow`를 생성한다.
9. parsing warning 또는 validation 초기 오류가 있으면 `ImportJobError`와 row errors를 저장한다.
10. 생성된 job summary를 반환한다.

### Response

- Response 이름: CreateImportJobResponse
- Status: 201
- Body: `ImportJobDetailResponse`

### 연결된 DB 스키마

- 생성: `ImportJob`, `ImportUploadedFile`, `ImportJobRow`, `ImportJobError`
- 조회: `ImportTemplate`
- transaction: job, file metadata, rows, errors 생성

### Transaction

- 필요 여부: 필요
- 이유: job header, file metadata, rows가 하나의 업로드 행동으로 함께 생성되어야 한다.
- transaction model: `ImportJob`, `ImportUploadedFile`, `ImportJobRow`, `ImportJobError`
- rollback 범위: DB 생성 전체
- 외부 Provider 호출 위치: 없음. storage write와 file parse는 transaction 밖에서 먼저 수행한다.
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.created`
- audit log: 없음
- request id: 사용
- redaction: raw row, cell value, phone, email logging 금지
- provider error context: storage adapter 실패는 provider/status/retryable만 기록

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면으로 이동 | warn |
| template 없음 | `ImportTemplateNotFound` | 404 | 양식 목록을 다시 불러온다 | warn |
| 파일 형식 불가 | `UnsupportedImportFileType` | 400 | `CSV, XLS, XLSX 파일을 올려 주세요.` | warn |
| 파일 parsing 실패 | `ImportFileParseFailed` | 400 | `파일을 읽지 못했어요. 형식을 확인하고 다시 올려 주세요.` | warn |
| storage 실패 | `ImportFileStorageFailed` | 503 | `파일을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.` | error |

### FE/BE 처리 기준

- FE: 성공 시 `/app/import/review/:importJobId`로 이동한다.
- BE: storage binary를 DB에 넣지 않는다.
- 검증: 업로드 후 서버 재시작 뒤에도 job detail 조회가 가능해야 한다.

## 4. job 상세/resume API

- API 이름: 가져오기 작업 상세 API
- API 식별자: GetImportJob
- 계약 상태: confirmed
- 소비자: User Web
- Method: GET
- Path: `/api/imports/:importJobId`
- 인증: AuthGuard
- 권한: current user owned job only

### Request

- Request 이름: GetImportJobRequest

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `importJobId` | string | 필수 | ImportJob ID |

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `includeErrors` | boolean | 선택 | 기본 false. true면 `ImportJobError` 최신 50개를 포함한다. |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `importJobId`, `userId`로 job을 조회한다.
3. active job이고 `expiresAt < now`이면 `EXPIRED`로 전환한다.
4. job, rows, uploaded file metadata, 선택적 errors를 조회한다.
5. terminal 상태면 가능한 action을 response에 반영한다.
6. `ImportJobDetailResponse`를 반환한다.

### Response

- Response 이름: ImportJobDetailResponse
- Status: 200
- Body: `ImportJobDetailResponse`

### 연결된 DB 스키마

- 조회: `ImportJob`, `ImportJobRow`, `ImportUploadedFile`, `ImportJobError`
- 수정: 만료된 `ImportJob`

### Transaction

- 필요 여부: 필요
- 이유: 만료 상태 전환과 조회 일관성이 필요하다.
- transaction model: `ImportJob`
- rollback 범위: 만료 상태 변경
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.viewed`
- audit log: 없음
- request id: 사용
- redaction: row data logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| job 없음 또는 소유권 없음 | `ImportJobNotFound` | 404 | `/app/import`로 이동하고 안내 | warn |
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면으로 이동 | warn |

### FE/BE 처리 기준

- FE: 새로고침/resume 시 이 API로 화면 상태를 복구한다.
- BE: 소유권 없는 job 존재 여부를 노출하지 않는다.
- 검증: EXPIRED job은 confirm 버튼이 비활성화되어야 한다.

## 5. AI/rule mapping API

- API 이름: 가져오기 컬럼 매핑 생성 API
- API 식별자: MapImportJob
- 계약 상태: confirmed
- 소비자: User Web
- Method: POST
- Path: `/api/imports/:importJobId/map`
- 인증: AuthGuard
- 권한: current user owned job only

### Request

- Request 이름: MapImportJobRequest

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `importJobId` | string | 필수 | ImportJob ID |

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `preferredSource` | `AI \| RULE_BASED` | 선택 | 기본 `AI`. AI 실패 시 rule fallback을 허용한다. |

### 비즈니스 로직 흐름

1. 현재 사용자와 job ownership을 확인한다.
2. job status가 mapping 가능한 상태인지 확인한다.
3. template columns와 file headers를 가져온다.
4. AI provider를 transaction 밖에서 호출한다.
5. AI 실패 시 rule-based fallback을 수행한다.
6. mapping 결과로 rows를 mapped/validated 상태로 변환한다.
7. transaction 안에서 job mapping, status, row data, validation errors, error log를 저장한다.
8. detail response를 반환한다.

### Response

- Response 이름: ImportJobDetailResponse
- Status: 200
- Body: `ImportJobDetailResponse`

### 연결된 DB 스키마

- 조회: `ImportJob`, `ImportJobRow`
- 수정: `ImportJob`, `ImportJobRow`
- 생성: `ImportJobError`

### Transaction

- 필요 여부: 필요
- 이유: job mapping과 row validation 상태가 함께 바뀐다.
- transaction model: `ImportJob`, `ImportJobRow`, `ImportJobError`
- rollback 범위: mapping 저장, row update, error 저장
- 외부 Provider 호출 위치: transaction 밖
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.mapped`
- audit log: 없음
- request id: 사용
- redaction: provider prompt, raw rows, provider raw response logging 금지
- provider error context: provider, model, status, retryable, latencyMs

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| job 없음 | `ImportJobNotFound` | 404 | 목록으로 이동 | warn |
| 만료됨 | `ImportJobExpired` | 410 | 새 import 시작 안내 | warn |
| terminal 상태 | `ImportJobAlreadyClosed` | 409 | 현재 상태를 다시 조회 | warn |
| AI/rule mapping 실패 | `ImportMappingFailed` | 422 | 사용자가 직접 매칭하도록 표시 | warn |

### FE/BE 처리 기준

- FE: mapping 실패 시 화면을 깨지 않고 직접 매칭 UI로 이동한다.
- BE: AI 실패 detail은 사용자 response에 노출하지 않는다.
- 검증: AI provider 실패 시 fallback과 error 저장을 확인한다.

## 6. 사용자 mapping 수정 API

- API 이름: 가져오기 컬럼 매칭 수정 API
- API 식별자: UpdateImportJobMapping
- 계약 상태: confirmed
- 소비자: User Web
- Method: PATCH
- Path: `/api/imports/:importJobId/mapping`
- 인증: AuthGuard
- 권한: current user owned job only

### Request

- Request 이름: UpdateImportJobMappingRequest

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `mapping` | object | 필수 | file header 또는 column key -> template field key mapping |

### 비즈니스 로직 흐름

1. 현재 사용자와 job ownership을 확인한다.
2. job이 active 상태인지 확인한다.
3. mapping field가 template column key에 포함되는지 검증한다.
4. mapping을 적용해 rows를 다시 mapped/normalized한다.
5. row validation을 실행한다.
6. transaction 안에서 job mapping, mappingSource `USER`, row 상태, validation errors를 저장한다.
7. detail response를 반환한다.

### Response

- Response 이름: ImportJobDetailResponse
- Status: 200
- Body: `ImportJobDetailResponse`

### 연결된 DB 스키마

- 수정: `ImportJob`, `ImportJobRow`
- 생성: validation error가 있으면 `ImportJobError`

### Transaction

- 필요 여부: 필요
- 이유: mapping 변경과 row validation 상태가 함께 바뀐다.
- transaction model: `ImportJob`, `ImportJobRow`, `ImportJobError`
- rollback 범위: mapping/row/error 변경 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.mappingUpdated`
- audit log: 없음
- request id: 사용
- redaction: mapping 값 중 사용자 row data logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| mapping field invalid | `InvalidImportMapping` | 400 | field error 표시 | warn |
| job 만료 | `ImportJobExpired` | 410 | 새 import 안내 | warn |

### FE/BE 처리 기준

- FE: mapping select 변경 시 이 API를 호출하고 row preview를 갱신한다.
- BE: response에 없는 summary를 FE가 계산하지 않도록 summary를 함께 반환한다.
- 검증: mapping 수정 후 invalid row count가 갱신되어야 한다.

## 7. row 수정 API

- API 이름: 가져오기 row 수정 API
- API 식별자: UpdateImportJobRows
- 계약 상태: confirmed
- 소비자: User Web
- Method: PATCH
- Path: `/api/imports/:importJobId/rows`
- 인증: AuthGuard
- 권한: current user owned job only

### Request

- Request 이름: UpdateImportJobRowsRequest

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `rows` | array | 필수 | 수정할 row 목록 |
| `rows[].rowId` | string | 필수 | ImportJobRow ID |
| `rows[].data` | object | 필수 | template field key 기준 row data |
| `rows[].excluded` | boolean | 선택 | true면 row를 가져오기에서 제외 |

### 비즈니스 로직 흐름

1. 현재 사용자와 job ownership을 확인한다.
2. 요청 row가 모두 같은 job과 userId에 속하는지 확인한다.
3. job이 active 상태인지 확인한다.
4. row data를 template field 기준으로 validation한다.
5. row status, mapped/normalized data, validation errors를 갱신한다.
6. job summary count를 다시 계산한다.
7. transaction 안에서 row와 job summary를 저장한다.
8. detail response를 반환한다.

### Response

- Response 이름: ImportJobDetailResponse
- Status: 200
- Body: `ImportJobDetailResponse`

### 연결된 DB 스키마

- 조회: `ImportJob`, `ImportJobRow`
- 수정: `ImportJob`, `ImportJobRow`
- 생성: `ImportJobError`

### Transaction

- 필요 여부: 필요
- 이유: 여러 row와 job summary count를 함께 갱신한다.
- transaction model: `ImportJob`, `ImportJobRow`, `ImportJobError`
- rollback 범위: row update와 summary update 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.rowsUpdated`
- audit log: 없음
- request id: 사용
- redaction: row data logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| row 없음 또는 소유권 없음 | `ImportJobRowNotFound` | 404 | job detail 재조회 | warn |
| validation 실패 | `ImportRowValidationFailed` | 200 | row errors로 표시. HTTP error가 아니라 정상 응답 | log |
| job terminal 상태 | `ImportJobAlreadyClosed` | 409 | 현재 상태 안내 | warn |

### FE/BE 처리 기준

- FE: 오류 cell 수정 후 저장하고 같은 화면에 머문다.
- BE: validation 실패는 row status `INVALID`로 저장하고 정상 응답한다.
- 검증: 한 row만 수정해도 summary가 정확히 바뀌어야 한다.

## 8. 재검증 API

- API 이름: 가져오기 검증 API
- API 식별자: ValidateImportJob
- 계약 상태: confirmed
- 소비자: User Web
- Method: POST
- Path: `/api/imports/:importJobId/validate`
- 인증: AuthGuard
- 권한: current user owned job only

### Request

- Request 이름: ValidateImportJobRequest

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `importJobId` | string | 필수 | ImportJob ID |

### 비즈니스 로직 흐름

1. 현재 사용자와 job ownership을 확인한다.
2. job과 rows를 조회한다.
3. 현재 mapping과 row data 기준으로 전체 validation을 수행한다.
4. row status와 validation errors를 갱신한다.
5. 모든 included row가 valid이면 job status를 `READY_TO_CONFIRM`로 바꾼다.
6. invalid row가 있으면 job status를 `NEEDS_REVIEW`로 바꾼다.
7. detail response를 반환한다.

### Response

- Response 이름: ImportJobDetailResponse
- Status: 200
- Body: `ImportJobDetailResponse`

### 연결된 DB 스키마

- 조회: `ImportJob`, `ImportJobRow`
- 수정: `ImportJob`, `ImportJobRow`
- 생성: `ImportJobError`

### Transaction

- 필요 여부: 필요
- 이유: row validation 결과와 job status/count가 함께 바뀐다.
- transaction model: `ImportJob`, `ImportJobRow`, `ImportJobError`
- rollback 범위: validation 상태 갱신 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.validated`
- audit log: 없음
- request id: 사용
- redaction: validation input 값 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| mapping 없음 | `ImportMappingRequired` | 409 | 컬럼 매칭 단계로 이동 | warn |
| job 만료 | `ImportJobExpired` | 410 | 새 import 안내 | warn |

### FE/BE 처리 기준

- FE: `invalidRowCount = 0`이면 가져오기 버튼을 활성화한다.
- BE: EXCLUDED row는 confirm 대상에서 제외한다.
- 검증: invalid row가 있으면 confirm API가 실패해야 한다.

## 9. confirm API

- API 이름: 가져오기 확정 API
- API 식별자: ConfirmImportJob
- 계약 상태: confirmed
- 소비자: User Web
- Method: POST
- Path: `/api/imports/:importJobId/confirm`
- 인증: AuthGuard
- 권한: current user owned job only

### Request

- Request 이름: ConfirmImportJobRequest

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `importJobId` | string | 필수 | ImportJob ID |

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `idempotencyKey` | string | 선택 | 중복 confirm 방지용 client key |

### 비즈니스 로직 흐름

1. 현재 사용자와 job ownership을 확인한다.
2. job status가 `READY_TO_CONFIRM`인지 확인한다.
3. expiresAt이 지나지 않았는지 확인한다.
4. included row가 모두 `VALID`인지 확인한다.
5. job status를 `CONFIRMING`으로 전환한다.
6. transaction 안에서 targetType별 domain row를 생성한다.
7. `ImportUserLog`, `ImportUserLogRow`를 같은 transaction에서 생성한다.
8. `ImportJobRow`를 `IMPORTED`로 바꾼다.
9. `ImportJob`을 `CONFIRMED`로 바꾸고 `confirmedAt`, `importedRowCount`, `importUserLogId`를 저장한다.
10. 원본 파일 storage delete를 transaction 밖 후속 처리로 실행하고 `ImportUploadedFile.deletedAt`을 기록한다.
11. `ConfirmImportJobResponse`를 반환한다.

### Response

- Response 이름: ConfirmImportJobResponse
- Status: 200
- Body:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `importJobId` | string | no | ImportJob ID |
| `importUserLogId` | string | no | 성공 이력 ID |
| `status` | `CONFIRMED` | no | 확정 상태 |
| `importedRowCount` | number | no | 저장한 row 수 |

### 연결된 DB 스키마

- 생성: target domain models, `ImportUserLog`, `ImportUserLogRow`
- 수정: `ImportJob`, `ImportJobRow`, `ImportUploadedFile`
- 조회: `ImportJob`, `ImportJobRow`, domain lookup tables
- transaction: target domain row와 성공 로그 전체

### Transaction

- 필요 여부: 필요
- 이유: import confirm은 batch mutation이며 부분 성공이 사용자 데이터 불일치를 만든다.
- transaction model: `ImportJob`, `ImportJobRow`, target domain models, `ImportUserLog`, `ImportUserLogRow`
- rollback 범위: 도메인 row 생성, 연결 row 생성, 성공 로그 생성, job 상태 갱신 전체
- 외부 Provider 호출 위치: 없음. storage delete는 transaction 밖 후속 처리
- audit log 포함 여부: 없음. Admin audit가 아니라 사용자 본인 import 행동이다.

### Observability

- log event key: `importJob.confirmed`
- audit log: 없음
- request id: 사용
- redaction: row data, phone, email, deal amount logging 금지
- provider error context: storage delete 실패는 `importJob.fileDeleteFailed`로 별도 기록

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| job 없음 | `ImportJobNotFound` | 404 | `/app/import`로 이동 | warn |
| 준비 안 됨 | `ImportJobNotReady` | 409 | 오류 row를 다시 표시 | warn |
| 만료됨 | `ImportJobExpired` | 410 | 새 import 안내 | warn |
| confirm 중복 | `ImportJobAlreadyConfirmed` | 409 | 성공 로그로 이동 | warn |
| domain validation 실패 | `ImportConfirmValidationFailed` | 422 | row errors로 복귀 | warn |
| 알 수 없는 실패 | `ImportConfirmFailed` | 500 | 재시도 안내 | error |

### FE/BE 처리 기준

- FE: 성공 시 response의 `importUserLogId`로 `/app/import/:importUserLogId`에 이동한다. confirmed job detail을 다시 조회한 경우에도 `job.importUserLogId`가 있으면 같은 route로 이동한다.
- BE: confirm transaction 안에서 외부 provider를 호출하지 않는다.
- 검증: confirm 실패 시 도메인 row와 성공 로그가 남지 않아야 한다.

## 10. cancel API

- API 이름: 가져오기 취소 API
- API 식별자: CancelImportJob
- 계약 상태: confirmed
- 소비자: User Web
- Method: POST
- Path: `/api/imports/:importJobId/cancel`
- 인증: AuthGuard
- 권한: current user owned job only

### Request

- Request 이름: CancelImportJobRequest

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `importJobId` | string | 필수 | ImportJob ID |

### 비즈니스 로직 흐름

1. 현재 사용자와 job ownership을 확인한다.
2. terminal job이면 현재 상태에 맞는 response 또는 conflict를 반환한다.
3. transaction 안에서 job status를 `CANCELED`로 바꾸고 `canceledAt`을 저장한다.
4. 원본 파일은 storage delete 후 `ImportUploadedFile.status = DELETED`, `deletedAt`을 저장한다.
5. body 없는 성공 응답을 반환한다.

### Response

- Response 이름: 없음
- Status: 204
- Body: 없음

### 연결된 DB 스키마

- 수정: `ImportJob`, `ImportUploadedFile`
- 생성: storage delete 실패 시 `ImportJobError`

### Transaction

- 필요 여부: 필요
- 이유: job 상태와 file metadata 상태를 함께 바꾼다.
- transaction model: `ImportJob`, `ImportUploadedFile`, `ImportJobError`
- rollback 범위: job/file metadata 상태 변경
- 외부 Provider 호출 위치: storage delete는 transaction 밖 또는 짧은 adapter 호출 후 결과만 transaction에 저장
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.canceled`
- audit log: 없음
- request id: 사용
- redaction: file content logging 금지
- provider error context: storage delete 실패 provider/status/retryable

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| job 없음 | `ImportJobNotFound` | 404 | 목록으로 이동 | warn |
| 이미 confirmed | `ImportJobAlreadyConfirmed` | 409 | 성공 로그로 이동 | warn |

### FE/BE 처리 기준

- FE: 204 성공 후 `/app/import`로 이동한다.
- BE: 취소 후 confirm을 막는다.
- 검증: canceled job detail은 읽을 수 있으나 수정/confirm은 불가해야 한다.

## 11. 오류 이력 조회 API

- API 이름: 가져오기 오류 이력 조회 API
- API 식별자: ListImportJobErrors
- 계약 상태: confirmed
- 소비자: User Web
- Method: GET
- Path: `/api/imports/:importJobId/errors`
- 인증: AuthGuard
- 권한: current user owned job only

### 목적

기본 화면은 row/cell 오류만 보여주지만, 문제 확인 panel 또는 향후 운영 지원을 위해 redacted 오류 이력을 조회할 수 있게 한다.

### Request

- Request 이름: ListImportJobErrorsRequest

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `limit` | number | 선택 | 기본 50, 최대 100 |

### 비즈니스 로직 흐름

1. 현재 사용자와 job ownership을 확인한다.
2. `ImportJobError`를 `createdAt DESC`로 조회한다.
3. redacted response로 반환한다.

### Response

- Response 이름: ImportJobErrorsResponse
- Status: 200
- Body:

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `ImportJobErrorResponse[]` | 오류 이력 |

### 연결된 DB 스키마

- 조회: `ImportJob`, `ImportJobError`

### Transaction

- 필요 여부: 없음
- 이유: 단순 조회다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `importJob.errorsListed`
- audit log: 없음
- request id: 사용
- redaction: detailJson 원문 노출 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| job 없음 | `ImportJobNotFound` | 404 | 목록으로 이동 | warn |

### FE/BE 처리 기준

- FE: 기본 import 화면에 항상 노출하지 않는다. 필요할 때만 문제 내역 panel로 사용한다.
- BE: detailJson은 safe field만 response에 포함한다.
- 검증: raw row value가 error response에 포함되지 않아야 한다.
