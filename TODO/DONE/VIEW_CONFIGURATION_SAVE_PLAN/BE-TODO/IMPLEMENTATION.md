# Backend 구현·재검토

먼저 읽기: [TODO Software Agent Reference](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [BE 규칙](../../../BE/AGENTS.md), [Backend 규칙](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md), [API 계약](../COMMON/API-SPEC/VIEW_CONFIGURATION_API.md), [DB 연결](DB-SCHEMA.md).

현재 구현은 modular monolith + Clean Architecture다. HTTP controller는 DTO/auth/응답 연결, `view-configuration-application.service.ts`는 권한·버전·실행·transaction, command repository는 scoped Prisma 쓰기를 담당한다. Application에 Prisma/외부 SDK를 주입하지 않는다. 다른 모듈의 저장소를 직접 공유하지 않는다.

GET과 preview/options는 ReadSnapshotRunner로 일관된 시점을 읽는다. PATCH는 parse → 접근/Actor 확인 → View 잠금 → membership 재확인 → section no-op 비교 → 버전 비교 → 전체 실행 검증 → 쓰기 → 확정 응답 순서다. 같은 상태 재시도는 no-op이며 다른 변경의 stale 요청은 409다. 외부 Provider 호출과 outbox는 없다. 로그는 완료/실패 후 요청 ID와 소속, 오류 코드만 기록한다.

대표 이름은 ObjectRecordTitleReader가 소유 포인터와 AttributeMetadataModule의 공개 port를 조합한다. 좁은 metadata module로 순환 의존을 피한다. 이름 해석은 View TITLE/숨김에 의존하지 않는다.

검증 기준: invalid/foreign/순환 설정·빈 원본·stale/no-op·실패 rollback·민감값 없는 로그, 대표 이름 소속 및 모듈 DI를 테스트한다. Node 24로 typecheck/lint/build와 `TEST_DATABASE_URL= pnpm exec jest --runInBand`를 실행한다. 일반 DB 통합 테스트는 별도 TEST_DATABASE_URL이 있어야 실행하며 현재 Supabase를 대신 연결하지 않는다. 실제 DB 강제 rollback 검증은 [계획 README](../README.md)의 이전 결과와 구분한다.
