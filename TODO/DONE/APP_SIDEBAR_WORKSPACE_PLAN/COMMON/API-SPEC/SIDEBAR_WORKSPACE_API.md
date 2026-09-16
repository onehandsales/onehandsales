# Sidebar Workspace API

계약 상태: implemented

소비자:

- User Web

## 1. 목적

`/app` 사이드바에서 로그인한 사용자가 접근 가능한 Workspace 요약 목록과 선택된 Workspace 요약을 조회한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `WorkspaceMember.userId`가 일치하는 Workspace만 응답한다.
- 응답 필드: `id`, `name`, `kind`만 제공한다.
- transaction: 없음
- 변경 model: 없음
- idempotency: 조회 API라 해당 없음
- outbox: 해당 없음
- observability: 기존 request id 기준 추적, 민감정보 로그 없음

## 3. DTO

### SidebarWorkspaceSummaryResponse

```ts
{
  id: string;
  name: string;
  kind: "PERSONAL" | "ORGANIZATION";
}
```

## 4. API

### GET /api/users/me/sidebar/workspaces

로그인한 사용자가 멤버로 속한 Workspace 요약 목록을 반환한다.

Request:

- path param: 없음
- query: 없음
- body: 없음

Success:

- Status: `200 OK`
- Body: `SidebarWorkspaceSummaryResponse[]`
- Pagination: 없음

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000101",
    "name": "My Workspace",
    "kind": "PERSONAL"
  }
]
```

빈 목록:

```json
[]
```

### GET /api/users/me/sidebar/workspaces/:workspaceId

로그인한 사용자가 멤버로 속한 특정 Workspace 요약을 반환한다.

Request:

- path param:
  - `workspaceId`: UUID string, required
- query: 없음
- body: 없음

Success:

- Status: `200 OK`
- Body: `SidebarWorkspaceSummaryResponse`

```json
{
  "id": "00000000-0000-4000-8000-000000000101",
  "name": "My Workspace",
  "kind": "PERSONAL"
}
```

Error:

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 흐름으로 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| 현재 사용자가 해당 Workspace 멤버가 아님 | `WorkspaceSidebarWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 목록 재조회 | info |

## 5. 호환성

- breaking change 여부: 없음
- 기존 FE 영향: 없음. 새 API 추가만 수행한다.
- migration 또는 fallback: DB schema 변경 없음

## 6. 구현 상태

- Backend controller: `BE/src/modules/workspace/presentation/http/user-sidebar-workspaces.controller.ts`
- Application use cases:
  - `BE/src/modules/workspace/application/use-cases/list-my-sidebar-workspaces.use-case.ts`
  - `BE/src/modules/workspace/application/use-cases/get-my-sidebar-workspace.use-case.ts`
- Query port: `BE/src/modules/workspace/application/ports/workspace-sidebar-query.port.ts`
- Prisma adapter: `BE/src/modules/workspace/infrastructure/persistence/prisma-workspace-sidebar-query.repository.ts`
- 검증:
  - `pnpm.cmd -C BE typecheck`
  - `pnpm.cmd -C BE lint`
  - `pnpm.cmd -C BE test -- --runInBand`
  - `pnpm.cmd -C BE prisma:validate`
