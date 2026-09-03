# 004 Mobile Navigation And Auth UX

Date: 2026-09-03

## 1. Navigation 결정

모바일 앱 navigation은 Expo Router를 기준으로 한다.

`src/app`은 route entry와 layout만 담당한다.

실제 화면 구현, API 호출, hook, schema, type, business UI는 `src/features/<domain>`에 둔다.

## 2. Route 그룹

1차 route 구조는 다음을 기준으로 한다.

```text
src/app/
  _layout.tsx
  (public)/
    login.tsx
  (app)/
    _layout.tsx
    index.tsx
```

공개 화면은 `src/app/(public)` 아래에 둔다.

로그인 이후 접근 가능한 보호 화면은 `src/app/(app)` 아래에 둔다.

## 3. Deep Link 기준

모든 주요 record 화면은 후속 CRM 확장 시 deep link 가능성을 고려해 route 구조를 설계한다.

단, CRM 화면은 1차 범위가 아니므로 route 파일을 미리 만들지 않는다.

## 4. Auth UX 결정

모바일 앱의 로그인/회원가입 UX는 user-web의 브라우저 모바일 로그인/회원가입 화면을 기준으로 한다.

화면 구성, 정보 우선순위, 문구 톤, OAuth provider 노출 순서, 약관/정책 안내, 에러 메시지는 user-web과 최대한 일치시킨다.

단, 구현은 React DOM 코드를 복사하지 않고 React Native + NativeWind 기반으로 재구현한다.

픽셀 단위 복제보다 네이티브 앱 사용성을 우선한다.

Safe Area, 터치 피드백, 키보드 회피, 앱 전환, OAuth redirect 복귀, 플랫폼별 상태바 처리는 모바일 앱 기준으로 설계한다.

## 5. OAuth Provider 순서

모바일 앱의 OAuth provider 노출 순서는 user-web의 로그인/회원가입 화면과 동일하게 유지한다.

provider 순서는 모바일 앱에서 임의로 재정렬하지 않는다.

iOS/Android 플랫폼별로 provider 순서를 다르게 두지 않는다.

provider 추가/제거/비활성화 정책은 Backend `GET /api/auth/providers` 응답과 user-web auth 정책을 기준으로 맞춘다.

## 6. 정책 링크

모바일 앱에서 약관, 개인정보처리방침, 정책 문서 링크는 OS 기본 브라우저로 연다.

정책 문서를 앱 내부 WebView로 감싸지 않는다.

정책 문서 URL은 하드코딩하지 않고 환경 설정 또는 공통 상수에서 관리한다.

링크 열기 실패 시 사용자에게 짧은 오류 메시지를 표시한다.

## 7. OAuth 실행 방식

모바일 앱의 OAuth 로그인은 Expo AuthSession 또는 시스템 브라우저 기반 흐름을 사용한다.

OAuth provider 로그인 화면을 앱 내부 WebView로 열지 않는다.

OAuth redirect 복귀 처리는 Expo/React Native 표준 deep link 흐름을 따른다.

## 8. Auth Error Copy

모바일 auth/API 에러 메시지는 user-web auth 에러 문구를 기준으로 통일한다.

동일한 인증 실패, 세션 만료, 네트워크 오류 상황에서는 웹과 모바일이 같은 의미의 문구를 사용한다.

단, 모바일 화면 폭이나 toast 표시 제약 때문에 문장이 너무 길면 의미를 유지한 채 짧게 줄일 수 있다.

에러 문구는 화면 컴포넌트에 직접 흩뿌리지 않고 auth feature 또는 공통 error mapper에서 관리한다.

## 9. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/NAVIGATION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/MOBILE_APP.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `FE/user-web/src/features/auth`
