# DB Schema

현재 Prisma schema는 인증/세션, 사용자 프로필, 지원 접수, 공개 문의 접수 모델만 활성 범위로 둔다.

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
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`

## 원칙

- 인증이 필요한 접수 row는 `userId` ownership과 제출 시점 사용자 snapshot을 가진다.
- 공개 문의 row는 User FK 없이 독립 원장으로 저장한다.
- 공개 문의의 회사명과 회사 규모 입력 필드는 현재 schema에 남아 있다.
- 고정형 고객사/담당자/상품/딜/일정/회의록/검색/Product Analytics 계열 모델은 현재 schema에 없다. 관련 문서는 비활성 기록으로만 유지한다.
