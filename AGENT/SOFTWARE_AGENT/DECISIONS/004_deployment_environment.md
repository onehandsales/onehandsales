# Deployment Environment Decision

## 결정

MVP 배포 환경은 두 단계만 사용한다.

- `local`
- `production`

`staging` 환경은 MVP에서 제외한다.

## 이유

- MVP 운영 복잡도를 낮춘다.
- 별도 staging 환경을 유지할 만큼 배포/QA 규모가 아직 크지 않다.
- PR smoke E2E, `main` 전체 E2E, 배포 직전 전체 E2E로 기본 품질 게이트를 둔다.

## 운영 원칙

- local에서는 외부 Provider를 기본적으로 mock/stub 처리한다.
- production은 실제 사용자와 실제 데이터를 다루는 유일한 live 환경이다.
- production 배포 전에는 User Web/Admin Web 전체 E2E를 다시 실행한다.
- 실제 Provider 체크는 명시적인 smoke job 또는 수동 production-safe 체크로만 수행한다.



