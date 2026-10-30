# Frontend 본문 구현과 조회 연결

## 현재 연결

User Web crm-view feature에 view-data-api, view-data-query-keys, use-view-data, WorkspaceViewContent/ViewDataBody와11개 전용 컴포넌트를 추가했다. Backend 타입을 runtime import하지 않고 FE 소유 계약과 Zod 응답 검증을 둔다.

Object/List 페이지가 기존 AppShell의 viewHeaderModel.currentView.viewDefinitionId를 받아 공통 GET을 호출한다. 헤더에서 버튼으로 View를 선택하면 query key가 달라지고 해당 renderer로 전환된다. 없는 View ID를 임의 생성하지 않는다.

## 컴포넌트

| 타입 | 파일 | 표시 |
| --- | --- | --- |
| TABLE | table-view.tsx | 저장 column 순서/너비, 값 배열, 그룹, 원본 행 |
| KANBAN | kanban-view.tsx | 열별 count/접힘/독립 page와 카드 |
| LIST | list-view.tsx | 제목 중심 행과 표시 속성 |
| GALLERY | gallery-view.tsx | 이미지/본문/카드 크기와 fit |
| CALENDAR | calendar-view.tsx | 달력과 기간·날짜 예외 목록 |
| TIMELINE | timeline-view.tsx | 기간 막대와 미설정/잘못된 기간 목록 |
| GANTT | gantt-view.tsx | 진행률/업무 관계를 포함한 시간 축 |
| CHART | chart-view.tsx | BAR/LINE/PIE/DONUT SVG, 정확한 집계값 표 |
| PIVOT | pivot-view.tsx | sparse 교차 표, 행·열·전체 합계 |
| MAP | map-view.tsx | Leaflet 지도, 핀/정렬 목록, 미위치 목록 |
| DASHBOARD | dashboard-view.tsx | widget ID별 배치, 원본별 독립 조회 상태 |

타입별 컴포넌트는 features/crm-view/components/content 아래에 있다. 큰 지도 dependency는 lazy import한다.

## 상태와 요청

- query key에는 user/Workspace/View/source/part/q/기간/timeZone/bounds/focus/cursor를 포함한다.
- search는250ms debounce, view/source/search 변경 시 화면 query 상태를 새로 시작한다.
- AbortSignal을 기존 apiClient에 전달한다. 이전 View 데이터로 새 View의 빈 화면을 채우지 않는다.
- loading/error/empty/NEEDS_CONFIGURATION을 구분한다. cursor409는 첫 페이지 재시작,422/503/404는 해당 안내로 표시한다.
- 같은 child View를 참조하는 widget은 ID별로 배치하고 query cache는 공유한다. 자식마다 자기 source를 사용한다.
- AppShell의 두 반응형 Outlet은 기존 구조를 유지한다. 같은 main query key는 TanStack 캐시를 공유한다. 테스트는 현재 visible 영역에서 수행한다.
- 새 필터/정렬 저장 API를 호출하지 않는다. 기존264px 보기 설정 패널을 유지하고 임시 편집의 미저장·본문 미반영 상태만 문구로 명시한다.

## 데이터 표시

서버가 반환한 Decimal 문자열은 정확히 표시한다. 그래프 geometry만 Number를 사용하며 표현 범위를 벗어나면 값 표로 확인한다. Date는 시차를 적용하지 않고 Timestamp는 사용자/응답 시간대로 표시한다. 다중값은 valueDefinitionId와 sourceEntity를 함께 key로 사용한다.

지도는 OSM 기본 타일과 attribution을 사용한다. VITE_MAP_TILE_URL/VITE_MAP_ATTRIBUTION으로 교체할 수 있다. 좌표 목록은 타일 장애와 독립이며 서버 transaction 안에서 지오코딩/이미지 다운로드를 하지 않는다. 실제 타일 공급자의 운영 사용은 해당 정책을 따른다.

기존 Object 생성/직접 단일 기본 셀 편집은 재사용하고 성공 후 본문 query도 무효화한다. 관계 경로·다중값·복합 값의 신규 쓰기 UX는 이번 조회 범위에 포함하지 않는다.

## 검증 경계

서버 계산기로 만든 가상 계약 fixture의11타입 응답 검증, 브라우저 데스크톱/모바일 표시, 기존 헤더 회귀를 실행한다. mock 브라우저 성공과 실제 Supabase 읽기 검증, 인증된 운영 브라우저 검증을 분리한다. 현재 실제 운영 배포/쓰기 검증은 하지 않는다.
