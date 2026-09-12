# PM_AGENT

## 1. 목적

`PM_AGENT`는 OneHand CRM의 제품 방향, 사용자 문제, MVP 범위, 우선순위, 정책 결정을 책임지는 문서 영역이다.

PM 문서는 구현 목록을 보관하는 곳이 아니라, 왜 이 제품을 만들고 어떤 사용자를 위해 어떤 범위까지 할 것인지 결정하는 기준이다. UX/UI와 Software 문서가 화면과 구현 방식을 구체화하더라도, 제품 목표와 포함/제외 범위 판단은 PM 문서를 기준으로 한다.

최상위 제품 방향은 저장소 루트 `README.md`를 우선한다. `PM_AGENT`는 그 방향을 실제 PRD, Kit 전략, MVP 범위, 로드맵, 결정 기록으로 풀어내는 역할을 한다.

## 2. 제품 방향 요약

OneHand CRM의 핵심 문장은 다음이다.

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

OneHand CRM은 고정된 영업 CRM도 아니고, 사용자가 처음부터 직접 설계해야 하는 빈 CRM builder도 아니다. 사용자가 무슨 일을 하는지 알려주면 그 일에 맞는 CRM 구조가 먼저 준비되고, 필요해지는 순간 업무 언어로 자연스럽게 확장되는 No Setup CRM을 목표로 한다.

제품 철학은 다음 문장으로 고정한다.

> Ready-made, but never locked.

## 3. 관리 범위

- 제품 정의와 포지셔닝
- 타겟 사용자와 직군별 업무 문제
- Kit 전략과 첫 출시 Kit 선정 기준
- MVP 포함/제외 범위
- Workspace, Kit, Object, Attribute, Relationship, Record, View 같은 CRM 코어 개념
- 첫 사용 경험과 활성화 기준
- 우선순위와 로드맵
- 시장, 결제, 베타, 운영 정책
- 문서 작성 규칙과 결정 기록
- TODO 계획 문서 작성 방식

## 4. 폴더 구조

```text
PM_AGENT/
  README.md
  OPERATING_MODEL.md
  PM_ROLE_AND_DOCUMENTS.md
  PLANNING/
  DECISIONS/
  CONVENTION/
  PERSONA/
```

## 5. 우선 확인 문서

PM_AGENT를 학습하거나 새 계획을 만들 때는 아래 순서로 확인한다.

1. 저장소 루트 `README.md`
2. `PM_ROLE_AND_DOCUMENTS.md`
3. `DECISIONS/000_확정_결정.md`
4. `PLANNING/PRODUCT_DIRECTION.md`
5. `PLANNING/SERVICE_OVERVIEW.md`
6. `PLANNING/PRD.md`
7. `PLANNING/MVP_SCOPE.md`
8. `PLANNING/KIT_STRATEGY.md`
9. `PLANNING/FIRST_USE_EXPERIENCE.md`
10. `PLANNING/CRM_CORE_CONCEPT_MODEL.md`
11. `PLANNING/ROADMAP.md`
12. `PLANNING/SUCCESS_METRICS.md`
13. `PLANNING/IMPLEMENTATION_STATUS.md`
14. `PLANNING/DATA_MODEL.md`
15. `CONVENTION/DOCUMENTATION.md`
16. `CONVENTION/PLANNING_REVIEW_CHECKLIST.md`

과거 Global B2C/Series A 관점의 planning 문서는 현재 PM_AGENT 정본에서 제거했다. 현재 제품 방향의 정본은 위 목록을 우선한다.

## 6. 협업 원칙

- PM은 사용자 문제, 제품 가치, 포함/제외 범위, 우선순위를 먼저 결정한다.
- UX/UI 결정이 필요한 기능은 `UXUI_AGENT` 문서와 함께 갱신한다.
- API, DB, 테스트, 배포 결정이 필요한 기능은 `SOFTWARE_AGENT` 문서와 함께 갱신한다.
- 결정이 여러 역할에 걸치면 PM이 최종 결정 문서를 남긴다.
- 새 구현 계획은 `TODO/{PLAN_NAME}/`에 만들고, `/goal` 작업 단위로 나눈다.
- 구현 계획은 반드시 현재 제품 방향, Kit 전략, MVP 범위와 연결되어야 한다.

## 7. 현재 주의사항

- 현재 코드에는 Auth/User, 지원 접수, 공개 문의, 관리자 권한 확인 foundation만 활성화되어 있다.
- Workspace/Kit/Object/Attribute/Relationship/Record/List/View 기반 CRM 코어는 아직 구현된 기능이 아니다.
- Team/조직 권한, 결제, 자동화, 외부 연동은 현재 MVP 기본 범위가 아니다.
- Company/Product/Deal은 전역 기본 도메인이 아니다. 다만 특정 직군 Kit 안에서는 업무 언어로 등장할 수 있다.

## 8. 관련 문서

- `README.md`
- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/OPERATING_MODEL.md`
- `AGENT/PM_AGENT/PM_ROLE_AND_DOCUMENTS.md`
- `AGENT/PM_AGENT/PLANNING/README.md`
- `AGENT/PM_AGENT/DECISIONS/README.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/UXUI_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
