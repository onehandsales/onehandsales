# 데이터 모델

Status: Current Implementation Boundary
Date: 2026-09-12

## 1. 목적

이 문서는 현재 구현된 데이터 모델과 후속 CRM Core 제품 개념의 경계를 설명한다.

PM 문서에서 데이터 모델을 다룰 때는 두 가지를 분리한다.

- 현재 Prisma schema에 실제로 존재하는 구현 모델
- 앞으로 만들 OneHand CRM Core의 제품 개념 모델

후속 CRM Core의 자세한 제품 개념은 `CRM_CORE_CONCEPT_MODEL.md`를 우선한다. 이 문서는 현재 활성 구현 범위를 명확히 하는 역할을 한다.

## 2. 현재 활성 엔티티

현재 데이터 모델은 인증/세션, 사용자 프로필, 지원 접수, 공개 문의 접수만 활성 범위로 둔다.

- User
- UserOAuthAccount
- AuthDevice
- AuthSession
- ErrorReport
- SupportRequest
- PublicContactRequest

## 3. 현재 활성 Enum

- PlatformRole
- UserStatus
- OAuthProvider
- AuthSessionStatus
- AuthDeviceStatus
- AuthDeviceSlot
- ErrorReportStatus
- SupportRequestType
- SupportRequestStatus
- PublicContactRequestStatus

## 4. 현재 핵심 관계

- User 1:N AuthDevice
- User 1:N AuthSession
- User 1:N UserOAuthAccount
- User 1:N ErrorReport
- User 1:N SupportRequest

PublicContactRequest는 로그인 전 공개 문의 원장으로 보존하며 User와 FK로 연결하지 않는다.

## 5. 현재 데이터 보존 정책

- 현재 schema의 `deletedAt`은 User 계정 상태 필드로만 남는다.
- ErrorReport와 SupportRequest는 제출 시점의 사용자 snapshot을 함께 저장한다.
- PublicContactRequest는 문의자가 입력한 원문을 보존한다.
- 공개 문의의 회사명과 회사 규모는 CRM Company record가 아니라 문의 접수 필드다.

## 6. 현재 없는 모델

현재 Prisma schema와 런타임 범위에는 아래 제품 모델이 없다.

- Workspace
- Kit
- Object
- Attribute
- Relationship
- Record
- View
- Team
- Organization
- Company CRM record
- Product CRM record
- Deal CRM record

위 개념을 문서에서 사용할 때는 현재 구현된 기능처럼 쓰지 않는다. 후속 설계 대상 또는 특정 Kit 안의 업무 개념으로만 설명한다.

## 7. 후속 CRM Core 방향

다음 CRM Core는 기존 고정형 고객사 테이블을 되살리지 않고, Workspace/Kit/Object/Attribute/Relationship/Record/View 기반으로 별도 설계한다.

PM 기준:

- Workspace는 사용자의 CRM 데이터가 담기는 기본 공간이다.
- Kit은 특정 직군의 CRM 시작 구조다.
- Object는 관리 대상의 종류다.
- Record는 실제 업무 기록이다.
- Relationship은 Record 사이의 업무 관계다.
- View는 Record를 보는 방식이다.

Software Agent는 이 개념을 바탕으로 실제 Prisma schema, API, migration, 권한 모델을 별도로 설계한다.

## 8. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/PM_AGENT/DECISIONS/023_company_domain_basic_scope.md`
- `AGENT/PM_AGENT/DECISIONS/025_product_domain_basic_scope.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
