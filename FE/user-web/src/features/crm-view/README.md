# 공통 View 헤더

이 feature는 관리항목과 업무목록의 헤더·보기 선택을 담당한다. AppShell은 공개 index의 useWorkspaceViewHeader를 한 번 호출하고 동일 모델을 데스크톱/모바일 WorkspaceViewHeader에 전달한다.

## 책임

- api: 기존 apiClient를 통한 ③ 헤더, ① Object 목록, ② List 목록 조회와 사용자/Workspace/대상/선택 ID별 Query key
- hooks/use-workspace-view-header: 초기 헤더·화면 선택·대상 전환 초기화·초기/전환 후 별표 상태
- hooks/use-workspace-views: 드롭다운이 열린 동안만 헤더 응답의 대상 ID로 목록 조회
- components/workspace-view-header: 대상 이름/아이콘, 현재 보기, 읽기 전용 별표와 접근 가능한 검색/선택 메뉴
- types: 기존 Backend 계약의 순수 Frontend 응답 타입

신규 화면은 feature 내부 구현을 직접 import하지 않고 index를 사용한다. 공통 아이콘은 components/ui의 IconValueGlyph를 재사용한다. 본문·설정/선택 저장·보기 생성·즐겨찾기 쓰기는 이 feature의 현재 연결 범위가 아니다.

별표는 초기 헤더의 isFavorite를 사용하며 다른 View로 전환하면 shell이 전달한 기존 개인 즐겨찾기 조회 결과를 사용한다. 조회 결과가 없으면 미확인으로 표시한다. 대상 변경은 최근 선택 이력 저장으로 해석하지 않는다.

기존 오른쪽 도구와 Object 본문은 별도 컴포넌트에 남긴다. 목록의 서버 순서를 변경하지 않고 검색만 받은 목록에서 수행한다. 새로운 View 목록/저장 정책을 추가할 때는 API 계약과 Query key·오류/빈 상태·E2E를 함께 검토한다.
