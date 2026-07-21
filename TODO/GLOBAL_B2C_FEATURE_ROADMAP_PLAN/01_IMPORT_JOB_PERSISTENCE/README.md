# 01 ImportJob Persistence

상태: Confirmed Implementation Plan
순서: 01
성격: Global B2C 데이터 신뢰 기반 구현 계획

## 1. 목적

Import 업로드, 원본/preview 보관 정책, AI 매핑, 검증, 확정 전 상태를 서버 메모리가 아니라 DB에 영속화해 새로고침, 탭 이동, 서버 재시작, 배포 중에도 이어받을 수 있게 한다.

## 2. 현재 상태

- Import template, upload, AI mapping, mapping 수정, confirm, import user log는 구현되어 있다.
- 확정 전 ImportJob은 `InMemoryImportJobStore`에 저장된다.
- 서버 재시작 또는 배포 시 확정 전 job이 사라질 수 있다.
- 업로드 원본 파일 저장 여부, preview row 보관 기간, 개인정보 삭제 요청 시 처리 범위가 확정되어 있지 않다.

## 3. 확정 방향

01은 최소 구현이 아니라 Global B2C 데이터 신뢰 기반으로 닫는다.

- 확정 전 작업은 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`로 저장한다.
- 확정 성공 후 이력은 기존 `ImportUserLog`, `ImportUserLogRow`를 계속 사용한다.
- 원본 파일 binary는 DB에 넣지 않고 storage에 저장한다. DB에는 `ImportUploadedFile` metadata와 storage key만 저장한다.
- 확정 전 job TTL은 48시간으로 둔다.
- 원본 파일은 confirm, cancel, expire 중 하나가 발생하면 삭제 대상이 되고, metadata에는 `deletedAt`을 남긴다.
- 사용자 화면은 Notion식 단순한 단계 흐름과 Attio식 record 연결 정확성을 유지한다.
- `ImportJobError`는 사용자 화면을 복잡하게 만들기 위한 테이블이 아니라 import 작업 단위의 redacted 오류 이력을 남기기 위한 테이블이다. 현재 cell 오류는 `ImportJobRow.validationErrorsJson`에도 저장한다.

## 4. 구현 착수 판정

- 판정: 구현 착수 가능
- 직접 대상: `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-006 ImportJob persistence/resume API`
- 첫 번째 goal: `COMMON/GOAL-SPECS/G01_DB_PERSISTENCE_FOUNDATION.md`
- 실행 순서: G01 DB -> G02 Backend API -> G03 User Web -> G04 QA

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
- `BE/src/modules/data-import/infrastructure/persistence/in-memory-import-job.store.ts`
