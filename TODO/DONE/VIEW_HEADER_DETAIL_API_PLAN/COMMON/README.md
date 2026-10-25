# View 헤더 공통 기준

- 정본: [API 계약](API-SPEC/VIEW_HEADER_DETAIL_API.md)
- 기준: [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- 상태: Backend 구현·검증·규칙 검토 완료

## 1. 포함 범위

Object/List 클릭의 대상 ID로 초기 헤더를 조회하는 ③ GET 하나, Object/List 공개 단건 요약 Port, View/Favorite 조회 Port·adapter·UseCase·DTO·Controller·모듈 조립, 관련 검증과 규칙 검토를 수행한다.

처리는 인증·Query 검증 → Workspace 멤버 조회 → 대상 요약 → 초기 View/개인 Favorite → 응답 조합이다. 헤더 응답이 먼저 와야 드롭다운 조회에 사용할 View ID를 얻는다. ①/② HTTP API를 내부 호출하지 않는다.

## 2. 현재 조회 기준

- 대상은 요청 Workspace와 targetType/targetId로 한정한다.
- 초기 View는 같은 Workspace와 대상 FK 안에서 sortOrder/createdAt/id 오름차순 첫 행이다.
- View가 없으면 대상 요약과 View 필드 null, isFavorite=false를 반환한다.
- 별도 기본 View 지정·최근 선택 이력·View 자동 생성은 추가하지 않는다.
- 응답의 Object/List 요약은 클릭 대상이며, View 관계에 XOR CHECK를 추가하지 않는다.
- 읽기에 Actor 존재를 강제하지 않는다. 즐겨찾기는 현재 멤버의 존재 여부만 읽는다.

## 3. 제외·후속 범위

Frontend·본문·목록 API ①/②·즐겨찾기 클릭/쓰기·View 생성/저장·Object/List 생성 시 기본 View 자동 생성·별도 공유 권한·스키마/환경/서버 변경·배포·커밋은 후속 범위다.

[사용 흐름](USER-FLOW.md), [분담](WORK-SPLIT.md), [순서](GOAL-WORK-ORDER.md), [기획 검토](PLANNING-REVIEW.md), [전체 계획](../README.md)을 함께 따른다.
