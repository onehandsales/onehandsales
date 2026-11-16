# TODO

> 2026-11-16 갱신: 현재 제품·UX 기준은 folk이며, 실행 순서는 [FOLK_TRANSITION_PLAN.md](FOLK_TRANSITION_PLAN.md)를 따른다.

## 1. 목적

이 폴더는 `OneHand CRM`의 기획 또는 구현 계획을 `/goal`로 실행 가능한 작업 단위로 정리하는 공간이다.

`AGENT` 문서가 제품 범위, UX/UI 방향, Software 아키텍처의 정본이라면, `TODO` 문서는 특정 요구사항을 실제 실행 순서, API 계약, FE/BE 작업, DB 영향, 검증 기준으로 쪼갠 실행 문서다.

구현 중 새로운 제품, UX/UI, Software 결정이 생기면 먼저 관련 역할의 `AGENT/*/DECISIONS` 또는 정본 문서에 확정 내용을 남긴 뒤 해당 TODO 문서에 반영한다.

## 2. 현재 상태

현재 제품·UX는 folk 기준이다. [현재 구현](../AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)에 Workspace, Object/List/Attribute/Record/View API와 TABLE/KANBAN/LIST, 보기 설정 미리보기·명시적 저장이 정리되어 있다. 과거 계획의 “본문·설정 저장 미구현” 상태를 최신 구현 상태로 사용하지 않는다.

현재 실행 계획은 [FOLK_TRANSITION_PLAN.md](FOLK_TRANSITION_PLAN.md)다. 다음 단계는 **G00: Nicelydone MCP 연결·folk 자료 접근 확인**이며, 화면 조사와 mock 프로토타입을 거쳐 해당 기능의 DB·API·권한을 설계한다. 기존 CRM 모델 교체는 대체 흐름과 데이터·의존 관계를 확인한 뒤 실행한다.

이 전환 계획은 사용자 요청에 따라 **한 Markdown 파일**에서 관리한다. 아래 폴더 구조는 일반적인 새 계획의 기본값이며, folk 전환 계획을 여러 폴더·문서로 자동 분리하는 근거로 적용하지 않는다.

완료 보관 문서는 당시 이력이며 현재 남은 작업 목록이 아니다. 기존 TODO 하위 계획과 과거 로그는 이번 정리에서 일괄 갱신하지 않았다.

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
- 화면 설계, route, navigation, 목록, 상세, 생성, 검색, 필터, pagination, record 관계에 영향을 주는 작업은 `AGENT/UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md`를 함께 적용한다.
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
- 새 작업은 `TODO/<PLAN_NAME>`에 목적과 계약을 기록하거나, 사용자가 지정한 새 요구사항을 계획 폴더로 작성한다.

## 6. 현재 우선순위

1. 현재 인증·Workspace·데이터 접근의 오류를 유지보수한다.
2. Nicelydone MCP의 folk 화면·flow를 조회하고 공식 문서·실제 계정과 대조한다.
3. 첫 흐름의 mock UX와 데이터 읽기·쓰기 요구를 정리한다.
4. 같은 흐름의 DB·API·권한·오류 계약을 확정한 뒤 BE·FE 구현과 통합 검증을 진행한다.
5. 기능별 대체를 검증한 뒤 기존 모델·API·FE 의존을 제거하고 전체 기능 대응을 확대한다.

상세 단계와 완료 기준은 [FOLK_TRANSITION_PLAN.md](FOLK_TRANSITION_PLAN.md)를 따른다. folk 설정·요금제 UX 조사는 범위에 포함하며, 실제 결제 제공자·사업 정책과 구현은 [결제 보류 정책](../AGENT/PM_AGENT/DECISIONS/030_billing_paddle_defer_policy.md)에 따라 별도 확정한다.

## 7. 완료 보관 목록

현재 완료 보관 폴더와 단일 문서는 다음과 같다.

- [VIEW_HEADER_EMPTY_REQUEST_FIX_PLAN](DONE/VIEW_HEADER_EMPTY_REQUEST_FIX_PLAN/README.md): 메뉴·즐겨찾기 입력 키 검증, 공통 EmptyRequestPipe와 주석 수정. 관련 103개 테스트·typecheck/lint/build 통과
- [VIEW_HEADER_MENU_QUERY_PLAN](DONE/VIEW_HEADER_MENU_QUERY_PLAN/README.md): 저장 필터·정렬·보기 설정 GET 3개, 공개 batch Port, 참조 무결성·규칙 검토 완료. 전체 64 suites / 462 tests와 격리 PostgreSQL 검증 통과
- [VIEW_HEADER_FRONTEND_INTEGRATION_PLAN](DONE/VIEW_HEADER_FRONTEND_INTEGRATION_PLAN/README.md): Object/List 공통 헤더·서버 View 목록/선택·읽기 별표·List 경로와 반응형/기존 기능 검증·G99 완료
- [OBJECT_LIST_VIEW_LIST_API_PLAN](DONE/OBJECT_LIST_VIEW_LIST_API_PLAN/README.md): Object/List 소속 View 목록 GET 두 개, 정렬·선택 표시·격리·정상 빈 목록·실제 DB 및 G99 검토 완료
- [VIEW_HEADER_DETAIL_API_PLAN](DONE/VIEW_HEADER_DETAIL_API_PLAN/README.md): Object/List 대상 기반 초기 View 헤더 GET, 개인 즐겨찾기 상태, View 없는 정상 상태와 Backend 검증·G99 완료
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
- `OBJECT_DEFINITION_CREATE_PLAN`: ObjectDefinition 생성 API 계약, Backend 생성 유스케이스, User Web 생성 연동, DB unique index 검증 완료
- `RECORD_DEFINITION_CREATE_PLAN`: RecordDefinition 빈 row 생성 API 계약과 Backend 생성 유스케이스 구현 완료
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
- `AGENT/PM_AGENT/DECISIONS/030_billing_paddle_defer_policy.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md`
- `AGENT/UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md`
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
