# 헤더 별표와 개인 즐겨찾기 흐름

기준: [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [API 계약](API-SPEC/VIEW_FAVORITE_MUTATION_API.md). Backend는 구현 완료, 실제 별표 클릭의 FE 연결은 후속이다.

1. 기존 헤더 조회와 View 선택에서 현재 workspaceId/viewId/isFavorite를 얻는다. View가 없는 빈 헤더는 쓰기 대상을 갖지 않는다.
2. 미등록 별표를 누르면 POST favorite. body/query는 없고 인증·경로 UUID만 보낸다. 신규 201 또는 기존 200의 true를 반영한다.
3. 등록 별표를 누르면 DELETE favorite. 이미 없어도 200/false다. 개인 해당 View 등록만 해제한다.
4. 성공 후 현재 헤더와 개인 사이드바 즐겨찾기를 갱신한다. 삭제 시 나머지 순서는 그대로다. 실패 시 기존 상태를 유지하고 계약의 오류별 인증/재조회 처리를 적용한다.

현재 작업은 API만 제공한다. 낙관적 갱신·클릭 잠금·즐겨찾기 선택 이동은 이 계획에서 구현하지 않았다.
