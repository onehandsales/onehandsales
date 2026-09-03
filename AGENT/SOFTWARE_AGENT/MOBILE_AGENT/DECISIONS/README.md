# Mobile 결정 기록

## 1. 목적

이 폴더는 OneHand Sales 모바일 앱의 주요 기술 의사결정을 기록한다.

모바일 결정은 `FRONT_AGENT` 결정의 오버라이드가 아니라 독립 결정으로 취급한다. React Native가 React와 유사하더라도 모바일 앱은 runtime, storage, OAuth redirect, routing, build/distribution 정책이 다르기 때문이다.

## 2. 현재 결정 문서

- `001_mobile_login_first_scope.md`
- `002_mobile_app_foundation.md`
- `003_mobile_auth_session_policy.md`
- `004_mobile_navigation_and_auth_ux.md`

## 3. 현재 확정 요약

- 모바일 앱은 Expo 기반 React Native로 작성한다.
- 현재 `FE/mobile-app`은 문서 확정 이후 재생성할 수 있다.
- 1차 범위는 로그인/회원가입, 모바일 인증 세션, 앱 시작 시 세션 복구, `/api/me`, 최소 `HomeScreen`, 로그아웃이다.
- 모바일 인증은 Backend `AuthDevice/AuthSession` 정책을 공유한다.
- 네이티브 Mobile App의 API `deviceSlot`은 `native_mobile`이고 Backend Prisma enum은 `NATIVE_MOBILE`이다.
- 사용자당 활성 네이티브 모바일 기기는 1대만 허용한다.
- 모바일 refresh token은 secure storage에만 저장한다.
- 모바일 인증 API는 `/api/auth/mobile/*`로 웹 인증 API와 분리한다.
- 모바일 refresh 요청 body 필드명은 `mobileRefreshToken`이다.
- secure storage key는 `onehand.mobile.auth.mobileRefreshToken`이다.
- navigation은 Expo Router를 사용한다.
- 로그인/회원가입 UX는 user-web의 브라우저 모바일 auth 화면을 기준으로 네이티브 포팅한다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
