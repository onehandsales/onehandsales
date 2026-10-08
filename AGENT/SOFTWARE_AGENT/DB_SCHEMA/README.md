# DB Schema

## 1. 목적

이 폴더는 OneHand CRM의 현재 Prisma schema, 후속 CRM Core schema draft, 제거된 레거시 도메인 기록을 관리한다.

현재 코드에 없는 모델을 활성 DB schema처럼 설명하지 않는다.

## 2. 현재 활성 Prisma 범위

기준일: 2026-10-08

현재 `BE/prisma/schema.prisma`의 활성 범위는 인증/세션, 사용자 프로필, 지원/공개 문의 접수, Workspace/Team/Actor, 유연한 CRM 코어와 List 기반이다.

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

## 4. 현재 CRM Core와 후속 범위

`ObjectDefinition`, `AttributeDefinition`, `RecordDefinition`, `RecordAttributeValueDefinition`, `SelectOption`, `StatusOption`, `RelationshipDefinition`은 현재 schema에 있다.

List, ListEntry, ListEntryValue의 DB 기반은 구현했다. List API/FE, View와 Kit 모델은 후속 범위다. List 기준 Object와 같은 Record의 같은 List 내 중복 참여 정책은 아직 고정하지 않는다.

`CRM_CORE_SCHEMA_DRAFT.md`에서 현재 Attribute/List 구현과 미구현 후보를 구분한다. 후속 기능/API 구현 전에는 관련 정책과 API 계약을 확인한다. View는 List 이후 별도 작업이다.

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
