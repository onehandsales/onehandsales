# folk 전환 문서 검토 기록

Date: 2026-11-15
Status: 문서 전환 검토 통과 — folk 화면·DB 구현 검증은 별도

> 2026-11-16 후속 정리: 사용자 요청으로 이전 참고 제품 표기와 UX 기준 문서의 파일명·본문·참조를 정리했다. 아래 181개·본문 보존·검증 수치는 2026-11-15 당시 기록이며 이번 검증 결과가 아니다. 현재 제품·UX 기준은 folk만 사용한다.

## 범위와 결과

사용자가 지정한 AGENT, BE, FE, 루트 AGENTS.md/prompt.md/README.md를 검토했다. 기존 문서 **174개**의 본문을 확인했고 변경 후 신규 **7개**를 포함한 **181개**를 재검토했다.

- 기존 문서 갱신: 110개.
- 신규 문서: 7개.
- 기존 문서 유지: 64개.
- 이전 방향의 문서 22개는 본문을 보존하고 Historical/Superseded를 표시했다.
- TODO와 TODO_LOG는 요청에 따라 읽거나 수정하지 않았다. 연결된 링크도 검사 대상에서 제외했다.
- 소스 변경, schema/migration 변경, DB 접속·초기화·삭제, 커밋은 하지 않았다.

## 검토 방법과 한계

1. 문서 전체 경로와 본문을 확인하고 제품·UX·기술·역사 자료로 분류했다.
2. BE/FE 텍스트 소스·설정 808개, 95,578줄을 파일·내용 검색으로 점검했다. 이는 모든 코드 행의 동작을 실행 검증했다는 뜻이 아니다.
3. Prisma 전체 선언, module 등록, 전체 controller, FE router, 관련 application/API client/설정 저장 경로를 문서와 대조했다.
4. 현재 범용 코어를 참조하는 파일을 확인했다. ObjectDefinition 133개, ListDefinition 58개, ViewDefinition 53개, AttributeDefinition 125개 파일에 참조가 있어 DB만 먼저 삭제할 수 없음을 전환 문서에 반영했다.
5. 공식 도움말/API의 핵심 데이터·View·Deals·Notes·Tasks·권한·export·Dashboard 문서를 확인했다. 도움말 전체와 모든 endpoint를 읽었다고 주장하지 않는다.
6. Nicelydone MCP 도구가 이 세션에 없어 folk 화면을 수집하지 못했다. 실계정 동작·권한·모바일·삭제 정책 검증은 후속 조사다.
7. 실제 배포·원격 DB·외부 로그인·브라우저 비교는 수행하지 않았다. 기존 문서의 과거 테스트 결과는 당시 기록으로 보존했다.

## 발견 사항과 반영

| 발견 | 반영 |
| --- | --- |
| 제품 기준이 No Setup/Kit, 혼합 UX 기준, 개발 보류로 흩어짐 | PM 036·UX 025와 활성 planning/지침 통일 |
| 현재 구현을 인증 foundation만으로 설명 | 32개 model·25개 enum, Workspace/CRM API·FE route 반영 |
| API 목록에서 CRM·Workspace가 누락 | controller 51개 목록화; CRM 정의 모듈 33개 별도 표시 |
| 동적 모델 전체 삭제와 기능 재현의 충돌 | 32개 모델별 유지·축소·대체·제거 후보와 의존 명시 |
| folk는 Table/Pipeline뿐이라는 과도한 단순화 가능성 | Custom objects, 활동, Dashboard, 공유·연동 등 대응표에 포함 |
| 현재 명시적 저장을 목표 동작으로 오인 가능 | 현재 preview/save/undo와 folk 자동 저장을 구분 |
| 첫 Kit·개인 우선·팀 제외·고정 UI 규칙 충돌 | 역사 처리 또는 folk 근거 우선으로 갱신 |
| 공식 자료의 삭제·권한·시간대·버전 차이 | 조사 문서에 미확인 항목으로 기록 |
| User schema 예제와 실제 schema 차이 | 오래된 Prisma 복제 블록 제거, 실제 schema 연결·누락 필드 보완 |
| Supabase 사용 범위·User 온보딩·FE build 설명 누락 | 현재 소스에 맞게 수정 |
| 공개 llms.txt의 미구현 기능·직군 확정 표현 | 제공 상태를 과장하지 않는 텍스트로 정리 |
| 절대 Windows 경로의 prompt | 저장소 상대 경로와 작업 경계로 갱신 |

## 최종 검증

최종 검사 통과. 문서 181개, 상대 링크 640개와 앵커 2개에서 누락이 없었고 코드 fence가 닫혀 있었다. Prisma 32개 모델·25개 enum, 전환표 32개 모델, controller 51개와 API 목록이 일치했다. 역사 자료 22개의 이전 본문 보존과 실행 코드·schema·migration 미변경을 확인했다. `git diff --check`도 통과했다.

수행한 검사:

- 전체 문서의 상대 Markdown 링크·앵커와 코드 fence.
- Prisma 모델/enum 개수, 전환표 32개 모델의 누락·중복.
- controller 51개와 API_SAMPLE의 method/path 대조.
- FE route·feature 및 package script와 문서의 일치.
- 역사 자료 본문 보존, 현행 문서의 이전 규칙 참조 상태.
- 기존 파일 hash와 git diff를 통한 실행 코드·schema·migration 미변경.
- `git diff --check`.

문서·공개 설명 텍스트만 변경했으므로 runtime typecheck/lint/test/build/E2E와 Prisma generate/migrate는 실행하지 않는다. 문서 검증 통과는 folk 제품 구현 또는 DB 전환 검증 통과가 아니다.

## 최종 재검토에서 추가 보완

같은 날 사용자 요청으로 181개 문서의 목록·참조·현행 규칙을 다시 점검하고 아래 누락을 보완했다.

- 인증 테이블의 UUID 기본값과 timestamp native 타입, OAuth provider 계정 ID 선택·legacy 갱신 설명을 실제 schema와 코드에 맞췄다. 존재하는 Workspace/Team/Actor 설명을 “제외한 구조” 목록에서 분리했다.
- 과거 국가 확장 방침을 folk 전환의 필수 구현으로 오인하지 않도록 시장 결정과 인증 설정 설명을 정리했다.
- 공용 Supabase Auth adapter와 에러 신고 모듈의 Storage adapter 위치를 구분하고, 이미 구현된 ErrorReport 모델의 “예정” 표현을 수정했다.
- UI 공용 문서에서 제거된 회사 모달·존재하지 않는 파일 예시·옛 toast 호출 계약을 수정했다. 기존 primitive 계약과 새 folk UX 결정의 경계를 명시했다.
- Tasks의 날짜·반복·기한 의미를 사용자 표시 timezone과 구분하도록 PM 시간대 결정과 DB 시간대 정책을 연결했다. 실제 folk 동작의 미확인 항목은 그대로 남겼다.

추가 정적 검사: 활성 문서의 루트 기준 inline 파일 경로 474개, 인증 4개 테이블의 컬럼 53개(타입·null 여부·UUID 기본값 포함), UI 파일 참조 14개를 확인했다. 예시 경로·역사 자료·로컬 환경 파일·사용자가 제외한 폴더는 경로 존재 판정에서 제외했다. 기존 전체 링크·API·모델·변경 범위 검사도 다시 통과했다.

## 남은 전환 작업

- Nicelydone 연결 후 folk 화면·flow 수집 및 실제 계정 대조.
- 같은 버전·플랜·역할 기준의 기능 대응표 상세화.
- 새 schema/API 계약과 데이터 보존·이전 방식 확정.
- 현재 FE 온보딩·공개 페이지/SEO 문구·Object/List/View UI의 실행 코드 전환. [공개 SEO 소스](../../../FE/user-web/src/features/public-site/seo/public-site-seo.tsx) 등은 이번 문서 작업에서 바꾸지 않았다.
- 명시적 저장·범용 Attribute·11종 View enum 등 현재 계약의 단계별 전환.

## 기존 문서 전체 검토 목록

“유지”는 검토 누락이 아니라 folk 전환과 충돌하지 않는 기술·운영 문서 또는 변경 불필요한 파일이라는 뜻이다. 경로는 저장소 루트 기준이다.

| 문서 | 처리 | 검토 내용 |
| --- | --- | --- |
| [AGENT/AGENT_USAGE_RULES.md](../../../AGENT/AGENT_USAGE_RULES.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md](../../../AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md) | 갱신 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md](../../../AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md) | 갱신 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/PM_AGENT/CONVENTION/README.md](../../../AGENT/PM_AGENT/CONVENTION/README.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md) | 갱신 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/PM_AGENT/DECISIONS/000_확정_결정.md](../../../AGENT/PM_AGENT/DECISIONS/000_확정_결정.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/001_문서_정리_정책.md](../../../AGENT/PM_AGENT/DECISIONS/001_문서_정리_정책.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md](../../../AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/016_agent_role_structure.md](../../../AGENT/PM_AGENT/DECISIONS/016_agent_role_structure.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/017_planning_review_gate.md](../../../AGENT/PM_AGENT/DECISIONS/017_planning_review_gate.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md](../../../AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/019_agent_based_planning_review.md](../../../AGENT/PM_AGENT/DECISIONS/019_agent_based_planning_review.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md](../../../AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/021_user_decision_question_rule.md](../../../AGENT/PM_AGENT/DECISIONS/021_user_decision_question_rule.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md](../../../AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/023_company_domain_basic_scope.md](../../../AGENT/PM_AGENT/DECISIONS/023_company_domain_basic_scope.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/DECISIONS/024_software_agent_front_backend_split.md](../../../AGENT/PM_AGENT/DECISIONS/024_software_agent_front_backend_split.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/025_product_domain_basic_scope.md](../../../AGENT/PM_AGENT/DECISIONS/025_product_domain_basic_scope.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/DECISIONS/026_time_timezone_policy.md](../../../AGENT/PM_AGENT/DECISIONS/026_time_timezone_policy.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/027_auth_session_and_provider_qa_policy.md](../../../AGENT/PM_AGENT/DECISIONS/027_auth_session_and_provider_qa_policy.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/028_auth_provider_runtime_policy.md](../../../AGENT/PM_AGENT/DECISIONS/028_auth_provider_runtime_policy.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/030_billing_paddle_defer_policy.md](../../../AGENT/PM_AGENT/DECISIONS/030_billing_paddle_defer_policy.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/031_kr_us_ca_priority_market.md](../../../AGENT/PM_AGENT/DECISIONS/031_kr_us_ca_priority_market.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/DECISIONS/032_product_pivot_to_no_setup_crm.md](../../../AGENT/PM_AGENT/DECISIONS/032_product_pivot_to_no_setup_crm.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/DECISIONS/033_workspace_team_scope_policy.md](../../../AGENT/PM_AGENT/DECISIONS/033_workspace_team_scope_policy.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/DECISIONS/034_first_kit_selection_policy.md](../../../AGENT/PM_AGENT/DECISIONS/034_first_kit_selection_policy.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/DECISIONS/035_project_pause_and_portfolio_preservation.md](../../../AGENT/PM_AGENT/DECISIONS/035_project_pause_and_portfolio_preservation.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/DECISIONS/README.md](../../../AGENT/PM_AGENT/DECISIONS/README.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/PM_AGENT/OPERATING_MODEL.md](../../../AGENT/PM_AGENT/OPERATING_MODEL.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/PM_AGENT/PERSONA/TARGET_OCCUPATION_PERSONAS.md](../../../AGENT/PM_AGENT/PERSONA/TARGET_OCCUPATION_PERSONAS.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md](../../../AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/DATA_MODEL.md](../../../AGENT/PM_AGENT/PLANNING/DATA_MODEL.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md](../../../AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md](../../../AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md](../../../AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md](../../../AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/PERSONA.md](../../../AGENT/PM_AGENT/PLANNING/PERSONA.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/PRD.md](../../../AGENT/PM_AGENT/PLANNING/PRD.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md](../../../AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/PROJECT_RETROSPECTIVE.md](../../../AGENT/PM_AGENT/PLANNING/PROJECT_RETROSPECTIVE.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/PM_AGENT/PLANNING/README.md](../../../AGENT/PM_AGENT/PLANNING/README.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/ROADMAP.md](../../../AGENT/PM_AGENT/PLANNING/ROADMAP.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/SERVICE_OVERVIEW.md](../../../AGENT/PM_AGENT/PLANNING/SERVICE_OVERVIEW.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PLANNING/SUCCESS_METRICS.md](../../../AGENT/PM_AGENT/PLANNING/SUCCESS_METRICS.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/PM_AGENT/PM_ROLE_AND_DOCUMENTS.md](../../../AGENT/PM_AGENT/PM_ROLE_AND_DOCUMENTS.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/PM_AGENT/README.md](../../../AGENT/PM_AGENT/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/README.md](../../../AGENT/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/DEPLOYMENT.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/DEPLOYMENT.md) | 유지 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/README.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/README.md) | 유지 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/SHARED_PRESENTATION.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/SHARED_PRESENTATION.md) | 유지 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md) | 유지 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/README.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/README.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/002_backend_rules_absorption.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/002_backend_rules_absorption.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/003_backend_testing.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/003_backend_testing.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/004_backend_deployment_environment.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/004_backend_deployment_environment.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/006_backend_transaction_observability_api_contract.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/006_backend_transaction_observability_api_contract.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/007_modular_monolith_msa_boundary.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/007_modular_monolith_msa_boundary.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/README.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/README.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/SOFTWARE_AGENT/COMMON/API_SAMPLE.md](../../../AGENT/SOFTWARE_AGENT/COMMON/API_SAMPLE.md) | 갱신 | API·환경·검증·전환 경계 확인 |
| [AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md](../../../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md) | 유지 | API·환경·검증·전환 경계 확인 |
| [AGENT/SOFTWARE_AGENT/COMMON/ERROR.md](../../../AGENT/SOFTWARE_AGENT/COMMON/ERROR.md) | 유지 | API·환경·검증·전환 경계 확인 |
| [AGENT/SOFTWARE_AGENT/COMMON/IMPLEMENTATION_BOUNDARY.md](../../../AGENT/SOFTWARE_AGENT/COMMON/IMPLEMENTATION_BOUNDARY.md) | 갱신 | API·환경·검증·전환 경계 확인 |
| [AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md](../../../AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md) | 갱신 | API·환경·검증·전환 경계 확인 |
| [AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md](../../../AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md) | 갱신 | API·환경·검증·전환 경계 확인 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md) | 갱신 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md) | 갱신 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/ERROR_REPORT_SCHEMA.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/ERROR_REPORT_SCHEMA.md) | 갱신 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md) | 갱신 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/PUBLIC_CONTACT_REQUEST_SCHEMA.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/PUBLIC_CONTACT_REQUEST_SCHEMA.md) | 유지 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md) | 갱신 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/SUPPORT_REQUEST_SCHEMA.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/SUPPORT_REQUEST_SCHEMA.md) | 유지 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md) | 갱신 | 현재 schema·과거 SQL·목표 모델 구분 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md) | 유지 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/README.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/README.md) | 유지 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md) | 유지 | 현재 구조와 실행 계약 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md) | 갱신 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md) | 갱신 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/README.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/README.md) | 유지 | 기술·문서 규칙과 전환 기준 대조 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/002_frontend_admin_rules_absorption.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/002_frontend_admin_rules_absorption.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/003_frontend_testing.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/003_frontend_testing.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/004_frontend_deployment_environment.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/004_frontend_deployment_environment.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/README.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/README.md) | 유지 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/SOFTWARE_AGENT/README.md](../../../AGENT/SOFTWARE_AGENT/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/UXUI_AGENT/DECISIONS/005_uxui_home_screen.md](../../../AGENT/UXUI_AGENT/DECISIONS/005_uxui_home_screen.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/006_uxui_reference_style.md](../../../AGENT/UXUI_AGENT/DECISIONS/006_uxui_reference_style.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/007_uxui_record_create_flow.md](../../../AGENT/UXUI_AGENT/DECISIONS/007_uxui_record_create_flow.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/008_uxui_inline_record_connection.md](../../../AGENT/UXUI_AGENT/DECISIONS/008_uxui_inline_record_connection.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/010_uxui_search.md](../../../AGENT/UXUI_AGENT/DECISIONS/010_uxui_search.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/014_uxui_admin_tone.md](../../../AGENT/UXUI_AGENT/DECISIONS/014_uxui_admin_tone.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md](../../../AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/016_uxui_writing_tone.md](../../../AGENT/UXUI_AGENT/DECISIONS/016_uxui_writing_tone.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/UXUI_AGENT/DECISIONS/018_uxui_multilingual_font_stack.md](../../../AGENT/UXUI_AGENT/DECISIONS/018_uxui_multilingual_font_stack.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/UXUI_AGENT/DECISIONS/019_uxui_record_create_panel.md](../../../AGENT/UXUI_AGENT/DECISIONS/019_uxui_record_create_panel.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/020_uxui_previous_reference_retired.md](../../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_previous_reference_retired.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/021_uxui_onehand_crm_pivot.md](../../../AGENT/UXUI_AGENT/DECISIONS/021_uxui_onehand_crm_pivot.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/022_uxui_first_use_flow.md](../../../AGENT/UXUI_AGENT/DECISIONS/022_uxui_first_use_flow.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/023_uxui_kit_selection.md](../../../AGENT/UXUI_AGENT/DECISIONS/023_uxui_kit_selection.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/024_uxui_internal_terms_user_language.md](../../../AGENT/UXUI_AGENT/DECISIONS/024_uxui_internal_terms_user_language.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/DECISIONS/README.md](../../../AGENT/UXUI_AGENT/DECISIONS/README.md) | 갱신 | 결정의 적용 상태와 충돌 확인 |
| [AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md](../../../AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md](../../../AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/PLANNING/KIT_SELECTION_UX.md](../../../AGENT/UXUI_AGENT/PLANNING/KIT_SELECTION_UX.md) | 역사 표시·본문 보존 | 이전 방향을 현행 규칙과 분리 |
| [AGENT/UXUI_AGENT/PLANNING/README.md](../../../AGENT/UXUI_AGENT/PLANNING/README.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md](../../../AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md](../../../AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md](../../../AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md](../../../AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/PLANNING/WORKSPACE_HOME_UX.md](../../../AGENT/UXUI_AGENT/PLANNING/WORKSPACE_HOME_UX.md) | 갱신 | 제품 범위·현재 구현·목표 UX 대조 |
| [AGENT/UXUI_AGENT/README.md](../../../AGENT/UXUI_AGENT/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md](../../../AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [AGENTS.md](../../../AGENTS.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/AGENTS.md](../../../BE/AGENTS.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/ARCHITECTURE.md](../../../BE/ARCHITECTURE.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [BE/README.md](../../../BE/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/SUPABASE_SETUP.md](../../../BE/SUPABASE_SETUP.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/prisma/VIEW_DEMO_SETTINGS.md](../../../BE/prisma/VIEW_DEMO_SETTINGS.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/prisma/VIEW_TYPE_CONVERSION.md](../../../BE/prisma/VIEW_TYPE_CONVERSION.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/modules/README.md](../../../BE/src/modules/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/modules/auth/README.md](../../../BE/src/modules/auth/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/modules/health/README.md](../../../BE/src/modules/health/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/modules/user/README.md](../../../BE/src/modules/user/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/shared/README.md](../../../BE/src/shared/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/shared/application/README.md](../../../BE/src/shared/application/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/shared/domain/README.md](../../../BE/src/shared/domain/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/shared/infrastructure/README.md](../../../BE/src/shared/infrastructure/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [BE/src/shared/presentation/README.md](../../../BE/src/shared/presentation/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [FE/ARCHITECTURE.md](../../../FE/ARCHITECTURE.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [FE/README.md](../../../FE/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [FE/admin-web/ARCHITECTURE.md](../../../FE/admin-web/ARCHITECTURE.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/README.md](../../../FE/admin-web/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/assets/README.md](../../../FE/admin-web/src/assets/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/components/README.md](../../../FE/admin-web/src/components/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/components/ui/README.md](../../../FE/admin-web/src/components/ui/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/features/README.md](../../../FE/admin-web/src/features/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/hooks/README.md](../../../FE/admin-web/src/hooks/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/store/README.md](../../../FE/admin-web/src/store/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/types/README.md](../../../FE/admin-web/src/types/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/admin-web/src/utils/README.md](../../../FE/admin-web/src/utils/README.md) | 유지 | 관리자 앱 경계·구조 유지 |
| [FE/user-web/ARCHITECTURE.md](../../../FE/user-web/ARCHITECTURE.md) | 갱신 | 현재 구조와 실행 계약 대조 |
| [FE/user-web/README.md](../../../FE/user-web/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [FE/user-web/public/llms.txt](../../../FE/user-web/public/llms.txt) | 갱신 | 공개 기능 설명 과장·타겟 확정 제거 |
| [FE/user-web/public/robots.txt](../../../FE/user-web/public/robots.txt) | 유지 | 검색 접근 정책 검토, 변경 불필요 |
| [FE/user-web/src/assets/README.md](../../../FE/user-web/src/assets/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [FE/user-web/src/components/README.md](../../../FE/user-web/src/components/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [FE/user-web/src/components/ui/README.md](../../../FE/user-web/src/components/ui/README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [FE/user-web/src/features/README.md](../../../FE/user-web/src/features/README.md) | 갱신 | 현재 feature 동작과 목표 UX 구분 |
| [FE/user-web/src/features/crm-view/README.md](../../../FE/user-web/src/features/crm-view/README.md) | 갱신 | 현재 feature 동작과 목표 UX 구분 |
| [FE/user-web/src/features/sidebar-order/README.md](../../../FE/user-web/src/features/sidebar-order/README.md) | 갱신 | 현재 feature 동작과 목표 UX 구분 |
| [FE/user-web/src/features/view-favorite/README.md](../../../FE/user-web/src/features/view-favorite/README.md) | 갱신 | 현재 feature 동작과 목표 UX 구분 |
| [FE/user-web/src/hooks/README.md](../../../FE/user-web/src/hooks/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [FE/user-web/src/store/README.md](../../../FE/user-web/src/store/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [FE/user-web/src/types/README.md](../../../FE/user-web/src/types/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [FE/user-web/src/utils/README.md](../../../FE/user-web/src/utils/README.md) | 유지 | 역할·지침·목록·실행 범위 확인 |
| [README.md](../../../README.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |
| [prompt.md](../../../prompt.md) | 갱신 | 역할·지침·목록·실행 범위 확인 |

## 신규 문서

| 문서 | 역할 |
| --- | --- |
| [AGENT/PM_AGENT/DECISIONS/036_folk_benchmark_transition.md](../../../AGENT/PM_AGENT/DECISIONS/036_folk_benchmark_transition.md) | 사용자 전환 결정 |
| [AGENT/PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md](../../../AGENT/PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md) | 전체 목표·단계·현재 차이 |
| [AGENT/SOFTWARE_AGENT/COMMON/DOCUMENTATION_REVIEW_20261115.md](../../../AGENT/SOFTWARE_AGENT/COMMON/DOCUMENTATION_REVIEW_20261115.md) | 전체 검토 목록과 결과 |
| [AGENT/SOFTWARE_AGENT/COMMON/FOLK_TRANSITION_MATRIX.md](../../../AGENT/SOFTWARE_AGENT/COMMON/FOLK_TRANSITION_MATRIX.md) | DB·API·FE 의존과 전환 순서 |
| [AGENT/SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md) | 현재 32개 모델과 목표 제안 |
| [AGENT/UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md](../../../AGENT/UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md) | folk 단일 UX 기준 |
| [AGENT/UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md](../../../AGENT/UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md) | 공식 근거·MCP 상태·미확인 동작 |
