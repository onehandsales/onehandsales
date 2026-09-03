# 028 Auth Provider Runtime Policy

Date: 2026-07-15
Updated: 2026-09-03

## Decision

OneHand Sales의 현재 활성 로그인 provider는 Google, LINE, Apple이다.

Kakao 로그인은 제품 로그인 기능에서 제거한다. User Web 로그인/회원가입 화면, provider 목록 API, Supabase JWT exchange, QA 기준에서 Kakao를 노출하거나 허용하지 않는다.

이 문서는 2026-07-28 G08 구현 이후 runtime baseline을 설명한다.

## 08 Global Data I18N Result

- provider 노출 순서는 Google, LINE, Apple이다.
- Mobile App provider 노출 순서도 User Web과 같은 Google, LINE, Apple이다.
- Kakao는 계속 runtime provider로 노출하지 않는다.
- 신규/기존 사용자 판정은 기존 `provider + providerUserId` 조회를 우선하되, 같은 verified email이 있으면 기존 `User`에 provider 계정을 연결하는 정책을 추가한다.
- provider email이 없거나 verified email로 확인할 수 없으면 가입/로그인을 차단한다.

## Future Providers

- Microsoft login 등 추가 provider는 별도 설계/구현한다.

실제 Google/LINE/Apple provider smoke는 Supabase/provider 운영 설정과 secret이 필요하므로 G10 QA에서 수동 결과 또는 미실행 사유를 기록한다.

Mobile App은 provider 인증 화면을 WebView로 감싸지 않고 Expo AuthSession 또는 시스템 브라우저로 OAuth를 시작한다. OAuth 완료 후에는 Backend 모바일 인증 API에서 OneHand app session으로 교환한다.

## Legacy Data Policy

Prisma `OAuthProvider.KAKAO` enum은 이미 적용된 migration과 과거 데이터 호환성 때문에 즉시 삭제하지 않는다.

현재 runtime 정책은 다음과 같다.

- `GET /api/auth/providers`는 Google, LINE, Apple을 이 순서로 반환한다.
- Supabase JWT exchange는 `google`, `line`, `apple` provider metadata만 허용한다.
- Mobile App도 runtime provider는 Google, LINE, Apple만 사용하며 Kakao를 노출하지 않는다.
- User profile에서 Google/LINE/Apple은 실제 provider로 표시하고 Kakao 같은 비활성 provider enum은 `legacy_oauth`로 표시한다.
- demo seed는 Google OAuth 계정만 생성한다.

`OAuthProvider.KAKAO`를 DB에서 완전히 제거하려면 별도의 데이터 정리, migration, 운영 계정 영향 검토가 필요하다.

## Implementation Notes

Apple/LINE 운영 검증 시에는 Supabase provider 설정, redirect URL, provider email/identifier 제공 정책, provider별 manual smoke 결과를 함께 확인한다.

Mobile App 운영 검증 시에는 Expo AuthSession redirect/deep link, 시스템 브라우저 복귀, Backend `/api/auth/mobile/exchange` 교환, secure storage 저장 여부를 함께 확인한다.
