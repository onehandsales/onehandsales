# G02 Backend ImportJob API

상태: Confirmed

## 1. 목적

기존 in-memory 확정 전 import job 흐름을 DB 기반 API로 교체한다. 사용자는 같은 가져오기 화면을 쓰지만, Backend는 upload, mapping, row edit, validation, confirm, cancel, error history를 DB에서 복구할 수 있어야 한다.

## 2. 선행 조건

- G01이 완료되어 신규 Prisma model과 repository adapter를 사용할 수 있다.
- `COMMON/API-SPEC/IMPORT_JOB_API.md` 계약 상태가 `confirmed`다.
- migration 대상 DB가 명확하지 않으면 DB 변경이 필요한 integration test는 실행하지 않는다.

## 3. 포함 범위

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
- `InMemoryImportJobStore` 의존 제거
- storage adapter를 통한 원본 파일 저장/삭제 metadata 연결
- `ImportJobError` redacted 오류 기록
- confirm transaction에서 domain row와 `ImportUserLog*` 동시 생성

## 4. 제외 범위

- User Web 화면 변경
- Admin import 오류 조회 화면
- global `ErrorLog` table
- 대용량 background worker
- Notification
- 결제/구독/권한 entitlement
- Schedule/MeetingNote import 확장

## 5. API 구현 기준

API 세부 request/response/business logic은 `COMMON/API-SPEC/IMPORT_JOB_API.md`를 따른다.

DTO 이름:

- `ListActiveImportJobsRequest`
- `CreateImportJobRequest`
- `GetImportJobRequest`
- `MapImportJobRequest`
- `UpdateImportJobMappingRequest`
- `UpdateImportJobRowsRequest`
- `ValidateImportJobRequest`
- `ConfirmImportJobRequest`
- `CancelImportJobRequest`
- `ListImportJobErrorsRequest`

Response 이름:

- `ActiveImportJobsResponse`
- `CreateImportJobResponse`
- `ImportJobDetailResponse`
- `ConfirmImportJobResponse`
- `ImportJobErrorsResponse`

## 6. Backend 구조 기준

Controller:

- controller는 request validation과 use case 호출만 담당한다.
- Prisma 직접 접근을 controller에 두지 않는다.
- `GET /api/imports/active`는 `GET /api/imports/:importJobId`보다 먼저 선언한다.
- `POST /api/imports` request는 사용자 단순성을 위해 `targetType`과 file만 받는다. Backend가 active template을 찾아 `ImportJob.templateId`에 저장한다.

Application:

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

Infrastructure:

- Prisma repository adapter
- file storage adapter
- CSV/XLSX parser adapter
- AI mapping provider adapter

## 7. Transaction 기준

반드시 transaction:

- upload DB 생성
- mapping 저장과 row validation 갱신
- row 수정과 summary count 갱신
- validation과 job status 갱신
- confirm domain row와 success log 생성
- cancel job/file metadata 갱신

Transaction 밖:

- AI provider 호출
- file storage write/delete
- signed URL 생성

Rollback:

- confirm 실패 시 domain row와 `ImportUserLog*`가 남으면 안 된다.
- storage delete 실패는 import 성공을 rollback하지 않고 `ImportJobError`로 기록한다.

## 8. Observability 기준

사용 event key:

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

금지:

- raw row 값 logging
- AI prompt/provider raw response logging
- 전화번호, 이메일, 회사명 대량 dump
- storage signed URL logging

## 9. 연결 문서

- `COMMON/API-SPEC/IMPORT_JOB_API.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`

## 10. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- data-import
pnpm run build
```

## 11. 완료 기준

- 모든 `/api/imports` API가 `COMMON/API-SPEC/IMPORT_JOB_API.md`의 request/response와 일치한다.
- 서버 재시작 후 7일 내 job detail 조회가 가능하다.
- 다른 사용자의 job id 접근은 404로 처리한다.
- invalid row가 있으면 confirm이 409로 막힌다.
- confirm 성공 시 domain row와 `ImportUserLog*`가 같은 transaction에서 생성된다.
- confirm 실패 시 부분 생성이 남지 않는다.
- cancel/expire job은 confirm할 수 없다.
- `InMemoryImportJobStore` 의존이 제거되어 있다.
