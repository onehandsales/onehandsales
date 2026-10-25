# Frontend 후속 범위

이번 요청은 Backend 두 API와 검토다. 기존 FE와 Sidebar 클릭은 변경하지 않는다.

후속 연결은 [사용 흐름](../COMMON/USER-FLOW.md)과 [① Object](../COMMON/API-SPEC/OBJECT_VIEW_LIST_API.md), [② List](../COMMON/API-SPEC/LIST_VIEW_LIST_API.md)를 따른다. ③ 응답 후 드롭다운을 열 때 대상별 API를 호출하며 선택 표시와 배열 순서를 유지한다. viewId가 null이면 query를 생략한다. 본문·선택 저장·자동 생성·즐겨찾기 쓰기는 별도 작업이다.
