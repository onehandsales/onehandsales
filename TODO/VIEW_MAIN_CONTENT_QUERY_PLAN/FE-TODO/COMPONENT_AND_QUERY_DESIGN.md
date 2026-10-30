# 프론트 컴포넌트·상태·조회 연결 설계

상태: **설계 초안 / FE 코드 변경 전**. [Front 규칙](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [User Web 구조](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md), [CRM 구조](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md), [API 계약](../COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)을 기준으로 한다. User Web 대상이며 Admin Web 변경은 없다.

사용자 범위 지정에 따라 **현재는 Backend 주 화면 GET만 구현 대상**이다. 이 문서는 후속 FE 연결 설계로 보존하며, 이번 BE 완료 기준에 FE 구현·자동 저장·지도 공급자 선정을 넣지 않는다. [현재 범위와 후속 저장 작업](../COMMON/SCOPE_AND_DEFERRED_WORK.md)을 우선한다.

## 1. 현재 코드와 연결 지점

| 현재 파일 | 확인한 역할 | 후속 구현에서 변경할 범위 |
| --- | --- | --- |
| [app-shell.tsx](../../../FE/user-web/src/components/layout/app-shell.tsx) | useWorkspaceViewHeader/useViewMenus를 한 번 호출, desktop/mobile에 같은 모델 전달 | 선택한 View 정보를 기존 Outlet context로 계속 전달. 페이지마다 헤더 query 중복 생성 금지 |
| [crm-view 공개 index](../../../FE/user-web/src/features/crm-view/index.ts) | 헤더·메뉴 feature 공개 진입점 | 본문 container·공개 타입/hook을 필요한 범위만 export |
| [Object 페이지](../../../FE/user-web/src/pages/workspace-object-list/index.tsx) | Object Record 원본 표, 로컬 검색·셀 편집·속성 메뉴 | 선택 View의 본문 container 연결. 기존 생성/수정/상세 흐름을 분리해 재사용 여부 검토 |
| [List 페이지](../../../FE/user-web/src/pages/workspace-list/index.tsx) | 헤더 도구, 본문 비어 있음 | 같은 container를 List source로 연결 |
| [query keys](../../../FE/user-web/src/features/crm-view/api/workspace-view-query-keys.ts) | 사용자·Workspace·View별 캐시 구분 | data/part/검색/기간/범위가 포함된 key 추가 |
| [view menu hook](../../../FE/user-web/src/features/crm-view/hooks/use-view-menus.ts) | 메뉴 GET·로컬 draft·선택 전환 시 정리 | 현재 GET에는 저장 조건만 적용. P09 자동 저장→재조회는 후속 연결 |
| [공통 UI](../../../FE/user-web/src/components/ui/README.md) | 프로젝트 공통 버튼·상태·팝오버 등 | 기존 요소 재사용, 도메인 query를 공통 UI에 넣지 않음 |

Object 페이지의 `getRecordAttributeValueMap`처럼 Attribute ID당 마지막 값 하나를 남기는 변환은 새 본문에 재사용하지 않는다. Cell.values[]와 binding ID를 기준으로 그린다. 현재 열 순서 변경의 AttributeDefinition 이동 API는 ViewAttributeSetting 순서 저장과 다르므로 새 View 설정에 연결하지 않는다.

## 2. 제안 폴더와 11개 컴포넌트

아래는 **추가 예정 구조**이며 현재 존재하는 파일로 오해하지 않는다. feature 내부에서 상대 import, feature 외부에서는 공개 index를 사용한다.

```text
features/crm-view/
  api/
    view-main-content-api.ts           # 공통 endpoint 호출, query 직렬화, 응답 검증
    workspace-view-query-keys.ts       # 기존 파일 확장
  types/
    view-main-content.ts              # 공통/타입/part별 discriminated union
  hooks/
    use-view-main-content.ts          # 공통 query 상태와 실행
    use-view-items-page.ts            # 행/기간형 cursor
    use-kanban-group-items.ts         # 열별 cursor
    use-map-items.ts                  # marker/list/미위치/선택 query
    use-dashboard-contents.ts         # 위젯 원본 query 구성
  components/main-content/
    workspace-view-content.tsx        # 선택 View, 로딩/오류/조회 상태
    view-content-renderer.tsx         # 11타입 exhaustive 분기
    table-view.tsx
    kanban-view.tsx
    list-view.tsx
    gallery-view.tsx
    calendar-view.tsx
    timeline-view.tsx
    gantt-view.tsx
    chart-view.tsx
    pivot-view.tsx
    map-view.tsx
    dashboard-view.tsx
    shared/
      view-value.tsx                 # Cell 배열·옵션·연결 라벨·포맷
      view-state.tsx                 # 공통 로딩/빈 결과/설정 부족
      view-date-range-toolbar.tsx    # 기간 이동, 달력/시간축 공용
      view-item-card.tsx             # 제목·선택 표시값
  index.ts
```

hooks의 분할은 query 책임이 있는 경우에만 한다. 파일 수를 맞추기 위한 wrapper는 만들지 않는다. 초기 root와 Dashboard child는 같은 renderer를 사용하되 위젯 모드는 글로벌 헤더를 렌더링하지 않는다. React hooks는 타입 switch의 조건문 안에서 호출하지 않고 타입별 container 경계에서 고정 순서로 호출한다.

| 컴포넌트 | 맡는 표현 | 맡지 않는 계산 |
| --- | --- | --- |
| TABLE → TableView | 열·행·너비·그룹 표시 | Record 전체 필터·전역 정렬 |
| KANBAN → KanbanView | 단계·카드·열별 더 보기·접힘 | 단계 전체 개수·합계 재집계 |
| LIST → ListView | 제목·보조 정보·그룹 | Record/Entry 값 소유자 추측 |
| GALLERY → GalleryView | 카드 크기·미리보기·이미지 실패 fallback | 원격 이미지 BE 다운로드 |
| CALENDAR → CalendarView | 일정 배치·기간 이동·누락 목록 | UTC를 통한 Date 날짜 변경 |
| TIMELINE → TimelineView | 항목 행·기간 막대·그룹 | 원본 기간을 화면 범위로 수정 |
| GANTT → GanttView | 진행률·막대·조건을 만족하는 연결선 | 의존관계로 일정 자동 이동 |
| CHART → ChartView | 축·범례·툴팁·접근 가능한 집계 표 | 현재 page만으로 금액 합산 |
| PIVOT → PivotView | 행/열·가상 스크롤·셀/합계 포맷 | 평균 셀 평균으로 전체 평균 계산 |
| MAP → MapView | 지도/목록 선택·카메라·표시 클러스터 | 주소에서 좌표 추측·0,0 대체 |
| DASHBOARD → DashboardView | 위젯 배치·독립 상태·반응형 | 모든 위젯의 source/필터 통일 |

## 3. 호출 흐름과 캐시

1. Header model의 현재 viewDefinitionId가 있고 Workspace/target이 유효할 때만 enabled=true로 조회한다. 헤더가 없으면 임의 첫 View를 FE에서 새로 만들지 않는다.
2. Object/List route의 targetType을 sourceType으로 전달한다. 동일 View가 양쪽 소속일 가능성도 cache key에서 구분한다.
3. API 함수는 기존 apiClient와 AbortSignal을 사용한다. path UUID는 정규화하고 query 문자열은 URLSearchParams로 인코딩한다.
4. 공통 query key는 아래 차원을 포함한다. cursor는 infinite query의 pageParam에, 그룹·부분·기간·검색은 query key에 둔다.
5. 응답 viewDefinitionId/source/part/type을 검증하고 현재 선택과 다른 지연 응답을 새 화면 상태에 대입하지 않는다. 서버의 type과 헤더가 달라지면 헤더를 한 번 갱신하고 unsupported/무한 재시도 상태를 방지한다.
6. View/사용자/Workspace 변경 시 이전 pending 요청을 취소하고 선택·확장·로컬 검색/기간 상태를 해당 View 정책에 맞춰 초기화한다. 다른 타입의 이전 데이터를 새 제목 아래 placeholder로 남기지 않는다.

```text
["crm-view", userId, workspaceId, "data", viewDefinitionId,
 sourceType, part, groupToken?, normalizedQ?, rangeStart?, rangeEnd?,
 timeZone?, bounds?, focusItemKey?, limit?]
```

설정 fingerprint는 첫 응답을 받아야 알 수 있다. 최초 query key에 가짜 fingerprint를 만들지 않는다. 현재 configurationFingerprint를 결과에서 보관하고 다른 fingerprint가 섞이면 쌓인 page를 폐기한다. 후속 저장 API가 성공하면 해당 View의 본문 캐시/page를 초기화하고 같은 GET으로 새 설정 결과를 읽는다. 현재 GET에는 임시 override/digest를 추가하지 않는다.

일반 행 page와 GROUP_ITEMS/MAP_ITEMS/MAP_MARKERS는 별도 key다. 부분 응답을 MAIN으로 덮어쓰지 않는다. 일반 그룹 행은 occurrenceKey, 칸반은 그룹별 itemKey, 지도는 itemKey/marker key로 병합한다. 여러 그룹에 나타난 같은 itemKey를 모두 하나로 줄이지 않는다. 데이터 변경으로 같은 표시 위치가 다음 page에 재등장하면 중복 표시를 막는다. 이는 페이지 간 snapshot을 보장하는 기능은 아니며 새로고침으로 현재 집합을 다시 읽는다.

staleTime·retry 숫자는 데이터 규모/기존 규칙에 맞춰 구현 때 확정한다. 400/401/404/409/422를 일반 네트워크 장애처럼 반복 재시도하지 않는다. 409는 이전 page 정리 후 첫 query 한 번부터, 503은 제한된 재시도/수동 재시도를 제공한다. 로그아웃·사용자 전환의 기존 캐시 정리도 유지한다.

## 4. 검색·메뉴·기간·지도

- **검색:** 지원 타입에서 서버 q 사용. 입력 debounce와 요청 취소를 적용한다. 현재 Object 표의 ‘받아온 25행만 검색’ 결과를 전체 View 검색으로 표시하지 않는다. 입력 중 상태와 적용된 검색어를 구분한다.
- **필터·정렬:** 기존 메뉴 GET은 편집 UI metadata, 새 data GET은 저장 설정 실행이다. 사용자 선택 P09는 후속 자동 저장→성공 후 본문 재조회다. 현재 BE 작업에서 메뉴 draft를 query로 전달하거나 FE 편집을 임의 변경하지 않는다. 후속 FE 연결은 저장 중/실패/적용 상태와 연속 요청 순서를 명시한다.
- **보기 설정:** 후속 FE 연결에서도 현재 패널의 레이아웃·표시 속성 체크 UI를 유지한다. 현재 GET은 저장 binding/그룹/표시 옵션을 읽는다. 보기 설정 저장도 별도 후속 계약이며, 숨겨서 응답에서 빠진 값을 화면에서 체크만 켜서 만들어낼 수 없다.
- **기간:** Calendar/Timeline/Gantt 본문 도구가 rangeStart/rangeEnd/timeZone을 갱신한다. 새 범위는 새 query이고 이전 range page를 섞지 않는다. 날짜 미설정/잘못된 날짜 패널은 각각 별도 part로 읽는다.
- **지도:** 초기 MAIN은 전체 fit bounds와 두 첫 page. 카메라 이동은 안정화 후 bounds query, 목록 정렬은 서버 목록 순서를 사용한다. 핀 선택이 새 카메라 조회를 무한 발생시키지 않게 사용자 이동과 프로그램 이동을 구분한다.
- **지도 선택:** 선택 itemKey가 반대 page에 없으면 focus query. 새 filter에서 불일치/접근 불가가 되면 선택을 해제한다. 미위치 항목은 지도상 가짜 핀을 만들지 않는다.

## 5. 값·그룹·페이지 표현

- 레코드 셀은 Cell.state와 values[]로 렌더링한다. `EMPTY`, `INVALID`, `UNAVAILABLE`를 모두 빈 문자열/0으로 바꾸지 않는다.
- 표시 binding의 label/width/format을 사용하되 허용 범위 밖 width나 알 수 없는 format을 스타일에 그대로 넣지 않는다. sourceScope는 업무 동작에 필요할 때만 노출한다.
- 통화는 Decimal string과 currencyCode로 포맷한다. 기존 `Number(amount)` 기반 합산/포맷을 그대로 옮겨 큰 수·소수 정밀도를 잃지 않는다. 차트 라이브러리의 좌표 계산에 부동소수를 쓰더라도 툴팁·표·합계 원문 값은 보존한다.
- DATE는 날짜로, TIMESTAMP는 사용자 시간대 기준으로 표시한다. 종료 포함 여부를 라이브러리의 exclusive end로 변환할 때 UI adapter 한 곳에서 처리한다.
- Group.count는 전체 값, items.length는 로드한 값이다. ‘5개 중 2개 표시’처럼 구분한다. 숨김/접힘은 필터와 다른 표시 상태다.
- KANBAN 열 cursor는 서로 공유하지 않는다. 접힌 열을 펼쳐 처음 읽을 때 cursor 없이 groupToken으로 요청한다.
- GANTT는 renderable=true이며 양쪽 itemKeys가 현재 로드된 항목과 대응할 때만 선을 그린다. 추가 page 후 같은 관계 ID를 중복 렌더링하지 않는다. 필요하면 이미 받은 endpoint ID와 로드 항목을 재대응하되 서버가 보고한 모호성을 임의 해결하지 않는다.
- Chart/Pivot은 서버가 집계한 값을 그린다. 사용자 화면 확대/가상 스크롤은 집계 원본의 pagination이 아니다. no cell/null/0 구분을 유지한다.
- 이미지 URL 정책은 P07. data SVG를 DOM HTML로 삽입하지 않는다. `<img>` 사용 시에도 CSP/허용 형식/길이/로드 실패를 검토한다.

## 6. Dashboard 재사용

구성 query → READY widget의 고유 content View query → 같은 renderer의 widget 모드 순서다. 자식 조회에는 content.sourceType을 사용하고 null이면 생략한다. 부모 route의 targetType을 복사하지 않는다. hooks를 widget 개수만큼 반복문에서 직접 호출하지 않고 위젯 container 또는 useQueries를 사용한다. View/source/query가 같은 경우 캐시를 공유하고 widget ID로 레이아웃/상태를 구분한다.

각 위젯은 독립 로딩·오류·재시도 영역이다. 원본에 설정 부족/접근 불가가 있으면 그 칸만 안내한다. layout=null인 설정 오류 위젯은 안전한 안내 영역에 순서대로 배치하고 저장 layout을 보정하지 않는다. 전체 Dashboard가 단일 읽기 snapshot이라는 문구를 표시하지 않는다. 필터/검색을 자식 전체에 자동 전파하지 않는다.

중첩 Dashboard를 허용할지는 P08이다. 지원 시 현재 재귀 경로의 View ID로 순환을 막고 서버도 구성 그래프의 안전 한도를 검증한다. 동일 원본이 다른 독립 위젯에 나타나는 것은 순환이 아니다. 모바일 배치는 저장 좌표를 수정하지 않고 순서/화면 너비에 맞춰 표현한다.

## 7. 기존 UX 보존과 접근성

- 헤더 한 줄·기존 toolbar·보기 설정 패널/필터 팝오버를 유지한다. 11개 보기 전환 때문에 헤더 전체 UX를 교체하지 않는다.
- type별 visibility는 기존 헤더 규칙을 따른다. Calendar에 정렬을 새로 노출하거나 Chart/Pivot/Dashboard에 검색을 강제로 추가하지 않는다.
- UI 텍스트에 데이터베이스 JSON/Port명 등 구현 상세를 노출하지 않는다.
- 표 머리글/행·달력·키보드 선택·팝오버 focus와 닫힘을 확인한다. 색만으로 상태/시리즈를 구분하지 않는다.
- 차트/지도는 필요한 텍스트 대안과 목록을 제공한다. 모바일 표/피벗은 가로 스크롤, 칸반은 열 이동, 기간 화면은 목록 영역+가로 스크롤을 검토한다.
- 확대/축소, 카드·위젯 hover, detail 열기 등 읽기 상호작용과 drag/save mutation을 분리한다. 제공하지 않는 쓰기 기능이 저장되는 것처럼 보이지 않게 한다.

현재 의존성 목록에서 차트·지도·달력 전용 라이브러리가 확인되지 않았다. 라이브러리·Provider·라이선스·번들 크기는 실제 구현 착수 시 평가한다. 이번 문서 작업에서 의존성을 설치하지 않았다.

## 8. 구현 후 검증

1. API 응답 검증: 11 타입/part/state 조합, 잘못된 View ID/type, 숫자 문자열·다중값·옵션 라벨.
2. hook: 사용자/Workspace/View 분리, 빠른 View 전환·늦은 응답·AbortSignal, query key, 409 초기화, 재시도 제한.
3. UI: 각 타입 정상/0건/설정 없음/실패, 부분 page, 날짜 이동, 지도 선택, Dashboard 부분 오류.
4. 회귀: 기존 header/드롭다운/별표/필터·정렬·설정 패널, Object 기존 상세·셀 수정·생성 연결, List 이동, desktop/mobile.
5. 실제 통합: 목표 Supabase의 24 View를 대상으로 main API 결과와 mock 기대값을 대조한다. 11개 JSON 예제 렌더링만으로 실제 DB 통합 성공으로 판단하지 않는다.

typecheck/lint/test/build와 필요한 브라우저 검증은 구현 후 수행한다. 이번 계획서의 정적 검토는 FE 동작 검증 결과가 아니다.
