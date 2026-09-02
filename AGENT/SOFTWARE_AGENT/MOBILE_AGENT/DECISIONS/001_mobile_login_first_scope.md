# 001 Mobile Login First Scope

Date: 2026-09-02

## 결정

모바일 앱은 React Native 기반으로 작성한다.

모바일 1차 구현 범위는 사용자가 앱을 실행하고 로그인 또는 회원가입을 완료한 뒤 Backend 앱 세션으로 `/api/me`를 확인하는 데까지로 제한한다.

## 인증 기준

- 현재 로그인 provider 구현은 User Web과 같은 Supabase OAuth 흐름을 사용할 수 있다.
- Supabase는 앱의 영구 세션 저장소가 아니라 교체 가능한 external auth provider로 취급한다.
- 모바일 앱은 Supabase access token을 Backend `POST /api/auth/exchange`에 전달하는 용도로만 사용한다.
- token exchange 이후 모바일 앱의 인증 기준은 Backend가 발급한 OneHand app access token이다.
- 모바일 앱은 Supabase access token을 business API 호출에 사용하지 않는다.

## DB 접근 기준

- 모바일 앱은 PostgreSQL에 직접 연결하지 않는다.
- 모바일 앱은 Prisma를 사용하지 않는다.
- 모바일 앱은 `DATABASE_URL`, `DIRECT_URL`, Supabase service role key 같은 서버 전용 값을 보유하지 않는다.
- 사용자 생성, OAuth 계정 연결, 기기 등록, 세션 생성은 Backend가 담당한다.

## Backend API 기준

모바일 앱은 User Web과 같은 Backend API 계약을 따른다.

```text
POST /api/auth/exchange
POST /api/auth/refresh
POST /api/auth/logout
GET /api/me
```

1차 구현에서 refresh 유지 방식은 최소화할 수 있다. 다만 로그인 유지 기능을 구현할 때는 모바일 OS 보안 저장소를 사용하고, 웹의 `localStorage` 전제를 가져오지 않는다.

## 후속 결정

- Expo 사용 여부
- iOS/Android 동시 지원 범위
- deep link scheme과 universal link/app link 정책
- 모바일 refresh token 전달 방식
- biometric unlock 사용 여부
- offline local draft 정책
- push notification 정책
- App Store, Play Store 배포 정책

