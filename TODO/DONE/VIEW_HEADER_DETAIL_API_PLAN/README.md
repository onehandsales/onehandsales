# Object/List 클릭 시 View 헤더 조회 API 구현 계획

- 갱신일: 2026-10-25
- 상태: Backend 구현·검증·G99 규칙 검토 완료
- 계약: [WORKSPACE_VIEW_HEADER_GET](COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
- 구현·검증 로그: [WORK_LOG](../../../TODO_LOG/2026-10-25/VIEW_HEADER_TARGET_GET/WORK_LOG.md)

## 1. 목적과 현재 요청

사이드바 관리 항목 또는 업무 목록 클릭 시 Object/List ID로 헤더의 대상 이름·아이콘, 초기 View와 개인 즐겨찾기 상태를 조회한다. 이전의 즐겨찾기 View ID 입력 계획은 사용자가 지정한 ③ 선행 호출 흐름으로 대체했다.

~~~http
GET /api/users/me/workspaces/:workspaceId/view-header?targetType=OBJECT&targetId=<objectDefinitionId>
GET /api/users/me/workspaces/:workspaceId/view-header?targetType=LIST&targetId=<listDefinitionId>
~~~

신규 HTTP API는 하나다. 조회·표시를 먼저 구현하고 View 생성·저장·Object 생성 시 기본 View 자동 생성은 후속으로 둔다. 저장 순서 첫 View를 조회하며 없으면 대상 요약과 null View를 반환한다.

## 2. 문서와 실행 순서

1. [공통 범위](COMMON/README.md), [사용 흐름](COMMON/USER-FLOW.md), [API 정본](COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
2. [Backend 규칙](BE-TODO/README.md), [DB 범위](BE-TODO/DB-SCHEMA.md), [G01 구현](BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md)
3. [검증](BE-TODO/TEST-PLAN.md), [G99 규칙 검토](BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)
4. [작업 분담](COMMON/WORK-SPLIT.md), [작업 순서](COMMON/GOAL-WORK-ORDER.md), [기획 검토](COMMON/PLANNING-REVIEW.md)

적용 기준은 [TODO Software 정본](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)과 [Backend Agent](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)다. 이 작업은 사용자의 명시적 구현 요청으로 실행하며 goal 도구를 생성하지 않는다.

## 3. 완료 기준과 후속 범위

실행 결과: Node 24.21.0에서 typecheck/lint/build·Prisma validate/generate와 임시 PostgreSQL 17의 전체 53 suites/267 tests가 실패·skip 없이 통과했다. 신규 API 검증은 5 suites/35 tests다.

GET 계약, 공개 Summary Port, UseCase·DTO·Controller·DI와 실제 범위 격리 검증을 완료하고 G99 근거를 남겼다. 실패·skip 0을 확인한 뒤 TODO/DONE에 보관했다. 이 문서는 완료 이력이며 후속 구현은 새 활성 계획으로 진행한다.

Frontend 연결·본문·①/② 드롭다운 View 목록·즐겨찾기 클릭/쓰기·View 생성/저장·기본 View 자동 생성·schema/migration/seed/환경·배포·커밋은 이번 범위에 없다. [FE 후속 범위](FE-TODO/README.md)를 따른다.
