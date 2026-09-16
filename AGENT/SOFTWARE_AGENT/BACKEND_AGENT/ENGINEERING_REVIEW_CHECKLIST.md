# Backend 엔지니어링 리뷰 체크리스트

## 1. 목적

이 문서는 Backend 구현 결과를 검토할 때 사용하는 품질 기준이다.

리뷰의 목적은 코드 스타일 지적이 아니라 데이터 유출, 권한 누락, 아키텍처 경계 붕괴, API 계약 누락, 운영 추적성 공백을 조기에 찾는 것이다.

초기 단계에서 테스트 작성은 별도 판단으로 둔다. 이 체크리스트에서 새 기능마다 반드시 확인해야 하는 기본 보완 축은 API 계약, transaction, observability다.

## 2. Backend 체크리스트

- User API는 `/api/*`, 관리자 확인 API는 `GET /admin/api/me`로 분리되어 있는가?
- 관리자 확인 API는 AuthGuard와 AdminGuard를 모두 사용하는가?
- Controller가 repository나 Prisma를 직접 호출하지 않는가?
- 다른 module의 Prisma repository 구현체를 직접 import하거나 주입받지 않는가?
- module 간 협력이 owning module의 application/query port 또는 use case facade로 표현되는가?
- 새 module이 `domain/application/infrastructure/presentation` 경계를 유지하는가?
- Backend class/interface 선언은 `// 역할 : ...` 주석으로 책임과 계약을 설명하는가?
- Backend HTTP API controller 메소드는 `// API : ...` 주석을 사용하는가?
- 내부 service/helper/use case 메소드는 `// 기능 : ...` 주석을 사용하는가?
- 새로 작성하거나 수정한 method/function에는 최소 1줄 한글 역할/기능 주석이 있는가?
- API controller와 application orchestration 메소드의 주요 처리 흐름이 numbered step comment로 읽히는가?
- transaction, provider 호출, repository 저장/갱신, token rotation 흐름이 `// 1. ...`, `// 2. ...` 형식으로 설명되어 있는가?
- Application layer가 transaction 경계를 갖는가?
- application/domain 공개 계약에 Prisma model type, Prisma transaction client type, Supabase SDK type, Express request/response type이 노출되지 않는가?
- 새 business logic이 Nest `ConfigService`, concrete logger, Prisma, Supabase SDK에 직접 의존하지 않는가?
- API가 포함된 작업이면 `COMMON/API-SPEC`의 계약 문서가 있는가?
- API 계약 상태가 구현 전 최소 `confirmed`였는가?
- API 계약에 소비자, 호환성, request, response, error, DB 연결이 모두 적혀 있는가?
- mutation, 민감정보, 외부 Provider API에 transaction 항목이 작성되어 있는가?
- transaction이 필요한 use case는 application layer에서 경계를 잡고 rollback 범위를 명확히 하는가?
- transaction이 필요 없는 API도 명세에 `transaction: 없음`과 이유가 적혀 있는가?
- retry 가능한 mutation 또는 다중 row 생성 mutation은 idempotency 기준이 있는가?
- 후속 처리나 미래 service 분리 가능성이 있는 mutation은 outbox 필요 여부가 검토됐는가?
- 여러 module 소유 데이터가 관련된 mutation은 orchestration owner가 명확한가?
- mutation, 민감정보, 외부 Provider API에 observability 항목이 작성되어 있는가?
- structured log event key, request id, redaction 기준이 정의되어 있는가?
- 외부 Provider 실패는 provider, retry 가능 여부, 안전한 error context로 남길 수 있는가?
- Domain layer가 NestJS, Prisma, HTTP SDK를 import하지 않는가?
- 사용자 소유 데이터 조회와 mutation에 `userId` 필터가 있는가?
- 구현한 API가 User Web/Admin Web의 실제 API client 계약과 일치하는가?
- 시간 필드는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`의 UTC instant + IANA `timeZone` 기준을 따르는가?
- 사용자가 입력한 현지 날짜/시간을 저장하는 업무 테이블은 같은 row에 `timeZone` 컬럼을 저장하는가?
- API 계약에서 시간 필드가 `UTC instant`, `local date-time + timeZone`, `날짜 전용` 중 무엇인지 명시되어 있는가?
- 구현한 API의 요청/응답 필드가 User Web/Admin Web의 실제 API client와 맞는가?
- Admin Web용 API를 추가할 때 `FE/admin-web`의 현재 범위와 별도 제품 결정을 먼저 확인했는가?
- CRM Core API를 추가할 때 고정형 Company/Product/Deal API 복구가 아니라 Workspace/Kit/Record 구조를 따르는가?
- CRM Core data 조회와 mutation이 Workspace ownership 경계를 검증하는가?
- Kit 적용, Record 생성, Relationship 생성 같은 다중 row 변경이 transaction 기준을 갖는가?
- DB schema draft, API 계약, FE feature 사용 방식이 같은 개념 이름을 바라보는가?
- future MSA 분리 가능성이 있는 module boundary를 깨는 직접 repository 공유가 없는가?

## 3. 테스트 체크리스트

- user ownership isolation 테스트가 있는가?
- AdminGuard 테스트가 있는가?
- 인증이 필요한 지원 접수 API가 현재 사용자 snapshot과 ownership을 검증하는 테스트가 있는가?
- 외부 Provider는 기본 테스트에서 mock/stub 처리되는가?
- application use case test가 orchestration, transaction 호출, idempotency 판단을 검증하는가?
- repository integration test가 중요한 Prisma mapping과 unique/rollback 조건을 검증하는가?
- module boundary를 깨는 금지 import를 발견할 수 있는 테스트 또는 정적 검토가 있는가?

## 4. 배포 체크리스트

- `local`, `production` 두 환경 기준을 유지하는가?
- production secret이 local `.env`에 들어가지 않는가?
- 실제 Provider check는 명시적인 smoke job 또는 수동 production-safe 체크로 제한되는가?

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
