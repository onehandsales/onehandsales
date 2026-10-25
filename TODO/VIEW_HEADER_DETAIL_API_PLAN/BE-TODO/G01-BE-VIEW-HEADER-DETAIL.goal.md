# G01 Backend View 헤더 단건 조회

- 상태: 미착수
- 선행 조건: confirmed [API 정본](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)과 [공통 범위](../COMMON/README.md) 확인
- 후속 필수 작업: [G99 규칙 검토](G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)

## 1. 목적과 먼저 읽을 문서

즐겨찾기에서 받은 viewDefinitionId로 헤더 요약을 조회하는 API 1개를 구현한다. [Backend 정본·기존 구현](README.md), [TODO Software 정본 참조](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [DB 범위](DB-SCHEMA.md), [테스트 계획](TEST-PLAN.md)을 먼저 읽는다.

## 2. 포함·제외

포함은 Object/List 공개 요약 Port, View 조회 Port·adapter·UseCase·오류·Controller·Module 조립과 이에 대한 검증이다. Frontend·본문·목록 API·즐겨찾기 mutation·schema/migration/seed/환경·배포·커밋은 제외한다. 기존 Attribute/Object/Record/View의 인증·접근·Port 패턴을 따르고 읽기에 Actor 존재를 강제하지 않는다.

## 3. 모듈별 Port와 파일 작업 범위

기본 구조는 Controller → UseCase → 공개 Query Port → owning module의 infrastructure adapter다. Nest Module 조립에서 다른 Module을 import하는 것은 가능하지만, 비즈니스 코드가 다른 모듈의 Prisma Repository를 직접 import/주입하지 않는다.

### 3.1. 새 조회 계약

| 소유 모듈 | Port·method | 반환 계약 |
| --- | --- | --- |
| view-definition | VIEW_DEFINITION_HEADER_QUERY / ViewDefinitionHeaderQuery.findWorkspaceViewHeader(input) | 순수 WorkspaceViewHeaderRecord 또는 null. View 요약·objectDefinitionId/listDefinitionId·isFavorite 포함 |
| object-definition | OBJECT_DEFINITION_SUMMARY_QUERY / ObjectDefinitionSummaryQuery.findObjectDefinitionSummary(input) | `{ id, singularName, icon }` 또는 null. id + Workspace 조건을 내부에서 적용 |
| list-definition | LIST_DEFINITION_SUMMARY_QUERY / ListDefinitionSummaryQuery.findListDefinitionSummary(input) | `{ id, name, icon }` 또는 null. id + Workspace 조건을 내부에서 적용 |

Object의 기존 ObjectDefinitionAccessQuery는 boolean만 반환한다. 해당 interface를 변경해 기존 Attribute/Record 테스트와 호출자에 영향을 주는 대신 별도 요약 Port를 추가한다. List의 Sidebar Query를 다른 모듈에서 가져와 전체 목록을 검색하지 않고, 별도 단건 요약 Port를 공개한다.

### 3.2. 신규 파일

아래 경로는 생성 예정이며 현재 구현 완료 파일이 아니다.

| 경로 | 책임 |
| --- | --- |
| BE/src/modules/view-definition/application/view-definition-type.ts | Prisma와 독립적인 11개 View 타입 |
| BE/src/modules/view-definition/application/ports/view-definition-header-query.port.ts | token, 입력, 내부 조회 결과 계약 |
| BE/src/modules/view-definition/application/use-cases/get-workspace-view-header.use-case.ts | GetWorkspaceViewHeaderUseCase, 순수 응답/소속 요약 타입과 조합 |
| BE/src/modules/view-definition/infrastructure/persistence/prisma-view-definition-header-query.repository.ts | 같은 모듈의 View/Favorite 조회와 Prisma 결과 매핑 |
| BE/src/modules/view-definition/presentation/http/user-workspace-view-definitions.controller.ts | api/users/me/workspaces/:workspaceId/view-definitions의 GET :viewDefinitionId |
| BE/src/modules/object-definition/application/ports/object-definition-summary-query.port.ts | 공개 Object 요약 계약 |
| BE/src/modules/object-definition/infrastructure/persistence/prisma-object-definition-summary-query.repository.ts | Object 요약 조회 |
| BE/src/modules/list-definition/application/ports/list-definition-summary-query.port.ts | 공개 List 요약 계약 |
| BE/src/modules/list-definition/infrastructure/persistence/prisma-list-definition-summary-query.repository.ts | List 요약 조회 |

추가 테스트 파일은 UseCase 1개, HTTP Controller 1개와 각 신규 Repository에 대응하는 `.spec.ts`로 같은 디렉터리에 둔다. module 조립은 실제 Nest DI 또는 동등한 smoke 검증으로 확인한다.

### 3.3. 수정 파일

- `BE/src/modules/view-definition/domain/view-definition.errors.ts`: 새 404 오류 4개 추가. 기존 즐겨찾기 오류 보존.
- `BE/src/modules/view-definition/infrastructure/view-definition.module.ts`: ObjectDefinitionModule/ListDefinitionModule import와 새 Controller/UseCase/자기 Query adapter 등록. 기존 즐겨찾기 provider 유지.
- `BE/src/modules/object-definition/infrastructure/object-definition.module.ts`: 새 요약 token provider·export 추가. 기존 ACCESS_QUERY 등 export 보존.
- `BE/src/modules/list-definition/infrastructure/list-definition.module.ts`: 새 요약 token provider·export 추가. 사이드바 API 동작 유지.
- 구현 후 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`, `CRM_CORE_SCHEMA_DRAFT.md`: View 헤더 GET 구현 범위만 정확히 갱신.
- 관련 계획 문서와 구현 작업일의 `TODO_LOG/.../WORK_LOG.md`: 실제 명령·결과·검토·미확인 사항 기록.

AppModule에는 이미 ViewDefinitionModule이 등록돼 있다. 중복 등록하지 않는다. Attribute/Record 모듈, 기존 Object Access Port, Workspace/Auth/shared Filter/Prisma schema와 Frontend 코드는 원칙적으로 수정하지 않는다. 예상 밖 변경이 필요하면 이유와 계약 영향을 먼저 문서화한다.

## 4. 구현 작업 순서

| 순서 | 목적·포함 범위 | 완료 기준 |
| --- | --- | --- |
| 1 | 현 작업 트리·필수 정본·계약 확인, 구현일 작업 로그 생성, Object/List 요약 Port·adapter·provider/export 추가 | 현재 Workspace의 대상만 단건 조회하며 기존 Access/Sidebar 계약을 유지 |
| 2 | 순수 View 타입·조회 Port·adapter·UseCase·DomainError·Controller·Module 조립 | API 정본 계약대로 200/400/401/403/404/500 처리. 신규 HTTP endpoint는 1개 |
| 3 | UseCase/HTTP/DB·모듈 경계 검증, 기존 Sidebar/Attribute/Record 회귀 확인 | TEST-PLAN의 검증 결과를 실패·skip까지 구분해 기록 |
| 4 | Backend 규칙 전수 대조, 발견 사항 수정 후 필요한 검증 재실행, 현황 문서·로그 갱신 | G99의 검토표와 변경 근거를 남기고 구현 완료와 검증 완료를 구분 |

한 API의 소속 검증에 필요한 내부 Object/List 읽기 추가는 이번 범위다. 관리 항목·업무 목록용 View 목록 HTTP API는 후속 작업이다. 본 계획은 /goal 생성이나 실행을 자동 요청하는 문서가 아니다.

## 5. 검증과 완료 기준

- [TEST-PLAN](TEST-PLAN.md)의 UseCase/HTTP/Repository/모듈 경계/회귀 시나리오와 필수 명령을 수행한다.
- approved Response 7개 최상위 필드와 nullable 소속을 유지하며, 외부 입력에서 멤버·소속 ID를 신뢰하지 않는다.
- Source Workspace와 개인 Favorite 범위를 실제 DB에서 확인한다. 미확인은 성공으로 합산하지 않는다.
- 타입·린트·빌드·Prisma·테스트 결과를 명령과 함께 기록한다.
- 관련 DB/API 현황과 구현 로그를 갱신하고 G99에 구현 변경 파일·검증 증거를 전달한다.
- G01 구현 완료만으로 최종 규칙 검토 완료나 Frontend 연동 완료를 선언하지 않는다.

## 6. 실행 결과 기록란

현재 문서만 작성했으며 아래 결과는 미기록이다.

| 항목 | 결과 |
| --- | --- |
| 실제 변경 파일과 이유 | 구현 후 기록 |
| 검증 명령·성공/실패/skip | 구현 후 기록 |
| 실제 DB 격리·rollback 검증 | 구현 후 기록 |
| 남은 문제와 G99 전달 사항 | 구현 후 기록 |
