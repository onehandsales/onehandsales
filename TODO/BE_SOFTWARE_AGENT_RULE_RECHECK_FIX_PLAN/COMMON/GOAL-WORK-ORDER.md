# Goal Work Order

상태: In Progress / G01-G02 Completed

## 1. 실행 원칙

- 한 번의 `/goal`에서는 하나의 goal 파일만 실행한다.
- `G01`, `G02`는 완료되었고, 다음 실행 대상은 `G03`이다.
- `G99`는 모든 수정과 감사 Goal 완료 후 마지막에 실행한다.
- 각 Goal 시작 전 `COMMON/REFERENCES.md`, `COMMON/SCOPE.md`, `COMMON/EXECUTION-GATES.md`를 확인한다.
- Backend 코드 수정 시 한글 주석 필수 규칙을 적용한다.

## 2. 실행 순서

| 순서 | Goal | 파일 | 성격 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | G01 | `BE-TODO/G01-ADMIN-OPERATION-PRESENTATION-PRISMA-ENUM.goal.md` | 코드 수정 | Completed |
| 2 | G02 | `BE-TODO/G02-SALES-REPORT-SCHEDULE-REPOSITORY-BOUNDARY.goal.md` | 코드 수정 | Completed |
| 3 | G03 | `BE-TODO/G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md` | 코드/테스트 수정 | Next |
| 4 | G04 | `BE-TODO/G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md` | 코드 또는 문서 수정 | Ready |
| 5 | G05 | `BE-TODO/G05-BACKEND-KOREAN-COMMENT-RULE.goal.md` | 코드 주석 수정 | Ready |
| 6 | G06 | `BE-TODO/G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md` | 문서/소폭 코드 수정 | Ready |
| 7 | G07 | `COMMON/G07-API-SPEC-TEMPLATE-AUDIT.goal.md` | 문서 감사 | Ready |
| 8 | G08 | `BE-TODO/G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md` | 감사/후속 분리 | Ready |
| 9 | G99 | `COMMON/G99-FINAL-REVIEW.goal.md` | 최종 검토 | Ready after G01-G08 |

## 3. 실행 프롬프트

```text
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G05-BACKEND-KOREAN-COMMENT-RULE.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G99-FINAL-REVIEW.goal.md 실행해줘.
```

## 4. 완료 판정

- 각 Goal의 `TODO_LOG`가 있다.
- 각 Goal의 검증 명령 결과가 기록되어 있다.
- 완료된 Goal의 상태가 개별 Goal 문서, 상위 README, 작업 순서표, 리스크 요약에 반영되어 있다.
- G99 최종 검토가 완료되어 있다.
- 남은 리스크가 있으면 후속 TODO로 분리되어 있다.
