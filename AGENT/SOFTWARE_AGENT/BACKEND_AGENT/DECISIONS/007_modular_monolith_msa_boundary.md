# 007. Modular Monolith / Future MSA Boundary

Status: Accepted
Date: 2026-09-16

## 1. 배경

현재 Backend는 단일 NestJS 서버와 하나의 Prisma schema를 사용한다.

서비스가 커지면 일부 domain은 별도 service로 분리될 수 있다. 그러나 지금 MSA를 먼저 도입하면 배포, transaction, 운영 복잡도가 제품 속도보다 커진다.

따라서 현재는 modular monolith를 유지하되, module 경계를 미래 MSA service 경계처럼 다루기로 한다.

## 2. 결정

- Backend runtime은 단일 NestJS 서버로 유지한다.
- module은 `domain/application/infrastructure/presentation` 경계를 따른다.
- 다른 module의 Prisma repository 구현체를 직접 import하거나 주입받지 않는다.
- module 간 협력은 owning module의 application port, query port, use case facade로 표현한다.
- transaction은 기본적으로 한 module ownership 안에서 끝낸다.
- 여러 module의 상태 변경이 필요한 흐름은 orchestration owner를 먼저 정한다.
- future MSA 분리 가능성이 있는 mutation은 idempotency와 outbox 필요 여부를 API 계약에 남긴다.
- Supabase는 Backend core가 아니라 infrastructure adapter로 다룬다.

## 3. 이유

- 단일 서버의 개발 속도를 유지하면서도 나중에 service 분리 비용을 낮춘다.
- Prisma repository 공유로 module 경계가 무너지는 것을 막는다.
- application/domain 계층을 Prisma, Supabase, Nest HTTP 세부 구현으로부터 보호한다.
- distributed transaction을 전제로 하지 않는 구조를 초기에 습관화한다.

## 4. 적용 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
