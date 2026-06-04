# Backend/Frontend/Admin 규칙 흡수 결정

## 결정

기존 `AGENT/Backend`, `AGENT/Frontend`, `AGENT/Admin` 문서의 핵심 규칙을 `AGENT` 정본 문서로 흡수한다.

Mobile 규칙은 이번 흡수 범위에서 제외하고, 모바일 앱을 실제로 시작할 때 다시 검토한다.

## 흡수된 정본 문서

- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

## 조정된 내용

- 기존 `customer` 표현은 정본에서 `Company`와 `Contact`로 분리한다.
- `거래처`는 `Contact`, 즉 회사 아래에 있는 담당자/사람을 의미한다.
- Admin Web은 별도 앱으로 두되, Backend는 MVP에서 단일 NestJS 서버로 유지한다.
- Admin API는 `/admin/api/*`로 분리한다.
- User Web과 Admin Web은 패키지와 코드를 공유하지 않는다.
- OpenAPI 타입 생성은 각 FE 앱 내부에서만 허용한다.
- 주석/로깅 규칙은 공통 문서로 통합한다.

## Archive 정책

기존 `AGENT/Backend`, `AGENT/Frontend`, `AGENT/Admin` 문서는 흡수 후 archive 대상으로 본다.

삭제하지 않고 다음 위치로 이동했다.

- `AGENT/Backend` -> `archive/AGENT/Backend`
- `AGENT/Frontend` -> `archive/AGENT/Frontend`
- `AGENT/Admin` -> `archive/AGENT/Admin`

Mobile 규칙은 이번 흡수 범위에서 제외했다.

모바일 앱을 실제로 시작할 때 `AGENT/SOFTWARE_AGENT/ARCHITECTURE`와 `AGENT/SOFTWARE_AGENT/CONVENTION` 아래에 새 정본 문서를 만든다.


