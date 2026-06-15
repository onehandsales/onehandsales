# Backend 아키텍처 개요

## 1. Backend 위치

Backend는 저장소의 `BE` 아래에 둔다.

```text
BE/
```

MVP Backend는 단일 NestJS 서버이며 하나의 배포 단위다. 단, User API와 Admin API는 경로, controller, guard, application method 기준으로 분리한다.

## 2. 기술 기준

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

현재 코드 기준:

- Node.js engine: `>=24 <25`
- package manager: `pnpm@8.14.1`
- NestJS 11
- Prisma 6
- TypeScript 5.7
- 테스트: Jest

현재 Backend package script:

- `pnpm run build`
- `pnpm run start:dev`
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run test`
- `pnpm run prisma:generate`
- `pnpm run prisma:migrate`
- `pnpm run prisma:migrate:deploy`
- `pnpm run prisma:validate`

## 3. API 분리

- User API: `/api/*`
- Admin API: `/admin/api/*`

Admin API는 AuthGuard와 AdminGuard를 모두 통과해야 한다.

User API는 현재 사용자 본인 데이터만 다룬다. 모든 사용자 소유 데이터 조회와 mutation은 `userId` ownership 필터를 가져야 한다.

현재 `BE/src/app.module.ts`에 등록된 구현 모듈:

- `HealthModule`
- `AuthModule`
- `UserModule`
- `CompanyModule`
- `ContactModule`
- `ProductModule`
- `DealModule`
- `ScheduleModule`
- `MeetingNoteModule`

Admin API는 현재 `GET /admin/api/me`만 구현되어 있다. Admin Web이 호출하는 대시보드, 사용자 목록, 회사/거래처/제품/딜 조회용 `/admin/api/*` 엔드포인트는 아직 Backend에 없다.

## 4. 계층 구조

각 Backend 비즈니스 모듈은 다음 네 계층을 사용한다.

```text
src/modules/<module>/
  domain/
  application/
  infrastructure/
  presentation/
```

Domain 계층은 NestJS, Prisma, HTTP client, OpenAI SDK 같은 외부 의존성을 import하지 않는다.

Application 계층은 use case를 조율하고 transaction 경계를 가진다.

Infrastructure 계층은 Prisma repository와 외부 provider adapter를 구현한다.

Presentation 계층은 controller, DTO, guard, response mapper를 포함한다.

## 5. 외부 Provider

OpenAI, Google Calendar, email, browser push, file parser 같은 외부 Provider는 Backend port/interface 뒤에 둔다.

Provider-specific prompt, response parsing, SDK 호출은 infrastructure adapter에서만 처리한다.

## 6. 데이터 보호

Admin에서는 민감 데이터가 기본 마스킹된다.

민감 데이터 원문 접근에는 다음이 필요하다.

- 명시적 액션
- 사유 입력
- 감사 로그

민감 데이터:

- Memo 기록
- 회의록 본문
- 딜 금액
- 사용자가 민감 표시한 데이터

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
