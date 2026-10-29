# View 헤더 메뉴 조회 API 계약

- 작성일: 2026-10-29
- 계약 상태: `implemented` — G00에서 조회 범위를 confirmed로 확정한 뒤 세 GET 구현과 로컬 검증을 완료했다.
- 스키마 재검토 및 구현 검토: 2026-10-29. 7절의 읽기 무결성을 구현했다. SourceScope의 실행·직접 원본 소속 판정은 저장/실행 API로 후속 분리했다. 검증 근거는 Backend 검토 문서를 따른다.
- 소비자: User Web. 이번 실행 범위는 Backend만이다.
- 작성 기준: [TODO Software Agent Reference](../../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [API 계약 규칙](../../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md).
- 호환성: 신규 GET 3개 추가. 기존 초기 헤더·View 목록·즐겨찾기·사이드바 API 변경 없음. migration/fallback 없음.
- 공식 UX와 우리 설계의 구분은 [계획 README](../../README.md)의 Attio 근거를 따른다.

## 1. HTTP와 공통 Request

```text
GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/filters
GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/sorts
GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/settings
```

| API 식별자 | 이름 | Request DTO 이름 | Response DTO 이름 |
| --- | --- | --- | --- |
| `VIEW_HEADER_FILTERS_GET` | 현재 View 필터 설정 조회 | `GetWorkspaceViewFiltersRequestDto` | `WorkspaceViewFiltersResponse` |
| `VIEW_HEADER_SORTS_GET` | 현재 View 정렬 설정 조회 | `GetWorkspaceViewSortsRequestDto` | `WorkspaceViewSortsResponse` |
| `VIEW_HEADER_SETTINGS_GET` | 현재 View 보기 설정 조회 | `GetWorkspaceViewSettingsRequestDto` | `WorkspaceViewSettingsResponse` |

세 Request DTO는 동일한 두 경로 필드를 표현하는 계약명이다. 실제 presentation에서 공통 Params DTO 또는 기존 `ParseUUIDPipe`로 재사용할 수 있다. 필드가 없는 Query/Body는 공통 `EmptyRequestPipe`로 검사한다.

| 위치 | 필드 | 타입 | 필수 / nullable | 검증 |
| --- | --- | --- | --- | --- |
| Header | `Authorization` | string | 필수 / 불가 | 기존 `Bearer <app access token>`과 AuthGuard |
| Path | `workspaceId` | UUID string | 필수 / 불가 | 빈 문자열·비 UUID 거부. UUID 대소문자로 접근 결과가 달라지지 않는다. |
| Path | `viewDefinitionId` | UUID string | 필수 / 불가 | 같은 Workspace에 있는 View인지 확인 |
| Query | 없음 | — | — | 파싱된 빈 객체만 허용. 이름이 있는 Query는 값이 빈 문자열이어도 400 |
| Body | 없음 | — | — | 미전송 또는 파싱된 빈 객체 `{}` 허용. `null`, 배열, 원시값, 필드가 있는 객체는 400 |
| Cookie | 없음 | — | — | 이 API만의 인증 Cookie 계약 없음 |

- 성공: `200 OK`, `Content-Type: application/json`, 항상 응답 Body가 있다.
- 목록 pagination/search/request filter: 없음. 대상 View의 해당 저장 설정 전체를 반환한다.
- `sortDirection`은 요청으로 받아 덮어쓰는 값이 아니다. 저장된 값을 응답한다.
- 현재 선택 View가 없으면 후속 소비자는 요청하지 않는다. 문자열 `null`을 경로에 넣지 않는다.
- `userId`, `workspaceMemberId`, Actor ID는 클라이언트로부터 받지 않는다.
- 빈 입력은 `BE/src/shared/presentation/pipes/empty-request.pipe.ts`의 `EmptyRequestPipe`로 검사한다. Controller의 Query/Body 타입은 `unknown`으로 두어 전역 DTO 변환이 검사 전에 `constructor`·`__proto__` 같은 입력 키를 제거하지 않게 한다. 파싱된 객체의 추가 키는 이름에 관계없이 400이며 잘못된 JSON 문법은 기존 HTTP parser의 400 처리를 따른다.

## 2. 공통 응답 규칙과 메타데이터

### 2.1. 기본 규칙

| 필드 | 타입 | nullable | 출처 |
| --- | --- | --- | --- |
| `viewDefinitionId` | UUID string | 아니오 | `ViewDefinition.id` |
| `viewType` | ViewType | 아니오 | `ViewDefinition.type` |

`ViewType`은 `TABLE`, `KANBAN`, `LIST`, `GALLERY`, `CALENDAR`, `TIMELINE`, `GANTT`, `CHART`, `PIVOT`, `MAP`, `DASHBOARD`다.

- 명세에 있는 응답 필드는 생략하지 않는다. 목록은 없으면 `[]`, nullable 단건/JSON은 없으면 `null`이다.
- 원본 테이블을 알아볼 수 있도록 `viewSortDefinitions`, `attributeDefinitions` 같은 이름을 쓴다. DB 모델 전체를 직렬화하지 않고 이 문서의 필드만 반환한다.
- 하위 row의 `workspaceId`, `viewDefinitionId`, 생성/수정 Actor와 시각은 반복 응답하지 않는다. `createdAt`은 안정적인 순서 판정에만 사용한다.
- `JsonValue`는 object/array/string/number/boolean/null인 JSON 값이다. DB JSON을 임의로 object로 한정하거나 누락 값을 `{}`로 바꾸지 않는다.
- `configJson`, `formatJson`, `comparisonValueJson`, `groupKeyJson`, `layoutJson`은 저장값을 보존한다. 버전 필드나 임의 기본 설정을 생성하지 않는다.
- 날짜 전용 문자열·금액 문자열을 임의로 Date/실수로 변환하지 않는다. 실제 비교·집계는 이번 API가 수행하지 않는다.
- 아래 예시 UUID는 설명용이며 실 DB ID가 아니다.

### 2.2. `attributeDefinitions[]`

세 API가 반환한 설정의 최종 속성, 참조 경로 속성 및 그룹 설정에서 참조하는 속성을 ID로 중복 제거해서 담는다. 전체 생성 후보 목록을 의미하지 않는다.

| 필드 | 타입 | nullable | 출처 / 의미 |
| --- | --- | --- | --- |
| `id` | UUID string | 아니오 | `AttributeDefinition.id` |
| `title` | string | 아니오 | `AttributeDefinition.title`, 원본 속성명 |
| `type` | AttributeType | 아니오 | `AttributeDefinition.type` |
| `objectDefinitionId` | UUID string | 예 | Object 소속 |
| `listDefinitionId` | UUID string | 예 | List 소속 |
| `icon` | string | 예 | 속성 아이콘 |
| `isMultiselect` | boolean | 아니오 | 다중값 여부 |
| `configJson` | JsonValue | 예 | 속성 표시·타입 메타데이터 |

`AttributeType`은 현재 schema/application 계약의 `ActorReference`, `Checkbox`, `Currency`, `Date`, `Domain`, `EmailAddress`, `Interaction`, `Location`, `PersonalName`, `Number`, `PhoneNumber`, `Rating`, `RecordReference`, `Select`, `Status`, `Text`, `Timestamp`다.

### 2.3. `selectOptions[]` / `statusOptions[]`

필터·보기 설정 응답에 포함한다. 해당 응답에서 참조하는 Select/Status 속성의 옵션을 반환하며, 선택된 옵션만으로 제한하지 않는다.

보기 설정의 GroupSetting에 명시된 옵션은 속성 타입 필터와 별개로 소속을 검증한다. 검증을 통과한 명시 옵션도 해당 응답 옵션 배열에 포함하고, 참조 속성의 전체 옵션 집합과 합쳐 ID로 중복을 제거한다. 옵션/AttributeType 조합의 새 금지 정책을 도입하는 것은 아니다.

| 필드 | 타입 | nullable | 출처 |
| --- | --- | --- | --- |
| `id` | UUID string | 아니오 | `SelectOption.id` / `StatusOption.id` |
| `attributeDefinitionId` | UUID string | 아니오 | 옵션의 소속 속성 |
| `title` | string | 아니오 | 옵션 표시명 |
| `color` | string | 예 | 옵션 색상 원본 |
| `sortOrder` | integer | 아니오 | 옵션 표시 순서 |

정렬 설정 조회에는 옵션 목록을 넣지 않는다. 현재 정렬 조건의 속성명과 방향 표시에 필요한 속성 메타데이터만 반환한다.

## 3. 필터 설정 조회

### 3.1. 조회 데이터와 응답 필드

`ViewDefinition`을 확인한 뒤 `ViewFilterGroupDefinition`, `ViewFilterConditionDefinition`과 2절의 속성·옵션을 조회한다.

| 최상위 필드 | 타입 | nullable |
| --- | --- | --- |
| `viewDefinitionId`, `viewType` | 2.1절 | 아니오 |
| `viewFilterGroupDefinitions` | FilterGroup[] | 아니오 |
| `viewFilterConditionDefinitions` | FilterCondition[] | 아니오 |
| `attributeDefinitions` | 2.2절 배열 | 아니오 |
| `selectOptions`, `statusOptions` | 2.3절 배열 | 아니오 |

`FilterGroup`은 다음 필드를 해당 DB 컬럼에서 가져온다.

| 필드 | 타입 | nullable | 의미 |
| --- | --- | --- | --- |
| `id` | UUID string | 아니오 | 그룹 ID |
| `parentViewFilterGroupDefinitionId` | UUID string | 예 | null이면 루트 그룹 |
| `conditionGroupOperator` | `AND` / `OR` | 아니오 | 그룹 내부 결합 방식 |
| `sortOrder` | integer | 아니오 | 같은 부모 안의 표시 순서 |

`FilterCondition`은 다음 필드를 해당 DB 컬럼에서 가져온다.

| 필드 | 타입 | nullable | 의미 |
| --- | --- | --- | --- |
| `id` | UUID string | 아니오 | 조건 ID |
| `viewFilterGroupDefinitionId` | UUID string | 아니오 | 소속 그룹 |
| `sourceScope` | `RECORD` / `LIST_ENTRY` | 아니오 | 저장된 조회 시작점 |
| `attributeDefinitionId` | UUID string | 아니오 | 최종 비교 속성 |
| `referenceAttributeIdPathJson` | UUID string[] | 아니오 | 저장된 순서의 참조 경로, 직접 속성이면 `[]` |
| `comparisonOperator` | string | 아니오 | 저장된 연산자 코드 |
| `comparisonValueJson` | JsonValue | 예 | 비교값 원본 |
| `multiValueMatchMode` | `ANY` / `ALL` | 아니오 | 저장된 다중값 매칭 방식 |
| `sortOrder` | integer | 아니오 | 같은 그룹 안의 표시 순서 |

`comparisonOperator`는 현재 DB가 String이다. 예시 `gte`를 전체 지원 연산자로 확정하거나 Attio의 `$gte`로 자동 변경하지 않는다. 이 API는 조건을 평가하지 않는다. 비교값에 들어 있는 Actor/Record ID의 표시명 해석은 후속 범위다.

### 3.2. 응답 예시

```json
{
  "viewDefinitionId": "11111111-1111-4111-8111-111111111111",
  "viewType": "TABLE",
  "viewFilterGroupDefinitions": [
    {
      "id": "33333333-3333-4333-8333-333333333333",
      "parentViewFilterGroupDefinitionId": null,
      "conditionGroupOperator": "AND",
      "sortOrder": 0
    }
  ],
  "viewFilterConditionDefinitions": [
    {
      "id": "44444444-4444-4444-8444-444444444444",
      "viewFilterGroupDefinitionId": "33333333-3333-4333-8333-333333333333",
      "sourceScope": "LIST_ENTRY",
      "attributeDefinitionId": "55555555-5555-4555-8555-555555555555",
      "referenceAttributeIdPathJson": [],
      "comparisonOperator": "gte",
      "comparisonValueJson": { "value": "2026-11-09" },
      "multiValueMatchMode": "ANY",
      "sortOrder": 0
    }
  ],
  "attributeDefinitions": [
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "title": "마감일",
      "type": "Date",
      "objectDefinitionId": null,
      "listDefinitionId": "22222222-2222-4222-8222-222222222222",
      "icon": null,
      "isMultiselect": false,
      "configJson": null
    }
  ],
  "selectOptions": [],
  "statusOptions": []
}
```

메뉴는 `AND → 마감일 → 이후 또는 같음 → 2026-11-09`처럼 표현할 수 있다. 한국어 연산자 라벨은 원본 코드와 구분되는 소비자 표현이다.

## 4. 정렬 설정 조회

### 4.1. 조회 데이터와 응답 필드

`ViewDefinition`, `ViewSortDefinition`, 참조된 `AttributeDefinition`을 조회한다.

| 최상위 필드 | 타입 | nullable |
| --- | --- | --- |
| `viewDefinitionId`, `viewType` | 2.1절 | 아니오 |
| `viewSortDefinitions` | SortDefinition[] | 아니오 |
| `attributeDefinitions` | 2.2절 배열 | 아니오 |

`SortDefinition`의 DB 컬럼과 응답 필드는 같다.

| 필드 | 타입 | nullable | 의미 |
| --- | --- | --- | --- |
| `id` | UUID string | 아니오 | 정렬 조건 ID |
| `sourceScope` | `RECORD` / `LIST_ENTRY` | 아니오 | 저장된 시작점 |
| `attributeDefinitionId` | UUID string | 아니오 | 정렬 대상 속성 |
| `referenceAttributeIdPathJson` | UUID string[] | 아니오 | 저장된 참조 경로 |
| `sortDirection` | `ASC` / `DESC` | 아니오 | 메뉴의 오름차순/내림차순 선택 상태 |
| `sortOrder` | integer | 아니오 | 정렬 조건의 표시·적용 우선순위 |
| `configJson` | JsonValue | 예 | 저장된 null 위치·다중값 관련 설정 |

### 4.2. 응답 예시

```json
{
  "viewDefinitionId": "11111111-1111-4111-8111-111111111111",
  "viewType": "TABLE",
  "viewSortDefinitions": [
    {
      "id": "66666666-6666-4666-8666-666666666666",
      "sourceScope": "LIST_ENTRY",
      "attributeDefinitionId": "55555555-5555-4555-8555-555555555555",
      "referenceAttributeIdPathJson": [],
      "sortDirection": "ASC",
      "sortOrder": 0,
      "configJson": { "nulls": "LAST" }
    }
  ],
  "attributeDefinitions": [
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "title": "마감일",
      "type": "Date",
      "objectDefinitionId": null,
      "listDefinitionId": "22222222-2222-4222-8222-222222222222",
      "icon": null,
      "isMultiselect": false,
      "configJson": null
    }
  ]
}
```

- 예시 메뉴: `마감일 [오름차순 ↑]`.
- 두 번째 조건이 금액 `DESC`여도 조건 배열 자체를 내림차순으로 뒤집지 않는다.
- `configJson.nulls`가 없는 행에 `LAST`를 자동 삽입하지 않는다. 위 값은 더미 설정 예시다.
- 실제 주 화면 데이터를 읽거나 정렬하지 않는다.

## 5. 보기 설정 조회

### 5.1. 조회 데이터와 최상위 응답

| 필드 | 타입 | nullable | 출처 |
| --- | --- | --- | --- |
| `viewDefinitionId`, `viewType` | 2.1절 | 아니오 | View ID와 타입 |
| `viewName` | string | 아니오 | `ViewDefinition.name` |
| `objectDefinitionId` | UUID string | 예 | `ViewDefinition.objectDefinitionId` |
| `listDefinitionId` | UUID string | 예 | `ViewDefinition.listDefinitionId` |
| `configJson` | JsonValue | 예 | `ViewDefinition.configJson` |
| `viewAttributeSettingDefinitions` | AttributeSetting[] | 아니오 | `ViewAttributeSettingDefinition` |
| `viewGroupDefinitions` | GroupDefinition[] | 아니오 | `ViewGroupDefinition` |
| `viewGroupSettingDefinitions` | GroupSetting[] | 아니오 | `ViewGroupSettingDefinition` |
| `viewWidgetDefinitions` | WidgetDefinition[] | 아니오 | `ViewWidgetDefinition` |
| `contentViewDefinitions` | ContentViewSummary[] | 아니오 | 위젯이 참조한 `ViewDefinition` 요약 |
| `attributeDefinitions` | 2.2절 배열 | 아니오 | 참조 속성 |
| `selectOptions`, `statusOptions` | 2.3절 배열 | 아니오 | 참조 속성의 옵션 |

응답 외곽 구조는 11개 타입 모두 같다. 저장된 배열과 JSON 내용이 View마다 달라진다. 유형별 필수 설정을 임의로 만들거나, 해당 유형에서 사용하지 않는다고 저장 행을 삭제/누락하지 않는다.

### 5.2. 설정 배열별 필드

아래 필드는 각 배열과 이름이 같은 DB 모델의 컬럼이다. `?`는 필드 생략이 아니라 nullable을 의미한다. `id`는 모두 UUID string이다.

| 배열 항목 | 필드와 타입 |
| --- | --- |
| `AttributeSetting` | `id`; `sourceScope: RECORD/LIST_ENTRY`; `attributeDefinitionId: UUID`; `referenceAttributeIdPathJson: UUID[]`; `attributeDisplayRole: DisplayRole`; `sortOrder: integer`; `labelOverride: string?`; `width: integer?`; `isHidden: boolean`; `formatJson: JsonValue?` |
| `GroupDefinition` | `id`; `sourceScope: RECORD/LIST_ENTRY`; `attributeDefinitionId: UUID`; `referenceAttributeIdPathJson: UUID[]`; `groupRole: GROUP/SERIES/PIVOT_ROW/PIVOT_COLUMN`; `sortDirection: ASC/DESC`; `sortOrder: integer`; `configJson: JsonValue?` |
| `GroupSetting` | `id`; `viewGroupDefinitionId: UUID`; `attributeDefinitionId: UUID`; `statusOptionId: UUID?`; `selectOptionId: UUID?`; `groupKeyJson: JsonValue?`; `sortOrder: integer`; `labelOverride: string?`; `isHidden: boolean`; `isFold: boolean`; `configJson: JsonValue?` |
| `WidgetDefinition` | `id`; `contentViewDefinitionId: UUID`; `titleOverride: string?`; `sortOrder: integer`; `isHidden: boolean`; `layoutJson: JsonValue` (DB 컬럼은 필수이며 저장 JSON 원본 반환); `configJson: JsonValue?` |
| `ContentViewSummary` | `id`; `name: string`; `type: ViewType`; `icon: string?` |

`DisplayRole`은 `DISPLAY`, `TITLE`, `BODY`, `IMAGE`, `START_DATE`, `END_DATE`, `LOCATION`, `PROGRESS`, `MEASURE`다. `GROUP`, `SERIES`, `PIVOT_ROW`, `PIVOT_COLUMN`은 표시 역할이 아닌 `ViewGroupDefinition.groupRole`이다.

- `isHidden: true` 행도 반환한다. 숨겨진 항목을 다시 표시하려면 메뉴가 그 상태를 읽을 수 있어야 한다.
- `labelOverride`와 `titleOverride`는 원본 이름 변경이 아니다. null을 임의 대체하지 않고 원본 이름 메타데이터를 함께 제공한다.
- `titleOverride`는 위젯 제목 문자열, `configJson.showTitle`은 제목 표시 여부다. 두 값은 독립적이다. `showTitle` 누락 시 기본 동작은 이번 조회에서 만들지 않는다.
- 같은 속성이 여러 역할/참조 경로에 있거나 같은 View를 참조하는 위젯이 여러 개 있어도 각각 유지한다. 메타데이터 배열만 ID 기준으로 중복 제거한다.
- `contentViewDefinitions`는 직접 참조한 View 요약만 담는다. 참조 View의 설정·위젯·실제 결과를 재귀 조회하지 않는다.

### 5.3. TABLE 응답 예시

```json
{
  "viewDefinitionId": "11111111-1111-4111-8111-111111111111",
  "viewName": "전체 업무",
  "viewType": "TABLE",
  "objectDefinitionId": null,
  "listDefinitionId": "22222222-2222-4222-8222-222222222222",
  "configJson": { "rowDensity": "COMFORTABLE" },
  "viewAttributeSettingDefinitions": [
    {
      "id": "77777777-7777-4777-8777-777777777777",
      "sourceScope": "LIST_ENTRY",
      "attributeDefinitionId": "55555555-5555-4555-8555-555555555555",
      "referenceAttributeIdPathJson": [],
      "attributeDisplayRole": "DISPLAY",
      "sortOrder": 0,
      "labelOverride": null,
      "width": 140,
      "isHidden": false,
      "formatJson": { "dateFormat": "YYYY-MM-DD" }
    }
  ],
  "viewGroupDefinitions": [],
  "viewGroupSettingDefinitions": [],
  "viewWidgetDefinitions": [],
  "contentViewDefinitions": [],
  "attributeDefinitions": [
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "title": "마감일",
      "type": "Date",
      "objectDefinitionId": null,
      "listDefinitionId": "22222222-2222-4222-8222-222222222222",
      "icon": null,
      "isMultiselect": false,
      "configJson": null
    }
  ],
  "selectOptions": [],
  "statusOptions": []
}
```

### 5.4. 11개 타입의 보기 설정 대응

아래 JSON은 [더미 설정 문서](../../../../../BE/prisma/VIEW_DEMO_SETTINGS.md)와 [fixture](../../../../../BE/prisma/view-demo-settings.fixture.json)의 예시다. 지원 가능한 모든 값·필수 키·자동 기본값 계약은 아니다. 실제 응답은 해당 View의 저장값을 따른다.

| ViewType | 메뉴에서 읽을 설정 | 주요 저장 위치 | `ViewDefinition.configJson` 예시 |
| --- | --- | --- | --- |
| TABLE | 표시 속성, 열 순서·너비·숨김, 그룹, 형식 | AttributeSetting + Group/GroupSetting | `{"rowDensity":"COMFORTABLE"}` |
| KANBAN | 카드 속성, 단계 기준, 열 순서·숨김·접힘 | AttributeSetting + Group/GroupSetting | `{"cardDensity":"COMFORTABLE","showEmptyGroups":true}` |
| LIST | 제목 속성, 표시 속성, 그룹, 형식 | TITLE/DISPLAY + Group/GroupSetting | `{"rowDensity":"COMFORTABLE"}` |
| GALLERY | 제목, 본문 미리보기, 이미지 역할, 카드 크기, 속성 | TITLE/BODY/IMAGE/DISPLAY | `{"cardSize":"MEDIUM","imageFit":"CONTAIN"}` |
| CALENDAR | 시작·종료 날짜 속성, 카드 속성, 날짜 형식 | START_DATE/END_DATE/DISPLAY + formatJson | `{"initialMode":"MONTH","weekStartsOn":"MONDAY"}` |
| TIMELINE | 시작·종료 속성, 그룹, 막대 형식 | START_DATE/END_DATE/TITLE + Group | `{"timeScale":"WEEK"}` |
| GANTT | 시작·종료·진행률 속성, 의존관계 표시 설정 | START_DATE/END_DATE/PROGRESS + configJson | `{"timeScale":"WEEK","showDependencies":true}` |
| CHART | 차트 종류, 그룹, 측정 속성, 집계, 계열, 형식 | Group의 GROUP/SERIES + AttributeSetting의 MEASURE | `{"chartType":"BAR","aggregation":"SUM","showLegend":true}` |
| PIVOT | 행·열 기준, 측정 속성, 집계, 합계 표시 | Group의 PIVOT_ROW/PIVOT_COLUMN + MEASURE | `{"aggregation":"SUM","showRowTotals":true,"showColumnTotals":true}` |
| MAP | 위치 속성, 핀/목록 정보, 지도 옵션 | LOCATION/TITLE/DISPLAY + configJson | `{"fitToData":true,"showLabels":true}` |
| DASHBOARD | 위젯 목록·제목·숨김·배치·원본 View | Widget + ContentViewSummary | `{"gridColumns":12}` |

스키마와 UX 사이의 미확정 부분:

- KANBAN의 열별 접힘은 `ViewGroupSettingDefinition.isFold`로 읽는다. 카드 접기 전체 토글의 저장 키/기본값은 아직 확정하지 않는다.
- MAP의 핀 속성과 목록 속성을 분리하는 세부 규격, GALLERY 이미지 값 형식은 별도 계약 대상이다.
- ViewGroup의 `sortDirection`과 저장된 그룹별 수동 `sortOrder`를 실제 본문에서 어떻게 조합할지는 이번 조회 범위가 아니다. 둘 다 원본대로 반환한다.
- GANTT의 `showDependencies` 설정만 읽는다. `ViewWorkDependencyDefinition` 업무 관계 행은 조회하지 않는다.
- CHART/PIVOT 집계 결과, MAP 좌표 변환, CALENDAR 날짜 이동, DASHBOARD 전역 필터는 만들지 않는다.
- 현재 텍스트 UX는 CALENDAR에 헤더 정렬, CHART/PIVOT에 일반 정렬, DASHBOARD에 전역 필터·정렬을 공통 노출하지 않는다. 이 메뉴 조회 API의 존재만으로 버튼을 모든 타입에 강제하지 않는다.
- 조회 API는 ViewType만으로 임의 400을 만들지 않고 저장된 해당 설정을 반환한다. 저장 설정이 없으면 배열은 비어 있다.

## 6. 목록 정렬 계약

| 응답 배열 | 반환 순서 |
| --- | --- |
| `viewFilterGroupDefinitions` | `sortOrder ASC, createdAt ASC, id ASC` |
| `viewFilterConditionDefinitions` | `sortOrder ASC, createdAt ASC, id ASC` |
| `viewSortDefinitions` | `sortOrder ASC, createdAt ASC, id ASC` |
| `viewAttributeSettingDefinitions` | `sortOrder ASC, createdAt ASC, id ASC` |
| `viewGroupDefinitions` | `sortOrder ASC, createdAt ASC, id ASC` |
| `viewGroupSettingDefinitions` | `viewGroupDefinitionId ASC, sortOrder ASC, createdAt ASC, id ASC` |
| `viewWidgetDefinitions` | `sortOrder ASC, createdAt ASC, id ASC` |
| `selectOptions`, `statusOptions` | `attributeDefinitionId ASC, sortOrder ASC, createdAt ASC, id ASC` |
| `attributeDefinitions`, `contentViewDefinitions` | `id ASC` |

- 필터 계층은 부모/그룹 ID로 연결한다. 배열에 앞서 나온 항목을 부모로 추측하지 않는다.
- 같은 부모 안의 하위 그룹과 조건은 각각의 배열로 반환한다. 두 종류를 합치는 소비자의 동률 표시 순서는 후속 범위이며, 배열 위치만으로 두 종류 사이의 동률 순서를 보장하지 않는다.
- `referenceAttributeIdPathJson`은 경로 순서 그대로이며 정렬하지 않는다.
- `sortDirection`은 각 조건 또는 그룹의 저장 방향을 표시하는 값이다. 설정 목록 배열의 ASC 정렬을 바꾸는 인자가 아니다.
- 동률을 위한 `createdAt/id` 순서는 우리 API의 결정적 반환 규칙이며 Attio 내부 구현을 확인한 사실이 아니다.

## 7. 내부 비즈니스 로직과 DB 경계

### 7.1. 공통 처리 순서와 모듈 경계

1. 기존 AuthGuard로 현재 사용자를 확인하고 경로 UUID/빈 Query·Body 계약을 검증한다.
2. Workspace 모듈의 공개 `WorkspaceAccessQuery`로 현재 사용자의 멤버십을 확인한다. 부재/비멤버는 같은 404다. 읽기를 위해 Actor를 새로 생성하지 않는다.
3. View 소유 query port로 `workspaceId + viewDefinitionId`에 해당하는 View를 찾는다. 없거나 다른 Workspace이면 같은 404다.
4. View가 참조하는 Object/List ID가 있으면 각 소유 모듈의 공개 Summary Port로 같은 Workspace 소속을 확인한다. Object/List XOR나 List 단일 Object 정책을 새로 강제하지 않는다.
5. 요청한 메뉴의 설정 테이블만 `workspaceId + viewDefinitionId` 조건으로 읽는다. 주 화면 원본 값과 다른 메뉴 설정을 불필요하게 조회하지 않는다.
6. 참조 속성 ID·경로 ID·옵션 ID·위젯 원본 View ID를 모아서 일괄 조회한다. Attribute/옵션은 AttributeDefinition 모듈의 새 공개 batch query port를 사용한다. 위젯 원본 View는 View 소유 port가 조회한다.
7. 아래 7.2~7.7절에 따라 조회 범위와 참조를 검증한다. 누락된 참조를 다른 Workspace 검색으로 보완하지 않는다. 미확정 SourceScope 정책까지 검증했다고 간주하지 않는다.
8. 응답에 필요한 필드만 매핑하고 6절 순서를 적용한다. 설정이 없으면 200과 빈 배열을 반환하며 기본 설정을 DB에 저장하지 않는다.

세부 구현은 [Backend 작업 문서](../../BE-TODO/IMPLEMENTATION.md)를 따른다. SourceScope/관계 경로의 전체 실행 가능성 검증은 저장 설정을 안전하게 읽는 소속 검증과 구분한다. 저장된 String/JSON을 읽는다는 이유로 아직 정하지 않은 연산자·다중값·집계 제약을 추가하지 않는다.

| 읽기 대상 | 소유/접근 경계 | 생성·수정·삭제 |
| --- | --- | --- |
| Workspace 멤버십 | workspace 공개 Port | 없음 |
| Object/List 요약 | object-definition / list-definition 공개 Port | 없음 |
| View와 필터·정렬·표시·그룹·위젯 설정 | view-definition 자체 query port + Prisma adapter | 없음 |
| AttributeDefinition / SelectOption / StatusOption | attribute-definition 공개 batch Port | 없음 |

### 7.2. 스키마가 보장하는 것과 Application이 확인할 것

`schema.prisma`의 View 설정 관계는 대부분 `references: [id]`인 단일 ID FK다. 참조 행이 존재해도 Workspace, View, Attribute가 서로 맞는다는 보장은 없다. JSON 경로는 FK가 없는 `Json` 컬럼이다. [View 제약 검토 문서](../../../../VIEW_인덱스관련검토문서.md)의 복합 FK 후보는 현재 적용된 제약으로 간주하지 않는다.

| 연결 | 이번 읽기에서 확인할 조건 |
| --- | --- |
| View → Object/List | null이 아닌 각 ID가 요청 Workspace의 공개 Summary 조회에 존재 |
| 하위 설정 → View | `workspaceId + viewDefinitionId`로 조회한 행만 사용 |
| 설정 → 최종/경로 Attribute | 필요한 모든 ID가 요청 Workspace의 batch 결과에 존재 |
| 필터 그룹 → 부모 / 조건 → 그룹 | 현재 조회한 필터 그룹 ID 집합 안에서 연결되고 순환 없음 |
| GroupSetting → GroupDefinition | 부모가 현재 View에 존재하고 양쪽 `attributeDefinitionId` 일치 |
| GroupSetting → Select/Status 옵션 | 명시한 옵션이 요청 Workspace에 존재하고 옵션의 `attributeDefinitionId`가 해당 GroupSetting 및 부모 그룹의 속성과 일치 |
| Widget → ContentView | 원본 View가 요청 Workspace의 batch 결과에 존재 |

위 조건 위반은 요청 형식 오류가 아닌 저장 설정의 읽기 무결성 오류다. `500 ViewHeaderConfigurationInvalid`로 처리하며, 잘못된 행만 빼서 성공 응답을 만들거나 DB 값을 자동 수정하지 않는다. 단, 처음부터 조회 범위 밖인 행의 취급은 다음 절을 따른다.

### 7.3. 조회 범위 밖의 행과 오류 감지 범위

- 하위 설정의 `where`는 계속 `workspaceId + viewDefinitionId`를 모두 사용한다. 응답을 완성하려고 다른 Workspace를 검색하거나 전체 설정 테이블을 진단하지 않는다.
- 예를 들어 View V가 Workspace A에 속하지만 정렬 행에 `workspaceId=B, viewDefinitionId=V`가 저장되어 있으면 그 정렬 행은 조회 대상에서 제외된다. 그 행을 발견하기 위한 추가 전역 조회는 하지 않으므로, 해당 행의 존재만으로 이 요청이 500을 반환한다고 보장하지 않는다.
- 반면 조회된 A/V 조건이 B의 필터 그룹을 참조하거나, A/V 위젯이 B의 View를 참조하면 요청 범위 안의 참조를 완성할 수 없으므로 500이다. 참조 대상의 부재와 다른 Workspace 소속을 구분해 외부에 노출하지 않는다.
- 따라서 이 API의 보장은 **조회된 설정과 응답에 포함되는 참조의 무결성**이다. DB 전체의 잘못된 소속 조합을 찾아내는 진단·정리 기능은 후속 범위다.

### 7.4. Attribute, SourceScope, JSON 참조 경로

이번 조회의 공통 검증:

1. `referenceAttributeIdPathJson`은 배열이고 각 항목은 UUID 문자열이어야 한다. `[]`는 정상이다. 객체, JSON null, 숫자 항목, 잘못된 UUID를 `[]`로 보정하지 않는다.
2. 최종 Attribute ID와 경로의 모든 Attribute ID를 모아 요청 Workspace 안에서 일괄 조회한다. 하나라도 결과에서 빠지면 500이다. 응답 메타데이터만 ID로 중복 제거한다.
3. UUID의 동일성 비교에는 대소문자를 정규화한 키를 사용한다. 저장된 경로의 문자열·순서·중복은 응답에서 변경하지 않는다. UUID 대소문자 차이를 누락 참조로 오판하지 않는다.
4. 같은 Workspace에 속한다는 사실만으로 최종 속성이 올바른 Object/List에서 도출되었다거나 전체 관계 경로를 실행할 수 있다고 판단하지 않는다.

다음은 **G00에서 저장/실행 API로 후속 분리한 직접 속성의 원본 소속 판정안**이다. 이 읽기 API의 새 거부 정책으로 적용하지 않는다.

| 사례 | 확인할 판정안과 이유 |
| --- | --- |
| `LIST_ENTRY`, 빈 경로, View에 List ID 있음 | 직접 속성의 `listDefinitionId`와 View의 List ID가 같아야 하는지 확인. 동일 Workspace의 다른 List 속성을 섞는 문제를 막기 위한 기준 |
| `RECORD`, 빈 경로, View에 Object ID 있음 | 직접 속성의 `objectDefinitionId`와 View의 Object ID가 같아야 하는지 확인. 동일 Workspace의 다른 Object 속성 혼용 방지 |
| List 기반 View의 `RECORD` | List에 단일 Object ID가 없으므로 첫 ListEntry로 Object를 추론하지 않음. 혼합 Object를 포함한 List에서 직접 Record 속성을 어떻게 취급할지 명시 |
| View의 원본 ID가 없거나 두 ID가 모두 있음 | SourceScope의 시작점 판정과 저장 상태 읽기 허용 범위를 명시. Object/List XOR나 DASHBOARD 제한을 자동 도입하지 않음 |
| 비어 있지 않은 참조 경로 | 이번 조회는 JSON 모양·ID 존재·Workspace를 검사. RecordReference 타입, 각 hop의 출발/도착 Object, 최종 속성의 도달 가능성은 미래 실행기 계약과 구분 |

G00에서 이번 읽기는 메타데이터 복원과 명시된 참조 무결성까지만 보장하도록 확정했다. 앞의 직접 소속 판정안은 실행기/저장 API로 분리한다. 저장 비교값의 Actor/Record ID는 경로 Attribute ID와 다른 데이터다. 임의로 비교값 JSON을 순회해 원본 Record나 Actor를 조회하지 않는다.

### 7.5. 필터 그룹 계층

- 조회된 모든 그룹으로 ID map을 만든다. null이 아닌 부모 ID와 모든 조건의 그룹 ID는 그 map에 있어야 한다.
- 모든 그룹을 대상으로 방문 상태를 관리해 자기 참조와 여러 그룹의 순환을 검사한다. 루트에서만 탐색하면 루트와 연결되지 않은 순환을 놓칠 수 있으므로 루트가 없는 컴포넌트도 확인한다.
- 끊긴 부모, 다른 View/Workspace의 그룹 참조, `A → A`, `A → B → A`는 500이다. 빈 그룹, 여러 루트, 비어 있는 전체 설정은 그대로 읽는다. 가상 루트나 AND 그룹을 추가하지 않는다.
- 그룹/조건 배열은 6절대로 각각 반환한다. 루트 사이의 실제 필터 평가 방식과 두 종류를 합친 표시 동률 규칙을 이 조회의 배열 순서로 추론하지 않는다.

### 7.6. 그룹별 상태와 옵션

각 GroupSetting에 다음 비교를 모두 적용한다. Workspace 일치만 확인하고 종료하지 않는다.

```text
groupSetting.viewGroupDefinitionId가 현재 View의 groupMap에 존재
groupSetting.attributeDefinitionId == parentGroup.attributeDefinitionId
명시된 각 option.workspaceId == 요청 workspaceId
명시된 각 option.attributeDefinitionId == groupSetting.attributeDefinitionId
```

- 예: 부모 그룹의 속성이 A인데 GroupSetting이 B의 옵션을 가리키면, A와 B가 같은 Workspace에 있어도 500이다.
- 명시된 `selectOptionId`, `statusOptionId`는 각각 해당 테이블의 조회 결과로 검증한다. 타입 필터 때문에 검증 대상 ID가 조용히 사라지지 않게 한다. 공개 batch Port의 입력/결과는 [Backend 문서 4.1절](../../BE-TODO/IMPLEMENTATION.md#41-공개-batch-port의-입력결과-설계)에서 정한다.
- 필터/보기 설정의 옵션 응답은 관련 Select/Status 속성의 전체 옵션을 포함한다. 명시된 옵션 하나만 반환하는 조회로 축소하지 않는다. 정렬 응답에는 옵션을 추가하지 않는다.
- `statusOptionId`, `selectOptionId`, `groupKeyJson` 중 정확히 하나만 존재해야 한다는 정책, 옵션과 AttributeType의 조합 제한, `groupKeyJson` 정규화·동일성 판단은 미확정 도메인 규칙이다. 이번 읽기에서 새 XOR/CHECK/유일성 조건으로 도입하지 않는다. null/JSON 원본과 여러 설정 행은 보존한다.

### 7.7. 위젯과 응답 완성

- 모든 위젯 행은 보존하고 `contentViewDefinitionId`만 중복 제거해 요청 Workspace 안에서 한 번에 조회한다. 원본 하나를 여러 위젯이 참조해도 위젯 행을 합치지 않는다.
- 원본 요약이 하나라도 없으면 500이다. 원본 View의 필터·설정·자식 위젯을 재귀 조회하거나 결과 데이터를 계산하지 않는다.
- 자기 참조·중첩 DASHBOARD·위젯 소유 ViewType의 허용 여부는 이번 읽기에서 새 금지 정책으로 확정하지 않는다. 1단계 요약 조회에는 재귀 순환 검사가 필요하지 않다.
- 검증 후에만 최종 응답을 만든다. 빈 설정, 숨김 상태, 반복 역할, `null`, 원본 JSON과 이름 override를 계약대로 보존한다. 누락 참조를 가짜 이름/기본 옵션/빈 배열로 숨기지 않는다.

## 8. 오류 계약

신규 오류는 기존 `HttpExceptionFilter`의 형식과 `NotFound → 404`, 그 외 설정 오류 → 500 매핑을 따른다. 실제 HTTP 테스트로 검증했다.

| 상황 | error code / 구분 | HTTP | 소비자 처리 기준 | 로그 |
| --- | --- | --- | --- | --- |
| 토큰 없음·만료·잘못됨 | 기존 AuthGuard `Unauthorized` | 401 | 기존 인증 갱신/로그인 흐름 | 기존 인증 정책 |
| 비활성 사용자 | 기존 `InactiveUser` | 403 | 접근 중단 | 기존 인증 정책 |
| UUID 형식·허용하지 않은 Query/Body | Nest validation `Bad Request` | 400 | 요청을 수정, 같은 요청 자동 반복 금지 | debug |
| Workspace 없음·비멤버 | 기존 `ViewHeaderWorkspaceNotFound` 재사용 | 404 | 접근 불가 처리, 이전 메뉴 내용 혼용 방지 | debug |
| View 없음·타 Workspace View | 신규 `ViewHeaderViewDefinitionNotFound` | 404 | 현재 선택 View 재확인 | debug |
| 조회된 설정의 참조 누락·교차 소속·깨진 필터 계층·경로 JSON 형식 오류 | 신규 `ViewHeaderConfigurationInvalid` | 500 | 빈 설정으로 간주하지 않고 조회 실패 표시. 재시도 가능하나 반복 실패는 조사 대상 | error |
| 예기치 않은 DB/서버 실패 | 기존 `InternalServerError` | 500 | 조회 실패 표시, 재시도 가능 | error |

Domain error 예시:

```json
{
  "statusCode": 404,
  "error": "ViewHeaderViewDefinitionNotFound",
  "message": "View definition not found"
}
```

예상하지 못한 서버 오류 예시:

```json
{
  "statusCode": 500,
  "error": "InternalServerError"
}
```

400은 기존 필터의 `{statusCode, error: HttpException.getResponse()}` 구조를 유지한다. 이 작업 때문에 전역 오류 envelope를 바꾸지 않는다. 설정 무결성 오류 message는 `View configuration is invalid`처럼 고정하고 비교값·고객명·다른 Workspace의 식별자를 노출하지 않는다.

저장 설정 읽기 무결성 오류 응답:

```json
{
  "statusCode": 500,
  "error": "ViewHeaderConfigurationInvalid",
  "message": "View configuration is invalid"
}
```

요청 UUID/입력 형식의 400, 접근 대상 View의 404, 조회된 저장 설정의 500을 구분한다. 새 domain error와 전역 filter의 실제 매핑을 검증했다. 저장된 경로 JSON이 잘못된 경우를 클라이언트 입력 오류인 400으로 돌리지 않는다.

## 9. Transaction / Observability / 소비자 계약

### Transaction과 부수 효과

- transaction: 없음. 저장 설정과 표시 메타데이터의 읽기만 수행한다.
- 변경 모델·rollback 범위·부수 이력 저장: 없음.
- idempotency key/outbox: 불필요. 반복 GET은 쓰기를 만들지 않는다.
- 외부 Provider 호출: 신규 호출 없음. 기존 인증은 유지하며 메뉴를 읽기 위해 Attio API를 호출하지 않는다.
- 여러 읽기 사이에 다른 요청이 설정을 바꿀 수 있다. 이 API는 단일 시점 snapshot을 보장하지 않는다. 엄격한 snapshot이 필요하면 application 주도의 read transaction 계약과 격리 수준을 별도로 검토한다.
- 따라서 참조 누락으로 500이 발생해도 영구적인 DB 손상이라고 단정하지 않는다. 동시 수정/삭제 가능성을 포함한 해당 읽기 실패이며, 여러 번 읽어 값을 합치거나 임의 재시도로 다른 시점의 응답을 조립하지 않는다.

### 관측성

- 신규 오류 event: `view.header.filters.read_failed`, `view.header.sorts.read_failed`, `view.header.settings.read_failed`.
- 저장 참조 문제는 해당 event에 `errorCode=ViewHeaderConfigurationInvalid`와 안전한 `reason`을 넣는다.
- `reason`은 `view_target_unavailable`, `attribute_unavailable`, `reference_path_invalid`, `filter_parent_invalid`, `filter_cycle`, `group_attribute_mismatch`, `group_option_invalid`, `widget_content_unavailable`, `configuration_scope_invalid`처럼 고정 코드로 남긴다. 원본 JSON/이름/다른 Workspace ID를 reason 문자열에 삽입하지 않는다. 이 코드들은 내부 로그 기준이며 HTTP 오류 필드를 늘리지 않는다.
- request id, current user id, workspace id, view id, 메뉴 종류, duration, 안전한 결과 건수를 추적한다. request context의 기존 주입 경로를 사용하고 임의 request id를 만들지 않는다.
- application은 `APPLICATION_LOGGER` port를 사용한다. 구체 logger나 Express request를 주입하지 않는다.
- token, comparisonValueJson, 사용자 입력 원문, 전체 configJson, 원본 DB/Provider 오류 문자열을 로그에 넣지 않는다.
- 성공 읽기마다 새 감사 원장을 쓰지 않는다. 기존 access log를 활용한다.

### 후속 소비자 연결 기준

- 버튼을 열 때 현재 `workspaceId + viewDefinitionId + 메뉴 종류`로 조회한다. 캐시도 인증 사용자와 이 범위를 구분해야 한다.
- 200의 빈 배열과 요청 실패를 구분한다. 실패를 빈 설정으로 간주하지 않는다.
- 현재 View가 바뀐 뒤 도착한 이전 응답을 새 메뉴에 표시하지 않는다.
- 조회는 서버 저장 상태다. 아직 저장하지 않은 편집 상태·자동 저장·전체 사용자 공유 정책을 이 계약으로 확정하지 않는다.
- Frontend 구현·캐시 연결·화면 QA는 이번 Backend 작업 완료 기준에 포함하지 않는다.

## 10. 구현 전 계약 검토 항목

### G00 처리 결과 — 2026-10-29

- 이번 GET은 저장 상태 복원을 담당한다. 7.4절의 직접 속성 Object/List 일치 판정, 관계 경로의 실행 가능성, 혼합 Object List의 평가 정책은 저장/실행 API로 후속 분리한다. 이 읽기는 UUID 배열·참조 존재·Workspace 및 그룹/옵션 연결까지만 검증한다.
- 그룹/조건은 별도 배열로 반환한다. 두 종류를 합친 동률 표시 순서와 여러 루트의 평가 방식은 후속 소비자/실행기 계약이다.
- Actor/Record 비교값은 JSON 원본을 반환하며 표시명 조회는 포함하지 않는다. KANBAN 카드 접기·MAP 표시 구분 등의 새 저장 키도 추가하지 않는다.
- Backend 4.1절의 공개 batch Port를 사용한다. 원본 JSON과 내부 소속 필드를 보존하고, 선택 옵션 ID는 속성의 전체 옵션과 함께 조회한다.
- 잘못된 요청은 기존 400 envelope, 접근 대상 부재는 404, 저장 참조 오류는 고정 메시지의 500으로 처리한다. 기존 전역 filter의 NotFound/default 분기를 사용한다.
- 현재 구현 범위는 이 처리 결과와 7절의 읽기 검증 조건을 따른다.

### 문서에서 보완한 기준

아래 체크는 문서에 기준을 적었다는 뜻이며 구현/테스트 통과 표시가 아니다.

- [x] 빈 Query/Body 허용·거부 범위와 저장 데이터 오류의 500을 구분했다.
- [x] 경로 UUID 배열, 참조 존재/Workspace, 필터 부모·순환, 그룹·속성·옵션의 정확한 연결 조건을 적었다.
- [x] 스코프 밖 행의 제외와 조회된 행의 무결성 오류를 구분했다. 전체 DB 진단을 보장하지 않는다.
- [x] 전체 경로 실행 가능성, 연산자 whitelist, 다중값·집계, XOR/유일성 정책을 임의 확정하지 않았다.

### G00~G99 완료 근거

- [x] SourceScope의 직접 원본 소속 판정, 혼합 표시 순서, 비교값 라벨 및 새 타입별 저장 키를 후속 분리했다.
- [x] 공개 batch Port와 실제 module DI를 구현하고 HTTP 테스트로 연결을 확인했다.
- [x] UUID 대소문자·JSON 형식·필터 순환·그룹/옵션 소속·빈 입력·오류 계약을 검증했다.
- [x] 로컬 격리 PostgreSQL에서 실제 조회 순서·JSON·Workspace 범위·SELECT 수·롤백을 확인했다.
- [x] 전체 Backend 64 suites / 462 tests, typecheck/lint/build, Prisma validate가 통과했다. 실제 Supabase 운영 데이터/배포 검증은 수행하지 않았다.

상세 검토: [비즈니스 로직·규칙 준수 검토](../../BE-TODO/REVIEW.md).
