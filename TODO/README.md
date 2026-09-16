# TODO

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales`의 기획 또는 구현 계획을 `/goal`로 실행 가능한 작업 단위로 정리하는 공간이다.

`AGENT` 문서가 제품 범위, UX/UI 방향, Software 아키텍처의 정본이라면, `TODO` 문서는 특정 요구사항을 실제 실행 순서, API 계약, FE/BE 작업, DB 영향, 검증 기준으로 쪼갠 실행 문서다.

구현 중 새로운 제품, UX/UI, Software 결정이 생기면 먼저 관련 역할의 `AGENT/*/DECISIONS` 또는 정본 문서에 확정 내용을 남긴 뒤 해당 TODO 문서에 반영한다.

## 2. 현재 상태

검토 기준일: 2026-09-08

현재 `TODO` 바로 아래에는 활성 계획 폴더가 없다.

```text
TODO/
  README.md
  DONE/
    README.md
    <완료 보관 계획>
```

따라서 활성 TODO 전체를 재검토할 때는 `TODO/DONE/**`을 제외하면 검토할 활성 계획 문서가 없다. 새 요구사항, QA 후속 조치, 결함 수정, API-SPEC 보강, UX/UI 개선, Paddle/Billing 착수는 `TODO` 바로 아래에 새 계획 폴더를 만든 뒤 진행한다.

완료된 계획의 구현 결과나 과거 의사결정 근거가 필요할 때만 `TODO/DONE/<PLAN_NAME>`을 참고한다. 완료 보관 문서는 현재 남은 작업 목록이 아니며, 후속 구현이 필요하면 완료 문서를 직접 수정하지 않고 새 활성 계획으로 승격한다.

## 3. 폴더 구조 기준

새 활성 계획 폴더는 다음 구조를 기본으로 둔다.

```text
TODO/
  <PLAN_NAME>/
    README.md
    COMMON/
      README.md
      USER-FLOW.md
      GOAL-WORK-ORDER.md
      PLANNING-REVIEW.md
      API-SPEC/
        README.md
      GOAL-SPECS/
        README.md
    FE-TODO/
      README.md
      USER-WEB-TODO.md
      ADMIN-WEB-TODO.md
    BE-TODO/
      README.md
      API-TODO.md
      DB-SCHEMA.md
  DONE/
    README.md
```

계획 성격에 따라 필요 없는 파일은 생략할 수 있지만, FE와 BE가 함께 봐야 하는 사용자 흐름, API 계약, goal 순서, 기획 검토 결과는 `COMMON`에 둔다.

계획 폴더명은 목적이 드러나게 대문자와 `_PLAN` 접미사를 사용한다.

예:

- `SERVICE_QA_PLAN`
- `PUBLIC_CONTACT_REQUEST_PLAN`
- `PADDLE_PLAN`

## 4. 작성 기준

- 모든 TODO 문서는 한국어로 작성한다.
- `TODO` 아래 문서를 새로 작성하거나 수정하기 전에는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 정본 문서를 먼저 참고한다.
- TODO 문서에는 `AGENT/SOFTWARE_AGENT`의 Backend, Frontend, Admin, API 계약, DB schema, 테스트, 배포, 주석/로그 규칙 중 해당 작업에 영향을 주는 기준을 구체적으로 반영한다.
- 화면 설계, route, navigation, 목록, 상세, 생성, 검색, 필터, pagination, record 관계에 영향을 주는 작업은 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 함께 적용한다.
- TODO 문서는 단순 메모가 아니라 구현자가 문서만 보고 첫 `/goal`을 실행할 수 있는 실행 계획서 수준으로 작성한다.
- `GOAL-WORK-ORDER.md`의 각 작업은 목적, 포함 범위, 제외 범위, 완료 기준을 포함한다.
- 한 번의 `/goal`에는 하나의 작업 단위만 넣는 것을 기본으로 한다.
- API가 포함된 goal은 구현 전에 API 계약 상태를 최소 `confirmed`로 만들고, request, response, 내부 비즈니스 로직, DB 연결, transaction, observability, 에러 응답, FE/BE 처리 기준을 채운다.
- 확정되지 않은 항목은 완료된 계획처럼 쓰지 않고 `Question`, `보류`, 또는 선행 `/goal` 결정 작업으로 분리한다.
- 루트에는 `package.json`과 workspace 설정을 만들지 않는다.
- User Web과 Admin Web은 코드를 공유하지 않는다.
- Backend는 하나의 NestJS 서버에서 User API `/api/*`와 Admin API `/admin/api/*`를 분리한다.

## 5. 활성 TODO 처리 규칙

활성 TODO 전체를 재검토할 때는 `TODO/DONE/**`을 제외하고 현재 작업 가능한 계획 폴더만 대상으로 삼는다.

처리 기준:

- `TODO` 아래 Markdown 문서 목록을 수집하되 `TODO/DONE/**`은 제외한다.
- 각 활성 계획의 `README.md`, `COMMON/API-SPEC/*`, `COMMON/GOAL-SPECS/*`, `COMMON/GOAL-WORK-ORDER.md`, `FE-TODO/*`, `BE-TODO/*`를 함께 본다.
- Backend API 구현 여부를 묻는 경우 실제 Backend controller, application service, repository, Prisma schema와 API 계약 문서를 대조한다.
- API 명세는 request 형태, response 형태, 내부 비즈니스 로직, 연결 DB, transaction, observability, 에러 응답, FE/BE 처리 기준이 있는지 확인한다.
- Frontend 남은 작업은 화면 목적, 사용 API, 상태 관리, 검색/필터/페이지네이션/다운로드, loading/empty/error/success 처리 기준으로 정리한다.
- 재검토 결과에는 검토 기준일, 검토 대상, Backend API 구현 근거, API 계약 상태와 실제 구현 상태의 일치 여부, Frontend 남은 작업 목적, 문서 링크 오류와 상태 불일치를 남긴다.
- 현재처럼 활성 계획이 없으면 새 작업을 위해 `TODO/<PLAN_NAME>`을 먼저 만들거나, 사용자가 지정한 새 요구사항을 계획 폴더로 작성한다.

## 6. 현재 우선순위

현재 즉시 실행 가능한 활성 계획은 없다.

다음 작업이 생기면 아래 순서로 판단한다.

1. S0/S1/S2 결함, 보안, ownership, 데이터 손상 위험을 최우선으로 새 계획화한다.
2. Global B2C 01~11 완료 범위의 유지보수와 UX/UI 상품성 개선을 우선한다.
3. 결제창 없는 100명 베타 준비, 실제 QA 결과, 운영 리스크를 별도 활성 계획으로 분리한다.
4. Paddle/Billing은 베타 이후 가격, 플랜, entitlement, AI 사용량 제한, 환불, 세금, 인보이스 정책이 확정된 뒤 `PADDLE_PLAN` 같은 새 활성 계획으로 작성한다.

Paddle/Billing은 현재 Prisma schema와 BE/FE 구현 범위에 포함하지 않는다. checkout, webhook, subscription, invoice, refund, entitlement, paywall, Billing Admin은 새 계획이 `confirmed`가 되기 전에는 구현하지 않는다.

## 7. 완료 보관 목록

현재 완료 보관 폴더와 단일 문서는 다음과 같다.

- `ACCOUNT_SETTINGS_MODAL_PLAN`: 계정 설정 모달 이관, `/app/settings` 사용자-facing route 제거, `/app?account=settings` modal-open 흐름 정리
- `ADDITIONAL_WORK_PLAN`: count, linked list, xlsx export, dealCount, product dealCount sort 추가 유지보수 범위
- `API_SPEC_TEMPLATE_NORMALIZATION_PLAN`: API-SPEC 템플릿 정규화 G01~G06과 G99 최종 검토
- `AUTH_FE_INTEGRATION_PLAN`: Auth/User Backend API와 User/Admin Web 인증/설정 FE 연동
- `BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`: Backend Agent rule recheck 완료 포인터 문서
- `BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN`: Backend Agent rule recheck G01~G08과 G99 최종 검토
- `BEFORE_12_TASKS`: 12번 전 선행 closeout, provider smoke, 모바일 체크리스트, route architecture, Admin checklist 정리
- `BUSINESS_CARD_OCR_PLAN`: BusinessCard OCR Backend API, `BusinessCardScanLog`, User Web 명함 스캔 화면
- `COMPANY_DOMAIN_PLAN`: Company Backend API와 User Web 회사 목록/생성/분야/지역/export 화면
- `CONTACT_DOMAIN_PLAN`: Contact Backend API와 User Web 담당자 목록/상세/메모/export 화면
- `DEAL_DOMAIN_PLAN`: Deal Backend API와 User Web 딜 목록/상세/로그/export 화면
- `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`: Global B2C 01~11 기능 선구현 로드맵과 closeout
- `IMPORT_TEMPLATE_PLAN`: 회사/담당자/제품/딜 불러오기 템플릿 구현
- `INTEGRATED_SEARCH_PLAN`: Backend `GET /api/search`와 User Web GlobalSearch 연결
- `MEETING_NOTE_AI_STT_PLAN`: MeetingNote AI/STT 초안 Backend API와 User Web draft UI
- `MEETING_NOTE_MANUAL_PLAN`: MeetingNote 수동 Backend API와 User Web 회의록 목록/상세/생성/수정 화면
- `MVP-STARTER_PLAN`: G00-G36 MVP starter 계획과 공통 계약 문서
- `NEXT_BACKEND_API_BACKLOG_PLAN`: 다음 Backend API backlog 후보 정리와 이관
- `ONBOARDING_JOB_SELECTION_PLAN`: 첫 로그인 직업 선택 온보딩 완료와 OWNER Workspace bootstrap
- `PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`: presentation repository port 타입 의존 정리
- `PRODUCT_DOMAIN_PLAN`: Product Backend API와 User Web 제품 목록/상세/메모/export 화면
- `PUBLIC_CONTACT_REQUEST_PLAN`: 공개 문의 요청 API 계약과 구현 범위
- `SCHEDULE_DOMAIN_PLAN`: Schedule Backend API와 User Web 월간/주간 일정, 생성/수정/삭제, 딜 연결
- `SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN`: BE/FE Software Agent 규칙 정합성 점검과 보완
- `USER_TIMEZONE_FOUNDATION_PLAN`: User timezone DB/API와 User Web timezone 설정 기반
- `USER_WEB_PRODUCTIZATION_GAP_PLAN`: User Web 상품성 gap 분석과 구현 가이드
- `USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`: 출시 전 follow-up QA, 모바일/브라우저/보안/DB/bugfix closeout
- `USER_WEB_UXUI_COMMON_QA_PLAN`: User Web UX/UI 공통 QA G01~G06
- `UX Design`: 과거 UX Design 보조 산출물 보관

완료 보관 폴더 안의 문서는 후속 작업의 근거로 참고할 수 있지만, 현재 작업 가능 상태를 의미하지 않는다.

## 8. 완료 처리 규칙

작업 또는 계획이 전부 완료되면 다음 규칙을 따른다.

1. 해당 `/goal` 또는 계획의 구현, 검증, 검토가 끝났고 필요한 경우 `TODO_LOG`에 완료 기록이 남아 있어야 한다.
2. 개별 goal 폴더가 독립적으로 존재하면 `TODO/DONE/<PLAN_NAME>/<GOAL_KEY>_<TASK_NAME>`으로 옮긴다.
3. goal 문서가 공통 계약과 한 폴더에 묶여 있고 계획 전체가 완료된 경우에는 계획 폴더 전체를 `TODO/DONE/<PLAN_NAME>`으로 옮긴다.
4. 이동 후 활성 TODO 문서, 다음 계획 문서, 관련 AGENT 참조가 예전 경로를 가리키지 않도록 갱신한다.
5. `TODO_LOG`는 날짜별 실제 작업 이력으로 유지한다.
6. 완료 보관 폴더는 후속 작업의 정본이 아니라 완료 이력이다. 새 요구사항이나 후속 구현은 활성 계획 폴더에 새로 작성한다.

완료 판단 기준:

- 요구 범위가 구현됐다.
- 관련 자동 검증 또는 수동 검증 결과가 기록됐다.
- 남은 항목이 있더라도 후속 계획으로 명시적으로 분리됐다.
- 다음 작업자가 활성 TODO와 완료 TODO를 혼동하지 않는다.

## 9. 관련 정본 문서

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/030_global_b2c_closeout_and_paddle_defer.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_01_11_FEATURE_CATALOG.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `TODO/DONE/README.md`
