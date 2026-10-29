# View 헤더 메뉴 조회 API 계약

- 작성일: 2026-10-29
- 계약 상태: `draft` — 구현 전 초안. 구현 완료를 의미하지 않는다.
- 소비자: User Web. 이번 실행 범위는 Backend만이다.
- 작성 기준: [TODO Software Agent Reference](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [API 계약 규칙](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md).
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

세 Request DTO는 동일한 두 경로 필드를 표현하는 계약명이다. 실제 presentation에서 공통 Params DTO 또는 기존 `ParseUUIDPipe`로 재사용할 수 있다. 빈 Query 검증은 별도 공통 DTO/pipe로 처리한다.

| 위치 | 필드 | 타입 | 필수 / nullable | 검증 |
| --- | --- | --- | --- | --- |
| Header | `Authorization` | string | 필수 / 불가 | 기존 `Bearer <app access token>`과 AuthGuard |
| Path | `workspaceId` | UUID string | 필수 / 불가 | 빈 문자열·비 UUID 거부. UUID 대소문자로 접근 결과가 달라지지 않는다. |
| Path | `viewDefinitionId` | UUID string | 필수 / 불가 | 같은 Workspace에 있는 View인지 확인 |
| Query | 없음 | — | — | 검색·페이지·정렬 방향 등 임의 Query는 400 처리하는 초안 |
| Body | 없음 | — | — | 필드가 있는 Body는 400 처리하는 초안 |
| Cookie | 없음 | — | — | 이 API만의 인증 Cookie 계약 없음 |

- 성공: `200 OK`, `Content-Type: application/json`, 항상 응답 Body가 있다.
- 목록 pagination/search/request filter: 없음. 대상 View의 해당 저장 설정 전체를 반환한다.
- `sortDirection`은 요청으로 받아 덮어쓰는 값이 아니다. 저장된 값을 응답한다.
- 현재 선택 View가 없으면 후속 소비자는 요청하지 않는다. 문자열 `null`을 경로에 넣지 않는다.
- `userId`, `workspaceMemberId`, Actor ID는 클라이언트로부터 받지 않는다.

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

`comparisonOperator`는 현재 DB가 String이다. 예시 `gte`를 전체 지원 연산자로 확정하거나 Attio의 `$gte`로 자동 변경하지 않는다. 이 API는 조건을 평가하지 않는다. 비교값에 들어 있는 Actor/Record ID의 표시명 해석은 10절의 계약 검토 항목이다.

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

아래 JSON은 [더미 설정 문서](../../../../BE/prisma/VIEW_DEMO_SETTINGS.md)와 [fixture](../../../../BE/prisma/view-demo-settings.fixture.json)의 예시다. 지원 가능한 모든 값·필수 키·자동 기본값 계약은 아니다. 실제 응답은 해당 View의 저장값을 따른다.

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
- 조회 API는 ViewType만으로 임의 400을 만들지 않고 저장된 해당 설정을 반환하는 초안이다. 저장 설정이 없으면 배열은 비어 있다.

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
- 같은 부모 안의 하위 그룹과 조건을 하나의 메뉴로 섞는 표시 순서는 G00에서 확인한다. 두 배열을 각각 반환하는 계약이므로 배열 위치만으로 두 종류 사이의 동률 순서를 보장하지 않는다.
- `referenceAttributeIdPathJson`은 경로 순서 그대로이며 정렬하지 않는다.
- `sortDirection`은 각 조건 또는 그룹의 저장 방향을 표시하는 값이다. 설정 목록 배열의 ASC 정렬을 바꾸는 인자가 아니다.
- 동률을 위한 `createdAt/id` 순서는 우리 API의 결정적 반환 규칙이며 Attio 내부 구현을 확인한 사실이 아니다.

## 7. 내부 비즈니스 로직과 DB 경계

1. 기존 AuthGuard로 현재 사용자를 확인하고 경로 UUID/빈 Query·Body 계약을 검증한다.
2. Workspace 모듈의 공개 `WorkspaceAccessQuery`로 현재 사용자의 멤버십을 확인한다. 부재/비멤버는 같은 404다. 읽기를 위해 Actor를 새로 생성하지 않는다.
3. View 소유 query port로 `workspaceId + viewDefinitionId`에 해당하는 View를 찾는다. 없거나 다른 Workspace이면 같은 404다.
4. View가 참조하는 Object/List ID가 있으면 각 소유 모듈의 공개 Summary Port로 같은 Workspace 소속을 확인한다. Object/List XOR나 List 단일 Object 정책을 새로 강제하지 않는다.
5. 요청한 메뉴의 설정 테이블만 `workspaceId + viewDefinitionId` 조건으로 읽는다. 주 화면 원본 값과 다른 메뉴 설정을 불필요하게 조회하지 않는다.
6. 참조 속성 ID·경로 ID·옵션 ID·위젯 원본 View ID를 모아서 일괄 조회한다. Attribute/옵션은 AttributeDefinition 모듈의 새 공개 batch query port를 사용한다. 위젯 원본 View는 View 소유 port가 조회한다.
7. Workspace/현재 View/그룹/속성/옵션 소속을 확인한다. 필터 부모·조건 그룹, GroupSetting의 부모, 위젯 원본이 다른 Workspace/View의 값을 섞지 않게 한다. 누락된 참조를 다른 Workspace 검색으로 보완하지 않는다.
8. 응답에 필요한 필드만 매핑하고 6절 순서를 적용한다. 설정이 없으면 200과 빈 배열을 반환하며 기본 설정을 DB에 저장하지 않는다.

세부 구현은 [Backend 작업 문서](../../BE-TODO/IMPLEMENTATION.md)를 따른다. SourceScope/관계 경로의 전체 실행 가능성 검증은 저장 설정을 안전하게 읽는 소속 검증과 구분한다. 저장된 String/JSON을 읽는다는 이유로 아직 정하지 않은 연산자·다중값·집계 제약을 추가하지 않는다.

| 읽기 대상 | 소유/접근 경계 | 생성·수정·삭제 |
| --- | --- | --- |
| Workspace 멤버십 | workspace 공개 Port | 없음 |
| Object/List 요약 | object-definition / list-definition 공개 Port | 없음 |
| View와 필터·정렬·표시·그룹·위젯 설정 | view-definition 자체 query port + Prisma adapter | 없음 |
| AttributeDefinition / SelectOption / StatusOption | attribute-definition 공개 batch Port | 없음 |

## 8. 오류 계약 초안

신규 코드명은 아직 구현되지 않았다. 기존 `HttpExceptionFilter`의 형식과 `NotFound → 404` 매핑을 따른다.

| 상황 | error code / 구분 | HTTP | 소비자 처리 기준 | 로그 |
| --- | --- | --- | --- | --- |
| 토큰 없음·만료·잘못됨 | 기존 AuthGuard `Unauthorized` | 401 | 기존 인증 갱신/로그인 흐름 | 기존 인증 정책 |
| 비활성 사용자 | 기존 `InactiveUser` | 403 | 접근 중단 | 기존 인증 정책 |
| UUID 형식·허용하지 않은 Query/Body | Nest validation `Bad Request` | 400 | 요청을 수정, 같은 요청 자동 반복 금지 | debug |
| Workspace 없음·비멤버 | 기존 `ViewHeaderWorkspaceNotFound` 재사용 | 404 | 접근 불가 처리, 이전 메뉴 내용 혼용 방지 | debug |
| View 없음·타 Workspace View | 신규 `ViewHeaderViewDefinitionNotFound` | 404 | 현재 선택 View 재확인 | debug |
| 저장된 참조 누락·교차 소속·깨진 필터 계층 등 안전한 응답 불가 | 신규 `ViewHeaderConfigurationInvalid` | 500 | 설정 조회 실패와 재시도 경로 제공 | error |
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

## 9. Transaction / Observability / 소비자 계약

### Transaction과 부수 효과

- transaction: 없음. 저장 설정과 표시 메타데이터의 읽기만 수행한다.
- 변경 모델·rollback 범위·부수 이력 저장: 없음.
- idempotency key/outbox: 불필요. 반복 GET은 쓰기를 만들지 않는다.
- 외부 Provider 호출: 신규 호출 없음. 기존 인증은 유지하며 메뉴를 읽기 위해 Attio API를 호출하지 않는다.
- 여러 읽기 사이에 다른 요청이 설정을 바꿀 수 있다. 현재 초안은 단일 시점 snapshot을 보장하지 않는다. 엄격한 snapshot이 필요하면 application 주도의 read transaction 계약과 격리 수준을 별도로 검토한다.

### 관측성

- 신규 오류 event: `view.header.filters.read_failed`, `view.header.sorts.read_failed`, `view.header.settings.read_failed`.
- 저장 참조 문제는 해당 event에 `errorCode=ViewHeaderConfigurationInvalid`와 안전한 `reason`을 넣는다.
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

- [ ] 빈 Query/Body 검증을 기존 validation 패턴으로 구현하고 400 응답 예시를 controller 테스트와 맞춘다.
- [ ] 필터 하위 그룹과 조건의 혼합 표시 순서를 결정한다. 전체 루트를 하나로 제한하는 제약은 추가하지 않는다.
- [ ] 참조 경로 JSON이 UUID 배열인지 검증하는 범위와 깨진 그룹 계층의 오류 기준을 확정한다. 현재 String 연산자를 임의 whitelist로 막지 않는다.
- [ ] ActorReference/RecordReference 비교값의 표시명 해석이 첫 조회 범위에 필요한지 확인한다. 현재 초안은 원본 JSON과 속성/Select/Status 메타데이터까지만 보장한다. 라벨을 합성하지 않는다.
- [ ] KANBAN 카드 접기·MAP 표시 구분 등 아직 저장 계약이 없는 설정은 추후 확장임을 유지한다.
- [ ] JSON 예시와 실제 fixture/schema를 대조하고 API 계약 상태를 `confirmed`로 갱신한 뒤 구현한다.
