# AttributeDefinition Create API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 신규 API를 추가한다.
- 기존 FE 영향: 있음. Attribute 생성 UX가 이 API를 호출하고, 성공 후 AttributeDefinition 목록과 Object 목록 화면 header row를 갱신해야 한다.
- migration 또는 fallback: `AttributeDefinition.objectDefinitionId + apiSlug` unique index, `AttributeDefinition.configJson` nullable JSON 컬럼, `AttributeDefinition.sortOrder` 컬럼을 사용한다. 같은 ObjectDefinition 안에 기존 중복 `apiSlug`가 있으면 migration 전 정리가 필요하다. 기존 `sortOrder`는 ObjectDefinition별 생성 순서 기준으로 backfill되어 있다.

## 1. 목적

ObjectDefinition 목록 화면에서 사용자가 새 AttributeDefinition 이름, 타입, 선택 아이콘, 선택 설명을 입력했을 때 현재 Workspace의 특정 ObjectDefinition에 AttributeDefinition을 생성한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- ObjectDefinition 소속 검증: `objectDefinitionId`가 요청 `workspaceId` 안에 있어야 한다.
- ObjectDefinition 없음과 다른 Workspace 소속은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 생성할 수 있다.
- Actor 검증: 생성 감사 주체 저장을 위해 `WorkspaceMember`에 연결된 `WORKSPACE_MEMBER` Actor가 필요하다.
- DB schema 연결: `WorkspaceMember`, `Actor`, `ObjectDefinition`, `AttributeDefinition`, `RecordDefinition`, `RecordAttributeValueDefinition`
- 중복 기준: 같은 ObjectDefinition 안에서 `AttributeDefinition.apiSlug`는 중복될 수 없다.
- DB unique 기준: `@@unique([objectDefinitionId, apiSlug])`
- 중복 조회 조건: 보안 경계 확인을 위해 application/repository 조회는 `workspaceId + objectDefinitionId + apiSlug`를 함께 사용한다.
- `attributeDefinitionName`: application use case에서 trim한 뒤 저장 기준 이름으로 사용한다.
- `apiSlug`, `title`: trim된 `attributeDefinitionName` 값을 동일하게 저장한다.
- `type`: request의 `attributeType` 값을 저장한다.
- `isMultiselect`: 초기 생성 API에서는 항상 `false`로 저장한다.
- `sortOrder`: 같은 ObjectDefinition 안의 현재 최대 `sortOrder + 1`로 저장한다. 기존 AttributeDefinition이 없으면 `0`으로 저장한다.
- `icon`: User Web은 값이 있을 때만 request에 포함한다. request에 없거나 `null` 또는 빈 문자열이면 DB에는 `null`을 저장한다. 값이 있으면 trim 없이 그대로 저장한다.
- `description`: User Web은 값이 있을 때만 request에 포함한다. request에 없거나 `null` 또는 빈 문자열이면 DB에는 `null`을 저장한다. 값이 있으면 trim 없이 그대로 저장한다.
- `config`: API request/response 계약의 타입별 설정 객체다. DB에는 `AttributeDefinition.configJson`으로 저장한다.
- `config.currency.defaultCurrencyCode`: `Currency` 타입에서만 허용하며 trim + upper-case 후 서비스 지원 통화 코드로 저장한다. 현재 지원 통화는 `KRW`, `USD`다.
- `config.currency.displayType`: `Currency` 타입에서만 허용하며 현재는 `symbol`만 저장한다.
- `Currency` 타입에서 `config`가 없으면 `currentUser.defaultCurrencyCode ?? "KRW"`와 `displayType: "symbol"`로 기본 설정을 만든다.
- `Currency`가 아닌 타입에서 `config`가 있으면 validation error로 차단한다.
- transaction: 필요. `AttributeDefinition` 생성과 기존 RecordDefinition별 `RecordAttributeValueDefinition` null cell row 생성은 같은 transaction 안에서 처리한다.
- 변경 model: `AttributeDefinition`, `RecordAttributeValueDefinition`
- rollback 범위: `AttributeDefinition` 또는 `RecordAttributeValueDefinition` 생성 실패 시 두 model 변경을 모두 rollback한다.
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음
- idempotency: 없음. 같은 `objectDefinitionId + apiSlug` 중복 요청은 `409 Conflict`로 응답한다.
- idempotency key 출처/scope: 해당 없음
- 중복 요청 응답 기준: `AttributeDefinitionApiSlugAlreadyExists`
- outbox: 필요 없음. 외부 side effect와 후속 비동기 처리가 없다.
- observability: 생성 성공 시 원문 이름/설명/icon 없이 구조화 로그를 남긴다.
- log event key: `crm.attributeDefinition.created`
- redaction: `attributeDefinitionName`, `apiSlug`, `title`, `icon`, `description` 원문 로그 금지, access/refresh token 로그 금지

## 3. Attribute Type 계약

현재 Prisma `AttributeType` enum 전체 값은 아래와 같다.

```ts
type AttributeType =
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

Backend는 `attributeType`이 Prisma `AttributeType` enum에 존재하는지만 검증한다.

타입별 UX 노출, 선택 가능 여부, 후속 설정 화면 유도는 User Web이 담당한다.
Backend는 `Select`, `Status`, `RecordReference`, `ActorReference`를 별도 unsupported error로 차단하지 않는다.

## 4. DTO

### CreateWorkspaceObjectAttributeDefinitionDto

```ts
{
  attributeDefinitionName: string;
  attributeType: AttributeType;
  icon?: string;
  description?: string;
  config?: AttributeDefinitionConfig | null;
}
```

### AttributeDefinitionConfig

```ts
type AttributeDefinitionConfig = {
  currency: {
    defaultCurrencyCode: "KRW" | "USD";
    displayType: "symbol";
  };
};
```

### CreateWorkspaceObjectAttributeDefinitionResponse

```ts
{
  attributeDefinitionId: string;
}
```

## 5. API

### POST /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions

로그인한 사용자가 멤버로 속한 Workspace의 ObjectDefinition에 새 AttributeDefinition을 생성한다.

Request DTO: `CreateWorkspaceObjectAttributeDefinitionDto`

Response DTO: `CreateWorkspaceObjectAttributeDefinitionResponse`

Path param:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| workspaceId | UUID string | 예 | 아니오 | UUID | 생성 대상 Workspace ID |
| objectDefinitionId | UUID string | 예 | 아니오 | UUID | 생성 대상 ObjectDefinition ID |

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie: refresh cookie는 이 API request 계약에 사용하지 않음

Body:

```json
{
  "attributeDefinitionName": "금액",
  "attributeType": "Currency",
  "icon": "circle-dollar-sign",
  "description": "계약 금액을 저장해요.",
  "config": {
    "currency": {
      "defaultCurrencyCode": "KRW",
      "displayType": "symbol"
    }
  }
}
```

선택 필드가 비어 있으면 User Web은 해당 필드를 보내지 않는다.

```json
{
  "attributeDefinitionName": "회사번호",
  "attributeType": "PhoneNumber"
}
```

Validation:

- `attributeDefinitionName`: string, required
- `attributeDefinitionName`: null 허용 안 함
- `attributeDefinitionName`: 빈 문자열 raw 입력은 DTO가 아니라 application validation에서 trim 후 차단
- `attributeDefinitionName`: trim 후 1자 이상
- `attributeDefinitionName`: trim 후 최대 80자
- `attributeType`: string, required
- `attributeType`: null 허용 안 함
- `attributeType`: Prisma `AttributeType` enum에 없는 값은 `ATTRIBUTE_DEFINITION_TYPE_UNKNOWN`
- `icon`: string optional, User Web 전송 계약에서는 null을 보내지 않고 필드를 생략한다.
- `description`: string optional, User Web 전송 계약에서는 null을 보내지 않고 필드를 생략한다.
- `config`: object optional, `null` 가능
- `config`: `Currency` 타입에서만 허용한다.
- `config.currency`: `Currency` 타입에서 required. 단, `config` 자체가 생략되거나 `null`이면 Backend가 기본 currency config를 만든다.
- `config.currency.defaultCurrencyCode`: string optional, trim + upper-case 후 `KRW | USD`만 허용
- `config.currency.displayType`: string optional, 현재 `symbol`만 허용
- `config`에 타입별 계약 외 key가 있으면 `ATTRIBUTE_DEFINITION_CONFIG_INVALID`
- request body에 계약 외 필드가 있으면 Nest validation error

## 6. Business Logic

1. request body의 `attributeDefinitionName`, `attributeType`, `icon`, `description`, `config`를 검증하고 저장 기준 값으로 정규화한다.
2. `Currency` 타입이면 `config.currency`를 canonical config로 정규화한다. `config`가 없으면 현재 사용자 기본 통화와 `symbol` 표시 방식을 사용한다.
3. `Currency`가 아닌 타입이면 `config` 입력을 차단하고 저장값은 `null`로 둔다.
4. `currentUser.id + workspaceId`로 WorkspaceMember를 확인하고 생성 감사용 Actor ID를 조회한다.
5. Workspace membership이 없으면 정보 노출을 막기 위해 not found로 응답한다.
6. WorkspaceMember에 연결된 Actor가 없으면 내부 정합성 오류로 중단한다.
7. `workspaceId + objectDefinitionId`로 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
8. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 응답한다.
9. `workspaceId + objectDefinitionId + apiSlug` 기준으로 같은 ObjectDefinition 안의 apiSlug 중복을 확인한다.
10. 중복이 있으면 conflict로 응답한다.
11. 같은 ObjectDefinition 안의 다음 `sortOrder`를 조회한다.
12. AttributeDefinition을 생성한다.
13. 기존 RecordDefinition마다 새 AttributeDefinition에 대응하는 값이 비어 있는 RecordAttributeValueDefinition row를 생성한다.

생성 매핑:

```ts
{
  workspaceId,
  objectDefinitionId,
  createdByActorId: workspaceAccess.actorId,
  apiSlug: normalizedAttributeDefinitionName,
  title: normalizedAttributeDefinitionName,
  sortOrder: maxSortOrderInObjectDefinition + 1,
  type: normalizedAttributeType,
  icon: normalizedIcon,
  isMultiselect: false,
  description: normalizedDescription,
  configJson: normalizedConfig
}
```

RecordAttributeValueDefinition 생성 매핑:

```ts
{
  workspaceId,
  recordDefinitionId,
  objectDefinitionId,
  attributeDefinitionId,
  createdByActorId: workspaceAccess.actorId,
  attributeType: normalizedAttributeType,
  jsonValue: null,
  textValue: null,
  numberValue: null,
  booleanValue: null,
  dateValue: null,
  timestampValue: null,
  selectOptionId: null,
  statusOptionId: null,
  targetRecordDefinitionId: null,
  targetObjectDefinitionId: null,
  targetActorId: null
}
```

## 7. Response

성공 status:

- `201 Created`

Body: 있음

```json
{
  "attributeDefinitionId": "00000000-0000-4000-8000-000000000601"
}
```

후속 FE 흐름:

- User Web은 생성 성공 후 현재 ObjectDefinition의 AttributeDefinition 목록과 RecordDefinition 목록을 다시 조회한다.
- Object 목록 화면 header row는 새 AttributeDefinition 목록 응답을 기준으로 다시 렌더링한다.
- Object 목록 화면 body row는 새 AttributeDefinition에 대응하는 null cell row를 포함한 RecordDefinition 목록 응답을 기준으로 다시 렌더링한다.
- 생성 API 응답의 `attributeDefinitionId`는 후속 optimistic update 또는 생성 완료 추적에 사용할 수 있다.

## 8. Error Contract

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `objectDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| request body에 계약 외 필드가 있음 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `attributeDefinitionName` 누락 또는 문자열 아님 | Nest validation error | 400 | 생성 UX에서 재입력 유도 | warn |
| `attributeType` 누락 또는 문자열 아님 | Nest validation error | 400 | 생성 UX에서 타입 재선택 유도 | warn |
| `icon` 또는 `description`이 문자열이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `attributeDefinitionName` trim 후 빈 값 | `ATTRIBUTE_DEFINITION_NAME_REQUIRED` | 400 | 생성 UX에서 재입력 유도 | info |
| `attributeDefinitionName` trim 후 80자 초과 | `ATTRIBUTE_DEFINITION_NAME_TOO_LONG` | 400 | 생성 UX에서 재입력 유도 | info |
| `attributeType`이 Prisma enum에 없음 | `ATTRIBUTE_DEFINITION_TYPE_UNKNOWN` | 400 | 타입 목록 재동기화 또는 생성 차단 | info |
| `config`가 AttributeType별 계약과 맞지 않음 | `ATTRIBUTE_DEFINITION_CONFIG_INVALID` | 400 | 설정 UI 재입력 유도 | info |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `AttributeDefinitionWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 Workspace 목록 재조회 | info |
| ObjectDefinition이 없거나 요청 Workspace에 속하지 않음 | `AttributeDefinitionObjectDefinitionNotFound` | 404 | 현재 Object 화면을 비우거나 Object 목록 재조회 | info |
| 같은 ObjectDefinition 안에 동일 apiSlug가 이미 있음 | `AttributeDefinitionApiSlugAlreadyExists` | 409 | 이름 재입력 유도 | info |
| 동시 요청으로 DB unique 제약에 걸림 | `AttributeDefinitionApiSlugAlreadyExists` | 409 | 이름 재입력 유도 | info |
| WorkspaceMember Actor가 없음 | `InternalServerError` | 500 | 일반 실패 메시지 표시, 재시도 가능 | error |

권한 없음과 소유권 없음은 404로 응답해 다른 Workspace/Object 존재 여부를 노출하지 않는다.

### HttpExceptionFilter 반영

`AttributeDefinitionWorkspaceNotFound`, `AttributeDefinitionObjectDefinitionNotFound`는 error code가 `NotFound`로 끝나므로 현재 `HttpExceptionFilter`의 not found 규칙을 재사용한다.

아래 error code는 `HttpExceptionFilter.getDomainErrorStatus()`에 명시적으로 추가해야 한다.

400 Bad Request:

- `ATTRIBUTE_DEFINITION_NAME_REQUIRED`
- `ATTRIBUTE_DEFINITION_NAME_TOO_LONG`
- `ATTRIBUTE_DEFINITION_TYPE_UNKNOWN`
- `ATTRIBUTE_DEFINITION_CONFIG_INVALID`

409 Conflict:

- `AttributeDefinitionApiSlugAlreadyExists`

## 9. Transaction Contract

transaction 필요 여부:

- 필요

이유:

- API의 런타임 변경 model은 `AttributeDefinition` 1개와 기존 RecordDefinition 개수만큼의 `RecordAttributeValueDefinition` row다.
- 새 AttributeDefinition만 생성되고 기존 RecordDefinition의 cell row 생성이 실패하는 중간 상태를 막아야 한다.
- 중복 race condition은 DB unique index `objectDefinitionId + apiSlug`로 방어한다.

변경 model:

- `AttributeDefinition`
- `RecordAttributeValueDefinition`

rollback 범위:

- `AttributeDefinition` 또는 `RecordAttributeValueDefinition` 생성 실패 시 두 model 변경을 모두 rollback한다.

외부 Provider 호출:

- 없음

부수 로그/이력 transaction 포함 여부:

- 없음. 생성 성공 후 구조화 로그만 남긴다.

Idempotency / Outbox:

- idempotency 필요 여부: 없음
- idempotency key 출처와 scope: 해당 없음
- 중복 요청 응답 기준: 기존 성공 재사용이 아니라 `409 Conflict`
- outbox 또는 후속 처리 기록 필요 여부: 없음

## 10. Observability Contract

log event key:

- `crm.attributeDefinition.created`

구조화 로그 필요 여부:

- 생성 성공 시 필요

로그 필드:

- `event`
- `userId`
- `workspaceId`
- `objectDefinitionId`
- `attributeDefinitionId`
- `recordAttributeValueDefinitionCount`

request id:

- 전역 middleware의 request id를 사용한다.

redaction:

- `attributeDefinitionName`, `apiSlug`, `title`, `icon`, `description` 원문은 로그에 남기지 않는다.
- access token, refresh token을 로그에 남기지 않는다.

provider error context:

- 외부 Provider 호출 없음

## 11. DB / Index

`AttributeDefinition`에 아래 unique 제약을 추가한다.

```prisma
model AttributeDefinition {
  objectDefinitionId String @db.Uuid
  apiSlug            String
  sortOrder          Int
  configJson         Json?

  @@index([objectDefinitionId, sortOrder, id])
  @@unique([objectDefinitionId, apiSlug])
}
```

의미:

- 같은 ObjectDefinition 안에서는 같은 `apiSlug`를 만들 수 없다.
- 다른 ObjectDefinition에서는 같은 `apiSlug`를 만들 수 있다.
- `objectDefinitionId`는 전역 고유 PK를 참조하므로 unique 제약에 `workspaceId`를 포함하지 않는다.
- application 조회는 Workspace 경계 확인을 위해 `workspaceId` 조건을 함께 사용한다.
- 같은 ObjectDefinition 안의 AttributeDefinition 조회는 `sortOrder ASC`만 사용한다.

Migration 주의:

- 기존 `AttributeDefinition` 중 같은 `objectDefinitionId + apiSlug` 중복 row가 있으면 unique index 추가 전에 정리가 필요하다.

## 12. 구현 범위

- API 계약 문서 추가
- `AttributeDefinition.objectDefinitionId + apiSlug` unique index migration 추가
- AttributeDefinition 생성 DTO 추가
- AttributeDefinition 생성 use case 추가
- AttributeDefinition 타입별 `config` validation/normalization 추가
- AttributeDefinition 생성 시 `sortOrder`를 현재 ObjectDefinition의 마지막 순서 다음 값으로 저장
- 기존 RecordDefinition에 새 AttributeDefinition의 null cell row materialize
- AttributeDefinition command repository port 추가
- Prisma AttributeDefinition command repository adapter 추가
- 기존 AttributeDefinition controller에 `POST` API 추가
- AttributeDefinition module provider 조립 추가
- domain error 추가
- `HttpExceptionFilter` status mapping 추가
- application use case test 추가
- controller/API contract test 추가

## 13. 제외 범위

- SelectOption/StatusOption 생성 또는 초기 옵션 저장
- RelationshipDefinition 생성
- RecordAttributeValueDefinition 값 수정
- AttributeDefinition 수정/삭제
- AttributeDefinition 표시 순서 변경
- FE Attribute 생성 API client 연결

## 14. 완료 검증

- Backend Prisma schema validation 통과
- Backend Prisma generate 필요 여부 확인
- Backend typecheck 통과
- Backend lint 통과
- 관련 Backend test 통과
- `AttributeDefinition.objectDefinitionId + apiSlug` unique migration 추가 확인
- User Web이 보내는 request body와 Backend DTO/use case 계약 일치 확인
