# Goal Specs

상태: G01~G04 구현 완료 / G05~G08 구현 대기 / G09 최종 QA 대기 / 01 최종 서비스 형태 미완료
G01~G04 완료일: 2026-07-21

## 1. 목적

이 폴더는 `01_IMPORT_JOB_PERSISTENCE`를 `/goal`로 실행할 때 각 작업 단위가 바로 착수될 수 있도록 상세 명세와 완료 기록을 함께 둔다.

`COMMON/GOAL-WORK-ORDER.md`는 실행 순서이고, 이 폴더의 문서는 각 `/goal`의 실제 구현 계약이다.

## 1.1 완료 체크리스트

- [x] G01 `G01_DB_PERSISTENCE_FOUNDATION.md`
- [x] G02 `G02_BACKEND_IMPORT_JOB_API.md`
- [x] G03 `G03_USER_WEB_RESUME_UX.md`
- [x] G04 `G04_QA_CLEANUP.md`
- [x] 최종 QA closeout: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
- [ ] G05 `G05_TERMINAL_IMPORT_JOB_CLEANUP.md`
- [ ] G06 `G06_ORIGINAL_FILE_BINARY_MINIMIZATION.md`
- [ ] G07 `G07_IMPORT_SUCCESS_ROW_RETENTION.md`
- [ ] G08 `G08_IMPORT_VOLUME_LIMITS.md`
- [ ] G09 `G09_FINAL_SERVICE_QA_CLOSEOUT.md`

## 2. Goal 목록

| Goal | 상태 | 문서 | 목적 |
|---|---|---|---|
| G01 | Done | `G01_DB_PERSISTENCE_FOUNDATION.md` | Prisma schema, migration, repository 기반 |
| G02 | Done | `G02_BACKEND_IMPORT_JOB_API.md` | DB 기반 import API와 business logic |
| G03 | Done | `G03_USER_WEB_RESUME_UX.md` | User Web resume UX와 API client |
| G04 | Done | `G04_QA_CLEANUP.md` | 통합 QA, redaction, cross-user, 문서 closeout |
| G05 | Confirmed | `G05_TERMINAL_IMPORT_JOB_CLEANUP.md` | terminal ImportJob 임시 snapshot 7일 보관 후 자동 cleanup |
| G06 | Confirmed | `G06_ORIGINAL_FILE_BINARY_MINIMIZATION.md` | 원본 업로드 file binary를 parse와 DB snapshot 생성 직후 삭제 |
| G07 | Confirmed | `G07_IMPORT_SUCCESS_ROW_RETENTION.md` | `ImportUserLogRow` row-level submitted data를 30일 후 cleanup |
| G08 | Confirmed | `G08_IMPORT_VOLUME_LIMITS.md` | 대용량 worker 없이 10MB/5,000행 제한 적용 |
| G09 | Confirmed | `G09_FINAL_SERVICE_QA_CLOSEOUT.md` | G05~G08 최종형 보강 통합 QA와 01/NEXT_BACKEND/USER_WEB 문서 closeout |

## 3. 실행 규칙

- 한 번의 `/goal`에는 이 폴더의 goal 문서 하나만 넣는다.
- G01 완료 전 G02를 시작하지 않는다.
- G02 완료 전 G03을 시작하지 않는다.
- G04는 G01~G03 완료 후 실행한다.
- G05는 G01~G04 완료 상태와 `COMMON/FINAL-SERVICE-SHAPE.md` 결정을 기준으로 실행한다.
- G05는 User/Admin HTTP API를 추가하지 않고 Backend cleanup use case/runner만 구현한다.
- G06은 G05와 독립적으로 실행할 수 있지만, storage delete 실패 재시도는 G05 계약과 맞춘다.
- G07은 Backend cleanup과 User Web import log 상세의 빈 row 상태 처리를 함께 확인한다.
- G08은 upload API validation과 User Web upload error 표시를 함께 확인한다.
- G09는 G05~G08이 모두 완료된 뒤에만 실행하며, 01의 최종 서비스 형태 완료 판정을 닫는다.
- 각 goal은 해당 문서의 완료 기준을 만족해야 완료로 본다.

공통 구현 기준:

- 모든 goal 문서는 자체 체크리스트를 가져야 한다. 체크리스트에는 request, response, business logic, user flow, DB/Prisma 영향 확인이 포함되어야 한다.
- Backend 작업 전 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA`, `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/src/modules/data-import`를 확인한다.
- 소프트웨어 아키텍처, transaction, logging, observability, module boundary, repository/use case 책임 같은 IT 관련 판단은 `AGENT/SOFTWARE_AGENT`를 기준으로 한다.
- User Web 작업이 있으면 `AGENT/SOFTWARE_AGENT/FRONT_AGENT`, `AGENT/UXUI_AGENT`, `FE/user-web/src/features/import-export`를 확인한다.
- Request, response, business logic, user flow는 `COMMON/API-SPEC/IMPORT_JOB_API.md`, `COMMON/USER-FLOW.md`, 각 goal 문서의 계약을 기준으로 맞춘다.
- DB 관련 작업은 반드시 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`를 대조한다.
- DB schema, migration, repository, cleanup, retention, validation, transaction, runner, UI 상태 처리 등 새로 작성하거나 수정하는 코드에는 한글 주석을 반드시 남긴다.
- SQL 작성 시 한글 주석은 필수다. Prisma migration SQL, raw SQL, cleanup/retention 보조 SQL에는 `COMMENT ON TABLE`, `COMMENT ON COLUMN` 또는 `-- 한글 주석`으로 목적, 보관/삭제 기준, 안전 조건을 남긴다.
- raw row, 파일명, `storageKey`, provider raw detail, 사용자 email/phone/name은 response/log/Admin 화면에 노출하지 않는다.

## 4. 완료 전 첫 실행 권장 문구 기록

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G01_DB_PERSISTENCE_FOUNDATION.md 기준으로 G01을 구현해줘.
```

G05 실행 권장 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G05_TERMINAL_IMPORT_JOB_CLEANUP.md 기준으로 G05를 구현해줘.
```

G06 실행 권장 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G06_ORIGINAL_FILE_BINARY_MINIMIZATION.md 기준으로 G06을 구현해줘.
```

G07 실행 권장 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G07_IMPORT_SUCCESS_ROW_RETENTION.md 기준으로 G07을 구현해줘.
```

G08 실행 권장 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G08_IMPORT_VOLUME_LIMITS.md 기준으로 G08을 구현해줘.
```

G09 실행 권장 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G09_FINAL_SERVICE_QA_CLOSEOUT.md 기준으로 G09 최종 QA와 문서 closeout을 진행해줘.
```
