# MOBILE_AGENT

## 1. 목적

`MOBILE_AGENT`는 OneHand Sales 모바일 앱의 구현 방향과 지켜야 할 규칙을 관리하는 문서 영역이다.

현재 모바일 앱의 1차 목표는 전체 CRM 기능 구현이 아니라, 사용자가 앱을 실행한 뒤 로그인 또는 회원가입을 완료하고 Backend 앱 세션을 얻는 흐름까지 검증하는 것이다.

## 2. 현재 확정 기준

- 모바일 앱은 React Native 기반으로 작성한다.
- 모바일 앱 코드는 `FE/mobile-app`을 기준 위치로 둔다.
- 모바일 1차 범위는 앱 실행, 로그인/회원가입, Backend token exchange, `/api/me` 확인, 로그인 완료 화면까지다.
- Supabase는 현재 단계에서 OAuth 로그인을 위한 외부 Auth provider로만 사용한다.
- 모바일 앱은 Supabase PostgreSQL에 직접 접근하지 않는다.
- 모바일 앱은 Supabase Storage에 직접 접근하지 않는다.
- 모바일 앱의 정식 세션 기준은 Supabase session이 아니라 Backend가 발급한 OneHand app access token이다.
- 모바일 앱은 User Web과 동일하게 Backend User API인 `/api/*`만 호출한다.
- Admin API인 `/admin/api/*`는 모바일 앱에서 호출하지 않는다.

## 3. 1차 인증 흐름

```text
Mobile App
  -> external OAuth login
  -> external auth access token 획득
  -> Backend POST /api/auth/exchange
  -> OneHand app access token 발급
  -> Backend GET /api/me
  -> 로그인 완료 화면
```

현재 external OAuth login 구현은 Supabase Auth를 사용할 수 있다. 다만 문서와 신규 코드에서는 Supabase를 영구 인프라로 전제하지 않고, 교체 가능한 external auth provider로 취급한다.

## 4. 우선 확인 문서

1. `DECISIONS/001_mobile_login_first_scope.md`
2. `CONVENTION/MOBILE_APP.md`
3. `ENGINEERING_REVIEW_CHECKLIST.md`
4. `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
5. `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
6. `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`

## 5. 지금 만들지 않는 범위

- 모바일 CRM 전체 화면
- 회사, 담당자, 상품, 딜, 일정, 회의록, 명함 OCR 전체 기능
- native push
- native contacts/calendar 연동
- offline-first local draft
- App Store, Play Store 배포 정책
- 모바일 상세 아키텍처 구조도
- Supabase 독립 전환 작업

위 항목은 후속 문서에서 별도로 결정한다.

