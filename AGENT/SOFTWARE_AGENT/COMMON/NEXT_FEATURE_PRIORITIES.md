# Software Next Feature Priorities

Status: Current Software Priority
Date: 2026-09-13

## 1. 목적

이 문서는 Software 관점의 다음 작업 우선순위를 정리한다.

제품 우선순위와 로드맵은 PM_AGENT 문서를 우선한다. 이 문서는 구현자가 어떤 순서로 기술 작업을 준비해야 하는지에 집중한다.

## 2. 현재 결론

현재 Software 우선순위는 아래 순서다.

1. foundation 유지보수와 S0/S1/S2 버그 수정
2. 문서와 실제 코드의 활성 범위 정합성 유지
3. 레거시 고정형 CRM 흔적 제거 또는 비활성 표시
4. 첫 Kit 확정 이후 CRM Core API/DB/FE 계약 설계
5. CRM Core 구현

결제, subscription, entitlement, Paddle은 현재 Software 착수 범위가 아니다. PM의 결제 정책과 confirmed TODO 계획이 생긴 뒤 시작한다.

## 3. 현재 활성 구현 유지보수

우선 지킬 기능:

- Auth/User
- Account settings
- Error report
- Support request
- Public contact request
- Health
- Admin authority check
- User Web `/app`, `/app/more`
- Admin Web `/login`, `/`

## 4. 레거시 정리 후보

문서 또는 코드에 남은 과거 고정형 CRM 흔적은 별도 정리 TODO로 다룬다.

후보:

- FE public/help copy의 company/contact/product/deal 표현
- 자리만 남은 `schedule`, `meeting-note`, `trash` feature folder
- Prisma `User` 모델에 남은 과거 회사 관련 주석
- 고정형 CRM redirect route 유지 여부

이 항목은 제품 정책과 연결되므로 PM/UXUI 확인 후 정리한다.

## 5. CRM Core 착수 조건

CRM Core 구현 전 필요한 조건:

- 첫 Kit 확정
- PM의 MVP scope 확인
- UXUI first use flow 확인
- DB schema draft 보완
- Backend API 계약 작성
- Frontend route/feature boundary 확정
- QA/E2E 범위 정의

## 6. 관련 문서

- `AGENT/PM_AGENT/PLANNING/ROADMAP.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/SOFTWARE_AGENT/COMMON/IMPLEMENTATION_BOUNDARY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md`
