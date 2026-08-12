# Service QA BE TODO

## 1. 목적

Backend와 DB의 실제 통합 QA 항목을 관리한다. 이 문서는 신규 API 구현 문서가 아니라 서비스 QA 실행 문서다.

## 2. 문서 목록

- `INTEGRATION-QA.md`

## 3. BE 공통 기준

- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리한다.
- Admin API는 AuthGuard와 AdminGuard를 모두 통과해야 한다.
- 사용자 소유 데이터는 반드시 `userId` 기준으로 격리한다.
- mutation, 복구, 민감 원문 조회, 감사 로그는 transaction과 rollback 기준을 확인한다.
- 실제 provider 호출은 QA 범위에서 명시적으로 허용된 경우에만 수행한다.
- 공유/운영 DB에 destructive 명령을 실행하지 않는다.

