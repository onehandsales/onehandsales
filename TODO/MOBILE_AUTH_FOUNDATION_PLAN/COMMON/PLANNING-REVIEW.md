# Planning Review

검토 기준일: 2026-09-03

## 1. 결론

Mobile Auth Foundation Plan은 D01 device slot 경계 결정이 완료되어 구현 가능한 상태다.

1차 구현 범위는 작게 유지해야 한다. 현재 목표는 모바일 제품 전체가 아니라 네이티브 앱 인증 foundation이다. Backend 모바일 인증 API, secure storage token 정책, Expo Router 기반 route guard, 최소 홈, 로그아웃까지가 완료 기준이다.

## 2. 확인한 정합성

- PM 결정 `032_mobile_auth_foundation_scope`와 MOBILE_AGENT 문서가 같은 범위를 가리킨다.
- UXUI 결정 `021_uxui_mobile_auth_native_reference`가 User Web 브라우저 모바일 auth 화면을 reference로 삼되 WebView를 금지한다.
- Backend auth 모듈은 이미 `UserOAuthAccount`, `AuthDevice`, `AuthSession` 구조를 갖고 있다.
- Backend에는 웹 cookie 기반 `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout`이 있다.
- 모바일 전용 `/api/auth/mobile/*`는 아직 구현되지 않았으므로 G01에서 구현한다.
- 현재 `FE/mobile-app`은 Expo 최소 앱과 auth 화면 일부, provider asset 정도만 있으므로 G02에서 목표 구조에 맞춰 재구성할 수 있다.
- 현재 User Web은 브라우저 모바일에서 `deviceSlot: "mobile"`을 사용한다. 네이티브 Mobile App은 `deviceSlot: "native_mobile"`과 Prisma enum `NATIVE_MOBILE`로 분리한다.

## 3. 구현 리스크

| 리스크 | 대응 |
| --- | --- |
| 웹 refresh cookie 정책을 모바일에 그대로 복사 | 모바일 API는 cookie를 읽지 않고 `mobileRefreshToken` body 계약을 사용한다. |
| refresh token을 일반 저장소에 저장 | `expo-secure-store` 같은 secure storage만 허용한다. |
| Supabase session을 앱 공식 세션으로 사용 | Supabase는 auth provider adapter 경계로 격리한다. |
| `src/app`에 화면/비즈니스 로직 집중 | Expo Router route entry와 feature 구현을 분리한다. |
| 기존 `FE/mobile-app`을 억지로 보존 | asset 보존 후 구조 재생성을 허용한다. |
| OAuth를 WebView로 처리 | Expo AuthSession 또는 OS 시스템 브라우저만 사용한다. |
| User Web 브라우저 모바일과 네이티브 앱이 같은 slot 사용 | D01에서 네이티브 앱 전용 `native_mobile` / `NATIVE_MOBILE`을 확정했고 API 계약을 confirmed로 승격했다. |

## 4. 구현 전제

- Backend 검증 명령은 G01에서 실제 `BE` package script를 확인한 뒤 실행한다.
- Mobile App 검증 명령은 G02에서 `FE/mobile-app/package.json` 기준으로 실행한다.
- 실제 OAuth smoke가 환경 미구성으로 불가능하면 mock smoke와 환경 미구성 사유를 `TODO_LOG`에 기록한다.
- API 계약이 변경되면 먼저 `COMMON/API-SPEC/MOBILE_AUTH_API.md`를 수정한다.
- G01 Backend 구현은 `native_mobile` / `NATIVE_MOBILE` 계약을 전제로 시작한다.
