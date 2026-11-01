# TABLE·KANBAN·LIST 주 화면 조회

기준일: 2026-11-01. 현재 작업은 Backend 조회 API 하나와 TABLE/KANBAN/LIST 실행이다. 사용자의 최신 범위가 과거 11타입 초안보다 우선한다. 나머지 8타입의 enum·스키마는 유지하고 실행은 후속으로 둔다.

- 계약 정본: [주 화면 API](COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)
- 범위: [현재 범위](COMMON/SCOPE_AND_DEFERRED_WORK.md)
- 구현/검증 기록: [현재 구현 검토](COMMON/IMPLEMENTATION_REVIEW.md)
- Backend 규칙 재검토: [규칙별 근거와 실제 DB 검증](BE-TODO/BACKEND_RULE_COMPLIANCE_REVIEW.md)
- 기존 11타입 비즈니스 로직·FE 설계·JSON 예제는 확장 참고 자료이며 현재 구현 계약을 대체하지 않는다.

저장된 표시·필터·정렬·그룹을 실행하는 GET 구현을 완료했다. Backend 규칙 재검토에서 누락 주석·문서·검증을 보완하고 격리 PostgreSQL17.10을 포함한 전체69 suites/551 tests를 통과했다(skip0). 대규모 query plan/부하 측정은 후속이다. FE, 후보 조회, View 생성/저장, 업무값 변경, 임시 조건 override는 후속이다. List는 Entry 단위를 유지한다. 기존 Object/List·멤버십·메타데이터 공개 Port 경계를 따른다.
