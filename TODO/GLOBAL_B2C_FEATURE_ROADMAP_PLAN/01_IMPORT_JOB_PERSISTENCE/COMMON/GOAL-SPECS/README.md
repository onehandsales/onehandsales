# Goal Specs

상태: Done
완료일: 2026-07-21

## 1. 목적

이 폴더는 `01_IMPORT_JOB_PERSISTENCE`를 `/goal`로 실행할 때 각 작업 단위가 바로 구현에 들어갈 수 있도록 상세 명세를 둔 완료 기록이다.

`COMMON/GOAL-WORK-ORDER.md`는 실행 순서이고, 이 폴더의 문서는 각 `/goal`의 실제 구현 계약이다.

## 1.1 완료 체크리스트

- [x] G01 `G01_DB_PERSISTENCE_FOUNDATION.md`
- [x] G02 `G02_BACKEND_IMPORT_JOB_API.md`
- [x] G03 `G03_USER_WEB_RESUME_UX.md`
- [x] G04 `G04_QA_CLEANUP.md`
- [x] 최종 QA closeout: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

## 2. Goal 목록

| Goal | 상태 | 문서 | 목적 |
|---|---|---|---|
| G01 | Done | `G01_DB_PERSISTENCE_FOUNDATION.md` | Prisma schema, migration, repository 기반 |
| G02 | Done | `G02_BACKEND_IMPORT_JOB_API.md` | DB 기반 import API와 business logic |
| G03 | Done | `G03_USER_WEB_RESUME_UX.md` | User Web resume UX와 API client |
| G04 | Done | `G04_QA_CLEANUP.md` | 통합 QA, redaction, cross-user, 문서 closeout |

## 3. 실행 규칙

- 한 번의 `/goal`에는 이 폴더의 goal 문서 하나만 넣는다.
- G01 완료 전 G02를 시작하지 않는다.
- G02 완료 전 G03을 시작하지 않는다.
- G04는 G01~G03 완료 후 실행한다.
- 각 goal은 해당 문서의 완료 기준을 만족해야 완료로 본다.

## 4. 완료 전 첫 실행 권장 문구 기록

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G01_DB_PERSISTENCE_FOUNDATION.md 기준으로 G01을 구현해줘.
```
