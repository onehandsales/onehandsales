# 현재 구현 범위와 후속 저장 작업

## 현재 사용자 요청

/goal 없이 Backend + User Web을 함께 구현·연결·검토·검증한다. 이전 Backend-only 요청보다 최신 통합 요청이 우선한다. 타입은 TABLE/KANBAN/LIST/GALLERY/CALENDAR/TIMELINE/GANTT/CHART/PIVOT/MAP/DASHBOARD 전체다.

현재 구현은 공통 GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data 하나와 타입별 내부 조회기, 프론트 api/query/11개 renderer, Object/List 선택 View 연결이다. 기존 헤더 패널의 크기·버튼·체크박스 UX는 유지한다.

저장된 View 설정만 실행한다. List 조회·집계는 Entry 기준이다. 종료일이 없으면 Calendar는 시작일 하루, Timeline/Gantt는 기간 미설정 목록이다. 날짜 종료일 포함 여부는 질문했으며 답변 전 임의 확정하지 않는다.

## 이번에 하지 않는 작업

- 필터·정렬·보기 설정 저장 API, 신규 원본 변경 API.
- View 생성/변경, 위젯 후보 조회·구성 저장, 카드/기간/위젯 drag 저장.
- Admin Web, Supabase schema/migration/seed 또는 실제 업무 데이터 수정.
- 커밋·push·배포.

기존 Object의 생성 API와 직접 단일 원본 셀 편집 기능은 가능한 범위에서 재사용하고 성공 시 본문 캐시도 무효화한다. 새 조회 renderer에서 관계 경로·다중값·복합 값의 쓰기를 새로 구현하지 않는다.

## 후속 자동 저장 흐름

사용자는 필터/정렬 변경 시 DB 저장 후 바로 본문에 반영되기를 선택했다. 후속 단계에서 저장 계약(method/path/DTO/원자성/동시 수정)을 먼저 정한 뒤, 저장 성공 → 본문 GET cache invalidation을 연결한다.

현재 메뉴 편집은 로컬 임시 편집이다. 문구로 저장·본문 반영 미지원 상태를 안내하며, GET에 override/body를 전달하거나 미저장 조건을 적용 완료로 표시하지 않는다.

현재 실행 계약은 [API 명세](API-SPEC/VIEW_MAIN_CONTENT_API.md), 실제 검증/남은 정책은 [검토 기록](IMPLEMENTATION_REVIEW.md)을 참조한다.
