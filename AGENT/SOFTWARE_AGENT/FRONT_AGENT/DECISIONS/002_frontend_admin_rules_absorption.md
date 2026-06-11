# Frontend/Admin 규칙 흡수 결정

## 1. 결정

기존 User Web과 Admin Web 관련 규칙은 `AGENT/SOFTWARE_AGENT/FRONT_AGENT` 아래로 흡수한다.

Frontend 정본 문서 위치:

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

## 2. 이유

User Web과 Admin Web은 같은 Frontend 기술 기반을 공유하지만 Backend와는 구현 책임이 다르다.

Frontend는 화면, route, 상태 관리, API client, form validation, E2E, Vercel 배포 기준을 다룬다. 이 기준은 Backend의 controller/use case/repository/transaction 기준과 섞지 않는다.

## 3. 적용 범위

- `FE/user-web`
- `FE/admin-web`
- User Web E2E
- Admin Web E2E
- Frontend 배포

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
