# FRONT_AGENT

## 1. 목적

`FRONT_AGENT`는 User Web과 Admin Web의 Frontend 구현 방향과 품질 기준을 책임지는 문서 영역이다.

User Web, Admin Web, 화면 상태 관리, API client 경계, 폼 검증, E2E, 프론트 배포 기준은 이 폴더를 기준으로 판단한다.

## 2. 관리 범위

- User Web 아키텍처
- Admin Web 아키텍처
- Frontend 코드 컨벤션
- Frontend 주석과 로깅 규칙
- User Web과 Admin Web의 API client 분리
- TanStack Query, React Hook Form, Zod 기준
- Playwright E2E 기준
- Vercel 배포 기준
- Frontend 기술 결정 기록

## 3. 폴더 구조

```text
FRONT_AGENT/
  README.md
  ENGINEERING_REVIEW_CHECKLIST.md
  ARCHITECTURE/
  CONVENTION/
  DECISIONS/
```

## 4. 우선 확인 문서

1. `ARCHITECTURE/FRONTEND_USER_WEB.md`
2. `ARCHITECTURE/ADMIN_WEB.md`
3. `ARCHITECTURE/TESTING.md`
4. `ARCHITECTURE/DEPLOYMENT.md`
5. `CONVENTION/FRONTEND_USER_WEB.md`
6. `CONVENTION/ADMIN_WEB.md`
7. `CONVENTION/COMMENT_AND_LOGGING.md`
8. `ENGINEERING_REVIEW_CHECKLIST.md`

## 5. 협업 원칙

- PM의 MVP 범위와 UXUI_AGENT의 화면 흐름을 먼저 확인한다.
- User Web과 Admin Web은 별도 앱으로 유지한다.
- User Web은 `/api/*`만 호출한다.
- Admin Web은 `/admin/api/*`만 호출한다.
- 서버 상태는 TanStack Query로 관리한다.
- 폼 검증은 React Hook Form과 Zod를 기준으로 한다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
