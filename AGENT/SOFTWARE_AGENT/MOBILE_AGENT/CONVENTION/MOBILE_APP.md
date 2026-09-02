# Mobile App Convention

이 문서는 `FE/mobile-app` React Native 코드 작성 시 지켜야 하는 최소 규칙을 정의한다. 상세 아키텍처 문서는 후속으로 적립한다.

## 1. 기본 원칙

- 모바일 앱은 React Native 기반으로 작성한다.
- 모바일 앱은 Backend API client 중심으로 구현한다.
- 모바일 앱은 Supabase DB, Supabase Storage, PostgreSQL, Prisma에 직접 접근하지 않는다.
- 모바일 앱에서 서버 secret, DB URL, service role key를 사용하지 않는다.
- 모바일 앱에서 User API는 `/api/*`만 호출한다.
- 모바일 앱에서 Admin API인 `/admin/api/*`는 호출하지 않는다.

## 2. 인증

- 로그인/회원가입은 1차에서 User Web과 같은 provider 기준인 Google, LINE, Apple을 따른다.
- 현재 Supabase OAuth를 사용할 수 있지만 Supabase 의존 코드는 인증 경계에만 둔다.
- Supabase SDK를 사용하더라도 feature 전역에서 직접 import하지 않고 auth service 또는 auth adapter 안에 격리한다.
- Supabase access token은 Backend `POST /api/auth/exchange`에 전달하는 용도로만 사용한다.
- Backend exchange 이후 앱의 정식 인증 토큰은 OneHand app access token이다.
- business API 호출에는 OneHand app access token만 사용한다.
- 로그아웃은 Backend app session 폐기와 모바일 로컬 세션 정리를 함께 수행한다.

## 3. 토큰 저장

- token, provider credential, refresh token 원문은 로그에 남기지 않는다.
- token을 영구 저장해야 할 때는 Keychain/Keystore 기반 보안 저장소를 사용한다.
- React Native `AsyncStorage`에는 access token, refresh token, provider token을 저장하지 않는다.
- 웹의 `localStorage` 전제를 모바일 코드로 가져오지 않는다.
- refresh token 처리 방식은 Backend 계약 확인 후 별도 결정한다.

## 4. 환경 변수와 설정

- 모바일 앱에는 브라우저 또는 앱 바이너리에 노출되어도 되는 public config만 둔다.
- `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`은 모바일 앱에 둘 수 없다.
- 실제 환경 변수 값과 secret 값은 문서, 이슈, 로그, 테스트 fixture에 기록하지 않는다.
- 모바일 환경 변수 이름은 구현 시 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 함께 반영한다.

## 5. API 호출

- API 호출은 공통 API client를 통해 수행한다.
- 화면 컴포넌트에서 `fetch`를 직접 호출하지 않는다.
- API 요청/응답 타입은 명시적으로 선언한다.
- `any`는 사용하지 않는다.
- 서버 에러는 사용자에게 노출 가능한 메시지로 변환한다.

## 6. 1차 화면 범위

1차 모바일 화면은 다음만 포함한다.

- 앱 시작 화면
- 로그인/회원가입 provider 선택 화면
- OAuth 진행 상태
- callback 처리 상태
- 로그인 완료 화면
- 로그인 실패 상태

CRM 도메인 화면은 1차 범위에 포함하지 않는다.

