# G01 QA Env And Doc Closeout

상태: Ready
우선순위: P0
담당 영역: Common, FE/user-web

## 1. 목표

완료된 UX/UI 공통 QA 문서 상태를 정리하고, `FE/user-web` 기본 Playwright e2e가 실행 가능한 환경을 만든다.

## 2. 먼저 읽을 문서

- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/README.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/GOAL-SPECS/G06-UX-WRITING-STATES-A11Y-CLOSEOUT.goal.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `FE/user-web/playwright.config.ts`
- `FE/user-web/package.json`

## 3. 포함 범위

- `TODO/README.md`의 현재 활성 계획 상태 갱신
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`의 stale 상태 문구 정리
- `FE/user-web` Playwright browser binary 설치 또는 설치 불가 사유 기록
- 기본 e2e smoke 재실행
- `COMMON/QA-RESULTS.md`, `COMMON/ISSUE-LOG.md` 갱신

## 4. 제외 범위

- 모바일 390px/360px QA 실행
- Chrome/Edge 호환 QA 실행
- 새 e2e spec 대량 추가
- BE/API/DB 코드 변경
- S3/S4 polish 수정

## 5. 실행 절차

1. `TODO/README.md`에서 `USER_WEB_UXUI_COMMON_QA_PLAN`이 활성 계획으로 남아 있으면 완료 계획으로 정리하고, 이 계획을 현재 활성 계획으로 추가한다.
2. `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`가 `상태: Done`인지 확인하고, 아니면 `Done`으로 바꾼다.
3. 같은 README가 `G01~G06 완료`와 이 follow-up 계획을 안내하는지 확인하고, 아니면 고친다.
4. `FE/user-web`에서 Playwright browser 설치 상태를 확인한다.
5. 기본 Chromium binary가 없으면 아래 명령으로 설치한다.

```powershell
cd FE/user-web
pnpm exec playwright install chromium
```

6. 아래 검증 명령을 실행한다.

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

7. `git diff --check`를 실행한다.
8. 결과를 `COMMON/QA-RESULTS.md`에 기록한다.
9. `RQA-001`, `RQA-006`의 상태를 `Fixed`, `Blocked`, `Deferred` 중 하나로 갱신한다.

## 6. 완료 기준

- 완료된 UX/UI 공통 QA 문서가 더 이상 현재 활성 작업처럼 보이지 않는다.
- `TODO/README.md`가 이 계획을 현재 활성 계획으로 안내한다.
- Playwright 기본 e2e 실행 결과가 기록되어 있다.
- `pnpm run test:e2e`가 통과하거나, 실패가 browser 설치/환경 문제와 product assertion 실패 중 하나로 분류되어 있다.
- `git diff --check`가 통과한다.

## 7. 완료 후 검토

- G01에서 모바일/브라우저 QA 범위까지 구현하지 않았는지 확인한다.
- 문서 경로가 실제 존재하는지 `rg --files TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`으로 확인한다.
- `COMMON/GOAL-WORK-ORDER.md`의 다음 goal이 G02인지 확인한다.
