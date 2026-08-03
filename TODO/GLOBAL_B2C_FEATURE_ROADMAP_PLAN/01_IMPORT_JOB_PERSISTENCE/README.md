# 01 ImportJob Persistence

상태: G01~G04 구현 완료 / G05~G08 구현 대기 / G09 최종 QA 대기 / 01 최종 서비스 형태 미완료
G01~G04 완료일: 2026-07-21
완료 커밋: `0c2a47b`, `c788388`, `a3b9dc7`, `fd6dd23`, `284c078`, `1177578`
순서: 01
성격: Global B2C 데이터 신뢰 기반 구현 계획
결정 상태: 2026-07-21 G01~G04 완료, 2026-08-03 최종 서비스 형태 G05~G08 추가 결정 반영. G05~G08 구현과 G09 최종 QA 전까지 01은 최종 종결이 아니다.

## 0. 완료 체크리스트

- [x] G01 DB persistence foundation 완료
- [x] G02 Backend ImportJob API 완료
- [x] G03 User Web resume UX 완료
- [x] G04 QA cleanup 완료
- [x] `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-006 ImportJob persistence/resume API` 완료 반영
- [x] `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 DataImport persistence gap 완료 반영
- [x] Backend 검증: `prisma:validate`, `typecheck`, `lint`, `test -- data-import`, `build` 통과
- [x] User Web 검증: `typecheck`, `lint`, `build`, `test:e2e` 통과
- [x] QA closeout 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

## 0.1 최종 서비스 형태 보강

- [x] 2026-08-03 ImportJob terminal cleanup 정책 결정
- [x] 2026-08-03 원본 업로드 파일 binary 즉시 삭제 정책 결정
- [x] 2026-08-03 ImportUserLogRow 30일 row-level retention 정책 결정
- [x] 2026-08-03 대용량 worker 제외 및 10MB/5,000행 제한 정책 결정
- [x] `COMMON/FINAL-SERVICE-SHAPE.md` 작성
- [x] `COMMON/GOAL-SPECS/G05_TERMINAL_IMPORT_JOB_CLEANUP.md` 작성
- [x] `COMMON/GOAL-SPECS/G06_ORIGINAL_FILE_BINARY_MINIMIZATION.md` 작성
- [x] `COMMON/GOAL-SPECS/G07_IMPORT_SUCCESS_ROW_RETENTION.md` 작성
- [x] `COMMON/GOAL-SPECS/G08_IMPORT_VOLUME_LIMITS.md` 작성
- [x] `COMMON/GOAL-SPECS/G09_FINAL_SERVICE_QA_CLOSEOUT.md` 작성
- [ ] G05 Terminal ImportJob Cleanup 구현 및 QA
- [ ] G06 Original File Binary Minimization 구현 및 QA
- [ ] G07 Import Success Row Retention 구현 및 QA
- [ ] G08 Import Volume Limits 구현 및 QA
- [ ] G09 Final Service QA Closeout 및 `01_IMPORT_JOB_PERSISTENCE`, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN` 상태 동기화

## 1. 목적

Import 업로드, 원본/preview 보관 정책, AI 매핑, 검증, 확정 전 상태를 서버 메모리가 아니라 DB에 영속화해 새로고침, 탭 이동, 서버 재시작, 배포 중에도 이어받을 수 있게 한다.

## 2. 구현 완료 상태

- Import template, upload, AI mapping, mapping 수정, row edit, validate, confirm, cancel, import user log 흐름이 DB 기반 API로 연결되어 있다.
- 확정 전 ImportJob은 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`로 저장된다.
- 새로고침, 탭 이동, 서버 재시작/배포 이후에도 `/api/imports/:importJobId`와 active job 조회로 상태를 복구할 수 있다.
- 원본 파일 metadata, TTL, storage delete 실패 이력, redacted error/log 기준을 적용했다. G01~G04 당시에는 confirm/cancel/expire 이후 삭제 추적까지 닫았고, 2026-08-03 최종형에서는 원본 binary 즉시 삭제로 보강한다.
- 자동 검증과 route-mocked E2E QA는 완료했다. 실제 Supabase Cloud 수동 QA는 운영 확인 단계에서 별도로 실행한다.

## 3. 확정 방향

01은 최소 구현이 아니라 Global B2C 데이터 신뢰 기반으로 닫는다.

- 확정 전 작업은 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`로 저장한다.
- 확정 성공 후 summary 이력은 기존 `ImportUserLog`를 계속 사용한다.
- 확정 성공 후 row-level submitted data인 `ImportUserLogRow`는 30일 후 삭제한다.
- 원본 파일 binary는 DB에 넣지 않는다. storage에 임시 저장한 원본 파일도 parse와 DB snapshot 생성 성공 직후 삭제하고, DB에는 `ImportUploadedFile` metadata와 삭제 추적만 남긴다.
- 확정 전 job TTL은 7일로 둔다.
- Global B2C 최종 서비스 형태에서는 terminal 상태가 된 ImportJob 임시 snapshot을 7일 보관 후 자동 cleanup한다.
- terminal cleanup은 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`만 정리하고, `ImportUserLog`, 실제 CRM 데이터는 유지한다.
- 대용량 import background worker는 01 최종형에 만들지 않는다. 10MB/5,000 data row 제한으로 첫 판매 가능한 동기 import 경험을 닫는다.
- 사용자 화면은 Notion식 단순한 단계 흐름과 Attio식 record 연결 정확성을 유지한다.
- `ImportJobError`는 사용자 화면을 복잡하게 만들기 위한 테이블이 아니라 import 작업 단위의 redacted 오류 이력을 남기기 위한 테이블이다. 현재 cell 오류는 `ImportJobRow.validationErrorsJson`에도 저장한다.
- 공통 결정 로그 기준으로 01은 `NBA-006` 대상으로 확정됐고, 2026-07-21 구현과 QA closeout까지 완료했다.

## 3.1 최종 서비스 형태 추가 결정

2026-08-03 기준으로 기존 후속 후보였던 import 보관/삭제/입력량 제한을 01 최종형 G05~G08로 승격한다.

- G05 terminal snapshot 보관 기간: terminal 상태가 된 뒤 7일
- 적용 대상: 기존 terminal 데이터와 신규 terminal 데이터 모두
- 대상 상태: `CONFIRMED`, `CANCELED`, `EXPIRED`, `FAILED`
- 기준 시점: `confirmedAt`, `canceledAt`, `failedAt`, `expiresAt`
- 원본 파일 삭제 실패: cleanup에서 storage delete를 재시도하고 성공한 경우에만 DB snapshot 삭제
- 실행 방식: env flag 기반 optional runner
- batch size 기본값: 500
- 로그: safe summary log만 남김
- Admin 화면/API: 추가하지 않음. 11 Admin Operation에는 후속 운영 표시 후보로만 문서화
- G06 원본 업로드 파일 binary: parse와 DB snapshot 생성 성공 직후 삭제
- G07 성공 row-level 이력: `ImportUserLogRow`는 생성 30일 후 삭제, `ImportUserLog` summary는 유지
- G08 import volume: 10MB/5,000 data row 제한, 초과 시 job/storage/row 생성 전 거부

이 결정은 작업 단위가 커서 기존 01에서 후속 후보 또는 모호한 범위로 남았던 항목 중 01의 직접 책임인 import 데이터 보관/삭제/입력량 제한만 최종형에 포함한다. 대용량 import worker, 범용 ExportJob, Admin 전용 화면/API, 일정/회의록 import는 01 최종형에 포함하지 않는다.

## 3.2 구현 필수 기준

G05~G09를 포함해 01의 모든 `/goal` 착수 시 아래 기준을 반드시 따른다.

- 각 goal 문서에는 자체 체크리스트가 있어야 하며, request, response, business logic, user flow, DB/Prisma 영향 확인을 포함해야 한다.
- Backend/API/architecture/convention은 `AGENT/SOFTWARE_AGENT`와 `BE/src/modules/data-import`를 확인한 뒤 구현한다.
- UX/UI와 User Web 흐름은 `AGENT/UXUI_AGENT`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT`, `COMMON/USER-FLOW.md`, `FE-TODO/USER-WEB-TODO.md`를 기준으로 한다.
- DB 관련 작업은 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`를 먼저 대조한다.
- 코드 작성 시 한글 주석은 필수다. cleanup, retention, validation, transaction, runner, DB 삭제/보존 분기처럼 의도가 중요한 코드에는 반드시 한글 주석으로 이유를 남긴다.

## 4. 완료 판정

- 판정: G01~G04 구현 완료. G05~G08은 01 완전 종결을 위한 최종 서비스 형태 보강 구현 대상이고, G09는 해당 보강을 닫는 최종 QA/문서 closeout 대상이다.
- 최종 종결 조건: G05~G08 구현, G09 Backend/User Web 통합 QA, 문서 상태 업데이트가 끝나면 01은 Global B2C 최종 서비스 형태 기준으로 완전 종료한다.
- 직접 대상: `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-006 ImportJob persistence/resume API`
- 완료 순서: G01 DB -> G02 Backend API -> G03 User Web -> G04 QA
- 완료 근거: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

최종 종결 시 반드시 같이 업데이트할 문서:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`: G05~G09 완료 체크, 상태를 최종 서비스 형태 완료로 변경, 완료 근거와 QA 결과 기록
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`: `NBA-006`을 G01~G09 전체 기준 최종 종료로 정리
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`: DataImport/Import UX gap이 최종 서비스 형태 기준으로 닫혔음을 반영

01은 Global B2C 첫 판매 전체 bundle이 아니다. 결제, Admin 운영, 앱 내부 다국어, 제품 분석, Notification은 별도 계획으로 분리한다. 대용량 import worker, 범용 ExportJob, 일정/회의록 import, ImportJob 전용 Admin 화면/API도 01 최종 종료 조건이 아니다.

## 5. 참고

- `COMMON/REFERENCES.md`
- `COMMON/FINAL-SERVICE-SHAPE.md`
- `COMMON/USER-FLOW.md`
- `COMMON/RELEASE-SCOPE-CHECK.md`
- `COMMON/PLANNING-REVIEW.md`
- `COMMON/API-SPEC/IMPORT_JOB_API.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/GOAL-SPECS/G05_TERMINAL_IMPORT_JOB_CLEANUP.md`
- `COMMON/GOAL-SPECS/G06_ORIGINAL_FILE_BINARY_MINIMIZATION.md`
- `COMMON/GOAL-SPECS/G07_IMPORT_SUCCESS_ROW_RETENTION.md`
- `COMMON/GOAL-SPECS/G08_IMPORT_VOLUME_LIMITS.md`
- `COMMON/GOAL-SPECS/G09_FINAL_SERVICE_QA_CLOSEOUT.md`
- `BE-TODO/DB-SCHEMA.md`
- `BE-TODO/API-TODO.md`
- `FE-TODO/USER-WEB-TODO.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-006
- `BE/src/modules/data-import/infrastructure/persistence/prisma-import-job.repository.ts`
