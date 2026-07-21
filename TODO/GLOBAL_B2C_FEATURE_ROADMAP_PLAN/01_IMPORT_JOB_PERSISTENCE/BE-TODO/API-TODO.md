# Backend API TODO

상태: Confirmed
기준 API 계약: `COMMON/API-SPEC/IMPORT_JOB_API.md`

## 1. 목표

기존 `/api/imports` 계열의 확정 전 상태 저장소를 `InMemoryImportJobStore`에서 DB persistence로 교체한다. API 화면 의미는 단순하게 유지하되, Backend 내부에서는 job, row, error, uploaded file 상태를 transaction 단위로 관리한다.

## 2. 생성/수정 API

| Method | Path | API 식별자 | 목적 |
|---|---|---|---|
| `GET` | `/api/imports/active` | `ListActiveImportJobs` | 현재 사용자 진행 중 import job 조회 |
| `POST` | `/api/imports` | `CreateImportJob` | 파일 업로드, parsing, job/row/file metadata 생성 |
| `GET` | `/api/imports/:importJobId` | `GetImportJob` | job 상세 조회와 새로고침/resume 복구 |
| `POST` | `/api/imports/:importJobId/map` | `MapImportJob` | AI/rule 기반 column mapping 생성 |
| `PATCH` | `/api/imports/:importJobId/mapping` | `UpdateImportJobMapping` | 사용자 column mapping 수정 |
| `PATCH` | `/api/imports/:importJobId/rows` | `UpdateImportJobRows` | 오류 row/cell 수정과 제외 처리 |
| `POST` | `/api/imports/:importJobId/validate` | `ValidateImportJob` | 전체 row 재검증과 confirm 가능 상태 계산 |
| `POST` | `/api/imports/:importJobId/confirm` | `ConfirmImportJob` | 도메인 데이터와 성공 이력 저장 |
| `POST` | `/api/imports/:importJobId/cancel` | `CancelImportJob` | 확정 전 작업 취소와 원본 파일 삭제 처리 |
| `GET` | `/api/imports/:importJobId/errors` | `ListImportJobErrors` | redacted import 오류 이력 조회 |

## 3. Request/Response 기준

세부 request, response, business logic은 `COMMON/API-SPEC/IMPORT_JOB_API.md`를 구현 기준으로 삼는다.

Backend에서 반드시 DTO 이름을 맞춘다:

- `ListActiveImportJobsRequest`, `ActiveImportJobsResponse`
- `CreateImportJobRequest`, `CreateImportJobResponse`
- `GetImportJobRequest`, `ImportJobDetailResponse`
- `MapImportJobRequest`
- `UpdateImportJobMappingRequest`
- `UpdateImportJobRowsRequest`
- `ValidateImportJobRequest`
- `ConfirmImportJobRequest`, `ConfirmImportJobResponse`
- `CancelImportJobRequest`
- `ListImportJobErrorsRequest`, `ImportJobErrorsResponse`

공통 response object:

- `ImportJobSummaryResponse`
- `ImportJobDetailResponse`
- `ImportJobRowResponse`
- `ImportCellValidationError`
- `ImportJobErrorResponse`

## 4. Business Logic 흐름

### 4.1 Upload

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `targetType`, `templateId`, file을 validation한다.
3. active `ImportTemplate`을 조회하고 `targetType`과 일치하는지 확인한다.
4. file name, byte size, MIME type, checksum을 계산한다.
5. 원본 file binary는 storage adapter에 저장한다.
6. CSV/XLS/XLSX parser로 raw row를 만든다.
7. `expiresAt = now + 48 hours`로 계산한다.
8. DB transaction에서 `ImportJob`, `ImportUploadedFile`, `ImportJobRow`를 생성한다.
9. parse warning이나 초기 validation 오류가 있으면 `ImportJobError`를 redacted 형태로 생성한다.
10. `ImportJobDetailResponse`를 반환한다.

### 4.2 Mapping

1. `importJobId`, `userId`로 job ownership을 확인한다.
2. job이 active 상태인지 확인한다.
3. template columns와 file headers를 가져온다.
4. AI provider 호출은 transaction 밖에서 실행한다.
5. AI 실패 시 rule-based mapping fallback을 실행한다.
6. DB transaction에서 `ImportJob.mappingJson`, `mappingSource`, `status`와 row mapped/validation 결과를 저장한다.
7. provider 실패나 fallback 결과는 `ImportJobError`에 safe detail만 저장한다.
8. `ImportJobDetailResponse`를 반환한다.

### 4.3 Row Update / Validate

1. job ownership과 row ownership을 모두 확인한다.
2. terminal 또는 expired job이면 변경을 막는다.
3. 요청 row data를 template field 기준으로 normalize한다.
4. validation error는 `ImportJobRow.validationErrorsJson`에 저장한다.
5. row status는 `VALID`, `INVALID`, `EXCLUDED` 중 하나로 갱신한다.
6. job summary count와 status를 재계산한다.
7. 전체 included row가 valid이면 `READY_TO_CONFIRM`, 아니면 `NEEDS_REVIEW`로 둔다.
8. detail response를 반환한다.

### 4.4 Confirm

1. job ownership을 확인한다.
2. job status가 `READY_TO_CONFIRM`인지 확인한다.
3. `expiresAt`이 지나지 않았는지 확인한다.
4. included row가 모두 `VALID`인지 확인한다.
5. job status를 `CONFIRMING`으로 변경한다.
6. DB transaction에서 target domain row와 관계 row를 생성한다.
7. 같은 transaction에서 `ImportUserLog`, `ImportUserLogRow`를 생성한다.
8. `ImportJobRow.status = IMPORTED`, `ImportJob.status = CONFIRMED`, `confirmedAt`, `importedRowCount`, `importUserLogId`를 갱신한다.
9. transaction 이후 원본 파일 storage delete를 시도하고 `ImportUploadedFile.status`, `deletedAt`을 갱신한다.
10. `ConfirmImportJobResponse`를 반환한다.

### 4.5 Cancel / Expire

1. job ownership을 확인한다.
2. terminal job이면 상태에 맞는 conflict 또는 no-op 정책을 적용한다.
3. cancel은 `CANCELED`, expired는 `EXPIRED`로 전환한다.
4. 원본 파일 delete를 시도하고 metadata 상태를 갱신한다.
5. detail 조회 시 expired job은 수정/confirm action을 비활성화할 수 있게 반환한다.

## 5. 구현 컴포넌트

### Controller

기존 data-import controller 경로를 유지한다.

- `DataImportController`
- `GET /api/imports/active`
- `POST /api/imports`
- `GET /api/imports/:importJobId`
- `POST /api/imports/:importJobId/map`
- `PATCH /api/imports/:importJobId/mapping`
- `PATCH /api/imports/:importJobId/rows`
- `POST /api/imports/:importJobId/validate`
- `POST /api/imports/:importJobId/confirm`
- `POST /api/imports/:importJobId/cancel`
- `GET /api/imports/:importJobId/errors`

### Application Use Cases

- `ListActiveImportJobsUseCase`
- `CreateImportJobUseCase`
- `GetImportJobUseCase`
- `MapImportJobUseCase`
- `UpdateImportJobMappingUseCase`
- `UpdateImportJobRowsUseCase`
- `ValidateImportJobUseCase`
- `ConfirmImportJobUseCase`
- `CancelImportJobUseCase`
- `ListImportJobErrorsUseCase`
- `ExpireImportJobsUseCase`
- `DeleteImportUploadedFileUseCase`

### Repository / Port

신규 또는 교체 대상:

- `ImportJobRepository`
- `ImportJobRowRepository`
- `ImportJobErrorRepository`
- `ImportUploadedFileRepository`
- `ImportUploadedFileStoragePort`
- `ImportFileParserPort`
- `ImportMappingProviderPort`

교체 대상:

- `InMemoryImportJobStore` 의존 제거
- 메모리 store 기반 테스트는 DB repository 기반 테스트로 전환

### Adapter

- Prisma repository adapter
- local 또는 configured object storage adapter
- CSV/XLS/XLSX parser adapter
- 기존 AI mapping adapter 재사용

## 6. Transaction 기준

Transaction이 필요한 API:

- `CreateImportJob`: job, file metadata, rows, errors 생성
- `MapImportJob`: job mapping, row mapped data, validation error 갱신
- `UpdateImportJobMapping`: mapping과 row validation 결과 동시 갱신
- `UpdateImportJobRows`: 여러 row와 summary count 동시 갱신
- `ValidateImportJob`: row validation과 job status/count 동시 갱신
- `ConfirmImportJob`: domain row, relation row, success log, job 상태 동시 갱신
- `CancelImportJob`: job/file metadata 상태 동시 갱신

Transaction 밖에서 실행해야 하는 것:

- AI provider 호출
- file storage write
- file storage delete
- 외부 object storage signed URL 생성

실패 보정:

- storage write 성공 후 DB transaction 실패 시 orphan object delete를 시도한다.
- confirm transaction 성공 후 storage delete 실패 시 import 자체는 성공으로 유지하고 `ImportJobError`에 `STORAGE_DELETE_FAILED`를 남긴다.
- confirm transaction 실패 시 domain row와 `ImportUserLog*`는 모두 rollback되어야 한다.

## 7. Error / Logging 기준

공통 error:

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| job 없음 또는 소유권 없음 | `ImportJobNotFound` | 404 |
| row 없음 또는 소유권 없음 | `ImportJobRowNotFound` | 404 |
| job 만료 | `ImportJobExpired` | 410 |
| terminal job 변경 시도 | `ImportJobAlreadyClosed` | 409 |
| confirm 준비 안 됨 | `ImportJobNotReady` | 409 |
| mapping 없음 | `ImportMappingRequired` | 409 |
| 파일 형식 불가 | `UnsupportedImportFileType` | 400 |
| 파일 parsing 실패 | `ImportFileParseFailed` | 400 |
| storage 실패 | `ImportFileStorageFailed` | 503 |
| confirm 실패 | `ImportConfirmFailed` | 500 |

Structured log event key:

- `importJob.activeListed`
- `importJob.created`
- `importJob.viewed`
- `importJob.mapped`
- `importJob.mappingUpdated`
- `importJob.rowsUpdated`
- `importJob.validated`
- `importJob.confirmed`
- `importJob.canceled`
- `importJob.expired`
- `importJob.errorsListed`
- `importJob.fileDeleteFailed`

Logging 금지:

- raw row 값
- 이메일, 전화번호, 회사명 대량 dump
- AI prompt 원문
- provider raw response
- storage signed URL

## 8. 테스트 기준

### Unit

- upload request validation
- mapping fallback
- row validation and summary count
- expired job transition
- confirm precondition
- cancel precondition
- redacted error creation

### Integration

- upload 후 DB에 `ImportJob`, `ImportUploadedFile`, `ImportJobRow`가 생성되는지
- `GET /api/imports/:importJobId`가 서버 재시작 상황에서도 복구 가능한 response를 반환하는지
- 다른 user의 job id 접근 시 404인지
- mapping 수정 후 row status/count가 갱신되는지
- invalid row가 있으면 confirm이 409인지
- confirm 성공 시 domain row와 `ImportUserLog*`가 같은 transaction으로 생성되는지
- confirm 실패 시 domain row와 success log가 rollback되는지
- cancel 후 confirm이 막히는지
- expired job이 confirm되지 않는지

### E2E 후보

- 파일 업로드 -> 매핑 확인 -> 오류 row 수정 -> confirm -> 성공 내역 이동
- 업로드 후 새로고침 -> 같은 job detail 복구
- 업로드 후 cancel -> active 목록에서 사라짐

## 9. 완료 기준

- `InMemoryImportJobStore` 없이 모든 확정 전 import job이 DB에서 조회된다.
- 새로고침, 탭 이동, 서버 재시작 후에도 `/api/imports/:importJobId`로 같은 상태가 복구된다.
- confirm은 전체 transaction rollback 기준을 지킨다.
- 원본 파일 binary는 DB에 저장하지 않는다.
- `ImportJobError`와 structured log는 민감정보를 남기지 않는다.
- `COMMON/API-SPEC/IMPORT_JOB_API.md`와 구현 DTO/request/response 이름이 일치한다.
