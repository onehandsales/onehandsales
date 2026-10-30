# View 주 화면 공통 조회 API

## 1. 계약 상태와 역할

- API 이름: **선택 View 주 화면 데이터 조회**
- 식별자: `GET_WORKSPACE_VIEW_MAIN_CONTENT`
- 계약 상태: **draft**. 아래 요청·응답·기본값은 검토 가능한 제안이다. 구현 및 배포 전이다.
- 소비자: User Web의 Object/List 본문, Dashboard 위젯. Admin Web 추가 없음.
- 소유 모듈: `view-definition`, Application orchestration.
- 호환성: 신규 endpoint. 기존 헤더·메뉴·Object Record 조회 계약 변경 없음. 새 프론트 본문은 새 계약으로 연결한다.
- DB migration: 이번 설계에 필수 schema 변경 없음. 실제 성능에 따른 인덱스는 별도 검토.
- 범위 확정: [현재 조회 범위와 후속 저장 작업](../SCOPE_AND_DEFERRED_WORK.md)을 따른다. 현재 구현 대상은 이 GET 하나이며 필터·정렬 저장 API와 FE 연결은 후속이다. 범위 확정과 API 세부 계약 confirmed는 구분한다.

```http
GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data
Authorization: Bearer <app access token>
```

HTTP 진입점은 하나다. View Type은 서버가 저장된 ViewDefinition.type에서 결정한다. `viewType`을 요청하여 다른 타입으로 변환하지 않는다. 내부는 타입별 조회기·응답 DTO로 분리한다. 날짜 이동·단계 더 보기·위젯 조회는 같은 endpoint의 추가 호출이다.

## 2. Request

- DTO: `GetWorkspaceViewMainContentQueryDto`
- Header: Bearer 필수. 기존 request ID middleware 사용. 신규 업무 cookie 없음.
- Body: 없음. 기존 EmptyRequestPipe를 사용해 body 입력을 거부한다.
- Path: `workspaceId`, `viewDefinitionId`는 필수 UUID. UUID 비교·캐시 키는 소문자로 정규화.
- 미정의 query, 배열·중복 scalar query, 잘못된 JSON/숫자/날짜, 문자열 `null`은 거부한다.

| Query | 타입·필수 여부 | 제안 의미와 검증 |
| --- | --- | --- |
| `sourceType` | `OBJECT` 또는 `LIST`, 선택 | 해당 View의 소속을 선택. 소속 하나이면 생략 가능. 둘 다 있으면 필수. 선택된 FK가 없으면 400. 임의 target ID를 받지 않음 |
| `part` | 아래 enum, 선택 | 생략 시 `MAIN`. 저장 View 타입과 허용 조합 검증 |
| `q` | string, 선택 | trim 후 빈 값은 검색 없음. 최대 200자 제안. 검색 대상은 제목과 선택된 표시 속성의 텍스트·이름. 원본/다중 관계의 문자열 의미는 BE 공통 규칙 참조 |
| `limit` | 정수, 선택 | 기본 25, 1~100 제안. 반환 항목 page 한도. 전체 계산 대상을 25개로 자르는 값이 아님 |
| `cursor` | 불투명 string, 선택 | 해당 part·조회 맥락·페이지 순서에 종속. 빈 문자열 금지. CHART/PIVOT/DASHBOARD에는 사용하지 않음 |
| `groupToken` | 불투명 string, 조건부 필수 | `GROUP_ITEMS`에 필수. KANBAN 응답의 그룹 토큰을 그대로 전달 |
| `rangeStart` / `rangeEnd` | `YYYY-MM-DD`, 쌍으로 선택 | 기간형 View만 사용. `[start,end)` 조회창, 실제 달력 날짜와 start<end 검증. 최대 366일 제안 |
| `timeZone` | IANA string, 선택 | 기간형 View만 사용. 미전송 시 CurrentUserContext.timeZone. Date 값을 시차 이동하지 않고 Timestamp 조회 경계를 변환 |
| `bounds` | URL 인코딩한 JSON number[4], 선택 | MAP 전용 `[west,south,east,north]`, 경도 ±180/위도 ±90, south≤north. west>east는 날짜변경선 횡단 범위 |
| `focusItemKey` | string, 선택 | MAP_ITEMS 또는 MAP_MARKERS에서 선택 항목 하나를 찾을 때. cursor와 함께 사용 금지. 동일 View 필터와 Workspace 검증 적용 |

날짜형 첫 조회에서 기간이 없으면 사용자 시간대의 이번 달 `[1일,다음 달 1일)`을 사용하고 실제 적용 기간을 응답한다는 제안이다. `initialMode`·`timeScale`은 표시 방식이며 실제 조회 기간과 별개다. 제품 결정 P04에서 확정한다.

| 타입 | 허용 part | 추가 조건 |
| --- | --- | --- |
| TABLE / LIST / GALLERY | MAIN | q, limit, cursor |
| KANBAN | MAIN / GROUP_ITEMS | q, limit. MAIN cursor 금지, 그룹별 cursor 사용 |
| CALENDAR / TIMELINE / GANTT | MAIN / UNSCHEDULED_ITEMS / INVALID_DATE_ITEMS | q, 기간, 시간대. 미설정/잘못된 날짜 목록은 같은 필터 후 기간 조건을 제외 |
| CHART / PIVOT | MAIN | 저장된 필터·집계 사용. q/limit/cursor/기간/bounds 금지 |
| MAP | MAIN / MAP_MARKERS / MAP_ITEMS / UNLOCATED_ITEMS | q, limit, cursor, bounds. MAIN cursor 금지. 미위치 목록은 bounds 적용 제외 |
| DASHBOARD | MAIN | 구성 조회. q/limit/cursor/기간/bounds 금지. sourceType은 소속 확인 용도이며 위젯에 전파하지 않음 |

**현재 GET은 DB에 저장된 필터·정렬·설정을 실행한다.** 임시 필터/정렬/설정 override는 받지 않는다. 사용자가 원하는 자동 저장 후 즉시 반영은 후속 저장 API 성공 → 같은 GET 재조회로 구현한다. GET에 body를 넣거나 조회 중 설정을 갱신하지 않는다. P09의 저장 기능은 이번 GET의 선행 조건이 아니다. 후속 FE 연결에서 적용되지 않은 조건을 적용 완료로 표시하면 안 된다.

## 3. 공통 Response

- 성공: `200 OK`, JSON body 있음. 기존 프로젝트처럼 별도 `success/data` 공통 envelope를 추가하지 않는다.
- DTO: `WorkspaceViewMainContentResponseDto`.
- 타입: `viewType + part + state`를 판별자로 하는 union. 모든 타입의 필드를 nullable로 모은 거대 DTO를 만들지 않는다.

| 필드 | 타입·nullable | 의미 |
| --- | --- | --- |
| `viewDefinitionId` | UUID | 요청한 View |
| `viewType` | 11개 View enum | 서버의 저장 타입 |
| `viewName` | string | 저장 보기 이름 |
| `source` | Source 객체 | 아래 조회 단위 |
| `configurationFingerprint` | string | 설정·메타데이터를 정규화해 계산한 불투명 식별값. DB revision 컬럼 아님 |
| `part` | 요청 part enum | 실제 응답 부분 |
| `state` | `READY` / `NEEDS_CONFIGURATION` | 실행 가능한 결과 또는 필요한 설정 안내 |
| `issues` | Issue[] | 안전한 코드와 설정 필드 정보. 원본 오류·비밀값 없음 |
| `bindings` | Binding[] | 표시/계산에 사용한 속성 참조와 역할·메타데이터 |
| `summary` | Summary 또는 null | 전체/필터 후/표시 대상 건수. DASHBOARD·설정 미완성은 null |
| `data` | 타입·part별 객체 또는 null | READY면 아래 타입 계약. NEEDS_CONFIGURATION이면 null |

Source는 `{kind:"OBJECT"|"LIST"|"NONE", objectDefinitionId:UUID|null, listDefinitionId:UUID|null, itemKind:"RECORD"|"LIST_ENTRY"|null}`이다. OBJECT는 Object Record를, LIST는 ListEntry를 조회한다. NONE은 원본 없이 위젯만 가진 Dashboard 또는 설정 미완성 상태에 사용할 수 있다. 소속 양쪽이 존재할 때 하나를 조용히 우선하지 않는다.

사용자가 선택한 List 조회·집계 단위는 Entry다. 같은 Record를 참조하는 Entry 두 개는 두 항목으로 유지하고, Record 측정값도 각 Entry에서 한 번씩 기여한다. JOIN 증식에 따른 중복이나 다중값의 기여는 별도 문제로 검증한다.

Summary는 `{sourceItemCount, matchedItemCount, eligibleItemCount}`의 비음수 정수다. source는 권한 확인된 원본 단위 전체, matched는 저장 필터와 q를 적용한 전체, eligible은 그중 현재 part의 기간·좌표 등 표시 조건을 만족하는 전체다. 페이지 반환 수나 그룹 중복 출현 수와 혼동하지 않는다. 차트·피벗에서는 matched와 eligible이 같고 측정값 누락 건수는 metric에 별도 둔다.

Issue는 `{code:string, field:string|null, bindingId:UUID|null}`이다. 사용자 문구는 FE i18n에서 선택한다. 누락된 역할/집계 설정은 NEEDS_CONFIGURATION, 위젯 하나의 불가 상태는 해당 widget에 표시한다. 참조 Workspace 손상이나 필터 그래프 오류는 정상 안내 상태로 숨기지 않고 500 오류를 반환한다.

안전한 issue code 후보는 `MISSING_SOURCE`, `MISSING_BINDING`, `MISSING_AGGREGATION`, `UNSUPPORTED_EXECUTION_CONFIGURATION`, `INVALID_PROGRESS`, `AMBIGUOUS_DEPENDENCY_MAPPING`, `DEPENDENCY_CYCLE`다. 앞의 설정 부족 코드는 전체 state=NEEDS_CONFIGURATION, 진행률/관계 표시 문제는 READY의 해당 부분을 null/비표시로 둘 수 있다. 이 code는 신규 계약이며 현재 구현된 오류명으로 간주하지 않는다.

### Binding / Item / Cell

Binding 필드는 `id`(ViewAttributeSettingDefinition.id), `attributeDefinitionId`, `sourceScope`, `referenceAttributeIdPath`(UUID[]), `role`(attributeDisplayRole), `label`(override 또는 속성 제목), `attributeType`, `isMultiselect`, `isHidden`, `width`(number|null), `format`(허용된 표시 JSON 또는 null), `currencyCode`(string|null)이다. 같은 Attribute의 다른 경로·역할은 다른 binding이다. 숨긴 표시 바인딩을 읽어 실행 메타데이터로 사용할 수 있지만 숨긴 값을 cells로 불필요하게 반환하지 않는다. 필터·그룹 전용 참조는 해당 설정의 descriptor에서 해석하며 가짜 표시 setting ID를 만들지 않는다.

Item 필드는 다음과 같다. 동일 구조를 행·카드·일정의 `item`에 사용한다.

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `itemKey` | string | `RECORD:<id>` / `LIST_ENTRY:<id>` |
| `occurrenceKey` | string | 그룹별 표시 위치의 key. 그룹 없으면 itemKey, 같은 항목이 여러 그룹에 나타나면 itemKey+groupPath로 안정 생성 |
| `recordDefinitionId` | UUID | 원본 Record |
| `objectDefinitionId` | UUID | 원본 Object |
| `listEntryDefinitionId` | UUID 또는 null | List 화면 행의 실제 Entry |
| `title` | string | TITLE 값의 표시 문자열. 빈 값 fallback 제안은 ‘제목 없음’ |
| `cells` | Cell[] | 표시 속성값. Attribute 하나의 여러 값을 보존 |
| `groupPath` | string[] | 일반 그룹의 상위→하위 group key. 그룹 없음은 [] |

Cell은 `{bindingId, state:"VALUE"|"EMPTY"|"INVALID"|"UNAVAILABLE", values:CellValue[]}`다. `values:[]`와 숫자 0·false·빈 문자열을 혼동하지 않는다. CellValue는 `{valueDefinitionId:UUID, sourceEntity:{kind:"RECORD"|"LIST_ENTRY",id:UUID}, value:Value}`다. 참조 경로로 도달한 값도 실제 값 소유자를 보존한다.

| AttributeType | Value |
| --- | --- |
| Text / Domain / EmailAddress / PhoneNumber | string |
| Number / Rating / Currency | Decimal string |
| Checkbox | boolean |
| Date | `YYYY-MM-DD` string |
| Timestamp | UTC ISO string |
| Select / Status | `{id:UUID,label:string,color:string|null}` |
| RecordReference | `{objectDefinitionId:UUID,recordDefinitionId:UUID,label:string|null}` |
| ActorReference | `{actorId:UUID,label:string|null}` |
| PersonalName | `{displayName:string}` |
| Location | `{text:string|null,latitude:number|null,longitude:number|null}` |
| Interaction | `{summary:string|null,occurredAt:string|null}` |

참조 대상이 접근 불가이면 ID·라벨을 누출하지 않고 UNAVAILABLE로 표현한다. 저장 typed 값과 JSON 값의 일치·fallback·실패 기준은 [BE 공통 규칙](../../BE-TODO/ARCHITECTURE_AND_QUERY_RULES.md)을 따른다. 알 수 없는 JSON을 그대로 화면에 노출하지 않는다.

PageInfo는 `{hasNextPage:boolean,nextCursor:string|null}`이다. 다음 페이지가 없으면 반드시 false/null. cursor는 사용자·Workspace·View·source·part·q·기간·bounds·그룹·설정 fingerprint·정렬 기준에 결합한다. 설정 변경 시 409로 초기 페이지부터 다시 읽는다. 각 페이지는 현재 데이터를 읽으며 페이지 사이의 데이터 snapshot 고정은 보장하지 않는다. cursor/groupToken의 위변조를 검증하고 원본 정렬값·검색어가 단순 Base64로 노출되지 않게 한다. 만료·길이·암호화 방식은 P05/P06에서 확정한다.

Group은 `{key:string,parentKey:string|null,label:string,color:string|null,count:number,isHidden:boolean,isFold:boolean}`이다. key는 라벨이 아닌 속성·옵션/정규 값·상위 그룹 기준으로 안정적으로 만든다. count는 페이지 처리 전 해당 그룹의 고유 원본 항목 수다. 다중값 그룹 기여와 전체 합계는 P03의 확정 대상이다.

## 4. 타입별 MAIN data

아래 필드는 READY 응답의 `data` 내부다. 각 예제는 공통 envelope까지 포함한 독립 JSON이며 **구조 설명용 가상 값**을 포함한다. 실제 DB의 조회 결과나 현재 설정 전문을 복사한 응답으로 해석하지 않는다. 예제의 page 건수는 예제 데이터에만 해당한다.

| 타입 / DTO | data 필드 | 응답 전문 |
| --- | --- | --- |
| TABLE / TableViewDataDto | presentation, columnBindingIds:UUID[], items:Item[], groups:Group[], pageInfo | [TABLE](examples/TABLE.response.json) |
| KANBAN / KanbanViewDataDto | presentation, groupDefinitionId:UUID, columns:KanbanColumn[], unassignedCount:number | [KANBAN](examples/KANBAN.response.json) |
| LIST / ListViewDataDto | presentation, items:Item[], groups:Group[], pageInfo | [LIST](examples/LIST.response.json) |
| GALLERY / GalleryViewDataDto | presentation, cards:GalleryCard[], pageInfo | [GALLERY](examples/GALLERY.response.json) |
| CALENDAR / CalendarViewDataDto | presentation, range:Range, events:Event[], unscheduledCount:number, invalidDateCount:number, pageInfo | [CALENDAR](examples/CALENDAR.response.json) |
| TIMELINE / TimelineViewDataDto | presentation, range:Range, bars:Bar[], groups:Group[], unscheduledCount:number, invalidDateCount:number, pageInfo | [TIMELINE](examples/TIMELINE.response.json) |
| GANTT / GanttViewDataDto | presentation, range:Range, tasks:GanttTask[], groups:Group[], dependencies:Dependency[], unscheduledCount:number, invalidDateCount:number, pageInfo | [GANTT](examples/GANTT.response.json) |
| CHART / ChartViewDataDto | presentation, metric:Metric, categories:Dimension[], series:Dimension[], points:ChartPoint[], total:Aggregate | [CHART](examples/CHART.response.json) |
| PIVOT / PivotViewDataDto | presentation, metric:Metric, rowDimensions:Dimension[], columnDimensions:Dimension[], cells:PivotCell[], rowTotals:Total[], columnTotals:Total[], grandTotal:Aggregate | [PIVOT](examples/PIVOT.response.json) |
| MAP / MapViewDataDto | presentation, bounds:Bounds|null, markers:MarkerPage, list:ItemPage, unlocatedCount:number | [MAP](examples/MAP.response.json) |
| DASHBOARD / DashboardViewDataDto | presentation, widgets:Widget[], visibleWidgetCount:number | [DASHBOARD](examples/DASHBOARD.response.json) |

### presentation

저장 원본은 ViewDefinition.configJson이다. 아래 규격 외의 의미를 임의로 추가하지 않는다.

| 타입 | 필드·값 후보 |
| --- | --- |
| TABLE / LIST | `rowDensity: "COMFORTABLE"|"COMPACT"|null` |
| KANBAN | `cardDensity: "COMFORTABLE"|"COMPACT"|null`, `showEmptyGroups:boolean|null` |
| GALLERY | `cardSize:"SMALL"|"MEDIUM"|"LARGE"|null`, `imageFit:"CONTAIN"|"COVER"|null` |
| CALENDAR | `initialMode:"MONTH"|"WEEK"|null`, `weekStartsOn:"MONDAY"|"SUNDAY"|null` |
| TIMELINE | `timeScale:"DAY"|"WEEK"|"MONTH"|null` |
| GANTT | `timeScale`, `showDependencies:boolean|null` |
| CHART | `chartType:"BAR"|"LINE"|"PIE"|"NUMBER"`, `showLegend:boolean|null` |
| PIVOT | `showRowTotals:boolean|null`, `showColumnTotals:boolean|null` |
| MAP | `fitToData:boolean|null`, `showLabels:boolean|null` |
| DASHBOARD | `gridColumns:positive integer` |

목 데이터에 없는 값은 제안 enum이다. null은 저장값 없음이며 FE 기본 표현은 문서의 제안으로 관리한다. 조회 결과에 기본값을 채워 ‘저장됨’으로 표시하지 않는다. 계산 의미에 필수인 chartType/aggregation/날짜·위치 역할이 없으면 NEEDS_CONFIGURATION로 안내한다.

### 타입별 중첩 객체

- `ItemPage`: `{items:Item[],pageInfo:PageInfo}`.
- `KanbanColumn`: Group 필드 + `{groupToken:string,items:Item[],pageInfo:PageInfo,calculations:MetricTotal[]}`. 단계별 독립 페이지. 계산 설정이 없으면 calculations=[]. DISPLAY Currency가 있다고 SUM을 추정하지 않는다.
- `GalleryCard`: `{item:Item,body:string|null,image:{src:string,alt:string}|null}`. 이미지 정책에 맞지 않거나 없으면 image=null과 텍스트 카드.
- `Range`: `{startDate:string,endDateExclusive:string,timeZone:string}`.
- `Event`: `{item:Item,dateKind:"DATE"|"TIMESTAMP",start:string,end:string|null,endInclusive:boolean}`. DATE 종료는 포함, TIMESTAMP 종료는 제외 제안. 사용자 선택 A안에 따라 Calendar의 시작일만 있는 항목은 하루/단일 시점으로 표현하고 DB 종료값을 만들지 않는다.
- `Bar`: Event 필드와 동일. 사용자 선택 A안에 따라 TIMELINE/GANTT의 시작 또는 종료값 부족은 unscheduled 목록으로 분리한다. 날짜 경계·Timestamp 상세 규칙의 확정은 이 표시 선택과 구분한다.
- `GanttTask`: Bar + `{progress:{rawValue:string,valueScale:string,ratio:string}|null}`. 계산은 Decimal. 잘못된 진행률을 임의 clamp하지 않는다.
- `Dependency`: `{id:UUID,type:"FINISH_TO_START"|"START_TO_START"|"FINISH_TO_FINISH"|"START_TO_FINISH",source:DependencyEndpoint,target:DependencyEndpoint,offset:{value:DecimalString,unit:"MINUTE"|"HOUR"|"DAY"},renderable:boolean}`.
- `DependencyEndpoint`: `{kind:"RECORD"|"LIST_ENTRY",id:UUID,itemKeys:string[]}`. 현재 페이지의 대응 행. List 화면에서도 Record 관계를 읽고 Entry와 대응시킨다. 여러 Entry에 대응하면 임의 1개를 택하지 않는다.
- `Metric`: `{aggregation:"COUNT_ITEMS"|"COUNT_VALUES"|"SUM"|"AVG"|"MIN"|"MAX",bindingId:UUID|null,currencyCode:string|null,missingValueItemCount:number}`. COUNT_ITEMS는 bindingId=null 가능. 현재 저장 SUM 외의 저장 JSON 매핑은 P03 확정 필요.
- `Dimension`: `{key:string,label:string,reference:{kind:"STATUS_OPTION"|"SELECT_OPTION"|"RECORD"|"ACTOR",id:UUID}|null}`. 원본 이름이 바뀌어도 ID 기준 집계 유지. 복수 기준은 key에 순서 있는 경로를 반영.
- `Aggregate`: `{value:DecimalString|null,itemCount:number,valueCount:number}`. COUNT도 숫자 문자열. 평균 합계는 원본으로 다시 계산.
- `MetricTotal`: `{metric:Metric,result:Aggregate}`.
- `ChartPoint`: `{categoryKey:string|null,seriesKey:string|null,result:Aggregate}`. 그룹 없는 NUMBER는 두 key=null인 점 하나.
- `PivotCell`: `{rowKey:string,columnKey:string,result:Aggregate}`. 행·열 조합에 해당하는 원본에서 계산. 셀 없음과 null·0의 의미는 BE 규칙 참조.
- `Total`: `{key:string,result:Aggregate}`. 합계 표시가 꺼지면 해당 배열은 [], grandTotal은 여전히 계산 의미 설명에 사용.
- `Bounds`: `{west:number,south:number,east:number,north:number}`. MAIN bounds는 필터에 해당하는 유효 좌표 전체의 범위다. 현재 marker page만으로 전체 위치 범위를 계산하지 않는다.
- `Marker`: `{key:string,item:Item,latitude:number,longitude:number}`. 한 항목의 다중 위치 식별도 가능한 key. 다중 위치 표시 정책은 P07에서 확정.
- `MarkerPage`: `{items:Marker[],pageInfo:PageInfo}`.
- `Widget`: `{id:UUID,title:string,showTitle:boolean,layout:{x:number,y:number,width:number,height:number}|null,content:{viewDefinitionId:UUID,viewType:ViewType,sourceType:"OBJECT"|"LIST"|null}|null,state:"READY"|"UNAVAILABLE"|"CYCLE"|"NEEDS_CONFIGURATION"}`. 유효 layout 수치는 정수, x/y≥0, width/height>0. layout 오류는 null과 NEEDS_CONFIGURATION으로 반환하고 FE가 안내 칸에 배치한다. READY는 유효 layout/content가 필수다. 접근 불가 원본 ID·이름은 content에 노출하지 않음. content.sourceType은 자식 View의 조회 소속으로 서버가 정하며 부모 소속을 복사하지 않는다. 양쪽 FK인 자식의 선택 설정이 없으면 NEEDS_CONFIGURATION. 원본 없는 Dashboard만 READY의 sourceType=null 가능하다(P01).

## 5. 부분 조회 응답

공통 envelope는 동일하고 part로 data를 구분한다. 부분 응답을 MAIN 전체 객체로 캐시에 덮어쓰지 않는다.

| part | data |
| --- | --- |
| GROUP_ITEMS | `{groupToken:string,groupKey:string,items:Item[],pageInfo}` |
| UNSCHEDULED_ITEMS / INVALID_DATE_ITEMS | `{items:Item[],pageInfo}` |
| MAP_MARKERS | `{items:Marker[],pageInfo}` |
| MAP_ITEMS / UNLOCATED_ITEMS | `{items:Item[],pageInfo}` |

focusItemKey를 사용한 MAP_ITEMS는 필터를 만족하는 원본 항목 최대 1개, MAP_MARKERS는 그 항목의 유효 marker들을 반환한다. 다중 위치의 marker 수 한도는 P07에 따른다. 선택 항목 조회는 bounds를 적용하지 않는 제안이며 cursor는 금지한다. 불일치이면 빈 items와 false/null pageInfo다. 해당 항목이 존재하는지 추측할 수 있는 별도 응답을 만들지 않는다. 범위/선택을 포함한 summary의 eligible은 실제 해당 부분 조회 조건을 만족하는 고유 원본 수다.

## 6. 처리·DB·일관성

1. AuthGuard와 UUID/query DTO 검증을 거친다.
2. Workspace 공개 접근 Port로 현재 멤버십을 확인한다. 읽기에 Actor 생성을 요구하지 않는다.
3. View·선택 소속을 확인하고 저장 설정과 필요한 메타데이터를 읽는다.
4. 참조 경로·필터 트리·역할·옵션·JSON을 검증하고 조회 계획을 만든다.
5. Record 또는 ListEntry 공개 Port를 통해 값과 관계를 읽어 공통 조건을 적용한다.
6. 타입별 조회기가 행·그룹·기간·집계·좌표·위젯 결과를 계산한다.
7. 결과 페이지를 확정하고 DTO mapper가 필요한 필드만 반환한다.

읽는 모델과 소유자는 [BE 구조](../../BE-TODO/ARCHITECTURE_AND_QUERY_RULES.md), 실제 설정과 각 타입 처리 순서는 [타입별 설계](../../BE-TODO/VIEW_TYPE_BUSINESS_LOGIC.md)를 따른다.

- transaction: **필요 제안**. 한 응답의 설정·값·건수·집계에 같은 읽기 snapshot을 적용하기 위한 제한된 read-only RepeatableRead. 변경 model 없음, 실패 시 읽기 종료, rollback할 업무 변경 없음.
- 기존 TransactionManager에 isolation 보장이 없으므로 전용 ReadSnapshotRunner Port 또는 명시적 확장이 필요하다. application이 시작하고 infrastructure만 Prisma context를 해석한다.
- snapshot은 요청 하나에만 적용된다. Dashboard 전체 위젯이나 다음 페이지까지 같은 시점이라는 보장은 없다.
- 외부 Provider: 없음. 지도 타일은 FE provider, 주소 geocoding·이미지 다운로드를 BE 조회 transaction 안에서 실행하지 않는다.
- idempotency/outbox: 조회이므로 키·쓰기·outbox 불필요. 로그는 DB 업무 이력으로 삽입하지 않는다.
- 기록 자동 생성, 기본 View 생성, 설정 보정, updatedAt 갱신 없음.

## 7. 오류와 로그

| 상황 | code / HTTP | FE 처리 | 로그 |
| --- | --- | --- | --- |
| 인증 실패 | 기존 Unauthorized / 401 | 기존 apiClient refresh·로그인 흐름 | 기존 auth 정책 |
| 비멤버·Workspace 없음 | ViewDataWorkspaceNotFound / 404 | 접근 불가 | info |
| View 없음·다른 Workspace | ViewDataViewNotFound / 404 | 선택 갱신, 무한 재시도 금지 | info |
| 요청 형식·타입별 조합 오류 | ValidationError / 400, DTO는 기존 Nest 오류 형태 | 잘못된 입력 안내 | warn |
| 저장 설정이 cursor 이후 변경 | ViewDataCursorStale / 409 | 쌓인 페이지를 버리고 첫 조회 | info |
| 계산/출력 안전 한도 초과 | ViewDataQueryLimitExceeded / 422 | 범위·조건 조정 안내. 불완전 집계를 성공으로 표시하지 않음 | warn |
| 제한 시간 초과 | ViewDataQueryTimedOut / 503 | 재시도 안내 | warn |
| 저장 참조 손상·필터 순환 | ViewDataConfigurationInvalid / 500 | 안전한 조회 오류 | error |
| 그 밖의 내부 오류 | 기존 InternalServerError / 500 | 재시도 안내 | error |

409/422/503 신규 code는 현재 HttpExceptionFilter에 없다. 구현 시 명시 매핑과 HTTP 검증이 필요하다. `NotFound` 접미사만 현재 자동 404 처리된다. 내부 원인 객체는 기존 filter가 노출하지 않으므로 FE가 임의 `details.reason`에 의존하지 않는다.

Domain 오류 예시:

```json
{"statusCode":404,"error":"ViewDataViewNotFound","message":"View definition not found"}
```

Nest ValidationPipe 오류는 기존 `{statusCode,error:<Nest response>}` 형태를 유지한다. 새 API만 독자 오류 envelope로 바꾸지 않는다.

로그 event: `view.main_content.read.completed`, `view.main_content.read.failed`. requestId, userId, workspaceId, viewDefinitionId, viewType, part, durationMs, scannedItemCount, returnedItemCount, queryCount, 안전한 error code만 기록한다. 검색어·필터 비교값·셀 원문·JSON 원문·토큰·DB URL·Provider 원문 오류는 제외한다. 공통 로그 Port 사용, row별 로그 금지.

## 8. 검토 연결

[검토 결과 및 P01~P10](../PLANNING-REVIEW.md)을 이 계약의 결정 목록으로 사용한다. P09는 후속 저장 API로 분리했고 Entry 단위·기간 미설정 표시는 사용자 선택을 반영했다. 이번 GET의 지원 조합·다중값 기여·제목·날짜 경계·조회 한도·snapshot 실행 방식은 착수 전 계약 보완 단계에서 구체화한다. 계약 draft 상태를 11개 타입의 구현 완료로 표시하지 않는다.
