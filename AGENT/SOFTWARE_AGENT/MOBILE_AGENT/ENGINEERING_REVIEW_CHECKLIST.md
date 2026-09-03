# Mobile Engineering Review Checklist

모바일 앱 변경을 완료하기 전에 아래 항목을 확인한다.

## 1. 1차 범위

- [ ] Expo 기반 React Native 앱이 실행된다.
- [ ] 사용자가 로그인 또는 회원가입을 시작할 수 있다.
- [ ] 로그인/회원가입 UX가 user-web 브라우저 모바일 auth 화면의 구성, 문구 톤, provider 순서와 맞는다.
- [ ] OAuth provider 화면은 WebView가 아니라 Expo AuthSession 또는 시스템 브라우저 기반으로 열린다.
- [ ] OAuth 성공 후 Backend `POST /api/auth/mobile/exchange`를 호출한다.
- [ ] Backend가 발급한 OneHand app access token을 메모리 auth 상태에 반영한다.
- [ ] Backend가 발급한 `mobileRefreshToken`을 secure storage에 저장한다.
- [ ] OneHand app access token으로 `GET /api/me` 호출이 성공한다.
- [ ] 로그인 완료 후 최소 `HomeScreen`이 표시된다.
- [ ] `HomeScreen`은 사용자 이름, 이메일, 인증 상태, 현재 모바일 기기 정보, 로그아웃 액션만 표시한다.
- [ ] CRM 도메인 화면이 1차 범위에 섞이지 않았다.

## 2. 세션 복구와 로그아웃

- [ ] 앱 시작 시 secure storage에서 `onehand.mobile.auth.mobileRefreshToken`을 읽는다.
- [ ] 저장된 `mobileRefreshToken`이 있으면 `POST /api/auth/mobile/refresh`를 호출한다.
- [ ] refresh 성공 시 새 access token, 새 `mobileRefreshToken`, 현재 native mobile device 정보를 반영한다.
- [ ] 이미 회전된 refresh token 재사용은 실패한다.
- [ ] refresh 실패 시 secure storage token을 삭제하고 signedOut 상태로 전환한다.
- [ ] 인증 복구 완료 전 보호 화면을 렌더링하지 않는다.
- [ ] 로그아웃 시 Backend `POST /api/auth/mobile/logout`을 호출한다.
- [ ] 로그아웃 후 secure storage token, 메모리 access token, 사용자 상태를 삭제한다.

## 3. Supabase 사용 제한

- [ ] Supabase는 OAuth login/callback adapter 경계에서만 사용한다.
- [ ] 모바일 앱이 Supabase PostgreSQL에 직접 접근하지 않는다.
- [ ] 모바일 앱이 Supabase Storage에 직접 접근하지 않는다.
- [ ] business API 호출에 Supabase access token을 사용하지 않는다.
- [ ] Supabase SDK를 feature screen 또는 business feature에서 직접 import하지 않는다.
- [ ] Supabase 독립 시 auth provider adapter 교체만으로 주요 화면/API/session 구조가 유지된다.

## 4. Backend API

- [ ] 모바일 앱은 `/api/*`만 호출한다.
- [ ] 모바일 앱은 `/admin/api/*`를 호출하지 않는다.
- [ ] 모바일 auth API는 `/api/auth/mobile/*` 계약을 따른다.
- [ ] refresh 요청 body 필드명은 `mobileRefreshToken`이다.
- [ ] exchange 요청은 `deviceSlot: "native_mobile"` 값을 사용한다.
- [ ] exchange 요청은 `replaceExistingDevice: true`를 사용한다.
- [ ] 사용자당 활성 모바일 기기 1대 정책과 충돌하는 구현이 없다.
- [ ] API base URL은 public config로만 주입한다.
- [ ] 서버 secret, DB URL, service role key가 모바일 코드와 설정에 없다.

## 5. 토큰 보안

- [ ] refresh token은 secure storage에만 저장한다.
- [ ] secure storage key는 `onehand.mobile.auth.mobileRefreshToken`이다.
- [ ] access token은 메모리에만 보관한다.
- [ ] AsyncStorage에 access token, refresh token, OAuth token을 저장하지 않는다.
- [ ] Zustand store와 Zustand persist에 refresh token을 저장하지 않는다.
- [ ] token 원문을 로그, analytics, crash report, error report에 남기지 않는다.
- [ ] refresh token을 URL query, route param, custom header로 전달하지 않는다.

## 6. 앱 구조와 라우팅

- [ ] `src/app`은 route entry와 layout만 담당한다.
- [ ] 실제 화면 구현은 `src/features/<domain>/screens`에 있다.
- [ ] API 호출, hook, schema, type, business UI가 `src/features/<domain>` 경계 안에 있다.
- [ ] 공개 화면은 `src/app/(public)` 아래에 있다.
- [ ] 보호 화면은 `src/app/(app)` 아래에 있다.
- [ ] API client는 Zustand store, React context, secure storage, Supabase client를 직접 import하지 않는다.
- [ ] API client는 `TokenProvider`를 통해 access token을 읽는다.

## 7. UI와 NativeWind

- [ ] NativeWind를 기본 스타일 도구로 사용한다.
- [ ] 색상, 간격, 폰트는 Tailwind config token을 사용한다.
- [ ] 화면마다 긴 `className` 조합을 반복하지 않는다.
- [ ] `AppButton`, `AppText`, `AppTextInput`, `Screen`, `BottomSheet` 같은 공통 컴포넌트를 우선 사용한다.
- [ ] 웹 CSS, DOM, browser storage 전제를 모바일 코드로 가져오지 않는다.
- [ ] Safe Area, 터치 피드백, 키보드 회피, 상태바 처리가 모바일 기준으로 되어 있다.
- [ ] 복잡한 gesture, animation, platform style은 필요한 경우 `StyleSheet`를 병행한다.

## 8. 에러와 문구

- [ ] 모바일 auth/API 에러 메시지는 user-web auth 에러 문구와 같은 의미를 가진다.
- [ ] 모바일 화면 폭이나 toast 제약으로 줄인 문구도 의미가 바뀌지 않는다.
- [ ] 에러 문구는 화면 component에 흩어져 있지 않고 auth feature 또는 공통 error mapper에서 관리된다.
- [ ] 약관, 개인정보처리방침, 정책 문서 링크는 OS 기본 브라우저로 열린다.
- [ ] 정책 문서 URL은 하드코딩하지 않고 환경 설정 또는 공통 상수에서 관리한다.

## 9. 검증

- [ ] TypeScript 검증을 통과한다.
- [ ] lint가 설정되어 있으면 통과한다.
- [ ] 최소 1개 로컬 실행 환경에서 앱 시작과 로그인 화면 진입을 확인한다.
- [ ] refresh 성공/실패 흐름을 mock 또는 수동 smoke로 확인한다.
- [ ] 실제 OAuth smoke가 불가능하면 환경 미구성 사유를 기록한다.
