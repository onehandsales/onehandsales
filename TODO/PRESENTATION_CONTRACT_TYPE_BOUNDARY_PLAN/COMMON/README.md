# Presentation Contract Type Boundary Common

상태: Ready

## 1. 목적

이 폴더는 `presentation` 계층의 repository port 타입 의존을 정리하기 위한 공통 감사 결과와 `/goal` 실행 문서를 보관한다.

## 2. 문서

| 문서 | 역할 |
| --- | --- |
| `PRESENTATION_REPOSITORY_IMPORT_AUDIT.md` | G08 전수 감사 결과와 분류 |
| `GOAL-WORK-ORDER.md` | 실행 순서와 프롬프트 |
| `G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md` | DTO validation contract 분리 |
| `G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md` | mapper read model contract 분리 |
| `G99-FINAL-REVIEW.goal.md` | 최종 검토 |

## 3. 공통 기준

- 기준 문서: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`
- Backend 구조 기준: domain/application/presentation/infrastructure 계층 분리
- API 계약 기준: request/response shape 보존, DTO validation 의미 보존
- 작업 로그 기준: 각 goal은 `TODO_LOG\<YYYY-MM-DD>\PRESENTATION_CONTRACT_TYPE_BOUNDARY\<GOAL_ID>_<TASK_TITLE>\WORK_LOG.md`를 작성한다.
