# 사이드바 즐겨찾기 Frontend 작업

[Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), Front Agent와 [공통 API 계약](../COMMON/API-SPEC/SIDEBAR_VIEW_FAVORITE_API.md)을 따랐다. 구현과 아래 검증을 완료했다.

view-favorite feature에 타입·API client·Query factory·Hook·index를 둔다. AppShell의 현재 사용자/Workspace로 조회하고 SidebarNav가 id/name/icon을 공통 형식으로 변환해 기존 SidebarDataSection을 사용한다. View ID는 응답 데이터에 보존한다.

세 영역의 별도 UI를 복제하지 않으며 로딩·빈 목록·실패도 같은 컴포넌트에 맡긴다. View 상세·등록·해제·순서 변경과 헤더의 로컬 별표 동기화는 추가하지 않는다.

E2E Mock에 /view-favorites 분기를 일반 Workspace 조회보다 먼저 추가하고 정상/로딩/빈 배열/실패/Workspace 전환, 기존 업무 목록과 헤더를 검증한다. User Web typecheck/lint/test/build 결과를 기록한다.

User Web typecheck·lint·build와 단위 테스트 10개 파일·33개가 통과했다. 기존 build의 500kB chunk 경고는 유지된다. Playwright에서 즐겨찾기 4개·기존 업무 목록 4개가 통과했고, 헤더 1개는 소스 모듈 요청 오인지를 수정한 뒤 재실행해 통과했다. 헤더 검사는 실제 /api/ 경로에서 사이드바 즐겨찾기 GET만 허용하며 View 쓰기 요청이 없는지 계속 확인한다.
