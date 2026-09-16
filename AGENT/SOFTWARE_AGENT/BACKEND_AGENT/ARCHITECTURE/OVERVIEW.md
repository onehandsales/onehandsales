# Backend Overview

Backend는 NestJS module 구조와 Prisma repository를 사용한다. 현재 활성 범위는 인증/세션, 사용자 프로필, 지원 접수, 공개 문의, 관리자 권한 확인이다.

후속 CRM Core는 고정형 고객사/상품/딜 모듈을 복구하지 않고 Workspace/Kit/Record 기반 module로 별도 설계한다.

## Module 범위

- AuthModule
- UserModule
- ErrorReportModule
- SupportRequestModule
- PublicContactRequestModule
- HealthModule

관리자 확인 API는 별도 AdminModule이 아니라 AuthModule의 `GET /admin/api/me` controller로 제공한다.

## 공통 정책

- 모든 업무 API는 `AuthGuard` 이후 current user를 사용한다.
- 관리자 권한 확인은 `AdminGuard`와 `PlatformRole.ADMIN`을 사용한다.
- Prisma transaction은 다중 row 변경이 필요한 생성/수정에 사용한다.
- 단일 서버 안에서도 module 경계는 미래 MSA service 경계처럼 다루며, 다른 module의 Prisma repository 구현체를 직접 공유하지 않는다.
- 고정형 고객사/검색 모듈은 현재 연결되어 있지 않다.
- 후속 CRM Core module 후보는 `CRM_CORE_BACKEND.md`에서 draft로 관리한다.
