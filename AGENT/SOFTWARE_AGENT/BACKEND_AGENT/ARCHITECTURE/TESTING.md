# Backend Testing Architecture

## 1. 목적

이 문서는 `BE`의 Backend 테스트 기준을 정의한다.

Backend 테스트는 모든 코드를 균등하게 덮는 것이 아니라 데이터 유출, 권한 누락, 민감정보 원문 접근, irreversible action 같은 위험 흐름을 우선한다.

## 2. 테스트 우선순위

Backend 테스트 우선순위:

- domain entities와 value objects
- user ownership isolation
- AdminGuard와 admin-only application methods
- sensitive raw access audit transaction
- import mapping validation
- trash retention과 restore
- deal stage/activity logging
- meeting note to deal activity integration

## 3. 계층별 테스트 기준

Domain 테스트:

- 외부 SDK, NestJS, Prisma 없이 순수 TypeScript 기준으로 검증한다.
- business rule, value object validation, domain error를 우선한다.

Application 테스트:

- permission, ownership, transaction 필요 흐름을 검증한다.
- repository와 provider port는 mock/stub으로 대체한다.

Infrastructure 테스트:

- Prisma repository mapping, transaction adapter, provider adapter 경계를 검증한다.
- 실제 외부 Provider 호출은 기본 테스트에서 제외한다.

Presentation 테스트:

- guard, DTO validation, error mapping, response status를 검증한다.
- controller는 application service 호출까지만 확인한다.

## 4. 외부 서비스

자동 테스트는 기본적으로 아래 외부 서비스를 호출하지 않는다.

- OpenAI
- OCR provider
- Google Calendar
- email/browser push

실제 Provider 확인은 명시적인 smoke job 또는 수동 production-safe 체크로 제한한다.

## 5. CI 방향

Backend 테스트는 `BE`에서 실행한다.

루트 공용 package script나 workspace는 만들지 않는다.

## 5A. 2026-07-10 검증 상태

2026-07-10 기준 Backend 검증 상태는 다음이다.

- `pnpm typecheck` 통과.
- `pnpm lint` 통과.
- `pnpm test` 통과. 17 suites / 82 tests passed.
- `pnpm build` 통과.
- 실제 로컬 HTTP smoke로 `GET /api/health` 200, 보호 API 인증 없음 401, 잘못된 token 401, 존재하지 않는 route 404를 확인했다.
- BE 자동 테스트 기준으로 controller status 계약, validation 400, DTO whitelist, enum/date 검증, pagination/filter 변환, AdminGuard 403, 휴지통 복구 conflict를 확인했다.

남은 Backend/운영 품질 확인은 다중 계정 데이터 격리 QA, 삭제된 리소스 직접 접근 정책 확인, 동시 저장 중복 방지, Prisma generate/migration/seed 운영 정합성 정리다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
