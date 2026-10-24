# View 즐겨찾기 Backend 작업

## 1. 선행 기준

[Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), BE/AGENTS.md와 [공통 API 계약](../COMMON/API-SPEC/SIDEBAR_VIEW_FAVORITE_API.md)을 따른다. 구현 완료, 실제 DB 검증은 환경 제약을 아래에 기록한다.

## 2. 구현

view-definition 모듈에 domain 오류, application Query Port/UseCase, infrastructure Prisma Repository/Module, presentation Controller를 둔다. AppModule에 등록한다. Workspace 공개 접근 Port를 재사용하고 Prisma·HTTP 타입을 application/domain에 노출하지 않는다.

Repository는 현재 Workspace·현재 멤버·같은 Workspace의 View로 범위를 제한하고 Favorite sortOrder/createdAt/id로 정렬한다. 응답 매핑은 계약의 4개 필드만 선택한다. read-only로 transaction/DB schema/seed 변경이 없다.

## 3. 검증

UseCase의 멤버 ID 전달·비멤버 차단·Actor 불필요·빈 목록, HTTP 인증/UUID/응답/404 테스트 10개가 통과했다. BE typecheck/lint/build와 Prisma validate도 통과했다. Prisma의 기존 List SetNull 경고 4개는 유지된다.

저장소의 멤버·Workspace·View 소속 격리와 정렬은 TEST_DATABASE_URL의 rollback 테스트로 작성했다. URL 미지정은 명시적으로 skip하며, 지정된 DB의 연결 실패를 성공 처리하지 않는다. 이번 기본 실행은 .env의 localhost:5432 테스트 DB 미가동으로 이 1개가 실패했다(231개 통과). TEST_DATABASE_URL을 빈 값으로 지정한 실행은 218개 통과·14개 skip이다. 실행 중인 개발 서버, 실제 DB, 환경 설정은 변경하지 않았다.
