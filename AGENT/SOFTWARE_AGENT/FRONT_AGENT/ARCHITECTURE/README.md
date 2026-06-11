# Front Architecture 문서

## 1. 목적

이 폴더는 User Web과 Admin Web의 Frontend 구현 구조 정본 문서를 관리한다.

## 2. 현재 문서

- `FRONTEND_USER_WEB.md`
- `ADMIN_WEB.md`
- `TESTING.md`
- `DEPLOYMENT.md`

## 3. 규칙

- User Web과 Admin Web은 별도 앱이다.
- User Web은 `FE/user-web`을 기준으로 한다.
- Admin Web은 `FE/admin-web`을 기준으로 한다.
- 두 앱은 패키지와 내부 feature 코드를 공유하지 않는다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
