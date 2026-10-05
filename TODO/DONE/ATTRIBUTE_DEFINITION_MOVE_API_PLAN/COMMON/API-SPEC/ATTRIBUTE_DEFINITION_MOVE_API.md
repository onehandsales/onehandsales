# AttributeDefinition Move Position API

계약 상태: implemented

API 식별자: `ATTRIBUTE_DEFINITION_MOVE_POSITION`

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 기존 AttributeDefinition 생성/목록/상세/수정 API는 유지하고 위치 변경 API를 신규 추가한다.
- 기존 FE 영향: 있음. User Web Object 목록 header drag-and-drop 종료 시 이 API를 호출한다.
- migration 또는 fallback: 없음. 현재 `AttributeDefinition.sortOrder`와 기존 index를 사용한다.

## 1. 목적

ObjectDefinition 목록 화면에서 사용자가 AttributeDefinition header column을 좌우로 드래그해 위치를 바꾸면, 현재 Workspace의 특정 ObjectDefinition 안에서 기존 AttributeDefinition의 표시 순서를 변경한다.

이 API는 FE가 `sortOrder` 숫자를 직접 계산하지 않도록 한다. FE는 이동 대상 AttributeDefinition과 기준 AttributeDefinition, 기준의 앞/뒤 위치만 보낸다. Backend는 같은 `workspaceId + objectDefinitionId` 경계 안에서 `AttributeDefinition.sortOrder`를 재정렬한다.

## 2. 선행 기준

작성 시 적용한 기준 문서:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `TODO/DONE/ATTRIBUTE_DEFINITION_INSERT_POSITION_PLAN/COMMON/API-SPEC/ATTRIBUTE_DEFINITION_INSERT_POSITION_API.md`
- `TODO/DONE/ATTRIBUTE_DEFINITION_UPDATE_API_PLAN/COMMON/API-SPEC/ATTRIBUTE_DEFINITION_UPDATE_API.md`

## 3. 공통 정책

- 인증: Bearer access token 필요
- User API 경로: `/api/*`
- 소유권: `CurrentUser.id + workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- ObjectDefinition 소속 검증: `objectDefinitionId`가 요청 `workspaceId` 안에 있어야 한다.
- ObjectDefinition 없음과 다른 Workspace 소속은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- AttributeDefinition 소속 검증: 이동 대상과 기준 대상이 모두 요청 `workspaceId + objectDefinitionId` 안에 있어야 한다.
- AttributeDefinition 없음과 다른 Workspace/ObjectDefinition 소속은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 위치를 변경할 수 있다.
- Actor 검증: 수정 감사 주체 저장을 위해 `WorkspaceMember`에 연결된 `WORKSPACE_MEMBER` Actor가 필요하다.
- DB schema 연결: `WorkspaceMember`, `Actor`, `ObjectDefinition`, `AttributeDefinition`
- 변경 model: `AttributeDefinition`
- `RecordAttributeValueDefinition`은 변경하지 않는다. Record 목록 조회는 이미 `attributeDefinition.sortOrder ASC` 기준으로 cell을 정렬한다.

## 4. DTO

### MoveWorkspaceObjectAttributeDefinitionDto

```ts
{
  targetPlacementPosition: {
    referenceAttributeDefinitionId: string;
    side: "before" | "after";
  };
}
```

규칙:

- `targetPlacementPosition`은 필수다.
- `targetPlacementPosition`은 plain object여야 한다.
- `targetPlacementPosition`에 허용되는 key는 `referenceAttributeDefinitionId`, `side`뿐이다.
- `referenceAttributeDefinitionId`는 UUID v4 문자열이어야 한다.
- `side`는 `"before"` 또는 `"after"`만 허용한다.
- path의 `attributeDefinitionId`와 `referenceAttributeDefinitionId`가 같으면 validation error로 처리한다.
- request body에 계약 외 top-level field가 있으면 Nest validation error로 처리한다.

### MoveWorkspaceObjectAttributeDefinitionResponse

```ts
{
  attributeDefinitionId: string;
}
```

## 5. API

### PATCH /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions/:attributeDefinitionId/position

로그인한 사용자가 멤버로 속한 Workspace의 특정 ObjectDefinition 안에서 기존 AttributeDefinition의 위치를 변경한다.

Request DTO: `MoveWorkspaceObjectAttributeDefinitionDto`

Response DTO: `MoveWorkspaceObjectAttributeDefinitionResponse`

Path param:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| workspaceId | UUID string | 예 | 아니오 | UUID | 이동 대상 Workspace ID |
| objectDefinitionId | UUID string | 예 | 아니오 | UUID | 이동 대상 ObjectDefinition ID |
| attributeDefinitionId | UUID string | 예 | 아니오 | UUID | 위치를 변경할 AttributeDefinition ID |

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie:

- refresh cookie는 이 API request 계약에 사용하지 않음

Body 예시:

```json
{
  "targetPlacementPosition": {
    "referenceAttributeDefinitionId": "00000000-0000-4000-8000-000000000602",
    "side": "before"
  }
}
```

```json
{
  "targetPlacementPosition": {
    "referenceAttributeDefinitionId": "00000000-0000-4000-8000-000000000602",
    "side": "after"
  }
}
```

Body field:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| targetPlacementPosition | object | 예 | 아니오 | application 계약 검증 | 이동 목표 위치 |
| targetPlacementPosition.referenceAttributeDefinitionId | UUID string | 예 | 아니오 | UUID v4 | 기준 AttributeDefinition ID |
| targetPlacementPosition.side | `"before" \| "after"` | 예 | 아니오 | enum | 기준 속성의 앞 또는 뒤 |

Success:

- Status: `200 OK`
- Body: 있음

```json
{
  "attributeDefinitionId": "00000000-0000-4000-8000-000000000601"
}
```

## 6. Business Logic

1. request body의 `targetPlacementPosition` 구조를 DB 조회 전에 검증한다.
2. `targetPlacementPosition.referenceAttributeDefinitionId`와 `targetPlacementPosition.side`를 정규화한다.
3. path의 `attributeDefinitionId`와 `referenceAttributeDefinitionId`가 같으면 `ATTRIBUTE_DEFINITION_POSITION_INVALID`로 차단한다.
4. `currentUser.id + workspaceId`로 WorkspaceMember를 확인하고 수정 감사용 Actor ID를 조회한다.
5. Workspace membership이 없으면 정보 노출을 막기 위해 not found로 응답한다.
6. WorkspaceMember에 연결된 Actor가 없으면 내부 정합성 오류로 중단한다.
7. `workspaceId + objectDefinitionId`로 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
8. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 응답한다.
9. Application layer에서 `TransactionManager.runInTransaction`으로 위치 변경 작업을 시작한다.
10. transaction 안에서 이동 대상 AttributeDefinition의 현재 `sortOrder`를 조회한다.
11. transaction 안에서 기준 AttributeDefinition의 현재 `sortOrder`를 조회한다.
12. 이동 대상 또는 기준 대상이 `workspaceId + objectDefinitionId` 경계 안에 없으면 `AttributeDefinitionNotFound`로 응답한다.
13. `side` 기준으로 목표 `sortOrder`를 계산한다.
14. 목표 `sortOrder`가 현재 `sortOrder`와 같으면 no-op 성공으로 처리하고 `{ attributeDefinitionId }`를 반환한다.
15. 목표 `sortOrder`가 현재보다 작으면, `[targetSortOrder, sourceSortOrder)` 범위의 AttributeDefinition을 `+1` 한다.
16. 목표 `sortOrder`가 현재보다 크면, `(sourceSortOrder, targetSortOrder]` 범위의 AttributeDefinition을 `-1` 한다.
17. 이동 대상 AttributeDefinition의 `sortOrder`를 목표 값으로 수정한다.
18. 순서가 바뀐 AttributeDefinition row의 `updatedByActorId`를 현재 `workspaceAccess.actorId`로 저장한다.
19. 원문 title/description/icon 없이 위치 변경 이벤트만 구조화 로그로 남긴다.
20. `{ attributeDefinitionId }`를 반환한다.

## 7. Sort Order 동작

예시 초기 상태:

| AttributeDefinition | sortOrder |
| --- | ---: |
| A | 0 |
| B | 1 |
| C | 2 |
| D | 3 |

### 7.1 D를 B 앞으로 이동

요청:

```json
{
  "targetPlacementPosition": {
    "referenceAttributeDefinitionId": "B",
    "side": "before"
  }
}
```

동작:

- 이동 대상 D의 현재 `sortOrder`는 `3`이다.
- 기준 속성 B의 현재 `sortOrder`는 `1`이다.
- `targetSortOrder = 1`이다.
- `1 <= sortOrder < 3`인 B, C를 각각 `+1` 한다.
- D를 `sortOrder = 1`로 수정한다.

결과:

| AttributeDefinition | sortOrder |
| --- | ---: |
| A | 0 |
| D | 1 |
| B | 2 |
| C | 3 |

### 7.2 B를 D 뒤로 이동

요청:

```json
{
  "targetPlacementPosition": {
    "referenceAttributeDefinitionId": "D",
    "side": "after"
  }
}
```

동작:

- 이동 대상 B의 현재 `sortOrder`는 `1`이다.
- 기준 속성 D의 현재 `sortOrder`는 `3`이다.
- `side = "after"`의 raw target은 `4`이다.
- 이동 대상이 기준보다 앞에 있으므로 기존 위치를 빼는 효과를 반영해 `targetSortOrder = 3`으로 보정한다.
- `1 < sortOrder <= 3`인 C, D를 각각 `-1` 한다.
- B를 `sortOrder = 3`으로 수정한다.

결과:

| AttributeDefinition | sortOrder |
| --- | ---: |
| A | 0 |
| C | 1 |
| D | 2 |
| B | 3 |

### 7.3 target 계산

```ts
let targetSortOrder =
  side === "before" ? referenceSortOrder : referenceSortOrder + 1;

if (sourceSortOrder < targetSortOrder) {
  targetSortOrder -= 1;
}
```

## 8. Error Contract

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `objectDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `attributeDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| request body에 계약 외 top-level field가 있음 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `targetPlacementPosition`이 없거나 객체가 아님 | `ATTRIBUTE_DEFINITION_POSITION_INVALID` | 400 | drag/drop 상태를 되돌리고 목록 재조회 가능 | warn |
| `targetPlacementPosition`에 계약 외 하위 field가 있음 | `ATTRIBUTE_DEFINITION_POSITION_INVALID` | 400 | 요청 버그로 처리 | warn |
| `referenceAttributeDefinitionId`가 UUID v4가 아님 | `ATTRIBUTE_DEFINITION_POSITION_INVALID` | 400 | 요청 버그로 처리 | warn |
| `side`가 `before`/`after`가 아님 | `ATTRIBUTE_DEFINITION_POSITION_INVALID` | 400 | 요청 버그로 처리 | warn |
| 이동 대상과 기준 대상이 같은 AttributeDefinition임 | `ATTRIBUTE_DEFINITION_POSITION_INVALID` | 400 | no-op UI로 처리하고 목록 재조회 가능 | info |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `AttributeDefinitionWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 Workspace 목록 재조회 | info |
| ObjectDefinition이 없거나 요청 Workspace에 속하지 않음 | `AttributeDefinitionObjectDefinitionNotFound` | 404 | 현재 Object 화면을 비우거나 Object 목록 재조회 | info |
| 이동 대상 AttributeDefinition이 없거나 요청 ObjectDefinition에 속하지 않음 | `AttributeDefinitionNotFound` | 404 | header/record 목록 재조회 | info |
| 기준 AttributeDefinition이 없거나 요청 ObjectDefinition에 속하지 않음 | `AttributeDefinitionNotFound` | 404 | header/record 목록 재조회 | info |
| WorkspaceMember Actor 정합성 오류 | Internal server error | 500 | 공통 오류 처리 | error |
| DB transaction 실패 | Internal server error | 500 | drag/drop 상태를 되돌리고 재시도 가능 | error |

권한 없음과 소유권 없음은 404로 응답해 다른 Workspace/Object/AttributeDefinition 존재 여부를 노출하지 않는다.

### HttpExceptionFilter 반영

- `AttributeDefinitionWorkspaceNotFound`, `AttributeDefinitionObjectDefinitionNotFound`, `AttributeDefinitionNotFound`는 error code가 `NotFound`로 끝나므로 현재 not found 규칙을 재사용한다.
- `ATTRIBUTE_DEFINITION_POSITION_INVALID`는 `400 Bad Request` validation error로 반환한다.
- `ATTRIBUTE_DEFINITION_POSITION_INVALID`는 신규 코드이므로 구현 시 `AttributeDefinitionValidationErrorCode` union과 `HttpExceptionFilter.getDomainErrorStatus`의 `400 Bad Request` 매핑에 추가한다.
- `AttributeDefinitionValidationField`에는 신규 field `"targetPlacementPosition"`을 추가하고, 위치 입력 검증 실패는 `new AttributeDefinitionValidationError("ATTRIBUTE_DEFINITION_POSITION_INVALID", "targetPlacementPosition", "Attribute definition target placement position is invalid")` 형식으로 생성한다.

## 9. Transaction Contract

transaction 필요 여부:

- 필요

이유:

- 하나의 사용자 행동이 여러 `AttributeDefinition` row의 `sortOrder`와 `updatedByActorId`를 함께 변경한다.
- range shift만 성공하고 이동 대상 update가 실패하는 중간 상태를 막아야 한다.
- 이 API는 `RecordAttributeValueDefinition`을 수정하지 않지만, Record 목록 조회가 `AttributeDefinition.sortOrder`를 사용하므로 AttributeDefinition 순서 변경은 원자적으로 완료되어야 한다.

변경 model:

- `AttributeDefinition`

transaction 안에서 수행하는 작업:

- 이동 대상 AttributeDefinition `sortOrder` 조회
- 기준 AttributeDefinition `sortOrder` 조회
- bounded range 안의 AttributeDefinition `sortOrder` shift
- 이동 대상 AttributeDefinition `sortOrder` update
- 변경된 row의 `updatedByActorId` 저장

rollback 범위:

- range shift 또는 이동 대상 update 중 하나라도 실패하면 해당 위치 변경 전체를 rollback한다.

외부 Provider 호출:

- 없음

부수 로그/이력 transaction 포함 여부:

- 없음. 위치 변경 성공 후 구조화 로그만 남긴다.

Idempotency / Outbox:

- idempotency 필요 여부: 별도 key 없음
- idempotency key 출처와 scope: 해당 없음
- 중복 요청 응답 기준: 같은 최종 위치 요청은 no-op 또는 같은 재정렬 결과로 `200 OK`를 반환한다.
- outbox 또는 후속 처리 기록 필요 여부: 없음
- future MSA 분리 시 경계: `AttributeDefinition` 위치 변경은 `attribute-definition` ownership 안에서 동기 처리한다. 별도 service/event/outbox 대상은 현재 없다.

동시성 기준:

- 각 요청은 transaction 안에서 원자적으로 처리한다.
- 현재 `TransactionManager`는 별도 isolation level이나 ObjectDefinition 단위 lock을 계약하지 않는다.
- 같은 ObjectDefinition 안에서 동시에 여러 위치 변경 요청이 들어오는 경우, 이번 계약은 요청 간 직렬화까지 보장하지 않는다.
- Backend는 transaction 안에서 조회한 이동 대상/기준 대상 `sortOrder` 기준으로 bounded range shift를 수행하고, FE는 성공/실패 후 목록을 재조회해 서버 상태를 신뢰한다.
- 강한 동시성 제어가 필요해지는 경우 ObjectDefinition 단위 lock, order version, optimistic lock 중 하나를 후속 계약에서 추가한다.
- 별도 optimistic lock 또는 idempotency key는 이번 계약 범위에 포함하지 않는다.

## 10. Observability Contract

log event key:

- `crm.attributeDefinition.moved`

구조화 로그 필요 여부:

- 있음. 성공 시 1회 남긴다.
- no-op 성공도 같은 event key로 남기되 `isNoop: true`, `shiftedAttributeDefinitionCount: 0`을 포함한다.

필수 context:

- `userId`
- `workspaceId`
- `objectDefinitionId`
- `attributeDefinitionId`
- `referenceAttributeDefinitionId`
- `side`
- `actorId`
- `fromSortOrder`
- `toSortOrder`
- `shiftedAttributeDefinitionCount`
- `isNoop`

금지 context:

- `title` 원문
- `apiSlug` 원문
- `description` 원문
- `icon` 원문
- RecordAttributeValueDefinition 값 원문
- access token
- refresh token

request id / user id:

- 전역 middleware의 request id를 사용한다.
- 오류 추적은 request id와 `CurrentUser.id` 기준으로 연결한다.

provider error context:

- 외부 Provider 호출 없음

## 11. DB / Repository

주요 Prisma model:

```prisma
model AttributeDefinition {
  id                 String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId        String  @db.Uuid
  objectDefinitionId String  @db.Uuid
  updatedByActorId   String? @db.Uuid
  sortOrder          Int     @default(0)

  @@index([objectDefinitionId, sortOrder, id])
  @@index([workspaceId, objectDefinitionId, id])
  @@unique([objectDefinitionId, apiSlug])
}
```

이번 API에서 사용하는 조회/수정 조건:

- WorkspaceMember 조회: `currentUser.id + workspaceId`
- ObjectDefinition 검증: `workspaceId + objectDefinitionId`
- 이동 대상 조회: `workspaceId + objectDefinitionId + attributeDefinitionId`
- 기준 대상 조회: `workspaceId + objectDefinitionId + referenceAttributeDefinitionId`
- range shift: `workspaceId + objectDefinitionId + sortOrder range`
- 이동 대상 update: `workspaceId + objectDefinitionId + attributeDefinitionId`

추가 migration:

- 없음

정렬 정합성 기준:

- 정상 데이터는 같은 `workspaceId + objectDefinitionId` 안에서 사용자에게 보이는 AttributeDefinition들이 서로 다른 `sortOrder`를 가진다는 전제를 둔다.
- 이번 API는 기존 `sortOrder` 중복이나 gap을 복구하는 maintenance API가 아니다.
- 기존 정렬 정합성이 깨진 데이터가 발견되면 별도 migration 또는 maintenance 작업으로 정리한다.

Repository port 예상 추가:

```ts
interface AttributeDefinitionForMove {
  readonly id: string;
  readonly sortOrder: number;
}

interface MoveAttributeDefinitionSortOrderInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly attributeDefinitionId: string;
  readonly fromSortOrder: number;
  readonly toSortOrder: number;
  readonly updatedByActorId: string;
  readonly transactionContext?: TransactionContext | null;
}

interface MoveAttributeDefinitionSortOrderResult {
  readonly id: string;
  readonly shiftedAttributeDefinitionCount: number;
}
```

필요 동작:

- 기존 `findAttributeDefinitionSortOrder`를 재사용하거나, 이동 전용 조회 계약으로 이동 대상/기준 대상의 `sortOrder`를 조회한다.
- `moveAttributeDefinitionSortOrder`는 `fromSortOrder`, `toSortOrder`를 받아 bounded range shift와 이동 대상 update를 같은 transaction client로 처리한다.
- range shift 조건에는 이동 대상 AttributeDefinition row가 직접 포함되지 않도록 한다.
- application/use case 공개 계약에 Prisma model type 또는 Prisma transaction client type을 노출하지 않는다.

## 12. FE 처리 기준

- User Web은 header column drag 종료 시 기존 순서와 새 순서가 다를 때만 API를 호출한다.
- FE는 `sortOrder` 숫자를 request body에 포함하지 않는다.
- request body는 `targetPlacementPosition.referenceAttributeDefinitionId`와 `targetPlacementPosition.side`만 포함한다.
- 성공 시 AttributeDefinition 목록/header row query와 RecordDefinition 목록/body row query를 재조회한다.
- optimistic update를 적용한 경우 실패 시 이전 순서로 되돌리고 목록을 재조회한다.
- `404` 계열 오류는 현재 Object/Attribute 목록이 바뀐 것으로 보고 header/record 목록을 재조회한다.
- `400 ATTRIBUTE_DEFINITION_POSITION_INVALID`는 drag/drop 계산 버그 또는 stale UI로 보고 이전 순서 복구 후 재조회한다.

## 13. BE 구현 기준

- Controller는 기존 `UserWorkspaceObjectAttributeDefinitionsController`에 `@Patch(":attributeDefinitionId/position")`를 추가한다.
- Controller method 주석은 `// API : 사용자, Workspace ObjectDefinition AttributeDefinition 위치 변경` 형식을 사용한다.
- DTO 이름은 `MoveWorkspaceObjectAttributeDefinitionDto`를 사용한다.
- UseCase 이름은 `MoveWorkspaceObjectAttributeDefinitionUseCase`를 사용한다.
- Response 이름은 `MoveWorkspaceObjectAttributeDefinitionResponse`를 사용한다.
- Application use case는 request validation, WorkspaceMember 검증, ObjectDefinition 검증, transaction orchestration, 로그 기록을 담당한다.
- Prisma repository는 range shift/update DB 작업만 담당한다.
- `TransactionManager`와 `TransactionContext`를 사용하고 application layer에서 Prisma `$transaction`을 직접 호출하지 않는다.
- 다른 module의 Prisma repository 구현체를 직접 import하지 않는다.
- ObjectDefinition 검증은 기존 `OBJECT_DEFINITION_ACCESS_QUERY` port를 사용한다.
- Workspace 검증은 기존 `WORKSPACE_ACCESS_QUERY` port를 사용한다.

## 14. Test Contract

Application use case:

- `targetPlacementPosition` 누락/`null`/객체 아님 validation error
- `targetPlacementPosition` 하위 unknown field validation error
- `referenceAttributeDefinitionId` UUID v4 형식 오류 validation error
- `side`가 `before`/`after`가 아니면 validation error
- 이동 대상과 기준 대상이 같으면 validation error
- 위치 입력 validation error는 `ATTRIBUTE_DEFINITION_POSITION_INVALID`, field `targetPlacementPosition`으로 응답
- Workspace membership 없음은 workspace not found
- WorkspaceMember actor 없음은 내부 정합성 오류
- ObjectDefinition 경계 밖이면 object definition not found
- 이동 대상 AttributeDefinition 경계 밖이면 attribute definition not found
- 기준 AttributeDefinition 경계 밖이면 attribute definition not found
- 뒤에서 앞으로 이동 시 bounded range `+1`
- 앞에서 뒤로 이동 시 bounded range `-1`
- 같은 최종 위치는 no-op 성공
- 성공 로그는 raw title/description/icon 없이 ids, side, sortOrder, shifted count만 포함

Controller:

- PATCH `:attributeDefinitionId/position` route metadata와 `200 OK` status
- AuthGuard 적용
- path param UUID validation
- request body unknown top-level field validation
- `ATTRIBUTE_DEFINITION_POSITION_INVALID` domain error가 `400 Bad Request`와 `code`, `field: "targetPlacementPosition"`으로 변환됨
- body의 `targetPlacementPosition`을 use case command로 전달

Repository integration:

- transaction context 안에서 bounded range shift와 source update를 수행
- `updatedByActorId`가 shift 대상과 source 대상에 반영됨
- `workspaceId + objectDefinitionId` 경계 밖 row는 변경하지 않음
- 앞으로 이동, 뒤로 이동, no-op 결과 검증
- RecordAttributeValueDefinition row를 변경하지 않음

검증 명령 후보:

- `pnpm -C BE prisma:validate`
- `pnpm -C BE prisma:generate`
- `pnpm -C BE typecheck`
- `pnpm -C BE lint`
- `pnpm -C BE test -- --runInBand`
- `pnpm -C BE build`
