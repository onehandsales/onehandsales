# View 헤더 Frontend 후속 범위

- 상태: 후속 작업. 이번 구현은 Backend GET 하나다.
- 계약 정본: [API-SPEC](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
- 흐름: [USER-FLOW](../COMMON/USER-FLOW.md)

## 1. 후속 연결

사이드바 Object/List 클릭 시 Workspace와 targetType/targetId로 ③을 먼저 호출한다. 헤더 응답의 objectDefinition/listDefinition으로 대상 이름·아이콘을, viewId/viewName/viewIcon/viewType으로 현재 보기를, isFavorite로 별표를 표시한다.

View 정보가 null이면 대상 요약과 보기 없는 상태를 표시한다. 서버에 없는 View ID를 만들거나 자동 생성된 것으로 표시하지 않는다. 유효한 View가 있을 때만 드롭다운 클릭 시 후속 ①/②를 호출한다. 목록 API와 View 생성·저장 기능은 별도 작업이다.

## 2. 소비 기준

기존 apiClient의 인증·갱신과 feature 공개 경계를 사용한다. 캐시는 사용자/Workspace/대상 종류/대상 ID로 구분하고 늦은 응답이 새 선택을 덮지 않도록 한다. 400/401/403/404/500과 정상적인 View 없음을 구분한다.

이번 변경은 FE/Admin Web의 client/hook/route/사이드바/헤더/본문을 수정하지 않는다. 즐겨찾기 클릭·등록·해제, 최근 선택 저장과 기본 View 자동 생성은 후속 범위다.
