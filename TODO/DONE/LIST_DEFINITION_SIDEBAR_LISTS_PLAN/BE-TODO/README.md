# 업무 목록 조회 Backend 작업

## 1. 선행 기준

- [Software 정본 참조](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- [API 계약](../COMMON/API-SPEC/SIDEBAR_LIST_DEFINITION_API.md): implemented
- [DB 설명](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md): 기존 ListDefinition/WorkspaceMember 사용

## 2. 구현

`BE/src/modules/list-definition/` 아래에 다음 파일을 추가한다.

| 계층 | 파일 | 책임 |
| --- | --- | --- |
| domain | list-definition.errors.ts | Workspace 접근 불가 오류 |
| application/ports | list-definition-sidebar-query.port.ts | 순수 조회 계약·응답 타입·DI token |
| application/use-cases | list-sidebar-list-definitions.use-case.ts | 공개 Workspace Port로 멤버십 확인 후 조회 |
| infrastructure/persistence | prisma-list-definition-sidebar-query.repository.ts | Workspace 필터·생성순 정렬·3개 필드 조회 |
| infrastructure | list-definition.module.ts | Auth/Workspace/Prisma 의존성 조립 |
| presentation/http | user-sidebar-workspace-lists.controller.ts | Guard·UUID 검증·CurrentUser 전달 |

AppModule에 등록한다. Prisma 의존성은 infrastructure에 제한하고 역할/API/기능·번호 주석을 적용한다. Workspace module의 Repository 구현체를 공유하지 않는다.

## 3. DB·검증

DB는 기존 WorkspaceMember/ListDefinition을 조회한다. transaction/DB schema/migration/index/seed/데이터 변경은 없다.

UseCase와 Controller 테스트에서 정상·빈 목록, 멤버십 차단, UUID, 인증을 확인한다. Workspace 조건·정렬·최소 필드를 코드 검토하고 AppModule 컴파일, Backend typecheck/lint/test/build 및 Prisma validate 결과를 기록한다.

2026-10-24 위 범위를 완료했다. 새 테스트 9개, 전체 45개 suite·221개 테스트와 typecheck/lint/build/Prisma validate가 통과했다. Backend 범위만 완료했으며 Frontend 연결은 별도다.
