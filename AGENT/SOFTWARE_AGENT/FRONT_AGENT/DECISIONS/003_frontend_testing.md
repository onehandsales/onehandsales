# Frontend 테스트 결정

## 1. 결정

MVP 테스트 자동화는 User Web과 Admin Web을 모두 포함한다.

- User Web: `FE/user-web`에서 Playwright E2E 관리
- Admin Web: `FE/admin-web`에서 Playwright E2E 관리

공용 테스트 패키지는 만들지 않는다.

## 2. 이유

User Web과 Admin Web은 별도 앱이며 package/workspace를 공유하지 않는다.

따라서 테스트 의존성, Playwright 설정, test script도 각 앱 내부에서 관리한다.

## 3. CI 실행 타이밍

- PR마다 User Web/Admin Web 핵심 smoke E2E만 실행한다.
- `main` merge 후 User Web/Admin Web 전체 E2E를 실행한다.
- 배포 직전 User Web/Admin Web 전체 E2E를 한 번 더 실행한다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
