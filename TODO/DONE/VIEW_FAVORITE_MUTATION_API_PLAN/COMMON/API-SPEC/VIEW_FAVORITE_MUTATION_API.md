# View 즐겨찾기 등록·해제 API 계약

> 2026-10-29: 경로·식별자 명칭은 [View 헤더 API 변경 계약](../../../../VIEW_HEADER_API_NAMESPACE_PLAN/COMMON/API-SPEC/VIEW_HEADER_API_NAMESPACE.md)으로 대체했다. 아래 내용은 변경 이전 계약의 기록이다.

- 계약 상태: superseded (기존 구현 기록, 코드 구현 전 confirmed 작성)
- 소비자: User Web. Admin Web/Backend internal 공개 API 아님.
- 기준: [TODO Software 정본](../../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [API 계약](../../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md), [DB 정본](../../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [현재 Prisma](../../../../../BE/prisma/schema.prisma)
- 호환성: 새 endpoint 추가, breaking change 없음. 기존 헤더·View 목록·사이드바 GET 계약 유지. DB migration/fallback 없음. FE 연결은 후속.

## ① VIEW_FAVORITE_CREATE — View 즐겨찾기 등록

`POST /api/users/me/workspaces/:workspaceId/view-definitions/:viewId/favorite`

신규 생성은 **201**, 기존 등록은 **200**. Body 있음. `CreateWorkspaceViewFavoriteResponse`의 공개 필드는 아래 두 개다. 내부 created/favoriteId·sortOrder는 노출하지 않는다.

```json
{"viewId":"00000000-0000-4000-8000-000000000a01","isFavorite":true}
```

| 필드 | 타입 | nullable | 의미 |
| --- | --- | --- | --- |
| viewId | UUID string | 아니오 | 요청한 View의 정규화된 ID |
| isFavorite | boolean (true) | 아니오 | 현재 멤버의 등록 상태 |

## ② VIEW_FAVORITE_DELETE — View 즐겨찾기 해제

`DELETE /api/users/me/workspaces/:workspaceId/view-definitions/:viewId/favorite`

삭제 또는 이미 없음 모두 **200**, Body 있음. `DeleteWorkspaceViewFavoriteResponse`:

```json
{"viewId":"00000000-0000-4000-8000-000000000a01","isFavorite":false}
```

| 필드 | 타입 | nullable | 의미 |
| --- | --- | --- | --- |
| viewId | UUID string | 아니오 | 요청한 View의 정규화된 ID |
| isFavorite | boolean (false) | 아니오 | 현재 멤버의 해제 상태 |

## Request — 두 API 동일

`EmptyViewFavoriteRequestDto`와 `EmptyViewFavoriteRequestPipe`는 query/body의 추가 필드·배열을 거부한다. application 입력은 `CurrentUserContext`, workspaceId, viewId다.

| 위치·필드 | 타입 | 필수 | nullable·빈 값·검증 |
| --- | --- | --- | --- |
| Header Authorization | Bearer access token | 예 | 기존 AuthGuard, null/빈 값 불가 |
| Header x-request-id | string | 아니오 | 기존 RequestIdMiddleware가 trim·길이 128 이하를 검증하고 누락/빈 값/초과 시 UUID 생성, response header와 로그에 동일 값 사용 |
| Path workspaceId | UUID string | 예 | ParseUUIDPipe, null/빈 값 불가 |
| Path viewId | UUID string | 예 | ParseUUIDPipe, null/빈 값 불가, 대소문자 동일 취급 |
| Query | 없음 | 아니오 | userId/memberId/actorId/sortOrder 등 추가 입력 400 |
| Body | 없음 또는 빈 object | 아니오 | 추가 필드 400; ID·순서·Actor를 받지 않음 |
| Cookie | 없음 | 아니오 | 계약에 사용하지 않음 |

응답에 시간 필드는 없다. 생성 row의 createdAt/updatedAt은 DB 기본 UTC instant이며 사용자의 현지 일시 입력은 없다.

## 내부 흐름·DB 연결

1. AuthGuard와 UUID/DTO 검증 후 Workspace 공개 `getWorkspaceMemberAccess(userId, workspaceId)`로 멤버 ID와 Actor를 얻는다. 비멤버/Workspace 부재는 같은 404다.
2. application이 transaction을 시작한다. infrastructure에서 Workspace·멤버 단위 transaction advisory lock을 획득한다. UUID는 소문자로 정규화한다.
3. 같은 transaction에서 ViewDefinition의 id+workspaceId를 확인하고 FOR SHARE로 삭제/소속 변경과의 경합을 막는다. 없으면 404다. Object/List의 새로운 소속 제약은 추가하지 않는다.
4. POST: 본인 Workspace·멤버·View의 기존 ViewFavoriteDefinition이 있으면 변경 없이 200/true. 없다면 Actor 필수, 본인 Workspace·멤버의 max(sortOrder)+1(빈 목록 0)로 한 행 생성 후 201/true. 생성 Actor는 서버 Port 값만 사용한다.
5. DELETE: 본인 Workspace·멤버·View 조건의 deleteMany로 해당 행을 모두 삭제한다. 기존 중복도 이 범위에서만 해제한다. 이미 없음도 200/false. Actor는 요구하지 않는다.
6. commit 후 실제 변경만 구조화 로그를 기록한다. 재요청은 순서·수정시각을 바꾸지 않는다. 삭제 뒤 나머지 sortOrder를 재정렬하지 않는다.

읽기: Workspace/WorkspaceMember/Actor는 Workspace 소유 Port, ViewDefinition·ViewFavoriteDefinition은 View 소유 Repository. 쓰기: ViewFavoriteDefinition만. schema/migration/seed 변경 없음. 기존 PK·FK를 유지하며 UNIQUE·추가 index·CHECK를 도입하지 않는다. 조회는 Workspace·멤버/PK 조건으로 제한한다. 향후 데이터 증가 시 복합 조회 index는 기존 보류 제약 계획에서 검토한다.

## Transaction·멱등성·MSA

- transaction: 필요. 잠금→대상 확인→중복 확인/최대 순서→생성 또는 삭제가 같은 TransactionContext에서 실행된다. 실패 시 전체 favorite 변경 rollback, 성공 로그 없음.
- PostgreSQL READ COMMITTED 사용. 잠금 획득 뒤 후속 statement가 직전 commit을 읽어야 한다. adapter는 다른 isolation을 검출하면 변경 전에 안전한 500으로 중단한다. 별도 DB 설정 변경은 없다.
- 멱등성 key: 서버가 해석한 workspaceId+workspaceMemberId+viewId. 별도 client key/보관 테이블 없음. 같은 멤버의 등록/해제를 직렬화해 같은 View 중복과 서로 다른 View 순서 충돌을 방지한다.
- 기존 중복은 등록 시 보존한다. 해제 시 본인 해당 View만 모두 삭제한다. API 밖 직접 쓰기/과거 데이터의 전역 정합성은 보장 대상 아님.
- orchestration owner: view-definition. Workspace 소유 row는 변경하지 않는다. Actor 없는 신규 생성은 내부 데이터 불일치로 500, 자동 Actor 생성 없음. 기존 등록 재요청·해제는 Actor 없이 가능하다.
- outbox: 불필요. 외부 Provider/다른 모듈 후속 mutation/필수 이력 없음. 로그는 commit 밖 관측용이며 DB 이력이 아니다. future MSA에서는 Workspace 접근 Port를 원격 adapter로 대체하고 동일 소유 서비스 내부에서 멱등성/순서를 유지한다.

## 오류·FE 처리·관측

| 상황 | HTTP | error code | FE 처리 | 관측 |
| --- | --- | --- | --- | --- |
| 인증 누락/만료 | 401 | Unauthorized (기존 인증 계약) | 인증 흐름 | 기존 Guard |
| 비활성 계정 | 403 | InactiveUser | 접근 중단 | 기존 Guard |
| 잘못된 UUID/추가 입력/배열 | 400 | 기존 HTTP validation error object | 입력 수정, 자동 재시도 없음 | 기존 Filter |
| Workspace 부재/비멤버 | 404 | ViewFavoriteWorkspaceNotFound | 대상 접근 중단/재조회 | 성공 로그 없음 |
| View 부재/다른 Workspace | 404 | ViewFavoriteViewNotFound | 헤더·목록 재조회 | 성공 로그 없음 |
| 신규 생성 Actor 부재/DB 오류/지원하지 않는 isolation | 500 | InternalServerError | 상태 재조회 후 재시도 가능 | 원문 비노출 |

도메인 오류 envelope는 기존 공통 Filter의 statusCode/error/message를 따른다. HTTP validation은 statusCode와 error object(message/error/statusCode)를 반환한다. 예상 밖 500은 statusCode/error만 반환한다. 성공 시 isFavorite를 반영하고 개인 사이드바 즐겨찾기·현재 헤더를 재조회한다. FE 낙관적 변경·동시 클릭 UX는 후속 구현에서 결정한다.

- event: `crm.viewFavorite.created`, `crm.viewFavorite.deleted` (실제 행 변경 후 1회). JSON에 requestId/userId/workspaceId/workspaceMemberId/viewId/favoriteId(생성)/deletedCount(삭제)를 기록한다.
- transaction 내부의 예상 밖 실패는 `crm.viewFavorite.createFailed` / `crm.viewFavorite.deleteFailed` error event와 requestId·안전한 userId·소유 범위로 기록한다. 정상 404는 실패 error 로그 대상이 아니다. 오류 원문·stack은 로깅하지 않는다.
- 기존 RequestIdMiddleware의 정규화된 request.requestId를 presentation에서 순수 string으로 application에 전달한다. 성공/실패 모두 같은 ID로 연계하며 Express 타입이나 request 원문은 application에 전달하지 않는다. HTTP 밖 내부 호출은 requestId 생략 시 null이다. query/body의 requestId 입력은 거부한다. 공통 미들웨어·Logger Port·DB 스키마는 변경하지 않는다.
- 인증 토큰·이름·아이콘·개인정보·원문 DB/Provider 오류는 기록·응답하지 않는다. 외부 Provider 없음. DB 실패는 공통 500이며 성공으로 숨기지 않는다.
