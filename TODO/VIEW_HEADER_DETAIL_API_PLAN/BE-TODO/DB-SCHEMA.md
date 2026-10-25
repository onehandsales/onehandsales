# View 헤더 DB 읽기 범위와 소유권

- 스키마: [schema.prisma](../../../BE/prisma/schema.prisma)
- 근거: [DB 현황](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [CRM Core 스키마](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md)
- 조건·transaction·로그 계약 정본: [API-SPEC](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
- schema/migration/seed/인덱스·UNIQUE·CHECK 변경 없음

## 1. 조회 소유권

| 데이터 | 소유 모듈 | 이번 용도 |
| --- | --- | --- |
| WorkspaceMember | workspace | 인증 사용자 + Workspace에서 멤버 ID 확인 |
| ViewDefinition | view-definition | View 요약·두 부모 ID |
| ViewFavoriteDefinition | view-definition | Workspace·멤버·현재 View에 대한 존재 여부 |
| ObjectDefinition | object-definition | 소속 Object id/singularName/icon 공개 요약 |
| ListDefinition | list-definition | 소속 List id/name/icon 공개 요약 |

View 모듈이 자신의 View/Favorite 데이터를 조회하고 Object/List/Workspace 데이터는 공개 application Query Port로 확인한다. 다른 모듈 persistence를 import하거나 AppModule의 이미 등록된 View 모듈을 중복 등록하지 않는다.

## 2. 스키마로 확인되는 제약

- WorkspaceMember는 Workspace·사용자 조합으로 찾는다. 클라이언트 멤버 ID를 받지 않는다.
- View의 objectDefinitionId와 listDefinitionId는 nullable이다. 둘 다 null/둘 다 존재를 금지하는 API 제약을 새로 만들지 않는다.
- View 관계의 단일 ID FK는 같은 Workspace 소속까지 보장하지 않는다. 부모 조회에도 Workspace 조건을 적용한다.
- Favorite의 멤버·View 조합에 추가 UNIQUE가 없다. 이번 GET은 존재 여부만 읽고 중복 행을 정리하거나 정책을 확정하지 않는다.
- 이름은 Object.singularName/List.name에서 가져오며 실제 Record 값과 구분한다.

## 3. 접근하지 않을 데이터와 검증

Attribute/Record/ListEntry의 값과 View 하위 설정·필터·정렬·그룹·위젯·업무 의존 관계는 읽지 않는다. 조회 때문에 데이터를 생성·수정·삭제하거나 기본 View를 만들지 않는다.

실제 DB 검증은 [TEST-PLAN](TEST-PLAN.md)에 따라 명시한 테스트 DB의 rollback fixture로 수행한다. 이번 문서 작성이나 기존 즐겨찾기 검증 결과를 새 API의 DB 성공으로 기록하지 않는다.

구현 후 DB 현황 문서에는 이 GET의 구현 범위만 갱신한다. 실제 스키마가 바뀐 것처럼 기록하지 않는다.
