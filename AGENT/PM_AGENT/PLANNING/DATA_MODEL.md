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
- User 1:N auth device/session/OAuth account
- User 1:N ErrorReport
- User 1:N SupportRequest

## 삭제 정책

- Company 삭제 API와 휴지통 복구 정책은 현재 활성 범위에서 제거되어 있다.
- 현재 schema의 `deletedAt`은 User 계정 상태 필드로만 남는다.

## 지원 접수

- 오류 신고, 지원 문의, 공개 문의는 사용자 업무 데이터와 분리해 저장한다.
