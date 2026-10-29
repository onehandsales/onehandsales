# View 타입별 헤더 작업 API 명세

- 기준일: 2026-10-29
- 문서 상태: `draft`. A01/A02는 기존 `implemented` 계약의 재사용 설명이며, A03/A04/A05는 신규 제안이다.
- 소비자: User Web. Backend 내부 실행기는 공개 application/query Port를 사용한다.
- 작성 기준: [TODO Software Agent Reference](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [API 계약 규칙](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md).
- 제품 정책·선행 결정: [D01~D14](../PLANNING-REVIEW.md).
- 호환성: 현재 문서는 기존 endpoint·응답·DB를 바꾸지 않는다. 신규 endpoint는 추가 방식 제안이며, 기존 settings에 버전 등을 추가한다면 별도 호환성 검토가 필요하다.

## 1. API 목록과 경로

```text
W = /api/users/me/workspaces/:workspaceId
H = W/view-header/view-definitions/:viewDefinitionId
```

| ID | API 명 | Method / 경로 | 상태 | 역할 |
| --- | --- | --- | --- | --- |
| A01 | 선택 View 정렬 설정 조회 | GET H/sorts | 기존 implemented | MAP 목록 정렬 팝업의 저장 상태 복원 |
| A02 | 선택 View 보기 설정 조회 | GET H/settings | 기존 implemented | 대시보드 위젯 구성과 직접 원본 요약 복원 |
| A03 | View 원본 데이터 목록 조회 | GET W/view-definitions/:viewDefinitionId/raw-data | 신규 draft | CHART/PIVOT 집계 대상 또는 선택 구간의 실제 행 |
| A04 | 대시보드 위젯 추가 후보 조회 | GET H/widget-candidates | 조건부 신규 draft | 추가할 기존 View 선택 |
| A05 | View 구성 저장 | PATCH H/configuration | 후속 draft | 대시보드 편집 결과 원자적 저장 |

신규 경로는 제안이다. A03은 실제 본문 데이터 조회이므로 별도 View 데이터 경로를 제시했다. 주 화면 API가 같은 요구를 충족하면 그 계약으로 통합할 수 있으며 원본 실행기를 별도로 중복 구현하지 않는다.

A04는 D10에서 후보 범위를 정한 뒤 필요성을 판단한다. 한 Object/List의 View 목록으로 충분하면 기존 목록 GET을 재사용한다. A05는 GET 우선 단계와 별도이며 범용 설정 저장으로 확대할지는 D12에서 정한다.

`대시보드 편집 시작` 전용 endpoint는 제안하지 않는다. 편집 모드 진입은 FE 상태 전환이다. 현재 등록된 Controller에는 A03/A04/A05가 없다.

## 2. 공통 요청·자료형·DB 경계

| 위치 | 필드 | 타입·필수/nullable | 규칙 |
| --- | --- | --- | --- |
| Header | Authorization | 필수 string, null 불가 | Bearer access token. 기존 AuthGuard 사용 |
| Path | workspaceId | 필수 UUID, null 불가 | 현재 사용자 멤버십 검증 |
| Path | viewDefinitionId | 필수 UUID, null 불가 | 같은 Workspace의 View 검증 |
| Header | x-request-id | 기존 middleware 규격 | 요청 추적용, 권한 판단에 사용하지 않음 |

- Cookie 기반의 신규 인증 방식은 추가하지 않는다. 사용자 ID·Actor ID·View Type을 client의 권한 근거로 받지 않는다.
- UUID 비교/조회 키는 기존 정규화 규칙을 따른다. 저장 JSON이나 참조 경로 순서·중복을 임의 변경하지 않는다.
- `UUID`는 string, `JsonValue`는 JSON의 모든 값과 null을 뜻한다. 속성 생략과 명시적 null은 구분한다.
- 기존 GET의 선택 속성/시각/내부 Actor 필드를 임의 확장하지 않는다.
- Number/Currency의 Decimal은 기존 값 응답처럼 문자열을 사용한다. Date는 날짜 전용 문자열, Timestamp·감사 시각은 UTC ISO 문자열로 구분한다.
- 현재 View 관계는 기본 ID FK 중심이다. 같은 Workspace/View/Attribute 연결과 실행 가능한 경로를 FK 존재만으로 보장하지 않는다.
- 선행 멤버십 조회는 읽기 권한 기준이다. 역할별 수정 권한이 이미 구현되어 있다고 가정하지 않는다.

## 3. A01 — 선택 View 정렬 설정 조회

### 목적과 요청

- API 식별자: A01 / 계약 상태: 기존 `implemented` 재사용.
- Request 이름: `GetWorkspaceViewSortsRequest`는 이 문서의 경로·빈 입력 표기다. 새 Query DTO class를 만드는 제안이 아니다.
- Response 이름: FE의 기존 `ViewSortsResponse`.
- 성공: `200 OK`, Body 있음, `data` wrapper 없음.
- Query/Body: 추가 입력 없음. 기존 공통 `EmptyRequestPipe`로 미전송/빈 객체만 허용한다.
- 검색·필터·pagination: 설정 목록에는 없음. 지원 속성 전체 후보를 반환하는 API가 아니다.

```json
{
  "viewDefinitionId": "00000000-0000-4000-8000-000000000101",
  "viewType": "MAP",
  "viewSortDefinitions": [
    {
      "id": "00000000-0000-4000-8000-000000000201",
      "sourceScope": "RECORD",
      "attributeDefinitionId": "00000000-0000-4000-8000-000000000301",
      "referenceAttributeIdPathJson": [],
      "sortDirection": "DESC",
      "sortOrder": 0,
      "configJson": null
    }
  ],
  "attributeDefinitions": [
    {
      "id": "00000000-0000-4000-8000-000000000301",
      "title": "최근 연락일",
      "type": "Timestamp",
      "objectDefinitionId": "00000000-0000-4000-8000-000000000401",
      "listDefinitionId": null,
      "icon": null,
      "isMultiselect": false,
      "configJson": null
    }
  ]
}
```

| 응답 필드 | 타입 / null | 의미 |
| --- | --- | --- |
| viewDefinitionId | UUID / 불가 | 선택 View |
| viewType | 기존 11종 View Type / 불가 | 서버에 저장된 타입 |
| viewSortDefinitions | ViewSort[] / 불가 | 저장 정렬 규칙. 없으면 [] |
| attributeDefinitions | ViewAttribute[] / 불가 | 규칙이 참조하는 경로/최종 속성 메타데이터 |

`ViewSort`는 예시의 id/sourceScope/attributeDefinitionId/referenceAttributeIdPathJson/sortDirection/sortOrder/configJson을 갖는다. `sourceScope`는 RECORD/LIST_ENTRY, 방향은 ASC/DESC, configJson은 nullable JsonValue다. 전체 공통 메타데이터 필드의 정본은 [기존 메뉴 명세](../../../DONE/VIEW_HEADER_MENU_QUERY_PLAN/COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md)다.

### 내부 비즈니스 로직과 DB

1. Workspace 공개 Port로 멤버십을 확인한다. 부재/비멤버는 기존 404다.
2. workspaceId + viewDefinitionId로 View를 찾고 명시된 Object/List 참조를 각 소유 모듈에서 확인한다.
3. `ViewSortDefinition`을 같은 Workspace/View로 제한하고 `sortOrder ASC → createdAt ASC → id ASC`로 읽는다.
4. 경로 JSON과 참조 Attribute 존재/Workspace를 검증하고 메타데이터를 일괄 조회한다.
5. 저장된 방향·경로·JSON을 보존하여 응답한다. Select/Status 옵션이나 실제 업무값은 조회하지 않는다.

`sortOrder`는 조건 우선순위이고 `sortDirection`은 실제 값의 방향이다. 실제 MAP 목록의 값 비교·정렬·페이지 처리는 D04/D07에 따른 주 화면 실행 계약이다.

Transaction: 없음. 읽기 전용이며 Actor·기본 정렬 생성/자동 보정 없음. Idempotency/outbox: 불필요. 오류·관측성은 8~9절과 기존 계약을 따른다.

## 4. A02 — 선택 View 보기 설정 조회

### 목적과 요청

- API 식별자: A02 / 계약 상태: 기존 `implemented` 재사용.
- Request 이름: `GetWorkspaceViewSettingsRequest`는 경로·빈 입력 표기이며 새 DTO class를 추가하지 않는다.
- Response 이름: FE의 기존 `ViewSettingsResponse`.
- 성공: `200 OK`, Body 있음, wrapper 없음.
- Query/Body: A01과 같은 빈 입력 계약. 검색·필터·pagination 없음.
- 편집 진입 시 저장 구성을 읽고 초안으로 복사한다. 유효한 기존 캐시가 있으면 재사용할 수 있으며 모든 클릭이 반드시 네트워크 호출을 발생시키는 것은 아니다.

```json
{
  "viewDefinitionId": "00000000-0000-4000-8000-000000000102",
  "viewType": "DASHBOARD",
  "viewName": "파이프라인 요약",
  "objectDefinitionId": null,
  "listDefinitionId": "00000000-0000-4000-8000-000000000402",
  "configJson": null,
  "viewAttributeSettingDefinitions": [],
  "viewGroupDefinitions": [],
  "viewGroupSettingDefinitions": [],
  "viewWidgetDefinitions": [
    {
      "id": "00000000-0000-4000-8000-000000000202",
      "contentViewDefinitionId": "00000000-0000-4000-8000-000000000103",
      "titleOverride": "단계별 예상 금액",
      "sortOrder": 0,
      "isHidden": false,
      "layoutJson": { "x": 0, "y": 0, "width": 6, "height": 4 },
      "configJson": { "showTitle": true }
    }
  ],
  "contentViewDefinitions": [
    {
      "id": "00000000-0000-4000-8000-000000000103",
      "name": "단계별 예상 금액",
      "type": "CHART",
      "icon": null
    }
  ],
  "attributeDefinitions": [],
  "selectOptions": [],
  "statusOptions": []
}
```

| 필드 | 타입 / null | 의미 |
| --- | --- | --- |
| viewDefinitionId, viewType, viewName | UUID, View Type, string / 불가 | View 기본 표시 |
| objectDefinitionId, listDefinitionId | UUID / 가능 | 저장 소속. 이 읽기는 XOR를 강제하지 않음 |
| configJson | JsonValue / 가능 | View 설정 원본 |
| viewAttributeSettingDefinitions | ViewAttributeSetting[] / 불가 | 표시 역할·속성·숨김 등 |
| viewGroupDefinitions | ViewGroup[] / 불가 | 그룹·계열·피벗 축 |
| viewGroupSettingDefinitions | ViewGroupSetting[] / 불가 | 그룹별 이름·순서·숨김·접힘 |
| viewWidgetDefinitions | ViewWidget[] / 불가 | 위젯 행 전체 |
| contentViewDefinitions | {id: UUID, name: string, type: ViewType, icon: string 또는 null}[] / 불가 | 직접 원본 View 요약 |
| attributeDefinitions | ViewAttribute[] / 불가 | 설정이 참조하는 속성 |
| selectOptions, statusOptions | ViewOption[] / 불가 | 참조 속성의 옵션 표시 정보 |

`ViewWidget`는 예시의 필드를 갖는다. id/contentViewDefinitionId는 UUID, titleOverride는 nullable string, sortOrder는 integer, isHidden은 boolean, layoutJson/configJson은 저장 JSON 원본이다. layoutJson은 필수 DB JSON 컬럼이며 기존 GET은 배치 객체 규격을 강제하지 않는다. configJson은 nullable이다. JSON의 x/y/width/height/showTitle 예시는 허용 값·기본값의 최종 계약이 아니다.

### 내부 비즈니스 로직과 DB

1. A01과 동일한 접근·원본 소속 검증을 수행한다.
2. `ViewAttributeSettingDefinition`, `ViewGroupDefinition`, `ViewGroupSettingDefinition`, `ViewWidgetDefinition`을 요청 Workspace/View 범위로 조회한다.
3. 그룹 설정의 부모 그룹·Attribute·옵션 연결과 속성 메타데이터를 검증한다.
4. 위젯 원본 ID만 중복 제거해 같은 Workspace의 `ViewDefinition` 요약을 조회한다.
5. 직접 원본이 누락되면 기존 설정 오류로 처리한다. 숨긴 위젯·동일 원본의 여러 위젯은 모두 유지한다.
6. 직접 요약과 저장 설정을 반환한다. 위젯 결과 계산·재귀 실행·중첩 금지 정책은 수행하지 않는다.

Transaction: 없음. 여러 SELECT의 단일 시점 snapshot 보장 없음. 변경 모델·자동 생성 없음. Idempotency/outbox: 불필요. 위젯 결과 조회는 각 원본 View의 별도 데이터 실행이다.

## 5. A03 — View 원본 데이터 목록 조회

### 목적·상태·요청 제안

- API 식별자: A03 / 상태: `draft` / 관련 결정: D01~D09, D14.
- 소비자: CHART/PIVOT의 헤더 원본 버튼과 구간 선택.
- Request DTO 제안: `GetWorkspaceViewRawDataQueryDto`.
- Response DTO 제안: `WorkspaceViewRawDataResponse`.
- 성공 제안: `200 OK`, Body 있음. 원본이 없으면 items=[].

| 위치 | 필드 | 필수 / null | 제안 또는 결정할 내용 |
| --- | --- | --- | --- |
| Query | cursor | 선택 string / 불가 | 생략=첫 페이지. 빈 값·중복·배열·위조값 거부 제안, 길이·수명·구조 D07/D14 |
| Query | selectionToken | 선택 string / 불가 | 검증 가능한 구간 토큰 방식의 후보. 생략=전체 구간. 구조화된 선택 DTO와의 최종 선택은 D06 |
| Body | 없음 | 해당 없음 | GET으로 미저장 필터 JSON을 전달하는 계약은 두지 않음. 초안 실행은 D08에서 별도 결정 |
| 기타 Query | 미정 | 해당 없음 | 검색·임의 정렬·페이지 크기 입력을 자동 지원하지 않음. D04/D09/D14에서 확정 |

서버는 View Type과 대상·설정을 조회한다. 토큰은 권한을 대체하지 않으며, 선택 구간은 원본 View의 그룹·계열·피벗 축과 연결되어야 한다. 원본 전체/집계 기여 행의 구분은 D05에서 정한다.

### 응답 형태 제안

다음은 제안 DTO의 주요 필드 예시다. `cells.values`에는 기존 typed value 필드를 재사용하는 방향이며 예시에서 사용하지 않는 nullable 필드는 생략했다. 최종 필드·nullable·옵션/참조 표시명은 D09에서 확정한다.

```json
{
  "viewDefinitionId": "00000000-0000-4000-8000-000000000103",
  "viewType": "CHART",
  "rowType": "LIST_ENTRY",
  "columns": [
    {
      "columnKey": "amount",
      "title": "예상 금액",
      "sourceScope": "LIST_ENTRY",
      "attributeDefinitionId": "00000000-0000-4000-8000-000000000302",
      "referenceAttributeIdPathJson": [],
      "attributeType": "Currency"
    }
  ],
  "items": [
    {
      "recordDefinitionId": "00000000-0000-4000-8000-000000000501",
      "objectDefinitionId": "00000000-0000-4000-8000-000000000401",
      "listEntryDefinitionId": "00000000-0000-4000-8000-000000000601",
      "cells": [
        {
          "columnKey": "amount",
          "values": [{ "attributeType": "Currency", "numberValue": "5000000" }]
        }
      ]
    }
  ],
  "pageInfo": { "hasNextPage": false, "nextCursor": null }
}
```

| 필드 | 제안 타입 / null | 의미 |
| --- | --- | --- |
| viewDefinitionId | UUID / 불가 | 선택 View |
| viewType | CHART 또는 PIVOT / 불가 | 이 기능의 소비 타입 제안. 실제 지원 제한은 계약에서 확정 |
| rowType | RECORD 또는 LIST_ENTRY / 불가 | 결과 행의 기준 |
| columns | RawDataColumn[] / 불가 | 화면의 열 메타데이터 |
| columns[].columnKey | string / 불가 | 응답 내 열 식별자. 속성 ID만으로 경로·역할 중복을 합치지 않음 |
| columns[].title | string / 불가 | 표시 라벨 |
| columns[].sourceScope | RECORD 또는 LIST_ENTRY / 불가 | 값의 출발점 |
| columns[].attributeDefinitionId | UUID / 불가 | 최종 속성 |
| columns[].referenceAttributeIdPathJson | UUID[] / 불가 | 순서 있는 경로 |
| columns[].attributeType | 기존 AttributeType / 불가 | 값 타입 |
| items | RawDataRow[] / 불가 | 페이지에 포함된 원본 행 |
| items[].recordDefinitionId, objectDefinitionId | UUID / 불가 | 원본 Record와 소속 |
| items[].listEntryDefinitionId | UUID / 가능 | Object 행은 null, List 행은 Entry ID |
| items[].cells | RawDataCell[] / 불가 | 열별 값. 열 key를 사용 |
| cells[].columnKey | string / 불가 | columns의 해당 열 식별자 |
| cells[].values | TypedValue[] / 불가 | 다중값 보존. 값 없음과 null row의 최종 표현은 D03/D09 |
| pageInfo.hasNextPage | boolean / 불가 | 다음 페이지 존재 |
| pageInfo.nextCursor | string / 가능 | 마지막 페이지는 null |

`TypedValue` 후보는 attributeType과 기존 textValue/numberValue/booleanValue/dateValue/timestampValue/jsonValue/selectOptionId/statusOptionId/targetRecordDefinitionId/targetObjectDefinitionId/targetActorId를 따른다. 타입별 필드 포함 규칙, 경로로 도출된 값의 원본 식별, 옵션·Actor·Record 표시명 및 집계 문맥은 아직 전체 계약이 아니다. 값 수정 요청을 이 응답으로 바로 생성하지 않는다.

### 내부 비즈니스 로직 제안

1. 인증·Workspace 멤버십·View 접근을 확인한다.
2. D01에 따라 조회 대상과 행 기준을 판정한다. Object/List FK 우선순위나 List 단일 Object를 추정하지 않는다.
3. 저장 설정 또는 D08에서 별도 계약한 초안을 선택하고 일관성 범위를 결정한다.
4. 필터·그룹·Measure·정렬에 필요한 속성을 일괄 읽고 소속·타입·참조 경로 실행 가능성을 검증한다.
5. D03/D05의 연산·집계 규칙으로 행 집합과 기여 기준을 구성한다. 미지원 규칙을 조용히 생략하지 않는다.
6. 구간 선택이 있으면 D06에 따라 그룹/계열/피벗 조건을 검증해 추가한다. 합계와 빈 값 그룹을 구분한다.
7. 전체 필터·정렬을 적용한 뒤 행 단위 페이지를 선택한다. JOIN 증식으로 페이지·건수가 늘어나지 않도록 한다.
8. 필요한 값·표시 메타데이터를 batch 조회해 응답한다. Record/ListEntry 기준 식별자와 다중값을 보존한다.

읽는 모델: ViewDefinition, ViewFilterGroupDefinition, ViewFilterConditionDefinition, ViewSortDefinition, ViewAttributeSettingDefinition, ViewGroupDefinition, 필요한 ViewGroupSettingDefinition, AttributeDefinition 및 옵션, RecordDefinition/RecordAttributeValueDefinition, ListEntryDefinition/ListEntryValueDefinition. 참조 경로·표시명 해석에 필요한 관계/Actor는 확정된 공개 Port로 조회한다.

변경 모델/자동 생성: 없음. 기존 Record 목록 Port는 Object+cursor 중심이며 View 실행을 지원한다고 가정하지 않는다. 공통 실행 계약을 확장하고 소유 모듈의 Port로 연결한다.

Transaction: `보류` — 쓰기는 없으며 읽기 snapshot/격리 수준의 필요성을 D07에서 결정한다. 조회 실패 시 rollback할 업무 변경은 없다. 서로 다른 HTTP 요청에 같은 snapshot을 제공하는 기능은 read transaction 하나만으로 해결되지 않는다.

Idempotency/outbox: 쓰기 없는 조회에는 불필요. 서버에 조회 snapshot/토큰 상태를 저장하는 안을 선택한다면 부수 모델·수명·정리 계약을 별도로 추가한다. 외부 provider 신규 호출 없음.

## 6. A04 — 대시보드 위젯 추가 후보 조회

### 목적·요청 제안

- API 식별자: A04 / 상태: 조건부 `draft` / 관련 결정: D07, D10, D14.
- Request DTO 제안: `ListWorkspaceViewWidgetCandidatesQueryDto`.
- Response DTO 제안: `WorkspaceViewWidgetCandidatesResponse`.
- 성공 제안: `200 OK`, Body 있음. 후보가 없으면 items=[].
- Query: `cursor?: string`, 생략은 첫 페이지. null/빈 값/배열 거부 제안. 크기·정렬·수명 D14.
- Body: 없음. 검색·타입 필터를 포함할지는 D10/D14에서 결정한다.
- 한 Object/List의 View 목록으로 충분하면 기존 목록 GET을 재사용하고 A04를 추가하지 않는다.

```json
{
  "viewDefinitionId": "00000000-0000-4000-8000-000000000102",
  "items": [
    {
      "viewDefinitionId": "00000000-0000-4000-8000-000000000103",
      "viewName": "단계별 예상 금액",
      "viewType": "CHART",
      "viewIcon": null,
      "objectDefinitionId": null,
      "listDefinitionId": "00000000-0000-4000-8000-000000000402"
    }
  ],
  "pageInfo": { "hasNextPage": false, "nextCursor": null }
}
```

| 필드 | 제안 타입 / null | 의미 |
| --- | --- | --- |
| viewDefinitionId | UUID / 불가 | 후보를 추가할 대시보드 |
| items | WidgetCandidate[] / 불가 | 접근·지원 정책을 만족하는 후보 |
| items[].viewDefinitionId, viewName, viewType | UUID, string, View Type / 불가 | 후보 원본 View |
| items[].viewIcon | string / 가능 | 아이콘 |
| items[].objectDefinitionId, listDefinitionId | UUID / 가능 | 후보 소속 식별 |
| pageInfo | A03과 같은 형태 / 불가 | 목록 조회 페이지 정보 |

### 내부 비즈니스 로직과 DB

1. 인증·Workspace 멤버십과 대상 View를 확인한다.
2. D10에서 확정한 대시보드 후보 기능의 타입·지원 범위를 검사한다.
3. 같은 Workspace의 View를 조회하고 허용 타입·자기/중첩/순환 정책 및 접근 기준을 적용한다.
4. 안정적인 순서로 페이지를 반환한다. 현재 GET에 없는 개인/공유 권한 모델을 임의 추가하지 않는다.
5. 후보라는 이유로 저장 시 검증을 생략하지 않는다. 같은 원본이 이미 배치되어 있다는 이유만으로 제외할지는 D10에서 정한다.

읽는 모델: ViewDefinition, 필요한 소속 요약. 중첩/순환 판정이 필요하면 ViewWidgetDefinition. 변경/자동 생성 없음.

Transaction: 없음 제안. 후보 목록은 저장 권한 예약이나 snapshot 보장이 아니다. Idempotency/outbox: 불필요. 외부 provider 없음. 후보 정렬·선택 규칙이 기존 목록과 다르면 별도 계약으로 명시한다.

## 7. A05 — 대시보드 편집 결과 저장

### 목적·요청 제안

- API 식별자: A05 / 상태: 후속 `draft` / 관련 결정: D10~D14.
- Request DTO 제안: `UpdateWorkspaceViewConfigurationDto`.
- Response DTO 제안: `WorkspaceViewConfigurationSaveResponse`.
- 성공 제안: `200 OK`, Body 있음. 저장 완료된 설정 표현을 반환하는 방향이며, 현재 `ViewSettingsResponse` 재사용 여부와 버전 필드 추가는 D13에서 확정한다.
- Query: 없음 제안. Header의 동시성·멱등 키는 D13에서 확정한다.

| Body 필드 후보 | 타입 | 필수/null/변경 의미 |
| --- | --- | --- |
| configJson | JsonValue | 선택 제안. 생략=보존, null=제거 여부 D11/D12. 대시보드 허용 키만 대상 |
| viewWidgetDefinitions | Widget 입력[] | 전체 교체/부분 변경 중 D12 결정. []를 자동 전체 삭제로 해석하지 않음 |
| 위젯 id | UUID | 기존 위젯 수정 시 식별. 신규 위젯 ID/재요청 방식 D13 |
| contentViewDefinitionId | UUID | 신규 참조/참조 교체 정책 D10/D12 |
| titleOverride | string 또는 null | null과 빈 문자열의 표시/저장 의미 D11 |
| sortOrder, isHidden | integer, boolean | 순서·숨김. 삭제와 숨김 구분 |
| layoutJson, configJson | JSON | 타입·범위·반응형·미지원 키·생략/null 의미 D11 |
| 변경 감지 값·멱등 식별자 | 미정 | Header/Body 위치, 타입, 필요 여부, 재요청 범위 D13 |

이는 필드 후보 표이며 요청 전체 DTO 확정본이 아니다. `contentViewDefinitions`, `attributeDefinitions`, 옵션 메타데이터 같은 조회 전용 배열을 쓰기 입력으로 그대로 받지 않는다. 사용자/Actor/Workspace ID를 Body로 덮어쓰지 않는다.

응답 형태는 `200 + 저장된 View 설정` 제안이다. 4절 A02 예시가 설정 표현의 기준이며, 충돌 검사용 토큰을 추가하는지와 실제 저장 revision에 대응하는 응답을 만드는 방법은 D13에서 함께 정한다. 아직 완전한 mutation 계약이 아니므로 구현 상태로 표시하지 않는다.

### 내부 비즈니스 로직 제안

1. 현재 사용자와 수정 권한을 확인하고 서버에서 감사 Actor를 결정한다. Actor 부재 처리도 D12에서 정한다.
2. 수정할 대시보드, 기존 위젯의 소속, 허용 필드·JSON 규격, 명시 삭제 범위를 검증한다.
3. application이 TransactionManager로 저장 경계를 시작한다. D13에서 정한 충돌·멱등 판정을 함께 처리한다.
4. 필요한 권한/소속/원본 존재를 저장 시점 기준으로 재검증한다. 순환 금지 채택 시 동시 그래프 변경까지 방어한다.
5. 위젯 추가·수정·삭제와 필요한 View 설정/감사 필드를 같은 원자적 작업으로 반영한다. 기존 생성 Actor는 보존하고 수정 Actor는 서버에서 기록한다.
6. 보내지 않은 필터·정렬·원본 View·업무값은 이 저장 범위로 덮어쓰지 않는다.
7. 완료한 논리 저장에 대응하는 응답을 만든다. 성공 뒤 별도 GET 실패를 저장 rollback으로 오인시키지 않는다.

변경 모델 제안: ViewWidgetDefinition, 필요한 ViewDefinition 설정/감사 필드. 동시성·멱등 저장소 추가 여부는 D13에서 결정하며 현재 스키마에 있다고 가정하지 않는다.

Transaction: `필요`. 위 변경과 필수 멱등/감사 기록이 함께 성공해야 한다. 실패 시 전체 변경 rollback. controller/application에서 Prisma 구현체를 직접 사용하지 않는다.

Idempotency: 신규 위젯 포함 재요청의 중복 방지 필요. 키 출처·사용자/Workspace/View/operation scope·보관 기간·같은 키 다른 payload·이전 성공 응답 재사용은 D13에서 확정한다. HTTP PATCH라는 이유만으로 멱등성이 보장되지 않는다.

Outbox: 현재 제안처럼 View 구성만 저장하고 외부 후속 부수 효과가 없으면 불필요. 후속 이벤트·provider 작업을 추가할 때 재검토한다. 외부 HTTP 호출을 저장 transaction 안에 두지 않는다.

## 8. 오류와 FE 처리

### 기존 A01/A02 — 현재 계약 유지

| 상황 | HTTP / error code | FE 처리 | 로그 |
| --- | --- | --- | --- |
| 인증 없음/만료 | 401 / 기존 인증 오류 | 기존 로그인·갱신 흐름 | 기존 인증 기준 |
| 비활성 사용자 | 403 / InactiveUser | 접근 제한 | 기존 인증 기준 |
| UUID·추가 Query/Body 오류 | 400 / 기존 Nest validation envelope | 요청 수정, 무한 재시도 금지 | debug |
| Workspace 부재/비멤버 | 404 / ViewHeaderWorkspaceNotFound | 이전 메뉴와 혼용 금지 | debug |
| View 부재/타 Workspace | 404 / ViewHeaderViewDefinitionNotFound | 현재 선택 재확인 | debug |
| 조회된 설정의 참조·구조 무결성 실패 | 500 / ViewHeaderConfigurationInvalid | 빈 설정으로 표시하지 않고 실패 처리 | error |
| 예상하지 못한 서버 실패 | 500 / InternalServerError | 재시도/오류 표시 | error |

```json
{
  "statusCode": 500,
  "error": "ViewHeaderConfigurationInvalid",
  "message": "View configuration is invalid"
}
```

### 신규 A03/A04/A05 — 아래 값은 제안

| 상황 | HTTP / code 후보 | FE 처리 | 로그 |
| --- | --- | --- | --- |
| 인증 실패 | 기존 401/403 재사용 | 기존 인증 흐름 | 기존 기준 |
| 경로 UUID·커서·구간·쓰기 DTO 형식 오류 | 400 / ValidationError 재사용 검토 | 입력/요청 수정 | debug |
| Workspace/View 접근 불가 | 404 / ViewDataWorkspaceNotFound, ViewDataViewDefinitionNotFound 후보 | 이전 데이터 제거, 접근 불가 표시 | debug |
| 저장 구성의 끊긴 참조 | 500 / ViewDataConfigurationInvalid 후보 | 설정 조회/수정 안내, 원본 누락 숨기지 않음 | error |
| 지원하지 않는 실행 규칙·모호한 원본 | 상태/code D01~D05/D14 확정 필요 | 조건을 무시한 성공 응답 금지 | 원인별 확정 |
| 후보 타입·위젯 참조·배치 정책 위반 | 상태/code D10~D12/D14 확정 필요 | 해당 입력 수정 안내 | 원인별 확정 |
| 수정 권한 없음 | 상태/code D12 확정 필요 | 저장 제한, 정보 노출 정책 일치 | 기존 권한 기준 |
| 동시 편집 충돌 | 409 / ViewConfigurationConflict 후보 | 초안 보존, 최신 구성과 재조정 | warn |
| 멱등 키 재사용 시 payload 불일치 | 409 / ViewConfigurationRequestConflict 후보 | 새 논리 요청으로 재검토 | warn |
| DB/예상치 못한 실패 | 500 / InternalServerError | 재시도 가능 여부 구분 | error |

신규 code를 선언하는 것만으로 기존 HttpExceptionFilter가 원하는 status를 반환한다고 가정하지 않는다. 정확한 매핑·envelope를 Controller 테스트로 확인한 뒤 confirmed로 전환한다. 저장 데이터 오류를 무조건 client 400으로 바꾸지 않는다.

## 9. 관측성·FE 연결·검증 경계

| API | event key | 상태 |
| --- | --- | --- |
| A01 | view.header.sorts.read_failed | 기존 구현 |
| A02 | view.header.settings.read_failed | 기존 구현 |
| A03 | view.data.raw.read_failed | 신규 제안 |
| A04 | view.header.widget_candidates.read_failed | 신규 제안 |
| A05 | view.configuration.save_succeeded / save_failed / save_conflict | 신규 제안 |

- requestId, 인증 userId, workspaceId, viewDefinitionId, durationMs, 안전한 count/errorCode/reason으로 추적한다.
- 토큰·커서/selectionToken 원문·비교값·고객명·Record 값·위젯 제목·원본 provider 오류를 로그에 남기지 않는다.
- 신규 조회에는 외부 provider 호출을 추가하지 않는다. 지도 제공자 연결은 별도 범위다.
- FE query key는 사용자/Workspace/View와 유효 설정·선택 구간·커서를 구분한다. View 전환 뒤 늦은 응답을 이전 화면에 적용하지 않는다.
- 읽기 실패와 정상 빈 배열을 구분한다. 저장 실패/충돌 시 초안을 보존한다. 저장 성공 시 settings·위젯 구성과 영향받은 결과 캐시를 갱신하되 관련 없는 원본 View 캐시를 무조건 초기화하지 않는다.
- 계약이 confirmed 되기 전 미지원 동작을 성공하는 UI처럼 노출하지 않는다. 기존 팝업을 기술 정보 목록으로 바꾸지 않는다.

설계 반례와 완료 기준은 [비즈니스 검토](../PLANNING-REVIEW.md), 구현 계층·테스트는 [Backend](../../BE-TODO/IMPLEMENTATION.md), 사용자 흐름·캐시는 [Frontend](../../FE-TODO/IMPLEMENTATION.md)를 따른다.
