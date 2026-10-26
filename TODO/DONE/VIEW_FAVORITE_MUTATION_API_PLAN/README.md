# View 즐겨찾기 추가·삭제 Backend API

- 일자: 2026-10-26
- 상태: Backend 구현·검증·G99 규칙 검토 완료
- 기준: [TODO Software 정본](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Backend Agent](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)
- [작업 로그](../../../TODO_LOG/2026-10-26/VIEW_FAVORITE_MUTATION_API/WORK_LOG.md)
- [API 계약](COMMON/API-SPEC/VIEW_FAVORITE_MUTATION_API.md), [사용 흐름](COMMON/USER-FLOW.md), [구현](BE-TODO/IMPLEMENTATION.md), [검증·G99](BE-TODO/TEST-AND-REVIEW.md), [FE 후속](FE-TODO/README.md), [실행 순서](COMMON/GOAL-WORK-ORDER.md)

사용자가 기존 View 헤더의 즐겨찾기 등록·해제 Backend API 구현을 요청했다. view-definition 소유 데이터만 변경하고 Workspace 공개 조회 Port, 공통 TransactionManager·Logger Port를 재사용한다. 모듈은 modular monolith와 Clean Architecture 기준을 따른다.

신규 등록은 201, 이미 등록된 요청은 200으로 true를 반환한다. 해제는 기존 유무와 관계없이 200/false다. 추가는 개인 순서의 맨 뒤, 해제는 해당 Workspace·멤버·View 범위의 행만 제거하며 나머지 순서는 보존한다.

Frontend·스키마·migration·기존 DB 데이터 정리·환경 파일·서버 재시작은 제외한다. 계약→구현→단위/HTTP/격리 PostgreSQL 검증→G99 검토 후 DONE 보관한다. View 자동 생성이나 즐겨찾기 선택 이동은 별도 작업이다. 최초 구현에서는 커밋을 제외했으며 후속 사용자 요청에 따라 규칙 재검토·검증 후 커밋한다.

## 완료 결과

Node 24.21.0에서 typecheck/lint/build, Prisma validate/generate와 격리 PostgreSQL 17.10의 전체 61 suites/400 tests가 실패·skip 없이 통과했다. 신규 검증은 3 suites/59 tests다. 같은 View 동시 등록·다른 View 순서·등록/해제 경합·본인 범위·중복·생성/삭제 rollback·기존 헤더/사이드바 반영과 요청 ID 추적을 확인했다. 잔여 Workspace/View/Favorite fixture는 모두 0이다. 실행 중 서버의 health 200과 두 endpoint의 무인증 401도 확인했다.

모듈·계층·transaction·멱등성·API/로그/주석·범위를 검토하고 DONE 보관했다. 커밋 전 재검토에서 기존 요청 ID를 성공/실패 로그에 전달하도록 보강했다. FE 연결은 후속 범위다.
