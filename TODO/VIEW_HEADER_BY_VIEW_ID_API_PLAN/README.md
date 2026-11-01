# 즐겨찾기 View의 공통 헤더·본문 진입

2026-11-01 사용자 요청: Backend 규칙에 따라 API를 먼저 구현·검토하고, 통과한 뒤 Frontend 규칙에 따라 기존 화면에 연결한다.

- [API 계약](COMMON/API-SPEC/VIEW_HEADER_BY_VIEW_ID_API.md)
- [Backend 구현 검토](BE-TODO/REVIEW.md)
- [Frontend 구현과 검토](FE-TODO/IMPLEMENTATION_AND_REVIEW.md)

`GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId`를 기존 view-definition 모듈에 추가했다. 대상 기준 기존 헤더의 공통 target reader·응답 mapper·Query Port·Prisma adapter를 재사용하며 요청한 View와 실제 개인 즐겨찾기 상태를 반환한다. View ID·Workspace 범위와 연결된 Object/List의 소속을 확인한다.

Backend 전체70 suites/582 tests, 타입 검사·린트·빌드·Prisma 검증 및 실제 모듈 HTTP 조립 검토를 통과한 뒤 Frontend 구현을 시작했다. 브라우저 검증은 원격 API 응답을 제어한 테스트이며 실제 인증·배포 검증과 구분한다.

Frontend 전체17 files/94 tests, 타입 검사·린트·production build와 Chromium 회귀64개가 통과했다. Supabase 실제 View24개에서도 새 헤더24개·본문24개·메뉴72개를 읽기 전용으로 확인했으며, 로컬 Backend3000에 검증한 build를 반영했다. User Web5173·Admin Web5174 서버와 ENV 파일은 유지했다.

즐겨찾기는 View ID를 포함한 URL로 이동하고 같은 WorkspaceViewPage·헤더·툴바·본문과 메뉴 API를 사용한다. 최초 본문부터 즐겨찾기의 View ID를 사용하며 대상 기준 기본 헤더 GET을 중복 호출하지 않는다. 단일 소속은 바로 열고, 이중 소속은 실제 소속 중 열 위치를 선택해 URL sourceType으로 보존한다. 무소속·없는 소속 선택·View 부재는 다른 원본/기본 보기로 대체하지 않는다.

schema·enum·migration·실제 업무 DB·ENV·Admin Web은 변경하지 않는다. 필터·정렬·보기 설정 저장, 다른 View 타입 실행, 즐겨찾기 순서 저장은 이번 범위에 포함하지 않는다.
