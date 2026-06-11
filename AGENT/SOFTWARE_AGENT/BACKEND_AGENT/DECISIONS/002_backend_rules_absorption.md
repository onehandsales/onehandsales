# Backend 규칙 흡수 결정

## 1. 결정

기존 Backend 관련 규칙은 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT` 아래로 흡수한다.

Backend 정본 문서 위치:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

## 2. 이유

Backend와 Frontend 규칙이 같은 `ARCHITECTURE` 또는 `CONVENTION` 폴더에 섞여 있으면 구현자가 어떤 문서를 먼저 봐야 하는지 불명확하다.

Backend는 NestJS, Prisma, Clean Architecture, DDD, transaction, audit log, provider port/adapter 같은 고유 기준을 가진다. 따라서 Backend 전용 Agent 폴더에서 관리한다.

## 3. 적용 범위

- `BE` 구현
- Backend API 명세
- Backend DB 접근과 Prisma repository
- Backend 테스트와 배포
- Backend 주석과 로깅

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
