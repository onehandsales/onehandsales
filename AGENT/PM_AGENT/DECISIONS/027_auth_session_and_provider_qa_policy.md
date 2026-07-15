# 027 Auth Session And Provider QA Policy

Date: 2026-07-09
Updated: 2026-07-15

## Decision

Onehand Sales의 현재 인증은 Supabase OAuth를 외부 identity provider로 사용하고, 실제 앱 사용자/기기/session은 Backend가 별도로 관리한다.

## Current Product State

- Google OAuth 신규 가입/로그인 QA는 통과했다.
- 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 Supabase OAuth authorize URL을 열고, popup이 차단되면 기존 full-page redirect로 fallback한다.
- 공개/인증 canonical URL은 locale prefix를 사용한다. 예: `/ko/login`, `/ja/signup`, `/en-us/pricing`.
- 기존 `/login`, `/signup` 등 legacy 공개/인증 URL은 선호 locale URL로 redirect한다.
- 로그아웃 후 이동 경로는 선호 locale의 login URL로 통일한다. 예: `/ko/login`, `/en-us/login`.
- 개발용 mock login flow는 User Web에서 제거했다.
- 현재 노출/허용 provider는 Google 하나다. Backend `/api/auth/providers`와 Supabase JWT exchange는 `google`만 허용한다.
- Kakao OAuth는 제품 로그인 기능에서 제거했다. Prisma enum의 `KAKAO`는 과거 데이터 호환용 legacy 값으로만 남긴다.
- Apple login은 iOS 앱 출시 또는 Apple platform 정책 대응이 필요해질 때 별도 구현한다.
- LINE login은 일본/대만 시장 로컬 provider가 필요해질 때 별도 구현한다.

## Session Policy

- 가입과 로그인은 같은 OAuth exchange 흐름이다.
- 신규/기존 사용자 판정은 이메일이 아니라 `provider + providerUserId` 기준이다.
- App access token은 `userId`와 `sessionId`를 담는다.
- Refresh token 원문은 httpOnly cookie로만 내려가고 DB에는 hash만 저장한다.
- 같은 active device에서 다시 로그인하면 session row를 새로 만들지 않고 refresh token을 회전한다.
- 같은 slot의 다른 device가 로그인하면 기존 active device/session을 교체한다.
- 현재 User Web은 `mobile`, `personal_laptop` slot만 사용한다. `work_laptop`은 Backend에 남겨두되 현재 제품 UI에서는 사용하지 않는다.

## Locale, Timezone, Country

- `preferredLocale`과 `timeZone`은 신규 사용자 생성 시 초기화한다.
- 기존 사용자의 `timeZone`은 로그인 시 브라우저 timezone으로 덮어쓰지 않는다.
- 최근 로그인 환경은 `lastLoginLocale`, `lastLoginTimeZone`에 기록한다.
- `signupCountryCode`, `lastLoginCountryCode`는 배포 프록시 geo header가 있을 때만 저장한다.
- 로컬 또는 geo header가 없는 배포 환경에서 국가가 `기록 없음`으로 보이는 것은 현재 정상 동작이다.

## QA Next Step

인증 QA 이후의 다음 제품 QA는 로그인 후 CRM 핵심 플로우다.

1. 회사 생성
2. 담당자 생성
3. 제품 생성
4. 딜 생성
5. 딜에 회사/담당자/제품 연결
6. Next Action 등록/완료 처리
7. 일정 생성과 딜 연결
8. 미팅노트 작성과 회사/담당자/딜 연결
9. 수정/삭제/휴지통 복구
