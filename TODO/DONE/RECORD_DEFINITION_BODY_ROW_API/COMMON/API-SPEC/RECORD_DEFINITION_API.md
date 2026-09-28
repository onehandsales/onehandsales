# RecordDefinition API

계약 상태: implemented

소비자:
- User Web

## 1. 목적

ObjectDefinition 목록 화면의 body row에 표시할 RecordDefinition 목록과 각 row의 RecordAttributeValueDefinition 값을 조회한다.

## 2. API

```http
GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions
```

인증:
- Bearer access token 필요
- Backend는 `@CurrentUser()`의 사용자 ID를 신뢰하고 request body/query로 userId를 받지 않는다.

## 3. Request

DTO:
- `ListWorkspaceObjectRecordDefinitionsQueryDto`

Path params:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| workspaceId | UUID string | 예 | 아니오 | UUID | 조회할 Workspace ID |
| objectDefinitionId | UUID string | 예 | 아니오 | UUID | 조회할 ObjectDefinition ID |

Query:

| 이름 | 타입 | 필수 | nullable | validation | 설명 |
| --- | --- | --- | --- | --- | --- |
| cursor | string | 아니오 | 아니오 | string, max 2048 | 다음 페이지 조회용 불투명 cursor. 첫 요청에는 보내지 않는다. |

Body:
- 없음

Pagination:
- 방식: cursor pagination
- 기준: `RecordDefinition.createdAt asc`, `RecordDefinition.id asc`
- page size: 25 고정
- `cursor`는 서버가 내려준 `pageInfo.nextCursor` 값을 그대로 다시 전달한다.

Sorting:
- RecordDefinition: `createdAt asc`, `id asc`
- RecordAttributeValueDefinition: AttributeDefinition 생성 순서에 맞게 `attributeDefinition.createdAt asc`, `attributeDefinition.id asc`, 이후 `createdAt asc`, `id asc`

## 4. Business Logic

1. `currentUser.id + workspaceId`로 WorkspaceMember 존재 여부를 확인한다.
2. Workspace membership이 없으면 정보 노출을 막기 위해 not found로 응답한다.
3. `workspaceId + objectDefinitionId`로 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
4. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 응답한다.
5. cursor가 있으면 `createdAt + id` 조건으로 변환한다.
6. `RecordDefinition`을 `workspaceId + objectDefinitionId` 기준으로 25개 + 1개 조회한다.
7. 응답 대상 25개 `recordDefinitionId`를 모아 `RecordAttributeValueDefinition`을 `IN` 조건으로 일괄 조회한다.
8. `recordDefinitionId` 기준으로 value 목록을 그룹핑한다.
9. 26번째 RecordDefinition이 있으면 `hasNextPage: true`와 다음 cursor를 반환한다.

## 5. Response

성공 status:
- `200 OK`

Response DTO:
- `WorkspaceObjectRecordDefinitionListResponse`

Body:

```json
{
  "items": [
    {
      "id": "00000000-0000-4000-8000-000000000701",
      "createdAt": "2026-09-28T00:00:00.000Z",
      "updatedAt": "2026-09-28T00:00:00.000Z",
      "recordAttributeValues": [
        {
          "id": "00000000-0000-4000-8000-000000000801",
          "attributeDefinitionId": "00000000-0000-4000-8000-000000000601",
          "attributeType": "Text",
          "textValue": "회사명",
          "numberValue": null,
          "booleanValue": null,
          "dateValue": null,
          "timestampValue": null,
          "jsonValue": null,
          "selectOptionId": null,
          "statusOptionId": null,
          "targetRecordDefinitionId": null,
          "targetObjectDefinitionId": null,
          "targetActorId": null
        }
      ]
    }
  ],
  "pageInfo": {
    "hasNextPage": true,
    "nextCursor": "opaque-cursor"
  }
}
```

Field contract:

| 필드 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| items | array | 아니오 | body row 목록 |
| items[].id | UUID string | 아니오 | RecordDefinition ID |
| items[].createdAt | ISO string | 아니오 | RecordDefinition 생성 시각 |
| items[].updatedAt | ISO string | 아니오 | RecordDefinition 수정 시각 |
| items[].recordAttributeValues | array | 아니오 | row에 속한 값 목록 |
| recordAttributeValues[].id | UUID string | 아니오 | RecordAttributeValueDefinition ID |
| recordAttributeValues[].attributeDefinitionId | UUID string | 아니오 | Header row AttributeDefinition과 매칭할 ID |
| recordAttributeValues[].attributeType | AttributeType string | 아니오 | 값 생성 당시 Attribute 타입 snapshot |
| recordAttributeValues[].textValue | string | 예 | 문자열 값 |
| recordAttributeValues[].numberValue | string | 예 | Decimal 값. JSON number 정밀도 손실을 피하기 위해 string으로 응답 |
| recordAttributeValues[].booleanValue | boolean | 예 | 체크박스 값 |
| recordAttributeValues[].dateValue | `YYYY-MM-DD` string | 예 | 날짜 값 |
| recordAttributeValues[].timestampValue | ISO string | 예 | 날짜와 시간 값 |
| recordAttributeValues[].jsonValue | JSON | 예 | 구조화 값 |
| recordAttributeValues[].selectOptionId | UUID string | 예 | SelectOption ID |
| recordAttributeValues[].statusOptionId | UUID string | 예 | StatusOption ID |
| recordAttributeValues[].targetRecordDefinitionId | UUID string | 예 | Record reference 대상 RecordDefinition ID |
| recordAttributeValues[].targetObjectDefinitionId | UUID string | 예 | Record reference 대상 ObjectDefinition ID |
| recordAttributeValues[].targetActorId | UUID string | 예 | Actor reference 대상 Actor ID |
| pageInfo.hasNextPage | boolean | 아니오 | 다음 페이지 존재 여부 |
| pageInfo.nextCursor | string | 예 | 다음 페이지 cursor. 다음 페이지가 없으면 null |

## 6. Error Contract

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| access token 없음/만료 | Unauthorized | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| Workspace membership 없음 | RecordDefinitionWorkspaceNotFound | 404 | 현재 Object 화면을 비우거나 Workspace 재선택 유도 | info |
| ObjectDefinition이 Workspace에 없음 | RecordDefinitionObjectDefinitionNotFound | 404 | 현재 Object 화면을 비우거나 Object 목록 재조회 | info |
| cursor 파싱 실패 | ValidationError | 400 | 첫 페이지부터 다시 조회 | info |
| path param UUID 형식 오류 | BadRequestException | 400 | 개발 오류로 처리 | warn |

권한 없음과 소유권 없음은 404로 응답해 다른 Workspace/Object 존재 여부를 노출하지 않는다.

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

Idempotency / Outbox:
- mutation이 아니므로 idempotency key와 outbox는 필요 없다.

## 8. Observability Contract

log event key:
- 없음. 조회 성공마다 구조화 로그를 남기지 않는다.

request id:
- 전역 middleware의 request id를 사용한다.

redaction:
- RecordAttributeValueDefinition의 원문 값은 로그에 남기지 않는다.
- cursor 원문은 로그에 남기지 않는다.

provider error context:
- 외부 Provider 호출 없음

## 9. Compatibility

breaking change 여부:
- 신규 API이므로 기존 API에는 breaking change 없음

기존 FE 영향:
- Header row API와 별개로 body row API client를 새로 연결해야 한다.

migration 또는 fallback:
- body row 연결 전까지 FE mock row 제거 시 빈 목록 처리를 준비해야 한다.

## 10. DB / Index

조회 성능을 위해 아래 index를 함께 추가한다.

```prisma
RecordDefinition:
@@index([workspaceId, objectDefinitionId, createdAt, id])

RecordAttributeValueDefinition:
@@index([workspaceId, objectDefinitionId, recordDefinitionId])
```
