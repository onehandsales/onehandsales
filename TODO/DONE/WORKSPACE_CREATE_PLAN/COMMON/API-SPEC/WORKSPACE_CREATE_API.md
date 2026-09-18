# Workspace Create API

계약 상태: implemented

소비자:

- User Web

호환성:

- breaking change 여부: 있음. 생성 성공 응답이 Workspace/WorkspaceMember snapshot에서 `workspaceId` 단일 필드로 축소된다.
- 기존 FE 영향: 있음. User Web은 생성 응답의 `workspaceId`로 sidebar Workspace 단건 조회 API를 호출해 화면 상태를 갱신한다.
- migration 또는 fallback: DB schema 변경 없음. FE 응답 fallback 없이 단건 조회 결과를 기준으로 전환한다.

## 1. 목적

`/app` 사이드바의 새 작업 공간 생성 모달에서 사용자가 이름을 입력하고 업무 카드 중 하나를 클릭했을 때, 현재 로그인 사용자의 새 Workspace와 OWNER 멤버십을 생성한다.

## 2. 공통 정책

- 인증: Bearer access token 필요
- 소유권: 생성한 사용자를 `WorkspaceMember.role = OWNER`로 연결한다.
- request body: `workspaceName` 하나만 받는다.
- 저장 이름: 입력값을 trim한 뒤 `${workspaceName}'s Workspace` 형태로 `Workspace.name`에 저장한다.
- Workspace 종류: 현재 범위에서는 `PERSONAL`로 고정한다.
- 업무 카드 값: 이번 API 계약에서는 받거나 저장하지 않는다.
- DB schema 연결: `Workspace`, `WorkspaceMember`
- transaction: 필요. application use case가 Workspace 생성과 OWNER 멤버십 생성을 하나의 원자적 저장 명령으로 결정하고, infrastructure adapter가 Prisma nested create로 저장한다.
- rollback 범위: `Workspace` 생성과 `WorkspaceMember` 생성은 함께 성공하거나 함께 실패해야 한다.
- 외부 Provider 호출: 없음
- 부수 로그/이력 transaction 포함 여부: 없음
- idempotency: 없음. 사용자가 다시 요청하면 새 Workspace가 생성된다.
- idempotency key 출처/scope: 해당 없음
- 중복 요청 응답 기준: 새 Workspace 생성
- outbox: 필요 없음. 외부 side effect와 후속 비동기 처리가 없다.
- observability: 신규 structured log는 추가하지 않는다. 기존 request id 기준 추적만 사용한다.
- log event key: 없음
- redaction: workspace name 원문 로그 금지, access/refresh token 로그 금지

## 3. API

### POST /api/users/me/workspaces

Request DTO: `CreateMyWorkspaceDto`

Response DTO: `CreateMyWorkspaceResponse`

Path param: 없음

Query: 없음

Header:

- `Authorization: Bearer <accessToken>` 필수

Cookie: refresh cookie는 이 API request 계약에 사용하지 않음

Body:

```json
{
  "workspaceName": "부동산"
}
```

Validation:

- `workspaceName`: string, required
- `workspaceName`: null 허용 안 함
- `workspaceName`: 빈 문자열 raw 입력은 DTO가 아니라 application validation에서 trim 후 차단
- trim 후 1자 이상
- trim 후 최대 80자

Success:

- Status: `201 Created`
- Body: 있음

```json
{
  "workspaceId": "00000000-0000-4000-8000-000000000301"
}
```

후속 FE 흐름:

- User Web은 성공 응답의 `workspaceId`로 `GET /api/users/me/sidebar/workspaces/:workspaceId`를 호출한다.
- 단건 조회 응답으로 현재 sidebar Workspace를 전환한다.
- Workspace 목록 query는 생성된 Workspace를 cache에 반영한 뒤 서버 기준으로 refetch한다.

Error:

| 상황 | error code | HTTP status | FE 처리 |
| --- | --- | --- | --- |
| 인증 토큰 없음/만료 | `Unauthorized` | 401 | 로그인 흐름으로 이동 |
| `workspaceName` 누락 또는 문자열 아님 | Nest validation error | 400 | 모달에서 재입력 유도 |
| trim 후 빈 값 | `WORKSPACE_NAME_REQUIRED` | 400 | 모달에서 재입력 유도 |
| trim 후 80자 초과 | `WORKSPACE_NAME_TOO_LONG` | 400 | 모달에서 재입력 유도 |

## 4. 이번 구현 범위

- Backend 생성 API 구현
- 생성 성공 응답을 `workspaceId` 단일 필드로 축소
- User Web 새 작업 공간 모달 2단계 카드 클릭 시 API 호출
- 생성 후 `workspaceId` 기반 sidebar Workspace 단건 조회와 목록 refetch

## 5. 제외 범위

- 업무 카드 값 저장
- 기본 Team 생성
