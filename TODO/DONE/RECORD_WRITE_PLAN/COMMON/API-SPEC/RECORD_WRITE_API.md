# Record 생성·값 수정 계약

상태: 백엔드·사용자 프론트 구현 완료(2026-11-12). 기존 경로와 응답 필드를 유지한다. 관리항목 Object의 Record 쓰기이며 TABLE/KANBAN/LIST 공통이다. 아래 UUID는 예시이며 실제 생성 폼/주 화면 응답의 ID로 대체한다. 모든 경로는 Bearer 인증이 필요하다.

## 1. 기록 생성

`POST /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions`

```json
{
  "creationId": "00000000-0000-4000-8000-000000000901",
  "values": [
    { "attributeDefinitionId": "00000000-0000-4000-8000-000000000601", "values": ["신규 영업"] },
    { "attributeDefinitionId": "00000000-0000-4000-8000-000000000602", "values": ["12000000"] },
    { "attributeDefinitionId": "00000000-0000-4000-8000-000000000603", "values": [{ "targetRecordDefinitionId": "00000000-0000-4000-8000-000000000701" }] }
  ]
}
```

`201 { "recordDefinitionId": "00000000-0000-4000-8000-000000000901" }`

- `creationId`: 선택 UUID v4. 지정하면 Record PK로 사용하며 같은 Workspace/Object/생성 Actor/현재 값이 같은 재시도는 같은 ID를 반환한다. 별도 영구 요청 원장은 없으므로 생성 후 값이 바뀐 경우 재시도는 409다. 삭제된 ID의 재사용 방지는 이 계약에 포함하지 않는다.
- `values`: 선택 배열, 최대 100개 속성. 각 항목의 `values`는 값 배열이며 단일 속성은 최대 1개, 다중 속성은 최대 100개, 전체 최대 500개다. 중복 속성/동일 참조는 거절한다. 미지정/빈 배열은 null 셀로 초기화한다.
- 기존 body 없는 호출은 빈 기록 생성으로 유지한다. 초기값을 전달하는 새 호출은 `creationId`가 필요하다. 성공/재시도 모두 기존 클라이언트 호환을 위해 201과 같은 응답을 사용한다.

## 2. 기록값 수정

`PATCH /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions/:recordDefinitionId/record-attribute-values-definitions/:recordAttributeValueDefinitionId`

```json
{ "value": { "targetRecordDefinitionId": "00000000-0000-4000-8000-000000000702" } }
```

`200 { "recordAttributeValueDefinitionId": "수정한 값 행 UUID" }`

- 기존 단일 값 행 수정 계약을 유지한다. 다른 속성/다중값 행은 보존한다. `value` 미전달은 400, `null`은 해당 값만 비운다. 배열 전체 교체나 다중값 추가 endpoint는 이번 범위에 포함하지 않는다.
- 동일 값 재전송은 내용과 감사 시각을 변경하지 않는다. 동시 수정은 Workspace 범위 transaction lock으로 직렬화한다. 명시적 버전 충돌 검사는 없으며 마지막 성공 요청을 반영한다.

## 3. 타입별 value

| 타입 | 값 |
|---|---|
| Text/EmailAddress/Domain/PhoneNumber | 문자열 |
| Number/Currency/Rating | 정밀도 손실 없는 십진 문자열; DB Decimal(30,10) 범위 |
| Checkbox | boolean |
| Date | YYYY-MM-DD |
| Timestamp | timezone이 있는 ISO 시각 |
| Select | `{ "selectOptionId": "UUID" }` |
| Status | `{ "statusOptionId": "UUID" }` |
| ActorReference | `{ "targetActorId": "UUID" }` |
| RecordReference | `{ "targetRecordDefinitionId": "UUID" }`; Object ID는 서버에서 확인 |
| PersonalName/Location/Interaction | 기존 JSON 객체 계약 유지 |

옵션은 같은 속성/Workspace, Actor는 같은 Workspace, Record는 설정/관계가 허용하는 Object 및 같은 Workspace인지 검증한다. 참조 타입은 typed FK를 저장하고 JSON 중복 참조는 제거한다. RelationshipDefinition이 있으면 양방향 값과 양쪽 Record 감사 정보를 원자적으로 갱신한다. 반대쪽 단일값에 이미 다른 연결이 있으면 자동으로 빼앗지 않고 409로 반환한다.

## 4. 입력 폼 조회

`GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions/form`

Query가 없으면 현재 Object의 속성을 `sortOrder ASC, id ASC`로 반환한다.

```json
{
  "attributes": [
    { "id": "00000000-0000-4000-8000-000000000601", "title": "영업명", "type": "Text", "isMultiselect": false },
    { "id": "00000000-0000-4000-8000-000000000603", "title": "대상 회사", "type": "RecordReference", "isMultiselect": false }
  ]
}
```

`?attributeDefinitionId=UUID&q=OpenAI&cursor=UUID`는 해당 참조 속성의 선택 후보를 조회한다. `q`(최대 200자)와 `cursor`는 선택이며 후보 ID 오름차순 25건씩 반환한다. 필터를 적용한 뒤 페이지를 자른다. 검색을 바꿀 때 cursor를 초기화한다. 일반 문자열/숫자 속성이나 attributeDefinitionId 없는 검색·cursor는 400이다.

```json
{
  "items": [{ "id": "00000000-0000-4000-8000-000000000701", "label": "OpenAI" }],
  "pageInfo": { "hasNextPage": false, "nextCursor": null }
}
```

- Select/Status: 같은 속성 옵션의 이름 검색.
- ActorReference: 같은 Workspace의 Actor 표시명 검색; 사용자 이메일은 반환하지 않는다.
- RecordReference: 관계/속성 설정의 대상 Object로 제한한다. 대상 제한이 없으면 Workspace 내 Record가 대상이다. View의 TITLE 바인딩에 연결된 원본 텍스트를 이름으로 사용하며 제목이 없으면 `이름 없는 기록`이다. 검색은 이 제목 텍스트에 적용한다.
- 생성창의 제목은 원본 AttributeDefinition.title이다. View 컬럼 별칭인 labelOverride를 바꾸지 않는다.

## 5. 트랜잭션·소유권·View

- record-definition application이 TransactionManager를 소유한다. Attribute/Relationship/옵션은 attribute-definition 공개 port, Actor/멤버십은 workspace 공개 port로 읽는다.
- Record 쓰기는 READ COMMITTED transaction에 Workspace advisory lock을 사용한다. 여러 초기값/역방향 쓰기를 위한 timeout은 30초이며 다른 기존 transaction의 기본값은 유지한다.
- 쓰기 범위: RecordDefinition, RecordAttributeValueDefinition. 검증/역방향 실패 시 전체 rollback. 스키마/migration 변경 없음.
- ViewDefinition/표시 설정/필터/정렬/그룹은 기존 주 화면 GET에서 적용한다. 이 API는 View 설정, ListEntry, ListEntryValue를 쓰지 않는다. 새 Record가 필터 조건에 맞지 않으면 현재 View에 나타나지 않을 수 있다.
- 성공 후 FE는 같은 Workspace의 View 본문 캐시를 갱신한다. 파이프라인에 이미 연결된 Record 값도 재조회한다.
- outbox: 외부 side effect 없음. 향후 MSA 분리 시 관계값 동기화가 record 소유권을 벗어나면 재검토한다.

## 6. 오류·관측·검증

- 401 인증 실패, 404 Workspace/Object/Record/값 접근 불가, 400 입력/참조/다중값 검증 실패, 409 생성 ID 충돌·관계 단일값 충돌·기존 데이터 불일치.
- 로그: crm.recordDefinition.created / crm.recordAttributeValueDefinition.updated / crm.record.writeFailed. requestId, userId, Workspace/Object/Record ID 및 오류 코드만 기록하고 값·토큰·이메일은 제외한다.
- 생성/수정 단일값 검증 오류: `RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID`; 수정 value 누락: `RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_REQUIRED`.
- 404: `RecordDefinitionWorkspaceNotFound`, `RecordDefinitionObjectDefinitionNotFound`, `RecordDefinitionRecordNotFound`, `RecordAttributeValueDefinitionNotFound`.
- 409: `RecordCreationConflict`, `RecordValueConflict`, `RecordRelationshipConflict`.

## 7. 프론트 동작과 검증 경계

- 관리항목의 상단/표 하단 `+ 기록 추가` → 입력창 → 저장. 창을 열거나 취소하면 POST하지 않는다. 초기값·다중값·이름 선택을 지원한다.
- 요청 중 중복 저장을 막고 오류 시 입력값/creationId를 유지한다. 응답 유실 후 같은 입력 재전송은 한 기록으로 처리한다. 충돌 후 수정된 입력을 새 기록으로 생성하려면 창을 닫고 다시 연다.
- TABLE/LIST/KANBAN의 직접 Record 값은 같은 PATCH를 사용한다. RecordReference/ActorReference/Select/Status는 이름 선택 편집을 제공한다. 참조 경로로 조회한 다른 Record 값과 LIST_ENTRY 속성은 읽기 전용이다.
- 생성된 Record가 업무목록에 자동 등록되는 기능, ListEntry 생성/단계 수정, KANBAN 드래그 이동, 기존 다중값 행 추가 API는 이번 범위에 포함하지 않는다.
- 테스트 DB: 별도 로컬 PostgreSQL. 실제 Nest HTTP + PostgreSQL로 초기값/FK/양방향 관계/재시도/충돌 롤백과 세 View 조회를 검증한다. 인증 Guard는 테스트에서 대체한다.
- 브라우저: Chromium + API 모의 응답. 생성 취소/저장/응답 유실 재시도와 TABLE/KANBAN/LIST 참조 편집·실패 복구 검증.
- Supabase: 기존 로그인 세션을 사용한 GET 7회로 입력 속성 9개·회사/담당자/선택 후보와 주 화면 조회를 확인했다. TABLE 4건(기존 회사 3건과 이름 없는 기록 1건), LIST 9건, KANBAN 6건, issues 0. 쓰기 테스트는 Supabase에서 실행하지 않았다.
- 검증 결과: BE typecheck/lint/build 통과, Jest 76 suites / 851 tests 통과(로컬 PostgreSQL HTTP 통합 6개 포함). FE typecheck/lint/build 통과, Vitest 19 files / 105 tests 통과. Chromium 기존 주 화면 13개 + 새 기록 쓰기 5개 통과. Prisma validate 통과(기존 SetNull 경고 4개). FE 빌드의 기존 큰 chunk/Browserslist 경고는 남아 있다.
- 기존 두 write use-case의 책임은 RecordWriteService로 이동했다. 기존 구현에 종속된 단위 테스트는 타입 codec 및 실제 HTTP/PostgreSQL 통합 검증으로 대체했다.
