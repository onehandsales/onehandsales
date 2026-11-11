# 헤더 필터 아이콘 변경

- 요청: 헤더 필터 버튼의 아이콘을 SlidersHorizontal로 변경한다.
- 변경: 공통 ViewHeaderToolbar에서 Filter 대신 SlidersHorizontal을 사용한다. 공통 버튼의 16×16px 크기, 색상과 hover/active 상태, 필터 메뉴 동작은 유지한다.
- 검증: 변경 컴포넌트 ESLint와 `git diff --check`를 통과했다. 아이콘 import·사용처 변경과 공통 16×16px 클래스를 확인했다. 아이콘 교체만 수행했으며 신규 테스트 작성이나 브라우저 테스트 재실행은 하지 않았다.
