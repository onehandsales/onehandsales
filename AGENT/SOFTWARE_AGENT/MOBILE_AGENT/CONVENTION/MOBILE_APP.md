# Mobile App Convention

이 문서는 `FE/mobile-app` React Native 코드 작성 시 지켜야 하는 기본 규칙을 정의한다.

## 1. 파일과 폴더 이름

- 폴더와 파일 이름은 `kebab-case`를 사용한다.
- React Native component 파일은 `login-screen.tsx`, `app-button.tsx`처럼 이름만 보고 역할을 알 수 있게 짓는다.
- feature 폴더는 단수형 domain 이름을 사용한다. 예: `auth`, `home`, `company`, `contact`, `deal`.
- route 파일은 Expo Router 규칙을 따른다.

## 2. TypeScript 기준

- `strict`를 켠다.
- API 응답, 요청 payload, screen props, hook 반환 타입은 명시한다.
- `any`는 금지한다.
- 외부 응답은 Zod schema 또는 명시 타입으로 경계를 세운다.
- 공통 타입은 `src/types`, feature 타입은 `src/features/<domain>/types`에 둔다.

## 3. React Native 작성 규칙

- component는 함수형 component를 사용한다.
- screen component는 화면 조립과 사용자 상호작용 연결에 집중한다.
- API 호출, schema, 복잡한 business 상태 처리는 screen 안에 직접 두지 않는다.
- 기능별 UI는 `src/features/<domain>/components`에 둔다.
- 공통 UI는 `src/components/ui`, layout primitive는 `src/components/layout`에 둔다.
- DOM API, `window`, `document`, browser storage, CSS selector 전제를 사용하지 않는다.

## 4. Expo Router 규칙

- `src/app`은 route entry와 layout만 담당한다.
- 실제 화면 구현은 `src/features/<domain>/screens`에 둔다.
- 공개 route는 `src/app/(public)` 아래에 둔다.
- 로그인 이후 보호 route는 `src/app/(app)` 아래에 둔다.
- route entry에서 API 호출, form schema, business UI를 직접 구현하지 않는다.
- 주요 record 화면은 후속 CRM 확장 시 deep link 가능성을 고려해 route 구조를 설계한다.

## 5. API 호출과 서버 상태

- API 호출은 공통 API client를 통해 수행한다.
- 화면 component에서 `fetch`를 직접 호출하지 않는다.
- 모바일 앱은 Backend User API인 `/api/*`만 호출한다.
- 모바일 앱은 Admin API인 `/admin/api/*`를 호출하지 않는다.
- 서버 상태는 TanStack Query를 사용할 수 있다.
- Query key는 feature별 파일에서 관리한다.
- mutation 이후 관련 query key를 명확히 invalidate한다.

## 6. 상태 관리

- 화면 내부 상태는 `useState`, `useReducer`, React Hook Form으로 관리한다.
- 인증 상태는 Zustand 기반 auth store에서 관리한다.
- 여러 화면에서 공유되는 UI 상태가 실제로 필요할 때만 Zustand를 사용한다.
- 서버 응답 전체를 전역 상태에 복제하지 않는다.
- refresh token은 Zustand store와 Zustand persist에 저장하지 않는다.

## 7. 스타일과 UI

- NativeWind를 기본 스타일 도구로 사용한다.
- 색상, 간격, 폰트는 Tailwind config token만 사용한다.
- 화면에서 긴 `className` 반복을 금지한다.
- 반복되는 버튼, 텍스트, 입력, 화면 layout은 공통 컴포넌트로 먼저 만든다.
- 우선 생성할 공통 컴포넌트: `AppButton`, `AppText`, `AppTextInput`, `Screen`, `BottomSheet`.
- 웹 전용 CSS 사고방식을 금지한다.
- 복잡한 gesture, animation, platform style은 `StyleSheet` 병행을 허용한다.
- Safe Area, 터치 피드백, 키보드 회피, 상태바, 앱 전환을 모바일 기준으로 설계한다.

## 8. Auth UX 기준

- 모바일 앱의 로그인/회원가입 UX는 user-web의 브라우저 모바일 로그인/회원가입 화면을 기준으로 한다.
- 화면 구성, 정보 우선순위, 문구 톤, OAuth provider 노출 순서, 약관/정책 안내, 에러 메시지는 user-web과 최대한 일치시킨다.
- 구현 코드는 React DOM/Tailwind 코드를 복사하지 않고 React Native + NativeWind로 재구현한다.
- 픽셀 단위 복제보다 네이티브 앱 사용성을 우선한다.
- OAuth provider 노출 순서는 user-web과 동일하게 유지한다.
- provider 순서를 iOS/Android 플랫폼별로 다르게 두지 않는다.

## 9. 약관과 정책 링크

- 약관, 개인정보처리방침, 정책 문서 링크는 OS 기본 브라우저로 연다.
- 정책 문서를 앱 내부 WebView로 감싸지 않는다.
- 정책 문서 URL은 하드코딩하지 않고 환경 설정 또는 공통 상수에서 관리한다.
- 링크 열기 실패 시 사용자에게 짧은 오류 메시지를 표시한다.

## 10. 시간과 Timezone

시간과 timezone 처리는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

- Backend가 내려주는 `createdAt`, `updatedAt`, 일정 `startAt`, `endAt` 같은 instant는 UTC ISO string으로 본다.
- 화면에는 UTC string을 그대로 출력하지 않고 사용자 timezone 기준으로 변환해 표시한다.
- 날짜만 필요한 `YYYY-MM-DD` 값은 timezone 변환 없이 표시한다.
- 일정 생성/수정에서 사용자가 입력한 local date-time을 임의로 `toISOString()` 변환해 보내지 않는다.

## 11. 접근성

- 터치 target은 손가락 조작이 가능한 크기로 둔다.
- 버튼은 명확한 label 또는 접근성 label을 가진다.
- 입력 컴포넌트는 label, placeholder, error message 연결을 갖는다.
- 색상만으로 상태를 구분하지 않는다.
- screen reader에서 의미가 없는 장식 요소는 접근성 트리에서 제외한다.

## 12. 금지 사항

- screen component에서 직접 `fetch`를 호출하지 않는다.
- 모바일 앱에서 `/admin/api/*`를 호출하지 않는다.
- Supabase SDK를 business feature에서 직접 import하지 않는다.
- refresh token, OAuth token, provider credential을 일반 저장소에 저장하지 않는다.
- `AsyncStorage`에 token 원문을 저장하지 않는다.
- 긴 NativeWind class 조합을 화면마다 반복하지 않는다.
- WebView로 OAuth provider 로그인 화면을 열지 않는다.

## 13. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/NAVIGATION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
