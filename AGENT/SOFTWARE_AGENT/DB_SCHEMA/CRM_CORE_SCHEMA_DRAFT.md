# CRM Core Schema Draft

Status: Partially Implemented / Remaining Design Draft
Date: 2026-10-08

## 1. 목적

이 문서는 OneHand CRM의 후속 CRM Core를 DB schema 관점에서 검토하기 위한 초안이다. 일부 코어 모델은 이미 구현되어 있으므로 현재 구현 이름과 필드는 `BE/prisma/schema.prisma`와 이 폴더의 `README.md`를 기준으로 한다. 아래 후보 표는 초기 개념명이며 현재 Prisma 모델 목록을 의미하지 않는다.

미구현 후보는 Prisma migration 지시서가 아니다. 후속 기능 구현 전 해당 PM 정책, UX flow와 Backend API 계약을 확인해야 한다. 사용자가 확정한 Attribute 소속 확장은 아래 9절에 별도로 기록한다.

## 2. 설계 원칙

- 고정형 Company/Product/Deal 테이블을 되살리지 않는다.
- 사용자 화면은 Kit의 업무 언어를 쓰지만, 내부 모델은 Workspace, Kit, Object, Attribute, Relationship, Record 중심으로 설계한다.
- 첫 MVP는 복잡한 schema builder보다 Kit 적용, 첫 Record 생성, 기본 List/View 조회를 우선한다.
- Team/조직 권한은 후속 범위로 두고, MVP는 개인 Workspace 기준을 우선한다.
- 모든 사용자 데이터 row는 Workspace ownership 경계를 가져야 한다.

## 3. 후보 모델

후보 모델은 아래처럼 나눌 수 있다.

| 후보 모델 | 책임 |
| --- | --- |
| `Workspace` | 사용자의 CRM 데이터 경계 |
| `WorkspaceMember` | 후속 Team/권한 확장을 위한 후보. MVP에서는 보류 가능 |
| `KitDefinition` | 제품이 제공하는 Kit 정의 |
| `WorkspaceKit` | Workspace에 적용된 Kit snapshot |
| `ObjectDefinition` | Kit 또는 Workspace 안의 관리 대상 정의 |
| `AttributeDefinition` | Object의 입력/표시 필드 정의 |
| `RelationshipDefinition` | Object 간 연결 정의 |
| `Record` | 실제 업무 기록 |
| `RecordValue` | Record의 attribute 값 저장 후보 |
| `RecordRelationship` | Record 간 연결 저장 후보 |
| `ViewDefinition` | 기본 목록/상태별 보기/예정 보기 정의 |

구현 메모:

- `ObjectDefinition.icon`은 화면 표시용 nullable 문자열이다.
- `AttributeDefinition.icon`도 화면 표시용 nullable 문자열로 둔다.
- `AttributeDefinition.configJson`은 타입별 설정을 담는 nullable JSON 값으로 둔다.
- `AttributeDefinition.sortOrder`는 AttributeDefinition 정렬 순서를 저장하는 정수 값으로 둔다.

## 4. Kit snapshot 원칙

Kit은 단순 템플릿 파일이 아니다.

DB 설계에서는 Kit 변경이 기존 Workspace와 Record에 주는 영향을 줄이기 위해 snapshot 전략을 우선 검토한다.

검토 기준:

- `KitDefinition`은 제품이 제공하는 원본 정의다.
- `WorkspaceKit`은 사용자가 시작한 시점의 Kit 적용 상태를 보존한다.
- Kit이 업데이트되어도 기존 Workspace가 자동으로 깨지면 안 된다.
- Kit 변경/추가/마이그레이션 정책은 PM 결정 후 구현한다.

## 5. Record 값 저장 방식 검토

`RecordValue`는 유연성을 주지만 query와 validation 비용이 커진다.

구현 전 검토해야 할 항목:

- 필드 타입별 validation 위치
- 필수 field와 optional field 처리
- list row에서 자주 읽는 핵심 attribute의 조회 최적화
- 검색/index 전략
- 정렬/필터 가능한 값의 저장 방식
- audit, 삭제, 복구, 병합의 후속 범위

첫 MVP에서는 고급 field builder보다 Kit별 필수 입력과 기본 보기 성능을 우선한다.

## 6. Relationship 저장 방식 검토

Relationship은 OneHand CRM이 단순 목록 앱이 아니라 CRM인 이유다.

검토 기준:

- Relationship definition은 Object 간 허용 관계를 설명한다.
- Record relationship은 실제 두 Record의 연결을 저장한다.
- 관계 이름은 Kit별 업무 언어로 표시되어야 한다.
- 양방향 조회가 필요한 관계는 index와 API response shape를 함께 설계한다.

## 7. 제외 범위

이 draft는 아래를 확정하지 않는다.

- 최종 Prisma model 이름과 field 이름
- migration 순서
- Team/seat 권한 모델
- billing/entitlement schema
- 자동화 workflow schema
- 대량 import/export schema
- analytics schema

## 8. 구현 착수 전 필요한 결정

- 첫 Kit 확정
- 한 사용자와 Workspace의 관계
- 한 Workspace에 여러 Kit을 적용할 수 있는지
- Kit 변경 시 기존 Record 보존 방식
- MVP에서 커스터마이즈 가능한 범위
- 목록 조회 성능을 위한 index/read model 전략

## 9. 선행 구현: AttributeDefinition 소속 확장

2026-10-08의 선행 작업은 기존 `AttributeDefinition`의 컬럼, 소속 제약, 중복 방지와 조회 인덱스 확장이다. 이후 사용자가 세 List 테이블 생성을 요청했으며, 현재 구현은 10절에 기록한다. List API와 View는 후속 작업이다.

| 항목 | 현재 구현 |
| --- | --- |
| `objectDefinitionId` | nullable로 변경. 기존 Object FK 유지 |
| `listDefinitionId` | nullable UUID 컬럼 추가. 현재 같은 Workspace의 List FK까지 연결 |
| 소속 제약 | 두 ID 중 정확히 하나만 값이 있도록 DB CHECK 적용 |
| Object별 slug 중복 방지 | 기존 `(objectDefinitionId, apiSlug)` 유지 |
| List별 slug 중복 방지 | `(listDefinitionId, apiSlug)` 추가 |
| List 정렬 조회 | `(listDefinitionId, sortOrder, id)` 인덱스 추가 |
| Workspace/List 조회 | `(workspaceId, listDefinitionId, id)` 인덱스 추가 |

- 소속 type 컬럼은 추가하지 않는다. 기존 `AttributeDefinition.type`은 값 타입을 뜻한다.
- Object ID와 List ID가 둘 다 null이거나 둘 다 값이 있으면 INSERT/UPDATE를 거부한다. CHECK는 Prisma schema에서 선언하지 못하므로 migration SQL로 관리한다.
- 서로 다른 Object/List에서는 같은 slug를 사용할 수 있다. 옵션은 기존 `SelectOption`, `StatusOption`에서 각 Attribute에 소속된 row로 관리한다.
- 선행 작업에서는 List FK 없이 컬럼만 준비했고, 10절의 후속 migration에서 Workspace 경계와 FK를 연결했다.
- 기존 Object Attribute API와 Record 값 초기화의 Workspace/Object 범위는 유지한다. API 계약이나 Application transaction 범위는 바뀌지 않는다.
- 기존 Attribute, Record와 값 row를 갱신하거나 삭제하는 데이터 migration은 없다.

Migration 이력과 범위 정정:

- `20261008010000_share_attribute_definition_with_lists`는 최초 적용 때 List 기본 테이블까지 포함했다. 이미 DB에 적용된 이력은 변경하지 않는다.
- 사용자의 범위 정정에 따라 `20261008020000_limit_list_changes_to_attribute_definition`에서 추가됐던 빈 List 테이블과 List FK만 되돌리고 Attribute 확장은 유지한다.
- 정정 migration은 두 테이블을 잠근 뒤 List와 List 소속 Attribute가 모두 비어 있는지 확인한다. 데이터가 있으면 중단하며, 전체 DDL은 하나의 transaction으로 실행한다. `DROP TABLE`에는 `CASCADE`를 사용하지 않는다.
- 검증 데이터는 transaction rollback으로 남기지 않는다. Attribute 확장 자체를 되돌릴 필요가 생기면 먼저 List ID 사용 여부와 데이터 보존 방식을 확인하고 별도 후속 migration으로 처리한다.

## 10. 현재 구현: List, Entry와 Entry 값

세 테이블의 기본 컬럼과 관계는 사용자가 확인한 설계안에 맞춰 생성하고 2026-10-08에 실제 DB에 적용했다. 신규 API/FE/View는 추가하지 않는다. 아직 owning List module이 없으므로 DB 기반의 임시 소유자는 CRM core이며, 후속 List module에서 application port와 API 계약을 정의한다.

### 공통 컬럼

| 컬럼 | 역할 |
| --- | --- |
| `id` | UUID PK. `@default(dbgenerated("gen_random_uuid()")) @db.Uuid` |
| `workspaceId` | 필수 Workspace FK |
| `createdByActorId` | 필수 생성 Actor FK |
| `updatedByActorId` | nullable 마지막 수정 Actor FK |
| `createdAt` | UTC `Timestamptz(3)`. DB 기본값은 현재 시각 |
| `updatedAt` | UTC `Timestamptz(3)`. Prisma `@updatedAt`으로 갱신 |

FK 컬럼은 `@db.Uuid`를 사용하지만 랜덤 UUID 기본값을 넣지 않는다.

### 테이블별 추가 컬럼

| 테이블 | 컬럼 | 역할 |
| --- | --- | --- |
| `ListDefinition` | `apiSlug`, `name` | Workspace 안의 코드용 이름과 표시 이름 |
| `ListDefinition` | `description?`, `icon?` | 업무 목적 설명과 표시 아이콘 |
| `ListEntryDefinition` | `listDefinitionId` | 같은 Workspace에서 등록된 List |
| `ListEntryDefinition` | `recordDefinitionId` | 같은 Workspace의 원본 Record. 값을 복사하지 않음 |
| `ListEntryValueDefinition` | `listDefinitionId`, `listEntryDefinitionId` | 값을 가진 List 참여 항목 |
| `ListEntryValueDefinition` | `attributeDefinitionId` | 같은 List/Workspace의 Attribute |
| `ListEntryValueDefinition` | `attributeType` | 값 생성 당시 타입 snapshot |
| `ListEntryValueDefinition` | `jsonValue?`, `textValue?`, `numberValue?`, `booleanValue?`, `dateValue?`, `timestampValue?` | 기존 Record 값 모델과 같은 타입별 실제 값 컬럼 |
| `ListEntryValueDefinition` | `selectOptionId?`, `statusOptionId?` | 같은 Attribute/Workspace의 선택 옵션 |
| `ListEntryValueDefinition` | `targetRecordDefinitionId?`, `targetObjectDefinitionId?` | 같은 Workspace의 참조 Record/Object 쌍 |
| `ListEntryValueDefinition` | `targetActorId?` | 같은 Workspace의 참조 Actor |

숫자는 `Decimal(30,10)`, 날짜는 `Date`, 시각은 `Timestamptz(3)`로 기존 Record 값 컬럼과 맞춘다. 참조 Record/Object는 둘 다 null이거나 둘 다 지정해야 하며, 지정한 Object가 실제 Record의 Object와 일치해야 한다.

### 소속 검증과 조회 키

- List의 `(workspaceId, apiSlug)`는 UNIQUE다.
- Attribute의 `(listDefinitionId, workspaceId)`는 List의 `(id, workspaceId)`를 참조한다.
- Entry는 List와 원본 Record를 각각 ID와 Workspace로 묶어 참조한다.
- 값은 Entry와 Attribute를 각각 ID/List/Workspace로 묶어 참조한다. Object 소속 Attribute와 다른 List의 Attribute는 List 값에 연결할 수 없다.
- 옵션은 ID/Attribute/Workspace를 묶어 검증한다. 참조 Record는 ID/Object/Workspace, 참조 Object와 Actor는 ID/Workspace로 검증한다.
- 복합 FK용 UNIQUE 키를 기존 Actor, Object, Attribute, Record, SelectOption, StatusOption에 추가한다. 이미 고유한 PK가 포함되므로 새로운 업무 중복 정책을 부과하지 않는다.
- Entry 조회 인덱스는 `(workspaceId, listDefinitionId, createdAt, id)`와 `(workspaceId, recordDefinitionId)`다.
- 값 조회 인덱스는 `(workspaceId, listEntryDefinitionId, attributeDefinitionId)`와 `(workspaceId, listDefinitionId, attributeDefinitionId)`다.

### 삭제 동작과 Prisma 주의점

- List 삭제는 List Attribute, Entry와 Entry 값을 cascade하지만 원본 Record를 삭제하지 않는다.
- 원본 Record 삭제는 해당 Record의 참여 Entry와 값을 cascade한다. 참조 대상으로 사용된 Record 삭제는 해당 값의 target Record/Object ID 두 컬럼을 null로 바꾼다.
- 참조 Object FK는 SQL에서 `DEFERRABLE INITIALLY DEFERRED`로 transaction 종료 시점에 검사한다. Object 삭제로 Record가 cascade되고 target Record/Object ID가 함께 해제되는 작업을 먼저 처리한다. Prisma schema에는 `NoAction`으로 표현한다.
- 옵션과 참조 Actor 삭제는 값 row를 유지하면서 해당 nullable 참조 ID만 null로 바꾼다. Workspace, List, Entry와 Attribute ID는 유지한다.
- 복합 FK에 필수 소속 컬럼과 nullable 참조 컬럼이 함께 들어 있다. Prisma v6는 컬럼을 지정하는 SET NULL을 schema에서 표현하지 못하므로 일반 SetNull 경고 4건을 출력한다. 실제 migration SQL에는 `ON DELETE SET NULL ("selectOptionId")` 같은 PostgreSQL 컬럼 지정 동작을 적용한다. 이 경고를 없애려고 Workspace/Attribute ID를 nullable로 바꾸면 안 된다.
- 후속 migration에서도 컬럼 지정 SET NULL, 참조 Object FK의 지연 검사와 Record/Object 쌍 CHECK를 보존한다. Prisma diff 결과만으로 이 SQL 전용 동작의 보존 여부를 판단하지 않고 constraint 정의와 삭제 동작을 함께 검증한다.

근거: [PostgreSQL 17 FK/SET NULL 문서](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK), [Prisma v6 referential actions 문서](https://www.prisma.io/docs/orm/v6/prisma-schema/data-model/relations/referential-actions).

### Migration과 후속 정책

- 새 migration: `20261008030000_create_list_definition_entry_and_values`. 적용된 선행 migration 두 개는 변경하지 않는다.
- 테이블, 복합 키, FK, CHECK와 DB 주석을 하나의 DDL transaction으로 묶는다. 기존 Record/Attribute/값 row를 갱신하거나 삭제하지 않는다.
- 기존 List ID가 실제 List 없이 저장되어 있으면 새 Attribute/List FK 적용을 중단한다. 임의 List를 생성해서 보정하지 않는다.
- 검증 데이터는 transaction rollback으로 남기지 않는다. 되돌림이 필요하면 새 List/Entry/값 데이터 유무와 보존 방식을 확인하고 별도 후속 migration으로 처리한다.
- List 기준 Object 정책과 같은 Record의 같은 List 내 중복 등록 정책은 미정이다. List에 Object FK를 추가하거나 List/Record UNIQUE를 적용하지 않는다.
- 다중값을 위해 Entry/Attribute UNIQUE를 적용하지 않는다. 타입별 입력 검증, 단일값 개수 제한, 변경 이력과 삭제/복구 UX는 후속 List API 설계에서 보장한다.

적용 검증: 전체 71개 migration이 적용된 상태이고 실제 DB와 Prisma schema의 diff는 없다. rollback 검증 30건으로 UUID 생성, Workspace/List/Attribute 소속 격리, 옵션/참조 삭제와 cascade를 확인했다. 기존 Attribute 4건, Record 4건과 Record 값 16건은 적용 전후 건수와 전체 row checksum이 같으며 검증 데이터는 남기지 않았다. Backend typecheck/lint/build와 43개 suite의 테스트 212개도 통과했다. Prisma validate는 성공하며 위에 설명한 복합 FK SetNull 경고 4건은 유지된다.

## 11. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md`
