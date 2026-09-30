# RecordAttributeValueDefinition Update Backend TODO

상태: implemented

## 1. 목적

사용자가 ObjectDefinition 목록 화면에서 cell 1개를 수정하면 해당 `RecordAttributeValueDefinition` 값을 저장하고 부모 `RecordDefinition`의 수정 감사 정보도 함께 갱신한다.

세부 API path, request, response, error 계약은 `TODO/RECORD_ATTRIBUTE_VALUE_DEFINITION_UPDATE_PLAN/COMMON/API-SPEC/RECORD_ATTRIBUTE_VALUE_DEFINITION_UPDATE_API.md`를 기준으로 한다.

## 2. 구현 범위

- Controller: `UserWorkspaceObjectRecordDefinitionsController`
- Application use case: `UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase`
- Repository port: `RecordDefinitionCommandRepository`
- Prisma adapter: `PrismaRecordDefinitionCommandRepository`
- Request DTO: `UpdateWorkspaceObjectRecordAttributeValueDefinitionDto`
- Response type: `UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse`
- Transaction manager:
  - `TRANSACTION_MANAGER`
- Error:
  - `RecordDefinitionWorkspaceNotFoundError`
  - `RecordDefinitionObjectDefinitionNotFoundError`
  - `RecordDefinitionRecordNotFoundError`
  - `RecordAttributeValueDefinitionNotFoundError`
  - `RecordAttributeValueDefinitionValidationError`
- Logger event:
  - `crm.recordAttributeValueDefinition.updated`

## 3. 구현 파일

추가:

- `BE/src/modules/record-definition/application/use-cases/update-workspace-object-record-attribute-value-definition.use-case.ts`
- `BE/src/modules/record-definition/application/use-cases/update-workspace-object-record-attribute-value-definition.use-case.spec.ts`
- `BE/src/modules/record-definition/presentation/http/dto/update-workspace-object-record-attribute-value-definition.dto.ts`

수정:

- `BE/src/modules/record-definition/application/ports/record-definition-command.repository.ts`
- `BE/src/modules/record-definition/domain/record-definition.errors.ts`
- `BE/src/modules/record-definition/infrastructure/persistence/prisma-record-definition-command.repository.ts`
- `BE/src/modules/record-definition/infrastructure/persistence/prisma-record-definition-command.repository.spec.ts`
- `BE/src/modules/record-definition/infrastructure/record-definition.module.ts`
- `BE/src/modules/record-definition/presentation/http/user-workspace-object-record-definitions.controller.ts`
- `BE/src/modules/record-definition/presentation/http/user-workspace-object-record-definitions.controller.spec.ts`
- `BE/src/shared/presentation/filters/http-exception.filter.ts`

## 4. Application Flow

1. request body에 `value` key가 있는지 확인한다.
2. `WorkspaceAccessQuery.getWorkspaceMemberAccess(currentUser.id, workspaceId)`를 호출한다.
3. 결과가 없으면 `RecordDefinitionWorkspaceNotFoundError`를 던진다.
4. `actorId`가 없으면 내부 정합성 오류로 중단한다.
5. `ObjectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({ workspaceId, objectDefinitionId })`를 호출한다.
6. 결과가 false면 `RecordDefinitionObjectDefinitionNotFoundError`를 던진다.
7. `RecordDefinitionCommandRepository.hasRecordDefinitionInWorkspaceObject()`로 RecordDefinition 소속을 확인한다.
8. 결과가 false면 `RecordDefinitionRecordNotFoundError`를 던진다.
9. `RecordDefinitionCommandRepository.findRecordAttributeValueDefinitionForUpdate()`로 cell row와 AttributeDefinition 소속을 확인한다.
10. 결과가 없으면 `RecordAttributeValueDefinitionNotFoundError`를 던진다.
11. DB cell row의 `attributeType` snapshot 기준으로 request `value`를 저장 컬럼 값으로 매핑한다.
12. application 계층에서 transaction을 시작한다.
13. `RecordDefinitionCommandRepository.updateRecordAttributeValueDefinition()`에 transaction context와 update를 위임한다.
14. Prisma adapter가 같은 transaction 안에서 `RecordAttributeValueDefinition`과 부모 `RecordDefinition`을 update한다.
15. 성공 후 `crm.recordAttributeValueDefinition.updated` 구조화 로그를 값 원문 없이 남긴다.
16. `{ recordAttributeValueDefinitionId }`를 반환한다.

## 5. Transaction

- transaction 필요 여부: 필요
- 이유: API의 최종 변경 model은 `RecordAttributeValueDefinition`과 부모 `RecordDefinition`이다.
- 변경 model:
  - `RecordAttributeValueDefinition`
  - `RecordDefinition`
- 선행 조회:
  - `WorkspaceAccessQuery.getWorkspaceMemberAccess`
  - `ObjectDefinitionAccessQuery.hasObjectDefinitionInWorkspace`
  - `RecordDefinitionCommandRepository.hasRecordDefinitionInWorkspaceObject`
  - `RecordDefinitionCommandRepository.findRecordAttributeValueDefinitionForUpdate`
- application 경계: `UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase`가 ownership 검증 후 transaction을 열고 update 명령을 orchestration한다.
- infrastructure 구현: Prisma adapter가 같은 Prisma transaction client로 cell value row와 부모 RecordDefinition audit 정보를 수정한다.
- rollback 범위: `RecordAttributeValueDefinition` update 또는 `RecordDefinition` update 실패 시 두 model 변경을 모두 rollback한다.
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음. 수정 성공 후 구조화 로그만 남긴다.

## 6. Value Mapping

- `value: null`은 모든 value 컬럼을 `null`로 비운다.
- Text/EmailAddress/Domain/PhoneNumber는 `textValue`만 저장한다.
- Number/Rating은 `numberValue`만 저장한다.
- Checkbox는 `booleanValue`만 저장한다.
- Date는 `dateValue`만 저장한다.
- Timestamp는 timezone 정보가 있는 ISO datetime 문자열만 받아 `timestampValue`로 저장한다.
- Currency는 `numberValue`와 `jsonValue`를 저장한다.
- Location/PersonalName/Interaction은 표시용 text 또는 timestamp와 `jsonValue`를 저장한다.
- Select/Status/RecordReference/ActorReference는 참조 의미를 해석하지 않고 `jsonValue`에 object를 그대로 저장한다.
- FK 컬럼인 `selectOptionId`, `statusOptionId`, `targetRecordDefinitionId`, `targetObjectDefinitionId`, `targetActorId`는 이번 범위에서 저장하지 않는다.

## 7. Idempotency / Outbox

- idempotency: 별도 key 없음
- 중복 요청 기준: 같은 value 반복 PATCH는 같은 최종 상태로 수렴한다.
- outbox: 필요 없음
- 이유: 외부 side effect와 후속 비동기 처리가 없다.

## 8. Observability

- log event key: `crm.recordAttributeValueDefinition.updated`
- structured log: 수정 성공 시 남긴다.
- request id: 전역 HTTP request context 기준 추적
- 로그 필드:
  - `event`
  - `userId`
  - `workspaceId`
  - `objectDefinitionId`
  - `recordDefinitionId`
  - `recordAttributeValueDefinitionId`
  - `attributeDefinitionId`
  - `attributeType`
- redaction:
  - access token, refresh token 로그 금지
  - request `value` 원문 로그 금지
  - cell value 컬럼 원문 로그 금지
- provider error context: 외부 Provider 호출 없음

## 9. 테스트

Application use case:

- 접근 가능한 Workspace/ObjectDefinition/RecordDefinition/cell이면 transaction 안에서 update하고 ID를 반환한다.
- `value` key가 없으면 Workspace 조회 전에 검증 오류를 반환한다.
- Workspace membership이 없으면 수정을 차단한다.
- ObjectDefinition이 요청 Workspace에 속하지 않으면 수정을 차단한다.
- RecordDefinition이 요청 Workspace/ObjectDefinition에 속하지 않으면 수정을 차단한다.
- cell value row가 요청 RecordDefinition에 속하지 않으면 수정을 차단한다.
- value가 AttributeType과 맞지 않으면 수정을 차단한다.
- timezone 정보가 없는 Timestamp는 수정을 차단한다.
- 참조형 value object는 FK 컬럼이 아니라 `jsonValue`에 저장한다.
- 성공 로그에 value 원문을 남기지 않는다.

Prisma command repository:

- 요청 경계 안의 RecordDefinition 존재 여부를 확인한다.
- 요청 경계 안의 cell value row와 AttributeDefinition 소속을 확인한다.
- 같은 transaction 안에서 `RecordAttributeValueDefinition`과 부모 `RecordDefinition`을 update한다.

Controller/API contract:

- `AuthGuard`를 사용한다.
- 기존 route path 하위에 `PATCH` metadata가 노출된다.
- `200 OK`와 `{ recordAttributeValueDefinitionId }`를 반환한다.
- current user, path param, body value 존재 여부를 use case로 전달한다.
- 기존 `GET` 목록 조회와 `POST` 생성 계약이 유지된다.

## 10. 검증

실행 완료:

- `pnpm -C BE test -- src/modules/record-definition --runInBand`
- `pnpm -C BE typecheck`
- `pnpm -C BE lint`
- `pnpm -C BE build`

Prisma schema 변경이 없으므로 `prisma:validate`는 필수 범위가 아니다.
