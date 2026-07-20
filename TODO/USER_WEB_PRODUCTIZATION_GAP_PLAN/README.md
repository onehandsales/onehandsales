# User Web Productization Gap Plan

상태: Draft Guide
작성일: 2026-07-20
성격: 제품화 gap 판단 가이드

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales`의 최종 서비스 형태와 현재 구현 상태 사이의 차이를 정리한다.

이 문서는 `/goal` 실행 계획이 아니다. 바로 구현하거나 이슈를 닫기 위한 작업 순서가 아니라, 다음 구현 계획을 만들기 전에 제품 방향, UX/UI 완성도, 기능/운영 gap을 판단하기 위한 기준 문서다.

## 2. 먼저 확인한 범위

- `FE/user-web`: 실제 사용자 앱 라우트, feature, layout, API client 구조
- `FE/admin-web`: Admin route와 현재 redirect/placeholder 상태
- `BE`: NestJS module, controller/API path, Prisma schema 기준 구현 도메인
- `AGENT/PM_AGENT`: PRD, MVP scope, implementation status, Global B2C/Series A roadmap
- `AGENT/UXUI_AGENT`: UX/UI direction, user flow/screen list, Notion+Attio reference, UX writing guide
- `AGENT/SOFTWARE_AGENT`: Front/Backend architecture, API contract, DB schema 기준
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`

## 3. 현재 결론

현재 제품은 핵심 MVP 업무 기능이 상당히 구현되어 있다.

완료된 핵심 축:

- Auth/User
- Public/auth URL locale
- `/app` home dashboard
- Company
- Contact
- Product
- Deal
- Schedule
- MeetingNote
- BusinessCard OCR
- DataImport
- Search
- Trash
- Company/Contact/Product/Deal xlsx export

부족한 핵심 축:

- 제품화 수준의 최종 UX/UI 완성도 판단
- 글로벌 B2C 유료 판매를 위한 결제/구독, 세금/컴플라이언스, `/app` 다국어, Admin 운영, 제품 분석
- Series A급 리텐션/AI/모바일 현장 사용성
- Notification, ImportJob persistence, Admin 운영 API 같은 후속 기능의 우선순위 확정

## 4. 문서 구성

- `COMMON/FINAL-SERVICE-SHAPE.md`: 최종 서비스 단계별 기능 정의
- `COMMON/CURRENT-IMPLEMENTED-FUNCTIONS.md`: 현재 구현된 FE/BE 기능 표
- `COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`: 최종 형태와 현재 상태의 차이
- `FE-TODO/USER-WEB-PRODUCTIZATION-GUIDE.md`: User Web 화면/UX 관점 가이드
- `BE-TODO/BACKEND-PRODUCTIZATION-GUIDE.md`: Backend/API/DB/운영 관점 가이드

## 5. 사용 방법

새 기능을 구현하기 전에 이 가이드로 먼저 판단한다.

1. 최종 서비스 단계 중 어느 단계에 필요한 기능인지 확인한다.
2. 현재 구현 상태가 이미 충분한지 확인한다.
3. UX/UI만 보강하면 되는지, API/DB 계약이 필요한지 분리한다.
4. Backend/API가 필요하면 `COMMON/API-SPEC`이 있는 별도 TODO 계획을 만든다.
5. 실제 구현은 별도 `/goal` 문서로 쪼갠 뒤 진행한다.

## 6. 지금 바로 구현하지 않을 것

아래 항목은 이 가이드 작성만으로 바로 구현하지 않는다.

- Notification
- ImportJob persistence
- Admin 운영 API/화면
- 결제/구독
- 주간 영업 리포트
- 범용 DealActivity table
- MeetingNote transcript/provider log table
- page size 계약 변경
- Deal list products summary
- Contact list dealCount

위 항목은 제품화 우선순위와 UX/UI 방향을 확정한 뒤 별도 계획에서 다룬다.

## 7. 관련 문서

- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
