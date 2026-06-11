# Backend Architecture 문서

## 1. 목적

이 폴더는 Backend 구현 구조의 정본 문서를 관리한다.

## 2. 현재 문서

- `OVERVIEW.md`
- `BACKEND.md`
- `TESTING.md`
- `DEPLOYMENT.md`

## 3. 규칙

- Backend는 MVP에서 단일 NestJS 서버다.
- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리한다.
- Backend 구현은 DDD, Clean Architecture, Modular Monolith를 따른다.
- DB 구조 설명은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA`를 따른다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
