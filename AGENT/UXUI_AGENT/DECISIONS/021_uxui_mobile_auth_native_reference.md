# UX/UI Mobile Auth Native Reference Decision

Date: 2026-09-03

## 1. 결정

네이티브 모바일 앱의 1차 UX 범위는 로그인/회원가입, 인증 복구, 최소 홈, 로그아웃이다.

로그인/회원가입 화면은 User Web의 브라우저 모바일 인증 화면을 기준으로 삼되, React Native 화면으로 다시 구현한다. WebView로 User Web 인증 화면을 감싸거나 pixel-level로 복제하지 않는다.

## 2. 이유

현재 User Web에는 로그인/회원가입 전까지의 브라우저 모바일 화면이 이미 있다. 이 화면의 정보 구조, provider 순서, 문구 톤을 재사용하면 사용자 경험의 일관성을 유지할 수 있다.

하지만 네이티브 앱은 OAuth 복귀, 보안 저장소, 앱 시작 복구, OS 브라우저 전환 같은 모바일 고유 흐름이 있다. 따라서 화면 감각은 맞추되 구현과 상태 흐름은 모바일 앱 기준으로 설계한다.

## 3. 1차 화면 기준

모바일 앱 1차 화면:

- 앱 시작 중 세션 확인 화면
- 로그인/회원가입 provider 선택 화면
- OAuth 진행 상태
- 인증 실패 상태
- 최소 `HomeScreen`
- 로그아웃 처리 상태

최소 `HomeScreen`은 `/api/me` 결과 확인 UI다. 사용자 이름, 이메일, 인증 상태, 현재 모바일 기기 정보, 로그아웃 액션만 보여준다.

## 4. Auth UX 규칙

- provider 노출 순서는 User Web과 같은 Google, LINE, Apple이다.
- OAuth는 Expo AuthSession 또는 시스템 브라우저를 사용한다.
- OAuth, 약관, 개인정보처리방침, 보안 문서 링크는 앱 내부 WebView로 열지 않고 OS 브라우저로 연다.
- 인증 복구가 끝나기 전에는 보호 화면을 먼저 보여주지 않는다.
- 세션 만료, refresh 실패, provider 실패 문구는 User Web의 UX Writing 기준과 맞춘다.
- 에러는 원인을 길게 설명하기보다 사용자가 할 수 있는 다음 행동을 짧게 보여준다.

## 5. 현재 제외

- 모바일 CRM 홈
- 회사, 담당자, 제품, 딜, 일정, 회의록 목록/상세/생성
- 명함 촬영/OCR
- push permission UX
- native contacts/calendar 연동
- offline-first draft
- biometric unlock

위 항목은 후속 모바일 제품 범위가 열릴 때 별도 결정으로 다룬다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/NAVIGATION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/DECISIONS/004_mobile_navigation_and_auth_ux.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
