# View 헤더 API 경로·식별자 계약 변경

- 계약 상태: implemented (구현 전 confirmed 작성, DB 통합 재검증은 아래 결과 참고)
- 소비자: User Web / Backend.
- 확정 근거: 사용자가 제시한 GET 2개와 POST/DELETE 경로 및 viewDefinitionId 요청·응답 형태로 변경한다.
- 호환성: 기존 경로와 viewId Query/응답을 교체하는 breaking change다. BE와 User Web을 함께 반영한다. 구 경로 alias는 추가하지 않는다.
- 기존 초기 GET view-header의 경로와 viewId 응답은 유지하며 FE에서 현재 선택 모델로 변환한다.
- DB schema/migration/데이터/ENV 변경 없음.

## 1. HTTP

| 기능 | 변경 후 Method/path |
| --- | --- |
| Object View 목록 | GET /api/users/me/workspaces/:workspaceId/view-header/object-definitions/:objectDefinitionId/view-definitions |
| List View 목록 | GET /api/users/me/workspaces/:workspaceId/view-header/list-definitions/:listDefinitionId/view-definitions |
| 즐겨찾기 등록 | POST /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/favorite |
| 즐겨찾기 해제 | DELETE /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/favorite |

## 2. Request

- 공통 인증: 기존 AuthGuard의 Authorization: Bearer access token.
- path workspaceId: 필수 UUID, 기존 Workspace 접근 확인 유지.
- 목록 path objectDefinitionId/listDefinitionId: 필수 UUID. 해당 Workspace의 대상 존재를 소유 모듈 공개 Port로 확인한다.
- 목록 Query DTO: ListWorkspaceObjectViewsQueryDto / ListWorkspaceListViewsQueryDto.
- 목록 query viewDefinitionId?: 선택 UUID string. undefined는 선택 표시 없음이다. null/빈 문자열/UUID가 아닌 값/중복·배열 값은 기존 검증 기준으로 거부한다.
- 이 query는 목록 필터가 아니며 목록 내 일치하는 View의 isSelected만 결정한다.
- 즐겨찾기 path viewDefinitionId: 필수 UUID. 같은 Workspace의 View와 현재 멤버 범위를 기존 로직으로 검증한다.
- 즐겨찾기 Query/Body DTO: EmptyViewFavoriteRequestDto/기존 pipe. 추가 입력 없음.
- 사용자·Actor·Favorite PK·순서는 client 입력으로 받지 않는다.

## 3. Response

목록 Status: 200 OK / Body 있음. Response DTO: WorkspaceObjectViewsResponse 또는 WorkspaceListViewsResponse.

```json
{
  "items": [
    {
      "viewDefinitionId": "00000000-0000-4000-8000-000000000801",
      "viewName": "전체 회사",
      "viewIcon": null,
      "viewType": "TABLE",
      "isSelected": true
    }
  ]
}
```

- item의 viewDefinitionId는 필수 UUID string이며 viewId는 반환하지 않는다.
- viewName: string, viewIcon: string|null, viewType: 기존 11종 ViewDefinitionType, isSelected: boolean.
- 정렬은 sortOrder ASC → createdAt ASC → id ASC이며 pagination/search/추가 filtering은 없다.
- View가 없으면 {"items":[]}이다. 선택 query가 없거나 목록 밖이면 모든 항목이 false다. UUID 대소문자는 정규화한다.

즐겨찾기 Response DTO: CreateWorkspaceViewFavoriteResponse / DeleteWorkspaceViewFavoriteResponse.

```json
{"viewDefinitionId":"00000000-0000-4000-8000-000000000801","isFavorite":true}
```

해제는 같은 구조의 isFavorite=false이다. 생성은 신규 201/기존 200, 해제는 항상 200이다. created 내부 판정은 응답에 포함하지 않는다.

## 4. 초기 헤더·사이드바와의 연결

- GET /api/users/me/workspaces/:workspaceId/view-header?targetType=OBJECT|LIST&targetId=... 는 기존 계약을 유지한다.
- 초기 응답의 viewId를 FE WorkspaceViewListItem.viewDefinitionId로 변환한다.
- 즐겨찾기 변경 응답의 viewDefinitionId와 초기 헤더 캐시의 viewId를 비교하여 같은 View만 갱신한다.
- sidebar view-favorites의 viewDefinitionId는 이미 올바른 이름이므로 유지한다.
- 캐시 격리 범위(user/workspace/target/view), 선택 상태, 반응형 헤더 공유, 늦은 응답·중복 방지는 유지한다.
- 이 변경을 초기 헤더 전체나 DB id 전역 일괄 치환으로 확장하지 않는다.

## 5. 비즈니스 로직·모듈·트랜잭션

- 기존 ViewDefinitionModule/application/query port/repository 계층을 유지한다. 경로 분류 때문에 새 도메인 모듈을 만들지 않는다.
- 목록의 membership → Object/List 공개 Summary Port → View 요약 조회 및 선택 표시 흐름을 유지한다.
- 즐겨찾기의 Workspace/Actor/소속 확인, 멤버 advisory lock → View lock → 멱등 저장/삭제 흐름을 유지한다.
- 목록 transaction: 없음(read-only).
- 즐겨찾기 transaction: 기존처럼 필요. ViewFavoriteDefinition과 관련 검증/잠금을 같은 TransactionManager 범위에서 수행한다.
- 실패 rollback/멱등성/outbox: 기존 즐겨찾기 계약 그대로. 새 비동기 후속 작업·외부 provider 없음.
- SQL/DB 구조·조회 조건·저장값·즐겨찾기 순서 정책은 변경하지 않는다.

## 6. 오류·관측성

| 상황 | HTTP | 처리 |
| --- | --- | --- |
| 인증 없음/만료 | 401 | 기존 로그인/토큰 갱신 흐름 |
| UUID/Query/추가 Body 검증 오류 | 400 | 기존 validation 처리 |
| Workspace/대상/View 접근 불가 | 404 | 기존 domain 오류와 정보 노출 방지 유지 |
| Actor/트랜잭션/저장 실패 | 기존 오류 status | 기존 요청 ID 추적·재조회 처리 유지 |

- 기존 domain error code와 HttpExceptionFilter를 유지한다.
- 기존 즐겨찾기 structured event/requestId 및 개인정보 redaction을 유지한다. 내부 로그/저장소 식별자까지 무조건 이름을 바꾸지는 않는다.
- 응답 원문·access token·provider 원문 오류를 새로 로그에 남기지 않는다.

## 7. 테스트·배포 범위

- Backend: 두 목록과 즐겨찾기 controller/DTO/use case의 새 경로·필드·선택·UUID·인증/권한 회귀.
- Frontend: API URL/Query encoding, 새 response type, 초기 헤더 어댑팅, 즐겨찾기 캐시/동시 클릭/늦은 응답 회귀.
- E2E: mock 경로와 응답/URL ID 추출 수정, Object/List 보기 선택과 즐겨찾기 등록/해제·실패·모바일 상태 검증.
- Backend/Frontend typecheck/lint/test/build, 관련 Playwright, git diff --check.
- 이 네 API의 BE와 FE는 동일 계약으로 배포한다. Admin Web과 Supabase migration/업무 데이터 변경은 없다.

## 8. 이전 계약

- Object/List 목록: TODO/DONE/OBJECT_LIST_VIEW_LIST_API_PLAN/COMMON/API-SPEC.
- 즐겨찾기 변경: TODO/DONE/VIEW_FAVORITE_MUTATION_API_PLAN/COMMON/API-SPEC/VIEW_FAVORITE_MUTATION_API.md.
- 초기 헤더: TODO/DONE/VIEW_HEADER_DETAIL_API_PLAN/COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md (변경 없음).

## 9. 구현·검증 결과 (2026-10-29)

- Backend 네 API의 controller/DTO/application 응답과 User Web client/type/선택·캐시를 함께 반영했다.
- Backend typecheck/lint/build 및 prisma validate 통과. ViewDefinition의 DB 비의존 unit/실제 module HTTP 테스트 9개 suite / 167개 통과.
- User Web typecheck/lint/build, unit 58개, mock API 기반 Playwright 24개 통과.
- Backend 전체는 54개 suite / 388개 테스트 통과, DB 통합 7개 suite / 14개 테스트는 기존 localhost:5432 연결 불가로 실패했다. DB/ENV를 변경하지 않았다. 실제 DB 통합 성공으로 해석하지 않는다.
- 작업 이력과 검토: [WORK_LOG](../../../../TODO_LOG/2026-10-29/VIEW_HEADER_API_NAMESPACE/WORK_LOG.md).
