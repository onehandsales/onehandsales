# 데이터 모델

현재 데이터 모델은 개인 사용자 중심 CRM과 지원 접수, 제품 분석만 활성 범위로 둔다.

## 활성 엔티티

- User
- UserOAuthAccount
- AuthDevice
- AuthSession
- Company
- CompanyField
- CompanyRegion
- CompanyMemoLog
- CompanyUserPrivateMemoLog
- Contact
- ContactJobGrade
- ContactDepartment
- ContactMemoLog
- ContactUserPrivateMemoLog
- Product
- ProductCategory
- ProductStatus
- ProductMemoLog
- ProductUserPrivateMemoLog
- Deal
- DealCompany
- DealContact
- DealProduct
- DealFollowingActionLog
- DealMemoLog
- DealActivity
- ProductAnalyticsEvent
- UserActivationSnapshot
- RetentionCohortSnapshot
- ErrorReport
- SupportRequest
- PublicContactRequest

## 핵심 관계

- User 1:N Company, Contact, Product, Deal
- Deal N:M Company via `DealCompany`
- Deal N:M Contact via `DealContact`
- Deal N:M Product via `DealProduct`
- Company/Contact/Product/Deal 1:N memo log
- Deal 1:N following action log
- Deal 1:N activity log
- User 1:N auth device/session/OAuth account
- User 1:N product analytics event

## 삭제 정책

- Company/Contact/Product/Deal과 관련 메모/다음 행동 row는 soft delete를 사용한다.
- `deletedAt`, `deletedByUserId`, `trashExpiresAt` 기준으로 휴지통 목록과 복구를 처리한다.
- 복구 기간이 지난 row는 사용자 직접 복구 대상에서 제외한다.

## 분석/지원 접수

- Product Analytics는 event, activation snapshot, retention cohort snapshot으로 나눈다.
- 오류 신고, 지원 문의, 공개 문의는 사용자 업무 데이터와 분리해 저장한다.
