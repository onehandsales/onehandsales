# Frontend 소비 계약

- 소비 구현 상태: implemented (코드 작성 전 confirmed)
- 정본: [구현된 POST/DELETE 계약](../../../VIEW_FAVORITE_MUTATION_API_PLAN/COMMON/API-SPEC/VIEW_FAVORITE_MUTATION_API.md). HTTP method/path·request/response·오류·트랜잭션·DB·로그 계약은 이 문서를 그대로 사용하며 새 Backend API를 만들지 않았다.
- 기준: [TODO Software 정본](../../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

현재 Header의 workspaceId와 현재 선택 viewId로 기존 apiClient를 호출한다. body/query 없이 인증을 재사용한다. 신규 201/기존 200 모두 true, 삭제 200 false를 반영한다. userId는 클라이언트 캐시 격리에만 쓰고 요청 입력으로 보내지 않는다. Backend PK·Actor·sortOrder를 프론트에서 만들지 않는다.

UUID 대소문자는 동일 식별자로 취급한다. 캐시 factory와 응답 적용 scope는 소문자 표기로 통일해 경로 ID와 서버 canonical ID가 다른 표기여도 같은 개인 목록을 갱신한다. 이름·문구는 변환하지 않는다.

1. 현재 상태 false면 추가, true면 해제를 호출한다. null/빈 View에서는 호출하지 않는다. 서버 결과를 받을 때까지 기존 별표 상태를 유지하고 쓰기 중복을 차단한다.
2. 시작 시 요청 당시 사용자·Workspace의 진행 중 헤더·즐겨찾기 조회를 취소해 이전 GET의 덮어쓰기를 막는다.
3. 성공 시 일치하는 초기 View 헤더 cache를 갱신한다. 초기 View가 아닌 현재 선택에도 응답의 별표 상태를 즉시 표시한다. 새 사이드바 행의 PK를 임의 생성하지 않고 GET 재조회로 얻는다.
4. 성공·실패 후 요청 당시 헤더와 개인 즐겨찾기를 invalidate한다. 404는 보기 목록도 새로고침한다. 조회 실패는 기존 Query error/재시도 정책을 사용하고 쓰기 성공을 쓰기 실패로 바꾸지 않는다.
5. 서버의 최신 조회가 성공하면 그 상태를 사용한다. 늦은 응답·오류는 다른 사용자/Workspace/View 표시를 바꾸지 않는다. 성공 응답에 맞춘 임시 확인 상태는 scope와 조회 갱신 시각으로 제한한다.
6. 401은 기존 refresh/auth 흐름을 재사용한다. 403/404는 접근 불가 안내와 보기 재선택, 나머지 오류는 현재 상태를 확인한 후 재시도하도록 안내한다. raw 서버 오류/토큰을 화면·로그에 출력하지 않는다. 자동 mutation 재시도는 하지 않는다.

버튼은 aria-pressed·처리 중/disabled·키보드 조작·focus를 제공한다. 빈 View/미확인 상태의 안내와 기존 헤더/드롭다운을 유지한다. 사이드바는 기존 공통 행의 서버 순서와 로딩·빈 상태를 유지한다. 한/영 리소스로 사용자 문구를 제공한다.
