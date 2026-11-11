# 사이드바 순서 변경

Workspace 공통 관리 항목/업무 목록과 멤버별 즐겨찾기 순서를 저장한다. API 계약은 TODO/SIDEBAR_REORDER_PLAN/COMMON/API-SPEC/SIDEBAR_ORDER_API.md를 따른다.

- endpoint별 전체 ID 배열을 PATCH하고 기존 GET cache를 사용자/Workspace별로 갱신한다.
- 섹션별 저장 중 중복 드래그 차단, 낙관적 재배치, 실패 복구와 최신 목록 재조회.
- UI는 공통 SidebarDataList에서 같은 섹션의 mouse drag 및 키보드 이동을 제공한다.
- 브라우저 기본 드래그를 유지하며 목록 전체에서 dragenter/dragover/drop을 처리한다. 항목 사이 1px 빈틈도 드롭 가능하고, 같은 간격에는 동일한 삽입선을 표시한다. 다른 섹션이나 목록 밖에서는 이동을 허용하지 않는다.
- 상단 ViewDefinition 순서·다른 섹션 이동·Admin Web은 변경하지 않는다.
