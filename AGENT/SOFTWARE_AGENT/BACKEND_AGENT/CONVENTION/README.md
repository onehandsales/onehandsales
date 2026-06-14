# Backend Convention 문서

## 1. 목적

이 폴더는 Backend 코드, API 명세, API 계약, transaction, 관측성, 주석, 로깅 컨벤션을 관리한다.

## 2. 현재 문서

- `BACKEND.md`
- `API_SPEC.md`
- `API_CONTRACT.md`
- `TRANSACTION.md`
- `OBSERVABILITY.md`
- `COMMENT_AND_LOGGING.md`

## 3. 적용 규칙

- Backend 컨벤션은 `BE`에 적용한다.
- `BE` 내부 Markdown 문서는 한국어로 작성한다.
- API 명세 작성 규칙은 Backend API 명세를 포함하는 모든 AGENT/TODO 문서에 적용한다.
- API 계약 작성과 `/goal` 실행 기준은 `API_CONTRACT.md`를 따른다.
- transaction 경계와 rollback 범위는 `TRANSACTION.md`를 따른다.
- structured log, audit log, request context는 `OBSERVABILITY.md`를 따른다.
- 시간과 timezone 처리는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.
- Backend class/interface는 `// 역할 : ...`, API controller method는 `// API : ...`, 내부 method/function은 `// 기능 : ...` 주석을 사용한다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/README.md`
