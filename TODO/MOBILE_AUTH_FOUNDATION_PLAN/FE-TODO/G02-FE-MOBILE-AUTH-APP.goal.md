# /goal G02-FE-MOBILE-AUTH-APP

## 1. Goal

`FE/mobile-app`을 Expo React Native 모바일 인증 foundation으로 구현한다.

## 2. 선행 조건

- `COMMON/API-SPEC/MOBILE_AUTH_API.md`가 confirmed 상태다.
- 실제 API 연동 완료 판정은 `G01-BE-MOBILE-AUTH-API` 완료 후 한다.
- 구조 정리, NativeWind 설정, 공통 UI, mock 기반 auth flow는 G01과 병렬로 진행할 수 있다.

## 3. 먼저 읽을 문서

- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/README.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/SCOPE.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/PENDING-DECISIONS.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/USER-FLOW.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/API-SPEC/MOBILE_AUTH_API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/GOAL-SPECS/G02-FE-MOBILE-AUTH-APP.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/FE-TODO/MOBILE-APP-TODO.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/NAVIGATION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
- `AGENT/UXUI_AGENT/DECISIONS/021_uxui_mobile_auth_native_reference.md`

## 4. 작업 체크리스트

- [ ] 기존 `FE/mobile-app` 구조와 asset을 확인한다.
- [ ] `deviceSlot: "native_mobile"` 값을 exchange request에 반영한다.
- [ ] 필요한 로고/provider asset을 보존한다.
- [ ] 목표 구조와 맞지 않는 앱 구조는 재구성한다.
- [ ] Expo Router를 설정한다.
- [ ] `src/app/_layout.tsx`를 route layout으로 구성한다.
- [ ] `src/app/(public)/login.tsx` route entry를 만든다.
- [ ] `src/app/(app)/_layout.tsx` 보호 route layout을 만든다.
- [ ] `src/app/(app)/index.tsx` 최소 Home route entry를 만든다.
- [ ] NativeWind와 Tailwind config token을 설정한다.
- [ ] `Screen`, `AppText`, `AppButton`, `AppTextInput` 공통 UI를 만든다.
- [ ] API base URL public config를 만든다.
- [ ] `TokenProvider` 인터페이스를 만든다.
- [ ] 공통 API client가 `TokenProvider`로 access token을 읽도록 만든다.
- [ ] `POST /api/auth/mobile/exchange` client를 만든다.
- [ ] `POST /api/auth/mobile/refresh` client를 만든다.
- [ ] `POST /api/auth/mobile/logout` client를 만든다.
- [ ] `GET /api/me` client를 만든다.
- [ ] secure storage wrapper를 만든다.
- [ ] secure storage key를 `onehand.mobile.auth.mobileRefreshToken`으로 고정한다.
- [ ] auth store에서 access token, user, restore 상태를 관리한다.
- [ ] refresh token을 auth store, Zustand persist, AsyncStorage, React state에 저장하지 않는다.
- [ ] auth provider adapter를 만든다.
- [ ] Supabase SDK 사용이 필요하면 adapter 안에만 격리한다.
- [ ] OAuth를 Expo AuthSession 또는 OS 시스템 브라우저로 연다.
- [ ] 로그인/회원가입 화면을 User Web 브라우저 모바일 auth UX reference 기준으로 구현한다.
- [ ] provider 순서를 Google, LINE, Apple로 맞춘다.
- [ ] 앱 시작 시 session restore를 구현한다.
- [ ] restore 완료 전 보호 화면이 렌더링되지 않게 한다.
- [ ] exchange 성공 후 secure storage 저장, memory auth 반영, `/api/me` 확인을 구현한다.
- [ ] refresh 성공 후 secure storage overwrite를 구현한다.
- [ ] refresh 성공 후 response의 `device`를 현재 모바일 기기 정보로 반영한다.
- [ ] refresh 실패 후 secure storage 삭제와 signedOut 전환을 구현한다.
- [ ] 최소 `HomeScreen`을 구현한다.
- [ ] logout 성공/실패 후 로컬 token 삭제를 구현한다.
- [ ] typecheck/lint/local smoke를 실행한다.

## 5. Acceptance Criteria

- 앱 실행 시 인증 복구 상태가 먼저 판단된다.
- signedOut이면 로그인/회원가입 화면이 표시된다.
- provider 버튼은 Google, LINE, Apple 순서다.
- OAuth 화면은 WebView가 아니라 Expo AuthSession 또는 OS 시스템 브라우저로 열린다.
- exchange 성공 시 `mobileRefreshToken`이 secure storage에 저장된다.
- access token은 메모리에만 저장된다.
- refresh 성공 시 새 `mobileRefreshToken`으로 secure storage를 덮어쓴다.
- refresh 성공 시 현재 모바일 기기 정보가 HomeScreen에 표시된다.
- refresh 실패 시 secure storage token이 삭제된다.
- `/api/me` 성공 후 최소 `HomeScreen`이 표시된다.
- 최소 `HomeScreen`에는 사용자 이름, 이메일, 인증 상태, 모바일 기기 정보, 로그아웃 액션만 있다.
- logout 후 signedOut 상태로 이동한다.
- Mobile App 검증 명령이 통과한다.

## 6. 완료 기록

완료 후 아래 경로에 작업 로그를 작성한다.

```text
TODO_LOG/YYYY-MM-DD/G02_FE_MOBILE_AUTH_APP/WORK_LOG.md
```

기록 항목:

- 수정한 주요 파일
- 보존한 asset 목록
- 연결한 API 목록
- 실행한 검증 명령과 결과
- 실제 OAuth smoke 가능 여부
- 남은 이슈 또는 후속 작업
