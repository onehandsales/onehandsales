# Service QA BE TODO

## 1. 목적

Backend와 DB의 실제 통합 QA 항목을 관리한다. 이 문서는 신규 API 구현 문서가 아니라 서비스 QA 실행 문서다.

## 2. 문서 목록

- `INTEGRATION-QA.md`
- `../COMMON/API-SPEC/ERROR_REPORT_API.md`
- `../COMMON/API-SPEC/SUPPORT_REQUEST_API.md`

## 3. BE 공통 기준

- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리한다.
- Admin API는 AuthGuard와 AdminGuard를 모두 통과해야 한다.
- 사용자 소유 데이터는 반드시 `userId` 기준으로 격리한다.
- mutation, 복구, 민감 원문 조회, 감사 로그는 transaction과 rollback 기준을 확인한다.
- 실제 provider 호출은 QA 범위에서 명시적으로 허용된 경우에만 수행한다.
- 공유/운영 DB에 destructive 명령을 실행하지 않는다.

## 4. 신규 구현 범위

- User Web 도움말 모달 에러신고 접수를 위해 `POST /api/error-reports`를 추가한다.
- User Web 도움말 모달 지원요청 접수를 위해 `POST /api/support-requests`를 추가한다.
- 요청 사용자는 FE body가 아니라 `AuthGuard`와 `CurrentUserContext`로 식별한다.
- screenshot은 선택 첨부이며 Supabase Storage에 저장하고 DB에는 metadata만 남긴다.
- 지원요청은 문의 유형과 본문을 저장하며 screenshot이나 첨부 파일은 받지 않는다.
- Admin 조회/처리 API는 이번 범위에서 제외한다.
