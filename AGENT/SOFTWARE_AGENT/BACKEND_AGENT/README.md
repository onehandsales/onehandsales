# BACKEND_AGENT

## 1. 목적

`BACKEND_AGENT`는 Backend 구현 방향과 엔지니어링 기준을 책임지는 문서 영역이다.

Backend 아키텍처, API 명세 작성 규칙, API 계약, transaction, observability, DB 접근 기준, 계층 구조, 테스트, 배포, 보안, 주석/로깅 규칙은 이 폴더를 기준으로 판단한다.

## 2. 관리 범위

- NestJS Backend 아키텍처
- User API와 Admin API 분리
- Clean Architecture와 DDD 계층 규칙
- API 명세와 API 계약 작성 기준
- Transaction 경계와 rollback 기준
- Structured log와 audit log 기준
- Backend 코드 컨벤션
- Backend 주석/로깅 규칙
- Backend 테스트 전략
- Backend 배포 환경
- Backend 기술 결정 기록

## 3. 폴더 구조

```text
BACKEND_AGENT/
  README.md
  ENGINEERING_REVIEW_CHECKLIST.md
  ARCHITECTURE/
  CONVENTION/
  DECISIONS/
```

## 4. 우선 확인 문서

1. `ARCHITECTURE/OVERVIEW.md`
2. `ARCHITECTURE/BACKEND.md`
3. `ARCHITECTURE/TESTING.md`
4. `ARCHITECTURE/DEPLOYMENT.md`
5. `CONVENTION/BACKEND.md`
6. `CONVENTION/API_SPEC.md`
7. `CONVENTION/API_CONTRACT.md`
8. `CONVENTION/TRANSACTION.md`
9. `CONVENTION/OBSERVABILITY.md`
10. `CONVENTION/COMMENT_AND_LOGGING.md`
11. `ENGINEERING_REVIEW_CHECKLIST.md`

## 5. 작업 원칙

- PM 범위와 UX 흐름을 먼저 확인한 뒤 Backend 구현 구조를 정한다.
- User API와 Admin API는 반드시 분리한다.
- 사용자 소유 데이터는 항상 `userId`로 필터링한다.
- Domain layer는 NestJS, Prisma, OpenAI, HTTP SDK를 몰라야 한다.
- 외부 Provider는 Backend port/interface 뒤에 둔다.
- transaction 경계는 application layer에 둔다.
- 새 API를 구현하기 전 `COMMON/API-SPEC`의 API 계약, transaction, observability 항목을 확인한다.
- mutation, Admin API, 민감정보, 외부 Provider가 포함되면 audit log와 structured log 필요 여부를 명시한다.

## 6. 현재 완료된 Backend TODO

Snapshot date: 2026-06-25

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/BE-TODO/G01-G12`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/BE-TODO/G01-BE-MEETING-NOTE-AI-STT-DRAFT.goal.md`

Current additional backend scope:

- Company/Contact/Product/Deal 본문 삭제 API는 soft delete로 구현되어 있다. 삭제 시 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정하고 실제 row는 삭제하지 않는다.
- Trash API는 Company/Contact/Product/Deal 본문 데이터와 지원 로그의 목록, 상세, 7일 이내 복구를 제공한다.

## 7. 현재 주요 미구현 Backend 범위

- BusinessCard OCR
- generic Import/Export job
- Notification
- Admin 운영 조회/감사/민감 원문 API
- MeetingNote 삭제/복구/Admin API
- 범용 DealActivity table

## 8. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
