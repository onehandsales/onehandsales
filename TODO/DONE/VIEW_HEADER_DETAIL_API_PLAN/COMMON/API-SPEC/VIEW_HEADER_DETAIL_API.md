# Object/List 클릭 시 View 헤더 조회 API

- API명: Workspace 대상의 View 헤더 조회
- API 식별자: WORKSPACE_VIEW_HEADER_GET
- 계약 상태: implemented
- 구현 상태: Backend 구현·검증·규칙 검토 완료
- 소비자: User Web. 현재는 Backend만 구현한다.
- 갱신일: 2026-10-25
- 근거: 사용자는 Object/List 클릭 → ③ 헤더 조회 → 드롭다운 클릭 시 ①/② 조회 순서를 지정하고 ③만 먼저 구현하도록 요청했다. View 자동 생성·저장은 후속 범위다.
- 호환성: 미구현 View ID 입력 계획을 대상 ID 입력으로 대체한다. 기존 Sidebar API/FE는 유지한다. 이전 GET /view-definitions/:viewDefinitionId 경로는 이번에 구현하지 않는다.

[API 계약 규칙](../../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md), [TODO Software 기준](../../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)을 따른다. [G01](../../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md), [테스트](../../BE-TODO/TEST-PLAN.md), [G99](../../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)와 연결한다.

## 1. Request

Request 계약 이름: GetWorkspaceViewHeaderRequest. Query DTO: GetWorkspaceViewHeaderQueryDto.

~~~http
GET /api/users/me/workspaces/:workspaceId/view-header?targetType=OBJECT&targetId=<objectDefinitionId>
GET /api/users/me/workspaces/:workspaceId/view-header?targetType=LIST&targetId=<listDefinitionId>
Authorization: Bearer <accessToken>
~~~

Query만 다른 하나의 endpoint다.

| 위치 | 필드 | 타입·필수 여부 | 검증·출처 |
| --- | --- | --- | --- |
| path | workspaceId | 필수 UUID string | 기존 ParseUUIDPipe |
| query | targetType | 필수 OBJECT 또는 LIST | DTO IsIn, 대소문자 그대로 검증 |
| query | targetId | 필수 UUID string | DTO IsUUID, 클릭한 Object/List ID |
| header | Authorization | 필수 Bearer token | 기존 AuthGuard/CurrentUser |
| body | 없음 | 해당 없음 | 사용자·멤버·Actor·View ID를 받지 않음 |
| cookie | 고유 요구 없음 | 해당 없음 | 기존 인증 갱신과 구분 |

Query의 null·빈 값·배열·중복 값을 허용하지 않는다. 기존 전역 whitelist/forbidNonWhitelisted/transform을 재사용한다. 계약 외 userId/workspaceMemberId/actorId/viewId query는 400이며 소유권에 사용하지 않는다.

## 2. Response

Response 계약 이름: WorkspaceViewHeaderResponse. Status: 200 OK. Body: 단건 객체.

| 필드 | 타입 | nullable·의미 |
| --- | --- | --- |
| viewId | UUID string | View가 없으면 null |
| viewName | string | View가 없으면 null |
| viewIcon | string | View 또는 아이콘이 없으면 null |
| viewType | ViewDefinitionType | View가 없으면 null |
| isFavorite | boolean | 현재 멤버의 선택 View 즐겨찾기 여부, View가 없으면 false |
| objectDefinition | ViewHeaderTargetSummary | OBJECT 요청의 요약, LIST 요청이면 null |
| listDefinition | ViewHeaderTargetSummary | LIST 요청의 요약, OBJECT 요청이면 null |
| 요약.id | UUID string | 클릭한 대상 ID |
| 요약.name | string | Object.singularName 또는 List.name |
| 요약.icon | string | nullable |

ViewDefinitionType은 순수 application 문자열 union TABLE, KANBAN, LIST, GALLERY, CALENDAR, TIMELINE, GANTT, CHART, PIVOT, MAP, DASHBOARD다. Prisma 타입을 공개하지 않는다.

Object 예시:

~~~json
{
  "viewId": "00000000-0000-4000-8000-000000000801",
  "viewName": "전체 회사",
  "viewIcon": "table",
  "viewType": "TABLE",
  "isFavorite": false,
  "objectDefinition": {
    "id": "00000000-0000-4000-8000-000000000101",
    "name": "회사",
    "icon": "building-2"
  },
  "listDefinition": null
}
~~~

List 예시:

~~~json
{
  "viewId": "00000000-0000-4000-8000-000000000901",
  "viewName": "전체 영업",
  "viewIcon": null,
  "viewType": "TABLE",
  "isFavorite": true,
  "objectDefinition": null,
  "listDefinition": {
    "id": "00000000-0000-4000-8000-000000000401",
    "name": "영업 파이프라인",
    "icon": "kanban"
  }
}
~~~

View 없음 예시:

~~~json
{
  "viewId": null,
  "viewName": null,
  "viewIcon": null,
  "viewType": null,
  "isFavorite": false,
  "objectDefinition": {
    "id": "00000000-0000-4000-8000-000000000101",
    "name": "회사",
    "icon": null
  },
  "listDefinition": null
}
~~~

View가 없는 정상 상태와 대상이 없는 404를 구분한다. 후속 FE는 대상 요약과 보기 없는 상태를 표시하고 유효한 viewId만 목록/본문 연결에 사용한다. 시각·설명·config·기록값·전체 View 목록·Favorite 행 ID는 응답하지 않는다.

## 3. 내부 비즈니스 로직과 데이터 경계

1. Controller는 AuthGuard/CurrentUser/ParseUUIDPipe/Query DTO를 적용하고 인증 사용자·Workspace·targetType/targetId만 UseCase로 전달한다.
2. WorkspaceAccessQuery.getWorkspaceMemberAccess를 한 번 호출해 멤버십과 서버의 workspaceMemberId를 구한다. 없으면 ViewHeaderWorkspaceNotFound. actorId=null인 읽기를 허용한다.
3. targetType에 맞는 ObjectDefinitionSummaryQuery 또는 ListDefinitionSummaryQuery를 호출한다. 각 owning module이 id + workspaceId로 조회하며 없으면 해당 대상 NotFound다. boolean Access Query나 전체 Sidebar 목록을 중복 호출하지 않는다.
4. ViewDefinitionHeaderQuery.findFirstWorkspaceViewHeader는 workspaceId와 클릭한 대상 FK로 조회한다. 현재 초기 조회는 sortOrder ASC → createdAt ASC → id ASC의 첫 View다. 최근 선택 이력과 별도 기본 View 설정은 저장하지 않는다.
5. 선택 View의 viewFavoriteDefinitions를 같은 workspaceId와 현재 workspaceMemberId로 제한하고 id 최대 1개를 조회해 isFavorite을 계산한다. 중복 row를 정리하거나 즐겨찾기 존재를 View 조회 조건으로 강제하지 않는다.
6. View가 없으면 View 필드 null·isFavorite=false와 대상 요약을 반환한다. DB 실패를 View 없음으로 바꾸지 않는다.
7. 클릭한 대상 요약과 View 정보를 7개 최상위 필드로 조합한다. Object.singularName은 name으로 매핑한다.

요약은 클릭한 대상 문맥이다. View의 다른 소속 FK도 설정돼 있더라도 그 FK를 조회하거나 XOR·혼합 Object 정책을 추가하지 않는다. 요청 Workspace와 클릭 대상 FK를 모두 만족하는 View만 반환한다. 다른 종류의 대상을 임의 탐색하지 않는다.

## 4. 오류 계약

| 상황 | 코드·상태 | FE 처리·로그 분류 |
| --- | --- | --- |
| 인증 누락·실패 | 기존 Unauthorized/Nest 오류, 401 | 기존 인증 갱신, warn |
| 비활성 사용자 | 기존 InactiveUser, 403 | 기존 계정 처리, warn |
| 잘못된 path/query·추가 query | 기존 Nest validation, 400 | 요청 오류 처리, warn |
| Workspace 부재·비멤버 | ViewHeaderWorkspaceNotFound, 404 | 이전 헤더를 새 대상에 사용하지 않음, info |
| Object 부재·다른 Workspace | ViewHeaderObjectDefinitionNotFound, 404 | 대상 접근 불가, info |
| List 부재·다른 Workspace | ViewHeaderListDefinitionNotFound, 404 | 대상 접근 불가, info |
| DB·내부 실패 | 기존 InternalServerError, 500 | 조회 실패·재시도, error |

새 404는 view-definition DomainError로 정의하고 기존 *NotFound 변환을 사용한다. 메시지는 Workspace not found / Object definition not found / List definition not found다. 기존 Filter·인증 응답은 바꾸지 않는다.

~~~json
{
  "statusCode": 404,
  "error": "ViewHeaderObjectDefinitionNotFound",
  "message": "Object definition not found"
}
~~~

## 5. DB·transaction·observability

| 모델 | 소유 모듈 | 조회 범위 |
| --- | --- | --- |
| WorkspaceMember | workspace 공개 Port | 인증 userId + workspaceId |
| ObjectDefinition | object-definition 공개 Summary Port | id + workspaceId, id/singularName/icon |
| ListDefinition | list-definition 공개 Summary Port | id + workspaceId, id/name/icon |
| ViewDefinition | view-definition | workspaceId + 대상 FK, 순서의 첫 요약 |
| ViewFavoriteDefinition | view-definition | 선택 View + workspaceId + 현재 workspaceMemberId |

- transaction: 없음. 읽기만 하며 다중 조회의 동일 시점 snapshot을 보장하는 계약은 아니다.
- 변경·자동 생성·암호화·감사/부수 이력 model·rollback: 없음.
- schema/migration/seed/인덱스·업무 DB 데이터 변경: 없음.
- idempotency/outbox: 읽기이므로 해당 없음.
- 외부 Provider: 기존 인증 이외 신규 호출 없음.
- structured log/event key: 새 읽기 이벤트 없음. 기존 request id와 x-request-id를 재사용한다.
- redaction: 토큰·원문 이름·아이콘·응답·개인정보·Provider/DB 원문 오류를 로그에 남기지 않는다.
- provider error context: 신규 Provider 없음. 기존 안전한 500 응답을 사용한다.

## 6. 범위와 검증

신규 HTTP endpoint는 이 GET 하나다. ①/② 목록, 즐겨찾기 클릭·생성·삭제, View 생성/저장·기본 View 자동 생성, FE·본문·공유 권한은 후속 범위다. 내부 Summary Port는 HTTP API가 아니다.

UseCase·HTTP 인증/Query 검증·빈 View·공개 Port/DI·Repository Workspace/멤버 격리·동률 정렬·기존 Sidebar/Attribute/Record 회귀를 검증한다. 실제 DB fixture는 명시한 테스트 DB에서 rollback하며 업무 DB로 대체하지 않는다. 실패·skip·미확인은 [테스트 계획](../../BE-TODO/TEST-PLAN.md)과 [작업 로그](../../../../../TODO_LOG/2026-10-25/VIEW_HEADER_TARGET_GET/WORK_LOG.md)에 기록한다.
