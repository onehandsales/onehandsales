# ① Object 소속 View 목록 조회

> 2026-10-29: 경로·식별자 명칭은 [View 헤더 API 변경 계약](../../../../VIEW_HEADER_API_NAMESPACE_PLAN/COMMON/API-SPEC/VIEW_HEADER_API_NAMESPACE.md)으로 대체했다. 아래 내용은 변경 이전 계약의 기록이다.

- API명: Object 소속 View 목록 조회
- API 식별자: WORKSPACE_OBJECT_VIEWS_GET
- 계약 상태: superseded (기존 구현 기록)
- 소비자: User Web, 현재는 Backend 구현·검토만 수행
- 일자: 2026-10-26
- 호환성: 신규 GET. 기존 Sidebar·③ 헤더 계약/FE 변경 없음. 마이그레이션·fallback 없음.
- 기준: [API 계약](../../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md), [TODO Software 정본](../../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

## Request

Request 이름: ListWorkspaceObjectViewsRequest. Query DTO: ListWorkspaceObjectViewsQueryDto.

~~~http
GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/view-definitions?viewId=<currentViewId>
Authorization: Bearer <accessToken>
~~~

| 위치 | 필드 | 타입·필수 여부·검증 |
| --- | --- | --- |
| path | workspaceId | 필수 UUID, 현재 Workspace |
| path | objectDefinitionId | 필수 UUID, ③의 objectDefinition.id |
| query | viewId | 선택 UUID string, ③의 viewId 또는 전환 후 현재 선택 ID. 생략 허용, null/빈 값/배열/중복 거부 |
| header | Authorization | 필수 Bearer token, 기존 AuthGuard |
| body/cookie | 없음 | 본문·고유 cookie 요구 없음 |

전역 whitelist/forbidNonWhitelisted/transform과 DTO를 사용한다. 추가 query(userId/workspaceMemberId/actorId/targetType/page/sort 등)는 400이다. 검색·추가 필터·클라이언트 정렬·페이지네이션은 제공하지 않으며 대상 전체 View 요약을 반환한다.

## Response

Status: 200 OK. Body: WorkspaceObjectViewsResponse 단건 객체. items는 항상 배열이다.

| 필드 | 타입·의미 |
| --- | --- |
| items | WorkspaceObjectViewListItem[] |
| items[].viewId | UUID string, View ID |
| items[].viewName | string, 표시 이름 |
| items[].viewIcon | string 또는 null |
| items[].viewType | ViewDefinitionType: TABLE, KANBAN, LIST, GALLERY, CALENDAR, TIMELINE, GANTT, CHART, PIVOT, MAP, DASHBOARD |
| items[].isSelected | boolean, 요청 viewId와 UUID로 같은 경우 true |

~~~json
{
  "items": [
    {
      "viewId": "00000000-0000-4000-8000-000000000801",
      "viewName": "전체 회사",
      "viewIcon": null,
      "viewType": "TABLE",
      "isSelected": true
    }
  ]
}
~~~

대상은 존재하나 View가 없으면 {"items":[]}다. viewId 생략·삭제·다른 대상/Workspace 등 목록에 없으면 전부 isSelected=false다. UUID 대소문자 차이는 동일 선택으로 판단한다. 선택 여부 때문에 순서를 바꾸지 않는다. Favorite·설정·본문·시각·소속 요약을 포함하지 않는다.

## 내부 비즈니스 로직

1. AuthGuard/CurrentUser와 path UUID, Query DTO 검증 후 ListWorkspaceObjectViewsUseCase로 명시적 필드만 전달한다.
2. WorkspaceAccessQuery.hasWorkspaceMembership(currentUser.id, workspaceId)를 1회 호출한다. 없으면 ObjectViewsWorkspaceNotFound. Actor·멤버 ID·헤더 선행 호출은 요구하지 않는다.
3. ObjectDefinitionSummaryQuery의 공개 Port로 workspaceId + objectDefinitionId를 확인한다. 없으면 ObjectViewsObjectDefinitionNotFound.
4. ObjectDefinitionViewsQuery는 ViewDefinition을 workspaceId + objectDefinitionId로 제한하고 id/name/icon/type만 select한다.
5. sortOrder ASC → createdAt ASC → id ASC로 전체 목록을 반환한다. View 반대쪽 소속 FK를 null로 제한하거나 XOR 정책을 추가하지 않는다.
6. UseCase가 선택 UUID를 대소문자 무관하게 비교해 응답을 조합한다. viewId는 DB 목록 필터·정렬·접근 근거가 아니다. DB 오류를 빈 목록으로 바꾸지 않는다.

## DB·transaction·observability

- WorkspaceMember는 workspace 공개 Port, ObjectDefinition은 소유 모듈의 기존 Summary Port, ViewDefinition은 view-definition이 조회한다.
- transaction: 없음. 읽기 전용, 동일 시점 snapshot 계약 없음. 변경 model·rollback·부수 이력·자동 생성·암호화 없음.
- schema/migration/seed/인덱스·업무 DB 변경 없음. idempotency/outbox는 조회이므로 해당 없음.
- 신규 외부 Provider 없음. 기존 인증을 재사용한다.
- 새로운 읽기 log event 없음. 기존 request id/x-request-id·안전한 오류 처리를 사용한다.
- redaction: token·원문 이름/아이콘/응답·개인정보·Provider/DB 원문 오류를 기록하지 않는다.

## Error와 FE 처리

| 상황 | error code / status | FE 처리 / 로그 분류 |
| --- | --- | --- |
| 잘못된 UUID·Query | 기존 Nest validation / 400 | 요청 수정 / warn |
| 인증 실패 | 기존 Unauthorized / 401 | 기존 인증 갱신 / warn |
| 비활성 사용자 | InactiveUser / 403 | 기존 계정 처리 / warn |
| Workspace 부재·비멤버 | ObjectViewsWorkspaceNotFound / 404 | 접근 불가, 이전 목록 제거 / info |
| 대상 부재·다른 Workspace | ObjectViewsObjectDefinitionNotFound / 404 | 대상 접근 불가 / info |
| DB·내부 실패 | InternalServerError / 500 | 오류·재시도, 빈 상태로 오인하지 않음 / error |

404 메시지는 Workspace not found 또는 Object definition not found다. 기존 DomainError *NotFound Filter를 재사용한다. 상태·안전한 오류 형식은 기존 API와 같다. 후속 FE는 [사용 흐름](../USER-FLOW.md)의 캐시·늦은 응답·정상 빈 상태 기준을 적용한다. 검증은 [TEST-AND-REVIEW](../../BE-TODO/TEST-AND-REVIEW.md)에 기록한다.
