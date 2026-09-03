# 027 Auth Session And Provider QA Policy

Date: 2026-07-09
Updated: 2026-09-03

## Decision

OneHand Sales의 현재 인증은 Supabase OAuth를 외부 identity provider로 사용하고, 실제 앱 사용자/기기/session은 Backend가 별도로 관리한다.

## Current Product State

- Google OAuth 신규 가입/로그인 QA는 통과했다.
- 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 Supabase OAuth authorize URL을 열고, popup이 차단되면 기존 full-page redirect로 fallback한다.
- 공개/인증 canonical URL은 locale prefix를 사용한다. 예: `/ko/login`, `/en-us/pricing`, `/en-ca/contact`.
- 기존 `/login`, `/signup` 등 legacy 공개/인증 URL은 선호 locale URL로 redirect한다.
- 로그아웃 후 이동 경로는 선호 locale의 login URL로 통일한다. 예: `/ko/login`, `/en-us/login`.
- 개발용 mock login flow는 User Web에서 제거했다.
- 현재 노출/허용 provider는 Google, LINE, Apple이다. Backend `/api/auth/providers`와 Supabase JWT exchange는 `google`, `line`, `apple`만 허용한다.
- Kakao OAuth는 제품 로그인 기능에서 제거했다. Prisma enum의 `KAKAO`는 과거 데이터 호환용 legacy 값으로만 남긴다.
- LINE/Apple 실제 provider smoke는 Supabase/provider 운영 설정과 secret이 필요하므로 G10 QA에서 결과 또는 미실행 사유를 남긴다.
- 네이티브 모바일 앱 1차 범위는 로그인/회원가입, 모바일 인증 세션 교환, 앱 시작 세션 복구, `/api/me` 확인, 최소 홈, 로그아웃이다.

## 08 Global Data I18N Result

- G08에서 provider 노출 순서를 Google, LINE, Apple로 확정했다. Kakao는 계속 legacy enum/과거 데이터 호환값으로만 남긴다.
- `/api/auth/providers`, Supabase JWT exchange, FE provider type/copy는 Google/LINE/Apple 기준으로 갱신됐다.

## Session Policy

- 가입과 로그인은 같은 OAuth exchange 흐름이다.
- 신규/기존 사용자 판정은 먼저 `provider + providerUserId`를 조회하고, 없으면 같은 verified email의 기존 `User`에 새 `UserOAuthAccount`를 연결한다.
- provider email이 없거나 verified email로 확인할 수 없으면 가입/로그인을 차단한다.
- App access token은 `userId`와 `sessionId`를 담는다.
- User Web refresh token 원문은 httpOnly cookie로만 내려가고 DB에는 hash만 저장한다.
- Mobile App refresh token 원문은 모바일 보안 저장소에만 저장하고 DB에는 hash만 저장한다.
- 같은 active device에서 다시 로그인하면 session row를 새로 만들지 않고 refresh token을 회전한다.
- 같은 slot의 다른 device가 로그인하면 기존 active device/session을 교체한다.
- 현재 User Web은 `mobile`, `personal_laptop` slot만 사용한다. `work_laptop`은 Backend에 남겨두되 현재 제품 UI에서는 사용하지 않는다.

## Mobile App Session Policy

- 모바일의 공식 인증 세션은 Supabase session이 아니라 Backend `AuthSession`이다.
- Supabase는 현재 OAuth access token을 얻기 위한 외부 인증 adapter로만 취급하며, 향후 교체 가능해야 한다.
- 모바일 인증 API는 웹 cookie 기반 API와 분리해 `/api/auth/mobile/exchange`, `/api/auth/mobile/refresh`, `/api/auth/mobile/logout`으로 설계한다.
- 모바일 앱은 exchange 요청에서 `deviceSlot: "native_mobile"`과 `replaceExistingDevice: true`를 사용한다. Backend Prisma enum은 `NATIVE_MOBILE`을 추가한다.
- 사용자당 활성 모바일 기기는 1대만 허용한다. 새 모바일 기기 로그인은 기존 활성 모바일 기기와 세션을 교체한다.
- 모바일 refresh token 응답 필드는 `mobileRefreshToken`으로 둔다.
- 모바일 refresh token은 AsyncStorage, Zustand persist, localStorage 유사 저장소, 일반 React state, 로그, analytics, crash report에 저장하지 않는다.
- access token은 짧은 수명으로 취급하고 메모리에만 둔다.
- 앱 시작 시 secure storage의 `mobileRefreshToken`으로 즉시 refresh를 호출하고, 복구가 끝나기 전에는 보호 화면을 렌더링하지 않는다.
- 모바일 API client는 `TokenProvider`를 통해 access token을 읽고, Zustand store, secure storage, Supabase client를 직접 import하지 않는다.

## Locale, Timezone, Country

- `preferredLocale`과 `timeZone`은 신규 사용자 생성 시 초기화한다.
- 기존 사용자의 `timeZone`은 로그인 시 브라우저 timezone으로 덮어쓰지 않는다.
- 최근 로그인 환경은 `lastLoginLocale`, `lastLoginTimeZone`에 기록한다.
- `signupCountryCode`, `lastLoginCountryCode`는 배포 프록시 geo header가 있을 때만 저장한다.
- 로컬 또는 geo header가 없는 배포 환경에서 국가가 `기록 없음`으로 보이는 것은 현재 정상 동작이다.
- 08 G02 목표에서는 사용자 기본 국가/통화 설정을 위해 `User.countryCode`, `User.defaultCurrencyCode`를 추가한다. 현재 signup/last-login country metadata와 구분한다.

## QA Next Step

인증 QA 이후의 다음 제품 QA는 로그인 후 CRM 핵심 플로우다.

모바일 앱 1차 QA는 CRM 핵심 플로우가 아니라 인증 foundation을 먼저 본다.

모바일 앱 1차 QA:

1. 앱 시작 시 세션 복구 대기 상태
2. Google/LINE/Apple provider 선택
3. Expo AuthSession 또는 시스템 브라우저 OAuth 시작
4. 모바일 exchange 성공과 `mobileRefreshToken` 저장
5. `/api/me` 확인
6. 앱 재시작 refresh 성공/실패
7. 로그아웃 시 Backend session revoke와 secure storage 삭제

User Web QA:

1. 회사 생성
2. 담당자 생성
3. 제품 생성
4. 딜 생성
5. 딜에 회사/담당자/제품 연결
6. Next Action 등록/완료 처리
7. 일정 생성과 딜 연결
8. 미팅노트 작성과 회사/담당자/딜 연결
9. 수정/삭제/휴지통 복구
