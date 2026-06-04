# Software 아키텍처 문서

## 1. 목적

이 폴더는 Backend, User Web, Admin Web, 테스트, 배포 아키텍처의 정본 문서를 관리한다.

## 2. 현재 문서

- `OVERVIEW.md`
- `BACKEND.md`
- `FRONTEND_USER_WEB.md`
- `ADMIN_WEB.md`
- `TESTING.md`
- `DEPLOYMENT.md`

## 3. 규칙

- archive 문서가 이 폴더와 충돌하면 이 폴더를 우선한다.
- 모바일 아키텍처는 아직 정본이 아니다.
- User Web과 Admin Web은 별도 앱이다.
- Backend는 MVP에서 단일 NestJS 서버이며 `/api/*`, `/admin/api/*`로 API를 분리한다.
