# Backend 엔지니어링 리뷰 체크리스트

## 1. 목적

이 문서는 Backend 구현 결과를 검토할 때 사용하는 품질 기준이다.

리뷰의 목적은 코드 스타일 지적이 아니라 데이터 유출, 권한 누락, 아키텍처 경계 붕괴, 테스트 공백을 조기에 찾는 것이다.

## 2. Backend 체크리스트

- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리되어 있는가?
- Admin API는 AuthGuard와 AdminGuard를 모두 사용하는가?
- Controller가 repository나 Prisma를 직접 호출하지 않는가?
- Backend class/interface 선언은 `// 역할 : ...` 주석으로 책임과 계약을 설명하는가?
- Backend HTTP API controller 메소드는 `// API : ...` 주석을 사용하는가?
- 내부 service/helper/use case 메소드는 `// 기능 : ...` 주석을 사용하는가?
- API controller와 application orchestration 메소드의 주요 처리 흐름이 numbered step comment로 읽히는가?
- Application layer가 transaction 경계를 갖는가?
- Domain layer가 NestJS, Prisma, OpenAI, HTTP SDK를 import하지 않는가?
- 사용자 소유 데이터 조회와 mutation에 `userId` 필터가 있는가?
- 구현한 API가 User Web/Admin Web의 실제 API client 계약과 일치하는가?
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
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
