# MOBILE_AGENT

## 1. 목적

`MOBILE_AGENT`는 OneHand Sales 모바일 앱의 아키텍처, 코드 규칙, 인증/세션 정책, 테스트 기준, 기술 의사결정을 관리하는 독립 문서 영역이다.

모바일 앱은 `FRONT_AGENT`의 하위 오버라이드가 아니다. React Native가 React와 같은 사고방식을 공유하더라도 런타임, 라우팅, 저장소, OAuth 복귀, 보안 저장소, 배포 방식이 다르므로 모바일 전용 기준을 이 문서 영역에 독립적으로 둔다.

## 2. 현재 확정 기준

- 모바일 앱은 Expo 기반 React Native로 작성한다.
- 모바일 앱 코드는 `FE/mobile-app`을 기준 위치로 둔다.
- 현재 `FE/mobile-app`은 원하는 구조가 아니므로, 문서 확정 이후 재생성할 수 있다. 단, 필요한 이미지/로고 asset은 선별 보존할 수 있다.
- 모바일 1차 범위는 앱 실행, 로그인/회원가입, Backend 모바일 인증 세션 교환, 앱 시작 시 세션 복구, `/api/me` 확인, 최소 `HomeScreen`, 로그아웃까지다.
- CRM 전체 화면은 1차 범위에 포함하지 않는다.
- 모바일의 공식 인증 세션은 Supabase session이 아니라 Backend `AuthSession`이다.
- Supabase는 현재 빠른 OAuth 구현을 위한 외부 인증 어댑터로만 취급한다. 향후 Supabase에서 독립할 수 있어야 한다.
- 모바일 앱은 Backend User API인 `/api/*`만 호출한다.
- 모바일 앱은 Admin API인 `/admin/api/*`를 호출하지 않는다.

## 3. 문서 구조

```text
MOBILE_AGENT/
  README.md
  ENGINEERING_REVIEW_CHECKLIST.md
  ARCHITECTURE/
    README.md
    MOBILE_APP.md
    AUTH_SESSION.md
    NAVIGATION.md
    TESTING.md
    BUILD_AND_DISTRIBUTION.md
  CONVENTION/
    README.md
    MOBILE_APP.md
    AUTH_AND_STORAGE.md
    COMMENT_AND_LOGGING.md
  DECISIONS/
    README.md
    001_mobile_login_first_scope.md
    002_mobile_app_foundation.md
    003_mobile_auth_session_policy.md
    004_mobile_navigation_and_auth_ux.md
```

## 4. 우선 확인 문서

1. `DECISIONS/001_mobile_login_first_scope.md`
2. `DECISIONS/002_mobile_app_foundation.md`
3. `DECISIONS/003_mobile_auth_session_policy.md`
4. `DECISIONS/004_mobile_navigation_and_auth_ux.md`
5. `ARCHITECTURE/MOBILE_APP.md`
6. `ARCHITECTURE/AUTH_SESSION.md`
7. `CONVENTION/MOBILE_APP.md`
8. `CONVENTION/AUTH_AND_STORAGE.md`
9. `ENGINEERING_REVIEW_CHECKLIST.md`

## 5. 관련 Source Of Truth

- Backend 인증/세션 구현: `BE/src/modules/auth`
- Backend DB schema: `BE/prisma/schema.prisma`
- 인증 DB 문서: `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- Backend API 규칙: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- User Web auth UX 기준: `FE/user-web/src/features/auth`
- User Web 모바일 auth 화면 UX reference: `FE/user-web`
- Frontend 공통 방향 참고: `AGENT/SOFTWARE_AGENT/FRONT_AGENT`
- UX/UI 방향: `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 6. 1차 인증 흐름

```text
Mobile App
  -> Expo AuthSession 또는 시스템 브라우저로 OAuth login
  -> external OAuth access token 획득
  -> Backend POST /api/auth/mobile/exchange
  -> OneHand app access token + mobileRefreshToken 발급
  -> mobileRefreshToken은 secure storage 저장
  -> OneHand app access token으로 GET /api/me
  -> 최소 HomeScreen 표시
```

앱 재시작 시에는 secure storage의 `onehand.mobile.auth.mobileRefreshToken`을 읽어 `POST /api/auth/mobile/refresh`를 먼저 호출한다. refresh 성공 시 새 access token과 새 `mobileRefreshToken`을 반영하고, 실패 시 secure storage의 refresh token을 삭제한 뒤 signedOut 상태로 전환한다.

## 7. 지금 만들지 않는 범위

- 모바일 CRM 전체 화면
- 회사, 담당자, 제품, 딜, 일정, 회의록, 명함 OCR 전체 기능
- native push notification 정책
- native contacts/calendar 연동
- offline-first local draft 정책
- biometric unlock 정책
- App Store, Play Store 정식 배포 정책
- Supabase 독립 전환 구현

위 항목은 후속 문서에서 별도로 결정한다.
