# G01 Object/List 대상의 초기 View 헤더 조회

- 상태: 구현·검증 완료. G99 규칙 검토 완료
- 계약: [WORKSPACE_VIEW_HEADER_GET](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
- 선행 규칙: [Backend 기준](README.md), [TODO Software 기준](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

## 1. 범위와 처리

신규 GET /api/users/me/workspaces/:workspaceId/view-header 하나를 구현한다. 대상 종류/ID로 공개 요약을 먼저 조회하고, 저장 순서의 첫 View와 개인 Favorite를 조합한다. View가 없으면 대상 정보와 null View를 반환한다. 생성·저장·자동 생성과 목록 API는 실행하지 않는다.

순서: Controller 인증·DTO → Workspace 공개 멤버 조회 1회 → Object/List 공개 요약 → View Header Query → 응답 조합.

## 2. 구현 계약과 위치

| 소유 모듈 | Port·method | 반환 |
| --- | --- | --- |
| object-definition | ObjectDefinitionSummaryQuery.findObjectDefinitionSummary | id/singularName/icon 또는 null |
| list-definition | ListDefinitionSummaryQuery.findListDefinitionSummary | id/name/icon 또는 null |
| view-definition | ViewDefinitionHeaderQuery.findFirstWorkspaceViewHeader | View 요약·isFavorite 또는 null |

View 파일:
- application/view-definition-type.ts, application/view-header-target.ts
- application/ports/view-definition-header-query.port.ts
- application/use-cases/get-workspace-view-header.use-case.ts
- infrastructure/persistence/prisma-view-definition-header-query.repository.ts
- presentation/http/dto/get-workspace-view-header-query.dto.ts
- presentation/http/user-workspace-view-header.controller.ts
- domain/view-definition.errors.ts와 infrastructure/view-definition.module.ts

Object/List 각각 application/ports의 summary-query.port.ts, infrastructure/persistence의 prisma-*-summary-query.repository.ts와 Module provider/export를 추가한다. 기존 Object Access Port와 Sidebar 응답은 보존한다. AppModule의 View 모듈은 이미 등록되어 있다.

## 3. 검증·완료 기준

[TEST-PLAN](TEST-PLAN.md)에 따라 UseCase/HTTP/실제 Repository DB/DI·기존 회귀를 수행하고 결과를 기록한다. 이어 [G99](G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)에서 계층·범위·주석·계약·검증 근거를 대조한다. ORM 타입은 infrastructure에 한정하고 다른 모듈 persistence를 직접 공유하지 않는다.

Frontend·본문·①/②·즐겨찾기 클릭/쓰기·View 생성·schema/migration/seed·환경 파일·사용자 서버·커밋은 제외한다. transaction 없음, idempotency/outbox 해당 없음, 새 읽기 이벤트 없음은 API 정본을 따른다. 결과는 [작업 로그](../../../../TODO_LOG/2026-10-25/VIEW_HEADER_TARGET_GET/WORK_LOG.md)에 기록한다.
