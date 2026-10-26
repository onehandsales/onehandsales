# 공통 헤더 Frontend 소비 계약

- 계약 상태: implemented
- 소비자: User Web
- 기존 HTTP 계약 변경 없음. 아래 API 정본을 재사용하며 이 문서는 FE 상태·호출 시점 계약이다.
- [③ 헤더](../../../VIEW_HEADER_DETAIL_API_PLAN/COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
- [① Object 목록](../../../OBJECT_LIST_VIEW_LIST_API_PLAN/COMMON/API-SPEC/OBJECT_VIEW_LIST_API.md)
- [② List 목록](../../../OBJECT_LIST_VIEW_LIST_API_PLAN/COMMON/API-SPEC/LIST_VIEW_LIST_API.md)

## 순서와 응답 소비

사이드바 관리항목/업무목록 → 각 대상 경로 → ③(workspaceId/targetType/targetId) → 대상 name/icon·현재 viewId/name/icon/type·isFavorite 표시. View가 없으면 대상 이름과 보기 없음 상태를 표시한다.

드롭다운을 열 때 ③ 응답의 대상 ID와 현재 viewId로 ① 또는 ②를 호출한다. viewId=null이면 query를 생략한다. 서버 순서를 보존하며 이름·타입·선택 체크를 표시하고 검색은 받은 목록 안에서 수행한다. 선택한 View의 ID/이름/아이콘/타입을 화면 상태로 갱신하고 메뉴를 닫는다. 재오픈 시 현재 ID를 전달한다.

초기 별표는 ③의 isFavorite, 전환한 View는 기존 개인 즐겨찾기 공개 조회 결과를 사용한다. 미조회 상태를 false로 확정하지 않는다. View 생성·별표 클릭·선택 저장을 로컬 가짜 저장으로 제공하지 않는다.

## 상태·접근성·경계

TanStack Query key에 사용자/Workspace/종류/대상/현재 View를 포함하고 AbortSignal을 apiClient에 전달한다. 대상 전환 시 선택 상태를 초기화하고 이전 응답은 새 대상 UI에 사용하지 않는다. 두 반응형 헤더는 하나의 모델/선택 상태를 공유한다.

로딩 skeleton·조회 실패/재시도·404 접근 불가·View 없는 정상 상태·검색 결과 없음을 구분한다. 드롭다운은 검색 입력 포커스, 위/아래 키 이동·Enter 선택·Escape/외부 클릭 닫기와 트리거 초점 복원을 제공한다. 좁은 화면에서 이름을 말줄임하고 팝오버가 화면을 넘지 않게 한다.

기존 apiClient의 인증/갱신·request id·안전한 오류 처리를 사용하며 token·원문 응답·개인정보를 로그에 남기지 않는다. 읽기 전용이므로 transaction/idempotency/outbox/새 Provider는 해당 없음이다. Backend 권한 판단을 FE 상태로 대체하지 않는다.
