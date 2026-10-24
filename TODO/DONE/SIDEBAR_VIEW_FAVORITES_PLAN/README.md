# 사이드바 View 즐겨찾기 조회와 Frontend 연결

상태: 구현 완료 / 2026-10-24. 실제 DB 검증은 로컬 테스트 DB 미가동으로 확인하지 못했다.

## 1. 목적과 범위

현재 Workspace에서 로그인한 멤버가 등록한 View 즐겨찾기를 사이드바에 표시한다. 사용자와 확정한 최소 응답 4개 필드를 사용하며, Object/List와 같은 공통 섹션·목록·행·Skeleton을 사용한다.

즐겨찾기 등록·해제·순서 변경, View 상세 API/화면, DB schema/migration/seed 변경은 추가하지 않는다. 실제 View 이동 경로는 상세 화면 구현 시 연결한다. 이번에는 응답의 View ID를 feature 데이터에 보존하고 이름·아이콘을 표시한다.

## 2. 순서와 완료 기준

1. 공통 계약과 개인 소유권·View 소속·정렬·응답을 확정한다.
2. Backend 조회 API와 권한/응답 검증을 구현한다.
3. User Web feature와 공통 SidebarDataSection을 연결한다.
4. BE/FE 검증과 기존 목록·헤더 회귀 확인 후 결과를 기록한다.

## 3. 문서

- [API 정본](COMMON/API-SPEC/SIDEBAR_VIEW_FAVORITE_API.md)
- [Backend 작업](BE-TODO/README.md)
- [Frontend 작업](FE-TODO/README.md)
- [검토](COMMON/PLANNING-REVIEW.md)
- [작업 로그](../../../TODO_LOG/2026-10-24/SIDEBAR_VIEW_FAVORITES/WORK_LOG.md)
- [Software 정본 참조](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

## 4. 완료와 검증

GET API 1개, 개인 멤버십 확인, 최소 응답과 서버 정렬, User Web feature·공통 사이드바 표시 연결을 구현했다. BE/FE typecheck·lint·build, Prisma validate, FE 단위 테스트 33개와 관련 브라우저 시나리오 9개가 통과했다.

BE 기본 테스트는 231개 통과, 새 저장소 테스트 1개가 localhost:5432 연결 불가로 실패했다. 테스트 DB를 비활성화한 실행은 218개 통과·DB 테스트 14개 skip이다. 실제 DB의 개인·Workspace·연결 View 격리 및 정렬 검증은 준비한 TEST_DATABASE_URL의 DB가 실행 중일 때 재확인해야 한다. 환경 파일과 실행 중인 개발 서버는 변경하지 않았다.
