# 헤더에서 View 선택 목록을 여는 흐름

기준: [①](API-SPEC/OBJECT_VIEW_LIST_API.md), [②](API-SPEC/LIST_VIEW_LIST_API.md), [③ 기존 헤더](../../VIEW_HEADER_DETAIL_API_PLAN/COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md), [텍스트 UX](../../../VIEW_TWO_AREA_TEXT_UX.md).

사이드바에서 Object/List를 클릭하면 ③ 헤더만 조회한다. 응답의 대상 ID와 viewId를 보관하고 드롭다운을 열 때 ① 또는 ②를 호출한다. 사용자가 View를 전환한 뒤에는 현재 선택 ID를 전달한다. viewId가 null인 상태에서는 query를 생략할 수 있다. Frontend 연결은 후속 범위다.

각 API는 헤더 호출 여부에 의존하지 않고 인증·Workspace 멤버십·대상 소속을 매번 검증한다. viewId는 목록 필터·정렬·권한 근거로 사용하지 않는다. View 없음은 빈 목록이고, 선택 View가 목록에 없으면 모두 미선택이다.

후속 FE는 사용자/Workspace/대상 종류/대상 ID/선택 View ID로 캐시와 요청을 구분하고 늦은 응답이 새 선택을 덮지 않도록 한다. 로딩·빈 목록·조회 실패·접근 불가를 구분한다. 이 조회는 본문 데이터를 포함하지 않는다.
