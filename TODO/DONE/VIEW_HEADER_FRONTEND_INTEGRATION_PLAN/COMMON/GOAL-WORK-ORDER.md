# 작업 순서

상태: G01·G02·G03과 G99 완료. 실제 결과와 초기 실패·수정 이력은 구현·검토 문서에 기록했다.

필수 선행: [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Front Agent](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md).

| 순서 | 포함·목적 | 제외 | 완료 기준 |
| --- | --- | --- | --- |
| G01 | API·타입·Query key·서버 모델 | HTTP 변경·저장 | 기존 인증 흐름·3 API 경로·호출 시점·선택 처리 |
| G02 | 공통 헤더·Object/List 경로·사이드바·오른쪽 도구 분리 | 본문 확장·쓰기 | 두 대상에서 실제 조회 표시와 반응형·기존 본문 보존 |
| G03 | 단위·Playwright·타입·린트·빌드 | 실제 업무 DB fixture | 요청 시점·오류·빈 상태·전환 격리·키보드·회귀 확인 |
| G99 | 규칙·diff·문서·검증 검토와 발견 사항 수정 | 새 요구사항·배포·커밋 | 실제 결과 기록 후 완료 보관 |

[검토 결과](../FE-TODO/IMPLEMENTATION-AND-REVIEW.md), [작업 로그](../../../../TODO_LOG/2026-10-26/VIEW_HEADER_FRONTEND_INTEGRATION/WORK_LOG.md)를 실행 중 갱신한다.
