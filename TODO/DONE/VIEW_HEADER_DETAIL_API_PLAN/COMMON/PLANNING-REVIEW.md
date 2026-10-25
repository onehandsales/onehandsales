# View 헤더 구현 계획 검토

- 갱신일: 2026-10-25
- 문서 검토: 현재 대상 기반 계약으로 구현 가능
- 실행 검증: [TEST-PLAN](../BE-TODO/TEST-PLAN.md), 실제 규칙 검토: [G99](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)

## 1. 변경 근거

이전 문서는 즐겨찾기의 View ID로 단건 조회하는 계획이었다. 이후 사용자는 사이드바 Object/List ID로 ③을 먼저 호출하고, 응답 View ID로 드롭다운 조회를 이어가도록 순서를 수정했다. 조회·표시를 먼저 만들고 저장·기본 View 자동 생성은 이후 작업하도록 요청했다.

이 갱신은 기존 확정 문서를 무관하게 재설계한 것이 아니라 최신 사용자 범위에 맞춘 계약 변경이다. HTTP GET 하나, 읽기 전용, owning module 공개 Port 경계는 유지한다.

## 2. 검토 결과

| 검토 축 | 판단 |
| --- | --- |
| 요청·응답 | [API 정본](API-SPEC/VIEW_HEADER_DETAIL_API.md)에 DTO·7개 응답 필드·Query/UUID·오류 명시 |
| 초기 표시 | 현재 저장 순서 첫 View 조회, 대상이 있되 View가 없으면 null 응답 |
| DB·모듈 경계 | Object/List 요약은 소유 모듈, View/Favorite는 View 모듈, schema 변경 없음 |
| 개인정보·로그 | 서버 멤버 ID·Workspace 범위, Actor 없는 읽기, 기존 request id·Filter |
| 후속 범위 | ①/②, FE·본문·즐겨찾기 클릭/쓰기·View 생성/저장·자동 생성 제외 |
| 실제 검증 | 단위·HTTP·Repository DB·DI·회귀 결과를 별도 기록 |

이 문서의 기획 검토를 런타임 통과 근거로 사용하지 않는다. [TODO Software 기준](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)을 따른다. 과거 문서 작성·커밋 기록은 [기존 로그](../../../../TODO_LOG/2026-10-25/VIEW_HEADER_DETAIL_API_PLAN/WORK_LOG.md), 이번 구현은 [구현 로그](../../../../TODO_LOG/2026-10-25/VIEW_HEADER_TARGET_GET/WORK_LOG.md)로 구분한다.
