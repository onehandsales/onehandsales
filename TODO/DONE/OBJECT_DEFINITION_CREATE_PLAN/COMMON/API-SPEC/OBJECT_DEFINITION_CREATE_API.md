# ObjectDefinition Create API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 있음. 기존 더미 성공 응답 `{ ok: true }`를 실제 생성 응답 `{ id }`로 변경한다.
- 기존 FE 영향: 있음. User Web 생성 API client의 response type과 선택 필드 전송 방식을 변경한다.
- migration 또는 fallback: `ObjectDefinition.workspaceId + apiSlug` unique index를 추가한다. 기존 중복 데이터가 있으면 migration 전 정리가 필요하다.

## 1. 목적

`/app` 사이드바 하단의 관리 항목 생성 모달에서 사용자가 관리 항목 이름, 선택 아이콘, 선택 설명을 입력했을 때 현재 Workspace에 `ObjectDefinition`을 생성한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 생성할 수 있다.
- Actor 검증: 생성 감사 주체 저장을 위해 `WorkspaceMember`에 연결된 `WORKSPACE_MEMBER` Actor가 필요하다.
- DB schema 연결: `WorkspaceMember`, `Actor`, `ObjectDefinition`
- 중복 기준: 같은 Workspace 안에서 `ObjectDefinition.apiSlug`는 중복될 수 없다.
- `objectDefinitionName`: application use case에서 trim한 뒤 저장 기준 이름으로 사용한다.
- `apiSlug`, `singularName`, `pluralName`: trim된 `objectDefinitionName` 값을 동일하게 저장한다.
- `icon`: request에 없거나 `null` 또는 빈 문자열이면 DB에는 `null`을 저장한다. 값이 있으면 trim 없이 그대로 저장한다.
- `description`: request에 없거나 `null` 또는 빈 문자열이면 DB에는 `null`을 저장한다. 값이 있으면 trim 없이 그대로 저장한다.
- transaction: 없음. 최종 변경 model은 `ObjectDefinition` 1개이며, 중복 race condition은 DB unique index로 방어한다.
- 변경 model: `ObjectDefinition`
- rollback 범위: `ObjectDefinition` 생성 실패 시 생성 row 없음
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음
- idempotency: 없음. 같은 `workspaceId + apiSlug` 중복 요청은 `409 Conflict`로 응답한다.
- idempotency key 출처/scope: 해당 없음
- 중복 요청 응답 기준: `ObjectDefinitionApiSlugAlreadyExists`
- outbox: 필요 없음. 외부 side effect와 후속 비동기 처리가 없다.
- observability: 생성 성공 시 원문 이름/설명/icon 없이 구조화 로그를 남긴다.
- log event key: `crm.objectDefinition.created`
- redaction: objectDefinitionName, apiSlug, singularName, pluralName, icon, description 원문 로그 금지, access/refresh token 로그 금지

## 3. DTO

### CreateWorkspaceObjectDefinitionDto

```ts
{
  objectDefinitionName: string;
  icon?: string | null;
  description?: string | null;
}
```

### CreateWorkspaceObjectDefinitionResponse

```ts
{
  id: string;
}
```

## 4. API

### POST /api/users/me/workspaces/:workspaceId/object-definitions

로그인한 사용자가 멤버로 속한 Workspace에 새 ObjectDefinition을 생성한다.

Request DTO: `CreateWorkspaceObjectDefinitionDto`

Response DTO: `CreateWorkspaceObjectDefinitionResponse`

Path param:

- `workspaceId`: UUID string, required

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie: refresh cookie는 이 API request 계약에 사용하지 않음

Body:

```json
{
  "objectDefinitionName": "회사",
  "icon": "lucide:building-2",
  "description": "거래처와 잠재 고객 회사를 관리해요."
}
```

선택 필드가 비어 있으면 User Web은 해당 필드를 보내지 않을 수 있다.

```json
{
  "objectDefinitionName": "회사"
}
```

Validation:

- `objectDefinitionName`: string, required
- `objectDefinitionName`: null 허용 안 함
- `objectDefinitionName`: 빈 문자열 raw 입력은 DTO가 아니라 application validation에서 trim 후 차단
- trim 후 1자 이상
- trim 후 최대 80자
- `icon`: string optional, null 허용
- `description`: string optional, null 허용
- request body에 계약 외 필드가 있으면 Nest validation error

Success:

- Status: `201 Created`
- Body: 있음

```json
{
  "id": "00000000-0000-4000-8000-000000000501"
}
```

후속 FE 흐름:

- User Web은 생성 성공 후 현재 Workspace의 사이드바 ObjectDefinition 목록을 다시 조회할 수 있다.
- 현재 생성 모달은 응답의 `id`를 직접 화면에 표시하지 않는다.

Error:

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 흐름으로 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `objectDefinitionName` 누락 또는 문자열 아님 | Nest validation error | 400 | 모달에서 재입력 유도 | warn |
| trim 후 빈 값 | `OBJECT_DEFINITION_NAME_REQUIRED` | 400 | 모달에서 재입력 유도 | info |
| trim 후 80자 초과 | `OBJECT_DEFINITION_NAME_TOO_LONG` | 400 | 모달에서 재입력 유도 | info |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `ObjectDefinitionWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 Workspace 목록 재조회 | info |
| 같은 Workspace에 동일 apiSlug가 이미 있음 | `ObjectDefinitionApiSlugAlreadyExists` | 409 | 이름 재입력 유도 | info |
| WorkspaceMember Actor가 없음 | `InternalServerError` | 500 | 일반 실패 메시지 표시, 재시도 가능 | error |

## 5. 구현 범위

- API 계약 문서 추가
- `ObjectDefinition.workspaceId + apiSlug` unique index 추가
- Workspace access 공개 query port에 생성 주체 Actor 조회 추가
- ObjectDefinition 생성 use case, command port, Prisma adapter 추가
- 기존 더미 생성 controller를 application use case 연결로 교체
- User Web 생성 API client request/response 계약 갱신
- application/controller/API client 테스트 추가 또는 갱신

## 6. 제외 범위

- AttributeDefinition 생성
- RecordDefinition 생성
- Team 또는 role별 ObjectDefinition 생성 권한
- ObjectDefinition 수정/삭제 API
- 생성 후 프론트 route 이동

## 7. 완료 검증

- Backend Prisma schema validation 통과
- Backend typecheck, lint, test, build 통과
- Frontend User Web typecheck, lint, 관련 API client test, build 통과
- `ObjectDefinition.workspaceId + apiSlug` unique index migration 추가 확인
- User Web 생성 API client와 Backend controller/use case 계약 일치 확인
