# AttributeDefinition Create Backend TODO

상태: implemented

## 1. 목적

사용자가 ObjectDefinition 목록 화면에서 새 AttributeDefinition 이름, 타입, 아이콘, 설명을 입력했을 때 현재 Workspace의 특정 ObjectDefinition에 AttributeDefinition을 생성한다.

세부 API path, request, response, error 계약은 `TODO/DONE/ATTRIBUTE_DEFINITION_CREATE_PLAN/COMMON/API-SPEC/ATTRIBUTE_DEFINITION_CREATE_API.md`를 기준으로 한다.

## 2. 구현 범위

- Controller: `UserWorkspaceObjectAttributeDefinitionsController`
- Request DTO: `CreateWorkspaceObjectAttributeDefinitionDto`
- Application use case: `CreateWorkspaceObjectAttributeDefinitionUseCase`
- Repository port: `AttributeDefinitionCommandRepository`
- Prisma adapter: `PrismaAttributeDefinitionCommandRepository`
- Type helper: `ATTRIBUTE_DEFINITION_TYPES`, `isAttributeDefinitionType`
- DB migration: `AttributeDefinition.objectDefinitionId + apiSlug` unique constraint
- Error mapping:
  - `ATTRIBUTE_DEFINITION_NAME_REQUIRED` -> 400
  - `ATTRIBUTE_DEFINITION_NAME_TOO_LONG` -> 400
  - `ATTRIBUTE_DEFINITION_TYPE_UNKNOWN` -> 400
  - `AttributeDefinitionApiSlugAlreadyExists` -> 409

## 3. Transaction

- transaction 필요 여부: 없음
- 이유: API의 최종 변경 model은 `AttributeDefinition` 1개다.
- 변경 model: `AttributeDefinition`
- 선행 조회:
  - `WorkspaceAccessQuery.getWorkspaceMemberAccess`
  - `ObjectDefinitionAccessQuery.hasObjectDefinitionInWorkspace`
  - `AttributeDefinitionCommandRepository.hasAttributeDefinitionApiSlug`
- application 경계: `CreateWorkspaceObjectAttributeDefinitionUseCase`가 입력 검증, ownership 검증, 중복 확인, 생성 명령을 순서대로 orchestration한다.
- infrastructure 구현: Prisma adapter가 `AttributeDefinition` row를 생성하고 생성 ID만 반환한다.
- rollback 범위: `AttributeDefinition` 생성 실패 시 생성 row 없음
- race condition 방어: `@@unique([objectDefinitionId, apiSlug])` DB 제약과 Prisma `P2002` -> `AttributeDefinitionApiSlugAlreadyExists` 변환
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음. 생성 성공 후 구조화 로그만 남긴다.

## 4. Idempotency / Outbox

- idempotency: 없음
- idempotency key 출처/scope: 해당 없음
- 중복 요청 기준: 같은 `objectDefinitionId + apiSlug` 중복 요청은 `409 Conflict`
- outbox: 필요 없음
- 이유: 외부 side effect와 후속 비동기 처리가 없다.

## 5. Observability

- log event key: `crm.attributeDefinition.created`
- structured log: 생성 성공 시 남긴다.
- request id: 전역 HTTP request context 기준 추적
- redaction:
  - `attributeDefinitionName`, `apiSlug`, `title`, `icon`, `description` 원문 로그 금지
  - access token, refresh token 로그 금지
- provider error context: 외부 Provider 호출 없음

## 6. 검증

- `pnpm.cmd prisma:validate`
- `pnpm.cmd prisma:generate`
- `pnpm.cmd typecheck`
- `pnpm.cmd lint`
- `pnpm.cmd test -- src/modules/attribute-definition --runInBand`
- `pnpm.cmd test -- --runInBand`
- `pnpm.cmd build`

## 7. 테스트 메모

- Controller/API contract test는 production과 같은 `ValidationPipe` 설정으로 DTO validation과 whitelist를 검증한다.
- Prisma repository integration spec은 `TEST_DATABASE_URL`이 있고 테스트 DB가 연결 가능한 환경에서 `objectDefinitionId + apiSlug` unique 제약과 domain conflict 변환을 검증한다.
