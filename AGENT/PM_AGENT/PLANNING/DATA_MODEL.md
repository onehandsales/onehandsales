# 데이터 모델

현재 데이터 모델은 인증/세션, 사용자 프로필, 지원 접수, 공개 문의 접수만 활성 범위로 둔다.

## 활성 엔티티

- User
- UserOAuthAccount
- AuthDevice
- AuthSession
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

- User 1:N auth device/session/OAuth account
- User 1:N ErrorReport
- User 1:N SupportRequest

## 데이터 보존 정책

- 현재 schema의 `deletedAt`은 User 계정 상태 필드로만 남는다.
- ErrorReport와 SupportRequest는 제출 시점의 사용자 snapshot을 함께 저장한다.
- PublicContactRequest는 로그인 전 공개 문의 원장으로 보존하며 User와 FK로 연결하지 않는다.

## 지원 접수

- 오류 신고, 지원 문의, 공개 문의는 사용자 업무 데이터와 분리해 저장한다.

## 후속 CRM 코어

다음 CRM 코어는 기존 고정형 고객사 테이블을 되살리지 않고 Workspace/Object/Attribute/Record/List/View 기반으로 별도 설계한다.
