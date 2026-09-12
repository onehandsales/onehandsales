# Backend Agent

## 1. 목적

Backend Agent는 NestJS, Prisma, Supabase 연동, 인증/사용자, 지원 접수, 공개 문의, 관리자 권한 확인의 구현 기준을 관리한다.

후속 CRM Core는 고정형 Company/Product/Deal module 복구가 아니라 Workspace/Kit/Record 기반 module로 별도 설계한다.

## 2. 현재 활성 모듈

- `auth`
- `user`
- `error-report`
- `support-request`
- `public-contact-request`
- `health`

관리자 확인은 `auth` 모듈의 `GET /admin/api/me` controller로 유지한다.

## 3. 비활성 범위

현재 활성 Backend 모듈이 아니다.

- 고정형 고객사/담당자/상품/딜
- 고정형 검색
- xlsx export
- analytics
- billing/subscription
- Team 권한

## 4. 후속 CRM Core

후속 Backend 설계는 `ARCHITECTURE/CRM_CORE_BACKEND.md`를 따른다.

후보 module:

- `workspace`
- `kit`
- `crm-core`
- `record`

실제 구현 전에는 PM의 첫 Kit 결정, UXUI flow, DB schema draft, API 계약이 필요하다.

## 5. 검증

- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
