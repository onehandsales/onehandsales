# 모바일 앱 인증 Foundation 범위 결정

Date: 2026-09-03

## 1. 결정

네이티브 모바일 앱은 `FE/mobile-app`에 두고, 구현 기준 문서는 `AGENT/SOFTWARE_AGENT/MOBILE_AGENT`에서 독립적으로 관리한다.

모바일 앱 1차 범위는 로그인/회원가입, Backend 모바일 인증 세션 교환, 앱 시작 시 세션 복구, `/api/me` 확인, 최소 `HomeScreen`, 로그아웃까지다.

회사, 담당자, 제품, 딜, 일정, 회의록, 명함 OCR, push, 연락처/캘린더 연동, 오프라인 임시 저장은 모바일 1차 범위에 포함하지 않는다.

## 2. 이유

웹 MVP와 User Web 모바일 브라우저 대응은 이미 별도 흐름으로 존재한다. 하지만 Series A급 제품으로 확장하려면 네이티브 앱의 라우팅, OAuth 복귀, 보안 저장소, 배포, 세션 복구 정책을 웹의 하위 규칙처럼 다루면 안 된다.

React Native가 React와 유사하더라도 런타임과 보안 저장소가 다르므로 `MOBILE_AGENT`는 `FRONT_AGENT`의 오버라이드가 아니라 독립 정본으로 둔다.

## 3. 인증 정책

- 모바일의 공식 세션은 Supabase session이 아니라 Backend `AuthSession`이다.
- Supabase는 현재 빠른 OAuth 구현을 위한 외부 인증 adapter로만 취급한다.
- 모바일 앱은 Backend User API인 `/api/*`만 호출하고 `/admin/api/*`는 호출하지 않는다.
- 모바일 인증은 `/api/auth/mobile/exchange`, `/api/auth/mobile/refresh`, `/api/auth/mobile/logout`을 기준으로 설계한다.
- 네이티브 Mobile App의 `deviceSlot` 값은 `native_mobile`이고 Backend Prisma enum은 `NATIVE_MOBILE`이다. 사용자당 활성 네이티브 모바일 기기는 1대만 허용한다.
- 새 모바일 기기 로그인은 기존 활성 모바일 기기와 세션을 교체한다.
- refresh token은 모바일 보안 저장소에만 저장하고, AsyncStorage, Zustand persist, 일반 state, 로그, analytics, crash report에 남기지 않는다.
- access token은 짧은 수명으로 취급하고 메모리에만 보관한다.

## 4. UX 기준

로그인/회원가입 화면은 User Web의 브라우저 모바일 인증 화면을 기준으로 삼되, WebView나 pixel-perfect 복제가 아니라 React Native 화면으로 다시 구현한다.

OAuth는 Expo AuthSession 또는 시스템 브라우저를 사용한다. 약관, 개인정보처리방침, 보안 문서 같은 정책 링크도 앱 내부 WebView가 아니라 OS 브라우저로 연다.

사용자 노출 에러 문구와 provider 순서는 User Web과 맞춘다. 현재 provider 노출 순서는 Google, LINE, Apple이다.

## 5. 기존 Mobile/PWA Field Use와의 관계

`GLOBAL_B2C_01_11_FEATURE_CATALOG.md`의 10 Mobile/PWA Field Use는 User Web의 모바일 브라우저 현장 입력성 foundation이다.

이 결정의 모바일 앱 인증 foundation은 위 10번 완료 범위를 대체하지 않는다. 네이티브 앱의 1차 시작 범위를 별도로 여는 결정이다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/NAVIGATION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/DECISIONS/001_mobile_login_first_scope.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/DECISIONS/002_mobile_app_foundation.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/DECISIONS/003_mobile_auth_session_policy.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/DECISIONS/004_mobile_navigation_and_auth_ux.md`
- `AGENT/UXUI_AGENT/DECISIONS/021_uxui_mobile_auth_native_reference.md`
- `AGENT/PM_AGENT/DECISIONS/027_auth_session_and_provider_qa_policy.md`
