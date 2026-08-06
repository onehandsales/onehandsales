# Planning Review

상태: 조건부 통과
작성일: 2026-08-06
기준: `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`

## 1. 결론

- 판정: 조건부 통과
- 이유: 이 폴더는 구현 계획이 아니라 pre-12 후속 후보를 분류하기 위한 문서화 계획으로는 충분하다. 다만 현재 confirmed API가 없으므로 기능 구현 goal로 바로 들어갈 수 없다.

## 2. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/CANDIDATE-MATRIX.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/GOAL-SPECS/*`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`

## 3. 핵심 발견 사항

| 등급 | 문서 | 문제 | 영향 | 권장 조치 |
| --- | --- | --- | --- | --- |
| Major | API-SPEC | confirmed API가 없다. | 구현 goal로 바로 들어가면 범위를 임의 해석할 위험이 있다. | G00 이후 필요한 후보만 contract 문서로 승격한다. |
| Major | Candidate Matrix | 다음 행동 reminder와 회의록 follow-up reminder는 제품 정책 결정이 필요하다. | 06 작업 범위가 커질 수 있다. | 06에서는 DealActivity event까지만 다루고 알림은 G02/G03에서 별도 결정한다. |
| Minor | 08 Global Data I18N | `/app` locale, 국가/통화/전화번호, 금액 정밀도, 주소/세금/약관, auth provider 확장 후보가 08 완료 범위와 섞일 수 있다. | 08을 불필요하게 재오픈하거나 12 Billing 전제 작업을 앞당길 수 있다. | G09에서 `PRE12-F17`~`PRE12-F25`로 분리하고, market/auth/billing 정책 결정 전에는 구현 goal로 승격하지 않는다. |
| Minor | 09 Product Analytics | account deletion 실제 처리, 세부 event, external provider, UTM/experiment, PWA/native attribution 후보가 09 완료 범위와 섞일 수 있다. | 09를 불필요하게 재오픈하거나 12 Billing/marketing/trust 정책을 앞당길 수 있다. | G10에서 `PRE12-F26`~`PRE12-F30`로 분리하고, 12/정책/analytics taxonomy 결정 전에는 구현 goal로 승격하지 않는다. |
| Minor | 상위 문서 | 이 새 폴더를 상위 roadmap에 연결해야 한다. | 다음 작업자가 폴더를 놓칠 수 있다. | G99 또는 현재 문서 작성 작업에서 상위 README/overview를 갱신한다. |

## 4. 구현 가능 여부

- 바로 구현 가능 여부: 아니오
- 바로 실행 가능한 첫 goal: G00 Scope Classification
- 구현 전 반드시 필요한 것:
  - 후보 상태 확정
  - API 계약 confirmed 승격
  - DB 영향 확정
  - FE 표시 위치와 상태 정의
  - 08 후속 후보의 market/auth/billing 정책 결정
  - 09 후속 후보의 privacy/trust/analytics taxonomy/growth/billing/mobile roadmap 결정

## 5. 관련 문서

- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
