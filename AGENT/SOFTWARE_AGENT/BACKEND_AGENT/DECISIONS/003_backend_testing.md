# Backend 테스트 결정

## 1. 결정

Backend 테스트는 `BE` 내부에서 관리한다.

테스트 우선순위는 위험 기반으로 정한다.

- domain entities와 value objects
- user ownership isolation
- AdminGuard와 admin-only application methods
- sensitive raw access audit transaction
- import mapping validation
- trash retention과 restore
- deal stage/activity logging
- meeting note to deal activity integration

## 2. 이유

Backend는 사용자 데이터 소유권, Admin 권한, 민감정보 원문 조회, transaction 같은 위험 흐름을 담당한다.

따라서 단순 coverage 수치보다 데이터 유출과 권한 누락을 막는 테스트가 우선이다.

## 3. 규칙

- 루트 공용 테스트 패키지를 만들지 않는다.
- Backend 테스트는 `BE`에서 실행한다.
- 외부 Provider는 기본 테스트에서 mock/stub 처리한다.
- 실제 Provider 확인은 명시적인 smoke job 또는 수동 production-safe 체크로 제한한다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
