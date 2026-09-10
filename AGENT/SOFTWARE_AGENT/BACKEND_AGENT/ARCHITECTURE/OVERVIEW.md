# Backend Overview

Backend는 NestJS module 구조와 Prisma repository를 사용한다. 현재 활성 범위는 개인 사용자 소유 회사 데이터, 인증/세션, 검색, 지원 접수, 관리자 권한 확인이다.

## Module 범위

- AuthModule
- UserModule
- CompanyModule
- SearchModule
- ErrorReportModule
- SupportRequestModule
- PublicContactRequestModule
- HealthModule

관리자 확인 API는 별도 AdminModule이 아니라 AuthModule의 `GET /admin/api/me` controller로 제공한다.

## 공통 정책

- 모든 업무 API는 `AuthGuard` 이후 current user를 사용한다.
- 관리자 권한 확인은 `AdminGuard`와 `UserRole.ADMIN`을 사용한다.
- Prisma transaction은 다중 row 변경이 필요한 생성/수정에 사용한다.
- Company 보조 로그와 복구 모듈은 현재 연결되어 있지 않다.
