# View 컬럼 표시명 수정

현재 View의 표시 설정 이름만 저장한다. 원본 `AttributeDefinition.title/apiSlug`와 기록값은 변경하지 않는다.

## 계약

`PATCH /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/columns/:viewAttributeSettingDefinitionId`

- 인증: 기존 사용자 Bearer 인증, Workspace 멤버 접근 정책을 따른다. 별도 역할 제한은 추가하지 않는다.
- 세 경로 ID는 UUID, query는 비어 있어야 한다.
- TABLE/KANBAN/LIST의 기존 표시 설정을 대상으로 한다. Object/List 소속, 직접/참조 경로 표시 모두 동일한 설정 ID로 수정한다. 신규 컬럼 생성의 Object TABLE 제한은 그대로다.
- 요청은 `labelOverride` 한 필드만 허용한다. 문자열은 앞뒤 공백을 제거하며 빈 문자열은 거절한다. `null`은 원본 이름 복원이다. 누락·숫자·배열·추가 필드는 400이다. 스키마에 없는 이름 길이·중복 제한은 추가하지 않는다.

```json
{ "labelOverride": "예상 매출" }
```

원본 이름 복원:

```json
{ "labelOverride": null }
```

200 응답(동일 값 재요청도 200):

```json
{
  "viewDefinitionId": "00000000-0000-4000-8000-000000000401",
  "viewAttributeSettingDefinitionId": "00000000-0000-4000-8000-000000000801",
  "labelOverride": "예상 매출"
}
```

복원 응답은 `labelOverride: null`이다. 실제 표시 이름은 기존 본문 GET의 `bindings[].label`로 확인한다. 계산은 `labelOverride ?? AttributeDefinition.title`이다.

| 상태 | 오류 | 의미 |
| --- | --- | --- |
| 400 | 기존 ValidationPipe/EmptyRequestPipe 오류 | 잘못된 경로·본문·query |
| 400 | `ViewColumnLabelInvalid` | 비어 있거나 문자열/null이 아닌 표시명 |
| 401 | 기존 인증 오류 | 인증 없음/실패 |
| 404 | `ViewColumnNotFound` | 멤버 아님, View 없음 또는 설정의 Workspace/View 소속 불일치 |
| 409 | `ViewColumnLabelTargetUnsupported` | TABLE/KANBAN/LIST 외 View |
| 500 | `InternalServerError` | 저장 실패; 미완료 transaction rollback |

Domain 오류는 기존 `{statusCode, error, message}` 형식이다. 다른 Workspace의 존재 여부나 DB 원문 오류는 노출하지 않는다.

## 소유권·트랜잭션

1. application이 Workspace 공개 접근 port로 멤버와 서버 Actor를 확인한다.
2. application의 `TransactionManager`로 transaction을 시작한다. 기존 컬럼 생성과 동일한 READ COMMITTED View 행 잠금을 사용한다.
3. View의 Workspace·타입과 표시 설정의 `id + workspaceId + viewDefinitionId`를 확인한다.
4. 값이 다를 때만 `ViewAttributeSettingDefinition.labelOverride`, `updatedByActorId`, `updatedAt`을 저장한다. 같은 값은 감사 필드도 변경하지 않는다.
5. 성공 commit 이후 안전한 ID와 requestId만 로그에 남긴다. 입력 표시명은 기록하지 않는다.

속성·기록·값·다른 표시 설정·ViewDefinition의 본문 필드는 쓰지 않는다. 스키마/migration 변경은 없다. 동일 요청은 멱등하며 동시 변경은 View 잠금으로 순서대로 처리하여 마지막 저장이 반영된다. 외부 호출·이벤트 발행이 없으므로 idempotency key/outbox는 추가하지 않는다.

## Frontend

- 이번 화면 연결은 현재 TABLE 컬럼 메뉴다. 표시명 입력 → 저장(Enter), 취소(Escape), 원본 이름으로 되돌리기를 제공한다. 한글 조합 중 Enter는 저장하지 않는다.
- 성공 후 같은 사용자·Workspace·View의 모든 본문 페이지/cursor와 설정 메뉴를 갱신한다. 다른 View와 원본 속성 캐시는 변경하지 않는다.
- 실패 시 입력 유지, 중복 클릭 방지, 저장 후 조회 실패 시 조회만 재시도한다. 경로 이동 후 늦은 응답은 이전 View 캐시에만 적용한다.
- 너비·순서·숨김의 기존 화면 미리보기는 별도이며 이번 API에 보내지 않는다. KANBAN/LIST의 표시명 편집 UI는 후속 범위다.

## 검증

HTTP 인증·입력·소속 검사, 설정 한 건 수정·null 복원·멱등 처리·실패 전파, 실제 조회의 label fallback, 프론트 저장/실패/조합/캐시 격리를 검증한다. 실행 결과는 상위 README에 기록한다.
