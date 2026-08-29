# BE Software Agent Rule Recheck Fix Plan

상태: Done / Archived
작성일: 2026-08-28
완료일: 2026-08-29
완료 커밋: `acdb9eb3 chore(backend): complete rule recheck final review`
대상: `D:\workspace_repository\onehandsales\BE`
기준 규칙: `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT`

## 1. 목적

이 폴더는 Backend 코드가 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT` 규칙을 준수하도록 재검토하고 수정한 완료 보관 계획이다.

기존 단일 문서 `TODO/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`의 내용을 `TODO/PADDLE_PLAN`처럼 `COMMON`, `BE-TODO`, `FE-TODO` 단위로 분리했고, G99 최종 검토 완료 후 `TODO/DONE`에 보관했다.

## 2. 진행 상태

| Goal | 상태 | 근거 |
| --- | --- | --- |
| G01 | Completed | `2f5647a2`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G01_ADMIN_OPERATION_PRESENTATION_PRISMA_ENUM\WORK_LOG.md` |
| G02 | Completed | `1e86c06c`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G02_SALES_REPORT_SCHEDULE_REPOSITORY_BOUNDARY\WORK_LOG.md` |
| G03 | Completed | `c915111f`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G03_AI_WEEKLY_REPORT_OBSERVABILITY\WORK_LOG.md` |
| G04 | Completed | `21841c62`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G04_AI_WEEKLY_REPORT_SUMMARY_PREVIEW_CONTRACT\WORK_LOG.md` |
| G05 | Completed | `dca1a22c`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G05_BACKEND_KOREAN_COMMENT_RULE\WORK_LOG.md` |
| G06 | Completed | `0d0530d3`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G06_BOOTSTRAP_PROCESS_ENV_POLICY\WORK_LOG.md` |
| G07 | Completed | `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G07_API_SPEC_TEMPLATE_AUDIT\WORK_LOG.md`, `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN` |
| G08 | Completed | `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G08_PRESENTATION_REPOSITORY_PROJECTION_AUDIT\WORK_LOG.md`, `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN` |
| G99 | Completed | `acdb9eb3`, `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G99_FINAL_REVIEW\WORK_LOG.md` |

## 3. 문서 구조

| 문서 | 역할 |
| --- | --- |
| `COMMON/SCOPE.md` | 전체 포함/제외 범위와 공통 코드 규칙 |
| `COMMON/REFERENCES.md` | 반드시 먼저 읽을 Agent/코드/API/FE 참조 |
| `COMMON/EXECUTION-GATES.md` | `/goal` 착수 전 gate |
| `COMMON/GOAL-WORK-ORDER.md` | `/goal` 실행 순서와 프롬프트 |
| `COMMON/CURRENT-RISK-SUMMARY.md` | 현재 확인된 위반/리스크 요약 |
| `COMMON/VALIDATION-CHECKLIST.md` | 최종 검토와 정적 점검 기준 |
| `COMMON/G07-API-SPEC-TEMPLATE-AUDIT.goal.md` | API-SPEC 템플릿 감사 Goal |
| `COMMON/G99-FINAL-REVIEW.goal.md` | 전체 완료 후 최종 검토 Goal |
| `BE-TODO/README.md` | Backend Goal 목록 |
| `BE-TODO/G01-ADMIN-OPERATION-PRESENTATION-PRISMA-ENUM.goal.md` | admin-operation presentation Prisma enum 제거 |
| `BE-TODO/G02-SALES-REPORT-SCHEDULE-REPOSITORY-BOUNDARY.goal.md` | sales-report와 schedule repository 경계 정리 |
| `BE-TODO/G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md` | AI Weekly Report 관측성 계약 보강 |
| `BE-TODO/G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md` | `summaryPreview` 응답 계약 정합화 |
| `BE-TODO/G05-BACKEND-KOREAN-COMMENT-RULE.goal.md` | 한글 주석 규칙 누락 보강 |
| `BE-TODO/G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md` | bootstrap `process.env` 정책 정리 |
| `BE-TODO/G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md` | presentation repository projection type 의존 감사 |
| `FE-TODO/USER-WEB-CONTRACT-CHECK.md` | G04 User Web 계약 확인 결과 |

## 4. 완료 상태

정본 실행 순서는 `COMMON/GOAL-WORK-ORDER.md`에 완료 상태로 보관한다.

G01부터 G08까지의 코드 수정/감사 Goal과 G99 최종 검토가 모두 완료되었다. 커밋 이후 재검토에서도 작업 트리 clean, BE 전체 검증 통과, 완료 상태 문구/경로 정합성을 확인했다. 이 계획 안에서 추가 실행할 `/goal`은 없다.

후속으로 분리된 활성 계획은 `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN`과 `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`이다.

## 5. 공통 원칙

- 모든 Goal은 `COMMON/REFERENCES.md`와 `COMMON/EXECUTION-GATES.md`를 먼저 따른다.
- Backend 코드를 수정할 때는 수정한 class/interface/type/method/helper마다 한글 주석을 작성한다.
- 각 Goal 완료 시 개별 Goal 문서, 상위 README, `COMMON/GOAL-WORK-ORDER.md`, `COMMON/CURRENT-RISK-SUMMARY.md`, `TODO_LOG`를 함께 갱신한다.
- 새로 발견한 큰 문제는 현재 Goal에 끼워 넣지 말고 `TODO_LOG`에 남긴 뒤 별도 TODO로 분리한다.
- 사용자가 명시적으로 요청하지 않으면 커밋하지 않는다.
- 기존 사용자 변경은 되돌리지 않는다.
