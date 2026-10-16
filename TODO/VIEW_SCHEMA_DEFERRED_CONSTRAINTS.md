# Object·List·View 스키마 후속 제약·인덱스 검토

- 작성일: 2026-10-16
- 상태: 후속 판단용 목록. 아래 제약과 인덱스의 추가 실행을 승인한 문서가 아님
- 현재 작업: View 10개 모델의 컬럼·기본 ID FK를 Prisma 스키마에만 작성
- 제외: 별도 조회 인덱스, 추가 UNIQUE, CHECK, 복합 소속 FK 강화, migration 생성, DB 적용, 커밋
- 기준: [Prisma 스키마](../BE/prisma/schema.prisma), [DB 규칙](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [현재 Object·List 규칙](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md), [사용자 흐름](SIDEBAR_AND_VIEW_USER_FLOW.md)
- 컬럼 대조 원본: TEMP/VIEW_TABLE_SCHEMA_DESIGN.csv. 이 CSV는 기존 검토본이며 이번 변경으로 수정하지 않음

## 1. 지금 반영한 것과 보류한 것

| 구분 | 현재 처리 | 이유 |
| --- | --- | --- |
| View 모델·컬럼 | 10개 모델, 저장 컬럼 134개를 schema.prisma에 작성 | 연결 구조와 실제 값의 저장 위치를 먼저 검토하기 위함 |
| 기본 FK | 실제 참조 ID를 부모의 PK인 id에 연결 | 추가 UNIQUE 없이 Prisma 관계를 표현할 수 있음 |
| 기본 PK·타입·기본값 | id의 PK와 UUID 기본값, 필수 컬럼, 알려진 Enum, 시간 타입·기본값 유지 | 기본 모델의 식별과 타입을 표현하는 데 필요. PK의 자동 인덱스는 별도 조회 인덱스와 구분 |
| 추가 UNIQUE·조회 인덱스·CHECK | 새로 작성하지 않음 | 사용자 판단 후 채택할 대상 |
| 복합 소속 FK | 신규 View 관계에서는 보류 | FK의 존재 확인과 Workspace/View/Attribute 소속 일치를 구분해서 검토하기 위함 |
| 기존 Object·List 제약 | 그대로 보존 | 기존 사용자 결정과 적용된 migration을 임의로 변경하지 않음 |
| revision·groupKeyHash | 신규 모델에서 제외 | 사용자 확정 사항. 이 문서의 후속 자동 추가 대상에도 포함하지 않음 |
| groupKeyJson | 유지 | 옵션 ID가 없는 담당자·텍스트·날짜·미지정 그룹의 표시 설정을 식별하기 위함 |
| comparisonOperator | 현재 String / PostgreSQL TEXT | 기존 CSV는 Enum 이름만 있고 값 목록은 미정. 임의의 연산자 목록을 확정하지 않음 |
| migration·DB·API·FE | 작업하지 않음 | 스키마 초안 작성과 실제 서비스 적용을 구분 |

기본 ID FK는 참조 행의 존재만 보장한다. 예를 들어 View와 Attribute가 각각 존재하더라도 서로 다른 Workspace에 속하는 조합을 현재 신규 FK만으로는 막지 못한다. View API의 소속 검증도 아직 구현하지 않았다. 후속 복합 FK와 API 검증을 마치기 전에 이 초안을 서비스 구현 완료 상태로 취급하지 않는다.

기존 설계 문서 TODO/VIEW_TABLE_SCHEMA_DESIGN.md는 작업 시작 시 삭제된 상태였으며 복원하지 않는다. 삭제된 설계 파일에 의존하지 않고 이 문서에 후속 항목과 이유를 기록한다.

### 1.1 신규 모델과 기본 연결

| 모델 | 저장 컬럼 수 | 공통 연결 외 기본 FK |
| --- | --- | --- |
| ViewDefinition | 14 | ObjectDefinition, ListDefinition |
| ViewAttributeSettingDefinition | 16 | ViewDefinition, AttributeDefinition |
| ViewFilterGroupDefinition | 10 | ViewDefinition, 부모 ViewFilterGroupDefinition |
| ViewFilterConditionDefinition | 15 | ViewDefinition, ViewFilterGroupDefinition, AttributeDefinition |
| ViewSortDefinition | 13 | ViewDefinition, AttributeDefinition |
| ViewGroupDefinition | 14 | ViewDefinition, AttributeDefinition |
| ViewGroupSettingDefinition | 17 | ViewDefinition, ViewGroupDefinition, AttributeDefinition, StatusOption, SelectOption |
| ViewWidgetDefinition | 13 | 소유 ViewDefinition, 내용 ViewDefinition |
| ViewWorkDependencyDefinition | 13 | 선행·후행 RecordDefinition 또는 ListEntryDefinition |
| ViewFavoriteDefinition | 9 | ViewDefinition, WorkspaceMember |

각 모델은 공통으로 Workspace와 생성·수정 Actor를 연결한다. 신규 FK는 총 56개이며 모두 단일 ID 참조다. Prisma의 역방향 relation 배열은 탐색을 위한 필드이고 실제 DB 저장 컬럼을 추가하지 않는다.

ViewWorkDependencyDefinition에는 viewDefinitionId를 추가하지 않는다. 실제 업무 관계이므로 View 삭제 때문에 업무 연결이 사라지면 안 된다.

### 1.2 현재 기본 FK의 삭제 동작

| 참조 | 스키마 초안의 onDelete | 이유·후속 판단 |
| --- | --- | --- |
| 모든 신규 모델 → Workspace | Cascade | Workspace가 소유하는 행을 정리 |
| 생성 Actor | Restrict | 생성 감사 주체의 무단 소실 방지 |
| 수정 Actor | SetNull | 행은 유지하고 선택적인 수정자 ID만 비움 |
| View → Object/List | Cascade | 원본이 없어지면 소속 View 설정 정리 |
| 하위 설정·즐겨찾기 → View | Cascade | 소유 View가 없어지면 설정 정리 |
| Attribute 참조 | NoAction | 필터·표시 의미가 조용히 바뀌지 않도록 먼저 참조 처리 필요. 현재는 지연 FK가 아님 |
| 필터 그룹 → 부모, 조건 → 그룹 | Cascade | 부모 필터 삭제 시 소유 하위 조건 정리 |
| 그룹 설정 → 그룹 기준·옵션 | Cascade | 없어진 그룹·옵션에 대한 파생 표시 설정 정리 |
| 위젯 → 내용 View | Cascade | 내용 View가 없어지면 해당 위젯만 정리. 소유 대시보드 유지 |
| 업무 관계 → Record/ListEntry | Cascade | 없어진 업무 노드의 연결 정리 |
| 즐겨찾기 → WorkspaceMember | Cascade | 구성원의 개인 즐겨찾기 정리 |

이는 스키마 초안의 연결 동작이다. 실제 migration을 만들기 전에 삭제 API 계약과 함께 다시 판단한다. 기존 ListEntryValueDefinition의 옵션 삭제 SetNull을 Cascade로 바꾸는 의미가 아니다.

### 1.3 업무 선후행 연결 타입의 명확한 이름

ViewWorkDependencyTypeEnum은 약어 대신 아래 이름을 사용한다. 앞부분은 source인 선행 업무, 뒷부분은 target인 후행 업무의 시점이다. 원안 CSV의 FS·SS·FF·SF를 현재 Prisma Enum 값으로 사용하지 않는다.

| Enum 값 | 연결 의미 |
| --- | --- |
| FINISH_TO_START | 선행 업무 종료 → 후행 업무 시작 |
| START_TO_START | 선행 업무 시작 → 후행 업무 시작 |
| FINISH_TO_FINISH | 선행 업무 종료 → 후행 업무 종료 |
| START_TO_FINISH | 선행 업무 시작 → 후행 업무 종료 |

dependencyTimeOffsetValue와 dependencyTimeOffsetUnit은 이 두 시점 사이의 간격을 표현한다. 이름 명확화만 수행하며 음수 간격이나 일정 자동 이동 정책을 새로 확정하지 않는다.

## 2. 후속 복합 FK에 필요한 참조 UNIQUE

아래 UNIQUE는 같은 이름의 업무 데이터를 금지하려는 규칙이 아니다. PostgreSQL에서 해당 컬럼 조합을 복합 FK의 부모 키로 참조하기 위한 기술적 키다. 이번에는 하나도 추가하지 않는다.

| 부모 테이블 | 검토할 UNIQUE | 필요한 자식 연결 | 이유 |
| --- | --- | --- | --- |
| ViewDefinition | (id, workspaceId) | 하위 설정, 위젯, 즐겨찾기 | View와 자식의 Workspace 일치 |
| ViewFilterGroupDefinition | (id, viewDefinitionId, workspaceId) | 부모 필터 그룹, 필터 조건 | 같은 Workspace의 같은 View 안에서만 필터 연결 |
| ViewGroupDefinition | (id, viewDefinitionId, attributeDefinitionId, workspaceId) | ViewGroupSettingDefinition | 그룹 기준·View·Attribute·Workspace 일치 |
| AttributeDefinition | (id, workspaceId) | View 표시·필터·정렬·그룹·그룹 설정 | 공용 Attribute의 Workspace 일치 |
| ListEntryDefinition | (id, workspaceId) | 업무 선후행 관계 | List ID를 따로 저장하지 않는 의존 관계의 Workspace 일치 |
| AttributeDefinition | (id, objectDefinitionId, workspaceId) | 기존 Record 값과 Relationship의 Object 속성 연결 강화 후보 | 해당 Attribute가 같은 Object에 속하는지까지 보장. 기존 Object 영역 보완을 채택할 때만 검토 |

ObjectDefinition, ListDefinition, RecordDefinition, Actor, WorkspaceMember의 (id, workspaceId)와 RecordDefinition의 (id, objectDefinitionId, workspaceId), 옵션의 (id, attributeDefinitionId, workspaceId)는 이미 존재하므로 재생성하지 않는다.

## 3. 신규 View 관계의 복합 FK 강화 후보

아래의 모든 조합은 후속 검토 대상이다. 현재 기본 ID FK가 자동으로 같은 소속까지 보장한다고 설명하지 않는다.

| 자식 연결 | 검토할 자식 컬럼 → 부모 키 | 이유 |
| --- | --- | --- |
| 생성·수정 Actor | (createdByActorId 또는 updatedByActorId, workspaceId) → Actor.(id, workspaceId) | 다른 Workspace Actor 연결 방지 |
| View → Object | (objectDefinitionId, workspaceId) → ObjectDefinition.(id, workspaceId) | 다른 Workspace Object 연결 방지 |
| View → List | (listDefinitionId, workspaceId) → ListDefinition.(id, workspaceId) | 다른 Workspace List 연결 방지 |
| 하위 설정·위젯·즐겨찾기 → View | (viewDefinitionId, workspaceId) → ViewDefinition.(id, workspaceId) | View와 자식의 소속 일치 |
| 표시·조건·정렬·그룹·그룹 설정 → Attribute | (attributeDefinitionId, workspaceId) → AttributeDefinition.(id, workspaceId) | 다른 Workspace의 필드 참조 방지 |
| 필터 그룹 → 부모 | (parentViewFilterGroupDefinitionId, viewDefinitionId, workspaceId) → ViewFilterGroupDefinition.(id, viewDefinitionId, workspaceId) | 다른 View의 그룹을 부모로 지정하는 오류 방지 |
| 조건 → 필터 그룹 | (viewFilterGroupDefinitionId, viewDefinitionId, workspaceId) → ViewFilterGroupDefinition.(id, viewDefinitionId, workspaceId) | 조건과 필터 그룹의 소속 일치 |
| 그룹 설정 → 그룹 기준 | (viewGroupDefinitionId, viewDefinitionId, attributeDefinitionId, workspaceId) → ViewGroupDefinition.(id, viewDefinitionId, attributeDefinitionId, workspaceId) | 그룹 설정의 도출 Attribute와 소속 일치 |
| 그룹 설정 → 상태 | (statusOptionId, attributeDefinitionId, workspaceId) → StatusOption.(id, attributeDefinitionId, workspaceId) | 다른 필드의 상태를 그룹 설정에 연결하는 오류 방지 |
| 그룹 설정 → 선택값 | (selectOptionId, attributeDefinitionId, workspaceId) → SelectOption.(id, attributeDefinitionId, workspaceId) | 다른 필드의 선택값 연결 방지 |
| 위젯 → 내용 View | (contentViewDefinitionId, workspaceId) → ViewDefinition.(id, workspaceId) | 다른 Workspace의 View를 위젯에 연결하는 오류 방지 |
| 업무 관계 → Record | (sourceRecordDefinitionId 또는 targetRecordDefinitionId, workspaceId) → RecordDefinition.(id, workspaceId) | 업무 연결의 Workspace 일치 |
| 업무 관계 → ListEntry | (sourceListEntryDefinitionId 또는 targetListEntryDefinitionId, workspaceId) → ListEntryDefinition.(id, workspaceId) | 업무 참여 항목 연결의 Workspace 일치 |
| 즐겨찾기 → 구성원 | (workspaceMemberId, workspaceId) → WorkspaceMember.(id, workspaceId) | 즐겨찾기 소유 구성원의 Workspace 일치 |

복합 FK만으로는 JSON 참조 경로의 마지막 Attribute 소속, 연결 경로의 유효성, Object View의 RECORD 시작점, List View의 LIST_ENTRY 소속 일치를 전부 검사할 수 없다. 이 부분은 API 검증도 함께 설계한다.

선택적인 수정 Actor를 복합 FK로 바꾸면 일반 SetNull은 필수 workspaceId까지 비우려 할 수 있다. 채택 시에는 기존 List 값과 같은 컬럼 지정 ON DELETE SET NULL 규칙을 migration SQL로 검토하고 workspaceId를 nullable로 바꾸지 않는다.

Attribute 참조를 지연 FK로 채택할 경우 NO ACTION / DEFERRABLE INITIALLY DEFERRED와 참조 설정 정리를 같은 트랜잭션에서 검토한다. 현재 NoAction만으로 지연 검사가 구현된 것은 아니다.

## 4. 기존 Object·List 영역의 현황과 보완 후보

| 영역 | 현재 상태 | 후속 검토 | 이유·주의 |
| --- | --- | --- | --- |
| ObjectDefinition·ListDefinition | (workspaceId, apiSlug), (id, workspaceId) UNIQUE 존재 | 유지 | 코드용 이름 중복 방지와 Workspace 복합 FK 지원 |
| AttributeDefinition → Object | Object ID 단일 FK | (objectDefinitionId, workspaceId) 복합 FK 후보 | Object와 Attribute의 Workspace 일치 강화. 부모 키는 이미 존재 |
| RecordDefinition → Object | Object ID 단일 FK | (objectDefinitionId, workspaceId) 복합 FK 후보 | Record와 Object의 Workspace 일치 강화 |
| Record 값 → 원본 Record | Record ID와 Object ID가 각각 단일 FK | (recordDefinitionId, objectDefinitionId, workspaceId) → RecordDefinition.(id, objectDefinitionId, workspaceId) 후보 | 값이 참조하는 Record가 같은 Object·Workspace에 속하는지 보장 |
| Record 값 → Attribute | Attribute ID 단일 FK | (attributeDefinitionId, objectDefinitionId, workspaceId) 복합 FK 후보 | Object 값에 다른 Object 또는 List의 Attribute가 연결되는 오류 방지. 새 부모 UNIQUE 검토 필요 |
| Record 값 → 상태·선택 옵션 | 옵션 ID 단일 FK | (옵션 ID, attributeDefinitionId, workspaceId) 복합 FK 후보 | 다른 Attribute의 옵션 선택 방지. 부모 키는 이미 존재 |
| Record 값 → 대상 Record·Object·Actor | 각각 단일 ID FK | 기존 List 값과 같은 복합 참조 방식 후보 | 대상의 Workspace와 Record/Object 일치 강화. 참조 쌍 CHECK와 삭제 동작도 함께 검토 |
| 기존 CRM 생성·수정 Actor | 여러 모델에서 Actor ID 단일 FK | (Actor ID, workspaceId) 후보 | 감사 주체의 Workspace 일치. 모델별 삭제 정책 보존 필요 |
| RelationshipDefinition | 양쪽 Object·Attribute가 각각 단일 ID FK | Object/Workspace 및 Attribute/Object/Workspace 복합 FK 후보 | 연결 속성의 Object 소속과 Workspace 일치. RecordReference 타입·양방향 갱신은 별도 API 검증 |
| ListEntryDefinition | List·Record의 Workspace 복합 FK 존재 | 유지 | 이미 같은 Workspace 참여 항목을 보장 |
| ListEntryValueDefinition | Entry·Attribute의 List/Workspace, 옵션·참조의 복합 FK 존재 | 유지 | 이미 적용된 소속 검증을 중복 추가하지 않음 |
| ListEntryDefinition의 (listDefinitionId, recordDefinitionId) | UNIQUE 없음 | 추가하지 않음. 중복 참여 정책은 별도 판단 | 누락으로 단정하면 기존 허용 가능성을 바꾸게 됨 |
| Record/Entry 값의 (행 ID, Attribute ID) | 일괄 UNIQUE 없음 | 단순 조합 UNIQUE 추가하지 않음 | 다중값을 여러 행으로 표현할 수 있어 정상 데이터를 막을 수 있음 |
| List의 부모 Object | 현재 해당 FK 컬럼 없음 | 정책 확정 전 추가하지 않음 | 이번 View 스키마 초안의 범위가 아님 |

위 후보는 기존 데이터 불일치가 있다는 진단 결과가 아니다. 이번 작업에서는 DB에 접속하거나 기존 데이터 정합성을 검사하지 않았다. 채택 전에 실제 데이터와 API 저장 경로를 먼저 확인한다.

### 4.1 이미 적용된 SQL 전용 규칙 보존

| 기존 대상 | 유지할 규칙 | 이유 |
| --- | --- | --- |
| AttributeDefinition | objectDefinitionId/listDefinitionId 중 정확히 하나 CHECK | 공용 속성의 소속을 명확히 유지 |
| ListEntryValueDefinition | targetRecordDefinitionId/targetObjectDefinitionId 동시 지정 또는 동시 NULL CHECK | 참조 쌍 일부만 채워 복합 FK 검사를 우회하는 상황 방지 |
| List 값의 옵션·Actor | 해당 nullable 참조 ID만 SET NULL | 값 행과 필수 Workspace/List/Attribute ID 보존 |
| List 값의 대상 Record | 대상 Record/Object ID 두 개만 함께 SET NULL | 다른 소속 ID를 유지하며 참조 해제 |
| List 값의 대상 Object FK | NO ACTION / DEFERRABLE INITIALLY DEFERRED | Object 삭제 후 Record cascade와 참조 해제의 실행 순서 허용 |
| SelectOption·StatusOption.color | 기본값 없는 nullable TEXT | 색상 형식 제약·기존 데이터 backfill을 임의로 추가하지 않음 |

Prisma validate의 기존 SetNull 경고 4건을 없애려고 필수 소속 컬럼을 nullable로 바꾸지 않는다. 이미 적용된 migration 이력도 수정하지 않는다.

## 5. 추가 UNIQUE 후보와 이유

2절의 FK 참조 키와 아래 업무 중복 방지용 UNIQUE를 구분한다. 모두 이번에는 추가하지 않는다.

| 테이블 | 검토할 UNIQUE | 조건·이유 |
| --- | --- | --- |
| ViewFilterGroupDefinition | (workspaceId, viewDefinitionId) | parentViewFilterGroupDefinitionId IS NULL인 행에만 적용. 루트 그룹 최대 1개 |
| ViewGroupSettingDefinition | (workspaceId, viewGroupDefinitionId, statusOptionId) | statusOptionId IS NOT NULL인 행에만 적용. 상태 그룹 설정 중복 방지 |
| ViewGroupSettingDefinition | (workspaceId, viewGroupDefinitionId, selectOptionId) | selectOptionId IS NOT NULL인 행에만 적용. 선택값 그룹 설정 중복 방지 |
| ViewFavoriteDefinition | (workspaceId, workspaceMemberId, viewDefinitionId) | 같은 구성원의 같은 View 중복 즐겨찾기 방지 |
| ViewWorkDependencyDefinition | (workspaceId, sourceRecordDefinitionId, targetRecordDefinitionId, type) | 해당 양쪽 ID가 있는 행에만 적용. Record → Record 연결 중복 방지 |
| ViewWorkDependencyDefinition | (workspaceId, sourceRecordDefinitionId, targetListEntryDefinitionId, type) | 해당 양쪽 ID가 있는 행에만 적용. Record → Entry 연결 중복 방지 |
| ViewWorkDependencyDefinition | (workspaceId, sourceListEntryDefinitionId, targetRecordDefinitionId, type) | 해당 양쪽 ID가 있는 행에만 적용. Entry → Record 연결 중복 방지 |
| ViewWorkDependencyDefinition | (workspaceId, sourceListEntryDefinitionId, targetListEntryDefinitionId, type) | 해당 양쪽 ID가 있는 행에만 적용. Entry → Entry 연결 중복 방지 |
| ViewAttributeSettingDefinition | (workspaceId, viewDefinitionId, attributeDisplayRole) | TITLE·IMAGE·START_DATE·END_DATE·LOCATION·PROGRESS를 하나씩만 허용하는 renderer 계약을 채택할 때만 부분 UNIQUE 검토 |

View 이름과 sortOrder에는 일괄 UNIQUE를 추가하지 않는다. 같은 Attribute를 다른 경로·역할로 사용할 수 있으므로 (View, Attribute) 조합도 일괄 UNIQUE로 묶지 않는다. 동일 View를 여러 위치에 배치할 수 있으므로 위젯의 (소유 View, 내용 View)에도 중복 금지 정책을 자동 추가하지 않는다.

### 5.1 groupKeyHash 제외 후 옵션 외 그룹의 중복 처리

groupKeyHash 컬럼과 그 컬럼을 사용하는 UNIQUE는 제외한다. 별도 해시 컬럼이나 해시 표현식 인덱스로 몰래 대체하지 않는다.

groupKeyJson에 직접 UNIQUE를 적용할지는 키 규격과 크기를 먼저 확인한 뒤 판단한다. JSONB는 B-tree 인덱스를 지원하지만 임의 길이 문자열을 포함하는 그룹 키 전체를 항상 인덱싱할 수 있다고 가정하지 않는다.

대안으로 API 트랜잭션에서 같은 ViewGroupDefinition 행을 잠근 뒤 동일하게 정규화된 JSON 키를 검사하고 저장하는 방식을 검토할 수 있다. 단순 사전 조회만으로 동시 생성의 중복이 방지되는 것은 아니며, 이 방식은 DB UNIQUE 보장이 아니라 모든 저장 경로가 따라야 하는 규칙이다. 현재 해당 API나 잠금 처리는 구현하지 않았다.

## 6. CHECK 및 API 검증 후보

| 대상 | 검토할 조건 | 이유·검증 위치 |
| --- | --- | --- |
| ViewDefinition | 일반 View는 Object/List 중 정확히 하나 | 데이터 원본 명확화. DB CHECK 후보 |
| DASHBOARD | 선택적 Object/List 소속을 허용하면 최대 하나 | 정책 미정. 정책 채택 후 CHECK 결정 |
| ViewDefinition.name | 빈 이름·공백뿐인 이름 금지 | 화면에서 식별 가능한 이름. DB/API 규칙 검토 |
| 표시 설정 width | NULL 또는 양수 | 유효한 열 너비. DB CHECK 후보 |
| 참조 경로 JSON | 배열과 유효한 RecordReference 경로 | 최상위 모양은 CHECK 후보, 내부 ID·속성 타입·경로 연결은 API |
| configJson·formatJson·layoutJson | 용도별 JSON 객체·허용 키·자료형 | 최상위 모양과 API 스키마 검증을 구분. 비교값 JSON에는 객체 조건을 일괄 적용하지 않음 |
| 필터 부모 | 자기 자신을 부모로 지정 금지 | DB CHECK 후보. 여러 행의 순환과 루트 연결 상태는 API |
| 비교 연산자 | 속성 타입·연산자·비교값·ANY/ALL 조합 | 현재 String이며 허용 목록 미정. API 계약과 Enum 채택 여부 후속 판단 |
| 그룹 설정 | statusOptionId/selectOptionId/groupKeyJson 중 정확히 하나 | 그룹 식별 방식의 중복·누락 방지. DB CHECK 후보 |
| groupKeyJson | SQL NULL 또는 JSON 객체, 타입별 정규화 | 옵션 외 그룹의 동일성 판단. JSON null과 SQL NULL 구분 |
| 위젯 | 소유 View와 내용 View가 다른 ID | 직접 자기 참조 방지. DB CHECK 후보 |
| 위젯 소유자 | 소유 View가 DASHBOARD인지 확인 | 다른 행의 type을 읽어야 하므로 일반 CHECK가 아닌 API 검증 |
| 중첩 대시보드 | 허용 여부와 전체 순환 검사 | 사용자 동작 정책 미정. API 계약 대상 |
| 업무 관계 | 선행 Record/Entry 중 정확히 하나, 후행도 정확히 하나 | 노드 종류의 배타적 선택. DB CHECK 후보 |
| 업무 관계 | 같은 종류의 동일 노드를 자기 자신에게 연결 금지 | DB CHECK 후보. 여러 노드의 순환·음수 간격·일정 자동 이동은 별도 정책 |
| 원본 데이터 조회 | Object 행은 Record ID, List 행은 Entry ID로 식별 | 같은 원본 Record의 여러 ListEntry를 구분 |
| View·즐겨찾기 접근 | 현재 구성원의 원본 접근 권한 확인 | FK는 권한을 부여하지 않음. API 검증 |
| 기본 View | 순서상 첫 View와 마지막 선택 복원 우선순위 | 정책 미정. 개인 설정이 필요하면 별도 설계 |
| 상대 날짜 | User.timeZone의 IANA 시간대로 경계 계산 | DATE와 UTC TIMESTAMPTZ 비교를 구분. 조회 API에서 평가 |

## 7. 신규 View 조회 인덱스 후보

다음 23개는 이전 설계에서 검토한 조회 인덱스다. 이번 스키마에는 작성하지 않는다. 실제 API 쿼리, 데이터량, 정렬·페이지네이션 계약과 실행 계획을 보고 필요한 것만 채택한다.

| 테이블 | 후보 컬럼 조합 | 이유·조건 |
| --- | --- | --- |
| ViewDefinition | (workspaceId, objectDefinitionId, sortOrder, id) | Object별 View 목록. Object ID가 있는 행만 |
| ViewDefinition | (workspaceId, listDefinitionId, sortOrder, id) | List별 View 목록. List ID가 있는 행만 |
| ViewDefinition | (workspaceId, sortOrder, id) | 원본 소속 없는 DASHBOARD 목록. 대시보드 소속 정책 확정 필요 |
| ViewAttributeSettingDefinition | (workspaceId, viewDefinitionId, sortOrder, id) | 표시 설정 순서 조회 |
| ViewAttributeSettingDefinition | (workspaceId, attributeDefinitionId) | Attribute 참조 설정 정리 |
| ViewFilterGroupDefinition | (workspaceId, viewDefinitionId, parentViewFilterGroupDefinitionId, sortOrder, id) | 부모별 하위 그룹 조회 |
| ViewFilterConditionDefinition | (workspaceId, viewDefinitionId, viewFilterGroupDefinitionId, sortOrder, id) | 그룹별 조건 조회 |
| ViewFilterConditionDefinition | (workspaceId, attributeDefinitionId) | Attribute 참조 조건 정리 |
| ViewSortDefinition | (workspaceId, viewDefinitionId, sortOrder, id) | 정렬 우선순위 조회 |
| ViewSortDefinition | (workspaceId, attributeDefinitionId) | Attribute 참조 정렬 정리 |
| ViewGroupDefinition | (workspaceId, viewDefinitionId, groupRole, sortOrder, id) | 역할별 그룹 기준 조회 |
| ViewGroupDefinition | (workspaceId, attributeDefinitionId) | Attribute 참조 그룹 정리 |
| ViewGroupSettingDefinition | (workspaceId, viewDefinitionId, viewGroupDefinitionId, sortOrder, id) | 개별 그룹 설정 조회 |
| ViewGroupSettingDefinition | (workspaceId, attributeDefinitionId, statusOptionId) | 상태 옵션 참조 정리. 상태 ID가 있는 행만 |
| ViewGroupSettingDefinition | (workspaceId, attributeDefinitionId, selectOptionId) | 선택 옵션 참조 정리. 선택 ID가 있는 행만 |
| ViewWidgetDefinition | (workspaceId, viewDefinitionId, sortOrder, id) | 소유 대시보드의 위젯 조회 |
| ViewWidgetDefinition | (workspaceId, contentViewDefinitionId) | 특정 View를 표시하는 위젯 조회 |
| ViewWorkDependencyDefinition | (workspaceId, sourceRecordDefinitionId) | Record의 후행 연결 조회. 해당 ID가 있는 행만 |
| ViewWorkDependencyDefinition | (workspaceId, targetRecordDefinitionId) | Record의 선행 연결 조회. 해당 ID가 있는 행만 |
| ViewWorkDependencyDefinition | (workspaceId, sourceListEntryDefinitionId) | Entry의 후행 연결 조회. 해당 ID가 있는 행만 |
| ViewWorkDependencyDefinition | (workspaceId, targetListEntryDefinitionId) | Entry의 선행 연결 조회. 해당 ID가 있는 행만 |
| ViewFavoriteDefinition | (workspaceId, workspaceMemberId, sortOrder, id) | 개인 즐겨찾기 순서 조회 |
| ViewFavoriteDefinition | (viewDefinitionId, workspaceId) | 특정 View의 즐겨찾기 정리 |

PK·UNIQUE가 만드는 인덱스와 중복되는 일반 인덱스는 만들지 않는다. JSON은 주로 View ID로 읽으므로 모든 JSONB 컬럼에 GIN 인덱스를 일괄 추가하지 않는다.

## 8. 기존 Object·List 조회 인덱스 판단

### 8.1 명시적으로 제거한 Record 인덱스

2026-09-29 Git 커밋 b7006596은 다음 두 인덱스 선언과 미적용 migration 파일을 제거했다. 파일에 없다는 이유만으로 누락이라 판단하거나 자동 복원하지 않는다. 이 이력은 실제 DB에서 DROP INDEX를 실행했다는 증거와 구분한다.

| 테이블 | 제거했던 조합 | 현재 쿼리와의 관계 |
| --- | --- | --- |
| RecordDefinition | (workspaceId, objectDefinitionId, createdAt, id) | Object별 Record 생성순 커서 조회와 일치 |
| RecordAttributeValueDefinition | (workspaceId, objectDefinitionId, recordDefinitionId) | 현재 페이지 Record의 값 일괄 조회와 일치 |

실제 조회 근거: [Record 조회 repository](../BE/src/modules/record-definition/infrastructure/persistence/prisma-record-definition-list-query.repository.ts), [속성 생성 시 Record 조회](../BE/src/modules/record-definition/infrastructure/persistence/prisma-record-attribute-value-definition-materializer.ts).

복원 여부는 대표 데이터에서의 실제 조회 비용과 실행 계획을 보고 결정한다. Record 값의 (workspaceId, recordDefinitionId, attributeDefinitionId)도 검토 가능한 다른 조합이지만 위 인덱스와 목적이 겹치므로 둘을 함께 자동 생성하지 않는다.

### 8.2 유지할 기존 인덱스와 후속 성능 후보

| 대상 | 현재 상태 또는 후보 | 판단 이유 |
| --- | --- | --- |
| AttributeDefinition | Object/List 정렬·소속 조회 인덱스 4개 존재 | 현재 조회를 지원하므로 그대로 유지 |
| ListEntryDefinition | (workspaceId, listDefinitionId, createdAt, id), (workspaceId, recordDefinitionId) 존재 | List 참여 항목 조회 지원 |
| ListEntryValueDefinition | (workspaceId, listEntryDefinitionId, attributeDefinitionId), (workspaceId, listDefinitionId, attributeDefinitionId) 존재 | Entry별·List 속성별 값 조회 지원 |
| ObjectDefinition·ListDefinition | Workspace/apiSlug UNIQUE 인덱스 존재 | 별도 workspaceId 단독 인덱스를 중복 추가하기 전에 현재 쿼리 확인 |
| RecordAttributeValueDefinition | (workspaceId, objectDefinitionId, attributeDefinitionId, numberValue, recordDefinitionId) 후보 | 숫자 범위 필터·정렬. numberValue IS NOT NULL 부분 인덱스 채택 여부 검토 |
| ListEntryValueDefinition | (workspaceId, listDefinitionId, attributeDefinitionId, dateValue, listEntryDefinitionId) 후보 | 마감일 필터·정렬. dateValue IS NOT NULL 조건 검토 |
| ListEntryValueDefinition | (workspaceId, listDefinitionId, attributeDefinitionId, statusOptionId, listEntryDefinitionId) 후보 | 칸반 단계별 Entry 조회. statusOptionId IS NOT NULL 조건 검토 |

날짜·숫자·상태 후보를 모든 속성 타입에 일괄 확장하지 않는다. Timestamp는 별도 컬럼을 쓰고, 다중값·참조 경로·집계 조회는 다른 실행 계획을 가질 수 있다. List API가 아직 없는 상태에서 모든 성능 인덱스를 필수로 확정하지 않는다.

## 9. 나중에 적용하기 전에 확인할 순서

1. 사용자 흐름과 API 저장·조회·삭제 계약을 확정한다. 기본 View, 그룹 키, 비교 연산자, 중첩 대시보드, 의존 관계 정책을 구분한다.
2. 이 문서의 각 후보를 채택·보류·제외로 판단한다. 임의의 도메인 UNIQUE를 추가하지 않는다.
3. 복합 FK를 채택하면 필요한 부모 UNIQUE와 기존 데이터 정합성을 먼저 검사한다. 불일치를 숨기기 위한 임의 row 생성·값 덮어쓰기·삭제를 하지 않는다.
4. 대표 조회와 실행 계획으로 인덱스를 판단하고 중복·쓰기 비용을 확인한다.
5. 사용자 지시 후에만 새 migration을 작성한다. 이미 적용된 migration은 수정하지 않고 SQL 전용 CHECK·부분 인덱스·컬럼 지정 SetNull·지연 FK를 보존한다.
6. DB 적용 전 rollback, 기존 데이터 보존, API 소속 검증, 삭제 결과와 순환·중복 처리를 검증한다.

이번 작업은 위 순서의 후속 실행을 시작하지 않는다. 스키마 초안의 임시 소유 영역은 CRM core이며, 실제 View/List module과 API를 만들 때 application 계층이 권한·트랜잭션 경계를 소유하도록 별도 계약을 작성한다.
