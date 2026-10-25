# View 헤더 Frontend 후속 범위

- 상태: 후속 작업 / 이번 계획의 활성 구현 대상 아님
- 목적: Backend 소비 계약을 확인하고 Frontend 완료로 오인하지 않도록 범위를 기록한다.
- API 정본: [View 헤더 단건 조회](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
- 현재 Backend 작업: [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md)
- 사용자 흐름: [USER-FLOW](../COMMON/USER-FLOW.md)

## 1. 이번 작업에서의 경계

Frontend API client/hook/query key/route/사이드바/헤더·본문을 변경하지 않는다. Frontend 구현 goal은 이번 계획에 추가하지 않는다. Admin Web도 대상이 아니다.

## 2. 후속 연결에 사용할 데이터

기존 즐겨찾기의 id는 Favorite ID, viewDefinitionId는 View ID다. 단건 GET은 현재 Workspace와 viewDefinitionId로 호출한다.

| 화면 데이터 | 응답 출처 |
| --- | --- |
| 현재 View | id/name/icon/type |
| 현재 View의 별 상태 | isFavorite |
| 소속 이름·아이콘 | objectDefinition 또는 listDefinition |

7개 최상위 응답 필드와 nullable 규칙은 API 정본만 따른다. 프론트에서 소속·최근 활동·기록값을 임의 생성하지 않는다.

## 3. 후속 작업 시 확인할 기준

- 기존 user-web apiClient로 access token·갱신 흐름을 재사용하고 feature의 공개 API와 Query factory를 사용한다.
- 사용자·Workspace·View별로 캐시를 구분하고 늦게 도착한 응답이 새 선택을 덮지 않도록 한다.
- 401/403은 기존 인증·계정 처리, 400/404/500은 API 오류 계약에 맞춰 다룬다. 이전 헤더를 새 대상 데이터로 오인하게 두지 않는다.
- 단건 응답으로 현재 보기 표시를 구성할 수 있지만 드롭다운 전체 목록은 별도 View 목록 API가 필요하다.
- 소속 없는/소속이 둘인 View의 제목 기준·기본 선택·추가 역할 정책은 별도 결정한다.
- 즐겨찾기 등록·해제는 별도 mutation API가 필요하며 이번 GET이 별표 상태를 저장하지 않는다.
- 헤더 연결과 본문 구현의 범위를 구분한다. 이번 API 작업으로 본문을 구현한 것으로 기록하지 않는다.
