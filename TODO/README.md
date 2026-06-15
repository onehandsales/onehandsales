# TODO

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales`의 구현 계획별 실행 작업 목록을 정리한다.

`AGENT` 문서가 제품과 아키텍처의 정본이라면, `TODO` 문서는 특정 기획 또는 구현 계획을 실제 작업 단위로 쪼개는 실행 문서다. 구현 중 새로운 결정이 생기면 먼저 관련 역할의 `DECISIONS`에 확정 내용을 남기고, 그 결과를 해당 계획 폴더의 TODO 문서에 반영한다.

## 2. 폴더 구조

```text
TODO/
  README.md
  ACTIVE_BACKEND_API_FE_REVIEW.md
  DONE/
    README.md
    ADDITIONAL_WORK_PLAN/
    AUTH_FE_INTEGRATION_PLAN/
    COMPANY_DOMAIN_PLAN/
    CONTACT_DOMAIN_PLAN/
    PRODUCT_DOMAIN_PLAN/
    DEAL_DOMAIN_PLAN/
    SCHEDULE_DOMAIN_PLAN/
    MEETING_NOTE_MANUAL_PLAN/
    MVP-STARTER_PLAN/
      README.md
      COMMON/
      FE-TODO/
      BE-TODO/
```

`TODO` 바로 아래에는 아직 진행 중이거나 다음에 실행할 기획/구현 계획 폴더를 둔다. 완료된 계획은 `TODO/DONE` 아래로 옮긴다.

`ADDITIONAL_WORK_PLAN`에는 기존 활성 계획에 속하지 않는 추가 유지보수 요청을 모은다. 현재 구현 완료된 `ADDITIONAL_WORK_PLAN`은 `TODO/DONE/ADDITIONAL_WORK_PLAN`에 보관한다.

활성 계획 폴더 안에서는 필요에 따라 다음 구조를 사용한다.

```text
<PLAN_NAME>/
    README.md
    COMMON/
      README.md
      USER-FLOW.md
      GOAL-WORK-ORDER.md
      PLANNING-REVIEW.md
      API-SPEC/
      GOAL-SPECS/
    FE-TODO/
      README.md
      USER-WEB-TODO.md
      ADMIN-WEB-TODO.md
    BE-TODO/
      README.md
      API-TODO.md
      DB-SCHEMA.md
```

계획 폴더 안에서 `COMMON`, `FE-TODO`, `BE-TODO`처럼 공통 계약과 작업 영역을 나눈다.

예:

- `MVP-STARTER_PLAN`: MVP 구현 시작을 위한 전체 작업 계획. 현재는 `TODO/DONE/MVP-STARTER_PLAN`에 보관한다.
- `IMPORT_EXPORT_PLAN`: Import/Export 기능 상세 구현 계획
- `PAYMENT_MANUAL_PLAN`: 계좌이체 수동 결제 관리 구현 계획

## 3. 작업 기준

- 모든 문서는 한국어로 작성한다.
- `TODO` 아래 문서를 새로 작성하거나 수정하기 전에는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한다.
- TODO 문서에는 `AGENT/SOFTWARE_AGENT`의 Backend, Frontend, Admin, API 명세, DB schema, 테스트, 배포, 주석/로그 규칙 중 해당 작업에 영향을 주는 기준을 구체적으로 반영한다.
- `TODO` 바로 아래에는 작업 주제별 계획 폴더를 만든다.
- 각 계획 폴더 안에는 `COMMON`, `FE-TODO`, `BE-TODO`, `README.md`를 둔다.
- FE와 BE가 함께 봐야 하는 사용자 흐름, goal 작업 순서, API 명세, goal 상세 명세, 기획 검토 결과는 `COMMON`에 둔다.
- API 계약 문서에는 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, 에러 응답, FE/BE 처리 기준을 모두 상세하게 적는다.
- 요청값은 path param, query, header, body, 필수 여부, validation 기준까지 적는다.
- 응답값은 success status, response body 유무, DTO 이름, 필드명, 타입, nullable 여부, 예시까지 적는다.
- 내부 비즈니스 로직은 인증, 권한, ownership, validation 이후 흐름, transaction, 외부 Provider 호출, 자동 생성 데이터, 암호화, 감사 로그, 에러 분기까지 적는다.
- 구현 순서는 MVP 핵심 루프를 우선한다.
- 외부 Provider 연동은 처음부터 직접 호출하지 않고, Backend port/interface 뒤에 숨긴다.
- User Web과 Admin Web은 코드를 공유하지 않는다.
- 루트에는 `package.json`과 workspace 설정을 만들지 않는다.
- Backend는 하나의 NestJS 서버로 시작하되 User API와 Admin API를 분리한다.
- 활성 TODO 전체를 재검토할 때는 `DONE`을 제외하고 `ACTIVE_BACKEND_API_FE_REVIEW.md`에 Backend API 구성 여부, API 명세 완성도, Frontend 남은 작업 목적을 기록한다.

## 4. 구현 우선순위

현재 활성 계획 상태:

- 2026-06-15 기준 활성 계획 폴더: 없음
- 새 요구사항이나 후속 구현은 `TODO` 바로 아래에 새 계획 폴더를 만든다.

활성 TODO 재검토 결과:

- `ACTIVE_BACKEND_API_FE_REVIEW.md`

진행 중인 계획:

- 없음

완료된 계획:

- `MEETING_NOTE_MANUAL_PLAN`: `TODO/DONE/MEETING_NOTE_MANUAL_PLAN`
- `SCHEDULE_DOMAIN_PLAN`: `TODO/DONE/SCHEDULE_DOMAIN_PLAN`
- `USER_TIMEZONE_FOUNDATION_PLAN`: `TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN`
- `MVP-STARTER_PLAN`: `TODO/DONE/MVP-STARTER_PLAN`
- `AUTH_FE_INTEGRATION_PLAN`: `TODO/DONE/AUTH_FE_INTEGRATION_PLAN`
- `COMPANY_DOMAIN_PLAN`: `TODO/DONE/COMPANY_DOMAIN_PLAN`
- `CONTACT_DOMAIN_PLAN`: `TODO/DONE/CONTACT_DOMAIN_PLAN`
- `PRODUCT_DOMAIN_PLAN`: `TODO/DONE/PRODUCT_DOMAIN_PLAN`
- `DEAL_DOMAIN_PLAN`: `TODO/DONE/DEAL_DOMAIN_PLAN`
- `ADDITIONAL_WORK_PLAN`: `TODO/DONE/ADDITIONAL_WORK_PLAN`

완료된 계획의 구현 결과를 참조해야 할 때는 `TODO/DONE/<PLAN_NAME>`을 본다. 새 작업을 시작할 때는 완료된 계획을 직접 수정하지 않고, 활성 계획 폴더를 새로 만들거나 현재 활성 계획을 실행 가능한 `/goal` 문서로 확장한다.

## 5. 완료 처리 규칙

작업 또는 계획이 전부 완료되면 다음 규칙을 따른다.

1. 해당 `/goal` 또는 계획의 구현, 검증, 검토가 끝났고 `TODO_LOG`에 완료 기록이 남아 있어야 한다.
2. 개별 goal 폴더가 독립적으로 존재하면 `TODO/DONE/<PLAN_NAME>/<GOAL_KEY>_<TASK_NAME>`으로 옮긴다.
3. goal 문서가 공통 계약과 한 폴더에 묶여 있고 계획 전체가 완료된 경우에는 계획 폴더 전체를 `TODO/DONE/<PLAN_NAME>`으로 옮긴다.
4. 이동 후 활성 TODO 문서, 다음 계획 문서, 관련 AGENT 참조가 예전 경로를 가리키지 않도록 갱신한다.
5. `TODO_LOG`는 이동하지 않는다. `TODO_LOG`는 날짜별 실제 작업 이력으로 유지한다.
6. 완료 보관 폴더는 후속 작업의 정본이 아니라 완료 이력이다. 새 요구사항이나 후속 구현은 활성 계획 폴더에 새로 작성한다.

완료 판단 기준:

- 요구 범위가 구현됐다.
- 관련 자동 검증 또는 수동 검증 결과가 기록됐다.
- 남은 항목이 있더라도 후속 계획으로 명시적으로 분리됐다.
- 다음 작업자가 활성 TODO와 완료 TODO를 혼동하지 않는다.

## 6. MVP Starter 완료 범위

`TODO/DONE/MVP-STARTER_PLAN`의 구현 우선순위는 다음이었다.

1. 프로젝트 스캐폴딩
2. DB 스키마와 Prisma 설정
3. 인증과 사용자 데이터 분리
4. 회사/거래처(담당자)/제품 CRUD
5. 딜 CRUD와 딜 활동 로그
6. 일정 CRUD, 월간 일정 화면, 주간 일정 보고서
7. 회의록 저장과 딜 연결
8. 명함 OCR, Import/Export, 알림
9. Admin Web 기본 조회와 민감정보 감사 흐름
10. Playwright E2E와 Backend 위험 흐름 테스트

## 7. 관련 정본 문서

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
