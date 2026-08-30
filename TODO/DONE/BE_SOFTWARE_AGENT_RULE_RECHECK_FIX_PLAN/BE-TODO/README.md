# Backend TODO

상태: Done / Archived
완료 커밋: `acdb9eb3 chore(backend): complete rule recheck final review`

## 1. 실행 순서

| 순서 | Goal | 파일 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | G01 | `G01-ADMIN-OPERATION-PRESENTATION-PRISMA-ENUM.goal.md` | P1 | Completed |
| 2 | G02 | `G02-SALES-REPORT-SCHEDULE-REPOSITORY-BOUNDARY.goal.md` | P1 | Completed |
| 3 | G03 | `G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md` | P2 | Completed |
| 4 | G04 | `G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md` | P2 | Completed |
| 5 | G05 | `G05-BACKEND-KOREAN-COMMENT-RULE.goal.md` | P2 | Completed |
| 6 | G06 | `G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md` | P3 | Completed |
| 7 | G08 | `G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md` | P3 | Completed |

문서 감사 Goal `COMMON/G07-API-SPEC-TEMPLATE-AUDIT.goal.md`, Backend 감사 Goal `G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md`, 최종 검토 Goal `COMMON/G99-FINAL-REVIEW.goal.md`는 완료되었다. 커밋 이후 재검토에서도 BE 전체 검증과 완료 문서 정합성이 통과했다.

G08에서 확인된 presentation repository port 타입 의존의 대량 분리는 `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`에서 G01/G02/G99까지 완료했다.

## 2. 공통 지시

- 각 Goal은 `COMMON/REFERENCES.md`, `COMMON/SCOPE.md`, `COMMON/EXECUTION-GATES.md`를 먼저 읽는다.
- Backend 코드 수정 시 한글 주석 필수 규칙을 적용한다.
- 검증 결과는 `TODO_LOG`에 남긴다.
- 사용자가 요청하지 않으면 커밋하지 않는다.
