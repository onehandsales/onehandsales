# View 헤더 Backend 작업

## 1. 시작 문서와 현재 상태

- 현재 API 구현: 대상 기반 헤더 조회 구현·검증·G99 완료
- API 계약: [WORKSPACE_VIEW_HEADER_GET](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md), implemented
- [G01 구현](G01-BE-VIEW-HEADER-DETAIL.goal.md)
- [DB·읽기 범위](DB-SCHEMA.md)
- [테스트 계획](TEST-PLAN.md)
- [G99 구현 후 규칙 검토](G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)
- [전체 순서](../COMMON/GOAL-WORK-ORDER.md)

범위는 Backend GET 1개와 소속 요약 공개 Port다. 이름·아이콘을 가져오기 위한 Object/List 내부 작업을 포함하며 관리 항목/업무 목록의 View 목록 HTTP API는 추가하지 않는다.

## 2. 먼저 읽을 규칙과 기존 구현

### 2.1. 적용 규칙

- [저장소 지침](../../../../AGENTS.md), [Backend 지침](../../../../BE/AGENTS.md)
- [TODO Software 정본 참조](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [기획 검토 기준](../../../../AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md)
- [Software Agent](../../../../AGENT/SOFTWARE_AGENT/README.md), [Backend Agent](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)
- [Backend 아키텍처](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md), [모듈 경계](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md), [테스트](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md)
- [Backend 컨벤션](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md), [API 계약](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md), [API 명세](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md)
- [Transaction](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md), [Observability](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md), [주석·로그](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md)
- [Backend 결정 기록](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/README.md), 특히 005·006·007의 주석·계약·모듈 경계 결정
- [Backend 구현 검토 체크리스트](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)
- [DB 현황](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [CRM Core 스키마](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md), [시간 정책](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md)
- [Frontend 소비 구조](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md), [Frontend 컨벤션](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md)
- [UX 기준 결정](../../../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md), [헤더 UX](../../../VIEW_TWO_AREA_TEXT_UX.md), [사이드바 흐름](../../../SIDEBAR_AND_VIEW_USER_FLOW.md)

구현자는 Backend Agent의 ARCHITECTURE/CONVENTION/DECISIONS 전체와 TODO Software 정본 참조의 필수 선행 문서를 확인한다. 오래된 foundation 범위 설명을 현재 명시된 API 작업의 금지로 해석하지 않는다. 이번 API 범위와 최신 스키마는 API 정본과 실제 코드로 확인한다.

### 2.2. 학습한 기존 구현과 재사용할 패턴

| 모듈 | 확인한 근거 | 적용할 패턴 |
| --- | --- | --- |
| attribute-definition | [단건 UseCase](../../../../BE/src/modules/attribute-definition/application/use-cases/get-workspace-object-attribute-definition.use-case.ts), [단건 Repository](../../../../BE/src/modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-detail-query.repository.ts) | Workspace 접근 → owning module 공개 Port로 부모 소속 확인 → 범위를 제한한 단건 조회 → 없으면 DomainError |
| object-definition | [사이드바 UseCase](../../../../BE/src/modules/object-definition/application/use-cases/list-sidebar-object-definitions.use-case.ts), [공개 접근 Port](../../../../BE/src/modules/object-definition/application/ports/object-definition-access-query.port.ts), [Module](../../../../BE/src/modules/object-definition/infrastructure/object-definition.module.ts) | Workspace 경계, 명시적 select, 공개 Port export와 infrastructure provider 조립 |
| record-definition | [목록 UseCase](../../../../BE/src/modules/record-definition/application/use-cases/list-workspace-object-record-definitions.use-case.ts), [목록 Repository](../../../../BE/src/modules/record-definition/infrastructure/persistence/prisma-record-definition-list-query.repository.ts), [생성 UseCase](../../../../BE/src/modules/record-definition/application/use-cases/create-workspace-object-record-definition.use-case.ts) | Workspace/Object 범위를 함께 제한, 응답 조합은 application에서 수행. 쓰기 전용 Actor·transaction 흐름을 읽기 API에 불필요하게 복사하지 않음 |
| view-definition | [즐겨찾기 UseCase](../../../../BE/src/modules/view-definition/application/use-cases/list-sidebar-view-favorites.use-case.ts), [즐겨찾기 Repository](../../../../BE/src/modules/view-definition/infrastructure/persistence/prisma-view-favorite-sidebar-query.repository.ts) | 서버가 확인한 멤버 ID, Actor 없는 읽기 허용, 본인 즐겨찾기와 View의 Workspace 경계 |
| list-definition | [현재 Module](../../../../BE/src/modules/list-definition/infrastructure/list-definition.module.ts) | 현재는 사이드바 목록 조회만 있다. 새로운 공개 요약 Query를 이 모듈 내부에서 구현·export |
| workspace/auth/shared | [Workspace 공개 Port](../../../../BE/src/modules/workspace/application/ports/workspace-access-query.port.ts), [AuthGuard](../../../../BE/src/shared/presentation/guards/auth.guard.ts), [전역 오류 변환](../../../../BE/src/shared/presentation/filters/http-exception.filter.ts) | 기존 인증/멤버십/UUID/오류 변환 재사용 |

Attribute 단건 조회와 같은 공개 Port 경계를 적용한다. 이번 API는 클릭 대상 ID를 받으므로 **Workspace 멤버십 → 대상 Object/List 요약 → 초기 View/개인 Favorite → 헤더 응답** 순서로 처리한다. 이전 View ID 입력 계약은 최신 사용자 요청으로 대체했다.

## 3. 상태 기록

구현·검증 결과는 G01과 TEST-PLAN에, 규칙 준수 판정은 G99에 남긴다. DB 격리 검증 미확인을 완료로 처리하지 않는다. 이 문서의 규칙 목록은 필수 선행 문서 안내이며 HTTP 계약의 별도 사본이 아니다.
