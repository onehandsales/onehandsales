# Backend 구현

반드시 먼저 [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Backend 규칙](../../../../BE/AGENTS.md), [API 계약](../COMMON/API-SPEC/VIEW_FAVORITE_MUTATION_API.md)을 따른다. 아래 구현은 완료했다.

- Controller/빈 Request DTO·전용 Pipe: Guard·UUID·추가 입력/배열 검증, 기존 middleware 요청 ID를 순수 string으로 전달, POST 201/200 변환, DELETE 200, 공개 두 필드만 응답.
- 별도 Create/Delete UseCase: 멤버 접근 확인, application TransactionManager 경계, Repository orchestration, commit 후 ApplicationLogger. 성공/실패 로그를 requestId로 추적하고 원문 입력·오류는 기록하지 않는다.
- Command Port: 잠금·View 소속 검증·기존 등록·마지막 순서·생성·범위 삭제. 모든 method는 TransactionContext 필수.
- Prisma Adapter: parameterized raw SQL transaction advisory lock와 View FOR SHARE, Prisma 최소 select/aggregate/create/deleteMany. READ COMMITTED 검증. 다른 module 테이블 직접 접근 없음.
- Module: provider/controller/logger DI 추가. DomainError: Workspace/View NotFound 추가. 기존 GET·Workspace Port·공통 transaction 구현 변경 없음.

트랜잭션 변경 모델은 ViewFavoriteDefinition 하나이며, 멱등성·rollback·외부 Provider 없음·outbox 불필요·로그 redaction은 단일 정본 API 계약을 따른다. 한국어 역할/API/기능·주요 순서 주석을 포함한다.
