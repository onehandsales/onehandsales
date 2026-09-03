# Mobile Architecture 문서

## 1. 목적

이 폴더는 `FE/mobile-app`의 React Native/Expo 앱 구조, 인증/세션 흐름, navigation, 테스트, 빌드/배포 기준을 관리한다.

## 2. 현재 문서

- `MOBILE_APP.md`
- `AUTH_SESSION.md`
- `NAVIGATION.md`
- `TESTING.md`
- `BUILD_AND_DISTRIBUTION.md`

## 3. 기본 원칙

- 모바일 앱은 Expo 기반 React Native 앱으로 작성한다.
- `src/app`은 Expo Router route entry와 layout만 담당한다.
- 실제 화면 구현, API 호출, hook, schema, type, business UI는 `src/features/<domain>`에 둔다.
- Backend User API인 `/api/*`만 호출한다.
- Admin API인 `/admin/api/*`는 호출하지 않는다.
- Supabase는 인증 어댑터 경계 밖으로 퍼뜨리지 않는다.
- 모바일 앱은 DB, Prisma, Supabase Storage에 직접 접근하지 않는다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
