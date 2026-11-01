# 현재 범위와 후속 작업

2026-11-01 추가 승인: 기존 관리항목 표 UX를 유지하는 TABLE·KANBAN·LIST의 User Web 본문 연결을 구현한다. 관리항목/업무목록 route, 검색·페이지·칸반 열 조회, 오류 복구, 기존 직접 Record 값 수정/빈 Record 생성 재사용이 포함된다. 아래 FE 후속 목록은 최초 Backend 작업 시점의 이력이며 현재 프론트 연결은 crm-view README를 따른다. View 생성/설정 저장, ListEntry 값 쓰기와 카드 이동, 상세, 미저장 조건 실행, 나머지8타입은 계속 후속이다.

2026-11-01 사용자 요청 반영. 이번 범위는 GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data 하나와 TABLE·KANBAN·LIST의 Backend 구현·검증이다. 과거 11타입 전체 구현 요구는 이번 작업에 적용하지 않는다.

## 포함

- 저장된 View 표시·필터·정렬·그룹 실행, Object Record/List Entry 값 읽기.
- 인증/Workspace 격리, 참조 경로와 다중값 보존, 옵션·Actor·Record 이름 복원.
- 전역 필터/정렬 후 행 페이지, 칸반 열별 GROUP_ITEMS 추가 조회.
- 지원하지 않는 저장 규칙의 NEEDS_CONFIGURATION, 손상 설정/한도/timeout 오류.
- 소유 모듈 공개 query Port와 읽기 snapshot, 계약·테스트·검증 기록.

## 후속

FE 본문, 속성 후보, View 생성/설정 저장, 업무값 생성/수정, 카드 이동, 미저장 설정 실행, 나머지 8타입. 기존 schema/enum/업무 데이터/환경/의존성을 변경하지 않는다. 커밋하지 않는다.

기존 날짜 표시 선택·11타입 집계 정책은 후속 타입 착수 시 다시 적용한다. 현재 필터에는 Date/Timestamp 비교를 지원하지만 일정 화면은 구현하지 않는다. 현재 계약 정본은 [API 명세](API-SPEC/VIEW_MAIN_CONTENT_API.md)다.
