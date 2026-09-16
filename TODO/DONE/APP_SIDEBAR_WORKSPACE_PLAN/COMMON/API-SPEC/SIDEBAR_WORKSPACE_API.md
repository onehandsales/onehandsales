# Sidebar Workspace API

계약 상태: implemented

소비자:

- User Web

## 1. 목적

`/app` 사이드바에서 로그인한 사용자가 접근 가능한 Workspace 요약 목록과 선택된 Workspace 요약을 조회한다.
직업 선택 온보딩 완료 직후에는 생성 또는 보장된 Workspace ID를 응답으로 받아 `/app` 진입 시 해당 Workspace를 선택할 수 있게 한다.

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
- Sorting: `WorkspaceMember.joinedAt DESC`

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

### GET /api/users/me/sidebar/workspaces/default

로그인한 사용자가 멤버로 속한 Workspace 중 `/app` 첫 진입 시 기본으로 열 Workspace 요약 하나를 반환한다.

Request:

- path param: 없음
- query: 없음
- body: 없음

Success:

- Status: `200 OK`
- Body: `SidebarWorkspaceSummaryResponse`
- Selection: `WorkspaceMember.joinedAt DESC` 기준 첫 번째 Workspace

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
| 현재 사용자가 속한 Workspace가 없음 | `WorkspaceSidebarWorkspaceNotFound` | 404 | 온보딩 또는 복구 흐름 검토 | info |

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

### POST /api/users/me/onboarding/job-selection 응답 보강

직업 선택 온보딩 완료 API는 기존 응답에 top-level `workspaceId`를 함께 반환한다.

Success:

- Status: `200 OK`
- Body: 기존 온보딩 완료 응답 + `workspaceId`

```ts
{
  jobSelectOnboardingCompletedAt: string;
  workspaceId: string;
  workspace: {
    id: string;
    name: string;
    kind: "PERSONAL" | "ORGANIZATION";
    organizationName: string | null;
    organizationDomain: string | null;
    createdAt: string;
    updatedAt: string;
  };
  workspaceMember: {
    id: string;
    workspaceId: string;
    userId: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    joinedAt: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

FE 사용:

- 온보딩 완료 후 `workspaceId`를 `/app?workspaceId=<workspaceId>`로 전달한다.

## 5. 호환성

- breaking change 여부: 없음
- 기존 FE 영향: `CompleteJobSelectionOnboardingResponse`에 `workspaceId`가 추가된다. 기존 `workspace.id`는 유지한다.
- migration 또는 fallback: DB schema 변경 없음

## 6. 구현 상태

- Backend controller: `BE/src/modules/workspace/presentation/http/user-sidebar-workspaces.controller.ts`
- Application use cases:
  - `BE/src/modules/workspace/application/use-cases/list-my-sidebar-workspaces.use-case.ts`
  - `BE/src/modules/workspace/application/use-cases/get-my-default-sidebar-workspace.use-case.ts`
  - `BE/src/modules/workspace/application/use-cases/get-my-sidebar-workspace.use-case.ts`
- Query port: `BE/src/modules/workspace/application/ports/workspace-sidebar-query.port.ts`
- Prisma adapter: `BE/src/modules/workspace/infrastructure/persistence/prisma-workspace-sidebar-query.repository.ts`
- Onboarding response:
  - `BE/src/modules/user/application/use-cases/complete-job-selection-onboarding.use-case.ts`
  - `FE/user-web/src/features/auth/types/auth.ts`
  - `FE/user-web/src/pages/onboarding/index.tsx`
- 검증:
  - `pnpm.cmd -C BE typecheck`
  - `pnpm.cmd -C BE lint`
  - `pnpm.cmd -C BE test -- --runInBand`
  - `pnpm.cmd -C BE prisma:validate`
  - `pnpm.cmd -C BE build`
  - `pnpm.cmd -C FE/user-web typecheck`
  - `pnpm.cmd -C FE/user-web lint`
