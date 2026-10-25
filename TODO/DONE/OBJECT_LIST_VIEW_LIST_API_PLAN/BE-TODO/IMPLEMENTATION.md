# Backend 구현 기준

필수 선행: [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Backend Agent](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md), [모듈 경계](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md), [주석 규칙](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md), [①](../COMMON/API-SPEC/OBJECT_VIEW_LIST_API.md), [②](../COMMON/API-SPEC/LIST_VIEW_LIST_API.md).

## 구조와 책임

view-definition에 각각 Controller·Query DTO·UseCase·Query Port·Prisma Repository를 추가한다. Object/List 요약은 기존 owning module의 공개 Summary Port로 확인하며 타 module persistence 직접 참조를 금지한다. Workspace는 공개 hasWorkspaceMembership 1회만 호출한다. Actor와 멤버 ID 조회는 필요하지 않다.

Domain/Application 공개 타입은 순수 TypeScript이며 Prisma/HTTP/Provider 타입을 노출하지 않는다. Controller는 AuthGuard·ParseUUIDPipe·Query DTO 이후 UseCase에 명시적 필드만 전달한다. UseCase는 권한→대상→View 목록→선택 표시를 조합한다. Repository는 View delegate만 주입받아 명시적 where/select/orderBy를 사용한다.

## DB와 운영

WorkspaceMember, ObjectDefinition 또는 ListDefinition, ViewDefinition을 읽는다. ViewFavorite와 원본 Record/설정은 읽지 않는다. 기본 단일 FK가 Workspace 일치까지 보장하지 않으므로 대상 확인과 View 조회 모두 workspaceId를 포함한다. 두 소속 View를 임의 XOR로 제외하지 않는다.

transaction은 없음. 순수 조회이며 여러 읽기의 동일 시점 snapshot은 보장하지 않는다. schema/migration/seed/인덱스·업무 DB 변경은 없다. 기존 인증 이외 외부 Provider·부수 이벤트·암호화·idempotency/outbox는 해당 없음이다. 공통 request id와 오류 처리를 재사용하고 토큰·이름·응답·DB/Provider 원문 오류를 로그에 남기지 않는다.

신규 class/interface에 역할, API method에 API, 내부 method/helper에 기능, 주요 처리에 번호 주석을 적용한다. 실제 DB 검증은 격리 테스트 DB와 rollback fixture로 수행한다.
