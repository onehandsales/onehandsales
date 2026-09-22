# Sidebar Object Definition API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 신규 API다.
- 기존 FE 영향: 없음. 후속 User Web 연결 작업에서 사이드바 `Items` 섹션이 이 API를 호출한다.
- migration 또는 fallback: DB schema 변경 없음. 기존 `ObjectDefinition`, `WorkspaceMember`를 사용한다.

## 1. 목적

`/app/workspaces/:workspaceId` 사이드바의 `Items` 섹션에서 현재 Workspace에 속한 ObjectDefinition 목록을 표시한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 조회할 수 있다.
- Actor 검증: 없음. Actor는 생성/수정 감사 주체이며 조회 권한 판단에 사용하지 않는다.
- DB schema 연결: `WorkspaceMember`, `ObjectDefinition`
- transaction: 없음. read-only API다.
- 변경 model: 없음
- rollback 범위: 해당 없음
- 외부 Provider 호출: 없음
- idempotency: 조회 API라 해당 없음
- outbox: 해당 없음
- observability: 기존 request id 기준 추적, 민감정보 로그 없음
- log event key: 없음

## 3. DTO

### SidebarObjectDefinitionListItemResponse

```ts
{
  id: string;
  icon: string | null;
  singularName: string;
  pluralName: string;
}
```

## 4. API

### GET /api/users/me/sidebar/workspaces/:workspaceId/objects

로그인한 사용자가 멤버로 속한 Workspace의 사이드바 표시용 ObjectDefinition 목록을 반환한다.

Request DTO: 없음

Response DTO: `SidebarObjectDefinitionListItemResponse[]`

Path param:

- `workspaceId`: UUID string, required

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie: refresh cookie는 이 API request 계약에 사용하지 않음

Body: 없음

Success:

- Status: `200 OK`
- Body: 있음
- Pagination: 없음
- Sorting: `ObjectDefinition.createdAt ASC`, 동률이면 `ObjectDefinition.id ASC`

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000501",
    "icon": "users",
    "singularName": "고객",
    "pluralName": "고객"
  }
]
```

빈 목록:

```json
[]
```

Error:

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 흐름으로 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `ObjectDefinitionSidebarWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 Workspace 목록 재조회 | info |

## 5. 구현 범위

- Backend API 계약 문서 추가
- Workspace membership 확인용 공개 query port 추가
- `object-definition` Backend module 신설
- 사이드바 ObjectDefinition 목록 조회 use case, repository, controller 추가
- application/controller 테스트 추가

## 6. 제외 범위

- Frontend API client 연결
- ObjectDefinition 생성/수정/삭제 API
- Team 또는 role별 ObjectDefinition 권한
- ObjectDefinition별 Record 목록 조회
- DB schema/migration 변경

## 7. 구현 상태

- Backend controller: `BE/src/modules/object-definition/presentation/http/user-sidebar-workspace-objects.controller.ts`
- Application use case: `BE/src/modules/object-definition/application/use-cases/list-sidebar-object-definitions.use-case.ts`
- Query port: `BE/src/modules/object-definition/application/ports/object-definition-sidebar-query.port.ts`
- Prisma adapter: `BE/src/modules/object-definition/infrastructure/persistence/prisma-object-definition-sidebar-query.repository.ts`
- Workspace access port: `BE/src/modules/workspace/application/ports/workspace-access-query.port.ts`
- Workspace access Prisma adapter: `BE/src/modules/workspace/infrastructure/persistence/prisma-workspace-access-query.repository.ts`
- 검증:
  - `pnpm.cmd -C BE typecheck`
  - `pnpm.cmd -C BE lint`
  - `pnpm.cmd -C BE test -- --runInBand BE/src/modules/object-definition/application/use-cases/list-sidebar-object-definitions.use-case.spec.ts BE/src/modules/object-definition/presentation/http/user-sidebar-workspace-objects.controller.spec.ts BE/src/modules/workspace/application/use-cases/get-my-sidebar-workspace.use-case.spec.ts`
  - `pnpm.cmd -C BE test -- --runInBand`
  - `pnpm.cmd -C BE prisma:validate`
  - `pnpm.cmd -C BE build`
