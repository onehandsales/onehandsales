# 공통 View 헤더·본문

이 feature는 관리항목과 업무목록의 헤더·보기 선택·개인 즐겨찾기·메뉴 설정 조회와 TABLE/KANBAN/LIST 본문을 담당한다. AppShell은 공개 index의 useWorkspaceViewHeader와 useViewMenus를 한 번 호출하고 동일 모델과 검색 입력을 데스크톱/모바일에 전달한다.

2026-11-01 사용자가 승인한 텍스트 UX에 따라 두 route를 `pages/workspace-view`의 공통 본문에 연결했다. 정본은 `TODO/VIEW_MAIN_CONTENT_QUERY_PLAN/COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md`다. 기존 Object 전용 페이지는 보존하며 활성 route에서는 사용하지 않는다.

같은 날 Backend 선행 구현·검토 후 즐겨찾기 View ID 진입도 같은 페이지에 연결했다. `/app/workspaces/:workspaceId/view-definitions/:viewDefinitionId`의 새 단건 헤더 GET으로 소속과 정확한 View를 확인하고 기존 본문/메뉴 API를 사용한다. 기존 대상 기준 기본 헤더를 중복 호출하지 않으며 View 선택을 URL에 보존한다. [계약과 검토](../../../../../TODO/VIEW_HEADER_BY_VIEW_ID_API_PLAN/README.md)를 따른다.

## 본문 조회와 조작

속성 생성 팝오버는 `유형 선택` 제목 옆 돋보기를 누르면 그 오른쪽 같은 줄에 검색창을 펼친다. 검색창은 기본 숨김이며, 펼치면 검색 입력에 포커스가 이동한다. placeholder는 `찾는 유형을 검색하세요.`이고 검색 버튼·접근성 이름은 `유형 검색`이다. 다시 누르면 검색어를 초기화하고 검색창을 닫는다.

상단 대상 제목·현재 보기 이름·도구 버튼 텍스트는 왼쪽 사이드바 기본 항목과 같은 앱 공통 font-sans, 14px, font-medium(500)을 사용한다. 대상 제목은 #4B5563, 보기 선택·즐겨찾기·검색·필터·정렬·보기 설정 버튼의 기본 텍스트/아이콘은 #9CA3AF다. 기존 hover 배경·글자색은 유지하며 활성 도구는 배경과 아이콘, 등록된 즐겨찾기는 붉은 하트로 구분하고 비활성 도구는 opacity로 표시한다. 38px 헤더 높이와 반응형 도구 표시를 유지한다.

상단 제목 앞 대상 아이콘은 desktop/mobile 모두 20×20px, 헤더의 나머지 아이콘(현재 보기·화살표·즐겨찾기·도구·사이드바 열기)은 16×16px이며 가로 공간이 좁아져도 축소하지 않는다.

- `api/view-data-api`: 현재 헤더의 View ID와 명시적 OBJECT/LIST source로 같은 `/data` GET을 사용한다. MAIN과 GROUP_ITEMS를 구분하고 응답 View/type/source/part와 그룹 token을 확인한다. 기존 인증 client·AbortSignal을 사용한다.
- `hooks/use-view-main-data`: 사용자/Workspace/원본 종류·대상/보기/타입/시간대/검색/limit별 infinite query다. 검색은 250ms debounce, 일반 행은 서버 cursor, 칸반은 열별 cursor를 사용한다. 다른 보기의 결과를 placeholder로 남기지 않는다.
- `components/view-data-table`: 기존 관리항목의 36px 고정 열 헤더·40px 행·셀/구분선·체크박스·가로세로 스크롤과 셀 편집 컴포넌트를 재사용한다. 열 순서/너비/표시명/숨김은 현재 화면 미리보기이며 View 저장이나 원본 AttributeDefinition의 순서 변경 API를 호출하지 않는다.
- Object TABLE의 `+`는 같은 추가 영역에서 `components/inline-attribute-column`의 220px 이름 입력으로 전환하고 `attribute-type-popover`를 함께 연다. 작성 중 별도의 +나 본문 임시 셀을 추가하지 않으며 저장 후 새 컬럼 다음에 +를 표시한다. 안내 문구는 `컬럼명을 작성해주세요.`이며 아이콘과 이름만 헤더에 둔다. 팝오버는 Portal로 표 스크롤 밖에 표시하고 17종을 검색 가능한 2열 목록으로 제공한다. 이름 입력 후 유형 선택, 또는 유형 선택 후 이름 입력·Enter/바깥 클릭으로 저장한다. 팝오버 내부 이동은 저장하지 않는다. 바깥 클릭 시 빈 이름·공백뿐인 이름은 취소하고 +로 복원하며, 이름이 있고 유형이 없는 초안은 유지한다. 바깥 클릭은 클릭 대상의 포커스를 유지한다. Esc는 취소 후 + 포커스 복귀, 실패는 팝오버에서 명시적으로 재시도한다. 기존 숨김 미리보기는 `초기화`로 복원한다. List TABLE의 기존 표시 메뉴는 유지한다.
- `api/view-column-api`는 View 소유 POST 계약을 사용한다. 같은 입력의 실패 재시도에는 같은 creationId를 보내고 저장 성공 후에는 해당 scope의 속성·메뉴·본문 캐시를 갱신한다. 조회 실패 복구는 재생성을 요청하지 않는다. [API 계약과 검토](../../../../../TODO/TABLE_ATTRIBUTE_CREATE_PLAN/README.md)를 따른다.
- `components/view-data-list`, `view-data-kanban`: 저장된 표시 속성·그룹과 열별 건수·접힘·숨김을 반영한다. 접힌 칸반 열은 펼칠 때 GROUP_ITEMS를 조회하고 숨긴 열은 표시하지 않는다. 합계와 카드 이동을 임의로 추가하지 않는다.
- `components/view-data-cell`: 다중값을 배열로 유지하고 itemKey와 occurrenceKey를 구분한다. 직접 RECORD 값의 기존 편집·PATCH를 재사용한다. 참조 경로 말단·LIST_ENTRY 값은 읽기 전용이며 다른 소유자의 ID를 Record ID로 전용하지 않는다.
- Decimal은 문자열·BigInt로 표시 배율/반올림을 적용한다. 날짜 전용 값은 UTC 날짜를 유지하고 Timestamp는 사용자 시간대로 표시한다. 참조는 라벨만 표시한다.
- 숫자·금액·비율의 저장된 `format.useGrouping` boolean을 반영한다. false는 자리 구분자를 숨기며 생략 시 기존 locale 표시를 유지한다. 2026-11-01 실제 저장 설정 호환성을 보완했고, 전체 단위 테스트 17 files / 83 tests와 lint·build(tsc 포함)를 통과했다.
- Object의 빈 Record 추가는 기존 POST를 사용하고 저장 조건으로 본문을 다시 조회한다. List 기록 추가·Entry 값 변경·View 생성/저장·상세·카드 이동은 후속이다. List의 기록 추가 버튼은 준비 중 상태다.
- 409/이어 읽기의 token 오류는 MAIN부터 복구한다. 다음 페이지 실패는 이미 받은 행/카드와 구분한다. 빈 결과, View 없음, 미지원8타입, NEEDS_CONFIGURATION, 접근 불가와 서버 실패를 각각 표시한다.
- Object 속성 전체 목록은 메뉴를 열 때 후보용으로만 읽는다. 본문은 기존 Object Record 목록 GET 대신 View GET의 bindings와 값을 사용한다. 저장 설정 메뉴의 임시 변경은 본문 override로 전송하지 않는다.

## 책임

- api: 기존 apiClient를 통한 대상 기준/특정 View 기준 헤더, Object/List 보기 목록 조회와 사용자/Workspace/대상/선택 ID별 Query key
- hooks/use-workspace-view-header: 초기 헤더·화면 선택·대상 전환 초기화·초기/전환 후 별표 상태
- hooks/use-workspace-view-favorite: view-favorite 공개 client로 등록/해제, 중복 쓰기 차단, 요청 당시 사용자/Workspace/View의 헤더·개인 목록 갱신
- hooks/use-workspace-views: 드롭다운이 열린 동안만 헤더 응답의 대상 ID로 목록 조회
- api/view-menu-api: 현재 View의 filters/sorts/settings GET, query/body 없음, AbortSignal 전달, 응답 View ID 확인
- hooks/use-view-menus: 메뉴를 열 때 조회, 사용자/Workspace/View/메뉴별 캐시, 닫기·대상 변경 시 요청 취소, 서버 캐시와 분리한 임시 편집
- components/view-filter-sort-menu: AND/OR 그룹 구조, 저장된 비교값·다중값 방식, 정렬 우선순위를 기존 입력 UI로 표현
- components/view-settings-menu: 11개 타입별 역할·그룹·토글·표시 정보·위젯 설정
- components/workspace-view-header: 대상 이름/아이콘, 현재 보기, aria-pressed 별표 버튼·처리 중/접근 불가/오류 안내와 검색/선택 메뉴
- types: 기존 Backend 계약의 순수 Frontend 응답 타입

신규 화면은 feature 내부 구현을 직접 import하지 않고 index를 사용한다. 공통 아이콘은 components/ui의 IconValueGlyph를 재사용한다. 설정/최근 선택 DB 저장·보기 생성·순서 저장은 후속 범위다.

별표는 초기 헤더의 isFavorite를 사용하며 다른 View로 전환하면 shell이 전달한 기존 개인 즐겨찾기 조회 결과를 사용한다. 조회 결과가 없으면 미확인으로 표시하고 쓰기를 막는다. 대상 변경은 최근 선택 이력 저장으로 해석하지 않는다.

등록/해제는 성공 응답 뒤 표시하며 새 사이드바 행의 PK를 임의 생성하지 않는다. 이전 GET을 취소하고 같은 Workspace의 일치하는 View 헤더만 갱신한 뒤 개인 목록/헤더를 invalidate한다. 서버의 다음 성공한 조회는 임시 확인 상태보다 우선한다. UUID 대소문자는 cache factory와 확인 scope에서 통일한다. 실패·지연 응답은 다른 사용자/Workspace/View에 적용하지 않고, 401 refresh는 기존 apiClient를 사용한다.

공통 헤더 도구를 유지하고 본문 검색은 서버 q로 실행한다. 보기 드롭다운의 이름 검색은 받은 View 목록에서 수행한다. 새로운 View 목록/저장 정책을 추가할 때는 API 계약과 Query key·오류/빈 상태·E2E를 함께 검토한다.

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
- TABLE/KANBAN/LIST 본문은 저장된 필터·정렬을 실행한다. 메뉴의 임시 필터·정렬 실행과 View 설정 저장, 나머지8타입, 원본 이동·대시보드 편집은 후속이다. 모든 설정 편집 메뉴에 기존 미리보기 안내를 유지한다.

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

2026-11-01 본문 연결 검증 결과:

- `pnpm typecheck`, `pnpm lint`, `pnpm build`, `git diff --check` 통과. 빌드는 기존 청크 크기 안내를 출력한다.
- 전체 단위 테스트 17 files / 81 tests 통과. source/응답 검증, 취소 전달, query key 분리, Decimal 정밀도·날짜·참조 표시를 포함한다.
- 본문·기존 헤더·메뉴·즐겨찾기 Chromium 회귀 52개 통과. 사이드바 전환, 세 타입, 검색, 행/열별 페이지, 접힌 열, 오류 복구, 직접 Record 수정·추가, 열 순서·너비·숨김, 모바일 가로 스크롤을 확인했다.
- 저장 완료가 늦게 도착해도 새 대상의 조회를 취소하지 않도록 보완한 뒤, 해당 추가 사례와 기존 수정·추가 흐름 3개를 재검증해 통과했다. 서로 다른 브라우저 사례는 총 53개다.
- TABLE/KANBAN/LIST 데스크톱 및 390px 모바일 화면을 캡처해 확인했다. 브라우저 검증은 제어된 API 응답을 사용하며 실제 사용자 인증·운영 DB 통합 검증을 대신하지 않는다.
- 기존 ENV 파일 해시와 백엔드·사용자/관리자 로컬 서버의 응답을 확인했다. ENV·Backend 코드·DB 스키마는 변경하지 않았다.
