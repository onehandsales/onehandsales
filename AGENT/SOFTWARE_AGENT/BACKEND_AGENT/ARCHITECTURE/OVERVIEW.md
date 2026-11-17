# Backend Overview

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

NestJS 단일 서버의 modular monolith이며 Prisma repository와 Clean Architecture 계층을 사용한다.

## 현재 모듈

auth, user, workspace, object-definition, list-definition, view-definition, attribute-definition, record-definition, error-report, support-request, public-contact-request, health.

Workspace는 관련 module의 import를 통해 연결된다. 관리자 확인은 Auth의 `GET /admin/api/me`이며 별도 AdminModule 전체가 존재하는 것은 아니다.

## 정책

업무 API는 인증과 Workspace 접근을 확인한다. 공개 문의는 비로그인 접수다. application이 트랜잭션과 권한을 소유하고 module 간 협력은 공개 port로 수행한다.

현재 API는 [API_SAMPLE](../../COMMON/API_SAMPLE.md), Bonsai 목표 경계는 [CRM_CORE_BACKEND](CRM_CORE_BACKEND.md), 기술 원칙은 [BACKEND](BACKEND.md)를 따른다.
