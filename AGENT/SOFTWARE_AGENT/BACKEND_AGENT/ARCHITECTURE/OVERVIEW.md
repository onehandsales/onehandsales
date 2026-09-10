# Backend Overview

Backend는 NestJS module 구조와 Prisma repository를 사용한다. 현재 활성 범위는 개인 사용자 소유 CRM 데이터, 인증/세션, 제품 분석, 지원 접수, 관리자 권한 확인이다.

## Module 범위

- AuthModule
- UserModule
- CompanyModule
- ContactModule
- ProductModule
- DealModule
- SearchModule
- TrashModule
- AnalyticsModule
- ErrorReportModule
- SupportRequestModule
- PublicContactRequestModule
- HealthModule
- AdminModule

## 공통 정책

- 모든 업무 API는 `AuthGuard` 이후 current user를 사용한다.
- 관리자 권한 확인은 `AdminGuard`와 `UserRole.ADMIN`을 사용한다.
- Prisma transaction은 다중 row 변경이 필요한 생성/수정/삭제에 사용한다.
- soft delete 대상은 휴지통 정책에 맞춰 복구 기간을 저장한다.
