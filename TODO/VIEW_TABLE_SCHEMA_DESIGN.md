# View 테이블 컬럼·제약·인덱스 설계안

- 작성일: 2026-10-16
- 상태: 실제 서비스 구현을 위한 설계 제안 / DB 미적용
- 범위: 신규 테이블 10개, 기존 스키마 보완 사항, 저장·조회·삭제 계약
- DB 기준: AGENT/SOFTWARE_AGENT/DB_SCHEMA의 현재 구현 규칙과 BE/prisma/schema.prisma·기존 migration SQL
- 제품·UX 기준: 사용자의 최신 지시 및 Attio의 공개 데이터 모델·사용 동작
- 정본 대조일: 2026-10-16 / DB_SCHEMA 문서 8개 전체 검토

## 1. 목적과 설계 범위

Object와 List에 이미 저장된 데이터를 여러 View로 조회하고, 자주 사용하는 View를 개인 즐겨찾기로 바로 여는 실제 서비스의 저장 구조를 정리한다. 각 테이블의 전체 컬럼, FK, UNIQUE, 조회 인덱스와 검증 기준을 이 문서 한 곳에서 확인할 수 있도록 작성한다.

이 문서는 구현된 Prisma 모델 목록이나 migration 적용 결과가 아니다. 저장 타입·Workspace 소속·기존 관계·migration 보존 기준은 AGENT/SOFTWARE_AGENT/DB_SCHEMA를 따르고, 현재 구현 사실은 Prisma 스키마와 해당 migration SQL을 함께 대조한다. Attio는 제품 개념과 사용자 동작의 참고 기준이며, 저장소의 DB 규칙을 대체하지 않는다. 도메인 정책이나 API 계약의 미정 항목은 확정된 것으로 취급하지 않는다.

신규 10개 테이블은 이 규칙을 계승하는 설계 제안이다. 기존 List에 Object FK를 추가하거나 이미 적용된 중복 정책·삭제 규칙을 변경하는 실행 지시가 아니다. 정본이 미정으로 둔 업무 정책은 사용자 확정과 별도 설계 반영 전까지 유지한다.

현재 논의한 11가지 표현 방식과 대시보드·간트 기능을 지원하는 통합 View 설계를 대상으로 한다. Attio 공식 문서는 데이터 View를 Table과 Kanban으로 설명하고, 대시보드와 보고서를 별도 기능으로 다룬다. 11가지 표현 방식과 대시보드를 하나의 View 체계로 관리하는 선택은 우리 서비스의 확장 설계이며, Attio가 동일한 11종을 제공한다는 의미가 아니다.

### 1.1 사용자 흐름

사이드바 순서는 사용자의 최신 지시에 따라 **즐겨찾기 → 업무목록 → 관리항목**으로 한다.

| 사이드바 영역 | 조회 대상 | 선택 결과 |
| --- | --- | --- |
| 즐겨찾기 | 현재 구성원의 ViewFavoriteDefinition | 등록된 특정 View를 즉시 연다. |
| 업무목록 | 기존 ListDefinition | 해당 List의 기본 View를 연다. |
| 관리항목 | 기존 ObjectDefinition | 해당 Object의 기본 View를 연다. |

기존 SIDEBAR_AND_VIEW_USER_FLOW.md의 사이드바 나열 순서와 차이가 있으면 위 최신 사용자 지시를 우선한다. Object/List 선택 후 기본 View가 바로 열리고, 상단 선택 메뉴에서 같은 원본에 속한 다른 View로 전환하는 흐름은 유지한다.

| 원본 | View 이름 예시 | 표현 설정 |
| --- | --- | --- |
| 회사 Object | 전체 회사 | TABLE |
| 회사 Object | 주요 고객사 | TABLE + 필터 |
| 회사 Object | 서울 소재 회사 | TABLE + 필터 + 정렬 |
| 영업 파이프라인 List | 전체 업무 | TABLE |
| 영업 파이프라인 List | 단계별 진행 | KANBAN + 그룹 기준 |
| 영업 파이프라인 List | 이번 달 마감 | TABLE + 상대 날짜 필터 |

필터링한 표도 TABLE이다. FILTERING_TABLE 같은 별도 타입을 만들지 않는다. View 전환은 원본 데이터의 복사가 아니며, 한 View에서 수정한 원본 값은 다른 View에서도 반영된다.

### 1.2 신규 테이블 목록

| 번호 | 테이블 | 책임 |
| --- | --- | --- |
| 1 | ViewDefinition | View의 소속·이름·표현 타입·타입별 설정 |
| 2 | ViewAttributeSettingDefinition | 표시 속성·참조 경로·순서·너비·표시 형식 |
| 3 | ViewFilterGroupDefinition | 중첩 AND/OR 필터 그룹 |
| 4 | ViewFilterConditionDefinition | 개별 필터 조건 |
| 5 | ViewSortDefinition | 정렬 기준·방향·우선순위 |
| 6 | ViewGroupDefinition | 데이터를 묶는 기준과 역할 |
| 7 | ViewGroupSettingDefinition | 개별 그룹의 순서·숨김·접힘·표시 이름 |
| 8 | ViewWidgetDefinition | 대시보드에 배치하는 View와 배치 설정 |
| 9 | ViewWorkDependencyDefinition | Record/ListEntry 사이의 업무 선후행 관계 |
| 10 | ViewFavoriteDefinition | 구성원별 View 즐겨찾기와 개인 순서 |

ViewWorkDependencyDefinition은 이름에 View가 있지만 실제 업무 관계를 저장한다. View를 삭제해도 업무 관계는 유지되어야 하므로 ViewDefinition FK를 두지 않는다.

## 2. 공통 표기와 DB 규약

### 2.0 적용 정본과 기준 구분

사용자가 명시한 제품 범위와 최신 지시를 우선하고, DB 구현 규칙은 아래 정본에서 가져온다. 정본의 오래된 후보 모델·예제와 현재 구현 설명이 다르면 현재 구현은 Prisma 스키마·migration SQL과 대조해 기록한다. 외부 제품의 동작을 근거로 정본에서 미정인 정책이나 기존 데이터 변경을 자동 확정하지 않는다.

| DB_SCHEMA 정본 | 이 문서에 적용하는 기준 |
| --- | --- |
| [README.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md) | 현재 활성 모델과 후속 View 구분, 공용 Attribute/옵션, Workspace 경계, UUID 기본값, SQL 전용 삭제 제약 |
| [CRM_CORE_SCHEMA_DRAFT.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md) | 현재 구현인 9~11절 기준. Attribute 소속 CHECK, List/Entry/값의 관계·타입·복합 키·인덱스, 기존 migration 보존, 미정 List 정책 |
| [TIME_AND_TIMEZONE_POLICY.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md) | UTC instant 저장, User.timeZone의 IANA ID, local date-time 입력의 timezone metadata, 사용자 표시 변환 |
| [AUTH_USER_SCHEMA.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md) | 기존 User·인증 모델 재사용, timeZone·locale·통화 설정 참조. Auth 예제의 UUID/날짜 표기를 신규 CRM 전체의 규약으로 복사하지 않음 |
| [ERROR_REPORT_SCHEMA.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/ERROR_REPORT_SCHEMA.md) | 신고 원장과 CRM View 분리. 원문·개인정보·비밀값을 일반 로그에 남기지 않는 기준 참고 |
| [SUPPORT_REQUEST_SCHEMA.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/SUPPORT_REQUEST_SCHEMA.md) | 지원 요청의 사용자 snapshot은 해당 원장 규칙. View에 불필요한 사용자 원문 snapshot을 복사하지 않음 |
| [PUBLIC_CONTACT_REQUEST_SCHEMA.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/PUBLIC_CONTACT_REQUEST_SCHEMA.md) | 공개 문의는 User를 포함한 FK 없는 독립 원장. Workspace 필수 규칙은 신규 CRM 10개에 적용하며 공개 문의를 변경하지 않음 |
| [LEGACY_REMOVED_DOMAINS.md](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md) | 고정형 Company/Contact/Product/Deal 모델 복원 금지. 회사·업무 예시는 Object/Record/List/Attribute로 표현 |

CRM_CORE_SCHEMA_DRAFT.md 초반의 후보명이나 오래된 MVP 보류 문구를 현재 Prisma 모델 상태로 해석하지 않는다. WorkspaceMember 등 현재 존재하는 모델은 재사용하고, List API/FE·View·Kit의 구현 여부는 현재 코드와 정본을 구분해 판단한다.

### 2.1 타입·기본값

| DB 타입·표기 | Prisma 대응 | 규칙 |
| --- | --- | --- |
| UUID | String @db.Uuid | PK는 DB에서 생성하고 FK에는 생성 기본값을 넣지 않는다. |
| TEXT | String | 길이 제한·업무 이름 중복 금지 정책은 별도 확정 없이 추가하지 않는다. |
| INT | Int | 순서 값은 동률을 허용하고 마지막에 id로 정렬한다. |
| BOOLEAN | Boolean | 표에 명시한 기본값을 사용한다. |
| JSONB | Json @db.JsonB | 각 용도별 스키마를 검증한다. |
| TIMESTAMPTZ(3) | DateTime @db.Timestamptz(3) | UTC instant로 저장한다. |
| DATE | DateTime @db.Date | 기존 dateValue의 시간대 없는 달력 날짜다. UTC timestamp로 바꿔 저장하지 않는다. |
| NUMERIC(30,10) | Decimal @db.Decimal(30,10) | JSON/응답 변환 시 정밀도를 보존한다. |
| VARCHAR(64) | String @db.VarChar(64) | groupKeyHash의 SHA-256 소문자 16진수 표현에 사용한다. |
| 없음 | 기본값 없음 | 필수 값은 서버가 명시적으로 지정한다. |

모든 테이블은 아래 감사 규약을 공유하며, 각 테이블의 컬럼 표에도 같은 6개 컬럼을 반복해 표시한다.

| 컬럼 | NULL | 기본값·동작 |
| --- | --- | --- |
| id | 불가 | PK, gen_random_uuid() |
| workspaceId | 불가 | 소속 Workspace FK |
| createdByActorId | 불가 | 생성 Actor FK |
| updatedByActorId | 가능 | 마지막 수정 Actor FK |
| createdAt | 불가 | now() |
| updatedAt | 불가 | Prisma @updatedAt, raw SQL 변경 시 명시적으로 갱신 |

신규 CRM PK의 Prisma 선언은 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid로 한다. 모든 UUID FK는 @db.Uuid를 사용하고 @default(uuid()) 또는 DB UUID 생성 기본값을 붙이지 않는다. 기존 Auth 테이블의 기본값은 이번 View 설계에 맞춰 일괄 변경하지 않는다.

모든 신규 감사 시각은 @db.Timestamptz(3)를 사용한다. 기존 User.timeZone의 IANA timezone ID와 preferredLocale을 표시 기준으로 사용하고, local date-time 입력에는 timezone metadata를 함께 받는다. 사용자가 선택한 User.timeZone·defaultCurrencyCode를 View 저장이나 로그인 환경으로 덮어쓰지 않는다.

### 2.2 FK와 인덱스 공통 원칙

- 이 절의 신규 복합 FK는 View 10개 테이블의 제안이다. 기존 모든 단일 FK를 일괄 변경하는 범위가 아니다.
- Workspace 소속을 검증하는 FK에는 workspaceId를 포함한다.
- 같은 View에 속해야 하는 관계에는 viewDefinitionId도 포함한다.
- FK 대상 컬럼 조합에는 대응하는 PK 또는 비부분 UNIQUE 키가 있어야 한다.
- 각 테이블의 id에는 PK 인덱스가 자동 생성된다. PK·UNIQUE와 같은 인덱스를 중복 생성하지 않는다.
- 아래 인덱스는 기본적으로 B-tree다. WHERE 조건이 있는 UNIQUE/INDEX는 부분 인덱스다.
- name, sortOrder에는 일괄 UNIQUE를 걸지 않는다.
- JSON 설정은 View ID로 읽는다. 모든 JSONB 컬럼에 GIN 인덱스를 일괄 추가하지 않는다.
- 참조 경로 JSON 내부 ID는 일반 FK로 보호되지 않는다. 경로 검증과 참조 삭제 시 재검증이 필요하다.
- 현재 Prisma 6에서 표현되지 않는 CHECK·부분 인덱스·컬럼 지정 SET NULL·지연 FK는 migration SQL로 관리한다.
- 감사 Actor별 조회나 참조 경로 포함 검색용 추가 인덱스는 실제 쿼리와 실행 계획을 근거로 정한다.

### 2.3 Enum 계약 제안

아래는 신규 Enum의 의미를 고정하기 위한 제안이다. 기존 AttributeType을 변경하는 목록이 아니다.

| Enum | 제안 값·규칙 |
| --- | --- |
| ViewTypeEnum | TABLE, KANBAN, LIST, GALLERY, CALENDAR, TIMELINE, GANTT, CHART, PIVOT, MAP, DASHBOARD |
| ViewSourceScopeEnum | RECORD, LIST_ENTRY |
| ViewAttributeDisplayRoleEnum | DISPLAY, TITLE, BODY, IMAGE, START_DATE, END_DATE, LOCATION, PROGRESS, MEASURE |
| ViewConditionGroupOperatorEnum | AND, OR |
| ViewComparisonOperatorEnum | 속성 타입별 연산자 목록을 API 계약에서 정의한다. 같음·포함·범위·빈 값 등 연산자와 허용 값 형태를 함께 정의해야 한다. |
| ViewMultiValueMatchModeEnum | ANY, ALL. 빈 다중값의 평가 규칙도 조회 계약에 포함한다. |
| ViewSortDirectionEnum | ASC, DESC |
| ViewGroupRoleEnum | GROUP, SERIES, PIVOT_ROW, PIVOT_COLUMN |
| ViewWorkDependencyTypeEnum | FS: 종료→시작, SS: 시작→시작, FF: 종료→종료, SF: 시작→종료 |
| ViewWorkDependencyUnitEnum | MINUTE, HOUR, DAY |

CHART의 세부 차트 모양은 configJson으로 구분한다. View의 표현 타입마다 별도 원본 데이터 테이블을 만들지 않는다.

### 2.4 정본 규칙과 신규 제안의 경계

| 구분 | 대상 | 적용 상태 |
| --- | --- | --- |
| 기존 DB 규칙 계승 | UUID PK, FK의 UUID 기본값 금지, 감사 6컬럼, UTC Timestamptz(3), Workspace 경계, 기존 공용 Attribute/옵션 | 신규 View 설계에 반영 |
| 기존 DB 계약 보존 | Attribute의 Object/List 정확히 하나 CHECK, List 값의 타입 snapshot·타입별 컬럼, 옵션/참조 ID만 SET NULL, 참조 Object 지연 FK, 옵션 color의 nullable TEXT | 기존 테이블·제약을 변경하지 않음 |
| 신규 View 설계 제안 | View/필터/그룹의 복합 키와 부분 UNIQUE, revision, groupKeyHash, 신규 Enum, 신규 설정 삭제 정책 | DB 정본에 이미 구현된 규칙이 아님. 구현 전 계약·migration 검토 대상 |
| 미정 업무 정책 보존 | List 기준 Object, 같은 Record의 같은 List 내 중복 등록 정책 | Parent Object 컬럼/FK와 List/Record UNIQUE를 이번 설계의 필수 변경으로 확정하지 않음 |
| 추가 성능 제안 | 기존 값 테이블의 표시값 일괄 조회·타입별 검색 인덱스 | 기존 정본의 필수 인덱스와 구분하고 실행 계획으로 채택 여부 검증 |

## 3. ViewDefinition

Object/List에 연결된 개별 View와 대시보드 View의 기본 정의를 저장한다.

### 3.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | View PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| objectDefinitionId | UUID | 가능 | 없음 | Object 기반 View의 원본 또는 대시보드의 선택적 소속 |
| listDefinitionId | UUID | 가능 | 없음 | List 기반 View의 원본 또는 대시보드의 선택적 소속 |
| name | TEXT | 불가 | 없음 | View 선택 메뉴의 표시 이름 |
| type | ViewTypeEnum | 불가 | 없음 | 표현 방식 |
| description | TEXT | 가능 | 없음 | 목적과 사용 방법 |
| icon | TEXT | 가능 | 없음 | 기존 아이콘 값 계약을 사용하는 표시 아이콘 |
| sortOrder | INT | 불가 | 0 | 같은 소속의 View 순서 |
| configJson | JSONB | 가능 | 없음 | 타입별 표현·집계 설정 |
| revision | INT | 불가 | 1 | 공유 View 설정의 동시 수정 충돌 검사용 버전 |

### 3.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| UNIQUE | uq_view_ctx | (id, workspaceId) | 하위 설정과 즐겨찾기의 복합 FK 기준 |
| INDEX | ix_view_object_order | (workspaceId, objectDefinitionId, sortOrder, id) | WHERE objectDefinitionId IS NOT NULL. Object의 View 목록 |
| INDEX | ix_view_list_order | (workspaceId, listDefinitionId, sortOrder, id) | WHERE listDefinitionId IS NOT NULL. List의 View 목록 |
| INDEX | ix_view_dashboard_order | (workspaceId, sortOrder, id) | WHERE type = 'DASHBOARD' AND objectDefinitionId IS NULL AND listDefinitionId IS NULL. Workspace 대시보드 목록 |

### 3.3 검증·동작

- 일반 View는 Object/List 중 정확히 하나를 지정한다.
- 현재 CSV의 선택적 대시보드 소속을 채택한다면 DASHBOARD는 Object/List를 0개 또는 1개 지정한다. 둘 다 지정하는 것은 금지한다.
- name은 공백만으로 구성할 수 없다. 이름의 중복은 금지하지 않는다.
- revision은 양의 정수이며 View 설정 저장 시 서버에서 증가시킨다.
- configJson은 SQL NULL 또는 JSON 객체다. 표시 속성·필터·정렬·그룹의 행을 중복 저장하지 않는다.
- View 순서 변경과 새 View 생성에서는 서버가 sortOrder를 지정한다. 새 View를 모두 0으로 저장한 뒤 UUID 순서에 의존하지 않는다.
- Attio는 List에서 가장 위 View를 기본 진입 화면으로 사용한다. 같은 규칙을 채택하면 isDefault나 defaultViewId가 필수는 아니다.
- Object에도 같은 기본 진입 규칙을 적용할지, 마지막 선택 View를 복원할지는 후속 정책으로 구분한다.

## 4. ViewAttributeSettingDefinition

기존 Attribute를 참조해 View별 표시 역할과 형식을 설정한다. 원본 Attribute 정의나 값을 복사하지 않는다.

### 4.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 설정 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| viewDefinitionId | UUID | 불가 | 없음 | 소속 View |
| sourceScope | ViewSourceScopeEnum | 불가 | 없음 | 원본 Record 또는 ListEntry에서 조회를 시작할지 구분 |
| attributeDefinitionId | UUID | 불가 | 없음 | 경로 끝에서 읽을 기존 Attribute |
| referenceAttributeIdPathJson | JSONB | 불가 | [] | RecordReference Attribute ID의 순서 배열 |
| attributeDisplayRole | ViewAttributeDisplayRoleEnum | 불가 | 없음 | 일반 표시·제목·본문·날짜·위치·집계값 역할 |
| sortOrder | INT | 불가 | 0 | 표시 순서 |
| labelOverride | TEXT | 가능 | 없음 | 해당 View에서만 사용할 표시 이름 |
| width | INT | 가능 | 없음 | 표 열 너비. 단위는 px 제안 |
| isHidden | BOOLEAN | 불가 | false | 화면에서 숨길지 여부 |
| formatJson | JSONB | 가능 | 없음 | View별 날짜·숫자·금액 표시 형식 |

### 4.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| INDEX | ix_view_attribute_order | (workspaceId, viewDefinitionId, sortOrder, id) | 표시 설정 조회 |
| INDEX | ix_view_attribute_source | (workspaceId, attributeDefinitionId) | 최종 Attribute 참조 설정 조회 |
| 부분 UNIQUE 제안 | uq_view_attribute_single_role | (workspaceId, viewDefinitionId, attributeDisplayRole) | 단일 역할 계약 채택 시에만 적용. WHERE attributeDisplayRole IN ('TITLE', 'IMAGE', 'START_DATE', 'END_DATE', 'LOCATION', 'PROGRESS') |

### 4.3 검증·동작

- 직접 속성이면 referenceAttributeIdPathJson은 []다.
- RecordReference를 따라가면 경로의 순서·타입·소속과 마지막 Attribute 소속을 검증한다.
- Object View는 RECORD를 시작점으로 사용한다. List View는 RECORD와 LIST_ENTRY를 구분해 원본 값과 업무 전용 값을 함께 표시한다.
- 단일 역할 부분 UNIQUE는 해당 역할이 필드 하나를 사용한다는 renderer/API 계약을 채택할 때 적용하는 제안이다. DISPLAY·BODY·MEASURE에는 적용하지 않는다.
- (viewDefinitionId, attributeDefinitionId)만으로 UNIQUE를 걸지 않는다. 같은 Attribute를 다른 경로나 다른 표시 역할로 사용할 수 있다.
- width는 NULL 또는 양의 정수다.
- isHidden이 true여도 원본 값과 날짜·집계 등의 계산 역할을 삭제하지 않는다.
- formatJson은 SQL NULL 또는 JSON 객체이며 원본 Attribute 설정을 변경하지 않는다.
- 기존 AttributeDefinition의 objectDefinitionId/listDefinitionId 정확히 하나 CHECK를 유지한다. sourceScope는 View 조회의 시작점이며 Attribute에 새 소속 type 컬럼을 추가하는 근거가 아니다.
- 값은 기존 RecordAttributeValueDefinition/ListEntryValueDefinition의 attributeType snapshot과 타입별 컬럼을 사용한다. View용 값 복제 테이블을 만들지 않는다.
- 표시 형식은 기존 User의 locale·통화·timezone 설정을 참고할 수 있지만 원본 값이나 사용자 설정을 갱신하지 않는다.

## 5. ViewFilterGroupDefinition

AND/OR 필터 트리의 그룹을 저장한다.

### 5.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 그룹 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| viewDefinitionId | UUID | 불가 | 없음 | 소속 View |
| parentViewFilterGroupDefinitionId | UUID | 가능 | 없음 | 상위 그룹. NULL이면 루트 |
| conditionGroupOperator | ViewConditionGroupOperatorEnum | 불가 | 없음 | AND 또는 OR |
| sortOrder | INT | 불가 | 0 | 같은 부모 안의 순서 |

### 5.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| UNIQUE | uq_view_filter_group_ctx | (id, viewDefinitionId, workspaceId) | 부모 그룹·조건의 같은 View/Workspace FK 기준 |
| UNIQUE | uq_view_filter_group_root | (workspaceId, viewDefinitionId) | WHERE parentViewFilterGroupDefinitionId IS NULL. 루트 최대 1개 |
| INDEX | ix_view_filter_group_children | (workspaceId, viewDefinitionId, parentViewFilterGroupDefinitionId, sortOrder, id) | 같은 부모의 그룹 조회 |

### 5.3 검증·동작

- 필터가 없으면 그룹 0개, 필터가 있으면 루트 하나를 두는 표현 규칙을 권장한다.
- 부분 UNIQUE는 루트를 최대 하나로 제한한다. 필터가 있는 경우 루트의 존재와 전체 연결 상태는 Application에서 검증한다.
- 자기 자신을 부모로 지정하는 것은 CHECK로 금지한다.
- 부모 FK는 (parentViewFilterGroupDefinitionId, viewDefinitionId, workspaceId)로 연결한다.
- 여러 행에 걸친 순환은 일반 CHECK로 검증하지 않고 Application의 트리 검사로 처리한다.
- 부모 삭제 시 하위 그룹과 조건은 함께 정리한다.

## 6. ViewFilterConditionDefinition

필터 그룹에 속하는 실제 비교 조건을 저장한다.

### 6.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 조건 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| viewDefinitionId | UUID | 불가 | 없음 | 소속 View |
| viewFilterGroupDefinitionId | UUID | 불가 | 없음 | 조건이 속하는 필터 그룹 |
| sourceScope | ViewSourceScopeEnum | 불가 | 없음 | Record / ListEntry 시작점 |
| attributeDefinitionId | UUID | 불가 | 없음 | 비교할 최종 Attribute |
| referenceAttributeIdPathJson | JSONB | 불가 | [] | 참조 경로 |
| comparisonOperator | ViewComparisonOperatorEnum | 불가 | 없음 | 속성 타입에 맞는 비교 연산자 |
| comparisonValueJson | JSONB | 가능 | 없음 | 비교값 또는 현재 사용자·상대 날짜 표현 |
| multiValueMatchMode | ViewMultiValueMatchModeEnum | 불가 | ANY | 여러 값·참조 결과의 ANY/ALL 평가 |
| sortOrder | INT | 불가 | 0 | 그룹 안의 조건 순서 |

### 6.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| INDEX | ix_view_filter_condition_group | (workspaceId, viewDefinitionId, viewFilterGroupDefinitionId, sortOrder, id) | 그룹별 조건 조회 |
| INDEX | ix_view_filter_condition_source | (workspaceId, attributeDefinitionId) | Attribute 참조 조건 조회 |

날짜의 이후·이전 조건처럼 같은 Attribute에 여러 조건을 적용해야 하므로 Attribute 조합의 업무 UNIQUE는 두지 않는다.

### 6.3 검증·동작

- 그룹 FK는 (viewFilterGroupDefinitionId, viewDefinitionId, workspaceId)를 사용한다.
- 비교값 없는 연산자는 comparisonValueJson에 SQL NULL을 사용한다. JSON null과 구분한다.
- 속성 타입별 허용 연산자, 값 형태, 다중값 처리와 참조 ID의 Workspace를 검증한다.
- 이번 달·현재 사용자 같은 표현은 저장 시점의 날짜·사용자로 치환하지 않는다. 조회 시 해석한다.
- 현재 사용자 조건은 해당 사용자의 WorkspaceMember/Actor 매핑을 통해 평가한다.
- 상대 날짜의 기본 사용자 timezone은 User.timeZone의 IANA ID다. 명시적 View/조건 timezone을 허용할지는 계약으로 정한다.
- dateValue는 시간대 없는 날짜로 비교한다. timestampValue는 사용자 timezone의 날짜 경계를 계산한 뒤 UTC instant 구간으로 변환한다. 고정 UTC 오프셋으로 IANA timezone을 대체하지 않는다.
- API의 감사 시각은 UTC ISO string으로 반환하고, 화면은 locale과 사용자 timezone으로 변환한다.

## 7. ViewSortDefinition

조회 결과의 정렬 기준과 우선순위를 저장한다.

### 7.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 정렬 설정 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| viewDefinitionId | UUID | 불가 | 없음 | 소속 View |
| sourceScope | ViewSourceScopeEnum | 불가 | 없음 | Record / ListEntry 시작점 |
| attributeDefinitionId | UUID | 불가 | 없음 | 정렬할 최종 Attribute |
| referenceAttributeIdPathJson | JSONB | 불가 | [] | 참조 경로 |
| sortDirection | ViewSortDirectionEnum | 불가 | 없음 | ASC 또는 DESC |
| sortOrder | INT | 불가 | 0 | 정렬 기준의 우선순위 |
| configJson | JSONB | 가능 | 없음 | NULL 위치·다중값 정렬값 선택 방식 |

### 7.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| INDEX | ix_view_sort_order | (workspaceId, viewDefinitionId, sortOrder, id) | 정렬 설정을 우선순위대로 조회 |
| INDEX | ix_view_sort_source | (workspaceId, attributeDefinitionId) | Attribute 참조 정렬 조회 |

추가 업무 UNIQUE는 두지 않는다. sortOrder 동률은 id로 정렬한다.

### 7.3 검증·동작

- configJson은 SQL NULL 또는 JSON 객체다.
- Attribute·정렬 방향·우선순위를 configJson에 중복 저장하지 않는다.
- 다중값 정렬은 최소·최대 등 어떤 값을 선택할지 계약으로 정의한다.
- 실제 데이터 결과의 마지막 동률 해소 기준은 Record ID 또는 ListEntry ID로 한다. NULL 처리와 함께 커서 페이지네이션 계약에 포함한다.

## 8. ViewGroupDefinition

칸반 열, 일반 그룹, 차트 계열과 피벗 축의 기준을 저장한다.

### 8.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 그룹 기준 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| viewDefinitionId | UUID | 불가 | 없음 | 소속 View |
| sourceScope | ViewSourceScopeEnum | 불가 | 없음 | Record / ListEntry 시작점 |
| attributeDefinitionId | UUID | 불가 | 없음 | 그룹 기준 Attribute |
| referenceAttributeIdPathJson | JSONB | 불가 | [] | 참조 경로 |
| groupRole | ViewGroupRoleEnum | 불가 | GROUP | 일반 그룹·계열·피벗 행/열 역할 |
| sortDirection | ViewSortDirectionEnum | 불가 | 없음 | 그룹의 기본 정렬 방향 |
| sortOrder | INT | 불가 | 0 | 그룹 기준의 우선순위 |
| configJson | JSONB | 가능 | 없음 | 날짜 버킷·숫자 구간·집계 기준 정렬 |

### 8.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| UNIQUE | uq_view_group_ctx | (id, viewDefinitionId, attributeDefinitionId, workspaceId) | 그룹 설정의 View/Attribute/Workspace 복합 FK 기준 |
| INDEX | ix_view_group_order | (workspaceId, viewDefinitionId, groupRole, sortOrder, id) | 역할별 그룹 기준 조회 |
| INDEX | ix_view_group_source | (workspaceId, attributeDefinitionId) | Attribute 참조 그룹 조회 |

### 8.3 검증·동작

- (View, Attribute)만으로 UNIQUE를 걸지 않는다. 같은 속성을 다른 역할이나 날짜 단위로 사용할 수 있다.
- type별로 허용하는 그룹 기준의 타입·경로·개수를 검증한다.
- configJson은 SQL NULL 또는 JSON 객체이며 기준 Attribute를 중복 저장하지 않는다.
- 칸반 카드를 다른 단계로 이동하는 동작은 그룹 설정 행의 변경이 아니라 원본 Record/ListEntry의 상태값 변경이다.
- 차트·피벗의 건수 집계는 특정 Attribute가 없는 경우도 있으므로 COUNT 설정과 필드 기반 MEASURE 설정을 구분한다.

## 9. ViewGroupSettingDefinition

같은 그룹 기준 아래에서 특정 옵션·담당자·날짜·빈 값 그룹의 표시 상태를 저장한다.

### 9.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 그룹 설정 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| viewDefinitionId | UUID | 불가 | 없음 | 소속 View |
| viewGroupDefinitionId | UUID | 불가 | 없음 | 표시 설정을 적용하는 그룹 기준 |
| attributeDefinitionId | UUID | 불가 | 없음 | 그룹 기준에서 도출한 Attribute. 옵션 소속 검증용 |
| statusOptionId | UUID | 가능 | 없음 | Status 옵션 그룹 |
| selectOptionId | UUID | 가능 | 없음 | Select 옵션 그룹 |
| groupKeyJson | JSONB | 가능 | 없음 | 옵션 외 그룹의 정규화 식별 키 |
| groupKeyHash | VARCHAR(64) | 가능 | 없음 | 정규화 그룹 키의 SHA-256 |
| sortOrder | INT | 불가 | 0 | 개별 그룹 표시 순서 |
| labelOverride | TEXT | 가능 | 없음 | 해당 View에서 사용할 그룹 이름 |
| isHidden | BOOLEAN | 불가 | false | 그룹 숨김 |
| isFold | BOOLEAN | 불가 | false | 그룹 접힘 |
| configJson | JSONB | 가능 | 없음 | 추가 표현 설정 |

### 9.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| UNIQUE | uq_view_group_setting_status | (workspaceId, viewGroupDefinitionId, statusOptionId) | WHERE statusOptionId IS NOT NULL |
| UNIQUE | uq_view_group_setting_select | (workspaceId, viewGroupDefinitionId, selectOptionId) | WHERE selectOptionId IS NOT NULL |
| UNIQUE | uq_view_group_setting_key | (workspaceId, viewGroupDefinitionId, groupKeyHash) | WHERE groupKeyHash IS NOT NULL |
| INDEX | ix_view_group_setting_order | (workspaceId, viewDefinitionId, viewGroupDefinitionId, sortOrder, id) | 그룹별 설정 조회 |
| INDEX | ix_view_group_setting_status_ref | (workspaceId, attributeDefinitionId, statusOptionId) | WHERE statusOptionId IS NOT NULL. 옵션 참조 정리 |
| INDEX | ix_view_group_setting_select_ref | (workspaceId, attributeDefinitionId, selectOptionId) | WHERE selectOptionId IS NOT NULL. 옵션 참조 정리 |

### 9.3 검증·동작

- statusOptionId, selectOptionId, groupKeyJson 중 정확히 하나를 지정한다.
- groupKeyJson이 있을 때에만 groupKeyHash를 함께 지정한다. SQL NULL과 JSON null을 구분하고 groupKeyJson은 객체로 검증한다.
- 해시는 서버에서 정규화한 키의 SHA-256 소문자 16진수 64자리로 생성한다. 클라이언트가 제공한 해시를 그대로 신뢰하지 않는다.
- 키 정규화는 타입, ID, 날짜 버킷, 숫자 표현과 빈 값 표현을 구분해 같은 그룹이 동일한 키를 갖도록 정의한다.
- 긴 원본 문자열이나 객체 전체를 B-tree UNIQUE에 직접 넣지 않기 위해 groupKeyHash를 사용한다.
- 같은 해시의 기존 행이 있으면 원본 groupKeyJson도 비교한다. 서로 다른 키가 충돌하면 오류로 처리하고 다른 그룹을 합치지 않는다.
- 그룹 FK는 (viewGroupDefinitionId, viewDefinitionId, attributeDefinitionId, workspaceId)를 사용한다.
- Status/Select 옵션 FK는 (optionId, attributeDefinitionId, workspaceId)를 사용한다.
- 옵션 삭제 시 해당 그룹 표시 설정 행을 정리한다. 옵션 ID만 SET NULL로 바꾸면 정확히 하나 지정 규칙을 위반한다.
- 그룹 이름·숨김·접힘·순서를 configJson에 중복 저장하지 않는다.
- 옵션 기본 색상은 기존 SelectOption.color/StatusOption.color를 재사용한다. 두 컬럼은 기본값 없는 nullable TEXT이며, 기존 데이터 backfill·색상 Enum·형식 CHECK를 이 View 문서에서 추가하지 않는다.

## 10. ViewWidgetDefinition

대시보드 View에 다른 View를 배치하는 연결과 표현 설정을 저장한다.

### 10.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 위젯 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| viewDefinitionId | UUID | 불가 | 없음 | 소유 대시보드 View |
| contentViewDefinitionId | UUID | 불가 | 없음 | 위젯에 표시하는 기존 View |
| titleOverride | TEXT | 가능 | 없음 | 위젯 제목 |
| sortOrder | INT | 불가 | 0 | 위젯 순서 |
| isHidden | BOOLEAN | 불가 | false | 위젯 숨김 |
| layoutJson | JSONB | 불가 | 없음 | 위치·너비·높이·화면별 배치 |
| configJson | JSONB | 가능 | 없음 | 제목 표시 등 위젯 표현 옵션 |

### 10.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| INDEX | ix_view_widget_order | (workspaceId, viewDefinitionId, sortOrder, id) | 대시보드 위젯 조회 |
| INDEX | ix_view_widget_content | (workspaceId, contentViewDefinitionId) | 내용 View를 사용하는 위젯 조회 |

(viewDefinitionId, contentViewDefinitionId)에는 UNIQUE를 걸지 않는다. 같은 View를 여러 위치·크기로 배치하는 사용을 금지하지 않는다.

### 10.3 검증·동작

- 부모와 내용 View는 같은 Workspace여야 한다.
- 소유 View가 DASHBOARD인지 Application에서 검증한다.
- viewDefinitionId와 contentViewDefinitionId가 같은 직접 자기 참조는 CHECK로 금지한다.
- 중첩 대시보드 허용 정책은 별도 결정한다. 허용하면 전체 순환을 검사한다.
- layoutJson은 JSON 객체다. 격자 단위·범위·반응형 배치 스키마는 UI 계약으로 고정한다.
- 내용 View의 표시·필터·정렬·집계 설정은 내용 View가 소유한다. 위젯에 복제하지 않는다.

## 11. ViewWorkDependencyDefinition

Record 또는 ListEntry 사이의 업무 선후행 관계를 저장한다. View별 표시 옵션과 별도의 업무 데이터다.

### 11.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 의존 관계 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| sourceRecordDefinitionId | UUID | 가능 | 없음 | 선행 Record |
| sourceListEntryDefinitionId | UUID | 가능 | 없음 | 선행 ListEntry |
| targetRecordDefinitionId | UUID | 가능 | 없음 | 후행 Record |
| targetListEntryDefinitionId | UUID | 가능 | 없음 | 후행 ListEntry |
| type | ViewWorkDependencyTypeEnum | 불가 | 없음 | FS·SS·FF·SF |
| dependencyTimeOffsetValue | NUMERIC(30,10) | 불가 | 0 | 선후행 사이의 시간 간격 |
| dependencyTimeOffsetUnit | ViewWorkDependencyUnitEnum | 불가 | 없음 | MINUTE·HOUR·DAY |

### 11.2 UNIQUE·인덱스

NULL이 있는 모든 ID를 하나의 일반 UNIQUE로 묶으면 중복 방지 의도를 충족하지 못한다. 다음 네 조합을 각각 부분 UNIQUE로 정의한다.

| 종류 | 이름 제안 | 컬럼 | WHERE 조건 |
| --- | --- | --- | --- |
| UNIQUE | uq_work_dependency_rr_type | (workspaceId, sourceRecordDefinitionId, targetRecordDefinitionId, type) | sourceRecordDefinitionId IS NOT NULL AND targetRecordDefinitionId IS NOT NULL |
| UNIQUE | uq_work_dependency_rl_type | (workspaceId, sourceRecordDefinitionId, targetListEntryDefinitionId, type) | sourceRecordDefinitionId IS NOT NULL AND targetListEntryDefinitionId IS NOT NULL |
| UNIQUE | uq_work_dependency_lr_type | (workspaceId, sourceListEntryDefinitionId, targetRecordDefinitionId, type) | sourceListEntryDefinitionId IS NOT NULL AND targetRecordDefinitionId IS NOT NULL |
| UNIQUE | uq_work_dependency_ll_type | (workspaceId, sourceListEntryDefinitionId, targetListEntryDefinitionId, type) | sourceListEntryDefinitionId IS NOT NULL AND targetListEntryDefinitionId IS NOT NULL |
| INDEX | ix_work_dependency_source_record | (workspaceId, sourceRecordDefinitionId) | sourceRecordDefinitionId IS NOT NULL |
| INDEX | ix_work_dependency_target_record | (workspaceId, targetRecordDefinitionId) | targetRecordDefinitionId IS NOT NULL |
| INDEX | ix_work_dependency_source_entry | (workspaceId, sourceListEntryDefinitionId) | sourceListEntryDefinitionId IS NOT NULL |
| INDEX | ix_work_dependency_target_entry | (workspaceId, targetListEntryDefinitionId) | targetListEntryDefinitionId IS NOT NULL |

### 11.3 검증·동작

- 선행은 sourceRecordDefinitionId와 sourceListEntryDefinitionId 중 정확히 하나다.
- 후행은 targetRecordDefinitionId와 targetListEntryDefinitionId 중 정확히 하나다.
- 동일 종류에서 자기 자신을 연결하는 것은 CHECK로 금지한다.
- 같은 연결과 같은 type의 중복만 방지한다. 같은 쌍의 다른 type까지 일괄 금지하지 않는다.
- ViewDefinition FK를 추가하지 않는다. View 삭제가 업무 관계 삭제로 이어지면 안 된다.
- 순환 관계와 일정 자동 이동의 허용·거부 규칙은 간트 동작 계약에서 정한다.
- 음수 간격, 업무일 계산, 같은 List/같은 Object끼리만 연결하는 제한은 현재 확정하지 않는다.
- 원본 Record와 그 Record를 참조하는 ListEntry는 서로 다른 노드 종류다. 서로를 연결할 때의 업무 의미는 별도 검증 대상으로 남긴다.

## 12. ViewFavoriteDefinition

현재 서비스 범위인 개인별 View 즐겨찾기를 저장한다.

### 12.1 컬럼

| 컬럼 | DB 타입 | NULL | 기본값 | 역할 |
| --- | --- | --- | --- | --- |
| id | UUID | 불가 | gen_random_uuid() | 즐겨찾기 PK |
| workspaceId | UUID | 불가 | 없음 | 소속 Workspace |
| createdByActorId | UUID | 불가 | 없음 | 생성 Actor |
| updatedByActorId | UUID | 가능 | 없음 | 마지막 수정 Actor |
| createdAt | TIMESTAMPTZ(3) | 불가 | now() | 생성 시각 |
| updatedAt | TIMESTAMPTZ(3) | 불가 | Prisma @updatedAt | 수정 시각 |
| workspaceMemberId | UUID | 불가 | 없음 | 즐겨찾기 소유 구성원 |
| viewDefinitionId | UUID | 불가 | 없음 | 바로 여는 View |
| sortOrder | INT | 불가 | 0 | 개인 사이드바 순서 |

### 12.2 UNIQUE·인덱스

| 종류 | 이름 제안 | 컬럼 | 조건·목적 |
| --- | --- | --- | --- |
| UNIQUE | uq_view_favorite_member_view | (workspaceId, workspaceMemberId, viewDefinitionId) | 같은 구성원의 같은 View 중복 등록 방지 |
| INDEX | ix_view_favorite_member_order | (workspaceId, workspaceMemberId, sortOrder, id) | 개인 즐겨찾기 사이드바 조회 |
| INDEX | ix_view_favorite_view | (viewDefinitionId, workspaceId) | View 삭제 시 관련 즐겨찾기 조회·정리 |

### 12.3 검증·동작

- 개인 설정의 소유자는 workspaceMemberId다. createdByActorId는 감사 정보다.
- WorkspaceMember와 View는 즐겨찾기와 같은 Workspace여야 한다.
- 원본 View에 접근할 권한이 있는지 등록·조회·열기 시 검증한다. 즐겨찾기 등록은 원본 접근 권한을 부여하지 않는다.
- ViewDefinition에 전역 isFavorite를 추가하지 않는다.
- 현재 10개 설계에는 즐겨찾기 폴더나 Record·Note 등 다른 대상의 즐겨찾기를 포함하지 않는다. Attio의 전체 즐겨찾기 기능과 범위를 혼동하지 않는다.

## 13. FK 연결과 삭제 규칙 제안

아래 정책은 신규 View 테이블을 실제 DDL로 옮기기 전 API 삭제 계약과 함께 확정할 권장안이다. 기존 List 값 테이블의 삭제 규칙을 대체하지 않는다. 설정 정리를 생략한 채 필수 소속 ID를 NULL로 바꾸지 않는다.

| 참조 관계 | 자식 FK 컬럼 → 부모 키 | 삭제 처리 제안 |
| --- | --- | --- |
| 모든 테이블 → Workspace | workspaceId → Workspace.id | Workspace 삭제 시 소유 행 CASCADE |
| 모든 테이블 → 생성 Actor | (createdByActorId, workspaceId) → Actor.(id, workspaceId) | RESTRICT |
| 모든 테이블 → 수정 Actor | (updatedByActorId, workspaceId) → Actor.(id, workspaceId) | updatedByActorId 컬럼만 SET NULL. workspaceId는 유지 |
| View → Object | (objectDefinitionId, workspaceId) → ObjectDefinition.(id, workspaceId) | Object 삭제 시 소속 View CASCADE |
| View → List | (listDefinitionId, workspaceId) → ListDefinition.(id, workspaceId) | List 삭제 시 소속 View CASCADE |
| 표시·필터·정렬·그룹·위젯 소유 설정 → View | (viewDefinitionId, workspaceId) → ViewDefinition.(id, workspaceId) | View 삭제 시 소유 설정 CASCADE |
| 표시·조건·정렬·그룹 및 그룹 설정 → 최종 Attribute | (attributeDefinitionId, workspaceId) → AttributeDefinition.(id, workspaceId) | NO ACTION. 참조 정리·무효화와 삭제를 같은 트랜잭션에서 수행하도록 지연 FK 제안 |
| 필터 그룹 → 부모 그룹 | (parentViewFilterGroupDefinitionId, viewDefinitionId, workspaceId) → ViewFilterGroupDefinition.(id, viewDefinitionId, workspaceId) | 부모 삭제 시 하위 그룹 CASCADE |
| 필터 조건 → 그룹 | (viewFilterGroupDefinitionId, viewDefinitionId, workspaceId) → ViewFilterGroupDefinition.(id, viewDefinitionId, workspaceId) | 그룹 삭제 시 조건 CASCADE |
| 그룹 설정 → 그룹 기준 | (viewGroupDefinitionId, viewDefinitionId, attributeDefinitionId, workspaceId) → ViewGroupDefinition.(id, viewDefinitionId, attributeDefinitionId, workspaceId) | 기준 삭제 시 설정 CASCADE |
| 그룹 설정 → Status 옵션 | (statusOptionId, attributeDefinitionId, workspaceId) → StatusOption.(id, attributeDefinitionId, workspaceId) | 옵션 삭제 시 해당 표시 설정 행 CASCADE |
| 그룹 설정 → Select 옵션 | (selectOptionId, attributeDefinitionId, workspaceId) → SelectOption.(id, attributeDefinitionId, workspaceId) | 옵션 삭제 시 해당 표시 설정 행 CASCADE |
| 위젯 → 내용 View | (contentViewDefinitionId, workspaceId) → ViewDefinition.(id, workspaceId) | 내용 View 삭제 시 참조 위젯 행 CASCADE. 소유 대시보드는 유지 |
| 업무 관계 → Record | (source/targetRecordDefinitionId, workspaceId) → RecordDefinition.(id, workspaceId) | 해당 업무 삭제 시 연결 행 CASCADE |
| 업무 관계 → ListEntry | (source/targetListEntryDefinitionId, workspaceId) → ListEntryDefinition.(id, workspaceId) | 해당 참여 항목 삭제 시 연결 행 CASCADE |
| 즐겨찾기 → WorkspaceMember | (workspaceMemberId, workspaceId) → WorkspaceMember.(id, workspaceId) | 구성원 삭제 시 개인 즐겨찾기 CASCADE |
| 즐겨찾기 → View | (viewDefinitionId, workspaceId) → ViewDefinition.(id, workspaceId) | View 삭제 시 즐겨찾기 CASCADE |

Attribute 지연 FK는 PostgreSQL의 NO ACTION / DEFERRABLE INITIALLY DEFERRED 형태를 제안한다. 단순히 지연시키는 것으로 참조 정리가 완료되지는 않는다. transaction 종료 전에 모든 참조를 정리해야 한다.

Attribute가 삭제될 때 참조 경로 JSON 안의 중간 Attribute, configJson의 집계 참조, 동적 비교값의 참조도 함께 검사한다. 필터 조건 삭제가 조회 범위를 조용히 넓히는 문제가 있으므로, 자동 제거·무효화·삭제 거부 중 적용할 사용자 동작을 API 계약에 명시한다.

View 삭제는 설정·위젯·즐겨찾기만 정리하며 원본 Record/ListEntry는 삭제하지 않는다. 원본 Object/List 삭제의 데이터 수명주기는 기존 도메인 계약을 따른다.

### 13.1 기존 SQL 전용 제약 보존

CRM_CORE_SCHEMA_DRAFT.md 10절과 이미 적용된 List migration의 다음 동작을 유지한다.

| 기존 대상 | 보존해야 하는 DB 동작 |
| --- | --- |
| ListEntryValueDefinition.selectOptionId | ON DELETE SET NULL ("selectOptionId"). 값 row와 필수 소속 ID 유지 |
| ListEntryValueDefinition.statusOptionId | ON DELETE SET NULL ("statusOptionId"). 값 row와 필수 소속 ID 유지 |
| ListEntryValueDefinition.targetActorId | ON DELETE SET NULL ("targetActorId"). 값 row와 필수 소속 ID 유지 |
| ListEntryValueDefinition의 참조 Record/Object 쌍 | ON DELETE SET NULL ("targetRecordDefinitionId", "targetObjectDefinitionId") 및 두 ID 동시 NULL/지정 CHECK 유지 |
| ListEntryValueDefinition의 targetObjectDefinitionId FK | NO ACTION / DEFERRABLE INITIALLY DEFERRED 유지. Prisma에는 NoAction으로 표현 |
| AttributeDefinition 소속 | objectDefinitionId/listDefinitionId 중 정확히 하나 CHECK와 기존 slug UNIQUE 유지 |

Prisma v6가 필수 소속 컬럼을 포함한 SetNull 관계에 경고를 내더라도 이를 없애려고 workspaceId·attributeDefinitionId 등을 nullable로 바꾸지 않는다. 정본에는 기존 경고 4건이 기록되어 있다. 후속 View 추가로 경고가 달라지면 원인을 따로 검토하며 단순 건수 비교만으로 정상 여부를 판단하지 않는다.

새 ViewGroupSettingDefinition의 옵션 삭제 CASCADE는 파생 표시 설정 행에 대한 신규 제안이다. 기존 ListEntryValueDefinition의 옵션 삭제 SET NULL과 데이터 보존 정책을 변경하는 의미가 아니다.

Prisma schema/diff만 확인하지 않고 실제 constraint 정의, 컬럼 지정 SET NULL, 지연 검사 속성과 삭제 결과를 검증해야 한다.

## 14. 기존 스키마 보완 사항

### 14.1 복합 참조 키

| 기존 테이블 | 현재 상태 | 제안 |
| --- | --- | --- |
| AttributeDefinition | (id, listDefinitionId, workspaceId) UNIQUE 존재 | (id, workspaceId) UNIQUE 추가. Object/List 공통 Attribute의 Workspace 복합 FK 기준 |
| ListEntryDefinition | (id, listDefinitionId, workspaceId) UNIQUE 존재 | (id, workspaceId) UNIQUE 추가. 업무 관계의 복합 FK 기준 |
| ObjectDefinition | (id, workspaceId) UNIQUE 존재 | 재사용 |
| ListDefinition | (id, workspaceId) UNIQUE 존재 | 재사용 |
| RecordDefinition | (id, workspaceId) UNIQUE 존재 | 재사용 |
| WorkspaceMember | (id, workspaceId) UNIQUE 존재 | 재사용 |
| Actor | (id, workspaceId) UNIQUE 존재 | 재사용 |
| SelectOption | (id, attributeDefinitionId, workspaceId) UNIQUE 존재 | 재사용 |
| StatusOption | (id, attributeDefinitionId, workspaceId) UNIQUE 존재 | 재사용 |

기존 migration 이력을 수정하지 않고 후속 migration으로 추가한다. UNIQUE 추가는 FK 참조를 위한 기술적 키이며 사용자 이름의 중복 금지 같은 업무 정책이 아니다.

### 14.2 List의 Parent Object 후속 검토

DB 정본은 List 기준 Object 정책을 미정으로 두고 현재 List에 Object FK를 추가하지 않도록 기록하고 있다. 따라서 Parent Object는 이번 View 설계의 필수 기존 스키마 변경에서 제외한다. Attio의 Parent Object는 정책 차이의 비교 대상으로 기록하며, 별도 확정 전에는 컬럼·FK·backfill을 적용하지 않는다.

| 기존 테이블 | 후속 컬럼 후보 | 타입 후보 | 상태·관계 |
| --- | --- | --- | --- |
| ListDefinition | parentObjectDefinitionId | UUID | 보류. 정책이 확정될 경우 검토할 같은 Workspace의 Object 참조 후보 |

정책이 확정되는 경우에 한해 (parentObjectDefinitionId, workspaceId) → ObjectDefinition.(id, workspaceId) FK와 (workspaceId, parentObjectDefinitionId) 조회 인덱스를 별도 설계한다. 현재 필수 migration 목록에는 넣지 않는다.

- 정책 확정과 기존 List의 실제 Entry 구성 확인 전에는 컬럼을 생성하거나 값을 임의로 채우거나 NOT NULL로 전환하지 않는다.
- Parent Object를 ViewDefinition.objectDefinitionId에 대신 저장하지 않는다. List View의 원본은 계속 listDefinitionId다.
- Attio는 Parent Object 변경 시 이전 Object의 기존 Entry를 남길 수 있다. 모든 과거 Entry를 현재 부모 Object와 일괄 일치시키는 DB 제약을 추가하지 않는다.
- 새 Entry 등록 시의 대상 Object 검증과 기존 다른 Object Entry의 조회·수정 규칙을 API 계약에 명시한다.

### 14.3 ListEntry 중복과 행 식별

Attio는 같은 Record를 같은 List에 여러 번 등록할 수 있다. 저장소의 현재 정본은 이 업무 정책을 아직 미정으로 기록하며, 현행 DB에는 (listDefinitionId, recordDefinitionId) UNIQUE가 없다. View 문서에서는 현행 제약을 유지하고 중복 금지 UNIQUE를 추가하지 않는다. API에서의 중복 허용·거부 정책까지 이 문서가 이미 확정했다고 해석하지 않는다.

Object View의 행은 RecordDefinition.id, List View의 행은 ListEntryDefinition.id로 식별한다. 같은 원본 Record를 참조하더라도 ListEntry별 업무값·선택 상태·수정 대상은 구분한다.

다중값을 저장하는 기존 값 테이블에도 단순 (Record, Attribute) 또는 (ListEntry, Attribute) UNIQUE를 일괄 추가하지 않는다.

## 15. 실제 데이터 조회용 인덱스

View 설정 인덱스와 Record/ListEntry의 실제 데이터 조회 인덱스는 목적이 다르다.

### 15.1 표시값 일괄 읽기

| 테이블 | 인덱스 | 상태·목적 |
| --- | --- | --- |
| RecordAttributeValueDefinition | (workspaceId, recordDefinitionId, attributeDefinitionId) | 추가 권장. 여러 Record의 표시값 일괄 조회 |
| ListEntryValueDefinition | (workspaceId, listEntryDefinitionId, attributeDefinitionId) | 현재 존재. 여러 Entry의 업무값 일괄 조회 |

### 15.2 필터·정렬 인덱스 후보

다음은 실제 주요 쿼리와 실행 계획으로 채택 여부를 검증할 후보이며, 모든 타입에 일괄 생성하는 필수 목록이 아니다.

| 테이블 | 인덱스 컬럼 | WHERE 조건 | 용도 |
| --- | --- | --- | --- |
| RecordAttributeValueDefinition | (workspaceId, objectDefinitionId, attributeDefinitionId, numberValue, recordDefinitionId) | numberValue IS NOT NULL | 숫자 조건·범위·정렬 |
| ListEntryValueDefinition | (workspaceId, listDefinitionId, attributeDefinitionId, dateValue, listEntryDefinitionId) | dateValue IS NOT NULL | 업무 마감일 필터·정렬 |
| ListEntryValueDefinition | (workspaceId, listDefinitionId, attributeDefinitionId, statusOptionId, listEntryDefinitionId) | statusOptionId IS NOT NULL | 칸반 단계별 Entry 조회 |

Timestamp 조건은 timestampValue를 사용하는 별도 쿼리다. 다중값 집계 정렬, 여러 조건 결합과 참조 경로 조인은 단일 인덱스만으로 해결된다고 가정하지 않는다. 대표 데이터와 EXPLAIN ANALYZE로 확인하고 쓰기 비용도 함께 검토한다.

## 16. 저장·권한·트랜잭션 계약

| 동작 | 저장·조회 기준 | 트랜잭션·검증 |
| --- | --- | --- |
| View 생성 | View와 최초 설정을 생성 | 본체·하위 설정을 원자적으로 저장 |
| 공유 View 저장 | 저장된 표시·필터·정렬·그룹 설정 갱신 | 클라이언트가 읽은 revision 확인, 관련 행 변경과 revision 증가를 같은 트랜잭션으로 수행 |
| 임시 필터·정렬 | 저장된 공유 설정에 덮어쓰지 않는 화면 상태 | 저장 행동 전에는 공유 설정 mutation을 수행하지 않음 |
| View 복제 | 새 ID의 View와 하위 설정 생성 | 복사 대상 전체 저장. 원본 데이터와 개인 즐겨찾기는 복제하지 않음 |
| View·속성·그룹 순서 변경 | 서버가 순서 계산 | 대상 소속 검증과 순서 갱신을 원자적으로 처리 |
| 즐겨찾기 등록 | 현재 구성원과 기존 View 연결 | UNIQUE를 이용해 재시도 중복 방지. 원본 접근 권한 검증 |
| 즐겨찾기 열기 | 해당 View와 원본 데이터 조회 | 현재 원본 Object/List 접근 권한을 다시 검증 |
| 칸반 단계 이동 | 원본 Record/ListEntry의 상태값 갱신 | 해당 Entry/Record·Attribute·옵션 소속 검증 후 저장 |
| View 삭제 | 소유 설정·즐겨찾기·참조 위젯 정리 | 원본 Record/ListEntry와 업무 관계는 보존 |
| Attribute·옵션 삭제 | 참조 설정 정리 또는 무효화 | 필터 의미 변화와 JSON 내부 참조를 포함해 같은 트랜잭션에서 처리 |
| 업무 관계 수정 | 원본 업무 노드 사이의 관계 갱신 | 노드 종류·소속·중복·순환 정책 검증 |

Attio의 저장된 필터·정렬은 해당 View에 접근할 수 있는 구성원에게 공유된다. 개인 즐겨찾기와 저장 전 임시 필터를 공유 View 설정과 구분한다.

현재 구조는 modular monolith + Clean Architecture다. View application이 저장 use case와 transaction 경계를 소유하고, 다른 모듈의 데이터는 공개 application/query port를 통해 검증한다. Application은 Prisma transaction client에 직접 의존하지 않는다.

이는 후속 View 구현의 책임 배치 제안이다. 현재 DB 정본에서 owning List module이 없는 List 기반의 임시 소유자는 CRM core다. 이 문서 작성으로 List/View module이나 API/FE가 구현된 것으로 취급하지 않는다.

View 이름·설명·필터 비교값과 참조 값에는 개인정보가 들어갈 수 있으므로 일반 로그에 원문을 남기지 않는다. 로그에는 request ID, 실행 주체 ID, Workspace/View ID, 오류 코드와 필요한 운영 메타데이터를 사용하며 토큰·비밀값·접속 문자열을 기록하지 않는다.

API endpoint·DTO·오류 코드·권한 체계는 이 스키마 문서만으로 확정하지 않는다. API 구현 전 별도 계약에서 요청/응답, ownership, revision 충돌, idempotency, 관측성, rollback 범위를 정의한다. 이 문서에는 새 API나 구현 완료 상태를 부여하지 않는다.

## 17. 구현 전 확인할 항목

| 항목 | 현재 문서의 상태 | 구현 착수 기준 |
| --- | --- | --- |
| 기본 View와 마지막 선택 복원 우선순위 | 미정 | Object/List별 진입 정책 명시 |
| 대시보드의 선택적 Object/List 소속 | CSV 기반 제안 | 소속 허용 범위와 목록 노출 정책 명시 |
| 단일 표시 역할 부분 UNIQUE | renderer 계약에 따른 제안 | 역할별 허용 개수 확정 |
| 필터 연산자와 JSON 스키마 | 타입별 계약 필요 | 속성 타입·연산자·값 형태·빈 값·timezone 규칙 명시 |
| 그룹 키 정규화·해시 | 추가 제안 | 정규화와 충돌 검증 규칙 명시 |
| 중첩 대시보드 | 미정 | 허용 여부와 순환 검사 정책 명시 |
| 업무 관계의 순환·음수 간격·일정 이동 | 미정 | 계산·저장 동작 명시 |
| List Parent Object | DB 정본상 미정·현행 Object FK 없음 | View 필수 변경에서 제외. 정책이 별도 확정된 경우에만 데이터 보존·backfill·NULL 단계 설계 |
| 같은 List 내 같은 Record 중복 정책 | DB 정본상 미정·현행 UNIQUE 없음 | 현행 DB 유지. List API 정책을 별도로 명시 |
| Attribute 삭제 시 설정 처리 | API 계약 필요 | 자동 정리·무효화·거부 기준과 사용자 결과 명시 |
| FK 삭제·지연 정책 | 권장안 | 실제 삭제 use case와 migration SQL로 정합성 검증 |
| 기존 SQL 전용 제약 | 보존 대상 | 컬럼 지정 SET NULL·참조 Object 지연 FK·참조 쌍 CHECK와 원본 값 보존 검증 |
| 조회 인덱스 후보 | 실행 계획 검증 전 | 대표 쿼리의 정확성·성능·페이지네이션 검증 |

## 18. CSV 대비 변경과 검증 범위

| 구분 | 내용 |
| --- | --- |
| 신규 테이블 | 기존 9개에 ViewFavoriteDefinition 추가 |
| 신규 컬럼 제안 | ViewDefinition.revision, ViewGroupSettingDefinition.groupKeyHash |
| 관계 보완 | View·그룹·Attribute·Entry·옵션의 Workspace/View 복합 FK와 참조 키 명시 |
| 유일성 보완 | 필터 루트, 그룹 식별, 업무 관계 4종 조합, 개인 즐겨찾기 부분·복합 UNIQUE |
| 기존 테이블 보완 제안 | Attribute/Entry 복합 참조 키, 실제 값 조회 인덱스. List Parent Object는 별도 정책 확정 전 제외 |
| 표현 유지 | 표시·필터·정렬·그룹 설정을 원본 데이터와 분리. View별 Record 복제 없음 |
| 미적용 범위 | Prisma 모델·migration·실제 DB·API·FE 코드는 변경하지 않음 |

문서 검증에서는 CSV의 기존 9개 테이블·125개 컬럼이 각 컬럼 표에 포함되는지, 즐겨찾기와 제안 컬럼이 추가되었는지, 참조 문서 경로와 표 형식을 확인한다. 실제 구현에서는 Prisma 검증, migration 제약 검증, Workspace 경계, 공유 설정 동시 수정, 삭제 수명주기와 실제 조회 실행 계획을 별도로 검증해야 한다.

### 18.1 후속 migration·데이터 보존 검증 기준

아래는 CRM DB 정본에서 계승할 구현 검증 기준이다. 현재 문서 작성 작업에서 DB에 접속하거나 migration을 실행했다는 의미가 아니다.

- 이미 적용된 migration SQL을 수정하지 않고 새 후속 migration을 작성한다.
- 테이블·키·FK·CHECK·인덱스와 한국어 DB 주석을 하나의 DDL transaction으로 적용한다. 신규 테이블·컬럼에는 역할을 설명하는 COMMENT ON TABLE/COLUMN을 작성한다.
- 현재 존재하는 PK·FK·UNIQUE·인덱스, 컬럼 지정 SET NULL, 지연 FK와 CHECK를 보존한다. 기존 옵션 color의 타입·NULL·기본값도 유지한다.
- 기존 Record·Attribute·Entry·값 row를 정리하거나 임의로 갱신하지 않는다. 별도 데이터 이관이 확정되지 않았다면 backfill을 수행하지 않는다.
- FK 추가 전에 고아 참조나 Workspace/List/Attribute 불일치가 있으면 migration을 중단한다. 임의 Object/List를 생성해 보정하지 않는다.
- 적용 전후 기존 CRM 데이터의 건수·row checksum과 기존 constraint/index 정의를 비교한다.
- UUID 생성, 소속 격리, 옵션/참조 삭제와 cascade는 transaction rollback으로 검증하고 검증 데이터를 남기지 않는다.
- 되돌림은 새 데이터 유무와 보존 방식을 확인한 별도 후속 migration으로 설계한다. 재귀 삭제나 DROP CASCADE를 되돌림의 기본 방식으로 사용하지 않는다.
- Prisma validate와 필요한 generate·Backend typecheck/lint/test/build를 실행하고, 실제 SQL 전용 제약도 검증한다. schema diff만으로 보존을 판정하지 않는다.

### 18.2 이번 DB 정본 대조 결과

DB_SCHEMA 문서 8개, 현재 Prisma 스키마와 List/옵션 색상 migration을 대조했다. 공통 UUID·감사 시각·Workspace 경계는 유지하고, List Parent Object를 필수 보완처럼 표현한 부분은 보류로 정정했다. 기존 중복 정책과 신규 View 제안의 상태를 구분하고, SQL 전용 삭제 동작·옵션 색상·시간대·데이터 보존 기준을 보강했다.

수정 범위는 이 문서 하나다. DB 정본, 기존 Prisma 스키마, migration, 기존 사용자 데이터는 변경하지 않는다.

## 19. 참고 자료

### 저장소

- [검토한 View 컬럼 CSV](<../TEMP/DB 스키마 - View 테이블 컬럼 설계안 (1).csv>)
- [사이드바와 View 사용자 흐름](SIDEBAR_AND_VIEW_USER_FLOW.md)
- [현재 Prisma 스키마](../BE/prisma/schema.prisma)
- [DB 스키마 안내](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md)
- [현재 CRM Core/List 스키마와 후속 설계](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md)
- [시간·타임존 규약](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md)
- [Auth/User 스키마와 사용자 기본 설정](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md)
- [에러 신고 원장 규칙](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/ERROR_REPORT_SCHEMA.md)
- [지원 요청 원장 규칙](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/SUPPORT_REQUEST_SCHEMA.md)
- [공개 문의의 독립 원장 규칙](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/PUBLIC_CONTACT_REQUEST_SCHEMA.md)
- [제거된 고정형 CRM 도메인](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md)
- [기존 List/Entry/값 migration SQL](../BE/prisma/migrations/20261008030000_create_list_definition_entry_and_values/migration.sql)
- [기존 옵션 색상 migration SQL](../BE/prisma/migrations/20261009010000_add_select_and_status_option_color/migration.sql)
- [Backend API 계약 규약](../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md)
- [Backend 트랜잭션 규약](../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md)
- [Modular monolith 경계](../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md)

### Attio 공식 문서와 DB 참고

- [Attio List 생성·View·중복 Entry](https://attio.com/help/reference/managing-your-data/lists/create-lists): List 대상 Object, 같은 원본의 여러 View, 동일 Record의 반복 Entry 등록.
- [Attio List·View 관리](https://attio.com/help/reference/managing-your-data/lists/manage-lists): List의 첫 View를 기본 진입으로 사용, View 즐겨찾기, Parent Object 변경 시 기존 Entry 보존.
- [Attio 필터·정렬 저장](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views): 저장된 공유 설정과 저장하지 않은 임시 설정 구분.
- [Attio 개인 즐겨찾기](https://attio.com/help/reference/productivity-collaborating/navigating-your-workspace): 개인별 즐겨찾기와 View 외 대상·폴더.
- [Attio 표 View](https://attio.com/help/reference/managing-your-data/views/create-and-manage-table-views): 표시 속성과 표 설정.
- [Attio 칸반 View](https://attio.com/help/reference/managing-your-data/views/create-and-manage-kanban-views): 단계·카드·표시 속성·필터·정렬.
- [Attio 대시보드·보고서](https://attio.com/help/reference/managing-your-data/dashboard-and-reports/reports): 데이터 View와 별도인 보고서·대시보드 기능.
- [PostgreSQL 제약 조건](https://www.postgresql.org/docs/current/ddl-constraints.html): 복합 FK 참조 키, 부분 유일성, NULL 처리와 지연 가능한 제약.
