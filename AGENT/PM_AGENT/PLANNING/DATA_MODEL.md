# 데이터 모델

현재 데이터 모델은 개인 사용자 중심 회사 관리, 인증/세션, 지원 접수만 활성 범위로 둔다.

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
- ErrorReport
- SupportRequest
- PublicContactRequest

## 활성 Enum

- UserRole
- UserStatus
- OAuthProvider
- AuthSessionStatus
- AuthDeviceStatus
- AuthDeviceSlot
- ErrorReportStatus
- SupportRequestType
- SupportRequestStatus
- PublicContactRequestStatus

## 핵심 관계

- User 1:N Company
- User 1:N CompanyField
- User 1:N CompanyRegion
- CompanyField 1:N Company
- CompanyRegion 1:N Company
- Company 1:N CompanyMemoLog
- Company 1:N CompanyUserPrivateMemoLog
- User 1:N auth device/session/OAuth account
- User 1:N ErrorReport
- User 1:N SupportRequest

## 삭제 정책

- Company, CompanyMemoLog, CompanyUserPrivateMemoLog는 soft delete를 사용한다.
- `deletedAt`, `deletedByUserId`, `trashExpiresAt` 기준으로 휴지통 목록과 복구를 처리한다.
- 복구 기간이 지난 row는 사용자 직접 복구 대상에서 제외한다.

## 지원 접수

- 오류 신고, 지원 문의, 공개 문의는 사용자 업무 데이터와 분리해 저장한다.
