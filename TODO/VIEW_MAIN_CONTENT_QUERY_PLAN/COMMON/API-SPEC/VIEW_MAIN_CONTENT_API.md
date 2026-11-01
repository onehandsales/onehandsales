# TABLE·KANBAN·LIST 주 화면 API

계약 상태: implemented (2026-11-01, TABLE/KANBAN/LIST Backend). 단위·HTTP 및 격리 PostgreSQL17.10을 포함한 전체69 suites/551 tests 검증 완료. 대규모 실행 계획·부하 검증은 [구현 검토](../IMPLEMENTATION_REVIEW.md)에 구분한다.
소비자: User Web. Backend는 기존 endpoint/응답을 유지하는 추가 API이며 schema/migration 변경은 없다. 2026-11-01 추가 승인으로 TABLE/KANBAN/LIST의 User Web 본문 연결을 구현했으며 기존 GET 계약을 그대로 소비한다.
Request DTO: GetWorkspaceViewMainContentQueryDto. Response DTO: WorkspaceViewMainContentResponse.

## 1. 경로와 입력

GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data

Bearer Authorization 필수, 기존 AuthGuard와 CurrentUserContext 사용. workspaceId/viewDefinitionId는 필수 UUID, null/빈 값 불가. x-request-id는 기존 middleware 규격. Cookie 신규 계약 없음. Body는 미전송/빈 객체만 허용한다. 미정의 query와 배열/중복 scalar는 400이다.

Authorization은 필수 string `Bearer <accessToken>`이며 null/빈 값 불가다. x-request-id는 선택 string이며 trim 후1~128자면 재사용하고 미전송/빈 값/초과 길이는 middleware가 새 UUID로 바꾼다. 선택 query의 미전송(undefined)은 아래 기본 동작이다. HTTP query의 문자 `null`은 JSON null이 아니며 q에서는 검색어, enum·정수·token에서는 각 validation 대상이다. 예: `?part=MAIN&sourceType=LIST&limit=25&q=Acme`.

| Query | 타입 | 기본/검증 |
| --- | --- | --- |
| sourceType | 선택 OBJECT/LIST | FK 하나면 유도, 둘이면 필수. 선택 FK가 없으면 400. 소속 0개면 설정 부족 |
| part | 선택 MAIN/GROUP_ITEMS | MAIN 기본. GROUP_ITEMS는 KANBAN 전용 |
| q | 선택 string | 최대200, trim/NFC/대소문자 무시. 빈 문자열은 검색 없음 |
| limit | 선택 integer | 기본25, 1~100. 칸반 MAIN은 열별 limit |
| cursor | 선택 string | 길이1~2048. TABLE/LIST MAIN 또는 KANBAN GROUP_ITEMS에 사용 |
| groupToken | 선택 string | 길이1~2048. GROUP_ITEMS에서만 필수 |

KANBAN MAIN의 cursor는 400. 날짜창/지도/override 등 추가 입력은 400. 나머지 8타입은 422 ViewDataTypeUnsupported. GET으로 View/값/Actor/기본 보기/이력을 생성하거나 갱신하지 않는다.

초기 조회 예: `.../data?limit=25`. 일반 행의 다음 페이지: `.../data?limit=25&cursor=<nextCursor>`. 칸반 열의 다음 페이지: `.../data?part=GROUP_ITEMS&limit=25&groupToken=<column.groupToken>&cursor=<column.pageInfo.nextCursor>`. q/sourceType을 지정했다면 다음 요청에도 동일하게 전달한다. 접힌 칸반 열의 첫 조회에는 cursor 없이 groupToken만 전달한다.

## 2. 공통 응답

200 OK, wrapper 없이 JSON body. 다음 필드는 항상 존재한다.

| 필드 | 타입·nullable | 의미 |
| --- | --- | --- |
| viewDefinitionId/viewName/viewType | UUID/string/TABLE·KANBAN·LIST | 선택한 저장 View |
| source | object | kind OBJECT/LIST/NONE, objectDefinitionId/listDefinitionId nullable UUID, itemKind RECORD/LIST_ENTRY/null. 선택 소속만 표시 |
| configurationFingerprint | string | 설정/메타데이터 식별값. DB revision이나 업무 데이터 snapshot ID가 아님 |
| part | MAIN/GROUP_ITEMS | 응답 구분 |
| state | READY/NEEDS_CONFIGURATION | 미지원/누락 설정은 NEEDS_CONFIGURATION |
| issues | object[] | code:string, field:string 또는 null, bindingId:UUID 또는 null. 값·설정 원문 없음 |
| bindings | Binding[] | 표시 설정의 행 ID별 메타데이터. 숨김 metadata도 보존 |
| summary | object 또는 null | sourceItemCount/ matchedItemCount/ eligibleItemCount. 모두 고유 원본 수, 페이지 길이와 구분 |
| data | 타입별 object 또는 null | NEEDS_CONFIGURATION에서는 null, summary=null, bindings=[] |

Binding: id(표시 설정 PK), attributeDefinitionId, sourceScope(RECORD/LIST_ENTRY), referenceAttributeIdPath(UUID[]), role, label, attributeType, isMultiselect, isHidden, width(nullable integer), format(nullable JSON), currencyCode(nullable string).
Item: itemKey(RECORD:id 또는 LIST_ENTRY:id), occurrenceKey(같은 항목의 그룹별 표시 위치), recordDefinitionId, objectDefinitionId, listEntryDefinitionId(nullable), title, cells[], groupPath(string[]).
Cell: bindingId, state(VALUE/EMPTY/INVALID/UNAVAILABLE), values[]. 각 값은 valueDefinitionId, sourceEntity:{kind:RECORD/LIST_ENTRY,id}, value(JSON)다. 다중값과 출처를 보존하고 숨긴 binding의 cell은 응답하지 않는다.
PageInfo: hasNextPage:boolean, nextCursor:string 또는 null. 마지막 페이지는 false/null.
Group: key(string), parentKey(string 또는 null), label, color(nullable), count(number), isHidden, isFold.

값: Decimal은 정밀도 보존 문자열, Date는 YYYY-MM-DD, Timestamp는 UTC ISO다. Checkbox false와 숫자0은 값이다. Select/Status는 {id,label,color}, RecordReference는 {recordDefinitionId,objectDefinitionId,label}, ActorReference는 {actorId,label}; label은 null 가능. Actor label은 Workspace 소유 Actor.displayNameSnapshot이며 현재 User 이름과 다를 수 있다. 불가 참조 ID/라벨을 노출하지 않는다. PersonalName은 displayName, Location은 text/latitude/longitude, Interaction은 summary/occurredAt의 허용 필드만 반환한다.

format은 표시 힌트이며 원본 수치·날짜를 문자열로 꾸미지 않는다. 허용 키는 style/dateFormat/timeFormat/currencyDisplay(문자열), fractionDigits(0~10 정수), valueScale(1 또는100)다. style=PERCENT이면 valueScale 필수다. 그 외 키·중첩 형식은 NEEDS_CONFIGURATION이다. 날짜 형식 문자열을 실행하는 것은 후속 FE 책임이다.

## 3. 타입별 data

| 타입/part | 필드 |
| --- | --- |
| TABLE MAIN | presentation:{rowDensity}, columnBindingIds:string[], items:Item[], groups:Group[], pageInfo |
| LIST MAIN | presentation:{rowDensity}, items:Item[], groups:Group[], pageInfo |
| KANBAN MAIN | presentation:{cardDensity,showEmptyGroups}, groupDefinitionId, columns:Column[], unassignedCount |
| KANBAN GROUP_ITEMS | groupKey, groupToken, items:Item[], pageInfo |

Column은 Group + groupToken + items + pageInfo + calculations다. calculations는 이번 계약에서 []이며 합계 실행은 후속이다. 숨긴/접힌 열도 metadata·count·token을 유지하고 MAIN의 items=[]/false-null pageInfo로 시작한다. 접힌 열은 GROUP_ITEMS로 읽을 수 있다. 숨긴 열의 GROUP_ITEMS는 설정 안내로 처리한다. 미지정 그룹은 값 없음 전용 key로 분리한다.

rowDensity/cardDensity는 COMFORTABLE/COMPACT/null, showEmptyGroups는 boolean/null이다. 저장하지 않은 옵션은 null이며 기본값을 저장값처럼 채우지 않는다. showEmptyGroups=true일 때 옵션의 빈 칸반 열도 포함한다. TABLE 열은 TITLE/DISPLAY, LIST는 TITLE/DISPLAY/BODY, KANBAN은 TITLE/DISPLAY 역할을 지원한다. 다른 역할/계열/집계 설정을 무시하지 않고 NEEDS_CONFIGURATION으로 알린다.

## 4. 실행 의미와 지원표

- Object 원본은 Record, List 원본은 Entry다. RECORD scope는 List에서 연결 Record를 읽는다는 뜻이며 Entry 둘을 합치지 않는다. 혼합 Object List를 금지하지 않는다. 특정 속성 적용 불가는 EMPTY 표시이며 해당 속성의 필터는 false다.
- View 양쪽 FK를 임의 XOR로 금지하지 않는다. 멤버십·View·선택 소속·각 참조의 Workspace를 확인한다. 다른 소속을 묵시적으로 우선하지 않는다.
- TITLE는 명시 표시 설정을 사용한다. 복수 TITLE는 설정 안내. 없거나 비면 사용자용 이름 없는 기록. 참조 라벨은 같은 Object의 직접 RECORD TITLE가 하나의 속성으로 수렴할 때 사용하고, 모호하면 null이다. 임의 첫 Text 선택 없음.
- 참조 경로는 RecordReference를 순서대로 따라간다. typed FK와 JSON alias(recordDefinitionId/targetRecordDefinitionId, objectDefinitionId/targetObjectDefinitionId, actorId/targetActorId)를 검증하며 충돌은 INVALID다. 삭제·다른 Workspace의 참조를 JSON으로 부활시키지 않는다.
- 비교/정렬/그룹에 필요한 값이 INVALID/UNAVAILABLE이면 설정 오류로 종료한다. 표시 전용 cell은 해당 상태로 반환할 수 있다.

| 연산자 | 지원 속성 | 비교값 |
| --- | --- | --- |
| eq/neq/in/not_in | 문자열형, 수치형, Checkbox, Date/Timestamp, Select/Status/RecordReference/ActorReference | {value:scalar} 또는 in계열 {values:scalar[]} |
| gt/gte/lt/lte | Number/Currency/Rating/Date/Timestamp | Decimal/날짜/시각 문자열 |
| contains/starts_with/ends_with | Text/Domain/EmailAddress/PhoneNumber/PersonalName | 문자열 |
| is_empty/is_not_empty | 모든 표시 지원 타입 | 비교값 없음 |

Decimal 비교값은 문자열을 사용한다(기존 seed 규격). 옵션/참조는 UUID로 비교하고 존재·속성 소속을 검증한다. 문자열 eq는 NFC·대소문자 구분, contains계열과 q는 NFC·대소문자 무시다. Date 실재 날짜/UTC instant 검증, Timestamp 비교는 epoch 기준이다. is_empty는 누락/all-null/빈 문자열, 빈 참조 집합을 대상으로 하며 false/0은 포함하지 않는다. ANY는 하나 이상, ALL은 값이 있고 모두 참. 여러 루트는 AND, 빈 그룹은 중립, 순환/끊긴 부모는 오류다. 조건 간 참조 대상 공유는 강제하지 않으며 각 조건의 ANY/ALL을 독립 평가한다. 현재 사용자/상대 날짜/과거 상태 토큰은 후속이다.

정렬은 저장 우선순위, 타입별 실제 값 비교, nulls FIRST/LAST(미지정 LAST), 동률은 createdAt ASC/itemKey ASC다. 옵션/참조는 표시 이름을 비교한다. 다중값은 sort.configJson.reducer=MIN/MAX가 필요하다. Location/Interaction 정렬은 미지원 안내다. 날짜/시각은 문자열 locale순이 아니라 시간값/날짜순으로 비교한다.

q는 저장 필터와 AND이며 보이는 제목/문자열형/옵션·참조 이름을 검색한다. 숫자/JSON 원문을 문자열화해 검색하지 않는다.

TABLE/LIST는 GROUP 역할로 최대3단계 그룹을 지원한다. 다중값은 값 identity별 그룹에 항목을 나타내고 occurrenceKey를 구분한다. count/summary는 고유 원본 기준이다. Date/Timestamp 그룹은 configJson.dateUnit DAY/MONTH/YEAR를 명시하고 Timestamp는 사용자 시간대로 묶는다. 수치 구간/복합 Location·Interaction 그룹은 후속이다. KANBAN은 하나의 Status/Select 그룹을 지원하며 다중 단계값은 명시 안내로 보류한다. 개별 그룹 설정은 옵션 또는 groupKeyJson.value의 scalar/참조 ID에 대응한다. 표시명·순서·숨김·접힘을 보존한다. 숨김은 권한이 아니다.

Group.configJson은 날짜형의 dateUnit만 실행한다. GroupSetting.configJson은 null/빈 객체만 지원하며 추가 집계·실행 설정이 있으면 NEEDS_CONFIGURATION이다. 칸반 합계·수치 구간을 임의로 계산하지 않는다.

## 5. 페이지·일관성·상한

조건 평가와 전역 정렬 후 페이지를 만든다. 칸반은 열별 독립 cursor이고 일반 그룹은 occurrence 기준이다. token은 AES-256-GCM 암호화, 기존 APP_JWT_SECRET에서 용도별 key 유도, 30분 만료, 최대2048자다. 사용자/Workspace/View/source/q/설정/part/그룹에 결합한다. 설정 변경은409, 다른 조회 맥락/위조/만료는400. 다음 페이지는 마지막 항목 anchor를 찾아 이어 읽으며 anchor가 사라지거나 변경되면409다. 페이지 사이 업무 데이터 snapshot은 보장하지 않는다.

원본 ID250개 배치, 원본 최대5000, 참조 경로3hop, 추가 참조 Record2000, 값100000, 설정 테이블별500행, 속성/제목 후보500개, 옵션10000, 관계2000, 그룹200, 표시 occurrence20000, 원본 수×고유 실행 필드 수250000, 응답5MiB. 초과하면422로 종료하며 잘린 결과/부분 합계를200으로 보내지 않는다. 제목 후보는 현재 Workspace 전체 기준이므로 선택 View와 무관한 TITLE 설정도 해당 상한에 포함된다. 한 요청의 read-only RepeatableRead transaction은 최대20초, statement15초, pool 대기5초다. 메모리에 제한된 전체 후보를 모아 계산하는 초기 구현이며 대량 SQL pushdown/신규 인덱스는 후속 측정 대상이다.

Transaction: 필요. application이 ReadSnapshotRunner로 경계를 시작하고 모든 소유 query Port가 같은 context를 전달한다. 변경 model/업무 rollback 없음, 실패하면 읽기만 종료한다. 외부 Provider 없음. Idempotency/outbox: 쓰기 없는 조회이므로 불필요. 로그도 업무 DB에 삽입하지 않는다.

## 6. 오류·관측성

| 상황 | HTTP / code | FE 처리 / 로그 |
| --- | --- | --- |
| 인증/활성 상태 | 기존401/403 | 기존 refresh/로그인, 기존 인증 로그 |
| Workspace 없음·비멤버 | 404 ViewDataWorkspaceNotFound | 접근 불가, info |
| View 없음·타 Workspace | 404 ViewDataViewNotFound | 선택 갱신, info |
| query/UUID/body/token 맥락 오류 | 400 기존 ValidationError/Nest validation | 입력 수정, warn |
| 미구현8타입 | 422 ViewDataTypeUnsupported | 미지원 안내, warn |
| cursor 이후 설정/anchor 변경 | 409 ViewDataCursorStale | page 초기화 후 재조회, info |
| 한도 초과 | 422 ViewDataQueryLimitExceeded | 조건 축소, warn |
| snapshot/statement timeout | 503 ViewDataQueryTimedOut | 제한된 재시도, warn |
| 참조/필터 구조/값 무결성 손상 | 500 ViewDataConfigurationInvalid | 안전한 오류, error |

누락 역할/명시 미지원 규칙은 200 NEEDS_CONFIGURATION과 안전한 issue로 구분한다. 오류 envelope는 기존 HttpExceptionFilter를 사용한다. 새 code는 명시 status 매핑과 HTTP 테스트를 추가한다. Nest 오류는 기존 {statusCode,error:<Nest response>}, Domain 오류는 {statusCode,error,message}다.

Event: view.data.read_completed / view.data.read_failed. requestId/userId/workspaceId/viewDefinitionId/viewType/part/state/durationMs/count/errorCode만 기록한다. q/비교값/셀 원문/설정JSON/token/DB URL/provider 오류 원문은 기록하지 않는다. module/port/adapter·snapshot·HTTP·실행 경계·회귀 검증은 현재 구현 검토 문서에 기록한다.

## 7. 응답 예제

[TABLE](examples/TABLE.response.json), [KANBAN](examples/KANBAN.response.json), [LIST](examples/LIST.response.json)는 실제 실행기와 단위 fixture(Entry3개/Record2개)로 생성한 예제다. 실제 업무 DB의 조회 결과가 아니다. KANBAN groupToken의 example-group-N은 읽기 쉬운 자리표시자이며 실제 요청에는 서버가 발급한 token을 사용한다. 다른 8타입 JSON은 후속 참고 자료다.

## 8. DB 연결

기준은 [현재 Prisma schema](../../../../BE/prisma/schema.prisma), [DB 현황](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [List/View SQL 기준](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md)이다. 기존 PK·FK·CHECK·다중값 구조를 유지한다.

| 저장 모델 | 실행/응답 연결 |
| --- | --- |
| ViewDefinition | 선택 View 이름·type·source FK·presentation config |
| ViewAttributeSettingDefinition | bindings·열 순서/너비/표시명·TITLE/DISPLAY/BODY·숨김·형식 |
| ViewFilterGroupDefinition + ViewFilterConditionDefinition | 저장 조건 트리·연산자·ANY/ALL 실행 |
| ViewSortDefinition | sourceScope/참조 경로별 정렬 우선순위·방향·null/reducer |
| ViewGroupDefinition + ViewGroupSettingDefinition | 그룹 기준·건수·표시명/순서/숨김/접힘 |
| RecordDefinition + RecordAttributeValueDefinition | Object 원본 및 List의 RECORD scope 값 |
| ListDefinition + ListEntryDefinition + ListEntryValueDefinition | List 원본 Entry 및 LIST_ENTRY scope 값 |
| AttributeDefinition + SelectOption + StatusOption + RelationshipDefinition | 타입·옵션 표시·참조 경로의 소속 검증 |
| WorkspaceMember + Actor | 사용자 접근 확인·Workspace 소유 Actor 표시 snapshot |

ViewWidgetDefinition/ViewWorkDependencyDefinition/ViewFavoriteDefinition은 이번 본문 조회 원본으로 읽지 않는다. 소유 Port와 임시 관계 소유권·인덱스 검토는 [Backend 규칙 검토](../../BE-TODO/BACKEND_RULE_COMPLIANCE_REVIEW.md)에 둔다. List에서 같은 Record에 연결된 Entry를 합치거나 새로운 UNIQUE 정책을 확정하지 않는다.
