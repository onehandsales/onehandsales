# G36 MVP Starter 통합 점검 작업 로그

## 목표

- 새 개발자가 문서만 보고 MVP starter local 실행을 재현할 수 있게 한다.
- README, `.env.example`, FE/BE 실행 명령, DB migration/seed, E2E, external provider env, 남은 보류 항목을 최신화한다.

## 참고 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P6-G33-G36-TEST-RELEASE.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`

## 구현 내용

- 루트/FE/BE/User Web/Admin Web README의 local 실행, 검증, E2E 명령을 최신화한다.
- Backend Prisma migration/seed 스크립트를 명시한다.
- `.env.example`에서 실제 코드가 사용하는 provider/env 변수를 점검한다.
- `COMMON/PLANNING-REVIEW.md`에 G36 기준 남은 보류 항목을 정리한다.

## 검토 메모

- Prisma CLI는 `.env`가 없으면 `DIRECT_URL`을 읽지 못하므로 README에 `cp .env.example .env` 순서를 명시했다.
- 로컬 검증에서는 `.env` 파일을 만들지 않고 `DATABASE_URL`, `DIRECT_URL`을 inline 주입해 `prisma:validate`를 확인했다.
- 기본 Playwright smoke는 실 Provider를 호출하지 않고 route mock을 사용한다.

## 검증 결과

- `cd BE && pnpm run typecheck` 통과
- `cd BE && pnpm run lint` 통과
- `cd BE && DATABASE_URL=... DIRECT_URL=... pnpm run prisma:validate` 통과
- `cd BE && pnpm test` 통과
- `cd BE && pnpm run build` 통과
- `cd FE/user-web && pnpm run test:e2e` 통과
- `cd FE/admin-web && pnpm run test:e2e` 통과
- `cd FE/admin-web && pnpm run lint` 통과
