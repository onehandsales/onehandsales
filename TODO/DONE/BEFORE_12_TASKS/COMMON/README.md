# Common

상태: Done / 12 Billing Handoff Ready

## 1. 목적

이 폴더는 `BEFORE_12_TASKS`에서 Frontend, Backend, PM, UX/UI, Software 기준이 함께 봐야 하는 공통 계약을 둔다.

문서 구조는 `01_IMPORT_JOB_PERSISTENCE`처럼 상위 목적, scope, references, user flow, API 계약, goal work order, goal specs, BE/FE TODO가 함께 움직이는 형태를 따른다.

## 2. 문서 목록

| 문서 | 상태 | 목적 |
| --- | --- | --- |
| `SCOPE.md` | Final / 12 Billing Handoff Ready | 포함/제외 범위와 구현 금지선 |
| `REFERENCES.md` | Final | 선행 확인 문서와 실제 코드 확인 경로 |
| `USER-FLOW.md` | Done / Handoff Complete | 운영자/작업자의 closeout 흐름 |
| `GOAL-WORK-ORDER.md` | G01-G06 Done / 12 Billing Handoff Ready | `/goal` 실행 순서와 검증 gate |
| `PLANNING-REVIEW.md` | Done / 12 Billing Handoff Ready | 구현 전 기획 검토 결과 |
| `FINAL-SERVICE-SHAPE.md` | Final / 12 Billing Handoff Ready | 12 착수 전 최종 서비스/문서 상태 |
| `RELEASE-SCOPE-CHECK.md` | Done / 12 Billing Handoff Ready | 12 착수 가능 여부와 제외 범위 검수 |
| `API-SPEC/README.md` | Confirmed / No New API | API 변경 여부와 계약 상태 |
| `API-SPEC/NO_NEW_API_CONTRACT.md` | Confirmed / No New API | 이번 계획의 API non-change 계약 |
| `GOAL-SPECS/README.md` | G01-G06 Done / 12 Billing Handoff Ready | goal 상세 명세 index |

## 3. 공통 원칙

- 12 전 작업은 운영 smoke와 문서 정합성 closeout이다.
- 실제 코드 상태를 기준으로 문서를 정리한다.
- stale 문서를 기준으로 이미 구현된 route/API를 rollback하지 않는다.
- 새 API, 새 DB, 새 FE route, 새 billing/customer admin 기능은 만들지 않는다.
- G01 외에는 외부 provider 실제 호출을 요구하지 않는다.
- 문서 정합성을 위해 비활성 legacy 코드를 정리해야 할 경우에는 case-by-case로 삭제 또는 격리하되, 사용자 기능이나 API 계약을 새로 열지 않는다.
- 코드 변경이 발생하면 관련 앱의 `typecheck`와 `lint`를 통과해야 한다.
- 코드 변경이 발생하면 `AGENT/SOFTWARE_AGENT`의 한글 주석 규칙을 따른다.
- DB/Prisma 변경이 발생하면 `BE/prisma`를 먼저 확인하고 한국어 schema/migration 주석을 남긴다.

## 4. Goal 단위

이번 폴더의 goal은 6개다.

- G01: `PRE12-F04` provider smoke closeout
- G02: `PRE12-F31` 10 Mobile checklist closeout
- G03: `PRE12-F32` User Web route architecture closeout
- G04: `PRE12-F33` 11 Admin checklist closeout
- G05: `PRE12-F34` Admin Web architecture legacy closeout
- G06: G01~G05 결과 handoff 완료

## 5. 관련 문서

- `TODO/BEFORE_12_TASKS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
