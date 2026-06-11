# Backend Deployment Architecture

## 1. 환경 정책

MVP Backend 배포 환경은 두 단계만 둔다.

- `local`
- `production`

MVP에는 `staging` 환경을 두지 않는다.

## 2. Local

`local`은 다음에 사용한다.

- Backend 개발
- local debugging
- local API 검증
- mocked external provider 테스트
- 개발 credential을 사용한 실제 provider 수동 검증

Local Backend API 기본 origin:

- `http://localhost:3000`

## 3. Production

`production`은 실제 사용자와 실제 데이터를 다루는 유일한 live 환경이다.

Backend API는 Frontend Vercel hosting과 분리된 별도 hosting을 사용한다.

권장 production domain:

- `https://api.<service-domain>`

운영 규칙:

- production secret은 local `.env`에 넣지 않는다.
- Admin access는 제한하고 감사 가능해야 한다.
- 민감 데이터는 기본 마스킹한다.
- 원문 조회는 명시적 액션, 사유 입력, 감사 로그가 필요하다.

## 4. External Provider Checks

자동 테스트는 기본적으로 외부 Provider를 mock/stub 처리한다.

실제 Provider 확인은 명시적인 smoke job 또는 수동 production-safe 체크로만 수행한다.

`staging` 환경이 없으므로 실제 Provider 체크는 실제 사용자 데이터를 예기치 않게 변경하지 않아야 한다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
