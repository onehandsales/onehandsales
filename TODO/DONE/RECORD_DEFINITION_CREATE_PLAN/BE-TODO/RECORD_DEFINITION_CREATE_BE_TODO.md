# RecordDefinition Create Backend TODO

상태: implemented

## 1. 목적

사용자가 ObjectDefinition 목록 화면에서 새 row 생성을 요청하면 현재 Workspace의 특정 ObjectDefinition에 빈 RecordDefinition과 현재 AttributeDefinition 기준의 null cell value row를 생성한다.

세부 API path, request, response, error 계약은 `TODO/DONE/RECORD_DEFINITION_CREATE_PLAN/COMMON/API-SPEC/RECORD_DEFINITION_CREATE_API.md`를 기준으로 한다.

## 2. 구현 범위

- Controller: `UserWorkspaceObjectRecordDefinitionsController`
- Application use case: `CreateWorkspaceObjectRecordDefinitionUseCase`
- Repository port: `RecordDefinitionCommandRepository`
- Prisma adapter: `PrismaRecordDefinitionCommandRepository`
- Response type: `CreateWorkspaceObjectRecordDefinitionResponse`
- Transaction manager:
  - `TRANSACTION_MANAGER`
- Error reuse:
  - `RecordDefinitionWorkspaceNotFoundError`
  - `RecordDefinitionObjectDefinitionNotFoundError`
- Logger event:
  - `crm.recordDefinition.created`

## 3. 구현 파일

추가:

- `BE/src/modules/record-definition/application/ports/record-definition-command.repository.ts`
- `BE/src/modules/record-definition/application/use-cases/create-workspace-object-record-definition.use-case.ts`
- `BE/src/modules/record-definition/application/use-cases/create-workspace-object-record-definition.use-case.spec.ts`
- `BE/src/modules/record-definition/infrastructure/persistence/prisma-record-definition-command.repository.ts`
- `BE/src/modules/record-definition/infrastructure/persistence/prisma-record-definition-command.repository.spec.ts`

수정:

- `BE/src/modules/record-definition/presentation/http/user-workspace-object-record-definitions.controller.ts`
- `BE/src/modules/record-definition/presentation/http/user-workspace-object-record-definitions.controller.spec.ts`
- `BE/src/modules/record-definition/infrastructure/record-definition.module.ts`
- `BE/src/modules/record-definition/domain/record-definition.errors.ts`

## 4. Application Flow

1. `WorkspaceAccessQuery.getWorkspaceMemberAccess(currentUser.id, workspaceId)`를 호출한다.
2. 결과가 없으면 `RecordDefinitionWorkspaceNotFoundError`를 던진다.
3. `actorId`가 없으면 내부 정합성 오류로 중단한다.
4. `ObjectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({ workspaceId, objectDefinitionId })`를 호출한다.
5. 결과가 false면 `RecordDefinitionObjectDefinitionNotFoundError`를 던진다.
6. application 계층에서 transaction을 시작한다.
7. `RecordDefinitionCommandRepository.createRecordDefinition()`에 transaction context와 생성을 위임한다.
8. Prisma adapter가 현재 ObjectDefinition에 속한 AttributeDefinition 목록을 조회한다.
9. Prisma adapter가 RecordDefinition을 생성한다.
10. Prisma adapter가 AttributeDefinition마다 null RecordAttributeValueDefinition row를 생성한다.
11. 생성 성공 후 `crm.recordDefinition.created` 구조화 로그를 남긴다.
12. `{ recordDefinitionId }`를 반환한다.

## 5. Repository Port

```ts
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const RECORD_DEFINITION_COMMAND_REPOSITORY = Symbol(
  "RECORD_DEFINITION_COMMAND_REPOSITORY"
);

export interface CreateRecordDefinitionInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly createdByActorId: string;
  readonly transactionContext?: TransactionContext | null;
}

export interface CreateRecordDefinitionResult {
  readonly id: string;
}

export interface RecordDefinitionCommandRepository {
  createRecordDefinition(
    input: CreateRecordDefinitionInput
  ): Promise<CreateRecordDefinitionResult>;
}
```

## 6. Transaction

- transaction 필요 여부: 필요
- 이유: API의 최종 변경 model은 `RecordDefinition`과 현재 AttributeDefinition 개수만큼의 `RecordAttributeValueDefinition` row다.
- 변경 model:
  - `RecordDefinition`
  - `RecordAttributeValueDefinition`
- 선행 조회:
  - `WorkspaceAccessQuery.getWorkspaceMemberAccess`
  - `ObjectDefinitionAccessQuery.hasObjectDefinitionInWorkspace`
- application 경계: `CreateWorkspaceObjectRecordDefinitionUseCase`가 ownership 검증 후 transaction을 열고 생성 명령을 orchestration한다.
- infrastructure 구현: Prisma adapter가 같은 Prisma transaction client로 AttributeDefinition 목록 조회, RecordDefinition 생성, null RecordAttributeValueDefinition 생성 작업을 수행한다.
- rollback 범위: `RecordDefinition` 또는 `RecordAttributeValueDefinition` 생성 실패 시 두 model 변경을 모두 rollback한다.
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음. 생성 성공 후 구조화 로그만 남긴다.

## 7. Idempotency / Outbox

- idempotency: 없음
- idempotency key 출처/scope: 해당 없음
- 중복 요청 기준: 반복 요청은 별도 RecordDefinition 생성
- outbox: 필요 없음
- 이유: 외부 side effect와 후속 비동기 처리가 없다.

## 8. Observability

- log event key: `crm.recordDefinition.created`
- structured log: 생성 성공 시 남긴다.
- request id: 전역 HTTP request context 기준 추적
- 로그 필드:
  - `event`
  - `userId`
  - `workspaceId`
  - `objectDefinitionId`
  - `recordDefinitionId`
- redaction:
  - access token, refresh token 로그 금지
  - 후속 cell 값 원문 로그 금지
- provider error context: 외부 Provider 호출 없음

## 9. 테스트

Application use case:

- 접근 가능한 Workspace/ObjectDefinition이면 transaction 안에서 RecordDefinition과 null cell value row를 생성하고 ID를 반환한다.
- Workspace membership이 없으면 생성을 차단한다.
- WorkspaceMember Actor가 없으면 내부 정합성 오류로 중단한다.
- ObjectDefinition이 요청 Workspace에 속하지 않으면 생성을 차단한다.
- 생성 성공 시 구조화 로그를 남긴다.

Prisma command repository:

- 현재 ObjectDefinition의 AttributeDefinition 목록을 조회한다.
- RecordDefinition을 생성한다.
- AttributeDefinition마다 attributeType snapshot과 null value column을 가진 RecordAttributeValueDefinition을 생성한다.

Controller/API contract:

- `AuthGuard`를 사용한다.
- 기존 route path에 `POST` metadata가 노출된다.
- `201 Created`와 `{ recordDefinitionId }`를 반환한다.
- request body 없이 current user, `workspaceId`, `objectDefinitionId`를 use case로 전달한다.
- 기존 `GET` 목록 조회 계약이 유지된다.

## 10. 검증

우선 실행:

- `pnpm -C BE test -- src/modules/record-definition --runInBand`
- `pnpm -C BE typecheck`
- `pnpm -C BE lint`

가능하면 실행:

- `pnpm -C BE test -- --runInBand`
- `pnpm -C BE build`

Prisma schema 변경이 없으므로 `prisma:validate`는 필수 범위가 아니다.
