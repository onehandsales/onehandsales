# 관리 항목과 첫 TABLE 생성 API

계약 상태: implemented (2026-11-07)

소비자: User Web 사이드바 관리 대상 추가 모달.
기존 `OBJECT_DEFINITION_CREATE_PLAN`의 Object 단독 생성 계약을 이 생성 흐름으로 대체한다.

## HTTP 계약

- `POST /api/users/me/workspaces/:workspaceId/object-definitions`
- 인증: Bearer access token. `workspaceId`는 필수 UUID.
- Body: `{ objectDefinitionName: string, icon?: string | null, description?: string | null }`
- 이름은 trim 후 1~80자. `apiSlug`, `singularName`, `pluralName`에 같은 이름을 저장한다.
- icon/description은 생략·null·빈 문자열이면 null, 나머지는 원문을 보존한다.
- 계약 외 필드(예: viewType, attributeNames)는 400. Query/cookie 입력 없음.
- 성공: `201 { objectDefinitionId: string, viewDefinitionId: string }`. 두 ID 모두 필수 UUID, null 불가.
- 응답 필드 추가로 기존 objectDefinitionId 소비는 유지된다. 생성의 저장 범위는 달라지므로 BE/FE를 함께 반영한다.

## 저장과 모듈 경계

`CreateWorkspaceObjectDefinitionUseCase`가 orchestration과 transaction owner다.
Workspace 공개 접근 포트로 멤버와 WORKSPACE_MEMBER Actor를 확인한다. 기존처럼 role 제한은 없다.
검증한 같은 Workspace/Actor와 이번 transaction에서 생성한 ID만 아래 공개 생성 포트에 전달한다.

| 순서 | owning module / model | 생성 값 |
| --- | --- | --- |
| 1 | object-definition / ObjectDefinition | 사용자 이름·아이콘·설명 |
| 2 | attribute-definition / AttributeDefinition | Object 소속, apiSlug=name, title=이름, type=Text, sortOrder=0, isMultiselect=false |
| 3 | view-definition / ViewDefinition | Object 소속, listDefinitionId=null, name=전체 {이름}, type=TABLE, sortOrder=0 |
| 4 | view-definition / ViewAttributeSettingDefinition | 위 속성, sourceScope=RECORD, attributeDisplayRole=TITLE, referenceAttributeIdPathJson=[], sortOrder=0, isHidden=false |

- 첫 View의 configJson은 `{ rowDensity: "COMFORTABLE" }`. 필터/정렬/그룹 및 실제 Record는 만들지 않는다.
- 기본 이름 속성은 생성 모달에 추가 입력을 요구하지 않는 공통 초기값이다. 매물 가격·주소 등 업종별 필드는 만들지 않는다.
- 모든 행의 workspaceId/createdByActorId는 위 검증 결과로 고정한다. 클라이언트는 하위 연결 ID를 지정할 수 없다.
- transaction: 필요. 공유 `TransactionManager`/필수 `TransactionContext`로 네 모델을 전부 commit하거나 rollback한다.
- 각 소유 모듈의 공개 application port를 좁은 생성 전용 module이 export한다. 다른 모듈의 Prisma repository를 import/inject하지 않으며 전체 조회 모듈을 역참조하지 않는다.
- 포트는 내부 orchestration 전용이다. 기존 임의 Object/Attribute에 대한 공개 HTTP 생성 기능을 의미하지 않는다.
- schema/migration 변경 없음. 기존 Object에는 View/속성을 소급 생성하지 않는다.

## 실패·중복·관측

| 상황 | status / error | FE 처리 |
| --- | --- | --- |
| 인증 실패 | 401 / Unauthorized | 기존 인증 복구 흐름 |
| UUID·타입·계약 외 필드 오류 | 400 / Nest validation error | 오류 표시 |
| trim 후 빈 이름 | 400 / OBJECT_DEFINITION_NAME_REQUIRED | 입력 유지 후 재입력 |
| 이름 80자 초과 | 400 / OBJECT_DEFINITION_NAME_TOO_LONG | 입력 유지 후 재입력 |
| Workspace 없음 또는 비멤버 | 404 / ObjectDefinitionWorkspaceNotFound | 오류 표시, 이동 안 함 |
| 이름 중복(동시 요청 포함) | 409 / ObjectDefinitionApiSlugAlreadyExists | 입력 유지 후 이름 수정 |
| Actor 누락 또는 하위 생성 실패 | 500 / InternalServerError | 전부 rollback, 오류 표시 후 재시도 |

- idempotency key 없음. 기존 workspaceId+apiSlug unique 제약으로 동시 중복을 409 처리한다. 자동 POST 재시도 없음. 응답 유실 후 동일 이름 재시도도 409이며 성공 응답을 재생하지 않는다.
- 외부 provider/후속 비동기 처리 없음. outbox 불필요. 향후 서비스 분리 시 초기화 완료 상태·멱등 command·보상을 새 계약으로 설계해야 한다.
- 성공 로그 `crm.objectDefinition.created`는 commit 이후만 기록한다. requestId, userId, workspaceId, objectDefinitionId, viewDefinitionId를 포함한다.
- transaction 실패 로그 `crm.objectDefinition.createFailed`는 requestId/내부 식별자만 포함하며 원문 exception/이름/설명/icon/token을 기록하지 않는다. 예상 중복은 warn, 그 외 저장 실패는 error.
- 로그는 DB transaction 밖이며 별도 이력 행을 생성하지 않는다. 공통 HTTP 로깅/오류 필터가 상태와 처리 시간을 기록한다.

## 프론트 후속 동작

- 기존 이름 → 아이콘/설명 → 생성 모달과 로딩 UX를 유지한다. View 타입 선택을 추가하지 않는다.
- 동기 중복 제출을 차단한다. 성공 후 생성 요청의 사용자/Workspace sidebar Object query를 invalidate한다.
- 모달이 여전히 활성이고 사용자/Workspace가 같으면 반환받은 viewDefinitionId의 Object View 경로로 이동한다.
- 모달 닫기·Workspace 전환·로그아웃 후 늦은 응답이 현재 화면을 이동시키지 않는다.
- 생성 실패는 입력을 보존하며 재시도할 수 있다. 성공 후 cache/navigation 실패를 생성 실패로 바꿔 POST를 다시 보내지 않는다.
- List+View 생성, 관리자 UI, View 타입 전환, 기존 더미 데이터 보정은 이번 범위 밖이다.
