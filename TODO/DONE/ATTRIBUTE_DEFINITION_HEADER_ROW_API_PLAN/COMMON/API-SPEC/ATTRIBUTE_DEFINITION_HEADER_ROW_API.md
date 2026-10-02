# AttributeDefinition Header Row API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 없음. 신규 API다.
- 기존 FE 영향: 없음. 후속 User Web API client 연결 작업에서 Object list header row가 이 API를 호출한다.
- migration 또는 fallback: `AttributeDefinition.sortOrder` 컬럼을 사용한다. 기존 row는 ObjectDefinition별 생성 순서 기준으로 backfill되어 있다.

## 1. 목적

`/app/workspaces/:workspaceId/object-definitions/:objectDefinitionId` Object list 화면의 header row에서 특정 ObjectDefinition에 속한 AttributeDefinition 컬럼 목록을 표시한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: `CurrentUser.id`와 `workspaceId` 조합이 `WorkspaceMember`에 존재해야 한다.
- Workspace 존재 여부와 멤버십 없음은 클라이언트에 구분해서 노출하지 않고 not found로 처리한다.
- ObjectDefinition 소속: `objectDefinitionId`와 `workspaceId` 조합이 `ObjectDefinition`에 존재해야 한다.
- role 제한: 없음. 현재 범위에서는 `OWNER`, `ADMIN`, `MEMBER` 모두 조회할 수 있다.
- Actor 검증: 없음. Actor는 생성/수정 감사 주체이며 조회 권한 판단에 사용하지 않는다.
- DB schema 연결: `WorkspaceMember`, `ObjectDefinition`, `AttributeDefinition.sortOrder`
- transaction: 없음. read-only API다.
- 변경 model: 없음
- rollback 범위: 해당 없음
- 외부 Provider 호출: 없음
- idempotency: 조회 API라 해당 없음
- outbox: 해당 없음
- observability: 기존 request id 기준 추적, 민감정보 로그 없음
- log event key: 없음

## 3. DTO

### WorkspaceObjectAttributeDefinitionListItemResponse

```ts
{
  id: string;
  icon: string | null;
  title: string;
  sortOrder: number;
  type: AttributeDefinitionValueType;
  isMultiselect: boolean;
  config: AttributeDefinitionConfig | null;
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

### GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions

로그인한 사용자가 멤버로 속한 Workspace의 특정 ObjectDefinition에 연결된 AttributeDefinition 목록을 반환한다.

Request DTO: 없음

Response DTO: `WorkspaceObjectAttributeDefinitionListItemResponse[]`

Path param:

- `workspaceId`: UUID string, required
- `objectDefinitionId`: UUID string, required

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie: refresh cookie는 이 API request 계약에 사용하지 않음

Body: 없음

Success:

- Status: `200 OK`
- Body: 있음
- Pagination: 없음
- Filtering: 없음
- Sorting: `AttributeDefinition.sortOrder ASC`

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000601",
    "icon": "type",
    "title": "company",
    "sortOrder": 0,
    "type": "Text",
    "isMultiselect": false,
    "config": null
  },
  {
    "id": "00000000-0000-4000-8000-000000000602",
    "icon": "kanban",
    "title": "상태",
    "sortOrder": 1,
    "type": "Status",
    "isMultiselect": false,
    "config": null
  },
  {
    "id": "00000000-0000-4000-8000-000000000603",
    "icon": "circle-dollar-sign",
    "title": "금액",
    "sortOrder": 2,
    "type": "Currency",
    "isMultiselect": false,
    "config": {
      "currency": {
        "defaultCurrencyCode": "KRW",
        "displayType": "symbol"
      }
    }
  }
]
```

빈 목록:

```json
[]
```

Error:

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 흐름으로 이동 | warn |
| `workspaceId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| `objectDefinitionId`가 UUID 형식이 아님 | Nest validation error | 400 | 요청 버그로 처리 | warn |
| Workspace가 없거나 현재 사용자가 해당 Workspace 멤버가 아님 | `AttributeDefinitionWorkspaceNotFound` | 404 | 선택 Workspace 초기화 또는 Workspace 목록 재조회 | info |
| ObjectDefinition이 없거나 해당 Workspace에 속하지 않음 | `AttributeDefinitionObjectDefinitionNotFound` | 404 | 선택 ObjectDefinition 초기화 또는 Object 목록 재조회 | info |

## 5. 구현 범위

- Backend API 계약 문서 추가
- ObjectDefinition 소속 확인용 공개 query port 추가
- `attribute-definition` Backend module 구현
- AttributeDefinition header row 목록 조회 use case, repository, controller 추가
- AttributeDefinition 목록 응답에 `sortOrder` 포함
- AttributeDefinition 목록 정렬을 `sortOrder ASC` 기준으로 유지
- application/controller 테스트 추가

## 6. 제외 범위

- Frontend API client 연결
- AttributeDefinition 생성/수정/삭제 API
- AttributeDefinition 순서 변경 API
- SelectOptionDefinition 또는 StatusOptionDefinition 상세 옵션 조회
- ObjectDefinition별 Record 목록 조회
- AttributeDefinition 순서 변경 API용 drag/drop mutation

## 7. 완료 검증

- Backend typecheck, lint 통과
- Backend application/controller 테스트 통과
- Backend 전체 테스트 통과
- Backend Prisma schema validation 통과
- Backend build 통과

## 8. 구현 상태

- Backend controller: `BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.ts`
- Application use case: `BE/src/modules/attribute-definition/application/use-cases/list-workspace-object-attribute-definitions.use-case.ts`
- Query port: `BE/src/modules/attribute-definition/application/ports/attribute-definition-list-query.port.ts`
- Prisma adapter: `BE/src/modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-list-query.repository.ts`
- ObjectDefinition access port: `BE/src/modules/object-definition/application/ports/object-definition-access-query.port.ts`
- ObjectDefinition access Prisma adapter: `BE/src/modules/object-definition/infrastructure/persistence/prisma-object-definition-access-query.repository.ts`
- 검증:
  - `pnpm -C BE typecheck`
  - `pnpm -C BE lint`
  - `pnpm -C BE test -- --runInBand BE/src/modules/attribute-definition/application/use-cases/list-workspace-object-attribute-definitions.use-case.spec.ts BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.spec.ts`
  - `pnpm -C BE test -- --runInBand`
  - `pnpm -C BE prisma:validate`
  - `pnpm -C BE build`
