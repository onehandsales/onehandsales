# 028 Auth Provider Google Only And Future Local Providers

Date: 2026-07-15

## Decision

Onehand Sales의 현재 활성 로그인 provider는 Google만 사용한다.

Kakao 로그인은 제품 로그인 기능에서 제거한다. User Web 로그인/회원가입 화면, provider 목록 API, Supabase JWT exchange, QA 기준에서 Kakao를 노출하거나 허용하지 않는다.

## Future Providers

- Apple login: iOS 앱 출시 또는 Apple platform 정책 대응이 필요해질 때 별도 설계/구현한다.
- LINE login: 일본, 대만 시장 로컬 provider가 필요해질 때 별도 설계/구현한다.

Apple과 LINE은 현재 구현 범위가 아니라 문서상 후보만 유지한다.

## Legacy Data Policy

Prisma `OAuthProvider.KAKAO` enum은 이미 적용된 migration과 과거 데이터 호환성 때문에 즉시 삭제하지 않는다.

현재 runtime 정책은 다음과 같다.

- `GET /api/auth/providers`는 Google만 반환한다.
- Supabase JWT exchange는 `app_metadata.provider === "google"`만 허용한다.
- User profile에서 비활성 provider enum을 만나면 특정 provider명이 아니라 `legacy_oauth`로 표시한다.
- demo seed는 Google OAuth 계정만 생성한다.

`OAuthProvider.KAKAO`를 DB에서 완전히 제거하려면 별도의 데이터 정리, migration, 운영 계정 영향 검토가 필요하다.

## Implementation Notes

Apple login을 추가할 때는 Supabase provider 설정, Backend verifier 허용 provider, FE provider 타입/copy, OAuth QA, iOS 정책 확인을 함께 진행한다.

LINE login을 추가할 때는 현재 Prisma enum에 `LINE`이 없으므로 schema/migration 추가가 선행되어야 한다. 일본/대만 locale QA와 provider email/identifier 제공 정책도 함께 확인한다.
