# PM 기획 문서

## 1. 목적

이 폴더는 OneHand CRM의 제품 기획과 MVP 범위의 정본 문서를 관리한다.

PM 관점에서 사용자 문제, 제품 가치, Kit 전략, 포함/제외 범위, 첫 사용 경험, CRM 코어 개념, 로드맵을 설명한다. 구현 상태는 별도로 기록하되, 제품 방향 문서와 같은 층위로 섞지 않는다.

## 2. 현재 정본 문서

- `PRODUCT_DIRECTION.md`: 루트 `README.md`의 제품 방향을 PM 관점으로 정리한 기준 문서
- `SERVICE_OVERVIEW.md`: 서비스가 기획상 어떤 제품인지 한 문서로 이해하기 위한 개요
- `PRD.md`: 제품 요구사항, 사용자 문제, 핵심 기능, 성공 기준
- `MVP_SCOPE.md`: 현재 Foundation 범위와 다음 No Setup CRM MVP 범위
- `PERSONA.md`: 핵심 사용자 페르소나와 Jobs-to-be-Done
- `KIT_STRATEGY.md`: Kit의 정의, 구성 요소, 초기 후보, 선정 기준
- `FIRST_USE_EXPERIENCE.md`: 가입 후 첫 10분 경험과 활성화 기준
- `CRM_CORE_CONCEPT_MODEL.md`: Workspace, Kit, Object, Attribute, Relationship, Record, View의 PM 개념 모델
- `ROADMAP.md`: 제품 단계별 로드맵
- `SUCCESS_METRICS.md`: PM 관점의 활성화, 리텐션, 품질 지표
- `IMPLEMENTATION_STATUS.md`: 현재 BE/FE/Prisma 기준 활성 구현 상태
- `DATA_MODEL.md`: 현재 구현 데이터 모델과 후속 CRM Core 개념 모델의 경계

## 3. 제거한 과거 문서 기준

과거 Global B2C/Series A 관점의 planning 문서는 현재 PM planning 정본에서 제거했다.

이유:

- 현재 제품 방향은 OneHand CRM의 No Setup CRM 피벗이다.
- 기능 색인과 로드맵은 `IMPLEMENTATION_STATUS.md`, `ROADMAP.md`, `SUCCESS_METRICS.md`에 흡수됐다.
- 과거 문서가 남아 있으면 새 작업자가 Global B2C/Series A를 현재 우선순위로 오해할 수 있다.

## 4. 작성 원칙

- 모든 문서는 한국어로 작성한다.
- 기능 목록만 쓰지 않고 사용자 문제와 결정 이유를 함께 적는다.
- 현재 구현된 기능과 앞으로 만들 제품 방향을 구분한다.
- Kit과 CRM Core는 PM 개념으로 먼저 정의하고, DB 구현 상세는 Software 문서에서 확정한다.
- UX/UI 상세는 `UXUI_AGENT` 문서와 연결한다.
- DB 구현 상세는 `SOFTWARE_AGENT` 또는 `TODO`의 DB 스키마 문서와 연결한다.

## 5. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/README.md`
- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/DECISIONS/032_product_pivot_to_no_setup_crm.md`
- `AGENT/PM_AGENT/DECISIONS/033_workspace_team_scope_policy.md`
- `AGENT/PM_AGENT/DECISIONS/034_first_kit_selection_policy.md`
- `AGENT/UXUI_AGENT/PLANNING/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
