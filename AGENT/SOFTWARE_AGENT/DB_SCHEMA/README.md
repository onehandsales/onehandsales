# DB Schema

현재 Prisma schema는 로그인 사용자 기준 회사 관리, 인증/세션, 지원 접수 모델만 활성 범위로 둔다.

## Enums

- `UserRole`
- `UserStatus`
- `OAuthProvider`
- `AuthSessionStatus`
- `AuthDeviceStatus`
- `AuthDeviceSlot`
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
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`

## 원칙

- 모든 업무 row는 `userId` ownership을 가진다.
- Company row에는 현재 사용자용 제거/복구 상태 컬럼을 두지 않는다.
- 별도 복구 전용 table/API도 현재 제공하지 않는다.
- Contact/Product/Deal/Product Analytics 계열 모델은 현재 schema에 없다. 관련 문서는 비활성 기록으로만 유지한다.
