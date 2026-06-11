# Backend 배포 환경 결정

## 1. 결정

MVP Backend 배포 환경은 두 단계만 사용한다.

- `local`
- `production`

`staging` 환경은 MVP에서 제외한다.

## 2. 이유

MVP 운영 복잡도를 낮추고, 별도 staging 환경을 유지하기 전까지는 테스트와 배포 전 검증으로 품질 게이트를 둔다.

## 3. 운영 원칙

- local 개발에서는 개발용 credential로 실제 Provider를 수동 호출할 수 있다.
- 자동 테스트에서는 외부 Provider를 기본적으로 mock/stub 처리한다.
- production은 실제 사용자와 실제 데이터를 다루는 유일한 live 환경이다.
- 실제 Provider 체크는 명시적인 smoke job 또는 수동 production-safe 체크로만 수행한다.
- production secret은 local `.env`에 넣지 않는다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
