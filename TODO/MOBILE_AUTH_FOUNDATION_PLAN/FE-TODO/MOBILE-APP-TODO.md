# Mobile App TODO

상태: Ready for structure / API integration waits for G01

## 1. 구현 대상

`FE/mobile-app`을 모바일 인증 foundation 앱으로 구성한다.

현재 폴더가 목표 구조와 맞지 않으면 재구성할 수 있다. 단, 기존 asset은 삭제 전 보존 여부를 확인한다.

## 2. 목표 구조

```text
FE/mobile-app/src/
  app/
    _layout.tsx
    (public)/
      login.tsx
    (app)/
      _layout.tsx
      index.tsx
  features/
    auth/
      api/
      adapters/
      components/
      hooks/
      screens/
      schemas/
      store/
      types/
    home/
      screens/
  components/
    ui/
    layout/
  lib/
    api-client/
    config/
  types/
```

## 3. Package와 설정

- [ ] `package.json` scripts와 dependency를 확인한다.
- [ ] Expo Router를 설정한다.
- [ ] NativeWind를 설정한다.
- [ ] Tailwind config에 색상, 간격, 폰트 token을 정의한다.
- [ ] secure storage dependency를 추가한다.
- [ ] OAuth/AuthSession 관련 dependency를 추가한다.
- [ ] TanStack Query, Zustand, React Hook Form, Zod 사용 여부를 결정하고 필요한 dependency를 추가한다.
- [ ] API base URL은 public config로만 주입한다.
- [ ] server secret, DB URL, service role key가 모바일 설정에 들어가지 않게 한다.

## 4. 공통 UI

- [ ] `Screen`을 만든다.
- [ ] `AppText`를 만든다.
- [ ] `AppButton`을 만든다.
- [ ] `AppTextInput`을 만든다.
- [ ] `BottomSheet`는 1차 범위에서 필요할 때만 만든다.
- [ ] 색상, 간격, 폰트는 Tailwind config token만 사용한다.
- [ ] 화면마다 긴 `className` 반복을 피하고 공통 컴포넌트로 흡수한다.
- [ ] 복잡한 gesture/animation/platform style은 필요한 경우 `StyleSheet`를 병행한다.

## 5. Auth API와 상태

- [ ] `MobileAuthTokenResponse`, `MobileAuthUserDto`, `MobileAuthDeviceDto` type을 정의한다.
- [ ] `deviceSlot: "native_mobile"` 값을 auth API request type에 반영한다.
- [ ] `mobileExchange` API client를 만든다.
- [ ] `mobileRefresh` API client를 만든다.
- [ ] `mobileLogout` API client를 만든다.
- [ ] `getMe` API client를 만든다.
- [ ] `TokenProvider` 인터페이스를 만든다.
- [ ] 공통 API client가 `TokenProvider`로 access token을 읽게 한다.
- [ ] 401 응답 시 refresh 1회 재시도 정책을 구현한다.
- [ ] refresh 성공 시 response의 `device`를 현재 모바일 기기 정보로 반영한다.
- [ ] refresh 실패 시 signedOut 전환을 구현한다.
- [ ] `mobileRefreshToken` secure storage wrapper를 만든다.
- [ ] secure storage key는 `onehand.mobile.auth.mobileRefreshToken`만 사용한다.
- [ ] access token은 메모리 auth store에만 둔다.
- [ ] refresh token은 Zustand store, Zustand persist, AsyncStorage, React state에 저장하지 않는다.

## 6. OAuth Adapter

- [ ] provider adapter interface를 정의한다.
- [ ] Google provider adapter를 만든다.
- [ ] LINE provider adapter를 만든다.
- [ ] Apple provider adapter를 만든다.
- [ ] Supabase 사용이 필요하면 adapter 내부에만 둔다.
- [ ] OAuth 성공 결과에서 Backend exchange에 넘길 external OAuth access token만 추출한다.
- [ ] OAuth 취소, 실패, pending 상태를 구분한다.
- [ ] provider raw error와 token 원문을 화면/로그에 노출하지 않는다.

## 7. 화면

- [ ] 앱 시작 복구 화면 또는 splash state를 구현한다.
- [ ] 로그인/회원가입 화면을 구현한다.
- [ ] provider 버튼 순서를 Google, LINE, Apple로 맞춘다.
- [ ] User Web 브라우저 모바일 auth 화면의 정보 구조와 문구 톤을 맞춘다.
- [ ] OAuth pending 상태를 구현한다.
- [ ] OAuth 실패 상태를 구현한다.
- [ ] Backend exchange 실패 상태를 구현한다.
- [ ] 최소 `HomeScreen`을 구현한다.
- [ ] `HomeScreen`에는 사용자 이름, 이메일, 인증 상태, 모바일 기기 정보, 로그아웃 액션만 둔다.
- [ ] CRM 도메인 화면을 1차 범위에 넣지 않는다.

## 8. Route Guard

- [ ] `src/app/(public)` 공개 route를 만든다.
- [ ] `src/app/(app)` 보호 route를 만든다.
- [ ] 인증 복구 완료 전 `(app)` 화면을 렌더링하지 않는다.
- [ ] signedOut 상태에서 보호 route 접근 시 login으로 보낸다.
- [ ] signedIn 상태에서 login 접근 시 home으로 보낸다.

## 9. 검증

- [ ] `pnpm --dir FE/mobile-app typecheck`
- [ ] lint script가 있으면 실행
- [ ] Expo local start 가능 여부 확인
- [ ] signedOut 앱 시작 smoke
- [ ] refresh success mock smoke
- [ ] refresh success 이후 HomeScreen 기기 정보 표시 smoke
- [ ] refresh failure mock smoke
- [ ] exchange success mock 또는 실제 API smoke
- [ ] logout smoke
- [ ] token 저장소 금지 항목 검색

## 10. 완료 기록

완료 후 `TODO_LOG/YYYY-MM-DD/G02_FE_MOBILE_AUTH_APP/WORK_LOG.md`에 기록한다.

기록 항목:

- 재구성 여부
- 보존한 asset 목록
- 설치/수정한 dependency
- 구현한 route와 feature 구조
- 연결한 API
- 실행한 검증 명령과 결과
- 실제 OAuth smoke 가능 여부
- 남은 이슈
