# 보기 설정 편집·저장 API

계약 상태: implemented (2026-11-12, 사용자 승인 범위의 구현·재검토 반영)
작성 기준: [TODO Software Agent Reference](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md).
소비자: User Web. 기존 메뉴 GET·본문 GET·컬럼 표시명 PATCH는 호환 유지한다.
새 보기 복사와 나머지 8개 보기 타입은 이번 범위에 포함하지 않는다.

## 사용자 행동

TABLE/KANBAN/LIST의 필터·정렬·표시 설정과 컬럼 표시명·너비·순서·숨김을 하나의 임시 상태로 편집한다. 변경은 서버 미리보기에 반영하고 `보기 설정 저장`으로 함께 저장한다. `변경 되돌리기`는 DB 변경 없이 저장 상태로 돌아간다. 저장 실패/409에서는 임시 입력을 유지한다. 저장한 설정은 같은 View 접근자에게 공통 적용된다. 문구는 해요체, 다이얼로그 닫기는 `닫기`다.

## 경로와 DTO

공통 경로: `/api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId`.
Bearer 필수, 두 경로 ID는 UUID. x-request-id는 기존 규격. 새 cookie 없음.
sourceType query는 선택 OBJECT/LIST이며 두 소속 View에서는 필수다. 잘못된 소속은400이다.

| Method/path | Request DTO | Response DTO / 성공 |
|---|---|---|
| GET /configuration | ViewConfigurationQueryDto | WorkspaceViewConfigurationResponse /200 |
| GET /configuration/options | ViewConfigurationOptionsQueryDto | WorkspaceViewConfigurationOptionsResponse /200 |
| POST /data/preview | PreviewViewConfigurationDto | WorkspaceViewMainContentResponse /200 |
| PATCH /configuration | UpdateViewConfigurationDto | WorkspaceViewConfigurationResponse /200 |

GET body 없음. PATCH/POST body는 `{baseConfigurationVersion:string, changes:ViewConfigurationChanges}`. POST에는 선택 `query`가 있고 기존 본문 query의 part/q/limit/cursor/groupToken 규격을 재사용한다. sourceType은 URL query로 통일한다.
baseConfigurationVersion은 필수 비어 있지 않은 서버 토큰이다. 전달하지 않은 section은 유지한다. changes는 filters/sorts/settings 중 하나 이상을 포함하며 null을 허용하지 않는다. 포함한 section은 완성된 교체 상태다. []는 모두 해제다.

공개 행은 [기존 메뉴 응답 계약](../../../DONE/VIEW_HEADER_MENU_QUERY_PLAN/COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md)을 재사용한다. 아래 표는 쓰기에 허용하는 필드를 한정한다. 미리보기의 본문 응답·타입별 실행은 [본문 조회 계약](../../../DONE/VIEW_MAIN_CONTENT_QUERY_PLAN/COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)을 따른다.

- filters: viewFilterGroupDefinitions[], viewFilterConditionDefinitions[] (둘 다 필수)
- sorts: viewSortDefinitions[] (필수)
- settings: configJson(null 또는 허용 object), viewAttributeSettingDefinitions[], viewGroupDefinitions[], viewGroupSettingDefinitions[] (모두 필수)
- 행 필드: 기존 VIEW_HEADER_MENU_QUERY 계약의 공개 필드와 동일. workspaceId/viewDefinitionId/createdAt/Actor 등 내부 필드는 받지 않는다.
- 새 행 id는 FE 생성 UUID, 기존 행 ID는 유지한다. 다른 View의 ID를 재사용할 수 없다. sortOrder는0 이상의 정수이며 저장 시 배열 순서와 별개로 명시값을 사용한다.
- labelOverride: null이면 원본 표시명, 문자열은 trim 후 비어 있으면422. width:null 또는1~2000 정수. 행 UUID는 소문자 표준형을 사용한다. JSON은 기존 실행기가 지원하는 키만 허용한다.
- 배열별 최대500, 참조 경로 최대3. 숫자/금액 비교값은 문자열, Date는 날짜 전용, Timestamp는 UTC ISO. 지원 연산자·정렬·그룹은 기존 본문 실행 계약과 같다.

응답 WorkspaceViewConfigurationResponse: configurationVersion:string, filters:기존 필터 메뉴 응답, sorts:기존 정렬 메뉴 응답, settings:기존 설정 메뉴 응답, candidates:선택 원본에서 사용할 수 있는 속성 메타데이터[]. 내부 audit 필드는 노출하지 않는다. configJson·labelOverride·width·formatJson 등 nullable 규격은 기존 메뉴와 동일하다.
preview는 기존 본문 응답을 그대로 반환한다. configurationFingerprint와 cursor에는 임시 설정도 반영된다. 저장 버전과 본문 fingerprint는 별개다. 다음 페이지에 동일 changes/query 맥락을 전송한다.

옵션 query: sourceScope(RECORD/LIST_ENTRY)·attributeDefinitionId(UUID) 필수, referenceAttributeIdPath는 쉼표로 연결한 최대3 UUID(생략은 직접 속성), q는 선택 최대200/빈 값은 검색 없음, cursor는 선택 UUID, limit은 기본25/1~100. 응답 `{items:[{id,label,color:null|string}],pageInfo:{hasNextPage,nextCursor:null|string}}`. 원본/경로/속성·참조 대상 소속을 검증하고 Select/Status/ActorReference/RecordReference의 후보를 공개 port로 조회한다.

## 요청·응답 필드 상세

| API 식별자 / 이름 | HTTP | Request → Response | 성공 |
|---|---|---|---|
| VIEW_CONFIGURATION_GET / 저장 기준 조회 | GET configuration | ViewConfigurationQueryDto → WorkspaceViewConfigurationResponse | 200, JSON body 있음 |
| VIEW_CONFIGURATION_OPTIONS / 선택 후보 조회 | GET configuration/options | ViewConfigurationOptionsQueryDto → WorkspaceViewConfigurationOptionsResponse | 200, JSON body 있음 |
| VIEW_CONFIGURATION_PREVIEW / 임시 설정 실행 | POST data/preview | PreviewViewConfigurationDto → WorkspaceViewMainContentResponse | 200, JSON body 있음 |
| VIEW_CONFIGURATION_UPDATE / 설정 일괄 저장 | PATCH configuration | UpdateViewConfigurationDto → WorkspaceViewConfigurationResponse | 200, JSON body 있음 |

| 위치 / 필드 | 타입 | 필수 / null / 빈 값 | 검증·의미 |
|---|---|---|---|
| path.workspaceId, viewDefinitionId | UUID string | 필수 / 불가 / 불가 | 경로 소속 검증, 내부 소문자 정규화 |
| header.Authorization | Bearer string | 필수 / 불가 / 불가 | 기존 AuthGuard와 session 검증 |
| header.Content-Type | string | POST/PATCH 필수 | application/json |
| header.x-request-id | string | 선택 | trim 후 1~128자 사용, 없거나 부적합하면 서버 생성, 응답 헤더로 반환 |
| query.sourceType | OBJECT 또는 LIST | 선택 / 불가 / 불가 | 양쪽 소속이면 필수, 네 API 공통 |
| body.baseConfigurationVersion | string | 필수 / 불가 / 불가 | 길이 1~128, GET이 준 불투명 버전 |
| body.changes | object | 필수 / 불가 / {} 불가 | filters/sorts/settings 중 하나 이상, 미전달 section 보존 |
| body.query | object | preview만 선택 / 불가 / {} 허용 | 아래 본문 페이지 조건, sourceType은 URL에만 허용 |
| body.query.part | MAIN 또는 GROUP_ITEMS | 선택 / 기본 MAIN | GROUP_ITEMS는 KANBAN만 허용 |
| body.query.q | string | 선택 / 빈 문자열 허용 | 최대 200자, trim 후 검색 |
| body.query.limit | integer | 선택 | 1~100, 기본 25 |
| body.query.cursor, groupToken | string | 선택 / 빈 문자열 불가 | 1~2048자, 기존 본문 token; GROUP_ITEMS는 groupToken 필수 |
| options query.sourceScope | RECORD 또는 LIST_ENTRY | 필수 | 원본과 속성 경로 검증 |
| options query.attributeDefinitionId | UUID string | 필수 | 후보를 읽을 속성 |
| options query.referenceAttributeIdPath | string | 선택 / 빈 문자열 허용 | 쉼표로 연결한 최대 3 UUID, 최대 110자, 빈 값은 직접 속성 |
| options query.q | string | 선택 / 빈 문자열 허용 | 최대 200자 |
| options query.cursor | UUID string | 선택 / 빈 문자열 불가 | 마지막 후보 ID |
| options query.limit | integer | 선택 | 1~100, 기본 25 |

새 cookie는 없으며 refresh는 기존 인증 client 계약을 사용한다. GET body와 알 수 없는 query/body 필드는 거부한다. preview query의 선택 필드 null은 기존 DTO의 생략 처리와 동일하지만 새 client는 null을 보내지 않는다.

모든 설정 행의 아래 필드는 **해당 행에서 필수**다. nullable이라고 적힌 필드만 null을 허용한다. 행 내부의 알 수 없는 키는 422다. 배열은 각 500개 이하, 배열 내부 ID는 중복할 수 없다.

| 행 / 공통 필드 | 필드명: 타입·제약 |
|---|---|
| 모든 행 | id: 소문자 UUID; sortOrder: integer 0~2147483647 |
| 속성 참조 공통 | sourceScope: RECORD/LIST_ENTRY; attributeDefinitionId: 소문자 UUID; referenceAttributeIdPathJson: 소문자 UUID[] (0~3개) |
| viewFilterGroupDefinitions | parentViewFilterGroupDefinitionId: UUID 또는 null; conditionGroupOperator: AND/OR |
| viewFilterConditionDefinitions | 속성 참조 공통; viewFilterGroupDefinitionId: UUID; comparisonOperator: eq/neq/gt/gte/lt/lte/contains/starts_with/ends_with/in/not_in/is_empty/is_not_empty; comparisonValueJson: JSON; multiValueMatchMode: ANY/ALL |
| viewSortDefinitions | 속성 참조 공통; sortDirection: ASC/DESC; configJson: JSON 또는 null |
| viewAttributeSettingDefinitions | 속성 참조 공통; attributeDisplayRole: TITLE/DISPLAY/BODY; labelOverride: string 또는 null (trim 후 1~500자); width: integer 1~2000 또는 null; isHidden: boolean; formatJson: JSON 또는 null |
| viewGroupDefinitions | 속성 참조 공통; groupRole: GROUP; sortDirection: ASC/DESC; configJson: JSON 또는 null |
| viewGroupSettingDefinitions | viewGroupDefinitionId, attributeDefinitionId: UUID; statusOptionId, selectOptionId: UUID 또는 null (동시 지정 불가); groupKeyJson: JSON; labelOverride: string 또는 null; isHidden, isFold: boolean; configJson: JSON 또는 null |

JSON은 유한 숫자/문자열/boolean/null/배열/object만 허용하고 깊이 10 이하, 내부 배열 500개 이하다. prototype 관련 키는 거부한다. `comparisonValueJson`의 `{value:...}`와 `{values:[...]}`, 다중값 정렬의 configJson, 날짜 그룹의 `{dateUnit:"DAY"|"MONTH"|"YEAR"}`, 표시 formatJson의 유효 키·타입별 조합은 위 본문 조회 계약의 실행 규칙으로 다시 검사한다. 빈 값 연산자의 비교값은 null이다. View configJson은 해당 타입의 표시 설정만 허용하며 예시는 `{rowDensity:"COMFORTABLE"}`다.

| WorkspaceViewConfigurationResponse 필드 | 타입 / null | 내용 |
|---|---|---|
| configurationVersion | string / 불가 | 다음 쓰기·미리보기의 기준 버전 |
| candidates | Attribute[] / 불가 | 현재 선택 원본의 편집 후보, 없음은 [] |
| filters, sorts, settings | 각 메뉴 response object / 불가 | 아래 공통 메타데이터와 해당 section의 공개 행 |
| 각 메뉴.viewDefinitionId, viewType | UUID string, TABLE/KANBAN/LIST / 불가 | 현재 보기 식별과 유형 |
| 각 메뉴.attributeDefinitions | Attribute[] / 불가 | 저장된 참조와 후보 메타데이터 |
| filters.selectOptions, statusOptions / settings.selectOptions, statusOptions | Option[] / 불가 | 이름·색상 조회용 선택 옵션 |
| settings.viewName | string / 불가 | 보기 이름 |
| settings.objectDefinitionId, listDefinitionId | UUID string 또는 null | 원본 소속 |
| settings.configJson | JSON 또는 null | 보기 표현 설정 |
| settings.viewWidgetDefinitions, contentViewDefinitions | array / 불가 | 지원 세 타입에서는 [] |

Attribute는 `id:UUID, title:string, type:AttributeDefinitionType, objectDefinitionId:UUID|null, listDefinitionId:UUID|null, icon:string|null, isMultiselect:boolean, configJson:JSON`이다. Option은 `id:UUID, attributeDefinitionId:UUID, title:string, color:string|null, sortOrder:integer`다. 행 타입은 위 표와 같고 audit 필드는 없다. settings의 일반 배열과 filters/sorts 배열은 모두 항상 존재한다.

WorkspaceViewConfigurationOptionsResponse는 `items:{id:UUID,label:string|null,color:string|null}[]`, `pageInfo:{hasNextPage:boolean,nextCursor:UUID|null}`이다. 결과 없음은 items=[], hasNextPage=false, nextCursor=null이다. label이 null이면 FE는 내부 ID 대신 저장된 값 안내를 표시한다. preview의 모든 필드와 예시는 [WorkspaceViewMainContentResponse 계약](../../../DONE/VIEW_MAIN_CONTENT_QUERY_PLAN/COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)에 정의하며 임시 설정을 적용한 같은 shape를 반환한다.

저장 요청 예시: 현재 정렬 전체 해제 (다른 section 유지).

```http
PATCH /api/users/me/workspaces/00000000-0000-4000-8000-000000000001/view-definitions/00000000-0000-4000-8000-000000000002/configuration?sourceType=OBJECT
Authorization: Bearer <access-token>
Content-Type: application/json

{"baseConfigurationVersion":"<GET에서 받은 버전>","changes":{"sorts":{"viewSortDefinitions":[]}}}
```

미리보기는 같은 body에 `"query":{"part":"MAIN","q":"","limit":50}`를 추가해 POST data/preview로 보낸다. GET configuration은 같은 URL/query에 body 없이 요청한다. 옵션 조회 예시는 GET configuration/options?sourceType=OBJECT&sourceScope=RECORD&attributeDefinitionId=00000000-0000-4000-8000-000000000003&limit=25 이다.

설정이 비어 있는 TABLE의 GET 응답 예시 (GET은 편집을 위해 미설정 상태도 반환; 쓰기에서는 실행 가능 여부를 검증):

```json
{
  "configurationVersion": "<opaque-version>",
  "candidates": [],
  "filters": {"viewDefinitionId":"00000000-0000-4000-8000-000000000002","viewType":"TABLE","attributeDefinitions":[],"viewFilterGroupDefinitions":[],"viewFilterConditionDefinitions":[],"selectOptions":[],"statusOptions":[]},
  "sorts": {"viewDefinitionId":"00000000-0000-4000-8000-000000000002","viewType":"TABLE","attributeDefinitions":[],"viewSortDefinitions":[]},
  "settings": {"viewDefinitionId":"00000000-0000-4000-8000-000000000002","viewType":"TABLE","attributeDefinitions":[],"viewName":"전체 회사","objectDefinitionId":"00000000-0000-4000-8000-000000000004","listDefinitionId":null,"configJson":null,"viewAttributeSettingDefinitions":[],"viewGroupDefinitions":[],"viewGroupSettingDefinitions":[],"selectOptions":[],"statusOptions":[],"viewWidgetDefinitions":[],"contentViewDefinitions":[]}
}
```

PATCH 성공은 같은 response shape와 확정 버전을 반환한다. 옵션 응답 예시: `{"items":[],"pageInfo":{"hasNextPage":false,"nextCursor":null}}`.

## 권한·검증·저장

현재 사용자 멤버십과 View의 Workspace를 검증하고 기존 수정 API의 Actor를 사용한다. OWNER 전용 등 새 접근 제약은 만들지 않는다. 각 설정 ID·속성·옵션·그룹 참조의 Workspace/View/source 일치, 경로 연결, 필터 순환·부모·비교값, 지원 역할/설정 키를 검증한다. 데이터가0건이어도 설정 검증을 생략하지 않는다.

View module application이 orchestration owner다. 다른 module은 공개 query port만 사용한다. 읽기는 ReadSnapshotRunner, 저장은 TransactionManager를 사용한다. 저장은 기존 컬럼 쓰기와 같은 READ COMMITTED View 행 잠금 후 최신 설정 버전을 비교한다. 버전은 공개 설정과 View type/source를 정규화한 fingerprint로 계산한다. 자식 변경을 감지하므로 root.updatedAt에 의존하지 않는다.

실제 변경한 행만 생성/수정/삭제하고 기존 PK·createdAt·생성 Actor를 보존한다. 부모/조건·그룹/개별 설정 FK 순서를 고려한다. 삭제 대상은 전달한 section에 한정하며 다른 View의 행은 건드리지 않는다. 실패 시 전체 rollback이다. 동일한 section 상태의 재요청은 no-op 성공으로 처리한다. 기준 버전이 다르고 원하는 상태도 다르면409. stale 요청을 자동 덮어쓰지 않는다.

## 대표 이름 분리·DB

설정 저장 대상은 기존7개 View 테이블이다. 대표 이름 분리를 위해 ObjectDefinition.recordTitleAttributeDefinitionId(nullable UUID)를 추가한다. 새 Object는 초기 이름 속성을 같은 생성 transaction에서 대표 이름으로 지정한다. 기존 Object는 같은 Workspace/Object의 직접 RECORD TITLE가 하나의 Text/PersonalName 속성으로 수렴할 때만 migration에서 연결한다. 후보가 없거나 모호하면 null을 유지하며 임의 첫 Text/slug를 선택하지 않는다. 연결 이름 조회는 Object 소유 공개 query port만 사용하고 View TITLE·숨김에 의존하지 않는다. canonical 속성의 실제 값 수정은 연결 이름에 반영된다. 대표 속성 자체를 바꾸는 설정 UI는 이번 범위가 아니다.

대표 속성 FK는 nullable이며 삭제 시 해당 포인터만 해제한다. 소속은 application/query에서 검증한다. migration은 컬럼/관계 추가와 안전한 backfill이며 기존 업무값을 수정/삭제하지 않는다. 배포 순서는 migration → Backend → Frontend다. View 설정 저장 자체는 Object 대표 속성을 변경하지 않는다.

## 오류·관측성

기존 HttpExceptionFilter envelope 사용.400 ValidationError/DTO 오류는 입력 수정,401/403은 기존 인증 복구,404 ViewConfigurationNotFound는 접근 불가,409 ViewConfigurationConflict는 임시 변경 유지·최신 설정 다시 읽기,422 ViewConfigurationInvalid는 해당 설정 수정,422 ViewDataTypeUnsupported/한도 초과는 지원 범위 안내,503 조회 timeout은 재시도,500은 안전한 일반 오류다. 요청한 설정 문제를 저장 후500으로 발견하지 않는다.

event: view.configuration.saved / view.configuration.failed. requestId/userId/workspaceId/viewDefinitionId/errorCode만 기록한다. 비교값·검색어·설정 JSON·셀값·토큰·DB URL은 redaction 대상이다. 로그는 업무 transaction 밖이며 DB 이력 추가 없음. 외부 Provider 없음. outbox 불필요(동기 소유 module 저장만 수행). idempotency는 안정적인 행 ID·section 비교·no-op 규칙으로 처리한다.

| 상태 / 코드 | 발생 조건 | FE 처리 | 설정 application 로그 |
|---|---|---|---|
| 400 / ValidationError 또는 Nest validation envelope | 경로/query/body 형식, 원본 선택 오류 | 입력·요청 수정, 자동 재저장 안 함 | application 진입 전 오류는 saved/failed 이벤트 없음 |
| 401 / Unauthorized, 403 / Forbidden·InactiveUser | 인증·계정 상태 | 기존 refresh/인증 복구 및 접근 불가 안내 | AuthGuard 이전 차단은 설정 이벤트 없음 |
| 404 / ViewConfigurationNotFound | 멤버십 또는 View 소속 불일치 | 존재 여부 노출 없이 접근 불가 | PATCH application에서 warn |
| 409 / ViewConfigurationConflict | 기준 버전 또는 새 행 ID 경합 | 입력 유지, 명시적 최신 설정 사용 | PATCH warn |
| 409 / ViewDataCursorStale | 미리보기 페이지 token의 설정 변경 | MAIN 첫 페이지부터 복구 | 조회는 설정 mutation 이벤트 없음 |
| 422 / ViewConfigurationInvalid | 잘못된 소속·경로·연산·표시 설정 | 입력 유지, 설정 수정 | PATCH warn, 원문 없이 errorCode |
| 422 / ViewDataTypeUnsupported·ViewDataQueryLimitExceeded | 미지원 보기 또는 실행 한도 | 지원 범위/한도 안내 | PATCH warn |
| 503 / ViewDataQueryTimedOut | 읽기 snapshot 시간 초과 | 읽기 재시도 | 읽기는 설정 mutation 이벤트 없음 |
| 500 / InternalServerError | 예기치 않은 저장소/내부 오류 | 입력 유지, 재시도 가능 | PATCH error, provider message/stack 원문 제외 |

PATCH 성공은 info 수준 `view.configuration.saved`를 기록한다. DTO/guard 통과 후 입력 검증·멤버십 실패도 `view.configuration.failed`에 포함한다. 실패하면 transaction이 rollback된 뒤 기록한다. 공통 HTTP request 로그는 기존 middleware 기준이고 설정 내용은 남기지 않는다. Domain 오류 body 예시는 `{"statusCode":409,"error":"ViewConfigurationConflict","message":"보기 설정이 다른 곳에서 변경됐어요. 최신 설정을 확인해 주세요."}`다. 422는 안전한 `field`와 같은 `code`를 추가할 수 있다. Nest validation 오류의 `error`는 object일 수 있어 기존 apiClient 파서를 재사용한다.

## Frontend·검증

crm-view feature 내부 API client/query key를 사용한다. 사용자/Workspace/View/source별 baseline·draft를 공유하고 이전 요청을 취소한다. preview는 별도 query key로 격리한다. 저장 후 설정·메뉴·본문 캐시와 cursor를 갱신한다. 저장 중 변경을 잠그고 실패 입력을 보존한다. 원본 속성 생성/업무값 수정은 기존 독립 저장 흐름이다.

검증: HTTP DTO whitelist/권한/오류 매핑, 저장·재조회·no-op·부분 교체·동시 충돌·전체 rollback·타 Workspace ID 거부, empty dataset 설정 검증, preview 쓰기0, 제목 변경 후 연결 이름 유지, decimal/날짜, FE 저장·되돌리기·실패·늦은 응답·IME, 타입/lint/빌드 및 관련 회귀. live DB 검증은 읽기 또는 무조건 rollback하는 transaction으로 수행한다. 기존 일반 DB 테스트는 전용 TEST_DATABASE_URL에서만 실행한다.
