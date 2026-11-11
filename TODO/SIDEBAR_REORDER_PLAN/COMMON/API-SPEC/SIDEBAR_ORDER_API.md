# 사이드바 순서 변경 API

- 계약 상태: implemented — 2026-11-11 사용자 구현 요청으로 confirmed 후 구현·검증 완료. 재검토 결과는 BE-TODO와 계획 README에 기록한다.
- 소비자: User Web. Object/List는 Workspace 공통, Favorite는 Workspace 구성원 개인 순서다.
- 소유 모듈: object-definition / list-definition / view-definition. Workspace 접근은 공개 WorkspaceAccessQuery, transaction은 application TransactionManager를 사용한다.

## 요청과 응답

| 기능 | Method | Path |
| --- | --- | --- |
| 관리 항목 | PATCH | /api/users/me/sidebar/workspaces/:workspaceId/objects/order |
| 업무 목록 | PATCH | /api/users/me/sidebar/workspaces/:workspaceId/lists/order |
| 즐겨찾기 | PATCH | /api/users/me/sidebar/workspaces/:workspaceId/view-favorites/order |

Authorization Bearer 인증. workspaceId는 필수 UUID 경로 값. Query 없음. Content-Type application/json.
Cookie 입력은 사용하지 않는다. `x-request-id`는 선택 추적 헤더이며 기존 middleware가 재사용하거나 생성한다.
각 모듈의 ReorderSidebarObjectDefinitionsDto / ReorderSidebarListDefinitionsDto / ReorderSidebarViewFavoritesDto를 사용한다.

```json
{"orderedIds":["33333333-3333-4333-8333-333333333333","11111111-1111-4111-8111-111111111111"]}
```

orderedIds는 필수·non-null UUID 문자열 배열이다. 해당 범위의 전체 ID를 최종 표시 순서대로 보낸다. UUID 대소문자 정규화 후 중복을 거부한다. 빈 배열은 현재 목록도 비어 있을 때만 성공한다. Favorite는 ViewFavoriteDefinition.id를 사용한다. userId/memberId/actorId/sortOrder 등 추가 필드는 받지 않는다.

성공 200 / ReorderSidebarItemsResponse:

```json
{"items":[{"id":"33333333-3333-4333-8333-333333333333","sortOrder":0},{"id":"11111111-1111-4111-8111-111111111111","sortOrder":1}]}
```

items는 최종 순서 배열, id는 UUID, sortOrder는 0부터 시작하는 non-null 정수다. 기존 GET 3개의 필드/배열 형태는 유지하며 정렬은 sortOrder ASC만 사용한다. ViewDefinition의 보기 메뉴 순서는 변경하지 않는다.

## 처리와 오류

1. 기존 AuthGuard 인증 후 HTTP DTO/경로/query와 application의 중복·Workspace 멤버십을 검증한다. 기존 생성 API와 같이 Workspace 구성원이 공통 순서를 수정할 수 있다. 개인 즐겨찾기는 서버의 멤버 ID로 제한한다.
2. application transaction 안에서 범위별 잠금 후 현재 ID/순서를 조회한다. 요청 집합과 현재 집합이 정확히 일치해야 한다. UUID 목록으로 DB 대상을 넓히지 않는다.
3. 변경된 행만 sortOrder와 updatedByActorId/updatedAt을 갱신한다. Actor가 없는 멤버는 순서가 이미 같으면 no-op 성공, 실제 수정은 서버 상태 오류로 중단한다. Actor를 자동 생성하지 않는다.
4. 모두 commit된 뒤 응답한다. 오류 시 해당 요청 전체 rollback. 동일 범위 생성은 같은 잠금 안에서 MAX(sortOrder)+1, 즐겨찾기 등록/해제는 기존 개인 잠금과 공유한다.

| 상태 | 오류·상황 | FE 처리 | 로그 |
| --- | --- | --- | --- |
| 400 | HTTP ValidationPipe/ParseUUIDPipe/EmptyRequestPipe/StrictOrderBodyPipe 오류 | 실패 안내·최신 목록 복원 | 기존 HTTP 경계 처리, use case 미호출 |
| 400 | ValidationError: application UUID 배열/중복 검증 | 실패 안내·최신 목록 복원 | WARN reorderFailed |
| 401 | 인증 헤더 오류는 UnauthorizedException, 세션 오류는 기존 Unauthorized | 기존 로그인 처리 | 기존 AuthGuard/인증 계층 처리; 아래 관측 범위 참고 |
| 404 | objects: ObjectDefinitionWorkspaceNotFound, lists: ListDefinitionWorkspaceNotFound, view-favorites: ViewFavoriteWorkspaceNotFound | Workspace 존재 여부 비공개 | WARN reorderFailed |
| 409 | SidebarOrderConflict: 현재 전체 ID 집합 불일치 | 최신 목록 재조회 | WARN reorderFailed |
| 500 | InternalServerError: 접근 조회/잠금/transaction 실패 또는 수정 Actor 부재 | 실패 안내·재조회 | ERROR reorderFailed, 원본 오류 제외 |

기존 오류 envelope를 유지한다. Nest HttpException은 `{statusCode,error:{statusCode,message,error}}`, domain 오류는 `{statusCode,error,message}`다. `ValidationError`는 추가로 `code`와 `field: "orderedIds"`가 포함된다. 예상하지 못한 500은 `{statusCode:500,error:"InternalServerError"}`로 반환한다. 비활성 사용자 등 기존 인증 정책의 응답은 공통 인증 계약을 따른다.

```json
{"statusCode":409,"error":"SidebarOrderConflict","message":"Sidebar items changed; reload the list and try again"}
```

동시 순서 변경은 잠금 획득 순서로 처리하며 마지막 commit 순서가 최종 값이다. 항목 추가/삭제는 집합 검증으로 충돌 감지한다. 순서만 변경된 오래된 요청은 별도 revision 검사를 하지 않는다. 같은 입력 반복은 같은 순서에 수렴하고 변경이 없으면 감사 필드도 갱신하지 않는다. FE는 섹션별 저장 중 재드래그를 막아 요청을 겹치지 않게 하고 자동 mutation 재시도는 하지 않는다. 외부 부수 효과가 없어 outbox 불필요.

## Transaction·후속 처리

- transaction: **필요**. application이 현재 소유 범위 잠금→전체 집합 검증→모든 변경 행 저장을 하나로 묶는다.
- 변경 model: objects는 ObjectDefinition, lists는 ListDefinition, view-favorites는 ViewFavoriteDefinition. 기존 생성 흐름의 후속 속성/View 생성은 해당 생성 application이 계속 조율한다.
- rollback: 본 요청의 모든 순서·updatedAt·updatedByActorId 변경. 실패 시 일부 행만 commit하지 않는다.
- 부수 이력: 별도 이력 row 없음. 성공 운영 로그는 commit 후 기록하며 DB transaction 밖이다.
- 외부 Provider·후속 작업: 없음. outbox: **없음**, 외부 전달할 부수 효과가 없기 때문. 모듈 분리 후에도 소유 서비스가 최종 순서 명령을 처리하고 Workspace 접근은 공개 port로 확인한다.
- idempotency: 별도 key·보관 기간 없음. 최종 상태 지정 및 no-op으로 반복 요청 처리. 서버/FE 자동 mutation 재시도 없음.

## DB 및 호환성

ObjectDefinition/ListDefinition에 sortOrder Int default(0)을 추가한다. Workspace별 createdAt ASC/id ASC로 기존 순서를 보존하며 0부터 backfill한다. Favorite도 Workspace/member별 sortOrder/createdAt/id 기존 순서를 유지하며 연속 번호로 정리한다. 새로운 UNIQUE/CHECK/인덱스는 추가하지 않는다. 기존 FK, SQL 전용 SET NULL/DEFERRABLE/CHECK, RLS/권한을 유지한다. 최신 Prisma client와 DB migration을 API 실행 전에 준비한다.

기존 GET의 구조적 breaking change 없음. DB 변경 rollback은 기존 앱 버전 복귀 시 추가 컬럼을 유지할 수 있으며, 컬럼 제거는 데이터를 확인한 별도 후속 migration으로 처리한다. 적용된 migration 이력을 수정하지 않는다.

## FE / 관측 / 검증

드롭 시 낙관적 재배치, 성공 결과 반영, 실패 시 해당 사용자/Workspace/섹션 Query 재조회. 범위 변경 시 늦은 응답은 이전 범위 cache에만 적용한다. 클릭 이동/선택 스타일/접힘을 보존하고 섹션 간 이동을 허용하지 않는다. 키보드 이동과 취소를 제공한다.

성공/실패 event는 crm.sidebar.{objects|lists|favorites}.reordered/reorderFailed. requestId/userId/workspaceId, 항목 수, 변경 행 수, 안전한 오류 코드만 기록한다. 원문 이름·토큰·전체 ID 배열·DB 오류 원문은 기록하지 않는다. commit 전 성공 로그 금지.

관측 범위: application에 도달한 검증·권한 거부·접근 조회 실패·transaction 실패는 각각 안전한 오류 코드로 기록한다. 공통 AuthGuard는 현재 인증 실패 구조화 로그를 남기지 않으며 이번 순서 API 이전부터 존재한 공통 관측 공백이다. 업무 use case에서 미검증 토큰을 해석하거나 인증을 우회해 이를 보충하지 않는다. 상세 근거와 변경 범위는 [Backend 재검토](../../BE-TODO/BACKEND_REVIEW.md)를 따른다.

검증: DTO/권한/중복·누락·다른 Workspace/개인 격리/no-op/동시성/rollback/생성 후 append, migration 데이터 보존, FE mouse/keyboard/실패·범위 전환·새로고침을 포함한다.
