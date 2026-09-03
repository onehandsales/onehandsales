# 002 Mobile App Foundation

Date: 2026-09-03

## 1. 결정

모바일 앱은 Expo 기반 React Native로 작성한다.

현재 `FE/mobile-app`은 원하는 형태가 아니므로, 문서 확정 이후 재생성할 수 있다. 단, 필요한 이미지/로고 asset은 선별 보존할 수 있다.

## 2. 스타일 결정

모바일 앱 스타일은 NativeWind를 사용한다.

규칙:

- 화면에서 긴 `className` 반복을 금지한다.
- `AppButton`, `AppText`, `AppTextInput`, `Screen`, `BottomSheet` 같은 공통 컴포넌트를 먼저 만든다.
- 색상, 간격, 폰트는 Tailwind config token만 사용한다.
- 웹 전용 CSS 사고방식을 금지한다.
- 복잡한 gesture, animation, platform style은 `StyleSheet` 병행을 허용한다.

## 3. 상태 관리 결정

인증 상태는 Zustand 기반 auth store에서 관리한다.

단, refresh token은 Zustand store와 Zustand persist에 저장하지 않는다.

auth store가 관리할 수 있는 값:

- access token
- access token 만료 시각
- 현재 사용자 요약
- 인증 상태

## 4. API client 결정

모바일 공통 API client는 `TokenProvider` 인터페이스를 통해 access token을 읽는다.

API client는 Zustand store, React context, secure storage, Supabase client를 직접 import하지 않는다.

```ts
interface TokenProvider {
  getAccessToken(): string | null | Promise<string | null>;
}
```

## 5. 이유

Expo는 초기 개발 속도, OAuth/deep link 처리, 추후 EAS Build 확장성을 고려했을 때 모바일 1차 기반으로 적합하다.

NativeWind는 React/Tailwind에 익숙한 팀이 React Native UI를 빠르게 작성하는 데 유리하다. 다만 반복 class와 토큰 우회가 쌓이면 유지보수성이 떨어지므로 공통 컴포넌트와 Tailwind config token을 강제한다.

Zustand는 인증 상태가 router, API client, 화면 전역에서 필요해질 가능성을 고려해 선택한다. refresh token은 보안상 store/persist에 두지 않는다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
