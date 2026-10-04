# AttributeDefinition Detail API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 신규 API다.
- 기존 FE 영향: 없음. 후속 User Web API client 연결 작업에서 AttributeDefinition popover가 이 API를 호출한다.
- migration 또는 fallback: 없음. 현재 Prisma schema의 `AttributeDefinition` model을 그대로 사용한다.

## 1. 목적

ObjectDefinition 목록 화면의 header row에서 사용자가 특정 AttributeDefinition 컬럼을 클릭했을 때, popover 수정 UI에 필요한 AttributeDefinition 단건 정보를 조회한다.

이 API는 목록 API가 가진 header row 표시 정보에 `description`을 더해 상세 편집 진입에 필요한 값을 제공한다. `apiSlug`는 이번 응답 계약에 포함하지 않는다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- ObjectDefinition 소속 검증: `objectDefinitionId`가 요청 `workspaceId` 안에 있어야 한다.
- AttributeDefinition 소속 검증: `attributeDefinitionId`가 요청 `workspaceId + objectDefinitionId` 안에 있어야 한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 조회할 수 있다.
- Actor 검증: 없음. Actor는 생성/수정 감사 주체이며 조회 권한 판단에 사용하지 않는다.
- DB schema 연결: `WorkspaceMember`, `ObjectDefinition`, `AttributeDefinition`
- transaction: 없음. read-only API다.
- 변경 model: 없음
- rollback 범위: 해당 없음
- 외부 Provider 호출: 없음
- idempotency: 조회 API라 해당 없음
- outbox: 해당 없음
- observability: 기존 request id와 user id 기준 추적, 민감정보 로그 없음
- log event key: 없음

## 3. DTO

### WorkspaceObjectAttributeDefinitionDetailResponse

```ts
{
  id: string;
  title: string;
  type: AttributeDefinitionValueType;
  isMultiselect: boolean;
  description: string | null;
  icon: string | null;
  config: AttributeDefinitionConfig | null;
  sortOrder: number;
}
```

규칙:

- `apiSlug`는 응답하지 않는다.
- DB column `configJson`은 API response에서 `config`로 응답한다.
- `description`이 없으면 `null`로 응답한다.
- `icon`이 없으면 `null`로 응답한다.

### AttributeDefinitionConfig

```ts
type AttributeDefinitionConfig = {
  currency: {
    defaultCurrencyCode: "KRW" | "USD";
    displayType: "symbol";
  };
};
```

### AttributeDefinitionValueType

```ts
type AttributeDefinitionValueType =
  | "ActorReference"
  | "Checkbox"
  | "Currency"
  | "Date"
  | "Domain"
  | "EmailAddress"
  | "Interaction"
  | "Location"
  | "PersonalName"
  | "Number"
  | "PhoneNumber"
  | "Rating"
  | "RecordReference"
  | "Select"
  | "Status"
  | "Text"
  | "Timestamp";
```

## 4. API

### GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions/:attributeDefinitionId

로그인한 사용자가 멤버로 속한 Workspace의 특정 ObjectDefinition에 연결된 AttributeDefinition 단건 정보를 반환한다.

Request DTO: 없음

Response DTO: `WorkspaceObjectAttributeDefinitionDetailResponse`

Path param:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| workspaceId | UUID string | 예 | 아니오 | UUID | 조회 대상 Workspace ID |
| objectDefinitionId | UUID string | 예 | 아니오 | UUID | 조회 대상 ObjectDefinition ID |
| attributeDefinitionId | UUID string | 예 | 아니오 | UUID | 조회 대상 AttributeDefinition ID |

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie:

- refresh cookie는 이 API request 계약에 사용하지 않음

Body: 없음

Success:

- Status: `200 OK`
- Body: 있음
- Pagination: 없음
- Filtering: 없음
- Sorting: 없음. 단건 조회 API다.

```json
{
  "id": "00000000-0000-4000-8000-000000000603",
  "title": "금액",
  "type": "Currency",
  "isMultiselect": false,
  "description": "계약 금액을 저장해요.",
  "icon": "circle-dollar-sign",
  "config": {
    "currency": {
      "defaultCurrencyCode": "KRW",
      "displayType": "symbol"
    }
  },
  "sortOrder": 2
}
```

## 5. Business Logic

1. `currentUser.id + workspaceId`로 WorkspaceMember 존재 여부를 확인한다.
2. Workspace membership이 없으면 정보 노출을 막기 위해 not found로 응답한다.
3. `workspaceId + objectDefinitionId`로 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
4. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 응답한다.
5. `workspaceId + objectDefinitionId + attributeDefinitionId`로 AttributeDefinition 단건을 조회한다.
6. AttributeDefinition이 없거나 다른 ObjectDefinition/Workspace에 속하면 not found로 응답한다.
7. Prisma row의 `configJson`을 response의 `config`로 매핑한다.
8. `id`, `title`, `type`, `isMultiselect`, `description`, `icon`, `config`, `sortOrder`를 반환한다.

비교 기준:

- Workspace/ObjectDefinition 검증 흐름은 기존 `ListWorkspaceObjectAttributeDefinitionsUseCase`와 동일하다.
- 대상 row 소속 검증은 `RecordDefinition` cell update API의 target row 검증 패턴을 AttributeDefinition 단건 조회에 맞게 축소 적용한다.
- 조회 전용 API이므로 `getWorkspaceMemberAccess`, Actor 검증, transaction, 구조화 성공 로그는 사용하지 않는다.

## 6. Error Contract

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `objectDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `attributeDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `AttributeDefinitionWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 Workspace 목록 재조회 | info |
| ObjectDefinition이 없거나 요청 Workspace에 속하지 않음 | `AttributeDefinitionObjectDefinitionNotFound` | 404 | 선택 ObjectDefinition 초기화 또는 Object 목록 재조회 | info |
| AttributeDefinition이 없거나 요청 ObjectDefinition에 속하지 않음 | `AttributeDefinitionNotFound` | 404 | popover를 닫고 AttributeDefinition 목록 재조회 | info |

권한 없음과 소유권 없음은 404로 응답해 다른 Workspace/Object/AttributeDefinition 존재 여부를 노출하지 않는다.

### HttpExceptionFilter 반영

- `AttributeDefinitionWorkspaceNotFound`, `AttributeDefinitionObjectDefinitionNotFound`, `AttributeDefinitionNotFound`는 error code가 `NotFound`로 끝나므로 현재 `HttpExceptionFilter`의 not found 규칙을 재사용한다.
- 별도 validation body가 없으므로 field validation error는 추가하지 않는다.

## 7. Transaction Contract

transaction 필요 여부:

- 없음

이유:

- 조회 전용 API이며 DB 상태를 변경하지 않는다.

변경 model:

- 없음

rollback 범위:

- 없음

외부 Provider 호출:

- 없음

부수 로그/이력 transaction 포함 여부:

- 해당 없음

Idempotency / Outbox:

- idempotency 필요 여부: 조회 API라 해당 없음
- idempotency key 출처와 scope: 해당 없음
- 중복 요청 응답 기준: 같은 리소스 상태면 같은 응답을 반환한다.
- outbox 또는 후속 처리 기록 필요 여부: 없음

## 8. Observability Contract

log event key:

- 없음. 조회 성공마다 구조화 로그를 남기지 않는다.

구조화 로그 필요 여부:

- 없음. 조회 성공 이벤트는 남기지 않는다.

request id / user id:

- 전역 middleware의 request id를 사용한다.
- 오류 추적은 request id와 `CurrentUser.id` 기준으로 연결한다.

redaction:

- access token, refresh token을 로그에 남기지 않는다.
- `title`, `description`, `config` 원문은 성공 로그 대상으로 남기지 않는다.

provider error context:

- 외부 Provider 호출 없음

## 9. DB / Index

주요 Prisma model:

```prisma
model AttributeDefinition {
  id                 String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId        String        @db.Uuid
  objectDefinitionId String        @db.Uuid
  createdByActorId   String        @db.Uuid
  updatedByActorId   String?       @db.Uuid
  apiSlug            String
  title              String
  sortOrder          Int           @default(0)
  type               AttributeType
  configJson         Json?
  icon               String?
  isMultiselect      Boolean       @default(false)
  description        String?
  createdAt          DateTime      @default(now()) @db.Timestamptz(3)
  updatedAt          DateTime      @updatedAt @db.Timestamptz(3)

  @@index([objectDefinitionId, sortOrder, id])
  @@unique([objectDefinitionId, apiSlug])
}
```

조회 조건:

```ts
{
  id: attributeDefinitionId,
  workspaceId,
  objectDefinitionId
}
```

추가 index:

- 없음. 단건 조회는 primary key `id`와 소속 조건을 함께 사용한다.

## 10. 구현 범위

- Backend API 계약 문서 추가
- AttributeDefinition 단건 조회 application use case 추가
- AttributeDefinition 단건 조회 query port 추가
- AttributeDefinition 단건 조회 Prisma adapter 추가
- 기존 AttributeDefinition controller에 단건 `GET` route 추가
- AttributeDefinition module provider 조립
- AttributeDefinition domain error에 `AttributeDefinitionNotFoundError` 추가
- application/controller/repository mapping 테스트 추가

## 11. 제외 범위

- Frontend API client 연결
- Frontend popover API 연동
- AttributeDefinition 수정 API
- AttributeDefinition 순서 변경 API
- AttributeDefinition 삭제/복제/삽입 API
- SelectOptionDefinition 또는 StatusOptionDefinition option 상세 조회
- `apiSlug` 응답 노출

## 12. 완료 검증

완료일: 2026-10-04

구현 커밋:

- `b42dd64a feat(be): add attribute definition detail api`

완료 당시 검증:

- `pnpm -C BE typecheck`
- `pnpm -C BE lint`
- `pnpm -C BE test -- --runInBand BE/src/modules/attribute-definition/application/use-cases/get-workspace-object-attribute-definition.use-case.spec.ts BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.spec.ts BE/src/modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-detail-query.repository.spec.ts`
- `pnpm -C BE test -- --runInBand`
- `pnpm -C BE prisma:validate`
- `pnpm -C BE build`

DONE 이동 전 재확인:

- `PATH=/opt/homebrew/bin:$PATH pnpm -C BE typecheck` 통과
- `PATH=/opt/homebrew/bin:$PATH pnpm -C BE test -- --runInBand BE/src/modules/attribute-definition/application/use-cases/get-workspace-object-attribute-definition.use-case.spec.ts BE/src/modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-detail-query.repository.spec.ts BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.spec.ts` 통과

## 13. 구현 상태

- Backend controller: `BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.ts`
- Application use case: `BE/src/modules/attribute-definition/application/use-cases/get-workspace-object-attribute-definition.use-case.ts`
- Query port: `BE/src/modules/attribute-definition/application/ports/attribute-definition-detail-query.port.ts`
- Prisma adapter: `BE/src/modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-detail-query.repository.ts`
- Domain error: `BE/src/modules/attribute-definition/domain/attribute-definition.errors.ts`
- Module provider: `BE/src/modules/attribute-definition/infrastructure/attribute-definition.module.ts`
- 완료 당시 검증:
  - `pnpm -C BE typecheck`
  - `pnpm -C BE lint`
  - `pnpm -C BE test -- --runInBand BE/src/modules/attribute-definition/application/use-cases/get-workspace-object-attribute-definition.use-case.spec.ts BE/src/modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-detail-query.repository.spec.ts BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.spec.ts`
  - `pnpm -C BE test -- --runInBand`
  - `pnpm -C BE prisma:validate`
  - `pnpm -C BE build`
