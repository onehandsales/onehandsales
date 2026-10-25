# View 헤더 정보 단건 조회 API

- 작성·검토일: 2026-10-25
- API명: View 헤더 정보 단건 조회
- API 식별자: `WORKSPACE_VIEW_HEADER_GET`
- 계약 상태: `confirmed`
- 구현 상태: 미착수
- 소비자: User Web. 현재 계획은 Backend API 구현과 구현 후 검토까지다.
- 확정 근거: 사용자가 API명·경로·Response에 동의했고, 기존 모듈과 같은 접근 검증·공개 Port 경계를 적용하는 조회 절차를 논의한 후 구현 착수 가능한 문서 작성을 요청했다.
- 호환성: 신규 GET endpoint. 기존 사이드바 API의 경로·응답·정렬·권한·오류 계약은 유지한다. DB migration과 기존 소비자 fallback은 필요하지 않다.

이 파일은 HTTP 계약·내부 조회·transaction/observability의 정본이다. [계획 개요](../../README.md), [Backend 구현](../../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md), [DB 범위](../../BE-TODO/DB-SCHEMA.md), [검증 계획](../../BE-TODO/TEST-PLAN.md)을 함께 따른다.

## 1. HTTP 계약

```http
GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId
Authorization: Bearer <accessToken>
```

### 1.1. Request

- Request 계약 이름: `GetWorkspaceViewHeaderRequest`
- 별도 Body/Query DTO class: 없음. Controller의 ParseUUIDPipe로 두 path를 검증한다.

| 위치 | 필드 | 타입 | 필수 | nullable/빈 값 | 검증·출처 |
| --- | --- | --- | --- | --- | --- |
| path | workspaceId | UUID string | 예 | 불가 | ParseUUIDPipe |
| path | viewDefinitionId | UUID string | 예 | 불가 | ParseUUIDPipe |
| header | Authorization | string | 예 | 불가 | 기존 AuthGuard의 Bearer token 검증 |
| query | 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 목록·검색·필터·정렬·페이지 입력 없음 |
| body | 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 사용자/멤버/Actor/소속 Object/List 입력을 받지 않음 |
| cookie | API 고유 요구 없음 | 해당 없음 | 아니오 | 해당 없음 | 기존 공통 인증 갱신과 구분 |

사용자 ID는 CurrentUser에서, 멤버 ID는 Workspace 공개 Port에서 구한다. 추가 query/body에 임의 식별자가 들어와도 조회·소유권 판단에 사용하지 않는다. 전역 validation 정책을 바꾸는 작업은 포함하지 않는다.

### 1.2. Response

- Status: `200 OK`
- Body: 있음. 단건 객체이며 빈 배열이나 204를 반환하지 않는다.
- Response 계약 이름: `WorkspaceViewHeaderResponse`
- 응답은 application의 순수 타입으로 정의하고 Controller가 그대로 반환한다. Prisma/Nest HTTP 타입은 포함하지 않는다.

| 필드 | 타입 | nullable | 출처 |
| --- | --- | --- | --- |
| id | UUID string | 아니오 | ViewDefinition.id |
| name | string | 아니오 | ViewDefinition.name |
| icon | string | 예 | ViewDefinition.icon |
| type | ViewDefinitionType string enum | 아니오 | ViewDefinition.type |
| isFavorite | boolean | 아니오 | 현재 Workspace·멤버·View의 즐겨찾기 존재 여부 |
| objectDefinition | ViewHeaderTargetSummary | 예 | 연결된 Object의 요약 |
| listDefinition | ViewHeaderTargetSummary | 예 | 연결된 List의 요약 |
| objectDefinition.id / listDefinition.id | UUID string | 객체가 있으면 아니오 | 각 소속 대상 ID |
| objectDefinition.name | string | 객체가 있으면 아니오 | ObjectDefinition.singularName을 name으로 매핑 |
| listDefinition.name | string | 객체가 있으면 아니오 | ListDefinition.name |
| objectDefinition.icon / listDefinition.icon | string | 예 | 각 소속 대상 icon |

`ViewDefinitionType`은 application 순수 문자열 union으로 TABLE, KANBAN, LIST, GALLERY, CALENDAR, TIMELINE, GANTT, CHART, PIVOT, MAP, DASHBOARD를 사용한다. 현재 Prisma ViewTypeEnum의 11개 값과 맞추고, application에서 Prisma enum을 import하지 않는다.

List 소속 예시:

```json
{
  "id": "00000000-0000-4000-8000-000000000801",
  "name": "이번 달 마감",
  "icon": "calendar-days",
  "type": "TABLE",
  "isFavorite": true,
  "objectDefinition": null,
  "listDefinition": {
    "id": "00000000-0000-4000-8000-000000000401",
    "name": "영업 파이프라인",
    "icon": "kanban"
  }
}
```

Object 소속이면 objectDefinition에 요약을 반환한다. 소속 ID가 둘 다 null이면 두 요약도 null이고, 둘 다 있으면 각각 검증 후 둘 다 반환한다. XOR·기본 소속·대시보드 제목 우선순위를 추가하지 않는다. 유효한 View에 즐겨찾기가 없으면 200과 isFavorite=false다.

description/configJson/sortOrder/시각·감사 ID/즐겨찾기 ID/다른 View 목록과 기록값은 응답에 추가하지 않는다. 시간 응답 필드가 없으므로 timezone 변환도 없다.

### 1.3. 오류 계약

| 상황 | error code | HTTP | 소비자 처리 | 로그 분류 |
| --- | --- | --- | --- | --- |
| 인증 헤더·토큰·세션 오류 | 기존 Unauthorized/기존 Nest 인증 오류 | 401 | 기존 apiClient의 인증 갱신·세션 처리 재사용 | warn |
| 기존 인증 과정에서 비활성 사용자 | InactiveUser | 403 | 공통 계정 접근 처리. 헤더 API에서 별도 역할 정책을 만들지 않음 | warn |
| 잘못된 Workspace/View UUID | 기존 Nest Bad Request 응답 | 400 | 잘못된 요청으로 처리 | warn |
| Workspace 부재·비멤버 | ViewHeaderWorkspaceNotFound | 404 | 접근 불가 상태. 이전 대상의 헤더를 새 대상 정보처럼 사용하지 않음 | info |
| View 부재·다른 Workspace의 View | ViewDefinitionNotFound | 404 | 해당 View 접근 불가 처리 | info |
| 참조 Object가 요청 Workspace에서 조회되지 않음 | ViewHeaderObjectDefinitionNotFound | 404 | 부분 소속 정보를 정상 응답으로 반환하지 않음 | info |
| 참조 List가 요청 Workspace에서 조회되지 않음 | ViewHeaderListDefinitionNotFound | 404 | 부분 소속 정보를 정상 응답으로 반환하지 않음 | info |
| DB/예상하지 못한 내부 실패 | 기존 InternalServerError | 500 | 성공·빈 데이터로 치환하지 않고 기존 오류 계약 전달 | error |

새 오류는 view-definition의 DomainError subclass로 정의한다. `*NotFound`는 기존 HttpExceptionFilter가 404로 변환하므로 Filter 분기를 추가하지 않는다. 메시지는 순서대로 `Workspace not found`, `View not found`, `Object definition not found`, `List definition not found`를 사용한다.

도메인 오류 예시:

```json
{
  "statusCode": 404,
  "error": "ViewDefinitionNotFound",
  "message": "View not found"
}
```

400/401/403의 기존 응답 형태를 헤더 전용 형태로 바꾸지 않는다. 표의 로그 분류는 운영 기준이며 새 읽기 이벤트나 전역 로깅 변경을 뜻하지 않는다.

## 2. 내부 조회 절차와 데이터 경계

1. Controller에서 기존 AuthGuard/CurrentUser/ParseUUIDPipe를 사용한다. 인증은 기존 resolver가 처리하며 UseCase가 User 테이블을 다시 조회하지 않는다.
2. `WorkspaceAccessQuery.getWorkspaceMemberAccess(currentUser.id, workspaceId)`를 호출한다. 없으면 ViewHeaderWorkspaceNotFound. 결과의 workspaceMemberId를 사용하고 actorId는 조회 허용 조건으로 쓰지 않는다. hasWorkspaceMembership을 중복 호출하지 않는다.
3. View Query Port에 `{ workspaceId, viewDefinitionId, workspaceMemberId }`를 전달한다. Repository는 ViewDefinition을 `id=viewDefinitionId AND workspaceId=workspaceId`로 조회하고 없으면 null을 반환한다. UseCase가 ViewDefinitionNotFound로 바꾼다.
4. Repository는 현재 View의 개인 즐겨찾기 존재 여부도 함께 구할 수 있다. `viewFavoriteDefinitions` relation에서 `workspaceId`와 `workspaceMemberId`를 제한하고 id를 최대 1개만 선택해 isFavorite을 계산한다. View 관계 자체가 viewDefinitionId를 한정한다. 중복 행 수에 상관없이 존재 여부만 사용하고 중복 정리·정렬 변경을 하지 않는다. 이를 물리적으로 단일 SQL이라고 가정하지 않는다.
5. View의 objectDefinitionId가 있으면 Object 공개 요약 Query에 `{ workspaceId, objectDefinitionId }`를 전달한다. 해당 모듈 Repository가 `id AND workspaceId` 조건으로 요약을 조회한다. null이면 ViewHeaderObjectDefinitionNotFound. 없던 소속 ID가 null인 경우와 잘못된 참조를 구분한다.
6. listDefinitionId도 List 공개 요약 Query로 같은 방식으로 확인한다. null 조회 결과는 ViewHeaderListDefinitionNotFound. 소속 ID가 둘 다 있으면 두 경계를 모두 확인하며 임의로 하나를 우선하지 않는다.
7. Object의 singularName을 name으로 매핑하고 View·개인 상태·두 소속 요약을 WorkspaceViewHeaderResponse로 조합한다. 누락된 참조를 조용히 null로 바꾸거나 생성하지 않는다.

즐겨찾기에서 클릭했더라도 이번 리소스는 View다. 본인의 즐겨찾기 행 존재를 View 접근의 필수 조건으로 쓰지 않으며, 등록 해제 직후의 요청은 유효한 View에 대해 isFavorite=false로 응답할 수 있다. View/Object/List에는 생성자 개인 필터를 붙이지 않고 Workspace 멤버십 경계를 적용한다. 즐겨찾기만 개인 멤버 범위다.

## 3. DB·transaction·observability

스키마 근거: [schema.prisma](../../../../BE/prisma/schema.prisma)의 WorkspaceMember, ObjectDefinition, ListDefinition, ViewDefinition, ViewFavoriteDefinition.

| 모델 | 접근·소유 모듈 | 필요한 데이터·조건 |
| --- | --- | --- |
| WorkspaceMember | 조회, Workspace 공개 Port | 인증 userId + workspaceId → 멤버 ID. Actor 조회는 기존 Port의 부수 결과이며 필수 아님 |
| ViewDefinition | 조회, view-definition | View ID + Workspace ID → 요약과 두 소속 ID |
| ViewFavoriteDefinition | 조회, view-definition | 현재 View + Workspace + 현재 멤버 → 존재 여부 |
| ObjectDefinition | 조회, object-definition 공개 Port | Object ID + Workspace ID → id/singularName/icon |
| ListDefinition | 조회, list-definition 공개 Port | List ID + Workspace ID → id/name/icon |

View 관계는 기본 단일 ID FK이므로 같은 Workspace를 DB가 자동 보장한다고 가정하지 않는다. View와 두 부모, Favorite의 범위를 각각 제한한다. Prisma schema의 nullable 소속과 현재 제약을 유지한다.

- transaction: 없음. 읽기만 수행하며 동일 시점 snapshot까지 보장하는 계약은 아니다. 다중 조회 중 참조가 사라지면 정상 부분 응답 대신 위 오류 계약을 따른다.
- 생성/수정/삭제/감사 row/부수 로그 model: 없음. rollback 대상 없음.
- 자동 생성·암호화·기록값 변환: 신규 처리 없음. 기존 인증 흐름 재사용.
- 외부 Provider: 기존 인증 이외 신규 호출 없음.
- idempotency/outbox: 읽기 API이므로 해당 없음. 읽기 결과는 다른 요청의 변경에 따라 달라질 수 있다.
- request id: 기존 RequestIdMiddleware와 x-request-id 응답 header 재사용.
- log event key/신규 structured log: 없음. 기존 Object/List/Favorite 조회 기준과 동일하다. mutation용 logger/provider를 관성적으로 복사하지 않는다.
- redaction: 토큰·View/Object/List 이름·아이콘·응답 원문·개인정보·provider 원문 오류를 로그에 남기지 않는다.
- provider error context: 신규 Provider가 없어 해당 없음. DB 오류도 기존 안전한 500 변환을 사용한다.
