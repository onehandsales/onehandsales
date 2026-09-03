# Mobile Convention 문서

## 1. 목적

이 폴더는 `FE/mobile-app` 개발 시 지켜야 하는 코드 작성, 스타일, 인증 저장소, API client, 주석/로깅 규칙을 관리한다.

## 2. 현재 문서

- `MOBILE_APP.md`
- `AUTH_AND_STORAGE.md`
- `COMMENT_AND_LOGGING.md`

## 3. 적용 원칙

- 모바일 문서는 한국어로 작성한다.
- 모바일 구현은 React Native/Expo 기준으로 판단한다.
- React Web, DOM, browser, CSS 전제를 그대로 가져오지 않는다.
- user-web은 auth UX reference로 사용할 수 있지만, 코드는 React Native + NativeWind로 재구현한다.
- 시간과 timezone 처리는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
