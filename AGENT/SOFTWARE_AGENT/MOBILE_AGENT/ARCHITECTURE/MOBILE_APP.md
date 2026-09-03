# Mobile App Architecture

## 1. 기술 기준

| 구분 | 기준 |
| --- | --- |
| 앱 프레임워크 | Expo |
| UI 런타임 | React Native |
| 언어 | TypeScript |
| 라우팅 | Expo Router |
| 스타일 | NativeWind + Tailwind config token |
| 서버 상태 | TanStack Query 사용 가능 |
| 폼/검증 | React Hook Form + Zod 사용 가능 |
| 전역 클라이언트 상태 | Zustand |
| 보안 저장소 | Keychain/Keystore 기반 secure storage. Expo 환경에서는 `expo-secure-store`를 우선 검토 |
| OAuth | Expo AuthSession 또는 시스템 브라우저 기반 |

## 2. 앱 구조

권장 구조는 다음과 같다.

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

## 3. 책임 분리

- `src/app`은 route entry와 layout만 담당한다.
- `src/app/**` 파일은 feature screen을 import해서 연결하는 역할만 한다.
- 실제 화면 구현은 `src/features/<domain>/screens`에 둔다.
- API 호출은 `src/features/<domain>/api` 또는 공통 `src/lib/api-client`를 통해 수행한다.
- 인증 제공자 연동은 `src/features/auth/adapters` 아래에 둔다.
- 인증 상태는 Zustand 기반 auth store에서 관리한다.
- refresh token은 Zustand store에 저장하지 않는다.
- 공통 UI는 `src/components/ui`, layout primitive는 `src/components/layout`에 둔다.

## 4. 1차 화면 범위

1차 모바일 앱은 다음 화면과 상태만 포함한다.

- 앱 시작 중 인증 복구 상태
- 로그인/회원가입 provider 선택 화면
- OAuth 진행 상태
- OAuth 실패 상태
- Backend 모바일 인증 exchange 실패 상태
- 로그인 완료 후 최소 `HomeScreen`
- 로그아웃 상태

`HomeScreen`은 `/api/me` 호출 결과를 확인할 수 있는 수준으로만 구현한다. 표시 범위는 사용자 이름, 이메일, 인증 상태, 현재 모바일 기기 정보, 로그아웃 액션으로 제한한다.

CRM 홈, 대시보드, 거래/회사/연락처 목록, 일정/회의록 요약은 1차 범위에 포함하지 않는다.

## 5. Supabase 독립 경계

현재 Supabase OAuth를 사용할 수 있지만, 모바일 앱의 business feature가 Supabase SDK를 직접 import하면 안 된다.

허용되는 경계:

- auth provider adapter
- OAuth callback/session 처리 helper
- Backend exchange 직전 외부 access token 확보 흐름

금지되는 사용:

- business API 호출에 Supabase access token 사용
- Supabase session을 앱의 공식 로그인 상태로 사용
- Supabase DB/Storage 직접 접근
- feature 화면에서 Supabase SDK 직접 import

## 6. 관련 문서

- `ARCHITECTURE/AUTH_SESSION.md`
- `ARCHITECTURE/NAVIGATION.md`
- `CONVENTION/MOBILE_APP.md`
- `CONVENTION/AUTH_AND_STORAGE.md`
- `DECISIONS/001_mobile_login_first_scope.md`
- `DECISIONS/002_mobile_app_foundation.md`
