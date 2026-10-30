# View 주 화면 공통 조회 API

## 계약 및 구현 상태

API 이름: **선택 View 주 화면 데이터 조회**.
GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data

Backend와 User Web에 공통 진입점·11개 전용 조회기/본문 컴포넌트를 구현했다. 배포·커밋은 하지 않았다. 날짜 종료일 포함 여부는 제품 확인 대기이며, 미확정 상태에서 종료일이 있는 Date View는 NEEDS_CONFIGURATION을 반환한다. 테스트에서 포함/제외 양쪽을 명시하여 실행한 것과 운영 기본값 확정은 구분한다.

현재 구현과 검증 근거는 [구현 기준](../IMPLEMENTATION_BASELINE.md), [검토·검증 기록](../IMPLEMENTATION_REVIEW.md)을 따른다. 기존 헤더·필터·정렬·보기 설정 GET은 그대로 재사용한다. 필터·정렬·보기 설정 저장 API와 신규 원본 쓰기 API는 후속이다.

## 요청

Bearer 인증 필수. workspaceId/viewDefinitionId는 UUID이며 소문자로 정규화한다. GET body, 알 수 없는 query, 중복 scalar/배열 입력을 거부한다. View Type은 저장된 ViewDefinition.type에서 결정한다.

| Query | 실행 규칙 |
| --- | --- |
| sourceType | OBJECT/LIST. 소속 하나면 생략 가능, 양쪽이면 필수. 선택한 FK가 없으면400 |
| part | 기본 MAIN. 아래 타입별 허용 범위 적용 |
| q | 최대200자, trim/NFC/대소문자 무시 검색. 제목과 숨기지 않은 표시 속성의 표시 문자열 |
| limit | 기본25, 정수1~100. 전체 필터·집계 대상을 자르는 상한이 아니라 결과 page 크기 |
| cursor | 비어 있지 않은 불투명 토큰, 최대2048자. 해당 part/그룹과 맥락에만 사용 |
| groupToken | GROUP_ITEMS에 필수, 다른 part에는 금지 |
| rangeStart / rangeEnd | YYYY-MM-DD 쌍, 실제 달력 날짜, 반열린 조회창 [start,end), 1~366일 |
| timeZone | 날짜 타입 전용 IANA. 생략하면 사용자 시간대 |
| bounds | MAP 전용 JSON [west,south,east,north]. 위도±90/경도±180. west>east는 날짜변경선 횡단 |
| focusItemKey | MAP_ITEMS/MAP_MARKERS만. RECORD:UUID 또는 LIST_ENTRY:UUID, cursor와 동시 사용 금지 |

날짜 첫 조회는 사용자 시간대의 이번 달이며 실제 적용 범위를 반환한다. initialMode/timeScale은 표시 옵션이다. Date 원본은 시차 이동하지 않고 Timestamp는 응답 시간대의 날짜 경계로 비교한다. 종료일이 없는 Calendar는 시작일 하루, Timeline/Gantt는 기간 미설정 목록이다.

| View Type | 허용 part | 입력 |
| --- | --- | --- |
| TABLE, LIST, GALLERY | MAIN | q/limit/cursor |
| KANBAN | MAIN, GROUP_ITEMS | MAIN에는 cursor 금지. 열별 독립 cursor |
| CALENDAR, TIMELINE, GANTT | MAIN, UNSCHEDULED_ITEMS, INVALID_DATE_ITEMS | q/limit/cursor/기간/timeZone |
| CHART, PIVOT | MAIN | 저장 필터·집계만. q/limit/cursor/기간/bounds 금지 |
| MAP | MAIN, MAP_ITEMS, MAP_MARKERS, UNLOCATED_ITEMS | q/limit/bounds. cursor는 부분 조회만. 미위치 목록은 bounds 제외 |
| DASHBOARD | MAIN | 구성만. 부모의 source/filter를 자식에 전달하지 않음 |

## 공통 응답

응답 구현 타입은 WorkspaceViewMainContentResponse이며 viewType + part + state 판별 union이다. 별도 success envelope는 없다.

| 필드 | 의미 |
| --- | --- |
| viewDefinitionId, viewName, viewType | 요청 View의 저장 식별자·이름·타입 |
| source | kind OBJECT/LIST/NONE, objectDefinitionId/listDefinitionId nullable, itemKind RECORD/LIST_ENTRY/null |
| configurationFingerprint | 저장 설정·속성·옵션·제목 후보·자식 구성을 정규화한 식별값 |
| part | 요청한 결과 부분 |
| state | READY 또는 NEEDS_CONFIGURATION |
| issues | 안전한 code/field/bindingId. 각 nullable 필드는 null로 명시 |
| bindings | ViewAttributeSetting ID별 sourceScope, referenceAttributeIdPath, role, label, attributeType, isMultiselect, isHidden, width, format, currencyCode |
| summary | sourceItemCount/matchedItemCount/eligibleItemCount. Dashboard와 NEEDS_CONFIGURATION은 null |
| data | 타입별 결과. NEEDS_CONFIGURATION은 null |

matched는 저장 필터와 검색 후 원본 수, eligible은 해당 part의 표시 조건을 만족하는 원본 수다. 그룹/마커가 여러 개여도 원본 개수와 occurrence 개수를 혼동하지 않는다. 숨긴 그룹이 있으면 집계 타입의 matched와 eligible도 다를 수 있다.

Item은 itemKey, occurrenceKey, recordDefinitionId, objectDefinitionId, listEntryDefinitionId, title, cells, groupPath를 가진다. List의 itemKey는 Entry 기반이다. 같은 Record를 가리키는 두 Entry를 합치지 않는다.

Cell은 bindingId, state(VALUE/EMPTY/INVALID/UNAVAILABLE), values 배열이다. 각 value는 valueDefinitionId, sourceEntity(kind/id), 타입별 value를 가진다. EMPTY라도 기존 직접 셀의 식별자를 보존하기 위해 value:null 행이 있을 수 있다. 필터·집계에서는 null 행을 값으로 세지 않는다. 참조 누락/권한 밖 대상은 해당 대상 ID·이름을 공개하지 않는다.

숫자/통화는 Decimal 문자열, Date는 YYYY-MM-DD, Timestamp는 UTC ISO다. Select/Status는 id/label/color, RecordReference는 recordDefinitionId/objectDefinitionId/label, ActorReference는 actorId/label, PersonalName은 displayName, Location은 text/latitude/longitude, Interaction은 summary/occurredAt이다. 로컬 사용자 데이터로 계산한 라벨을 임의 첫 Text 속성에서 고르지 않는다.

## MAIN 데이터

모든 MAIN data에는 presentation이 있다. PageInfo는 hasNextPage/nextCursor이다.

| 타입 | data 필드 |
| --- | --- |
| TABLE | columnBindingIds, items, groups, pageInfo |
| KANBAN | groupDefinitionId, columns, unassignedCount. 각 column은 그룹 메타데이터·groupToken·items·pageInfo·calculations |
| LIST | items, groups, pageInfo |
| GALLERY | cards(item/body/image), pageInfo. image는 src/alt 또는 null |
| CALENDAR | range, events, unscheduledCount, invalidDateCount, pageInfo |
| TIMELINE | range, bars, groups, unscheduledCount, invalidDateCount, pageInfo |
| GANTT | range, tasks, dependencies, groups, unscheduledCount, invalidDateCount, pageInfo |
| CHART | metric, categories, series, points, total |
| PIVOT | metric, rowDimensions, columnDimensions, cells, rowTotals, columnTotals, grandTotal |
| MAP | bounds, markers, list, unlocatedCount. markers/list는 각각 pageInfo |
| DASHBOARD | widgets, visibleWidgetCount |

range는 startDate/endDateExclusive/timeZone이다. Event는 item/dateKind/start/end/endInclusive이다. Gantt task에는 progress(rawValue/valueScale/ratio 또는 null)가 추가된다. Dependency는 id/type/source/target/offset/renderable이다. 페이지 밖 또는 중복 Entry로 모호한 endpoint는 itemKeys=[]이며 선을 그리지 않는다. 필터 밖 endpoint가 있는 관계는 제외한다.

Metric은 aggregation, bindingId, currencyCode, missingValueItemCount이다. aggregation은 COUNT_ITEMS/COUNT_VALUES/SUM/AVG/MIN/MAX다. Aggregate는 value(Decimal string|null), itemCount, valueCount이다. COUNT_ITEMS가 기본 계산이며 MEASURE는 다른 계산에 필요하다. AVG는 셀 평균의 평균이 아니라 원본 값으로 계산한다. SUM/MIN/MAX는 정확한 십진수, AVG/비율은 소수10자리 반올림이다.

차원 key는 표시 이름과 분리한 identity 기반이다. 피벗은 sparse cell: 조합 없음, value=null, 실제 "0"을 구분한다. 합계는 필터 후 원본 Entry 기여에서 각각 계산한다.

Widget은 id/title/showTitle/layout/content/state이다. state는 READY/UNAVAILABLE/CYCLE/NEEDS_CONFIGURATION. 불가 원본은 content=null. 직접 자기 참조는 CYCLE, 초기 지원 범위 밖 중첩 Dashboard/이중 소속 child는 NEEDS_CONFIGURATION이다. 일반 View child는 각자 같은 GET을 호출한다. 숨긴 위젯은 반환하지 않는다.

부분 결과: GROUP_ITEMS는 groupKey/groupToken/items/pageInfo, MAP_MARKERS는 marker items/pageInfo, 나머지 부분 결과는 items/pageInfo다.

## 지원 범위와 실패

초기 지원: TABLE/LIST 최대3단계 그룹, KANBAN Select/Status 단계 하나, CHART 범주 하나+선택 계열 하나, PIVOT 행 기준 하나/열 기준 하나. 여러 피벗 축, 역할 모호함, 지원하지 않는 타입·config는 NEEDS_CONFIGURATION이다. 미지원 설정을 조용히 무시해 성공하지 않는다.

문자열/숫자/날짜/체크/옵션·참조에 맞는 eq/neq/gt/gte/lt/lte/contains/starts_with/ends_with/in/not_in/is_empty/is_not_empty를 지원한다. 여러 루트 AND, 빈 그룹은 조건 없음, 비어 있는 집합의 ALL은 false다. 정렬 nulls FIRST/LAST, 기본LAST. 다중값 정렬은 명시 reducer MIN/MAX가 필요하다.

공개 오류:401 인증,404 Workspace 또는 View 접근/존재 부재,400 입력,409 ViewDataCursorStale,422 ViewDataQueryLimitExceeded,503 ViewDataQueryTimedOut,500 ViewDataConfigurationInvalid. FE 표시 안내 코드는 SOURCE_REQUIRED/ROLE_REQUIRED/ROLE_AMBIGUOUS/ROLE_TYPE_UNSUPPORTED/DATE_END_POLICY_REQUIRED 및 *_UNSUPPORTED 계열이다. 저장 필터 그래프 손상·교차 소속은500이다.

## 실행 한도와 페이지 일관성

모든 소유 query는 읽기 전용 RepeatableRead context를 공유한다. transaction20초/statement15초/대기5초. 원본250개 배치, 원본5,000개, 값100,000개, 참조Record2,000개/경로3hop, 설정 테이블별500개, 그룹200개, 피벗10,000조합, 마커20,000개, 위젯50개, 응답5MiB 상한이다. 초과 시 전체 요청을 실패시켜 부분 합계를 반환하지 않는다.

초기 구현은 제한된 전체 원본 스캔 후 메모리 필터·정렬·집계다. 대규모 SQL pushdown 또는 무제한 조회로 설명하지 않는다.

Cursor는 AES-256-GCM으로 보호한30분 만료 offset이며 사용자/Workspace/View/source/part/그룹/검색/기간/좌표/설정 식별값에 결합된다. 요청 간 고정 DB snapshot은 제공하지 않으므로 다른 사용자의 원본 변경에는 재시작이 필요할 수 있다. 설정 변경409는 첫 페이지부터 재조회한다.

## 응답 예제

[examples](examples/)의11개 JSON은 가상 데이터 계약 예제다. 실제 업무 데이터나 배포된 API 결과가 아니다. 날짜 READY 예제는 테스트에서 종료일 포함 정책을 명시한 결과다. 현재 제품 기본값 미확정 상태의 HTTP 응답과 혼동하지 않는다.
