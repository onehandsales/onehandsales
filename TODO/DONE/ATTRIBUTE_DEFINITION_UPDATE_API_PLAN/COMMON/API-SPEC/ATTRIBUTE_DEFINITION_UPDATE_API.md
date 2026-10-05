# AttributeDefinition Update API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 기존 AttributeDefinition 조회/생성 API는 유지하고 수정 API를 신규 추가한다.
- 기존 FE 영향: 있음. AttributeDefinition popover 수정 UI가 변경된 필드만 PATCH request에 포함해 이 API를 호출한다.
- migration 또는 fallback: `AttributeDefinition.objectDefinitionId + apiSlug` unique index를 기존 중복 방지 기준으로 사용한다. AttributeDefinition row 경계 조회를 명시적으로 보강하기 위해 `workspaceId + objectDefinitionId + id` index를 추가한다.

## 1. 목적

ObjectDefinition 목록 화면에서 사용자가 AttributeDefinition popover를 열고 `title`, `description`, `icon`, `isMultiselect` 중 일부 값을 변경했을 때 현재 Workspace의 특정 ObjectDefinition에 속한 AttributeDefinition을 수정한다.

이 API는 sparse PATCH 계약이다. User Web은 변경되지 않은 필드를 request body에 포함하지 않는다. Backend는 request body에 포함된 필드만 수정하고, 포함되지 않은 필드는 기존 값을 유지한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- ObjectDefinition 소속 검증: `objectDefinitionId`가 요청 `workspaceId` 안에 있어야 한다.
- ObjectDefinition 없음과 다른 Workspace 소속은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- AttributeDefinition 소속 검증: `attributeDefinitionId`가 요청 `workspaceId + objectDefinitionId` 안에 있어야 한다.
- AttributeDefinition 없음과 다른 Workspace/ObjectDefinition 소속은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 수정할 수 있다.
- Actor 검증: 수정 감사 주체 저장을 위해 `WorkspaceMember`에 연결된 `WORKSPACE_MEMBER` Actor가 필요하다.
- DB schema 연결: `WorkspaceMember`, `Actor`, `ObjectDefinition`, `AttributeDefinition`
- 중복 기준: 같은 ObjectDefinition 안에서 `AttributeDefinition.apiSlug`는 중복될 수 없다.
- DB unique 기준: `@@unique([objectDefinitionId, apiSlug])`
- 중복 조회 조건: 보안 경계 확인을 위해 application/repository 조회는 `workspaceId + objectDefinitionId + apiSlug`를 함께 사용하고, 현재 수정 대상 `attributeDefinitionId`는 제외한다.
- `title`: request에 포함된 경우 application use case에서 trim한 뒤 저장 기준 이름으로 사용한다.
- `apiSlug`, `title`: `title`이 request에 포함되면 trim된 `title` 값을 동일하게 저장한다.
- `description`: request에 없으면 변경하지 않는다. request에 `null` 또는 빈 문자열이 오면 DB에는 `null`을 저장한다. 값이 있으면 trim 없이 그대로 저장한다.
- `icon`: request에 없으면 변경하지 않는다. request에 `null` 또는 빈 문자열이 오면 DB에는 `null`을 저장한다. 값이 있으면 trim 없이 그대로 저장한다.
- `isMultiselect`: request에 없으면 변경하지 않는다. request에 boolean 값이 오면 그대로 저장한다.
- `type`, `configJson`, `sortOrder`: 이 API에서는 변경하지 않는다.
- transaction: 없음. 단일 AttributeDefinition row update API다.
- 변경 model: `AttributeDefinition`
- rollback 범위: 단일 row update 실패 시 DB 변경 없음
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음
- idempotency: 없음. 같은 값을 반복 전송하면 같은 AttributeDefinition ID로 `200 OK`를 응답한다.
- idempotency key 출처/scope: 해당 없음
- 중복 요청 응답 기준: 같은 `objectDefinitionId + apiSlug` 중복이면 `AttributeDefinitionApiSlugAlreadyExists`
- outbox: 필요 없음. 외부 side effect와 후속 비동기 처리가 없다.
- observability: 수정 성공 시 원문 title/description/icon 없이 구조화 로그를 남긴다.
- log event key: `crm.attributeDefinition.updated`
- redaction: `title`, `apiSlug`, `icon`, `description` 원문 로그 금지, access/refresh token 로그 금지

## 3. DTO

### UpdateWorkspaceObjectAttributeDefinitionDto

```ts
{
  title?: string;
  description?: string | null;
  icon?: string | null;
  isMultiselect?: boolean;
}
```

규칙:

- 모든 필드는 optional이다.
- request body에는 최소 하나 이상의 계약 필드가 포함되어야 한다.
- request body에 없는 필드는 변경하지 않는다.
- request body에 계약 외 필드가 있으면 Nest validation error로 처리한다.
- `description`, `icon`은 값을 비우기 위해 `null` 또는 빈 문자열을 보낼 수 있다.
- `title`, `isMultiselect`는 `null`을 허용하지 않는다.

### UpdateWorkspaceObjectAttributeDefinitionResponse

```ts
{
  attributeDefinitionId: string;
}
```

## 4. API

### PATCH /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions/:attributeDefinitionId

로그인한 사용자가 멤버로 속한 Workspace의 특정 ObjectDefinition에 연결된 AttributeDefinition 일부 필드를 수정한다.

Request DTO: `UpdateWorkspaceObjectAttributeDefinitionDto`

Response DTO: `UpdateWorkspaceObjectAttributeDefinitionResponse`

Path param:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| workspaceId | UUID string | 예 | 아니오 | UUID | 수정 대상 Workspace ID |
| objectDefinitionId | UUID string | 예 | 아니오 | UUID | 수정 대상 ObjectDefinition ID |
| attributeDefinitionId | UUID string | 예 | 아니오 | UUID | 수정 대상 AttributeDefinition ID |

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie:

- refresh cookie는 이 API request 계약에 사용하지 않음

Body 예시:

```json
{
  "title": "계약 금액"
}
```

```json
{
  "description": null,
  "icon": "circle-dollar-sign"
}
```

```json
{
  "isMultiselect": true
}
```

Validation:

- body: object required
- body: 최소 하나 이상의 계약 필드 필요
- `title`: string optional
- `title`: null 허용 안 함
- `title`: raw 입력이 빈 문자열이면 application validation에서 trim 후 차단
- `title`: trim 후 1자 이상
- `title`: trim 후 최대 80자
- `description`: string 또는 null optional
- `description`: 빈 문자열은 `null`로 정규화
- `icon`: string 또는 null optional
- `icon`: 빈 문자열은 `null`로 정규화
- `isMultiselect`: boolean optional
- `isMultiselect`: null 허용 안 함
- request body에 계약 외 필드가 있으면 Nest validation error

Success:

- Status: `200 OK`
- Body: 있음

```json
{
  "attributeDefinitionId": "00000000-0000-4000-8000-000000000601"
}
```

## 5. Business Logic

1. request body에 `title`, `description`, `icon`, `isMultiselect` 중 하나 이상이 포함되어 있는지 확인한다.
2. 포함된 필드만 검증하고 저장 기준 값으로 정규화한다.
3. `title`이 포함되면 trim 후 `title`과 `apiSlug` 저장값으로 사용한다.
4. `description`이 포함되면 `null` 또는 빈 문자열은 `null`로 정규화하고, 문자열 값은 trim 없이 저장한다.
5. `icon`이 포함되면 `null` 또는 빈 문자열은 `null`로 정규화하고, 문자열 값은 trim 없이 저장한다.
6. `isMultiselect`가 포함되면 boolean 값을 그대로 저장한다.
7. `currentUser.id + workspaceId`로 WorkspaceMember를 확인하고 수정 감사용 Actor ID를 조회한다.
8. Workspace membership이 없으면 정보 노출을 막기 위해 not found로 응답한다.
9. WorkspaceMember에 연결된 Actor가 없으면 내부 정합성 오류로 중단한다.
10. `workspaceId + objectDefinitionId`로 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
11. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 응답한다.
12. `workspaceId + objectDefinitionId + attributeDefinitionId`로 AttributeDefinition 수정 대상을 조회한다.
13. AttributeDefinition이 없거나 다른 ObjectDefinition/Workspace에 속하면 not found로 응답한다.
14. `title`이 포함되고 정규화된 `apiSlug`가 현재 `apiSlug`와 다르면, 같은 ObjectDefinition 안에 동일 `apiSlug`를 가진 다른 AttributeDefinition이 있는지 확인한다.
15. 중복이 있으면 conflict로 응답한다.
16. request에 포함된 필드만 `AttributeDefinition`에 반영한다.
17. `updatedByActorId`를 수정 감사 Actor ID로 저장한다.
18. `{ attributeDefinitionId }`를 반환한다.

수정 매핑:

```ts
{
  updatedByActorId: workspaceAccess.actorId,
  ...(hasTitle ? { title: normalizedTitle, apiSlug: normalizedTitle } : {}),
  ...(hasDescription ? { description: normalizedDescription } : {}),
  ...(hasIcon ? { icon: normalizedIcon } : {}),
  ...(hasIsMultiselect ? { isMultiselect: normalizedIsMultiselect } : {})
}
```

비교 기준:

- Workspace/ObjectDefinition 검증 흐름은 기존 AttributeDefinition 생성/목록/상세 API와 동일하다.
- sparse PATCH 필드 존재 여부 판단은 RecordAttributeValueDefinition update API의 `hasValue` 패턴을 따른다.
- 대상 row 소속 검증은 `workspaceId + objectDefinitionId + attributeDefinitionId` 경계 조건을 사용한다.
- 단일 row update API이므로 transaction manager를 사용하지 않는다.

## 6. Error Contract

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `objectDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `attributeDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| request body가 비어 있거나 계약 필드가 없음 | `ATTRIBUTE_DEFINITION_UPDATE_FIELD_REQUIRED` | 400 | 저장 버튼 비활성/요청 버그로 처리 | warn |
| `title`이 null 또는 trim 후 빈 문자열 | `ATTRIBUTE_DEFINITION_TITLE_REQUIRED` | 400 | title 입력 필드 오류 표시 | warn |
| `title`이 trim 후 80자 초과 | `ATTRIBUTE_DEFINITION_TITLE_TOO_LONG` | 400 | title 입력 필드 오류 표시 | warn |
| `description`이 string/null이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `icon`이 string/null이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `isMultiselect`가 boolean이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| application 계층에 `isMultiselect`가 boolean 외 값으로 전달됨 | `ATTRIBUTE_DEFINITION_MULTISELECT_INVALID` | 400 | 요청 버그로 처리 | warn |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `AttributeDefinitionWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 Workspace 목록 재조회 | info |
| ObjectDefinition이 없거나 요청 Workspace에 속하지 않음 | `AttributeDefinitionObjectDefinitionNotFound` | 404 | 선택 ObjectDefinition 초기화 또는 Object 목록 재조회 | info |
| AttributeDefinition이 없거나 요청 ObjectDefinition에 속하지 않음 | `AttributeDefinitionNotFound` | 404 | popover를 닫고 AttributeDefinition 목록 재조회 | info |
| 같은 ObjectDefinition 안에 변경 후 `apiSlug`가 이미 존재함 | `AttributeDefinitionApiSlugAlreadyExists` | 409 | title 중복 오류 표시 | info |
| WorkspaceMember Actor 정합성 오류 | Internal server error | 500 | 공통 오류 처리 | error |

권한 없음과 소유권 없음은 404로 응답해 다른 Workspace/Object/AttributeDefinition 존재 여부를 노출하지 않는다.

### HttpExceptionFilter 반영

- `AttributeDefinitionWorkspaceNotFound`, `AttributeDefinitionObjectDefinitionNotFound`, `AttributeDefinitionNotFound`는 error code가 `NotFound`로 끝나므로 현재 `HttpExceptionFilter`의 not found 규칙을 재사용한다.
- `AttributeDefinitionApiSlugAlreadyExists`는 conflict 규칙으로 `409 Conflict`를 반환한다.
- `ATTRIBUTE_DEFINITION_UPDATE_FIELD_REQUIRED`, `ATTRIBUTE_DEFINITION_TITLE_REQUIRED`, `ATTRIBUTE_DEFINITION_TITLE_TOO_LONG`, `ATTRIBUTE_DEFINITION_MULTISELECT_INVALID`는 `400 Bad Request` validation error로 반환한다.

## 7. Transaction Contract

transaction 필요 여부:

- 없음

이유:

- 이 API는 `AttributeDefinition` 단일 row만 수정한다.
- `RecordAttributeValueDefinition` row를 생성/수정하지 않는다.
- 외부 Provider 호출과 outbox side effect가 없다.

변경 model:

- `AttributeDefinition`

rollback 범위:

- 단일 update 실패 시 해당 row 변경 없음

외부 Provider 호출:

- 없음

부수 로그/이력 transaction 포함 여부:

- 해당 없음

Idempotency / Outbox:

- idempotency 필요 여부: 없음
- idempotency key 출처와 scope: 해당 없음
- 중복 요청 응답 기준: 같은 값 반복 수정은 동일 AttributeDefinition ID로 `200 OK`를 반환한다. 단, 다른 row와 `apiSlug`가 충돌하면 `409 Conflict`를 반환한다.
- outbox 또는 후속 처리 기록 필요 여부: 없음

## 8. Observability Contract

log event key:

- `crm.attributeDefinition.updated`

구조화 로그 필요 여부:

- 있음. 수정 성공 시 1회 남긴다.

필수 context:

- `workspaceId`
- `objectDefinitionId`
- `attributeDefinitionId`
- `actorId`
- `changedFields`: request body에 포함된 계약 필드명 배열

금지 context:

- `title` 원문
- `apiSlug` 원문
- `description` 원문
- `icon` 원문
- access token
- refresh token

request id / user id:

- 전역 middleware의 request id를 사용한다.
- 오류 추적은 request id와 `CurrentUser.id` 기준으로 연결한다.

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
  createdAt          DateTime      @default(now()) @db.Timestamptz(6)
  updatedAt          DateTime      @updatedAt @db.Timestamptz(6)

  @@index([objectDefinitionId, sortOrder, id])
  @@unique([objectDefinitionId, apiSlug])
}
```

이번 API에서 사용하는 조회/수정 조건:

- 대상 조회: `workspaceId + objectDefinitionId + attributeDefinitionId`
- 중복 조회: `workspaceId + objectDefinitionId + apiSlug`, 단 현재 `attributeDefinitionId` 제외
- update boundary: `workspaceId + objectDefinitionId + attributeDefinitionId`

필수 기존 index:

- `@@unique([objectDefinitionId, apiSlug])`

추가 index:

```prisma
@@index([workspaceId, objectDefinitionId, id])
```

목적:

- AttributeDefinition 수정 대상이 요청 Workspace/ObjectDefinition 경계 안에 있는지 확인하는 조회와 update boundary 조건을 명시적으로 지원한다.
- `id` primary key만으로도 단건 조회는 가능하지만, 이 API의 ownership boundary 조건을 DB schema에 드러낸다.

추가 migration:

- Prisma schema에 위 index를 추가하고 migration을 생성한다.
- 기존 데이터 backfill은 필요 없다.

## 10. FE 처리 기준

- User Web은 변경된 필드만 request body에 포함한다.
- 변경된 필드가 없으면 API를 호출하지 않는다.
- `title` 변경 시 FE는 request에 `title`만 포함한다. Backend가 `apiSlug`를 같은 값으로 변경한다.
- `description` 또는 `icon`을 비우는 경우 `null`을 보낸다.
- 성공 시 popover local state와 AttributeDefinition 목록/header row cache를 갱신한다.
- `409 AttributeDefinitionApiSlugAlreadyExists`는 title 중복 오류로 표시한다.
- `404` 계열 ownership/not found 오류는 popover를 닫고 목록을 재조회한다.

## 11. BE 구현 기준

- Controller는 `@Patch(":attributeDefinitionId")`와 `@HttpCode(HttpStatus.OK)`를 사용한다.
- Controller는 `Object.prototype.hasOwnProperty.call(body, "<field>")` 방식으로 sparse PATCH 필드 포함 여부를 확인한다.
- Application use case는 request presence flag와 value를 함께 받아 검증/정규화/중복 확인/update를 수행한다.
- Prisma repository는 update 시 included field만 `data`에 포함한다.
- Prisma `P2002`는 `AttributeDefinitionApiSlugAlreadyExistsError`로 매핑한다.
- AttributeDefinition module은 다른 module의 infrastructure repository를 직접 import하지 않고, Workspace/ObjectDefinition public access query port만 사용한다.

## 12. Test Contract

Application use case:

- 빈 body 또는 계약 필드 없음은 validation error
- `title` trim 후 `title/apiSlug` 동시 변경
- `title` null/blank/80자 초과 validation
- `description` 생략 시 미변경
- `description` null 또는 빈 문자열은 null 저장
- `icon` 생략 시 미변경
- `icon` null 또는 빈 문자열은 null 저장
- `isMultiselect` 생략 시 미변경
- `isMultiselect` boolean 값 저장
- Workspace membership 없음은 workspace not found
- ObjectDefinition 경계 밖이면 object definition not found
- AttributeDefinition 경계 밖이면 attribute definition not found
- title 변경 후 apiSlug 중복이면 conflict
- title이 현재 apiSlug와 같으면 자기 자신 중복으로 conflict 처리하지 않음
- 성공 로그는 raw title/description/icon 없이 ids와 changedFields만 포함

Controller:

- PATCH route metadata와 `200 OK` status
- request body field presence flag 전달
- path param UUID validation
- unknown field validation
- non-string `title`, `description`, `icon` validation
- non-boolean `isMultiselect` validation

Repository integration:

- `workspaceId + objectDefinitionId + attributeDefinitionId` 경계 조건으로 대상 조회
- included field만 update
- `updatedByActorId` 반영
- `apiSlug` unique 충돌 시 `AttributeDefinitionApiSlugAlreadyExistsError` 매핑
- 자기 자신을 제외한 apiSlug 중복 조회
- 추가 index migration 적용 여부 확인
