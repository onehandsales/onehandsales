# RecordAttributeValueDefinition Update API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 기존 RecordDefinition 목록/생성 API route에 `PATCH` method를 추가한다.
- 기존 FE 영향: 있음. Object 목록 화면의 cell 편집 저장 동작이 이 API를 호출한다.
- migration 또는 fallback: 없음. 현재 Prisma schema의 `RecordDefinition`, `RecordAttributeValueDefinition` model을 그대로 사용한다.

## 1. 목적

ObjectDefinition 목록 화면에서 사용자가 cell 1개를 수정할 때 해당 `RecordAttributeValueDefinition` row의 값을 저장한다.

이 API는 `RecordDefinition` 생성 API가 만든 null cell value row를 수정하는 후속 API다. request body는 항상 `value` key 하나만 사용하며, Backend는 body의 type 정보를 신뢰하지 않고 DB row의 `attributeType` snapshot을 기준으로 저장 컬럼을 결정한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- ObjectDefinition 소속 검증: `objectDefinitionId`가 요청 `workspaceId` 안에 있어야 한다.
- RecordDefinition 소속 검증: `recordDefinitionId`가 요청 `workspaceId + objectDefinitionId` 안에 있어야 한다.
- RecordAttributeValueDefinition 소속 검증: `recordAttributeValueDefinitionId`가 요청 `workspaceId + objectDefinitionId + recordDefinitionId` 안에 있어야 한다.
- AttributeDefinition 정합성: cell row의 `attributeDefinitionId`가 같은 `workspaceId + objectDefinitionId` 안에 속하는지 확인한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 수정할 수 있다.
- Actor 검증: 수정 감사 주체 저장을 위해 `WorkspaceMember`에 연결된 `WORKSPACE_MEMBER` Actor가 필요하다.
- DB schema 연결: `WorkspaceMember`, `Actor`, `ObjectDefinition`, `AttributeDefinition`, `RecordDefinition`, `RecordAttributeValueDefinition`
- request body: `{ "value": ... }`
- response body: `{ "recordAttributeValueDefinitionId": string }`
- transaction: 필요. `RecordAttributeValueDefinition`과 부모 `RecordDefinition` update는 같은 transaction 안에서 처리한다.
- 변경 model: `RecordAttributeValueDefinition`, `RecordDefinition`
- rollback 범위: cell value update 또는 부모 RecordDefinition audit update 실패 시 두 model 변경을 모두 rollback한다.
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음
- idempotency: 별도 key 없음. 같은 value로 반복 PATCH하면 같은 최종 상태로 수렴한다.
- idempotency key 출처/scope: 해당 없음
- 중복 요청 응답 기준: 기존 성공 재사용 없음. 매 요청마다 update를 실행할 수 있다.
- outbox: 필요 없음. 외부 side effect와 후속 비동기 처리가 없다.
- observability: 수정 성공 시 사용자 입력 원문 없이 구조화 로그를 남긴다.
- log event key: `crm.recordAttributeValueDefinition.updated`
- redaction: access/refresh token 로그 금지, cell value 원문 로그 금지

## 3. DTO

### UpdateWorkspaceObjectRecordAttributeValueDefinitionDto

```ts
{
  value: unknown | null;
}
```

규칙:

- `value` key는 반드시 존재해야 한다.
- `value: null`은 cell 비우기를 의미한다.
- `recordAttributeValueDefinitionId`, `attributeType`, `attributeDefinitionId`는 body로 받지 않는다.
- body의 추가 field는 request 계약에 포함하지 않는다.

### UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse

```ts
{
  recordAttributeValueDefinitionId: string;
}
```

## 4. API

### PATCH /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions/:recordDefinitionId/record-attribute-values-definitions/:recordAttributeValueDefinitionId

로그인한 사용자가 멤버로 속한 Workspace의 ObjectDefinition 목록 cell 1개를 수정한다.

Request DTO: `UpdateWorkspaceObjectRecordAttributeValueDefinitionDto`

Response DTO: `UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse`

Path param:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| workspaceId | UUID string | 예 | 아니오 | UUID | 수정 대상 Workspace ID |
| objectDefinitionId | UUID string | 예 | 아니오 | UUID | 수정 대상 ObjectDefinition ID |
| recordDefinitionId | UUID string | 예 | 아니오 | UUID | 수정 대상 RecordDefinition ID |
| recordAttributeValueDefinitionId | UUID string | 예 | 아니오 | UUID | 수정 대상 RecordAttributeValueDefinition ID |

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie:

- refresh cookie는 이 API request 계약에 사용하지 않음

Body:

```json
{
  "value": "수정할 값 또는 null 또는 object"
}
```

## 5. Request Value Contract

공통 비우기:

```json
{
  "value": null
}
```

타입별 요청과 저장 매핑:

| attributeType | request body 예시 | 저장 매핑 |
| --- | --- | --- |
| `Text` | `{ "value": "메모" }` | `textValue` |
| `EmailAddress` | `{ "value": "user@example.com" }` | `textValue` |
| `Domain` | `{ "value": "example.com" }` | `textValue` |
| `PhoneNumber` | `{ "value": "+82-10-1234-5678" }` | `textValue` |
| `Number` | `{ "value": "123.45" }` | `numberValue` |
| `Rating` | `{ "value": "4" }` | `numberValue` |
| `Checkbox` | `{ "value": true }` | `booleanValue` |
| `Date` | `{ "value": "2026-09-30" }` | `dateValue` |
| `Timestamp` | `{ "value": "2026-09-30T10:30:00.000Z" }` | `timestampValue` |
| `Select` | `{ "value": { "selectOptionId": "uuid" } }` | `jsonValue`에 object 그대로 저장 |
| `Status` | `{ "value": { "statusOptionId": "uuid" } }` | `jsonValue`에 object 그대로 저장 |
| `RecordReference` | `{ "value": { "targetRecordDefinitionId": "uuid" } }` | `jsonValue`에 object 그대로 저장 |
| `ActorReference` | `{ "value": { "targetActorId": "uuid" } }` | `jsonValue`에 object 그대로 저장 |
| `Currency` | `{ "value": { "amount": "1200000", "currencyCode": "KRW" } }` | `numberValue`, `jsonValue` |
| `Location` | `{ "value": { "text": "서울 강남구", "raw": { "...": "..." } } }` | `textValue`, `jsonValue` |
| `PersonalName` | `{ "value": { "displayName": "홍길동", "givenName": "길동", "familyName": "홍" } }` | `textValue`, `jsonValue` |
| `Interaction` | `{ "value": { "type": "email", "summary": "첫 미팅", "occurredAt": "2026-09-30T10:30:00.000Z" } }` | `textValue`, `timestampValue`, `jsonValue` |

저장 공통 규칙:

- 저장 시 대상 타입에 필요한 컬럼 외 value 컬럼은 모두 `null`로 정리한다.
- `jsonValue`에 저장하는 object는 request의 `value` object를 그대로 사용한다.
- `Number`, `Rating`, `Currency.amount`는 Decimal 변환 가능한 문자열이어야 한다.
- `Date`는 `YYYY-MM-DD` 문자열이어야 한다.
- `Timestamp`, `Interaction.occurredAt`은 `Z` 또는 timezone offset이 포함된 유효한 ISO datetime 문자열이어야 한다.
- `Location.text`, `PersonalName.displayName`, `Interaction.summary`는 표시용 `textValue`로 함께 저장한다.
- 참조형 의미 해석은 이번 범위에서 하지 않는다.

참조형 1차 범위:

- `Select`, `Status`, `RecordReference`, `ActorReference`는 프론트 표시용 object 값 저장만 한다.
- `selectOptionId`, `statusOptionId`, `targetRecordDefinitionId`, `targetObjectDefinitionId`, `targetActorId` FK 컬럼은 이번 API에서 저장하지 않고 `null`로 둔다.
- SelectOption / StatusOption / target RecordDefinition / target Actor 존재 여부는 검증하지 않는다.
- RecordReference의 `targetObjectDefinitionId`를 Backend가 자동 조회하거나 보강하지 않는다.
- 관계 생성, 양방향 연결, 참조 무결성 보장은 후속 API에서 별도 계약으로 다룬다.

## 6. Business Logic

1. `value` key가 request body에 존재하는지 확인한다.
2. `currentUser.id + workspaceId`로 WorkspaceMember를 확인하고 수정 감사용 Actor ID를 조회한다.
3. Workspace membership이 없으면 정보 노출을 막기 위해 not found로 응답한다.
4. WorkspaceMember에 연결된 Actor가 없으면 내부 정합성 오류로 중단한다.
5. `workspaceId + objectDefinitionId`로 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
6. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 응답한다.
7. `workspaceId + objectDefinitionId + recordDefinitionId`로 RecordDefinition이 ObjectDefinition 경계 안에 있는지 확인한다.
8. RecordDefinition이 없거나 다른 ObjectDefinition/Workspace에 속하면 not found로 응답한다.
9. `workspaceId + objectDefinitionId + recordDefinitionId + recordAttributeValueDefinitionId`로 cell row를 조회한다.
10. cell row가 없거나 다른 RecordDefinition/ObjectDefinition/Workspace에 속하면 not found로 응답한다.
11. cell row의 `attributeDefinitionId`가 같은 Workspace/ObjectDefinition에 속하는지 확인한다.
12. DB cell row의 `attributeType` 기준으로 request `value`를 검증하고 저장 컬럼으로 매핑한다.
13. transaction 안에서 `RecordAttributeValueDefinition`을 update한다.
14. 같은 transaction 안에서 부모 `RecordDefinition.updatedByActorId`를 update해 `updatedAt`을 함께 갱신한다.
15. 수정 성공 event를 사용자 입력 원문 없이 구조화 로그로 남긴다.
16. 수정된 `recordAttributeValueDefinitionId`를 반환한다.

## 7. Response

성공 status:

- `200 OK`

Body: 있음

```json
{
  "recordAttributeValueDefinitionId": "00000000-0000-4000-8000-000000000801"
}
```

후속 FE 흐름:

- User Web은 성공 응답을 받으면 해당 cell의 optimistic state를 유지하거나 현재 ObjectDefinition의 RecordDefinition 목록을 재조회할 수 있다.
- 응답 body는 수정 대상 ID 확인만 제공한다.
- 수정된 값 전체가 필요하면 기존 RecordDefinition 목록 조회 API를 다시 호출한다.

## 8. Error Contract

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| path param UUID 형식 오류 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| body에 `value` key가 없음 | `RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_REQUIRED` | 400 | cell 저장 실패 표시 | info |
| `value` 형식이 cell attributeType과 맞지 않음 | `RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID` | 400 | cell 저장 실패 표시 | info |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `RecordDefinitionWorkspaceNotFound` | 404 | 현재 Object 화면을 비우거나 Workspace 목록 재조회 | info |
| ObjectDefinition이 없거나 요청 Workspace에 속하지 않음 | `RecordDefinitionObjectDefinitionNotFound` | 404 | 현재 Object 화면을 비우거나 Object 목록 재조회 | info |
| RecordDefinition이 없거나 요청 ObjectDefinition에 속하지 않음 | `RecordDefinitionRecordNotFound` | 404 | 현재 Object row를 목록에서 제거하거나 목록 재조회 | info |
| RecordAttributeValueDefinition이 없거나 요청 RecordDefinition에 속하지 않음 | `RecordAttributeValueDefinitionNotFound` | 404 | 현재 cell을 비우거나 목록 재조회 | info |
| WorkspaceMember Actor가 없음 | `InternalServerError` | 500 | 일반 실패 메시지 표시, 재시도 가능 | error |
| update 중 예상하지 못한 DB 오류 | `InternalServerError` | 500 | 일반 실패 메시지 표시, 재시도 가능 | error |

권한 없음과 소유권 없음은 404로 응답해 다른 Workspace/Object/Record/Cell 존재 여부를 노출하지 않는다.

### HttpExceptionFilter 반영

- `RecordDefinitionWorkspaceNotFound`, `RecordDefinitionObjectDefinitionNotFound`, `RecordDefinitionRecordNotFound`, `RecordAttributeValueDefinitionNotFound`는 error code가 `NotFound`로 끝나므로 현재 `HttpExceptionFilter`의 not found 규칙을 재사용한다.
- `RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_REQUIRED`, `RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID`는 400으로 매핑해야 한다.

## 9. Transaction Contract

transaction 필요 여부:

- 필요

이유:

- API의 변경 model은 `RecordAttributeValueDefinition`과 부모 `RecordDefinition`이다.
- cell 값이 바뀌면 사용자 관점에서 Record row도 수정된 것이므로 부모 `RecordDefinition.updatedAt`과 `updatedByActorId`도 갱신해야 한다.
- cell update만 성공하고 부모 RecordDefinition audit update가 실패하는 중간 상태를 막아야 한다.

변경 model:

- `RecordAttributeValueDefinition`
- `RecordDefinition`

rollback 범위:

- `RecordAttributeValueDefinition` update 또는 `RecordDefinition` update 실패 시 두 model 변경을 모두 rollback한다.

외부 Provider 호출:

- 없음

부수 로그/이력 transaction 포함 여부:

- 없음. 수정 성공 후 구조화 로그만 남긴다.

Idempotency / Outbox:

- idempotency 필요 여부: 별도 key 없음
- idempotency key 출처와 scope: 해당 없음
- 중복 요청 응답 기준: 같은 value 반복 PATCH는 같은 최종 상태로 수렴한다.
- outbox 또는 후속 처리 기록 필요 여부: 없음

## 10. Observability Contract

log event key:

- `crm.recordAttributeValueDefinition.updated`

구조화 로그 필요 여부:

- 수정 성공 시 필요

로그 필드:

- `event`
- `userId`
- `workspaceId`
- `objectDefinitionId`
- `recordDefinitionId`
- `recordAttributeValueDefinitionId`
- `attributeDefinitionId`
- `attributeType`

request id:

- 전역 middleware의 request id를 사용한다.

redaction:

- access token, refresh token을 로그에 남기지 않는다.
- request `value`, `textValue`, `numberValue`, `booleanValue`, `dateValue`, `timestampValue`, `jsonValue` 원문은 로그에 남기지 않는다.

provider error context:

- 외부 Provider 호출 없음

## 11. DB / Index

주요 Prisma model:

```prisma
model RecordDefinition {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId        String   @db.Uuid
  objectDefinitionId String   @db.Uuid
  createdByActorId   String   @db.Uuid
  updatedByActorId   String?  @db.Uuid
  createdAt          DateTime @default(now()) @db.Timestamptz(3)
  updatedAt          DateTime @updatedAt @db.Timestamptz(3)
}

model RecordAttributeValueDefinition {
  id                       String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId              String        @db.Uuid
  recordDefinitionId       String        @db.Uuid
  objectDefinitionId       String        @db.Uuid
  attributeDefinitionId    String        @db.Uuid
  createdByActorId         String        @db.Uuid
  updatedByActorId         String?       @db.Uuid
  attributeType            AttributeType
  jsonValue                Json?
  textValue                String?
  numberValue              Decimal?      @db.Decimal(30, 10)
  booleanValue             Boolean?
  dateValue                DateTime?     @db.Date
  timestampValue           DateTime?     @db.Timestamptz(3)
  selectOptionId           String?       @db.Uuid
  statusOptionId           String?       @db.Uuid
  targetRecordDefinitionId String?       @db.Uuid
  targetObjectDefinitionId String?       @db.Uuid
  targetActorId            String?       @db.Uuid
  createdAt                DateTime      @default(now()) @db.Timestamptz(3)
  updatedAt                DateTime      @updatedAt @db.Timestamptz(3)
}
```

DB schema 변경:

- 없음

추가 index:

- 없음. 이 작업에서는 schema 변경을 포함하지 않는다.

## 12. 구현 범위

- API 계약 문서 추가
- RecordDefinition domain error 추가
- RecordDefinition command repository port에 cell update 계약 추가 또는 별도 port 추가
- Prisma RecordDefinition command repository adapter에 cell update 구현 추가
- RecordAttributeValueDefinition value mapping helper 추가
- RecordAttributeValueDefinition update use case 추가
- 기존 RecordDefinition controller에 `PATCH` API 추가
- RecordDefinition module provider 조립 갱신
- HttpExceptionFilter 400 validation error code 매핑 추가
- application use case test 추가
- Prisma command repository integration test 추가
- controller/API contract test 추가

## 13. 제외 범위

- SelectOption / StatusOption 존재 여부 검증
- RecordReference target RecordDefinition 존재 여부 검증
- ActorReference target Actor 존재 여부 검증
- `targetObjectDefinitionId` 자동 조회/저장
- 관계 생성, 양방향 연결, 참조 무결성 보장
- Frontend API client 연결
- cell 편집 UX 구현

## 14. 검증 기준

우선 실행:

- `pnpm -C BE test -- src/modules/record-definition --runInBand`
- `pnpm -C BE typecheck`
- `pnpm -C BE lint`

가능하면 실행:

- `pnpm -C BE test -- --runInBand`
- `pnpm -C BE build`

Prisma schema 변경이 없으므로 `prisma:validate`는 필수 범위가 아니다.
