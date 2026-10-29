# 공통 View 헤더

이 feature는 관리항목과 업무목록의 헤더·보기 선택·개인 즐겨찾기·메뉴 설정 조회와 화면 임시 편집을 담당한다. AppShell은 공개 index의 useWorkspaceViewHeader와 useViewMenus를 한 번 호출하고 동일 모델을 데스크톱/모바일에 전달한다.

## 책임

- api: 기존 apiClient를 통한 ③ 헤더, ① Object 목록, ② List 목록 조회와 사용자/Workspace/대상/선택 ID별 Query key
- hooks/use-workspace-view-header: 초기 헤더·화면 선택·대상 전환 초기화·초기/전환 후 별표 상태
- hooks/use-workspace-view-favorite: view-favorite 공개 client로 등록/해제, 중복 쓰기 차단, 요청 당시 사용자/Workspace/View의 헤더·개인 목록 갱신
- hooks/use-workspace-views: 드롭다운이 열린 동안만 헤더 응답의 대상 ID로 목록 조회
- api/view-menu-api: 현재 View의 filters/sorts/settings GET, query/body 없음, AbortSignal 전달, 응답 View ID 확인
- hooks/use-view-menus: 메뉴를 열 때 조회, 사용자/Workspace/View/메뉴별 캐시, 닫기·대상 변경 시 요청 취소, 서버 캐시와 분리한 임시 편집
- components/view-filter-sort-menu: AND/OR 그룹 구조, 저장된 비교값·다중값 방식, 정렬 우선순위를 기존 입력 UI로 표현
- components/view-settings-menu: 11개 타입별 역할·그룹·토글·표시 정보·위젯 설정
- components/workspace-view-header: 대상 이름/아이콘, 현재 보기, aria-pressed 별표 버튼·처리 중/접근 불가/오류 안내와 검색/선택 메뉴
- types: 기존 Backend 계약의 순수 Frontend 응답 타입

신규 화면은 feature 내부 구현을 직접 import하지 않고 index를 사용한다. 공통 아이콘은 components/ui의 IconValueGlyph를 재사용한다. 본문·설정/선택 저장·보기 생성·즐겨찾기 행 클릭 이동·순서 변경은 이 feature의 현재 연결 범위가 아니다.

별표는 초기 헤더의 isFavorite를 사용하며 다른 View로 전환하면 shell이 전달한 기존 개인 즐겨찾기 조회 결과를 사용한다. 조회 결과가 없으면 미확인으로 표시하고 쓰기를 막는다. 대상 변경은 최근 선택 이력 저장으로 해석하지 않는다.

등록/해제는 성공 응답 뒤 표시하며 새 사이드바 행의 PK를 임의 생성하지 않는다. 이전 GET을 취소하고 같은 Workspace의 일치하는 View 헤더만 갱신한 뒤 개인 목록/헤더를 invalidate한다. 서버의 다음 성공한 조회는 임시 확인 상태보다 우선한다. UUID 대소문자는 cache factory와 확인 scope에서 통일한다. 실패·지연 응답은 다른 사용자/Workspace/View에 적용하지 않고, 401 refresh는 기존 apiClient를 사용한다.

기존 오른쪽 도구와 Object 본문은 별도 컴포넌트에 남긴다. 목록의 서버 순서를 변경하지 않고 검색만 받은 목록에서 수행한다. 새로운 View 목록/저장 정책을 추가할 때는 API 계약과 Query key·오류/빈 상태·E2E를 함께 검토한다.

## 메뉴 UX와 상태 경계

- 38px 헤더, 보기 설정 264px, 필터·정렬 340px를 유지한다. TABLE은 레이아웃 행과 평평한 표시 정보 체크박스 목록을 사용한다.
- 초기 헤더의 viewId를 정규화한 currentView.viewDefinitionId와 viewType으로 도구를 구성한다. 레이아웃 행은 현재 타입 표시이며 타입 변경 기능이 아니다.
- CALENDAR는 정렬, CHART/PIVOT은 검색·정렬, DASHBOARD는 검색·필터·정렬을 숨긴다. MAP의 정렬 이름은 목록 정렬이다.
- 메뉴는 처음 열 때 해당 GET만 요청한다. 서버 성공 결과는 30초 캐시를 사용하며 실패를 빈 설정으로 바꾸지 않는다.
- 같은 View에서 닫기·재열기·반응형 전환 시 임시 입력을 유지한다. 다른 View·대상·사용자·Workspace로 이동하면 버린다. 서버 캐시를 임시 입력으로 수정하지 않는다.
- 숨긴 속성·단계·위젯은 체크 해제 상태로 남긴다. 같은 속성의 다른 역할·참조 경로 및 같은 원본 View의 여러 위젯은 행 ID로 구분한다.
- 저장값이 없는 항목은 미설정이다. 조회 응답에 임의의 카드 크기·집계 방식·표시 기본값을 채우지 않는다.
- Object의 기존 전체 속성 목록은 직접 속성 후보로 사용한다. 저장 행이 없는 후보는 미선택으로 표시하고 사용자가 체크할 때만 임시 DISPLAY 행을 만든다. 참조 메타데이터를 전체 생성 후보로 취급하지 않는다.
- List는 저장된 참조를 읽고 체크·값·방향을 편집할 수 있다. 전체 후보 조회가 연결되지 않아 새 속성 기반 조건·정렬·역할 추가는 제공하지 않는다.
- 카드 크기·차트 종류·집계 방식·형식·배치는 저장값 표시만 제공한다. 이미지 선택, MAP 핀/목록 개별 속성, GANTT 관계 편집, 위젯 이동/크기 변경은 후속 계약 대상이다.
- 필터의 저장된 연산자를 표시하며 새 조건에는 비교 연산자를 임의 생성하지 않는다. 연산자 전체 선택 규격은 후속이다. 문자열·숫자·불리언·Select/Status 옵션은 값 편집을 지원하며 그 밖의 복합 JSON은 보존하고 미지원 안내를 표시한다.
- 단계 기준을 임시 변경해도 기존 단계 설정은 데이터에 보존한다. 현재 기준과 일치하는 단계만 세부 화면에 표시한다.
- 날짜·칸반·차트 등의 본문, View 설정 저장, 실제 필터·정렬 실행, 원본 데이터 이동·대시보드 편집은 이번 메뉴 연결에 포함하지 않는다. 모든 편집 메뉴에 기존 미리보기 안내를 유지한다.

## 관련 검증

- 단위: `api/view-menu-api.test.ts`, `hooks/use-view-menus.test.tsx`
- 브라우저: `tests/e2e/view-menu-integration.spec.ts`, 기존 `view-header-ux`, `view-header-integration`, `view-favorite-mutation`
- API 응답을 제어하는 브라우저 테스트는 저장된 설정의 소비·UX·요청 경계를 검증한다. 운영 DB/배포 검증과 구분한다.

2026-10-29 로컬 검증 결과:

- `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd build`, `git diff --check` 통과.
- 전체 단위 테스트 15 files / 67 tests 통과.
- 메뉴·기존 헤더·즐겨찾기 Chromium 39개 통과.
- 역할 숨김 편집의 가역성과 이벤트 함수 분리 보완 후, 영향받는 메뉴·기존 팝업 17개 재검증 통과. 추가한 예약 이름 설정값 사례를 포함한다.
- 최종 수정 파일 lint와 최종 build(tsc 포함) 통과. TABLE/KANBAN 팝업 캡처를 확인했다.
