# Backend 엔지니어링 리뷰 체크리스트

## 1. 목적

이 문서는 Backend 구현 결과를 검토할 때 사용하는 품질 기준이다.

리뷰의 목적은 코드 스타일 지적이 아니라 데이터 유출, 권한 누락, 아키텍처 경계 붕괴, API 계약 누락, 운영 추적성 공백을 조기에 찾는 것이다.

초기 단계에서 테스트 작성은 별도 판단으로 둔다. 이 체크리스트에서 새 기능마다 반드시 확인해야 하는 기본 보완 축은 API 계약, transaction, observability다.

## 2. Backend 체크리스트

- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리되어 있는가?
- Admin API는 AuthGuard와 AdminGuard를 모두 사용하는가?
- Controller가 repository나 Prisma를 직접 호출하지 않는가?
- Backend class/interface 선언은 `// 역할 : ...` 주석으로 책임과 계약을 설명하는가?
- Backend HTTP API controller 메소드는 `// API : ...` 주석을 사용하는가?
- 내부 service/helper/use case 메소드는 `// 기능 : ...` 주석을 사용하는가?
- API controller와 application orchestration 메소드의 주요 처리 흐름이 numbered step comment로 읽히는가?
- Application layer가 transaction 경계를 갖는가?
- API가 포함된 작업이면 `COMMON/API-SPEC`의 계약 문서가 있는가?
- API 계약 상태가 구현 전 최소 `confirmed`였는가?
- API 계약에 소비자, 호환성, request, response, error, DB 연결이 모두 적혀 있는가?
- mutation, Admin API, 민감정보, 외부 Provider API에 transaction 항목이 작성되어 있는가?
- transaction이 필요한 use case는 application layer에서 경계를 잡고 rollback 범위를 명확히 하는가?
- audit log가 필요한 mutation은 본 데이터 변경과 같은 transaction으로 묶이는가?
- transaction이 필요 없는 API도 명세에 `transaction: 없음`과 이유가 적혀 있는가?
- mutation, Admin API, 민감정보, 외부 Provider API에 observability 항목이 작성되어 있는가?
- structured log event key, request id, redaction 기준이 정의되어 있는가?
- application log와 audit log를 혼동하지 않았는가?
- 외부 Provider 실패는 provider, retry 가능 여부, 안전한 error context로 남길 수 있는가?
- Domain layer가 NestJS, Prisma, OpenAI, HTTP SDK를 import하지 않는가?
- 사용자 소유 데이터 조회와 mutation에 `userId` 필터가 있는가?
- 구현한 API가 User Web/Admin Web의 실제 API client 계약과 일치하는가?
- 시간 필드는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`의 UTC instant + IANA `timeZone` 기준을 따르는가?
- 사용자가 입력한 현지 날짜/시간을 저장하는 업무 테이블은 같은 row에 `timeZone` 컬럼을 저장하는가?
- API 계약에서 시간 필드가 `UTC instant`, `local date-time + timeZone`, `날짜 전용` 중 무엇인지 명시되어 있는가?
- Company API 변경 시 `FE/user-web/src/features/company/api/company-api.ts`의 요청/응답 필드가 Backend controller와 맞는가?
- Admin Web용 `/admin/api/*`를 추가할 때 `FE/admin-web/src/features/admin-query/api/admin-query-api.ts`의 기대 경로와 응답 형태를 함께 확인했는가?
- 단계 변경, 회의록 딜 연결, 민감정보 원문 조회처럼 부수 효과가 필요한 흐름이 같은 transaction에서 처리되는가?
- 민감정보 원문 조회는 사유 입력과 감사 로그를 강제하는가?

## 3. 테스트 체크리스트

- user ownership isolation 테스트가 있는가?
- AdminGuard 테스트가 있는가?
- 딜 단계 변경 시 활동 로그 생성 테스트가 있는가?
- 회의록 딜 연결 시 활동 로그 생성 테스트가 있는가?
- 민감정보 원문 조회와 감사 로그 transaction 테스트가 있는가?
- 외부 Provider는 기본 테스트에서 mock/stub 처리되는가?

## 4. 배포 체크리스트

- `local`, `production` 두 환경 기준을 유지하는가?
- production secret이 local `.env`에 들어가지 않는가?
- 실제 Provider check는 명시적인 smoke job 또는 수동 production-safe 체크로 제한되는가?

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
