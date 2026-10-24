# 업무 목록 API의 Frontend 사용 계약

상태: Frontend 연동 완료 / 소비자: User Web

## 1. 기존 API

[Backend API 정본](../../../LIST_DEFINITION_SIDEBAR_LISTS_PLAN/COMMON/API-SPEC/SIDEBAR_LIST_DEFINITION_API.md)을 사용한다. path/request/response/error/DB/transaction/observability 계약은 복제하거나 변경하지 않는다.

- `GET /api/users/me/sidebar/workspaces/:workspaceId/lists`
- 응답: `{ id: string; icon: string | null; name: string }[]`
- 정렬: Backend의 createdAt ASC, id ASC 순서 그대로 표시
- query/body/pagination/mutation: 없음
- 신규 Backend/DB 변경 및 breaking change: 없음

## 2. Frontend 처리

1. 인증 사용자와 현재 Workspace가 확인되면 기존 apiClient로 조회한다.
2. Query Key는 feature factory에서 사용자 ID와 Workspace ID를 포함한다. Workspace를 변경할 때 이전 Workspace 데이터를 placeholder로 재사용하지 않는다.
3. 최초 로딩과 Workspace 결정 대기 중에는 관리 항목과 같은 Skeleton을 표시한다.
4. 성공하면 id를 key로 icon/name을 표시한다. null 또는 유효하지 않은 아이콘은 공통 IconValueGlyph 기본 아이콘으로 처리한다.
5. 성공한 빈 배열은 빈 목록 안내로 표시하고 실패와 구분한다.
6. 실패는 번역된 안내와 재시도를 제공한다. 401 복구는 apiClient의 기존 갱신 흐름을 사용하며 Workspace 선택을 임의로 변경하지 않는다.

검색·필터·정렬 변경·페이지가 없는 API이므로 Query Key에 존재하지 않는 상태를 추가하지 않는다. 저장·낙관적 갱신·mutation invalidation은 없다. 이름·아이콘과 토큰 원문을 로그에 남기지 않는다.

## 3. 화면 범위

현재 데스크톱 SidebarNav에 연결한다. 관리 항목의 클릭 route는 보존하고, 미구현 List route로 링크하거나 선택 상태·기본 View를 임의로 만들지 않는다. 업무 목록 추가 버튼은 기존 표시를 유지하며 생성 동작은 이번 작업에 추가하지 않는다.
