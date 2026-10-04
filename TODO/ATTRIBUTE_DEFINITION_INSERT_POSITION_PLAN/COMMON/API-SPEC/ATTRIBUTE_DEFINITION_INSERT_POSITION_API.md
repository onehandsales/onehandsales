# AttributeDefinition Insert Position API

## 1. 문서 상태

- 상태: Draft
- 대상 API: `POST /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions`
- 목적: 기존 속성 추가 API를 유지하면서, 특정 속성의 왼쪽 또는 오른쪽에 새 속성을 삽입할 수 있도록 요청 계약과 비즈니스 로직을 확장한다.
- 주요 Consumer: `FE/user-web`

## 2. 배경

현재 속성 추가 API는 새 `AttributeDefinition`을 항상 마지막 순서에 생성한다.

프론트에서는 속성 헤더 메뉴에서 다음 동작이 필요하다.

- 왼쪽에 삽입
- 오른쪽에 삽입

두 동작 모두 기존 `+ 속성 추가`와 동일한 모달을 사용하되, 생성 위치만 달라진다.

## 3. 호환성 원칙

- 기존 API 경로는 변경하지 않는다.
- 기존 필드는 제거하거나 의미를 변경하지 않는다.
- `insertPosition`을 보내지 않으면 현재와 동일하게 마지막에 추가한다.
- 응답 스키마는 변경하지 않는다.
- DB 스키마 변경은 하지 않는다.
- 기존 생성 흐름의 `AttributeDefinition` 생성과 `RecordAttributeValueDefinition` materialize 동작은 유지한다.

## 4. Request

### 4.1 Path Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `workspaceId` | string | Y | Workspace ID |
| `objectDefinitionId` | string | Y | ObjectDefinition ID |

### 4.2 Body

```ts
type CreateWorkspaceObjectAttributeDefinitionRequest = {
  attributeDefinitionName: string;
  attributeType: string;
  icon?: string | null;
  description?: string | null;
  config?: unknown | null;
  insertPosition?: {
    referenceAttributeDefinitionId: string;
    side: "before" | "after";
  };
};
```

### 4.3 `insertPosition`

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `referenceAttributeDefinitionId` | string | Y | 기준이 되는 AttributeDefinition ID |
| `side` | `"before" \| "after"` | Y | 기준 속성의 왼쪽 또는 오른쪽 삽입 방향 |

`insertPosition`은 optional이다.

- 없으면 마지막에 추가한다.
- 있으면 `referenceAttributeDefinitionId`를 기준으로 `side` 방향에 새 속성을 삽입한다.
- `referenceAttributeDefinitionId`는 반드시 현재 `workspaceId`와 `objectDefinitionId`에 속해야 한다.

## 5. Request Examples

### 5.1 기존 동작: 마지막에 추가

```json
{
  "attributeDefinitionName": "전화번호",
  "attributeType": "TEXT",
  "icon": null,
  "description": null,
  "config": null
}
```

### 5.2 기준 속성 왼쪽에 삽입

```json
{
  "attributeDefinitionName": "예산",
  "attributeType": "NUMBER",
  "insertPosition": {
    "referenceAttributeDefinitionId": "attr_2",
    "side": "before"
  }
}
```

### 5.3 기준 속성 오른쪽에 삽입

```json
{
  "attributeDefinitionName": "상담 메모",
  "attributeType": "TEXT",
  "insertPosition": {
    "referenceAttributeDefinitionId": "attr_2",
    "side": "after"
  }
}
```

## 6. Sort Order 동작

예시 초기 상태:

| AttributeDefinition | sortOrder |
| --- | ---: |
| A | 0 |
| B | 1 |
| C | 2 |
| D | 3 |

### 6.1 C 왼쪽에 X 삽입

요청:

```json
{
  "insertPosition": {
    "referenceAttributeDefinitionId": "C",
    "side": "before"
  }
}
```

동작:

- 기준 속성 C의 현재 `sortOrder`는 `2`이다.
- 새 속성 X의 `targetSortOrder`는 `2`이다.
- `sortOrder >= 2`인 기존 속성 C, D를 각각 `+1` 한다.
- X를 `sortOrder = 2`로 생성한다.

결과:

| AttributeDefinition | sortOrder |
| --- | ---: |
| A | 0 |
| B | 1 |
| X | 2 |
| C | 3 |
| D | 4 |

### 6.2 C 오른쪽에 X 삽입

요청:

```json
{
  "insertPosition": {
    "referenceAttributeDefinitionId": "C",
    "side": "after"
  }
}
```

동작:

- 기준 속성 C의 현재 `sortOrder`는 `2`이다.
- 새 속성 X의 `targetSortOrder`는 `3`이다.
- `sortOrder >= 3`인 기존 속성 D를 `+1` 한다.
- X를 `sortOrder = 3`으로 생성한다.

결과:

| AttributeDefinition | sortOrder |
| --- | ---: |
| A | 0 |
| B | 1 |
| C | 2 |
| X | 3 |
| D | 4 |

## 7. Actor / Audit 정책

이 작업은 사용자가 버튼을 눌러 발생시키는 사용자 요청이다.

따라서 기존 속성들의 순서가 자동으로 밀리더라도 `SYSTEM` actor가 아니라 현재 요청 사용자의 `WORKSPACE_MEMBER` actor를 사용한다.

- 새 `AttributeDefinition.createdByActorId`: 현재 `workspaceAccess.actorId`
- 새 `AttributeDefinition.updatedByActorId`: 기존 생성 정책 유지, 기본적으로 `null`
- 밀리는 기존 `AttributeDefinition.updatedByActorId`: 현재 `workspaceAccess.actorId`
- 밀리는 기존 `AttributeDefinition.updatedAt`: 순서 변경 시 갱신

## 8. Application Business Logic

### 8.1 공통 흐름

1. 요청 Body를 DTO에서 검증한다.
2. `attributeDefinitionName`, `attributeType`, `icon`, `description`, `config`를 기존 생성 정책과 동일하게 정규화한다.
3. `insertPosition`이 있으면 `referenceAttributeDefinitionId`와 `side`를 검증한다.
4. 현재 사용자의 Workspace 접근 권한을 확인한다.
5. 현재 요청을 수행할 `workspaceAccess.actorId`가 있는지 확인한다.
6. `objectDefinitionId`가 해당 `workspaceId`에 속하는지 확인한다.
7. `apiSlug` 중복 여부를 확인한다.
8. 트랜잭션 안에서 생성 위치를 계산하고 순서를 변경한 뒤 새 속성을 생성한다.
9. 새 속성에 대한 `RecordAttributeValueDefinition`을 materialize 한다.
10. 생성 이벤트 로그를 남긴다.

### 8.2 `insertPosition`이 없는 경우

현재 구현과 동일하다.

1. 현재 ObjectDefinition의 마지막 `sortOrder`를 조회한다.
2. 새 속성의 `sortOrder`를 `max(sortOrder) + 1`로 설정한다.
3. 새 `AttributeDefinition`을 생성한다.
4. 기존 Record들에 대한 `RecordAttributeValueDefinition`을 생성한다.

### 8.3 `insertPosition`이 있는 경우

1. 기준 `AttributeDefinition`을 현재 `workspaceId`, `objectDefinitionId`, `referenceAttributeDefinitionId`로 조회한다.
2. 기준 속성이 없으면 `AttributeDefinitionNotFound`로 처리한다.
3. `side`가 `before`이면 `targetSortOrder = reference.sortOrder`이다.
4. `side`가 `after`이면 `targetSortOrder = reference.sortOrder + 1`이다.
5. 현재 ObjectDefinition에서 `sortOrder >= targetSortOrder`인 기존 속성들의 `sortOrder`를 `+1` 한다.
6. 이때 밀린 기존 속성들의 `updatedByActorId`를 현재 `workspaceAccess.actorId`로 갱신한다.
7. 새 `AttributeDefinition`을 `sortOrder = targetSortOrder`로 생성한다.
8. 기존 Record들에 대한 `RecordAttributeValueDefinition`을 생성한다.

## 9. Transaction 계약

이 API는 반드시 Application Layer에서 `TransactionManager`를 통해 트랜잭션을 시작한다.

트랜잭션에 포함되는 작업:

- 기준 `AttributeDefinition` 조회
- 필요한 기존 `AttributeDefinition`들의 `sortOrder` 증가
- 밀린 기존 `AttributeDefinition`들의 `updatedByActorId`, `updatedAt` 갱신
- 새 `AttributeDefinition` 생성
- 새 속성에 대한 `RecordAttributeValueDefinition` materialize

트랜잭션 중 하나라도 실패하면 전체 작업은 rollback 한다.

Repository 구현은 Prisma transaction client를 직접 새로 열지 않고 `TransactionContext`를 전달받아 사용한다.

## 10. Error Contract

| 상황 | HTTP Status | Error Code | 설명 |
| --- | ---: | --- | --- |
| 인증 없음 또는 인증 실패 | 401 | 기존 인증 에러 | Bearer 인증 실패 |
| Workspace 접근 권한 없음 | 403 | 기존 Workspace 접근 에러 | 사용자가 Workspace에 접근할 수 없음 |
| Workspace actor 없음 | 403 | 기존 Workspace actor 에러 | 요청 사용자에 대응되는 actor가 없음 |
| ObjectDefinition 없음 또는 Workspace 불일치 | 404 | 기존 ObjectDefinition Not Found | 대상 ObjectDefinition이 없음 |
| AttributeDefinition 이름이 비어 있음 | 400 | 기존 validation 에러 | 기존 생성 API 정책 유지 |
| AttributeType이 지원되지 않음 | 400 | 기존 validation 에러 | 기존 생성 API 정책 유지 |
| `apiSlug` 중복 | 409 | 기존 중복 에러 | 같은 ObjectDefinition 안에서 중복 |
| `insertPosition` 형태가 잘못됨 | 400 | `ATTRIBUTE_DEFINITION_INSERT_POSITION_INVALID` | object가 아니거나 필수 값 누락 |
| `insertPosition.side`가 `before`/`after`가 아님 | 400 | `ATTRIBUTE_DEFINITION_INSERT_POSITION_INVALID` | 지원하지 않는 삽입 방향 |
| 기준 AttributeDefinition 없음 | 404 | `AttributeDefinitionNotFound` | 기준 속성이 없거나 다른 Workspace/Object에 속함 |
| DB 쓰기 실패 | 500 | 기존 Internal Error | rollback 필요 |

## 11. Response

응답은 기존 생성 API와 동일하게 유지한다.

응답에 `insertPosition`, `shiftedAttributeDefinitionCount` 등 신규 필드는 추가하지 않는다.

## 12. Observability / Logging

기존 생성 이벤트 로그인 `crm.attributeDefinition.created`를 유지한다.

추가로 안전한 메타데이터만 남긴다.

- `workspaceId`
- `objectDefinitionId`
- `attributeDefinitionId`
- `insertPositionSide`
- `referenceAttributeDefinitionId`
- `targetSortOrder`
- `shiftedAttributeDefinitionCount`
- `recordAttributeValueDefinitionCount`

로그에 남기지 않는 값:

- `attributeDefinitionName`
- `description`
- `icon`
- `config`
- 사용자 입력 원문
- 토큰 또는 인증 정보

## 13. DB / Repository 변경 범위

DB schema 변경은 하지 않는다.

`AttributeDefinitionCommandRepository`에 필요한 동작:

- 현재 ObjectDefinition 안에서 기준 AttributeDefinition의 `sortOrder`를 조회한다.
- 특정 `sortOrder` 이상인 AttributeDefinition들의 `sortOrder`를 `+1` 한다.
- 순서가 밀린 AttributeDefinition들의 `updatedByActorId`를 갱신한다.

예상 Repository 메서드:

```ts
findAttributeDefinitionSortOrder(input: {
  workspaceId: string;
  objectDefinitionId: string;
  attributeDefinitionId: string;
  transactionContext?: TransactionContext;
}): Promise<number | null>;

incrementAttributeDefinitionSortOrdersFrom(input: {
  workspaceId: string;
  objectDefinitionId: string;
  fromSortOrder: number;
  updatedByActorId: string;
  transactionContext?: TransactionContext;
}): Promise<number>;
```

## 14. 구현 범위

Backend:

- Create DTO에 `insertPosition` 추가
- Command에 `insertPosition` 추가
- Use Case에서 삽입 위치 계산 로직 추가
- Application error/filter 매핑 추가
- Repository port 확장
- Prisma repository 구현 추가
- 관련 unit test 보강

Frontend:

- 속성 헤더 메뉴의 `왼쪽에 삽입`, `오른쪽에 삽입`에서 기존 속성 추가 모달을 연다.
- 모달 submit 시 기존 create API에 `insertPosition`을 함께 전송한다.
- 일반 `+ 속성 추가`에서는 `insertPosition`을 보내지 않는다.
- 성공 후 기존 목록 refetch 또는 optimistic update 정책을 따른다.

## 15. 제외 범위

- 새 API endpoint 추가
- DB migration
- Drag and drop 기반 reorder
- AttributeDefinition update/delete/duplicate 기능
- Relationship, Select, Status 구현
- View 저장 구조 변경

## 16. 검증 계획

Backend:

- `pnpm -C BE typecheck`
- `pnpm -C BE lint`
- AttributeDefinition create use case unit test
- AttributeDefinition controller unit test
- Prisma AttributeDefinition command repository test
- `pnpm -C BE build`

Frontend:

- `FE/user-web`에서 속성 헤더 메뉴 동작 확인
- 일반 속성 추가는 마지막에 추가되는지 확인
- 왼쪽 삽입 시 기준 속성 포함 오른쪽 속성들이 밀리는지 확인
- 오른쪽 삽입 시 기준 속성 오른쪽 속성들만 밀리는지 확인
- 생성 후 테이블 컬럼 순서가 API 결과와 일치하는지 확인

## 17. 확인 필요 사항

- `referenceAttributeDefinitionId` 형식 검증을 UUID로 강제할지, 현재 ID 정책에 맞춰 단순 string으로 둘지 결정이 필요하다.
- `AttributeDefinitionNotFound`의 외부 에러 코드 표기를 현재 에러 필터 정책과 맞춰 확인해야 한다.
- 기존 `sortOrder`에 중복이나 gap이 있는 데이터가 있을 경우, 이번 삽입 API에서 정규화까지 수행할지는 별도 결정한다.
