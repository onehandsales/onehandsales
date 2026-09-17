# Workspace Create Backend TODO

상태: implemented

## 1. 목적

새 작업 공간 모달에서 업무 카드 클릭 시 현재 로그인 사용자의 새 Workspace와 OWNER WorkspaceMember를 생성한다.

## 2. 구현 범위

- Controller: `UserWorkspacesController`
- Request DTO: `CreateMyWorkspaceDto`
- Application use case: `CreateMyWorkspaceUseCase`
- Repository port: `WorkspaceCommandRepository`
- Prisma adapter: `PrismaWorkspaceCommandRepository`
- Error mapping: `WORKSPACE_NAME_REQUIRED`, `WORKSPACE_NAME_TOO_LONG` -> 400

## 3. Transaction

- transaction 필요 여부: 필요
- 이유: 하나의 사용자 행동으로 `Workspace`와 `WorkspaceMember`가 함께 생성된다.
- 변경 model: `Workspace`, `WorkspaceMember`
- application 경계: `CreateMyWorkspaceUseCase`가 `createWorkspaceWithOwner`라는 하나의 원자적 저장 명령을 선택한다.
- infrastructure 구현: Prisma nested create로 두 row를 함께 저장한다.
- rollback 범위: Workspace와 OWNER 멤버십은 함께 성공하거나 함께 실패한다.
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음

## 4. Idempotency / Outbox

- idempotency: 없음
- 중복 요청 기준: 같은 이름이어도 새 Workspace를 생성한다.
- outbox: 필요 없음
- 이유: 외부 side effect와 후속 비동기 처리가 없다.

## 5. Observability

- 신규 structured log: 없음
- request id: 기존 HTTP request context 기준 추적
- redaction: workspace name 원문, token, 개인정보 원문 로그 금지

## 6. 검증

- `pnpm.cmd typecheck`
- `pnpm.cmd lint`
- `pnpm.cmd test -- create-my-workspace.use-case.spec.ts user-workspaces.controller.spec.ts --runInBand`
- `pnpm.cmd prisma:validate`
