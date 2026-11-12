# TABLE·KANBAN·LIST 주 화면 조회

기준일: 2026-11-01. 현재 범위는 Backend 조회 API 하나의 TABLE/KANBAN/LIST 실행과 승인된 User Web 본문 연결이다. 사용자의 최신 범위가 과거 11타입 초안보다 우선한다. 나머지 8타입의 enum·스키마는 유지하고 실행은 후속으로 둔다.

- 계약 정본: [주 화면 API](COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)
- 범위: [현재 범위](COMMON/SCOPE_AND_DEFERRED_WORK.md)
- 구현/검증 기록: [현재 구현 검토](COMMON/IMPLEMENTATION_REVIEW.md)
- Backend 규칙 재검토: [규칙별 근거와 실제 DB 검증](BE-TODO/BACKEND_RULE_COMPLIANCE_REVIEW.md)
- 기존 11타입 비즈니스 로직·FE 설계·JSON 예제는 확장 참고 자료이며 현재 구현 계약을 대체하지 않는다.

저장된 표시·필터·정렬·그룹을 실행하는 GET 구현을 완료했다. Backend 규칙 재검토에서 누락 주석·문서·검증을 보완하고 격리 PostgreSQL17.10을 포함한 전체69 suites/551 tests를 통과했다(skip0). 대규모 query plan/부하 측정은 후속이다. 후보 조회, View 생성/저장, ListEntry 값 변경, 임시 조건 override는 후속이다. List는 Entry 단위를 유지한다. 기존 Object/List·멤버십·메타데이터 공개 Port 경계를 따른다.

2026-11-01 추가 승인으로 User Web의 TABLE/KANBAN/LIST 본문 연결을 구현했다. 관리항목/업무목록 클릭 → 기존 헤더 조회 → 선택 View의 `/data` 조회 → 타입별 본문으로 연결한다. TABLE은 기존 표·셀 편집 UX를 재사용하고 검색·일반/열별 페이지·오류 복구를 제공한다. 기존 직접 Record 값 수정·빈 Record 생성 API도 재사용한다. 현재 FE 책임과 검증은 [crm-view README](../../FE/user-web/src/features/crm-view/README.md)를 따른다. View 생성/저장·ListEntry 쓰기·카드 이동·상세·임시 조건 실행은 후속이며 Backend 계약/schema/환경은 바꾸지 않았다.

같은 날 후속 승인으로 실제 DB에 저장된 나머지8타입 View를 세 타입으로 전환했다. 현재 저장 데이터는 TABLE18/KANBAN2/LIST4이며 기존24개 ID와 원본 업무 데이터를 보존한다. 실제 데이터 전환과 복구 기록은 [View 타입 전환](../../BE/prisma/VIEW_TYPE_CONVERSION.md)을 따른다. 나머지8타입의 실행기 구현이나 enum 제거를 의미하지 않는다.
