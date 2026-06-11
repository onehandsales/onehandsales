# Frontend 배포 환경 결정

## 1. 결정

MVP Frontend 배포 환경은 두 단계만 사용한다.

- `local`
- `production`

`staging` 환경은 MVP에서 제외한다.

## 2. 운영 원칙

- User Web과 Admin Web은 Vercel에서 별도 프로젝트로 배포한다.
- User Web project root는 `FE/user-web`이다.
- Admin Web project root는 `FE/admin-web`이다.
- production 배포 전에는 User Web/Admin Web 전체 E2E를 다시 실행한다.
- 배포 전 전체 E2E가 실패하면 배포하지 않는다.

## 3. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
