# BACKEND_AGENT

## 1. 목적

`BACKEND_AGENT`는 Backend 구현 방향과 품질 기준을 책임지는 문서 영역이다.

Backend의 아키텍처, API 명세 작성 규칙, API 계약, transaction, 관측성, DB 접근 기준, 계층 구조, 테스트, 배포, 보안, 주석과 로깅 규칙은 이 폴더를 기준으로 판단한다.

## 2. 관리 범위

- NestJS Backend 아키텍처
- User API와 Admin API 분리
- Clean Architecture와 DDD 계층 규칙
- API 명세 작성 규칙
- API 계약 작성과 goal 실행 기준
- Transaction 경계와 rollback 기준
- Backend 관측성, structured log, audit log 기준
- Backend 코드 컨벤션
- Backend 주석과 로깅 규칙
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

## 5. 협업 원칙

- PM 범위와 UX 흐름을 먼저 확인한 뒤 Backend 구현 구조를 확정한다.
- User API와 Admin API는 반드시 분리한다.
- 사용자 소유 데이터는 항상 `userId`로 필터링한다.
- Domain layer는 NestJS, Prisma, OpenAI, HTTP SDK를 몰라야 한다.
- 외부 Provider는 Backend port/interface 뒤에 둔다.
- transaction 경계는 application layer에 둔다.
- 새 API를 구현하기 전에는 `COMMON/API-SPEC`의 API 계약 상태, transaction, observability 항목을 확인한다.
- mutation, Admin API, 민감정보, 외부 Provider가 포함되면 audit log와 structured log 필요 여부를 명시한다.

## 6. 현재 완료된 Backend TODO

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`: 완료. Auth/User API와 User/Auth DB 기준이 구현 및 검증됐다.
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`: 완료. Company DB/API, transaction, observability, request id, private memo 암호화 기준이 구현 및 검증됐다.
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`: 완료. Contact DB/API, company ownership, transaction, observability, request id, private memo 암호화 기준이 구현 및 검증됐다.
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`: 완료. Product DB/API, product category/status, memo, private memo, xlsx export 기준이 구현 및 검증됐다.
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`: 완료. Deal DB/API, deal-product 연결, 다음 행동 로그, 메모 로그, xlsx export 기준이 구현 및 검증됐다.
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`: 완료. Schedule DB/API, ScheduleDeal 연결, hard delete, timezone range 계산 기준이 구현 및 검증됐다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
