# G23 Import Backend

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

## 요구사항 체크
- `POST /api/imports` 업로드 API를 구현한다.
- `POST /api/imports/:importJobId/map` AI 매핑 제안 API를 구현한다.
- `PATCH /api/imports/:importJobId/mapping` 사용자 매핑 수정 API를 구현한다.
- `POST /api/imports/:importJobId/confirm` 확정 실행 API를 구현한다.
- `GET /api/imports/:importJobId` 상세/preview/error 조회 API를 구현한다.
- Import 대상은 `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`로 제한한다.
- 원본 파일은 `StoragePort`로 저장하고 DB에는 storage metadata만 저장한다.
- CSV/Excel parser adapter와 실제 OpenAI import mapping adapter를 application port 뒤에 둔다.
- preview row와 row별 validation error를 저장한다.
- validation error row가 있으면 확정 실행을 막는다.
- 확정 실행 중 한 row라도 실패하면 target 도메인 변경은 all-or-nothing rollback한다.

## 제외 범위
- 일정/회의록 import
- Frontend 화면
- 모든 edge case 처리

## 작업 로그
- G23 기준 문서와 API 계약을 재확인했다.
- 기존 `import-export` 모듈은 README만 있는 상태임을 확인했다.
- Prisma에는 `ImportJob`, `ImportJobRow`, 관련 enum이 이미 존재함을 확인했다.
- G21 BusinessCard 모듈의 계층 구조, `StoragePort`, OpenAI adapter 패턴을 G23 구현 기준으로 삼기로 했다.
- CSV/Excel 파싱을 위해 `BE`에 `xlsx` 의존성을 추가했다.
- Import target field 정의를 `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`로 제한하고 대상별 필수 필드와 field kind를 추가했다.
- Import file parser port, import mapping AI port, import-export repository port를 추가했다.
- `POST /api/imports`, `POST /api/imports/:importJobId/map`, `PATCH /api/imports/:importJobId/mapping`, `POST /api/imports/:importJobId/confirm`, `GET /api/imports/:importJobId` 컨트롤러를 추가했다.
- 업로드 use case에서 파일 검증, parser adapter 호출, `StoragePort` 업로드, `ImportJob`/`ImportJobRow` preview 생성을 연결했다.
- AI mapping use case에서 `AiJob` 상태 기록과 실제 OpenAI import mapping adapter를 연결했다.
- 사용자 mapping 수정 use case에서 source column 검증, 필수 target field 검증, row별 mapped preview와 validation error를 갱신하도록 했다.
- confirm use case와 Prisma repository에서 validation error row 차단, target 도메인 생성 transaction, 실패 시 rollback 후 `ImportJob`/`ImportJobRow` 실패 기록을 구현했다.
- CSV는 UTF-8 한글이 깨지지 않도록 자체 parser로 처리하고, XLS/XLSX는 `xlsx` adapter로 처리하도록 분리했다.
- `ImportMappingRequired`, `ImportValidationFailed`, `ImportExecutionFailed`, `InvalidImportFile`, `ImportRowLimitExceeded` HTTP error mapping을 추가했다.
- `.env.example`에 `OPENAI_MODEL_IMPORT_MAPPING` 예시를 추가했다.

## 검토
- G23 API 연결 요구사항 5개 endpoint를 모두 구현했고 `AppModule`에 `ImportExportModule`을 연결했다.
- 원본 파일 저장은 `StoragePort` 뒤에서 수행하며 `ImportJob`에는 bucket/object key/content type/size/file name metadata만 저장한다.
- application 계층은 parser/OpenAI 구현체에 직접 의존하지 않고 port로만 접근한다.
- preview와 mapping은 자동 실행되지 않고 사용자가 `confirm: true`로 확정해야 target 도메인 데이터가 생성된다.
- mapping validation 실패 row가 하나라도 있으면 confirm이 `ImportValidationFailed`로 차단된다.
- confirm 중 target 생성 실패는 Prisma transaction rollback 후 별도 transaction으로 실패 row number와 reason을 기록한다.
- CSV 한글 encoding 문제를 직접 확인했고 UTF-8 CSV parser 경로를 별도로 추가했다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm test -- import-export`
- `cd BE && pnpm test`
- `cd BE && pnpm run build`
- Import use case unit test: 업로드/preview 생성, AI mapping 저장, mapping validation, confirm 위임 확인
- Parser adapter unit test: UTF-8 한글 CSV, quoted comma, duplicate header reject 확인

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G23 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
