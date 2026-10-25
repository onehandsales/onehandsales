# 즐겨찾기 클릭과 View 헤더 조회 흐름

- 상태: Backend 계약 확정, Frontend 연결은 후속 범위
- 기준: [API 정본](API-SPEC/VIEW_HEADER_DETAIL_API.md), [기존 사이드바 흐름](../../SIDEBAR_AND_VIEW_USER_FLOW.md), [헤더 UX](../../VIEW_TWO_AREA_TEXT_UX.md)

## 1. 입력과 식별자

기존 사이드바 즐겨찾기 응답은 id(즐겨찾기 ID), viewDefinitionId(View ID), name, icon이다. 새 단건 조회에는 현재 Workspace ID와 viewDefinitionId만 전달한다. 즐겨찾기 ID를 View ID처럼 사용하지 않는다.

## 2. Backend 조회 순서

1. 기존 AuthGuard와 UUID 검증 후 인증 사용자를 확보한다.
2. Workspace 공개 Port로 멤버 ID를 확인한다. 비멤버는 404이며 Actor 없는 읽기를 허용한다.
3. View ID와 Workspace ID로 View를 조회하고 현재 멤버의 즐겨찾기 상태를 계산한다.
4. 연결된 Object/List의 요약을 owning module 공개 Port로 조회해 같은 Workspace인지 검증한다.
5. 승인된 헤더 요약 응답을 반환한다. 상세 조건과 오류는 API 정본을 따른다.

## 3. 응답이 의미하는 헤더 데이터

| 헤더 요소 | 소비할 응답 |
| --- | --- |
| 대상 이름 | objectDefinition.name 또는 listDefinition.name |
| 현재 View 선택 표시 | id, name, icon, type |
| 현재 View 별 상태 | isFavorite |

소속 하나가 있으면 그 요약을 사용할 수 있다. 둘 다 null이거나 둘 다 있는 경우의 제목 우선순위는 Frontend 정책으로 별도 결정한다. 이번 API는 소속 관계를 가공해 임의 우선순위를 만들지 않는다.

## 4. 후속 Frontend 연결 시 경계

- 이번 작업은 실제 클릭·라우트·헤더 렌더링·본문 변경을 구현하지 않는다.
- View 목록 API가 연결되기 전에는 이 단건 응답이 드롭다운 전체 목록을 제공한다고 해석하지 않는다.
- 즐겨찾기에서 읽은 항목이 다른 곳에서 해제돼도 유효한 View는 isFavorite=false로 조회될 수 있다.
- 로딩·실패·Workspace 전환 중 이전 대상 응답이 새 선택을 덮지 않도록 사용자/Workspace/View를 조회 범위로 구분한다.
- Record·Attribute·ListEntry·View 필터/정렬/위젯 데이터는 이번 헤더 요청에 포함하지 않는다.
