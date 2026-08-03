# DataImport Schema

이 문서는 `BE/prisma/schema.prisma` 기준 DataImport 양식, 확정 전 ImportJob persistence, 성공 이력, 보관/삭제 정책을 설명한다.

## 1. 범위

현재 구현 범위:

- 활성 불러오기 양식 조회
- 양식 xlsx 다운로드
- 회사/담당자/제품/딜 CSV/XLSX 업로드
- AI 컬럼 매핑과 규칙 기반 fallback
- 사용자 mapping/row 보정 후 검증
- 확정 전 ImportJob DB persistence와 resume
- 확정 저장과 성공 내역 snapshot 조회
- 원본 업로드 file binary 즉시 삭제와 삭제 실패 metadata 추적
- terminal ImportJob 7일 cleanup
- 성공 이력 row-level snapshot 30일 cleanup
- 10MB/5,000 data row upload 제한

현재 제외 범위:

- 대용량 import background worker
- 범용 ExportJob
- 일정/회의록 import
- ImportJob 전용 Admin 화면/API

## 2. ImportTemplateType

Prisma enum:

```text
COMPANY
CONTACT
PRODUCT
DEAL
```

현재 활성 양식과 확정 저장은 `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`을 지원한다.

## 3. ImportTemplate

목적:

- 사용자에게 제공할 불러오기 양식 정의를 저장한다.
- 컬럼 정의와 샘플 row를 JSON으로 저장한다.
- 같은 `templateType`, `templateVersion` 조합은 하나만 존재한다.

주요 컬럼:

- `id`: UUID PK
- `templateType`: `ImportTemplateType`
- `templateVersion`: 양식 버전 문자열
- `templateName`: 다운로드 파일명
- `columnsJson`: 컬럼 key/label/required/type 정의 JSON
- `sampleRowsJson`: 샘플 row JSON
- `isActive`: 활성 양식 여부
- `createdAt`, `updatedAt`: UTC timestamp

index:

- unique `templateType, templateVersion`
- index `templateType, isActive`

현재 seed 양식:

- `COMPANY` v1: 회사이름, 회사분야, 회사지역
- `PRODUCT` v1: 제품이름, 제품단가, 제품 카테고리, 제품 상태
- `CONTACT` v1: 회사, 담당자 이름, 담당자 이메일, 담당자 핸드폰 번호, 담당자 부서, 담당자 직급
- `DEAL` v1: 딜 이름, 딜 금액, 딜 단계, 회사명, 담당자명, 제품명, 예상 마감일

## 4. ImportJob

목적:

- 확정 전 import 작업의 header, 상태, mapping, summary, TTL을 저장한다.
- 새로고침, 탭 이동, 서버 재시작, 배포 중에도 `/api/imports/:importJobId`로 review 상태를 복구한다.
- 성공 확정 후에는 `importUserLogId`로 성공 이력 summary와 연결한다.

주요 컬럼:

- `id`: UUID PK
- `userId`: 소유 사용자
- `templateId`: 업로드 당시 사용한 `ImportTemplate`
- `targetType`: `ImportTemplateType`
- `templateVersion`: 업로드 당시 양식 version snapshot
- `templateColumnsJson`: 업로드 당시 양식 column snapshot
- `sourceColumnsJson`: 원본 파일 header snapshot
- `status`: `ImportJobStatus`
- `mappingJson`: template field key -> source column mapping
- `mappingSource`: `NONE`, `AI`, `RULE_BASED`, `USER`
- `originalFileName`: 화면 표시용 원본 파일명
- `fileSizeBytes`: 업로드 파일 크기
- `totalRowCount`, `validRowCount`, `invalidRowCount`, `importedRowCount`, `failedRowCount`: row summary
- `importUserLogId`: confirm 성공 후 생성된 `ImportUserLog` nullable link
- `confirmIdempotencyKey`: confirm 중복 방지 key
- `expiresAt`, `confirmedAt`, `canceledAt`, `failedAt`: UTC instant
- `lastErrorCode`, `lastErrorMessage`: 안전한 job-level 오류 요약
- `createdAt`, `updatedAt`: UTC timestamp

index:

- `userId, status, createdAt`
- `userId, expiresAt`
- `userId, targetType, createdAt`
- `templateId`

보관 정책:

- active status: `UPLOADED`, `MAPPED`, `NEEDS_REVIEW`, `READY_TO_CONFIRM`, `CONFIRMING`
- terminal status: `CONFIRMED`, `FAILED`, `CANCELED`, `EXPIRED`
- terminal 상태가 된 뒤 7일이 지나면 cleanup runner가 `ImportJob` aggregate를 삭제한다.
- `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`은 `ImportJob` cascade 삭제 대상이다.
- `ImportUserLog`, 실제 Company/Contact/Product/Deal row는 terminal cleanup에서 삭제하지 않는다.

## 5. ImportJobRow

목적:

- 업로드 파일의 각 data row와 mapping/정규화/검증 결과를 저장한다.
- 원본 file binary 삭제 후에도 review/resume UX가 동작하는 DB snapshot이다.

주요 컬럼:

- `id`: UUID PK
- `importJobId`: 소속 `ImportJob`
- `userId`: 소유 사용자
- `rowNumber`: 원본 파일 실제 row 번호. header row는 1, 첫 data row는 2
- `rawDataJson`: parser가 읽은 원본 row snapshot
- `mappedDataJson`: mapping 적용 후 template field 기준 값
- `normalizedDataJson`: confirm에 사용할 정규화 값
- `status`: `ImportJobRowStatus`
- `validationErrorsJson`: cell 단위 validation 오류
- `targetLabel`: 생성 대상 대표 label
- `createdAt`, `updatedAt`: UTC timestamp

index:

- unique `importJobId, rowNumber`
- `importJobId, status`
- `userId, status`

## 6. ImportJobError

목적:

- import 작업 중 발생한 parse, AI mapping, validation, confirm, storage, system 오류를 redacted 형태로 저장한다.
- 사용자 응답과 운영 로그에 raw row, provider 원문, storage key, PII를 노출하지 않기 위한 domain 오류 이력이다.

주요 컬럼:

- `id`: UUID PK
- `importJobId`: 소속 `ImportJob`
- `importJobRowId`: row 관련 오류 nullable link
- `userId`: 소유 사용자
- `errorType`: `PARSE`, `AI_MAPPING`, `VALIDATION`, `CONFIRM`, `STORAGE`, `SYSTEM`
- `errorCode`: application/domain error code
- `severity`: `INFO`, `WARNING`, `ERROR`
- `rowNumber`, `fieldKey`: row/cell 관련 오류 위치
- `safeMessage`: 사용자에게 보여도 되는 안전한 문구
- `detailJson`: redacted detail
- `retryable`: 재시도 가능 여부
- `createdAt`: UTC timestamp

index:

- `importJobId, createdAt`
- `userId, createdAt`
- `importJobRowId`

## 7. ImportUploadedFile

목적:

- 업로드 원본 file binary의 storage metadata와 삭제 상태를 추적한다.
- file binary는 DB에 저장하지 않으며, 정상 upload에서는 parse와 DB snapshot 생성 성공 직후 storage에서도 삭제한다.

주요 컬럼:

- `id`: UUID PK
- `importJobId`: 연결된 `ImportJob`
- `userId`: 소유 사용자
- `originalFileName`, `mimeType`, `fileSizeBytes`, `checksum`: 파일 metadata
- `storageProvider`, `storageBucket`, `storageKey`: storage metadata
- `status`: `STORED`, `PARSED`, `DELETED`, `EXPIRED`
- `uploadedAt`, `deletedAt`, `expiresAt`, `createdAt`, `updatedAt`: UTC timestamp

index:

- unique `importJobId`
- `userId, status, expiresAt`
- `checksum`

보관 정책:

- 정상 upload 후 `status=DELETED`, `deletedAt`을 기록한다.
- 즉시 삭제 실패 시 `deletedAt`을 비워 두고 `ImportJobError(errorType=STORAGE, errorCode=STORAGE_DELETE_FAILED)` warning을 남긴다.
- terminal cleanup은 `deletedAt`이 없는 파일의 storage delete를 재시도하고, 실패하면 `ImportJob` DB snapshot을 삭제하지 않는다.

## 8. ImportUserLog

목적:

- 사용자가 확정 저장에 성공한 불러오기 작업의 header snapshot을 저장한다.
- 확정 전 job 상태는 `ImportJob` 계열 table에 저장하고, `ImportUserLog`는 성공 이력 summary 정본으로 유지한다.

주요 컬럼:

- `id`: UUID PK
- `userId`: 소유 사용자
- `targetType`: `ImportTemplateType`
- `templateVersion`: 사용한 양식 버전
- `templateColumnsJson`: 확정 당시 양식 컬럼 snapshot
- `contextLabel`: 담당자 불러오기처럼 화면에 보여줄 context label
- `contextJson`: 확정 당시 context JSON
- `originalFileName`: 원본 업로드 파일명
- `fileSizeBytes`: 원본 파일 크기
- `totalRowCount`: 업로드 파일 전체 row 수
- `importedRowCount`: 확정 저장된 row 수
- `createdAt`: UTC timestamp

index:

- `userId, createdAt`
- `userId, targetType, createdAt`

## 9. ImportUserLogRow

목적:

- 확정 저장된 각 row의 제출 데이터 snapshot과 생성 대상 label을 저장한다.
- 상세 화면에서 사용자가 어떤 값을 확정했는지 조회할 수 있게 한다.

주요 컬럼:

- `id`: UUID PK
- `importUserLogId`: `ImportUserLog` FK
- `rowNumber`: 원본 파일 row 번호
- `submittedDataJson`: 확정 저장에 사용한 정규화 데이터 JSON
- `targetLabel`: 생성 대상 대표 label
- `createdAt`: UTC timestamp

index:

- `importUserLogId, rowNumber`

보관 정책:

- `ImportUserLogRow`는 생성 후 30일이 지나면 cleanup으로 삭제한다.
- `ImportUserLog` summary와 실제 CRM 데이터는 유지한다.
- row detail이 삭제된 성공 이력 상세는 `rows=[]`를 정상 상태로 반환한다.

## 10. 확정 저장 정책

- 회사 불러오기는 회사명, 회사분야, 회사지역을 저장한다.
- 제품 불러오기는 제품명, 제품단가, 제품 카테고리, 제품 상태를 저장한다.
- 담당자 불러오기는 회사명으로 사용자 소유 회사를 찾거나 만들고, 담당자 정보를 저장한다.
- 딜 불러오기는 회사명, 담당자명, 제품명으로 기존 사용자 소유 데이터를 찾은 뒤 딜과 `DealCompany`, `DealContact`, `DealProduct` 연결 row를 저장한다. 누락 회사/담당자/제품 보정값 생성 흐름은 FE API 함수, BE DTO, HTTP controller confirm, application service, repository 경로에 연결되어 있다.
- 확정 저장은 도메인 row 생성과 `ImportUserLog`/`ImportUserLogRow` 생성을 같은 transaction에서 처리한다.
- 검증 실패 row가 있으면 확정 전에 보정해야 한다.

성공 내역 목록 기준:

- `GET /api/import-user-logs`는 15개 단위 page-number pagination이며 `totalCount`, `totalPages`를 반환한다.

## 11. Upload 제한과 retention

- 파일 크기는 10MB 이하만 허용한다.
- header를 제외한 data row는 5,000행 이하만 허용한다.
- 5,001행 이상이면 storage 저장, `ImportJob`, `ImportJobRow`, `ImportUploadedFile` 생성 전에 safe validation error로 거부한다.
- cleanup runner는 `IMPORT_JOB_CLEANUP_ENABLED=true|1`일 때만 자동 실행한다.
- cleanup log는 count 중심 safe summary만 남기며 raw row, 파일명, `storageKey`, email, phone, name을 남기지 않는다.

## 12. 관련 API

- `GET /api/import-templates/active`
- `GET /api/import-templates/:templateId/download`
- `POST /api/imports`
- `GET /api/imports/active`
- `GET /api/imports/:importJobId`
- `POST /api/imports/:importJobId/map`
- `PATCH /api/imports/:importJobId/mapping`
- `PATCH /api/imports/:importJobId/rows`
- `POST /api/imports/:importJobId/validate`
- `POST /api/imports/:importJobId/confirm`
- `POST /api/imports/:importJobId/cancel`
- `GET /api/imports/:importJobId/errors`
- `GET /api/import-user-logs`
- `GET /api/import-user-logs/:importUserLogId`
