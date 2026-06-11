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

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
