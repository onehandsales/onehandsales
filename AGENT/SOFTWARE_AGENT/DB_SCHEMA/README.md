# DB Schema

## 1. 목적

이 폴더는 OneHand CRM의 현재 Prisma schema, 후속 CRM Core schema draft, 제거된 레거시 도메인 기록을 관리한다.

현재 코드에 없는 모델을 활성 DB schema처럼 설명하지 않는다.

## 2. 현재 활성 Prisma 범위

DB 적용 기준일: 2026-10-17 / View 스키마 초안 작성일: 2026-10-16

DB 적용 범위는 인증/세션, 사용자 프로필, 지원/공개 문의 접수, Workspace/Team/Actor, 유연한 CRM 코어, List와 View 기반이다. 아래는 기존 Enum 16개와 모델 22개이며, 2.1절의 View Enum 9개와 모델 10개를 포함하면 전체 Enum 25개·모델 32개다.

### Enums

- `PlatformRole`
- `UserStatus`
- `WorkspaceKind`
- `WorkspaceMemberRole`
- `TeamType`
- `TeamMemberRole`
- `ActorType`
- `AttributeType`
- `OAuthProvider`
- `AuthSessionStatus`
- `AuthDeviceStatus`
- `AuthDeviceSlot`
- `ErrorReportStatus`
- `SupportRequestType`
- `SupportRequestStatus`
- `PublicContactRequestStatus`

### Models

- `User`
- `Workspace`
- `WorkspaceMember`
- `Team`
- `TeamMember`
- `Actor`
- `ObjectDefinition`
- `ListDefinition`
- `ListEntryDefinition`
- `ListEntryValueDefinition`
- `AttributeDefinition`
- `RecordDefinition`
- `RecordAttributeValueDefinition`
- `SelectOption`
- `StatusOption`
- `RelationshipDefinition`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`

### 2.1 Supabase에 적용한 View 기반

2026-10-16 작성한 `BE/prisma/schema.prisma`를 기준으로, 2026-10-17 사용자 요청에 따라 View 관련 10개 모델의 저장 컬럼 134개와 기본 ID FK 56개를 Supabase에 적용했다. 적용 migration은 `20261017050000_rebuild_view_tables_from_current_schema`다. 2026-10-24 사이드바 개인 View 즐겨찾기 조회 API와 User Web 표시를 연결했다. 이후 헤더·View 목록·즐겨찾기 등록/해제와 저장 메뉴 조회를 구현했으며 아래 구현 기록과 각 완료 계약을 따른다.

- `ViewDefinition`
- `ViewAttributeSettingDefinition`
- `ViewFilterGroupDefinition`
- `ViewFilterConditionDefinition`
- `ViewSortDefinition`
- `ViewGroupDefinition`
- `ViewGroupSettingDefinition`
- `ViewWidgetDefinition`
- `ViewWorkDependencyDefinition`
- `ViewFavoriteDefinition`

확인된 값의 Enum 9개는 View 타입·조회 시작점·표시 역할·필터 결합·다중값 평가·정렬 방향·그룹 역할·업무 연결 타입·시간 단위를 표현한다. `comparisonOperator`는 허용 목록이 미정이므로 현재 `String`이며, 비교 연산자 Enum은 임의로 확정하지 않았다.

Enum 이름은 `ViewTypeEnum`, `ViewSourceScopeEnum`, `ViewAttributeDisplayRoleEnum`, `ViewConditionGroupOperatorEnum`, `ViewMultiValueMatchModeEnum`, `ViewSortDirectionEnum`, `ViewGroupRoleEnum`, `ViewWorkDependencyTypeEnum`, `ViewWorkDependencyUnitEnum`이다.

`revision`과 `groupKeyHash`는 제외하고 `groupKeyJson`은 유지한다. 신규 모델에는 PK 외 추가 UNIQUE·조회 인덱스·CHECK를 작성하지 않는다. 기본 FK는 단일 ID 참조이므로 같은 Workspace/View/Attribute 소속까지 보장하지 않는다. 즐겨찾기 조회는 현재 멤버·Workspace와 연결 View의 Workspace를 확인한다. 헤더 메뉴 조회도 Workspace/View 범위와 조회된 설정의 Attribute·그룹·옵션·위젯 참조를 application에서 검증한다.

후속 복합 FK·필요 UNIQUE·CHECK·조회 인덱스와 Object/List 영역 보완 후보는 [검토 문서](../../../TODO/VIEW_SCHEMA_DEFERRED_CONSTRAINTS.md)에 이유와 함께 기록한다. 기존 Object/List의 제약과 migration SQL은 그대로 유지한다.

적용 당시 구형 View 9개 테이블은 모두 비어 있었다. 구형 View 테이블·전용 Enum·추가 UNIQUE·CHECK·복합 FK를 제거하고 현재 정의로 재생성했다. View 10개 테이블의 RLS를 활성화하고 기존 권한을 보존했으며, 새 즐겨찾기 테이블은 기존 ViewDefinition의 권한을 따른다. 기존 22개 업무 테이블의 구조·데이터 건수와 checksum·권한은 적용 전후 동일하다.

DB에만 적용 이력이 남아 있는 `20261013050000_create_view_definitions`, `20261013060000_remove_view_query_indexes`의 원본 SQL은 저장소와 로컬 작업 경로에서 찾지 못했다. 기존 이력·checksum을 수정하거나 원본 파일을 추정 생성하지 않았다. 새 migration 적용 후 Prisma diff는 비어 있고 migrate status는 최신 상태지만, 과거 SQL 2건의 원본 복구는 별도 이력 정리 사항이다.

## 3. 현재 schema 원칙

- 인증이 필요한 접수 row는 `userId` ownership과 제출 시점 사용자 snapshot을 가진다.
- 공개 문의 row는 User FK 없이 독립 원장으로 저장한다.
- 공개 문의의 회사명과 회사 규모 입력 필드는 공개 문의 원문 보존 필드다.
- 공개 문의 필드는 고정형 Company record가 아니다.
- `AttributeDefinition`은 Object와 List에서 공용으로 사용한다. nullable `objectDefinitionId`와 `listDefinitionId` 중 정확히 하나만 값이 있어야 한다.
- 소속 제약은 DB CHECK로 관리한다. Object별 `apiSlug` 중복 방지를 유지하고 List별 중복 방지와 조회 인덱스를 추가했다.
- `AttributeDefinition.listDefinitionId`는 같은 Workspace의 `ListDefinition`을 복합 FK로 참조한다.
- `ListEntryDefinition`은 같은 Workspace의 List와 원본 Record를 연결한다. `ListEntryValueDefinition`은 같은 List/Workspace의 Entry와 Attribute를 참조한다.
- List 값의 옵션은 같은 Attribute/Workspace에서 선택하며, Record/Object와 Actor 참조도 같은 Workspace 범위에서 검증한다.
- 세 신규 테이블의 PK는 `@default(dbgenerated("gen_random_uuid()")) @db.Uuid`로 DB에서 생성한다. FK에는 UUID 생성 기본값을 넣지 않는다.
- 복합 FK의 선택 참조 삭제는 migration SQL의 컬럼 지정 `SET NULL`로 관리한다. 필수 소속 ID를 비우지 않는다. 자세한 설명과 Prisma 경고는 `CRM_CORE_SCHEMA_DRAFT.md` 10절을 따른다.
- `SelectOption`과 `StatusOption`은 계속 특정 `AttributeDefinition`을 참조하는 공용 테이블로 사용한다.
- `SelectOption.color`와 `StatusOption.color`는 화면 표시용 nullable 문자열(`String?` / PostgreSQL `TEXT`)이다. 기본값과 색상 형식 제약은 두지 않으며, 미지정 값은 `null`로 저장한다.

## 4. 현재 CRM Core와 후속 범위

`ObjectDefinition`, `AttributeDefinition`, `RecordDefinition`, `RecordAttributeValueDefinition`, `SelectOption`, `StatusOption`, `RelationshipDefinition`은 현재 schema에 있다.

List, ListEntry, ListEntryValue와 View 10개 모델의 DB 기반은 구현했다. 2026-10-24 `list-definition` Backend 모듈에 사이드바 업무 목록 조회 API를 추가했다. 현재 사용자의 Workspace 멤버십 확인 후 ListDefinition의 `id`, `icon`, `name`을 `createdAt ASC`, `id ASC`로 반환한다. [API 계약](../../../TODO/DONE/LIST_DEFINITION_SIDEBAR_LISTS_PLAN/COMMON/API-SPEC/SIDEBAR_LIST_DEFINITION_API.md)을 따른다.

2026-10-24 User Web의 `crm-list` feature를 통해 사이드바 업무 목록에 이름·아이콘을 표시하도록 연결했다. 사용자/Workspace별 Query를 사용하며, 이후 사용자 요청에 따라 로딩·빈 목록·조회 실패 표시를 관리 항목과 동일하게 통일했다. 빈 목록이나 최초 조회 실패에는 안내·재시도 UI 없이 기존 추가 버튼만 표시한다. [최초 Frontend 연동](../../../TODO/DONE/SIDEBAR_WORK_LISTS_FRONTEND_PLAN/README.md)과 [최신 UX 통일 기준](../../../TODO/DONE/SIDEBAR_WORK_LISTS_UX_PARITY_PLAN/README.md)을 따른다.

2026-10-24 `view-definition` Backend 모듈이 사이드바 개인 View 즐겨찾기 읽기를 담당하도록 추가했다. Workspace 공개 접근 Port로 현재 사용자의 멤버 ID를 구한 후 ViewFavoriteDefinition과 연결 ViewDefinition을 조회한다. 응답은 `id`, `viewDefinitionId`, `name`, `icon`이며 Favorite의 `sortOrder ASC`, `createdAt ASC`, `id ASC` 순서다. User Web의 `view-favorite` feature를 통해 기존 공통 `SidebarDataSection`으로 표시한다. [API 계약과 완료 범위](../../../TODO/DONE/SIDEBAR_VIEW_FAVORITES_PLAN/README.md)를 따른다.

2026-10-25 Object/List 클릭 시 헤더를 먼저 조회하는 Backend GET /api/users/me/workspaces/:workspaceId/view-header를 구현했다. targetType=OBJECT/LIST와 targetId를 받고 같은 Workspace의 대상 요약, sortOrder/createdAt/id 오름차순 첫 View, 현재 멤버의 isFavorite를 반환한다. View가 없으면 대상 요약과 null View를 반환하며 자동 생성하지 않는다. Object/List는 각 모듈의 공개 단건 Summary Port, View/Favorite는 view-definition이 조회한다. [API 계약과 완료 범위](../../../TODO/DONE/VIEW_HEADER_DETAIL_API_PLAN/README.md)를 따른다. 임시 PostgreSQL 17에서 실제 격리·정렬·rollback을 포함한 전체 53 suites/267 tests가 실패·skip 없이 통과했다. 스키마·migration·실제 업무 DB 데이터 변경은 없다.

2026-10-26 view-definition에 Object/List 소속 View 드롭다운 목록 Backend GET 두 개를 구현했다. 각 API는 인증 사용자 멤버십과 대상의 Workspace 소속을 기존 공개 Port로 확인하고, ViewDefinition을 workspaceId+대상 FK로 조회한다. sortOrder/createdAt/id 오름차순 전체 요약과 선택적 viewId의 isSelected를 반환한다. 빈 목록·선택 ID 누락/불일치·UUID 대소문자를 처리하며 두 소속 View를 임의 XOR로 제외하지 않는다. [계약·검증·완료 범위](../../../TODO/DONE/OBJECT_LIST_VIEW_LIST_API_PLAN/README.md)를 따른다. 임시 PG17의 전체 58 suites/341 tests와 typecheck/lint/build·Prisma 검증이 통과했다. schema/migration/업무 DB·환경 파일 변경은 없다.

2026-10-29 선택 View의 필터·정렬·보기 설정 GET 3개를 구현했다. View 소유 adapter와 Attribute 공개 메타데이터 Port를 통해 저장 메뉴를 복원하며 경로 UUID·참조 Workspace·전체 필터 순환·그룹/옵션 연결·위젯 원본을 확인한다. [계약과 최종 검토](../../../TODO/DONE/VIEW_HEADER_MENU_QUERY_PLAN/README.md)를 따른다. 격리 PostgreSQL 17을 포함한 전체 64 suites / 462 tests 및 typecheck/lint/build·Prisma validate가 통과했다. schema/migration·실제 업무 DB·ENV 변경은 없다.

헤더·View 드롭다운의 FE 연결과 즐겨찾기 등록/해제는 각 완료 계획을 따른다. 개별 List/View 본문, 이번 메뉴의 FE 연결, List 생성·수정·삭제와 ListEntry/값 API, 즐겨찾기 순서 변경, View 생성/저장·기본 View 자동 생성과 Kit 모델은 후속 범위다. 조회와 사이드바 연결은 schema/migration을 변경하지 않으며, List 기준 Object와 같은 Record의 같은 List 내 중복 참여 정책도 확정하지 않는다.

`CRM_CORE_SCHEMA_DRAFT.md`에서 현재 Attribute/List/View DB 구현과 미구현 후보를 구분한다. 후속 기능/API 구현 전에는 관련 정책과 API 계약을 확인한다.

## 5. 제거된 도메인

고정형 고객사/담당자/상품/딜/일정/회의록/검색/Product Analytics 계열 모델은 현재 schema에 없다.

제거 기록은 `LEGACY_REMOVED_DOMAINS.md`에 통합한다.

## 6. 현재 문서

| 문서 | 목적 |
| --- | --- |
| `AUTH_USER_SCHEMA.md` | User/Auth schema 설명 |
| `ERROR_REPORT_SCHEMA.md` | 오류 신고 schema 설명 |
| `SUPPORT_REQUEST_SCHEMA.md` | 지원 문의 schema 설명 |
| `PUBLIC_CONTACT_REQUEST_SCHEMA.md` | 공개 문의 schema 설명 |
| `TIME_AND_TIMEZONE_POLICY.md` | 시간/타임존 저장 정책 |
| `CRM_CORE_SCHEMA_DRAFT.md` | 후속 CRM Core schema 초안 |
| `LEGACY_REMOVED_DOMAINS.md` | 제거된 레거시 도메인 기록 |

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/COMMON/IMPLEMENTATION_BOUNDARY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
