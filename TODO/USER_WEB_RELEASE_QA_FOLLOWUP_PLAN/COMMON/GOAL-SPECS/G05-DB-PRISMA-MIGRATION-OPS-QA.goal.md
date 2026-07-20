# G05 DB Prisma Migration Ops QA

상태: Ready
우선순위: P0
담당 영역: BE, DB

## 1. 목표

운영 전 관점에서 Prisma generate, migration status, seed 실행 기준, 로컬 DB 상태를 정리한다.

## 2. 먼저 읽을 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/BE-TODO/DB-SCHEMA.md`

## 3. 포함 범위

- Node, pnpm, Docker 실행 가능 여부 확인
- `BE/.env` 존재 여부 확인
- 실제 비밀값 기록 금지
- DB 대상이 로컬 dev DB인지 공유/운영성 DB인지 분류
- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm exec prisma migrate status`
- seed 실행 가능 여부 판단
- Prisma generate DLL lock 원인 재현 여부 기록

## 4. 제외 범위

- 적용된 migration 파일 수정
- 공유/운영성 DB에 대한 무단 `migrate dev`
- 공유/운영성 DB에 대한 무단 seed
- schema 변경
- ImportJob table, Notification table, Admin audit table 추가

## 5. 실행 절차

1. 아래 환경 명령을 실행한다.

```powershell
node -v
pnpm -v
docker --version
```

2. `BE/.env` 존재 여부를 확인한다. 값은 출력하거나 문서에 복사하지 않는다.
3. DB URL의 host 성격만 분류한다. 전체 URL은 기록하지 않는다.
4. 로컬 dev DB로 확인되면 아래 명령을 실행한다.

```powershell
cd BE
pnpm db:dev:up
pnpm prisma:validate
pnpm prisma:generate
pnpm exec prisma migrate status
```

5. 공유 DB 또는 운영성 DB로 보이면 `prisma:migrate`, `prisma:seed`를 실행하지 않는다.
6. Prisma generate가 DLL lock으로 실패하면 실행 중인 BE dev server 또는 `node dist/main.js` 프로세스가 Prisma query engine을 잡고 있는지 확인한다. 사용자 작업으로 보이는 프로세스는 임의 종료하지 않는다.
7. 결과를 `COMMON/QA-RESULTS.md`에 기록한다.
8. `RQA-005` 상태를 갱신한다.

## 6. 완료 기준

- DB 대상 분류가 기록되어 있다.
- Prisma validate/generate/migrate status 결과가 기록되어 있다.
- migration 기록 불일치가 있으면 심각도와 다음 조치가 `ISSUE-LOG.md`에 있다.
- seed를 실행하지 않았다면 이유가 기록되어 있다.
- 적용된 migration 파일을 수정하지 않았다.

## 7. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
git diff --check
```

