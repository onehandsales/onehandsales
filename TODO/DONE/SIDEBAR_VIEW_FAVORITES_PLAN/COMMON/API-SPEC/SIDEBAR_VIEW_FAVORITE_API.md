# 사이드바 View 즐겨찾기 조회 API

- API 식별자: SIDEBAR_VIEW_FAVORITE_LIST
- 계약 상태: implemented
- 소비자: User Web
- 호환성: 신규 endpoint. 기존 API/FE 계약 breaking change 없음
- DB migration/fallback: 없음. 기존 WorkspaceMember/ViewFavoriteDefinition/ViewDefinition 사용
- 확정 근거: 사용자 요청으로 4개 필드 응답, 조회 GET API 1개와 공통 Frontend 표시를 구현한다.

## 1. 요청

`GET /api/users/me/sidebar/workspaces/:workspaceId/view-favorites`

Request DTO: 없음. ParseUUIDPipe로 path를 검증한다.

| 구분 | 필드 | 타입 | 필수 | 검증 |
| --- | --- | --- | --- | --- |
| path | workspaceId | UUID string | 예 | 빈 문자열/null 불가 |
| header | Authorization | string | 예 | Bearer access token |

Query/Body: 없음. refresh cookie는 이 API 계약에 사용하지 않는다. userId/workspaceMemberId는 클라이언트 입력을 사용하지 않고 인증 사용자와 Workspace 공개 Port로 구한다.

## 2. 응답

- Status: 200 OK
- Body: 있음
- Response DTO: SidebarViewFavoriteListItem[]

| 필드 | 타입 | nullable | 출처·의미 |
| --- | --- | --- | --- |
| id | UUID string | 아니오 | ViewFavoriteDefinition.id, 즐겨찾기 식별자 |
| viewDefinitionId | UUID string | 아니오 | 연결된 View 식별자 |
| name | string | 아니오 | ViewDefinition.name |
| icon | string | 예 | ViewDefinition.icon |

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000701",
    "viewDefinitionId": "00000000-0000-4000-8000-000000000801",
    "name": "서울 회사",
    "icon": "building-2"
  }
]
```

즐겨찾기가 없으면 200과 []를 반환한다. type/Object/List 소속 ID, 정렬 값과 시간 필드는 반환하지 않는다. 정렬은 Favorite.sortOrder ASC → Favorite.createdAt ASC → Favorite.id ASC다. 검색·추가 필터·사용자 지정 정렬·페이지네이션은 없다.

## 3. 내부 흐름·소유권

1. 기존 AuthGuard가 CurrentUser를 해석하고 Controller가 Workspace UUID를 검증한다.
2. UseCase가 WorkspaceAccessQuery.getWorkspaceMemberAccess(CurrentUser.id, workspaceId)를 사용한다.
3. 멤버십이 없으면 Workspace 부재와 구분 없이 404로 차단한다. Actor는 감사 정보이므로 존재를 요구하지 않는다.
4. ViewFavoriteDefinition을 workspaceId와 확인한 workspaceMemberId로 제한하고 연결 ViewDefinition.workspaceId도 같은 값으로 제한한다.
5. 지정 순서로 조회하고 View 이름·아이콘을 평탄화해 4개 필드만 반환한다.

새 view-definition 모듈이 ViewDefinition/ViewFavoriteDefinition의 이 읽기 책임을 소유한다. WorkspaceMember는 owning Workspace module의 공개 Port로 확인하며 다른 module의 Repository 구현체를 참조하지 않는다. View의 다른 기능·쓰기 소유권 구체화는 이번 범위가 아니다.

현재 DB는 View 관계의 Workspace 복합 FK를 강제하지 않으므로 연결된 View의 Workspace 조건을 생략하지 않는다. 기존 View 즐겨찾기 중복/재정렬 정책·UNIQUE를 임의로 추가하거나 중복 제거하지 않는다.

## 4. Transaction·Observability

- transaction: 없음. 조회 전용이며 모델·이력·로그 row를 변경하지 않음
- rollback/외부 Provider/자동 생성 데이터: 해당 없음. 기존 인증 흐름 재사용
- idempotency/outbox: 조회 API로 해당 없음
- observability: 기존 RequestIdMiddleware의 request id로 추적
- 별도 log event key/structured log: 없음. 기존 Object/List 조회와 같은 기준
- redaction: token, View 이름·아이콘, 응답 원문과 개인정보를 별도 로그에 남기지 않음
- provider error context: 신규 Provider 호출 없음

## 5. 오류와 소비자 처리

| 상황 | error code | HTTP status | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 누락/만료 | 기존 인증 오류 | 401 | 공통 apiClient 갱신·로그인 흐름 | warn |
| 잘못된 Workspace UUID | Nest validation error | 400 | 잘못된 요청으로 처리 | warn |
| Workspace 부재/비멤버 | ViewFavoriteSidebarWorkspaceNotFound | 404 | 선택된 범위에서 빈 표시, 별도 Workspace 변경 없음 | info |

위 오류는 기존 전역 HttpExceptionFilter로 변환한다. 별도 로그는 추가하지 않으며 분류 기준은 인증/validation warn, 접근 불가 info다.

## 6. Frontend 계약

Query Key는 userId/workspaceId를 포함한다. 기존 apiClient·동일한 refetch 정책과 공통 SidebarDataSection을 사용한다. 로딩 Skeleton, 빈 목록/최초 조회 실패 시 안내 없이 기존 추가 버튼 표시, 접힘·hover 등은 관리 항목/업무 목록과 같은 코드로 처리한다.

id는 공통 행 key로, name/icon은 표시 데이터로 전달하고 viewDefinitionId는 feature 응답에 보존한다. View 상세 API/route가 없으므로 이번 작업에서 가짜 이동 경로·기본 View·등록/해제 동작을 만들지 않는다. mutation/optimistic update는 없다. 기존 헤더의 로컬 즐겨찾기 미리보기와 동기화하지 않는다.

## 7. 검증 범위

멤버 ID 도출·비멤버 차단·Actor 불필요·빈 배열과 실제 AuthGuard/전역 Filter를 사용한 HTTP 인증·UUID·최소 응답·404 계약 테스트 10개가 통과했다. 브라우저에서는 공통 표시, null 아이콘, 접힘, 로딩·빈 배열·실패, Workspace별 데이터 분리를 확인했다.

실제 DB에서 필터·정렬을 확인하는 rollback 테스트를 작성했지만, 현재 TEST_DATABASE_URL의 localhost:5432가 미가동이어서 연결 실패했다. 이 검증은 통과로 기록하지 않는다. schema/migration/seed와 실제 업무 DB 데이터는 변경하지 않았다.
