# 관리 항목·업무 목록 클릭과 헤더 조회 흐름

기준: [API 정본](API-SPEC/VIEW_HEADER_DETAIL_API.md), [사이드바 흐름](../../../SIDEBAR_AND_VIEW_USER_FLOW.md), [헤더 UX](../../../VIEW_TWO_AREA_TEXT_UX.md).

## 1. 첫 진입

사이드바 회사 클릭은 workspaceId와 OBJECT/회사 Object ID로 ③을 호출한다. 영업 파이프라인 클릭은 LIST/List ID로 같은 ③을 호출한다. 요청에 사전 View ID는 필요하지 않다.

③ 응답의 대상 요약으로 왼쪽 이름·아이콘을, View 정보로 현재 보기 표시를, isFavorite로 별표 상태를 구성한다. View가 없으면 대상 요약은 유지하고 보기 없는 상태를 표시한다.

## 2. 이후 드롭다운

현재 보기 드롭다운을 열 때만 후속 ① Object View 목록 또는 ② List View 목록 API를 호출한다. 사용할 View/대상 ID는 먼저 받은 ③ 응답에서 얻는다. 이번 구현에는 목록 API·Frontend 클릭 연결을 포함하지 않는다.

## 3. Backend 내부 순서

인증·DTO 검증 → 현재 Workspace 멤버 ID 확인 → 해당 소유 모듈의 대상 요약 → View 모듈의 초기 View/개인 Favorite → 응답 조합.

즐겨찾기 클릭·등록·해제, 데이터 저장, View 자동 생성과 본문 조회는 이번 흐름에 포함하지 않는다. 늦은 응답이 다른 대상의 헤더를 덮지 않도록 후속 FE는 사용자/Workspace/대상 종류/대상 ID별로 조회를 구분한다.
