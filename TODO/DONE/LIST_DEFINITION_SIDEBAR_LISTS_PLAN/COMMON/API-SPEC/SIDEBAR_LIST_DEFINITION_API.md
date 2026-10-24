# 사이드바 업무 목록 조회 API

- API 식별자: `SIDEBAR_LIST_DEFINITION_LIST`
- 계약 상태: implemented
- 소비자: User Web. 이번 작업은 Backend만 구현한다.
- 확정 근거: 기존 관리 항목 API와 동일한 조건으로 추가하기로 사용자와 합의했다.
- 호환성: 신규 endpoint로 breaking change 없음. 기존 FE/API 계약에 영향 없음.
- DB migration/fallback: 없음. 기존 `ListDefinition`, `WorkspaceMember` 사용

## 1. 정책

사이드바에 표시할 List 이름과 아이콘을 반환한다.

- Method/path: `GET /api/users/me/sidebar/workspaces/:workspaceId/lists`
- 인증: 기존 AuthGuard, Bearer access token
- 접근 확인: CurrentUser.id와 요청 workspaceId의 WorkspaceMember 존재 여부
- role 제한/Actor 검증: 없음. OWNER/ADMIN/MEMBER 모두 조회 가능
- Workspace 부재와 비멤버는 동일한 404 오류로 응답
- 조건: `ListDefinition.workspaceId = workspaceId`
- 정렬: `createdAt ASC`, 동률이면 `id ASC`
- 검색/추가 필터/사용자 지정 정렬/페이지네이션: 없음. 해당 Workspace의 전체 요약 목록 반환

## 2. Request

Request DTO: 없음. path의 workspaceId를 ParseUUIDPipe로 검증한다.

| 구분 | 필드 | 타입 | 필수 | 검증/의미 |
| --- | --- | --- | --- | --- |
| path | workspaceId | UUID string | 예 | UUID 형식, 빈 문자열/null 불가 |
| header | Authorization | string | 예 | `Bearer <accessToken>` |

Query/Body: 없음. refresh cookie는 이 계약에서 사용하지 않는다. 사용자 ID는 인증 컨텍스트에서 가져온다.

## 3. Response

- Status: `200 OK`
- Body: 있음
- Response DTO: `SidebarListDefinitionListItemResponse[]`
- application 반환 계약: `SidebarListDefinitionListItem[]`

| 필드 | 타입 | nullable | 의미 |
| --- | --- | --- | --- |
| id | UUID string | 아니오 | ListDefinition 식별자 |
| icon | string | 예 | 화면 아이콘. 미지정 시 null |
| name | string | 아니오 | List 표시 이름 |

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000501",
    "icon": "kanban",
    "name": "영업 파이프라인"
  }
]
```

List가 없으면 자동 생성 없이 `200 OK`와 `[]`를 반환한다. 시각은 정렬에만 사용하며 응답에 시간 필드는 없다.

## 4. 내부 흐름과 DB 연결

1. AuthGuard가 기존 인증 규칙으로 CurrentUser를 해석한다.
2. Controller가 Workspace UUID를 검증하고 UseCase를 호출한다.
3. UseCase가 공개 WorkspaceAccessQuery.hasWorkspaceMembership(userId, workspaceId)를 호출한다.
4. 비멤버이면 ListDefinitionSidebarWorkspaceNotFound 오류를 발생시키고 List 조회를 실행하지 않는다.
5. 자체 Query Port와 Prisma Repository를 통해 요청 Workspace의 ListDefinition에서 id/icon/name만 생성순으로 조회한다.
6. 결과 배열을 반환한다.

조회 모델: WorkspaceMember(Workspace module), ListDefinition(새 list-definition module). 다른 module의 Prisma Repository 구현체를 직접 참조하지 않는다. ListEntry/값/View 기능은 이번에 구현하지 않는다.

## 5. Transaction / Observability

- transaction: 없음. read-only로 변경 모델과 자동 생성 데이터가 없음
- rollback/부수 이력: 해당 없음
- 외부 Provider 호출/암호화: 신규 처리 없음. 기존 인증 흐름 사용
- idempotency/outbox: 조회 API로 해당 없음
- observability: 기존 RequestIdMiddleware의 request id로 추적
- 별도 structured log/event key: 없음. 기존 관리 항목 조회와 동일
- redaction: access token, List 이름·아이콘 등 응답 원문과 개인정보를 별도 로그에 남기지 않음
- provider error context: 신규 외부 Provider 호출이 없어 해당 없음

## 6. Error / 소비자 처리

| 상황 | error code | HTTP status | 후속 FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 토큰 없음/만료 | 기존 AuthGuard/Resolver 인증 오류 | 401 | 기존 로그인·세션 복구 흐름 | warn |
| workspaceId UUID 오류 | Nest validation error | 400 | 잘못된 요청으로 처리 | warn |
| Workspace 부재/비멤버 | ListDefinitionSidebarWorkspaceNotFound | 404 | 선택 Workspace 확인 또는 Workspace 목록 재조회 | info |

log level은 오류 분류 기준이며 별도 로그를 신설하지 않는다. 기존 전역 HttpExceptionFilter의 오류 응답 형식을 사용한다.

```json
{
  "statusCode": 404,
  "error": "ListDefinitionSidebarWorkspaceNotFound",
  "message": "Workspace not found"
}
```

후속 FE는 응답 순서대로 표시하고 빈 배열을 빈 업무 목록으로 처리한다. 조회이므로 optimistic update는 없다. 이번 작업에서 FE client, Query key, route와 UX를 추가하지 않는다.

## 7. 구현과 검증

domain/application/infrastructure/presentation 계층을 갖는 `BE/src/modules/list-definition/`을 추가하고 AppModule에 등록한다. 기존 Workspace 공개 Port, 인증 Guard와 Prisma infrastructure를 재사용한다.

2026-10-24 UseCase 접근 차단, Controller 정상/빈 응답·인증·UUID·404 테스트를 완료했다. 실제 AuthGuard와 전역 HttpExceptionFilter를 사용하는 Controller 테스트를 포함한다. typecheck/lint/build/Prisma validate 및 AppModule 컴파일을 포함한 전체 45개 suite·221개 테스트가 통과했다. 기존 Prisma SetNull 경고 4건은 유지한다. FE 연결은 아직 수행하지 않았다.
