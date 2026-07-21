# 01 ImportJob Persistence

상태: Done
완료일: 2026-07-21
완료 커밋: `0c2a47b`, `c788388`, `a3b9dc7`, `fd6dd23`, `284c078`, `1177578`
순서: 01
성격: Global B2C 데이터 신뢰 기반 구현 계획
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

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

## 1. 목적

Import 업로드, 원본/preview 보관 정책, AI 매핑, 검증, 확정 전 상태를 서버 메모리가 아니라 DB에 영속화해 새로고침, 탭 이동, 서버 재시작, 배포 중에도 이어받을 수 있게 한다.

## 2. 구현 완료 상태

- Import template, upload, AI mapping, mapping 수정, row edit, validate, confirm, cancel, import user log 흐름이 DB 기반 API로 연결되어 있다.
- 확정 전 ImportJob은 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`로 저장된다.
- 새로고침, 탭 이동, 서버 재시작/배포 이후에도 `/api/imports/:importJobId`와 active job 조회로 상태를 복구할 수 있다.
- 원본 파일 metadata, TTL, confirm/cancel/expire 이후 삭제 추적, storage delete 실패 이력, redacted error/log 기준을 적용했다.
- 자동 검증과 route-mocked E2E QA는 완료했다. 실제 Supabase Cloud 수동 QA는 운영 확인 단계에서 별도로 실행한다.

## 3. 확정 방향

01은 최소 구현이 아니라 Global B2C 데이터 신뢰 기반으로 닫는다.

- 확정 전 작업은 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`로 저장한다.
- 확정 성공 후 이력은 기존 `ImportUserLog`, `ImportUserLogRow`를 계속 사용한다.
- 원본 파일 binary는 DB에 넣지 않고 storage에 저장한다. DB에는 `ImportUploadedFile` metadata와 storage key만 저장한다.
- 확정 전 job TTL은 7일로 둔다.
- 원본 파일은 confirm, cancel, expire 중 하나가 발생하면 삭제 대상이 되고, metadata에는 `deletedAt`을 남긴다.
- 사용자 화면은 Notion식 단순한 단계 흐름과 Attio식 record 연결 정확성을 유지한다.
- `ImportJobError`는 사용자 화면을 복잡하게 만들기 위한 테이블이 아니라 import 작업 단위의 redacted 오류 이력을 남기기 위한 테이블이다. 현재 cell 오류는 `ImportJobRow.validationErrorsJson`에도 저장한다.
- 공통 결정 로그 기준으로 01은 `NBA-006` 대상으로 확정됐고, 2026-07-21 구현과 QA closeout까지 완료했다.

## 4. 완료 판정

- 판정: 구현 완료
- 직접 대상: `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-006 ImportJob persistence/resume API`
- 완료 순서: G01 DB -> G02 Backend API -> G03 User Web -> G04 QA
- 완료 근거: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

01은 Global B2C 첫 판매 전체 bundle이 아니다. 결제, Admin 운영, 앱 내부 다국어, 제품 분석, Notification은 별도 계획으로 분리한다.

## 5. 참고

- `COMMON/REFERENCES.md`
- `COMMON/USER-FLOW.md`
- `COMMON/RELEASE-SCOPE-CHECK.md`
- `COMMON/PLANNING-REVIEW.md`
- `COMMON/API-SPEC/IMPORT_JOB_API.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `BE-TODO/DB-SCHEMA.md`
- `BE-TODO/API-TODO.md`
- `FE-TODO/USER-WEB-TODO.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-006
- `BE/src/modules/data-import/infrastructure/persistence/prisma-import-job.repository.ts`
