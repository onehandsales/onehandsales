# G06 S0 S1 S2 Bugfix Closeout

상태: Done
우선순위: P0
담당 영역: FE, BE

## 1. 목표

G02~G05에서 발견된 S0/S1/S2 이슈를 출시 전 품질 기준으로 수정하거나 명시적으로 보류 판단한다.

## 1A. 확정 결정

- `ISSUE-LOG.md`에 Open S0/S1/S2가 하나라도 있으면 G06은 완료할 수 없다.
- 예외는 `Blocked`뿐이며, 해소 조건과 사용자 결정 필요 여부가 문서화되어야 한다.
- API/DB 변경이 필요한 bug는 구현 전에 `COMMON/API-SPEC` 또는 `BE-TODO/DB-SCHEMA.md`를 먼저 갱신한다.
- S0/S1은 이슈별 작업 단위로 쪼갠다.
- S2는 관련 범위별 묶음으로 처리할 수 있다.
- 새 사용자-facing 기능 추가는 금지한다.

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
- API response 변경이 필요하다고 판정되면 구현 전에 `COMMON/API-SPEC`에 계약을 추가하고 상태를 `confirmed`로 만든다.
- DB schema 변경이 필요하다고 판정되면 구현 전에 `BE-TODO/DB-SCHEMA.md`와 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*` 영향 범위를 먼저 기록한다.
- S0/S1/S2가 실제 bug가 아니라 환경 `Blocked`이면 `Blocked` 이유와 해소 조건을 적는다.

## 5A. 실행 절차

1. G02~G05가 `Done`, `Blocked`, 또는 명시적 보류 상태인지 확인한다.
2. `COMMON/ISSUE-LOG.md`에서 Open S0/S1/S2만 뽑아 closeout 대상 목록을 만든다.
3. 대상 이슈마다 아래 필드를 채운다.
   - 이슈 ID
   - severity
   - 재현 route 또는 endpoint
   - 기대 결과
   - 실제 결과
   - 수정 영역: FE / BE / DB / API / 문서
   - 수정 파일 후보
   - 필수 검증 명령
4. S0/S1은 한 이슈씩 처리한다. 여러 이슈를 한 번에 묶지 않는다.
5. S2는 같은 route, 같은 component, 같은 endpoint, 같은 schema에 묶인 경우에만 한 작업 단위로 묶는다.
6. API 변경이 필요하면 `COMMON/API-SPEC`을 먼저 갱신한다.
7. DB 변경이 필요하면 `BE-TODO/DB-SCHEMA.md`를 먼저 갱신하고 migration 필요 여부를 명시한다.
8. 수정 후 재현 절차를 다시 실행한다.
9. `ISSUE-LOG.md`의 해당 이슈를 `Fixed`, `Blocked`, `Deferred`, `N/A` 중 하나로 갱신한다.
10. `QA-RESULTS.md`에 검증 명령과 결과를 기록한다.
11. `TODO_LOG/YYYY-MM-DD/G06_*`에 작업 로그를 남긴다.

## 5B. severity별 처리 규칙

| severity | 처리 규칙 | 완료 가능 조건 |
|---|---|---|
| S0 Blocker | 즉시 단독 수정 | Fixed 또는 사용자 승인 Blocked |
| S1 Critical | 이슈별 단독 수정 | Fixed 또는 출시 판단 가능한 Blocked |
| S2 Major | 관련 범위별 묶음 수정 가능 | Fixed 또는 해소 조건 있는 Blocked |
| S3 Minor | 이번 goal 필수 처리 아님 | G07 또는 별도 backlog로 분리 |
| S4 Polish | 이번 goal 필수 처리 아님 | G07 또는 별도 backlog로 분리 |

## 5C. Blocked 기록 형식

Blocked 처리 시 `ISSUE-LOG.md`에 아래를 반드시 적는다.

- 왜 지금 확인 또는 수정할 수 없는가
- 필요한 환경, 계정, 브라우저, DB, 외부 provider 조건
- 사용자 결정이 필요한가
- 해소되면 실행할 명령 또는 재현 절차
- 출시 차단 여부

## 5D. 완료 전 grep

G06 완료 전 아래 검색으로 남은 Open S0/S1/S2를 확인한다.

```powershell
rg -n "상태: Open|심각도: S0|심각도: S1|심각도: S2" TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/ISSUE-LOG.md
```

검색 결과가 남아 있으면 각 항목이 `Fixed`, `Blocked`, `Deferred`, `N/A`로 정리됐는지 수동 확인한다.

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
- API/DB 변경이 있었다면 선행 문서 갱신 기록이 있다.
- S0/S1은 이슈별로, S2는 관련 범위별로 작업 단위가 분리되어 있다.
