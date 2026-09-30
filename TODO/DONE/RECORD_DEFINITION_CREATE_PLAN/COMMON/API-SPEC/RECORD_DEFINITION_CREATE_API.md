# RecordDefinition Create API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 기존 목록 조회 API와 같은 route path에 `POST` method를 추가한다.
- 기존 FE 영향: 있음. Object 목록 화면의 하단 `생성하기` 버튼과 toolbar `+` 버튼이 이 API를 호출할 수 있다.
- migration 또는 fallback: 없음. 현재 Prisma schema의 `RecordDefinition` model을 그대로 사용한다.

## 1. 목적

ObjectDefinition 목록 화면에서 사용자가 새 row를 만들 때 현재 Workspace의 특정 ObjectDefinition에 빈 RecordDefinition을 생성한다.

RecordAttributeValueDefinition은 이 API에서 생성하지 않는다. 사용자가 cell 값을 입력하거나 수정하는 후속 API에서 별도로 생성/수정한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- ObjectDefinition 소속 검증: `objectDefinitionId`가 요청 `workspaceId` 안에 있어야 한다.
- ObjectDefinition 없음과 다른 Workspace 소속은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 생성할 수 있다.
- Actor 검증: 생성 감사 주체 저장을 위해 `WorkspaceMember`에 연결된 `WORKSPACE_MEMBER` Actor가 필요하다.
- DB schema 연결: `WorkspaceMember`, `Actor`, `ObjectDefinition`, `RecordDefinition`
- request body: 없음. User Web은 body를 보내지 않는다.
- transaction: 없음. 최종 변경 model은 `RecordDefinition` 1개다.
- 변경 model: `RecordDefinition`
- rollback 범위: `RecordDefinition` 생성 실패 시 생성 row 없음
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음
- idempotency: 없음. 같은 요청을 반복하면 새 RecordDefinition row가 추가로 생성된다.
- idempotency key 출처/scope: 해당 없음
- 중복 요청 응답 기준: 기존 성공 재사용 없음. 반복 호출은 별도 row 생성으로 처리한다.
- outbox: 필요 없음. 외부 side effect와 후속 비동기 처리가 없다.
- observability: 생성 성공 시 사용자 입력 원문 없이 구조화 로그를 남긴다.
- log event key: `crm.recordDefinition.created`
- redaction: access/refresh token 로그 금지, 후속 cell 값 원문 로그 금지

## 3. DTO

### CreateWorkspaceObjectRecordDefinitionResponse

```ts
{
  recordDefinitionId: string;
}
```

Request DTO는 없다.

## 4. API

### POST /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions

로그인한 사용자가 멤버로 속한 Workspace의 ObjectDefinition에 빈 RecordDefinition을 생성한다.

Request DTO: 없음

Response DTO: `CreateWorkspaceObjectRecordDefinitionResponse`

Path param:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| workspaceId | UUID string | 예 | 아니오 | UUID | 생성 대상 Workspace ID |
| objectDefinitionId | UUID string | 예 | 아니오 | UUID | 생성 대상 ObjectDefinition ID |

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie:

- refresh cookie는 이 API request 계약에 사용하지 않음

Body:

- 없음

Validation:

- `workspaceId`: UUID string
- `objectDefinitionId`: UUID string
- body field validation 없음. 이 API는 request body 값을 사용하지 않는다.

## 5. Business Logic

1. `currentUser.id + workspaceId`로 WorkspaceMember를 확인하고 생성 감사용 Actor ID를 조회한다.
2. Workspace membership이 없으면 정보 노출을 막기 위해 not found로 응답한다.
3. WorkspaceMember에 연결된 Actor가 없으면 내부 정합성 오류로 중단한다.
4. `workspaceId + objectDefinitionId`로 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
5. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 응답한다.
6. RecordDefinition을 생성한다.
7. 생성 성공 event를 사용자 입력 원문 없이 구조화 로그로 남긴다.
8. 생성된 RecordDefinition ID를 반환한다.

생성 매핑:

```ts
{
  workspaceId,
  objectDefinitionId,
  createdByActorId: workspaceAccess.actorId
}
```

`updatedByActorId`는 생성 시점에 저장하지 않는다.

## 6. Response

성공 status:

- `201 Created`

Body: 있음

```json
{
  "recordDefinitionId": "00000000-0000-4000-8000-000000000701"
}
```

후속 FE 흐름:

- User Web은 생성 성공 후 현재 ObjectDefinition의 RecordDefinition 목록을 다시 조회한다.
- 새 row는 RecordAttributeValueDefinition이 없으므로 모든 cell이 빈 값으로 렌더링된다.
- 생성 API 응답의 `recordDefinitionId`는 optimistic row, focus 이동, 후속 cell 저장 API 호출에 사용할 수 있다.

## 7. Error Contract

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `objectDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `RecordDefinitionWorkspaceNotFound` | 404 | 현재 Object 화면을 비우거나 Workspace 목록 재조회 | info |
| ObjectDefinition이 없거나 요청 Workspace에 속하지 않음 | `RecordDefinitionObjectDefinitionNotFound` | 404 | 현재 Object 화면을 비우거나 Object 목록 재조회 | info |
| WorkspaceMember Actor가 없음 | `InternalServerError` | 500 | 일반 실패 메시지 표시, 재시도 가능 | error |
| RecordDefinition 생성 중 예상하지 못한 DB 오류 | `InternalServerError` | 500 | 일반 실패 메시지 표시, 재시도 가능 | error |

권한 없음과 소유권 없음은 404로 응답해 다른 Workspace/Object 존재 여부를 노출하지 않는다.

### HttpExceptionFilter 반영

`RecordDefinitionWorkspaceNotFound`, `RecordDefinitionObjectDefinitionNotFound`는 error code가 `NotFound`로 끝나므로 현재 `HttpExceptionFilter`의 not found 규칙을 재사용한다.

새 400/409 domain error code 추가는 필요 없다.

## 8. Transaction Contract

transaction 필요 여부:

- 없음

이유:

- API의 런타임 변경 model은 `RecordDefinition` 1개다.
- Workspace membership과 ObjectDefinition 소속 확인은 선행 조회다.
- RecordAttributeValueDefinition 생성은 후속 cell 값 저장 API에서 처리한다.

변경 model:

- `RecordDefinition`

rollback 범위:

- `RecordDefinition` 생성 실패 시 생성 row 없음

외부 Provider 호출:

- 없음

부수 로그/이력 transaction 포함 여부:

- 없음. 생성 성공 후 구조화 로그만 남긴다.

Idempotency / Outbox:

- idempotency 필요 여부: 없음
- idempotency key 출처와 scope: 해당 없음
- 중복 요청 응답 기준: 반복 요청은 별도 RecordDefinition 생성
- outbox 또는 후속 처리 기록 필요 여부: 없음

## 9. Observability Contract

log event key:

- `crm.recordDefinition.created`

구조화 로그 필요 여부:

- 생성 성공 시 필요

로그 필드:

- `event`
- `userId`
- `workspaceId`
- `objectDefinitionId`
- `recordDefinitionId`

request id:

- 전역 middleware의 request id를 사용한다.

redaction:

- access token, refresh token을 로그에 남기지 않는다.
- 후속 cell 값 원문은 이 API에서 다루지 않으며, 로그에도 남기지 않는다.

provider error context:

- 외부 Provider 호출 없음

## 10. DB / Index

Prisma model:

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
```

DB schema 변경:

- 없음

기존 목록 조회 성능 index:

```prisma
@@index([workspaceId, objectDefinitionId, createdAt, id])
```

## 11. 구현 범위

- API 계약 문서 추가
- Backend TODO 문서 추가
- RecordDefinition command repository port 추가
- Prisma RecordDefinition command repository adapter 추가
- RecordDefinition 생성 use case 추가
- 기존 RecordDefinition controller에 `POST` API 추가
- RecordDefinition module provider 조립 추가
- RecordDefinition error 주석을 목록 조회 전용에서 요청/접근 범위로 정리
- application use case test 추가
- controller/API contract test 추가

## 12. 제외 범위

- RecordAttributeValueDefinition 생성/수정 API
- cell 값 타입별 validation/mapping
- frontend API client 연결
- row 생성 후 자동 cell focus UX
- RecordDefinition 수정/삭제
- pagination 정책 변경
- DB migration

## 13. 완료 검증

- Backend typecheck 통과
- Backend lint 통과
- 관련 Backend test 통과
- User Web이 호출할 path, method, response 계약 확인
- 기존 RecordDefinition 목록 조회 API가 계속 통과하는지 확인
