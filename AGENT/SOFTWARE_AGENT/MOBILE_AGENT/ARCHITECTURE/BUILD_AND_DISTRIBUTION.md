# Mobile Build And Distribution Architecture

## 1. 현재 기준

모바일 앱은 Expo 기반으로 작성한다.

현재 단계에서는 App Store, Play Store 정식 배포 정책을 확정하지 않는다. 1차 목표는 로컬 개발 환경과 인증/세션 구조 검증이다.

## 2. 환경 구분

초기 환경은 다음 두 단계만 문서화한다.

- `local`
- `production`

`staging`은 MVP/초기 모바일 범위에서 필수로 두지 않는다. 별도 QA 운영이 필요해질 때 PM/Backend/UXUI 문서와 함께 결정한다.

## 3. Public Config 원칙

모바일 앱에는 앱 바이너리 또는 클라이언트 번들에 노출되어도 되는 public config만 둔다.

모바일 앱에 둘 수 없는 값:

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`
- `APP_REFRESH_TOKEN_SECRET`
- 서버 전용 provider secret
- DB 접속 정보

API base URL, Supabase public URL/anon key처럼 클라이언트 노출이 가능한 값만 환경 설정으로 둔다.

## 4. 후속 결정 필요

다음 항목은 1차 문서화 범위 밖이며, 실제 배포 준비 시 별도 결정한다.

- Expo EAS Build 사용 범위
- iOS bundle identifier
- Android package name
- App Store Connect 계정 정책
- Google Play Console 계정 정책
- TestFlight/internal testing 배포 정책
- production deep link scheme, universal link, app link
- push notification 인증서/키 관리

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/TESTING.md`
