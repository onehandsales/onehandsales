# View ID 기준 공통 헤더 조회

- 계약 상태: implemented
- 소비자: User Web
- 목적: 즐겨찾기의 viewDefinitionId로 해당 View를 처음부터 선택해 기존 공통 헤더·본문을 연다.
- 호환성: 기존 대상 기준 헤더 GET의 요청·응답·첫 View 선택은 유지한다. 신규 GET과 Frontend 진입 route를 추가한다.
- DB: ViewDefinition/ViewFavoriteDefinition 및 소유 모듈의 Workspace/Object/List 조회를 재사용한다. schema·enum·migration·실제 데이터·ENV 변경 없음.

## 요청

`GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId`

Path: workspaceId, viewDefinitionId는 필수 UUID string이다. 기존 ParseUUIDPipe를 사용한다. Authorization: Bearer access token이 필수다. userId/workspaceMemberId는 인증 컨텍스트와 Workspace 공개 Port에서 구한다.

Request DTO: 별도 필드형 DTO 없음. Query/Body 입력은 없으며 공통 EmptyRequestPipe로 빈 입력만 허용한다. userId·sourceType·targetId 등 추가 Query/Body와 배열·null·예약 키는 기존 공통 검증 기준으로400이다. sourceType은 Frontend URL에서 열 위치를 선택할 때 사용하며 이 GET으로 전송하지 않는다.

## 응답

200 OK, Body 있음. Response DTO: WorkspaceViewHeaderResponse. 기존 대상 기준 헤더와 같은7개 필드다.

| 필드 | 타입 | nullable | 의미 |
| --- | --- | --- | --- |
| viewId | UUID string | 이 API 성공 시 아니오 | 요청한 View ID. 즐겨찾기의 viewDefinitionId와 동일 |
| viewName | string | 이 API 성공 시 아니오 | 현재 저장된 View 이름 |
| viewIcon | string | 예 | 현재 저장된 View 아이콘 |
| viewType | 기존 ViewDefinitionType | 이 API 성공 시 아니오 | enum11종을 그대로 보존. 본문 실행 지원은 기존 계약의 세 타입 |
| isFavorite | boolean | 아니오 | 현재 Workspace 멤버의 실제 등록 상태 |
| objectDefinition | TargetSummary | 예 | 연결된 Object의 id/name/icon. name은 기존 singularName |
| listDefinition | TargetSummary | 예 | 연결된 List의 id/name/icon |

TargetSummary의 id/name은 필수 string이고 icon은 nullable string이다. Workspace ID는 path에 있으므로 중복 반환하지 않는다. 내부 FK·감사 필드·정렬·필터·설정·본문 값은 반환하지 않는다. 성공 시 요청 View가 없는 nullable View 응답으로 대체하지 않는다.

소속에 새 XOR 제약을 추가하지 않는다. Object/List가 둘 다 있으면 둘 다 반환하고, 모두 없으면 둘 다 null이다. 연결된 대상은 각각 같은 Workspace인지 공개 Summary Port로 검증한다. Frontend는 단일 소속이면 바로 열고, 둘이면 두 대상 중 열 위치를 선택하게 한다. 소속이 없으면 헤더 정보를 보존하면서 본문을 열 위치가 없다는 상태를 표시하며 임의 원본을 생성하지 않는다.

```json
{
  "viewId": "00000000-0000-4000-8000-000000000801",
  "viewName": "영업 단계별",
  "viewIcon": null,
  "viewType": "KANBAN",
  "isFavorite": true,
  "objectDefinition": null,
  "listDefinition": {
    "id": "00000000-0000-4000-8000-000000000501",
    "name": "영업 파이프라인",
    "icon": null
  }
}
```

## 내부 흐름과 소유권

1. AuthGuard/ParseUUIDPipe/EmptyRequestPipe가 HTTP 입력을 검증한다.
2. Application UseCase가 WorkspaceAccessQuery.getWorkspaceMemberAccess로 멤버십을 확인한다. Actor가 없어도 읽을 수 있다.
3. View 소유 Query Port의 findWorkspaceViewHeaderById를 workspaceId+viewDefinitionId+인증으로 얻은 workspaceMemberId로 호출한다.
4. Adapter는 View의 최소 필드와 현재 멤버/Workspace의 Favorite 존재 여부만 읽는다. 목록의 첫 View를 찾는 기존 메서드를 대신 호출하지 않는다. Favorite가 해제됐더라도 접근 가능한 View는 isFavorite=false로 연다.
5. 연결된 Object/List의 소속과 이름·아이콘을 각 소유 모듈의 공개 Summary Port로 확인한다. 두 연결이 있으면 둘 다 검증한다.
6. 대상 기준 기존 헤더와 공통 target reader·응답 mapper로 조합한다. 현재 사용자의 실상태를 사용하며 isFavorite=true를 고정하지 않는다.

Controller → UseCase → 공개 Query Port → Infrastructure의 기존 계층을 따른다. application/domain에 Prisma·Supabase·ConfigService·Express 타입을 추가하지 않는다. 다른 모듈의 Repository 구현체를 직접 사용하지 않는다.

## 오류

| 상황 | 코드 | HTTP | Frontend |
| --- | --- | --- | --- |
| 인증 누락/만료 | 기존 인증 오류 |401| 기존 refresh·로그인 흐름 |
| 비활성 사용자 | 기존 InactiveUser |403| 기존 접근 불가 |
| 잘못된 UUID/추가 입력 | 기존 입력 검증 |400| 잘못된 진입으로 표시 |
| Workspace 부재/비멤버 | ViewHeaderWorkspaceNotFound |404| 공통 접근 불가·재시도 |
| View 부재/다른 Workspace | ViewHeaderViewDefinitionNotFound |404| 공통 접근 불가, 기본 View로 대체하지 않음 |
| 연결 Object/List의 소속 부재 | 기존 ViewHeaderObjectDefinitionNotFound / ViewHeaderListDefinitionNotFound |404| 같은 접근 불가 |
| 저장소 실패 | 기존 InternalServerError |500| 공통 실패·재시도, 원문 노출 없음 |

## Transaction·Idempotency·Observability

- transaction: 없음. 기존 공통 헤더처럼 멤버십·View·대상 요약을 조회하며 업무 row·이력·최근 선택을 저장하지 않는다. 여러 요청 사이 snapshot을 보장하지 않는다. 본문은 자체 권한·소속·설정 검증을 다시 수행한다.
- 변경 model/rollback: 없음. idempotency/outbox: 조회 전용으로 해당 없음. 외부 Provider 호출 추가 없음.
- log event: 신규 별도 이벤트 없음. 기존 RequestIdMiddleware/Auth/HTTP 오류 처리를 따른다. 토큰·View 이름·응답·Provider/DB 원문을 추가 로그로 남기지 않는다.

## Frontend 연결

즐겨찾기는 `/app/workspaces/:workspaceId/view-definitions/:viewDefinitionId`로 이동한다. 사용자·Workspace·View별 새 헤더 Query key와 AbortSignal을 사용하고 기존 대상 기준 헤더 GET을 함께 호출하지 않는다. 단일 소속에서 첫 본문 요청부터 이 View ID를 사용한다. 일반 대상 route와 공통 WorkspaceViewPage·헤더·툴바·본문·각 메뉴 API를 재사용한다.

이중 소속의 명시 선택은 Frontend URL의 sourceType=OBJECT|LIST로 보존한다. URL과 다른 소속·응답 View ID는 거부하고 본문을 요청하지 않는다. 없는 소속을 기본 원본으로 대체하지 않는다. 새로고침/뒤로가기/빠른 다른 즐겨찾기 선택에서도 URL의 View가 우선한다. View 선택·검색·페이지·메뉴 임시 상태는 기존 scope 격리를 따른다.

Backend 검토와 검증을 완료한 뒤 Frontend 구현을 시작한다. 테스트는 실제 PostgreSQL의 단건 View·멤버 Favorite·Workspace 격리와 HTTP 검증, 기존 첫 View 동작 회귀, Frontend 최초 본문 ID·URL 복원·늦은 응답·모바일을 포함한다.
