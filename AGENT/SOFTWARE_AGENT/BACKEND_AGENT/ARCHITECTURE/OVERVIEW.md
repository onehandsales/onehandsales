# Backend Architecture Overview

## 1. 위치

Backend는 저장소의 `BE` 아래에 있다.

```text
BE/
```

MVP Backend는 단일 NestJS 서버이며 하나의 배포 단위다. User API와 관리자 권한 확인 API는 경로, controller, guard 기준으로 분리한다.

## 2. 기술 기준

- Node.js engine: `>=24 <25`
- package manager: `pnpm@8.14.1`
- NestJS 11
- Prisma 6
- Supabase/PostgreSQL
- TypeScript 5.7
- Jest
- DDD
- Clean Architecture
- Modular Monolith

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
- 관리자 권한 확인 API: `GET /admin/api/me`

관리자 권한 확인 API는 AuthGuard와 AdminGuard를 모두 통과해야 한다. User API는 현재 사용자 본인 데이터만 다루며 모든 사용자 소유 데이터 조회와 mutation은 `userId` ownership 필터를 가진다.

현재 `BE/src/app.module.ts`에 등록된 구현 모듈:

- `HealthModule`
- `AnalyticsModule`
- `AuthModule`
- `UserModule`
- `CompanyModule`
- `ContactModule`
- `ProductModule`
- `DealModule`
- `ErrorReportModule`
- `FollowUpModule`
- `ScheduleModule`
- `SalesReportModule`
- `MeetingNoteModule`
- `SearchModule`
- `SupportRequestModule`
- `TrashModule`


## 4. 계층 구조

각 Backend 비즈니스 모듈은 다음 네 계층을 사용한다.

```text
src/modules/<module>/
  domain/
  application/
  infrastructure/
  presentation/
```

- Domain: business rule, entity, value object, domain error, repository interface.
- Application: use case orchestration, permission check, transaction boundary, port call.
- Infrastructure: Prisma repository, provider adapter, mapper.
- Presentation: controller, DTO, guard, response mapper.

Domain 계층은 NestJS, Prisma, HTTP client, OpenAI SDK 같은 외부 의존성을 import하지 않는다.

## 5. 외부 Provider


현재 OpenAI 관련 구현 상태:

- MeetingNote text AI draft API 구현. AI 초안 생성은 `MeetingNoteAiDraftProvider` port 뒤에 두고 현재 adapter는 OpenAI다.
- MeetingNote STT+AI draft API 구현. STT는 `MeetingNoteSttProvider` port로 AI provider와 분리되어 있으며 현재 adapter는 OpenAI transcription이다.
- MeetingNote next action/follow-up draft와 `AiProviderCallLog` provider observability foundation이 구현되어 있다.
- AI weekly sales report는 `SalesReportModule`에서 provider port 뒤에 두고 저장형 보고서와 suggestion foundation을 제공한다.

Provider-specific prompt, response parsing, SDK 호출은 infrastructure adapter에서만 처리한다.

## 6. 데이터 보호

민감 데이터 예:

- memo 기록
- meeting note 본문
- deal 금액
- 사용자가 민감하게 표시한 데이터
- private memo 원문

검색어 원문, provider prompt, transcript 원문은 structured log에 남기지 않는다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
