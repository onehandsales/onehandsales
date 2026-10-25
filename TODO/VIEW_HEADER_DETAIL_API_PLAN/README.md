# View 헤더 단건 조회 API 구현 계획

- 작성·재구성일: 2026-10-25
- 상태: Backend 구현 착수 가능 / 실제 API 구현 미착수
- API 계약: [WORKSPACE_VIEW_HEADER_GET](COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md), confirmed
- 구조 참고: [COMPANY_DOMAIN_PLAN](../DONE/COMPANY_DOMAIN_PLAN/README.md). 과거 Company API·모델·화면은 가져오지 않는다.

## 1. 목적과 범위

사이드바 즐겨찾기의 viewDefinitionId로 View와 소속 Object/List 요약, 현재 멤버의 즐겨찾기 상태를 조회한다. 이번 계획은 Backend GET API 1개와 필요한 내부 공개 요약 Port, 검증·구현 후 규칙 검토까지다. Frontend 클릭·헤더 연결과 본문 구현은 후속 범위다.

`GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId`

## 2. 계획 문서 구조

```text
VIEW_HEADER_DETAIL_API_PLAN/
  README.md
  COMMON/
    README.md
    USER-FLOW.md
    WORK-SPLIT.md
    GOAL-WORK-ORDER.md
    PLANNING-REVIEW.md
    API-SPEC/
      VIEW_HEADER_DETAIL_API.md
  BE-TODO/
    README.md
    DB-SCHEMA.md
    G01-BE-VIEW-HEADER-DETAIL.goal.md
    TEST-PLAN.md
    G99-BE-RULE-COMPLIANCE-REVIEW.goal.md
  FE-TODO/
    README.md
```

## 3. 어디부터 읽고 실행하는가

1. [공통 범위·보류 정책](COMMON/README.md)과 [사용 흐름](COMMON/USER-FLOW.md)을 읽는다.
2. [API 정본](COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)에서 승인된 요청·응답·오류·조회 절차를 확인한다.
3. [작업 분담](COMMON/WORK-SPLIT.md), [Backend 규칙·기존 코드](BE-TODO/README.md), [DB 범위](BE-TODO/DB-SCHEMA.md)를 확인한다.
4. [작업 순서](COMMON/GOAL-WORK-ORDER.md)에 따라 G01 구현·검증 후 G99 규칙 검토를 수행한다.
5. [Frontend 후속 범위](FE-TODO/README.md)는 소비 계약 참고이며 현재 실행 작업이 아니다.

첫 구현 단위는 [G01 Backend API](BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md)다. 이 문서 작성 요청만으로 goal 도구나 API 구현을 시작하지 않는다.

## 4. 완료 기준과 상태

- 구현·검증 기준은 [TEST-PLAN](BE-TODO/TEST-PLAN.md), 최종 검토는 [G99](BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)를 따른다.
- 실제 DB 격리 등 필수 검증이 미확인이면 구현과 검증 상태를 분리하고 confirmed 계약·활성 계획을 유지한다.
- 검증·규칙 검토 완료 후 API 계약과 이 계획의 상태, DB 현황·작업 로그를 갱신한다.
- 전체 Backend 계획이 완료되면 TODO/DONE 보관과 참조 갱신을 수행한다. 커밋·배포는 별도 요청 범위다.
- 현재 [기획 검토](COMMON/PLANNING-REVIEW.md)는 문서 검토 결과이며 API 구현이나 런타임 테스트 통과 근거가 아니다.

기준은 [TODO Software 정본 참조](../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)와 [Backend Agent](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)를 따른다. [문서 작업 로그](../../TODO_LOG/2026-10-25/VIEW_HEADER_DETAIL_API_PLAN/WORK_LOG.md)에 작성·구조 변경 검증을 기록한다.
