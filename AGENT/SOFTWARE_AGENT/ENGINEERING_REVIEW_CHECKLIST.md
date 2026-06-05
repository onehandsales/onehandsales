# 엔지니어링 리뷰 체크리스트

## 1. 목적

이 문서는 Backend, User Web, Admin Web 구현 결과를 검토할 때 사용하는 소프트웨어 품질 기준이다.

리뷰의 목적은 코드 스타일 지적이 아니라 데이터 유출, 권한 누락, 아키텍처 경계 붕괴, 테스트 공백을 조기에 찾는 것이다.

## 2. Backend 체크리스트

- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리되어 있는가?
- Admin API는 AuthGuard와 AdminGuard를 모두 사용하는가?
- Controller가 repository나 Prisma를 직접 호출하지 않는가?
- Application layer가 transaction 경계를 갖는가?
- Domain layer가 NestJS, Prisma, OpenAI, HTTP SDK를 import하지 않는가?
- 사용자 소유 데이터 조회와 mutation에 `userId` 필터가 있는가?
- 단계 변경, 회의록 딜 연결, 민감정보 원문 조회처럼 부수 효과가 필요한 흐름이 같은 transaction에서 처리되는가?
- 민감정보 원문 조회는 사유 입력과 감사 로그를 강제하는가?

## 3. Frontend User Web 체크리스트

- 서버 상태는 TanStack Query로 관리되는가?
- feature 내부 API 호출은 `src/lib`의 앱 API client를 사용하는가?
- form validation은 React Hook Form과 Zod를 사용하는가?
- route state가 필요한 목록 필터는 URL search params에 반영되는가?
- 다른 feature의 internal file을 직접 import하지 않는가?
- User Web에서 `/admin/api/*`를 호출하지 않는가?
- 모바일에서 딜 파이프라인이 카드형 리스트로 동작하는가?

## 4. Admin Web 체크리스트

- Admin Web은 `/admin/api/*`만 호출하는가?
- query key가 `admin` namespace로 시작하는가?
- 글로벌 목록은 서버 페이지네이션을 사용하는가?
- 민감 데이터가 기본 마스킹되는가?
- 원문 조회 사유가 client log에 남지 않는가?
- 위험 액션은 확인 dialog와 필요한 경우 사유 입력을 요구하는가?

## 5. 테스트 체크리스트

- user ownership isolation 테스트가 있는가?
- AdminGuard 테스트가 있는가?
- 딜 단계 변경 시 활동 로그 생성 테스트가 있는가?
- 회의록 딜 연결 시 활동 로그 생성 테스트가 있는가?
- 민감정보 원문 조회와 감사 로그 transaction 테스트가 있는가?
- 외부 Provider는 기본 테스트에서 mock/stub 처리되는가?

## 6. 배포 체크리스트

- `local`, `production` 두 환경 기준을 유지하는가?
- production secret이 local `.env`에 들어가지 않는가?
- 배포 전 User Web/Admin Web 전체 E2E를 실행할 수 있는가?
- 실제 Provider check는 명시적인 smoke job 또는 수동 production-safe 체크로 제한되는가?

