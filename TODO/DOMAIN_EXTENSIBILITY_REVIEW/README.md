# Domain Extensibility Review

Status: Strategy Review / Not confirmed for implementation  
Created: 2026-09-04  
Scope: Fixed CRM domain, Attio-style extensible CRM, Notion-style workspace model comparison

## 1. 목적

이 문서는 `onehand.sales`가 현재의 고정 CRM 도메인 구조를 유지할지, 사용자가 직접 도메인을 확장할 수 있는 구조로 진화할지 검토하기 위한 전략 메모다.

현재 제품은 `Company`, `Contact`, `Product`, `Deal`을 핵심 도메인으로 제공한다. 사용자가 새로운 관리 단위나 필드를 원하면, 현재 구조에서는 개발자가 직접 DB table, column, foreign key, API, 화면을 설계해야 한다.

검토 질문은 다음이다.

- Notion처럼 사용자가 page/database/block으로 사실상 새 entity와 속성을 만들게 할 것인가?
- Attio처럼 CRM의 기본 object는 제공하되 custom object, custom attribute, relationship을 열어줄 것인가?
- 아니면 현재처럼 고정 도메인 CRM을 유지하고, 피드백이 쌓일 때마다 제품 도메인을 직접 확장할 것인가?

이 문서는 구현 확정 계획이 아니다. 실제 구현으로 승격하려면 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`의 "사용자 정의 CRM builder로 확장하지 않는다"는 기존 결정부터 재검토해야 한다.

## 2. 현재 제품 기준

현재 정본 문서 기준 제품은 B2C 개인 영업자를 위한 구조화된 CRM이다.

- 주 타겟은 회사가 도입하는 팀 CRM이 아니라 개인 영업자다.
- 핵심 루프는 회사/담당자/제품 등록, 딜 생성, 딜 단계/금액/다음 행동 관리, 일정/회의록 연결이다.
- 현재 MVP 제외 범위에는 사용자 커스텀 필드 UI와 팀 공유/협업이 포함되어 있다.
- UX 기준은 "Notion식 작업공간 UX + Attio식 CRM record 관계 UX"지만, 현재 결정은 custom object builder를 제품 범위에 넣지 않는 쪽이다.

현재 Prisma schema도 이 방향을 따른다.

- `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`가 물리 table로 존재한다.
- 관계는 `DealCompany`, `DealContact`, `DealProduct`, `ScheduleDeal`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal` 같은 전용 join/snapshot table로 표현된다.
- 사용자별 옵션은 `CompanyField`, `CompanyRegion`, `ContactJobGrade`, `ContactDepartment`, `ProductCategory`, `ProductStatus`처럼 각 도메인 전용 table로 분리되어 있다.
- 동적 schema를 표현하는 `ObjectDefinition`, `AttributeDefinition`, `RecordValue` 같은 meta table은 없다.
- 일부 `Json` column은 import, analytics, activity metadata처럼 제한된 보조 데이터에 쓰이며, 핵심 도메인 schema를 사용자 정의하기 위한 구조는 아니다.

## 3. Notion의 도메인 처리 방식

Notion은 CRM이 아니라 page/block/database 기반 workspace다.

핵심 모델은 다음에 가깝다.

```text
Workspace
  -> Page
    -> Block[]
    -> Database
      -> DataSource
        -> Properties(schema)
        -> Pages(rows)
```

Notion에서 사용자가 새 database 또는 data source를 만들면, 그것이 사실상 사용자의 새 entity가 된다. 예를 들어 `Deals`, `Companies`, `Candidates`, `Projects` 같은 database를 만들 수 있고, 각 database의 property가 column 역할을 한다. database row는 동시에 하나의 page이므로, row 위쪽에는 structured properties가 있고 아래쪽에는 자유로운 page body/block content가 붙는다.

Notion이 제공하는 핵심 확장 단위:

- `Page`: 자유 문서이자 database row가 될 수 있는 기본 객체
- `Block`: text, image, table, checklist, embed 등 page 내부 구성 단위
- `Database` / `DataSource`: 여러 page를 묶는 data container
- `Property`: title, text, number, select, status, date, formula, relation, rollup 등 schema column
- `Relation`: 다른 database의 page를 참조하는 property
- `Rollup`: relation으로 연결된 page의 property를 집계하는 property
- `View`: table, board, calendar, timeline 등 같은 데이터를 다른 방식으로 보는 설정

장점:

- 사용자가 거의 모든 업무 모델을 스스로 만들 수 있다.
- page body가 강력해서 structured data와 unstructured note를 자연스럽게 섞을 수 있다.
- 템플릿, view, relation, rollup으로 다양한 업무 시스템을 만들 수 있다.

단점:

- 제품이 `Deal`, `Company`, `Contact`의 의미를 깊게 알기 어렵다.
- 영업 단계 검증, 중복 방지, 딜 리포트, 알림, 권한, audit, import/export 같은 CRM 특화 품질은 사용자가 직접 설계해야 한다.
- 사용자가 빈 캔버스와 schema 설계 부담을 떠안는다.
- 개인 영업자용 단순 CRM에는 과한 자유도가 될 수 있다.

## 4. Attio의 도메인 처리 방식

Attio는 CRM 데이터 모델을 중심으로 확장성을 제공한다.

핵심 모델은 다음에 가깝다.

```text
Workspace
  -> Object
    -> Attributes(schema)
    -> Records(rows)
    -> RecordPageLayout
  -> List
    -> Entries(records in a process)
    -> ListAttributes(process-specific schema)
  -> Views
    -> filters/sorts/visible attributes/layout
```

Attio는 `People`, `Companies`를 기본 object로 제공하고, `Deals`, `Users`, `Workspaces` 같은 standard object를 필요에 따라 활성화할 수 있다. 제품이 standard object의 의미를 알기 때문에 enrichment, email/calendar sync, record page, relationship, activity 같은 CRM 기능을 붙일 수 있다.

동시에 custom object를 만들 수 있다. 예를 들어 SaaS 회사는 `Subscriptions`, `Invoices`, `Projects`를 만들 수 있고, B2B marketplace는 `Buyers`, `Sellers`, `Transactions`를 만들 수 있다.

Attio가 제공하는 핵심 확장 단위:

- `Object`: CRM entity 또는 table에 해당한다.
- `Record`: object의 instance 또는 row다.
- `Object Attribute`: 해당 object의 모든 record에 적용되는 field다.
- `List`: 기존 records를 특정 업무 흐름으로 묶는 process container다.
- `List Attribute`: 특정 list 안에서만 의미 있는 field다.
- `Relationship Attribute`: object 간 record를 양방향으로 연결하는 관계 field다.
- `View`: object/list records를 필터, 정렬, 표시 field, table/kanban 형태로 저장해 보는 설정이다.

장점:

- CRM의 기본 의미를 유지하면서 고객별 데이터 모델 차이를 흡수할 수 있다.
- standard object는 제품이 깊게 이해하고, custom object는 고객이 필요할 때 확장한다.
- relationship, list, view가 CRM workflow에 맞게 설계되어 있다.
- Notion보다 업무 데이터 품질과 리포팅을 통제하기 쉽다.

단점:

- 구현 난도가 높다. dynamic schema, dynamic validation, query builder, import/export, search, permission, audit, indexing 전략이 필요하다.
- 개인 사용자가 object/attribute 설계를 직접 해야 하므로 초기 사용성이 무거워질 수 있다.
- custom object가 많아지면 제품의 단순함과 온보딩 장점이 약해진다.

## 5. 추천 방향

코드 상태를 고려하지 않고 제품 전략만 보면, Notion식 전면 피벗보다 Attio식 구조화된 확장형 CRM을 추천한다.

추천 방향:

```text
고정 CRM
  -> 확장 가능한 CRM
  -> 범용 workspace는 아님
```

즉 `Deal`, `Company`, `Contact`, `Product`는 기본 object로 계속 제공하고, 사용자가 필요할 때 확장 지점을 연다.

우선순위는 다음이 합리적이다.

1. Custom Field
   - 기존 `Company`, `Contact`, `Product`, `Deal`에 사용자 정의 field를 추가한다.
   - 예: 고객 등급, 산업군, 계약 갱신일, 리드 출처, 내부 우선순위.

2. Custom View / List
   - 같은 records를 다른 업무 흐름으로 묶고 저장된 view로 본다.
   - 예: 이번 달 집중 딜, VIP 고객사, 리뉴얼 대상 고객.

3. Relationship Field
   - 기존 object끼리 또는 custom object와 연결한다.
   - 예: 파트너와 회사, 캠페인과 담당자, 계약서와 딜.

4. Custom Object
   - 정말 독립 entity가 필요할 때만 허용한다.
   - 예: 견적서, 계약서, 파트너, 프로젝트, 구독, 인보이스.

5. Record Body
   - record 상세 안에는 Notion처럼 자유로운 memo/checklist/file/link/rich content 영역을 일부 제공한다.
   - 단, 이것을 핵심 도메인 모델로 만들지는 않는다.

핵심 이유:

- 사용자가 원하는 것은 대개 "무엇이든 만드는 도구"가 아니라 "내 영업 방식에 안 맞는 고정 CRM의 답답함 해소"다.
- 개인 영업자에게 Notion식 자유도는 오히려 schema 설계 부담이 될 수 있다.
- Attio식은 제품이 CRM 의미를 유지하면서, 고객 피드백으로 생기는 새 field/entity 요구를 흡수할 수 있다.
- AI, 리포트, 알림, import/export, 검색 같은 기능은 도메인 의미가 어느 정도 고정되어 있어야 품질을 내기 쉽다.

## 6. Attio식 DB를 새로 구성한다면

Attio식으로 처음부터 DB를 구성한다면, 핵심은 "회사/담당자/제품/딜 table을 각각 직접 늘리는 방식"이 아니라 "object schema를 데이터로 저장하는 방식"이다.

개념 모델:

```text
User or Workspace
  -> ObjectDefinition
    -> AttributeDefinition
    -> Record
      -> RecordValue
  -> RelationshipDefinition
    -> RecordRelationship
  -> ListDefinition
    -> ListEntry
    -> ListAttributeDefinition
    -> ListEntryValue
  -> ViewDefinition
  -> RecordActivity
  -> RecordBodyBlock or RecordNote
```

후보 table:

### Workspace

개인 B2C라면 처음에는 `User`가 workspace 역할을 겸할 수 있다. 장기적으로 팀/협업을 열 가능성이 있으면 `Workspace`를 분리한다.

주요 column:

- `id`
- `ownerUserId`
- `name`
- `defaultLocale`
- `defaultCurrencyCode`
- `createdAt`
- `updatedAt`

### ObjectDefinition

사용자가 다루는 entity type이다. standard object와 custom object를 모두 담는다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `apiSlug`
- `singularName`
- `pluralName`
- `kind`: `STANDARD` / `CUSTOM`
- `standardType`: `COMPANY` / `CONTACT` / `PRODUCT` / `DEAL` / nullable
- `icon`
- `isActive`
- `createdAt`
- `updatedAt`

초기 seed:

- `companies`
- `contacts`
- `products`
- `deals`

### AttributeDefinition

object 또는 list에 붙는 field schema다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `targetType`: `OBJECT` / `LIST`
- `objectDefinitionId`
- `listDefinitionId`
- `apiSlug`
- `name`
- `type`: `TEXT`, `NUMBER`, `CURRENCY`, `DATE`, `TIMESTAMP`, `SELECT`, `MULTI_SELECT`, `STATUS`, `CHECKBOX`, `EMAIL`, `PHONE`, `URL`, `RECORD_REFERENCE`, `RELATIONSHIP`, `FORMULA`
- `isRequired`
- `isUnique`
- `isMultiValue`
- `isSystem`
- `isArchived`
- `configJson`
- `defaultValueJson`
- `sortOrder`
- `createdAt`
- `updatedAt`

`configJson`에는 select options, currency display, allowed object ids, formula expression 같은 타입별 설정을 저장한다.

### Record

object의 실제 row다. `Company`, `Contact`, `Deal`, `Product`도 모두 `Record`가 된다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `objectDefinitionId`
- `title`
- `createdByUserId`
- `createdAt`
- `updatedAt`
- `deletedAt`
- `deletedByUserId`
- `trashExpiresAt`

기본 조회 성능을 위해 `title`, `objectDefinitionId`, `userId/workspaceId`, `deletedAt`, `updatedAt` index가 필요하다.

### RecordValue

record별 attribute value다. 가장 단순한 형태는 `valueJson` 하나지만, 검색/정렬/필터 성능을 위해 typed column을 함께 두는 방식이 현실적이다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `recordId`
- `attributeDefinitionId`
- `textValue`
- `numberValue`
- `dateValue`
- `timestampValue`
- `booleanValue`
- `jsonValue`
- `createdAt`
- `updatedAt`

중요 index:

- `(attributeDefinitionId, textValue)`
- `(attributeDefinitionId, numberValue)`
- `(attributeDefinitionId, dateValue)`
- `(recordId, attributeDefinitionId)`

unique attribute를 지원하려면 `(attributeDefinitionId, typedValue)` 형태의 부분 unique index 전략이 필요하다.

### RelationshipDefinition

두 object 사이의 관계 schema다. Attio의 relationship attribute처럼 양방향 관계를 표현한다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `sourceObjectDefinitionId`
- `targetObjectDefinitionId`
- `sourceAttributeDefinitionId`
- `targetAttributeDefinitionId`
- `sourceCardinality`: `ONE` / `MANY`
- `targetCardinality`: `ONE` / `MANY`
- `isBidirectional`
- `createdAt`
- `updatedAt`

### RecordRelationship

실제 record 간 연결 row다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `relationshipDefinitionId`
- `sourceRecordId`
- `targetRecordId`
- `createdAt`
- `updatedAt`

현재 `DealCompany`, `DealContact`, `DealProduct`, `ScheduleDeal` 같은 join table이 이 generic table로 흡수된다.

### ListDefinition

기존 records를 특정 process로 묶는 container다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `objectDefinitionId`
- `name`
- `apiSlug`
- `createdAt`
- `updatedAt`
- `isArchived`

예:

- `enterprise-sales-pipeline`
- `renewal-targets`
- `vip-companies`

### ListEntry

record가 list에 들어간 상태다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `listDefinitionId`
- `recordId`
- `createdAt`
- `updatedAt`

### ListEntryValue

list 안에서만 의미 있는 attribute value다.

예:

- pipeline stage
- owner
- priority
- forecast category

구조는 `RecordValue`와 유사하지만 `listEntryId` 기준이다.

### ViewDefinition

저장된 table/kanban/list view 설정이다.

주요 column:

- `id`
- `workspaceId` 또는 `userId`
- `targetType`: `OBJECT` / `LIST`
- `objectDefinitionId`
- `listDefinitionId`
- `name`
- `layoutType`: `TABLE` / `KANBAN` / `LIST` / `CALENDAR`
- `filterJson`
- `sortJson`
- `visibleAttributeIdsJson`
- `groupByAttributeId`
- `createdAt`
- `updatedAt`

### RecordActivity / RecordNote / RecordBodyBlock

CRM 활동과 자유 문서 body를 분리한다.

`RecordActivity`:

- record timeline, system event, manual activity, meeting, follow-up, stage change를 저장한다.

`RecordBodyBlock`:

- Notion식 자유 body를 제한적으로 제공할 경우 사용한다.
- text, checklist, file, link, image, table-lite 정도로 제한하는 것이 현실적이다.

## 7. Notion식 DB를 새로 구성한다면

Notion식으로 처음부터 DB를 구성한다면, `Deal`, `Company`, `Contact`, `Product`는 제품의 물리 table이 아니라 사용자가 만든 database/data source가 된다.

개념 모델:

```text
Workspace
  -> Page
    -> Block
  -> Database
    -> DataSource
      -> PropertyDefinition
      -> Page(row)
        -> PagePropertyValue
        -> Block[]
  -> ViewDefinition
```

후보 table:

- `Workspace`
- `Page`
- `Block`
- `Database`
- `DataSource`
- `PropertyDefinition`
- `PagePropertyValue`
- `RelationPropertyValue`
- `ViewDefinition`
- `Template`

이 구조에서는 `딜`도 page collection이고, `회사`도 page collection이다. 딜과 회사의 연결은 relation property value다. 회의록은 별도 page일 수도 있고, 딜 page 내부 block일 수도 있다.

장점은 자유도지만, 제품이 영업 도메인을 덜 이해하게 된다. 예를 들어 "이번 주 마감 딜", "딜 단계별 금액", "담당자 회사 일치 검증", "명함 OCR 저장 시 회사/담당자 재사용", "회의록 저장 후 딜 활동 자동 생성" 같은 기능은 범용 page/block 위에 별도 application rule을 얹어야 한다.

## 8. 현재 Prisma DB와의 차이

현재 DB는 fixed domain relational schema다.

현재 구조:

```text
User
  -> Company
  -> Contact
  -> Product
  -> Deal
  -> Schedule
  -> MeetingNote
  -> dedicated join/snapshot/log tables
```

Attio식 구조:

```text
User/Workspace
  -> ObjectDefinition
  -> AttributeDefinition
  -> Record
  -> RecordValue
  -> RelationshipDefinition
  -> RecordRelationship
  -> List/View
```

Notion식 구조:

```text
Workspace
  -> Page
  -> Block
  -> Database/DataSource
  -> PropertyDefinition
  -> PagePropertyValue
```

핵심 차이:

| 관점 | 현재 DB | Attio식 DB | Notion식 DB |
| --- | --- | --- | --- |
| Entity | Prisma model/table로 고정 | `ObjectDefinition` data로 정의 | `Database/DataSource` 또는 page collection |
| Row | `Company`, `Deal` 등 각 table row | generic `Record` | `Page` |
| Column | Prisma schema column | `AttributeDefinition` + `RecordValue` | `PropertyDefinition` + `PagePropertyValue` |
| 관계 | 전용 FK/join table | generic relationship definition/value | relation property |
| View | FE/API별 고정 query | 저장된 object/list view | database view |
| 확장 | migration + BE/FE 구현 필요 | 사용자/admin 설정으로 schema 확장 | 사용자가 page/database/block으로 확장 |
| 도메인 의미 | 매우 강함 | standard object는 강함, custom object는 중간 | 약함 |
| 검증/성능 | 좋음 | 복잡한 query/index 설계 필요 | 범용성 우선, 업무 검증은 약함 |
| 사용자 부담 | 낮음 | 중간 | 높음 |

현재 DB에서 강하게 고정된 부분:

- `Contact.companyId`는 필수 FK다. 담당자는 회사 없이 존재하지 않는다.
- `Deal`은 `DealCompany`, `DealContact`, `DealProduct`로 회사/담당자/제품과 연결된다.
- `MeetingNote`는 작성 시점 snapshot table을 별도로 가진다.
- `Schedule`은 `ScheduleDeal`로 딜과 연결된다.
- 각 도메인 메모와 비밀 메모는 별도 log table로 분리되어 있고, soft delete 정책이 명확하다.
- export/import/search/admin/audit/notification/analytics가 현재 물리 table 구조를 전제로 동작한다.

Attio식으로 바꾸면 달라지는 부분:

- 새 field 추가에 migration이 필요 없어질 수 있다.
- 새 object 추가도 runtime configuration이 될 수 있다.
- 대신 모든 목록/상세/search/filter/sort/import/export가 dynamic schema를 해석해야 한다.
- Prisma type safety와 단순 relation query를 상당 부분 잃는다.
- domain-specific API와 generic object API 사이의 경계를 새로 정해야 한다.
- `Deal` 같은 standard object는 여전히 특별 대우해야 한다. 그렇지 않으면 AI 리포트, 다음 행동, 단계별 pipeline 같은 제품 차별점이 약해진다.

Notion식으로 바꾸면 달라지는 부분:

- 핵심 저장 단위가 record가 아니라 page/block이 된다.
- `Deal`, `Company`는 제품 정본 table이 아니라 사용자가 만든 database가 된다.
- CRM 기능 대부분을 범용 database 기능 위에 재구성해야 한다.
- 자유도는 가장 높지만, 개인 영업 CRM의 즉시성은 가장 낮아질 가능성이 크다.

## 9. 의사결정 기준

바로 전면 피벗하지 말고, 실제 사용자 피드백을 다음 기준으로 분류하는 것이 좋다.

Custom Field로 충분한 피드백:

- "회사에 고객 등급을 넣고 싶다."
- "딜에 리드 출처가 필요하다."
- "제품에 계약 유형을 추가하고 싶다."

Custom View/List로 충분한 피드백:

- "이번 달 집중 딜만 따로 보고 싶다."
- "VIP 고객사만 묶어서 관리하고 싶다."
- "리뉴얼 대상 고객을 별도로 보고 싶다."

Relationship Field가 필요한 피드백:

- "파트너와 고객사를 연결하고 싶다."
- "캠페인별 유입 담당자를 연결하고 싶다."
- "계약서와 딜을 연결하고 싶다."

Custom Object가 필요한 피드백:

- "견적서를 별도 객체로 관리해야 한다."
- "계약/구독/인보이스가 딜과 독립적으로 존재해야 한다."
- "프로젝트나 납품 건을 영업 이후 단계로 계속 추적해야 한다."

Notion식 workspace가 필요한 피드백:

- "CRM보다 문서, wiki, 프로젝트, 개인 업무판을 자유롭게 만들고 싶다."
- "영업 도메인 자체보다 범용 업무 공간이 필요하다."
- "데이터 구조와 화면을 대부분 직접 설계하고 싶다."

현재 제품 포지션에서는 마지막 유형이 반복적으로 나오지 않는 한 Notion식 피벗은 위험하다.

## 10. 단계적 제안

1. 지금은 고정 CRM을 유지한다.
   - 사용자 피드백이 없는 상태에서 custom object builder를 먼저 만들지 않는다.

2. 피드백 수집 시 "새 도메인 필요"와 "필드 하나 부족"을 분리한다.
   - 대부분은 custom field 또는 view/list로 해결될 가능성이 높다.

3. 첫 확장은 custom field로 제한한다.
   - `Company`, `Contact`, `Product`, `Deal`에만 허용한다.
   - field type도 text, number, date, select, checkbox 정도로 시작한다.

4. 두 번째 확장은 saved view/list다.
   - custom object보다 사용자 가치가 빠르고 구현 위험이 낮다.

5. relationship/custom object는 유료 고급 기능 후보로 둔다.
   - 이 단계부터 query builder, permission, import/export, analytics 영향이 커진다.

6. record body는 별도 트랙으로 검토한다.
   - CRM schema 확장과 Notion식 block editor를 같은 문제로 묶지 않는다.
   - 먼저 rich memo 또는 sectioned note 정도가 적절하다.

## 11. 종합 판단 점수표

제품 방향만 기준으로 보면 최종 추천은 "현재 고정 CRM을 유지하되, Attio식 확장형 CRM으로 단계적으로 진화할 수 있게 설계한다"이다.

```text
최종 추천:
현재 고정 CRM 유지
  -> Custom Field
  -> Saved View/List
  -> Relationship Field
  -> Custom Object

Notion식 전면 피벗은 하지 않는다.
Notion은 UX/UI와 record body 참고 대상으로만 둔다.
```

| 선택지 | 점수 | 판단 |
| --- | ---: | --- |
| 현재 고정 CRM 유지 | 82/100 | 지금 단계에서는 합리적이다. 제품 메시지, 온보딩, 도메인 기능 품질이 가장 안정적이다. |
| Attio식 확장형 CRM으로 전면 전환 | 74/100 | 장기 방향성은 좋지만 지금 전면 전환은 이르다. 구현 난도와 제품 복잡도가 크게 오른다. |
| Attio식으로 단계적 진화 | 90/100 | 가장 추천한다. 현재 제품의 선명함을 유지하면서 사용자 피드백을 흡수할 수 있다. |
| Notion식 범용 워크스페이스 전환 | 48/100 | 자유도는 높지만 개인 영업 CRM의 즉시 가치와 제품 정체성이 약해질 가능성이 크다. |

### 현재 고정 CRM 유지: 82점

현재 제품은 개인 영업자가 바로 쓰는 CRM이다. 이 타겟은 대체로 직접 entity, field, relation, view를 설계하고 싶은 사람보다, 회사/담당자/제품/딜을 빠르게 입력하고 다음 행동을 관리하고 싶은 사람에 가깝다.

장점:

- 사용자가 배울 것이 적다.
- onboarding이 쉽다.
- 제품 메시지가 선명하다.
- AI 리포트, 알림, 딜 단계, 일정, 회의록 연결 같은 기능 품질을 높이기 쉽다.
- 데이터 validation, import/export, search, admin, audit, soft delete를 안정적으로 설계하기 쉽다.
- Prisma schema와 relational FK를 통한 타입 안정성과 query 단순성이 좋다.

단점:

- 사용자가 원하는 field나 새 관리 단위가 생기면 개발자가 직접 DB/API/FE를 확장해야 한다.
- 고객군이 다양해질수록 domain-specific table이 계속 늘어날 수 있다.
- "우리 회사만의 영업 방식"을 흡수하는 속도가 느릴 수 있다.

판단:

아직 custom object나 자유 schema에 대한 반복 사용자 피드백이 검증되지 않았다. 따라서 현재 제품을 지금 당장 버릴 이유는 부족하다.

### Attio식 확장형 CRM 전면 전환: 74점

Attio식 방향은 CRM 제품의 장기 확장성 관점에서는 강하다. 회사마다 영업 데이터 구조가 다르기 때문에 custom field, custom object, relationship은 언젠가 강력한 차별점이 될 수 있다.

장점:

- 고객별 다른 데이터 모델을 제품 안에서 흡수할 수 있다.
- 새 field 추가에 migration이 필요 없어질 수 있다.
- `Partner`, `Contract`, `Invoice`, `Project`, `Subscription` 같은 새 object 요구를 사용자 설정으로 받을 수 있다.
- standard object와 custom object를 함께 두면 CRM 의미와 확장성을 동시에 가져갈 수 있다.

단점:

- 모든 목록/상세/API/query/filter/sort/import/export/search를 dynamic schema 기준으로 다시 설계해야 한다.
- Prisma의 고정 model type safety와 단순 relation query 장점을 상당 부분 잃는다.
- 사용자에게 schema 설계 부담이 생긴다.
- 개인 영업자용 단순 CRM이라는 현재 장점이 약해질 수 있다.
- 아직 사용자가 이 자유도를 실제로 원하는지 검증되지 않았다.

판단:

목적지 후보로는 좋지만, 지금 즉시 전체 재구축할 만큼 검증된 요구는 아니다. 전면 전환은 제품/기술 리스크가 크다.

### Attio식 단계적 진화: 90점

최종 추천은 이 선택지다. 현재의 `Company`, `Contact`, `Product`, `Deal`을 기본 object처럼 유지하고, 확장 기능을 낮은 위험 순서로 추가한다.

권장 순서:

1. Custom Field
   - 기존 핵심 object에만 사용자 field를 추가한다.
   - 예: 고객 등급, 산업군, 계약 갱신일, 리드 출처, 내부 우선순위.

2. Saved View / List
   - 같은 records를 특정 업무 흐름으로 묶거나 저장된 view로 본다.
   - 예: 이번 달 집중 딜, VIP 고객사, 리뉴얼 대상 고객.

3. Relationship Field
   - 기존 object끼리 또는 후속 custom object와 연결한다.
   - 예: 파트너와 회사, 캠페인과 담당자, 계약서와 딜.

4. Custom Object
   - 정말 독립 entity가 필요한 피드백이 반복될 때만 연다.
   - 예: 견적서, 계약서, 파트너, 프로젝트, 구독, 인보이스.

5. Record Body
   - Notion식 자유 body는 핵심 schema가 아니라 record 상세의 보조 입력 영역으로 제한한다.
   - 예: rich memo, checklist, file/link, sectioned note.

장점:

- 현재 제품의 명확한 CRM 흐름을 유지한다.
- 사용자 피드백이 실제로 쌓인 부분부터 확장할 수 있다.
- 처음부터 custom object builder를 만드는 낭비를 피한다.
- future migration path를 열어둔다.
- Notion식 UX/UI 감각은 가져오되, 제품 모델은 CRM 중심으로 유지할 수 있다.

판단:

현재 정보 기준 가장 점수가 높다. "피벗"보다 "진화"가 맞다.

### Notion식 범용 워크스페이스 전환: 48점

Notion식은 page/block/database를 중심으로 사용자가 거의 모든 구조를 직접 만들 수 있게 하는 방향이다.

장점:

- 자유도가 가장 높다.
- 다양한 업무 모델을 한 제품 안에서 수용할 수 있다.
- page body와 database를 섞는 UX는 강력하다.

단점:

- 제품이 CRM 도메인 의미를 깊게 이해하기 어렵다.
- 딜 단계, 다음 행동, 명함 OCR 저장, 회의록-딜 연결, 주간 영업 리포트 같은 현재 강점 후보가 약해진다.
- 경쟁 상대가 CRM이 아니라 Notion, Coda, Airtable 같은 범용 workspace로 바뀐다.
- 개인 영업자에게 빈 캔버스와 schema 설계 부담이 커질 수 있다.
- 제품 메시지가 흐려진다.

판단:

현재 제품이 해결하려는 문제는 "무엇이든 만드는 workspace"보다 "개인 영업자의 데이터와 다음 행동을 잘 관리하는 CRM"에 가깝다. 따라서 Notion식은 UX/UI reference로는 좋지만 제품 모델로 전면 채택하기에는 점수가 낮다.

## 12. 최종 결론

지금 당장 서비스 방향을 선택해야 한다면 다음이 결론이다.

- 지금 형태를 버리지 않는다.
- Notion식 전면 피벗은 하지 않는다.
- Attio식 전체 재구축도 지금 바로 하지 않는다.
- 현재 고정 CRM을 유지하면서, 후속 설계는 Attio식 확장 가능성을 막지 않는 방향으로 잡는다.
- 첫 확장 후보는 custom object가 아니라 custom field다.
- Notion은 page/detail UX, 조용한 database table, record body UX 참고 대상으로만 사용한다.

한 줄 판단:

```text
제품은 고정 CRM으로 유지하고, 장기 구조는 Attio식 확장형 CRM으로 단계적 진화한다.
```

## 13. 참고한 공식 자료

- Notion Help: What is a block? - https://www.notion.com/help/what-is-a-block
- Notion Help: Intro to databases - https://www.notion.com/help/intro-to-databases
- Notion Help: Database properties - https://www.notion.com/help/database-properties
- Notion Help: Relations & rollups - https://www.notion.com/help/relations-and-rollups
- Notion Developers: Database object - https://developers.notion.com/reference/database
- Notion Developers: Data source object - https://developers.notion.com/reference/data-source
- Notion Developers: Data source properties - https://developers.notion.com/reference/property-object
- Attio Docs: Objects and lists - https://docs.attio.com/docs/objects-and-lists
- Attio Help: Define your data model - https://attio.com/help/reference/attio-101/attios-data-model/define-your-data-model-objects-lists-and-views
- Attio Help: Understanding objects - https://attio.com/help/reference/attio-101/attios-data-model/understanding-objects
- Attio Help: Understanding attributes - https://attio.com/help/reference/attio-101/attios-data-model/Understanding-attributes
- Attio Help: Relationship attributes - https://attio.com/help/reference/managing-your-data/attributes/relationship-attributes
- Attio Help: Create and manage custom objects - https://attio.com/help/reference/managing-your-data/objects/create-and-manage-custom-objects
- Attio Docs: Create an object - https://docs.attio.com/rest-api/endpoint-reference/objects/create-an-object
- Attio Docs: Create an attribute - https://docs.attio.com/rest-api/endpoint-reference/attributes/create-an-attribute

## 14. 참고한 내부 자료

- `BE/prisma/schema.prisma`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `TODO/README.md`
