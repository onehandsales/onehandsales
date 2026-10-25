# 작업 순서

상태: G01·G02 구현·검증과 G99 규칙 검토 완료. 실제 실행 결과는 TEST-AND-REVIEW와 작업 로그에 기록했다.

필수 선행: [TODO Software 기준](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Backend 규칙](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md).

| 순서 | 목적·포함 범위 | 제외 범위 | 완료 기준 |
| --- | --- | --- | --- |
| G01 | Object View 목록 계약·Controller·UseCase·Query Port·Repository·검증 | List API 외 추가 기능·FE·저장 | Object 대상/Workspace 격리·선택 표시·정렬·HTTP 검증 |
| G02 | List View 목록 계약·Controller·UseCase·Query Port·Repository·검증 | FE·생성/쓰기 | List 대상/Workspace 격리·선택 표시·정렬·HTTP 검증 |
| G99 | 전체 회귀·DI·실제 DB·규칙·문서·diff 검토, 발견 사항 수정 | 새 요구사항·커밋 | [검토 결과](../BE-TODO/TEST-AND-REVIEW.md)와 [로그](../../../../TODO_LOG/2026-10-26/OBJECT_LIST_VIEW_LIST_API/WORK_LOG.md) 기록 후 DONE 보관 |

두 계약을 먼저 confirmed로 작성한다. 개별 코드 변경 뒤 적합한 검증을 수행하고 최종 상태와 실패·skip을 구분한다.
