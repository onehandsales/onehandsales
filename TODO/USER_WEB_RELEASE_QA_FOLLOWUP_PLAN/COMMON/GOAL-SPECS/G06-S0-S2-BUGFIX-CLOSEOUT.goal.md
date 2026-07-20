# G06 S0 S1 S2 Bugfix Closeout

상태: Ready
우선순위: P0
담당 영역: FE, BE

## 1. 목표

G02~G05에서 발견된 S0/S1/S2 이슈를 출시 전 품질 기준으로 수정하거나 명시적으로 보류 판단한다.

## 2. 먼저 읽을 문서

- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/ISSUE-LOG.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/QA-RESULTS.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/API-SPEC/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`

## 3. 포함 범위

- Open S0/S1/S2 issue 수정
- 모바일/브라우저 QA blocker 수정
- 데이터 격리 S1 후보 수정
- Prisma/migration 운영 S1/S2 후보 정리
- 관련 자동 테스트 보강
- `ISSUE-LOG.md`, `QA-RESULTS.md` closeout

## 4. 제외 범위

- S3/S4 polish 전체 처리
- Notification, ImportJob persistence, Admin 운영 API 같은 새 기능 구현
- G07에서 분리할 API 후보 구현
- 결제/구독, 글로벌 세금, 전체 다국어화

## 5. 수정 기준

- FE 수정은 `FE/user-web` feature 구조, TanStack Query, React Hook Form + Zod, `src/lib/api-client.ts` 기준을 따른다.
- BE 수정은 domain/application/infrastructure/presentation 계층을 지킨다.
- API response 변경이 필요하다고 판정되면 구현 전에 `COMMON/API-SPEC`에 계약을 추가한다.
- DB schema 변경이 필요하다고 판정되면 `BE-TODO/DB-SCHEMA.md`와 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*` 영향 범위를 먼저 기록한다.
- S0/S1/S2가 실제 bug가 아니라 환경 `Blocked`이면 `Blocked` 이유와 해소 조건을 적는다.

## 6. 검증 명령

Frontend 수정이 있으면:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Backend 수정이 있으면:

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

공통:

```powershell
git diff --check
```

## 7. 완료 기준

- `ISSUE-LOG.md`에 Open S0/S1/S2가 없다.
- 수정된 S0/S1/S2는 재현 절차와 검증 결과가 함께 `Fixed`로 기록되어 있다.
- 보류된 S0/S1/S2는 출시 판단 가능한 이유와 사용자 결정 필요 여부가 기록되어 있다.
- S3/S4는 G07 또는 별도 backlog로 분리되어 있다.
- 완료 보고에 남은 리스크가 있다.
