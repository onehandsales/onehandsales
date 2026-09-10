# DB Schema

현재 Prisma schema는 로그인 사용자 기준 핵심 CRM, 인증/세션, 제품 분석, 지원 접수 모델만 활성 범위로 둔다.

## Enums

- `UserRole`
- `UserStatus`
- `OAuthProvider`
- `AuthSessionStatus`
- `AuthDeviceStatus`
- `AuthDeviceSlot`
- `AiSuggestionPriority`
- `DealActivityType`
- `DealActivitySourceType`
- `ProductAnalyticsEventSource`
- `UserActivationStatus`
- `ProductAnalyticsTargetType`
- `ErrorReportStatus`
- `SupportRequestType`
- `SupportRequestStatus`
- `PublicContactRequestStatus`

## Models

- `User`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`
- `Company`
- `CompanyField`
- `CompanyRegion`
- `CompanyMemoLog`
- `CompanyUserPrivateMemoLog`
- `Contact`
- `ContactJobGrade`
- `ContactDepartment`
- `ContactMemoLog`
- `ContactUserPrivateMemoLog`
- `Product`
- `ProductCategory`
- `ProductStatus`
- `ProductMemoLog`
- `ProductUserPrivateMemoLog`
- `Deal`
- `DealCompany`
- `DealContact`
- `DealProduct`
- `DealFollowingActionLog`
- `DealMemoLog`
- `DealActivity`
- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`

## 원칙

- 모든 업무 row는 `userId` ownership을 가진다.
- Company/Contact/Product/Deal과 관련 로그는 soft delete 컬럼으로 휴지통을 구현한다.
- 별도 Trash table은 두지 않는다.
- Product Analytics raw event는 사용자 삭제 시 같이 정리하고, cohort snapshot은 aggregate로 보관한다.
