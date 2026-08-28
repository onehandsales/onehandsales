# BE Software Agent Rule Recheck Fix Plan

상태: In Progress / G01-G02 Completed
작성일: 2026-08-28
대상: `D:\workspace_repository\onehandsales\BE`
기준 규칙: `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT`

## 1. 목적

이 폴더는 Backend 코드가 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT` 규칙을 준수하도록 재검토하고 수정하기 위한 실행 계획이다.

기존 단일 문서 `TODO/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`의 내용을 `TODO/PADDLE_PLAN`처럼 `COMMON`, `BE-TODO`, `FE-TODO` 단위로 분리했다.

## 2. 진행 상태

| Goal | 상태 | 근거 |
| --- | --- | --- |
| G01 | Completed | `2f5647a2`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G01_ADMIN_OPERATION_PRESENTATION_PRISMA_ENUM\WORK_LOG.md` |
| G02 | Completed | `1e86c06c`, `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G02_SALES_REPORT_SCHEDULE_REPOSITORY_BOUNDARY\WORK_LOG.md` |
| G03 | Next | `BE-TODO\G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md` |
| G04 | Ready | `BE-TODO\G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md` |
| G05 | Ready | `BE-TODO\G05-BACKEND-KOREAN-COMMENT-RULE.goal.md` |
| G06 | Ready | `BE-TODO\G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md` |
| G07 | Ready | `COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md` |
| G08 | Ready | `BE-TODO\G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md` |
| G99 | Ready after G01-G08 | `COMMON\G99-FINAL-REVIEW.goal.md` |

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
| `FE-TODO/USER-WEB-CONTRACT-CHECK.md` | G04에서 필요한 User Web 계약 확인 지시 |

## 4. /goal 실행 순서

정본 실행 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다. 한 번의 `/goal`에서는 반드시 하나의 goal 파일만 실행한다.

G01과 G02는 완료되었으므로 다음 실행은 G03부터 시작한다.

```text
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G05-BACKEND-KOREAN-COMMENT-RULE.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G99-FINAL-REVIEW.goal.md 실행해줘.
```

## 5. 공통 원칙

- 모든 Goal은 `COMMON/REFERENCES.md`와 `COMMON/EXECUTION-GATES.md`를 먼저 따른다.
- Backend 코드를 수정할 때는 수정한 class/interface/type/method/helper마다 한글 주석을 작성한다.
- 각 Goal 완료 시 개별 Goal 문서, 상위 README, `COMMON/GOAL-WORK-ORDER.md`, `COMMON/CURRENT-RISK-SUMMARY.md`, `TODO_LOG`를 함께 갱신한다.
- 새로 발견한 큰 문제는 현재 Goal에 끼워 넣지 말고 `TODO_LOG`에 남긴 뒤 별도 TODO로 분리한다.
- 사용자가 명시적으로 요청하지 않으면 커밋하지 않는다.
- 기존 사용자 변경은 되돌리지 않는다.
