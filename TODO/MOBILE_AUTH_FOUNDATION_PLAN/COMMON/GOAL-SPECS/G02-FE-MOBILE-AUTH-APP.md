# G02-FE-MOBILE-AUTH-APP

## 1. 목적

`FE/mobile-app`을 Expo Router 기반 모바일 인증 앱 foundation으로 구성한다.

1차 완료 화면은 로그인/회원가입, 앱 시작 세션 복구, 최소 `HomeScreen`, 로그아웃이다.

## 2. 구현 범위

- Expo Router route/layout 구조
- NativeWind와 Tailwind config token 설정
- 공통 UI primitive
- auth provider adapter
- secure storage refresh token 저장소
- memory-only access token auth store
- `TokenProvider` 기반 API client
- 모바일 auth API client
- 앱 시작 세션 복구
- 로그인/회원가입 화면
- 최소 `HomeScreen`
- logout 흐름

## 3. 설계 기준

- `src/app`은 route entry와 layout만 담당한다.
- 실제 화면 구현은 `src/features/<domain>/screens`에 둔다.
- API 호출, hook, schema, type, store는 feature 또는 `src/lib` 경계에 둔다.
- refresh token은 `expo-secure-store` 같은 secure storage에만 둔다.
- access token은 메모리 상태에만 둔다.
- API client는 Zustand store, React context, secure storage, Supabase client를 직접 import하지 않는다.
- API client는 `TokenProvider`를 통해 access token을 읽는다.
- Supabase SDK는 auth provider adapter 안에만 둔다.
- OAuth는 Expo AuthSession 또는 OS 시스템 브라우저로 진행한다.
- User Web auth 화면의 provider 순서와 문구 톤을 따른다.

## 4. 기존 `FE/mobile-app` 처리

현재 구조가 목표와 맞지 않으면 재구성할 수 있다.

삭제 또는 재구성 전에 다음 asset 보존 여부를 확인한다.

- `assets/brand/logo-mark.png`
- `assets/auth/google-logo.png`
- `assets/auth/line-logo.png`
- `assets/auth/apple-logo.png`
- `assets/icon.png`
- `assets/splash-icon.png`

## 5. 테스트 기준

- 앱 시작 시 signedOut 상태가 정상 표시된다.
- secure storage token이 있으면 refresh를 시도한다.
- refresh 성공 시 보호 route로 진입한다.
- refresh 성공 시 현재 native mobile device 정보를 HomeScreen에 표시한다.
- refresh 실패 시 secure storage token을 삭제하고 로그인 화면으로 간다.
- provider 버튼이 Google, LINE, Apple 순서로 표시된다.
- OAuth pending/error 상태가 표시된다.
- exchange 성공 후 `/api/me` 호출과 최소 홈 이동이 동작한다.
- logout 후 signedOut 상태로 돌아간다.
- refresh token이 AsyncStorage, Zustand persist, 일반 state에 저장되지 않는다.

## 6. 완료 기준

- Mobile App typecheck가 통과한다.
- lint가 설정되어 있으면 통과한다.
- 최소 로컬 실행에서 로그인 화면 진입과 route guard smoke를 확인한다.
- 실제 OAuth smoke가 불가능하면 mock과 환경 미구성 사유를 `TODO_LOG`에 기록한다.
