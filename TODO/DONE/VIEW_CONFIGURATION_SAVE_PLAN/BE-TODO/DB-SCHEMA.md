# 보기 설정 DB 연결

먼저 읽기: [TODO Software Agent Reference](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [DB 정본](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [schema.prisma](../../../BE/prisma/schema.prisma).

| 모델 | 설정 저장의 영향 |
|---|---|
| ViewDefinition | 소속·타입 조회, 행 잠금, configJson 및 변경 감사 정보 수정 |
| ViewFilterGroupDefinition | filters section의 그룹 생성/수정/삭제, 부모 FK 순서 유지 |
| ViewFilterConditionDefinition | filters section의 조건 생성/수정/삭제, 그룹 FK 검증 |
| ViewSortDefinition | sorts section의 행 생성/수정/삭제 |
| ViewAttributeSettingDefinition | settings section의 표시 역할·이름·폭·숨김·순서 생성/수정/삭제 |
| ViewGroupDefinition | settings section의 그룹 기준 생성/수정/삭제 |
| ViewGroupSettingDefinition | settings section의 옵션/그룹별 이름·접힘·숨김 생성/수정/삭제 |

한 View를 잠근 하나의 READ COMMITTED transaction에서 변경 section만 반영한다. 기존 PK/createdAt/생성 Actor를 보존하고 수정 행에만 수정 감사를 기록한다. 그룹 자식부터 삭제하고 부모 참조를 연결한다. 다른 View의 ID를 차용할 수 없다. 부분 실패는 위 7개 모델의 변경 전부 rollback이다. 초안·이력 테이블은 추가하지 않는다.

대표 이름은 별도 `ObjectDefinition.recordTitleAttributeDefinitionId: UUID|null` → AttributeDefinition FK다. 삭제 시 SetNull이며 단일 소속 제약을 추가하지 않는다. 소속/타입은 application에서 Object 포인터 조회 port와 Attribute 메타데이터 공개 port를 같은 context로 조합해 검증한다. 이름이 없거나 잘못된 포인터는 임의 다른 속성으로 대체하지 않는다. View 설정 PATCH는 이 포인터를 수정하지 않는다.

기존 migration `20261112090000_object_record_title`은 이미 적용됐다. 같은 Workspace/Object의 단일 Text/PersonalName 직접 TITLE만 backfill했고 업무값은 보존했다. 이번 재검토에서 migration을 수정하거나 다시 적용하지 않는다. 새 Object 생성은 이름 속성/기본 View와 포인터를 같은 transaction으로 만든다.

읽기 영향: Workspace 멤버십·Actor, Object/List 원본, Attribute/SelectOption/StatusOption, Record/ListEntry와 속성값·관계는 각 소유 module의 공개 query port로 읽는다. Auth/User/문의 모델·업무 레코드는 설정 저장으로 생성/수정/삭제하지 않는다. 로그는 구조화 application 로그이며 DB 이력 또는 outbox는 없다.
