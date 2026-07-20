# Release QA Follow-up Goal Work Order

## 1. 목적

이 문서는 `USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`을 `/goal`로 실행할 때의 순서를 고정한다.

## 2. 실행 순서

| 순서 | Goal | 상태 | 선행 조건 |
|---:|---|---|---|
| 1 | `G01-QA-ENV-AND-DOC-CLOSEOUT` | Done | UX/UI 공통 QA G01~G06 완료 |
| 2 | `G02-MOBILE-BROWSER-390-360-QA` | Done | G01 완료 |
| 3 | `G03-CHROME-EDGE-COMPAT-QA` | Done | G02 완료 |
| 4 | `G04-MULTI-ACCOUNT-SECURITY-QA` | Done | G03 완료 |
| 5 | `G05-DB-PRISMA-MIGRATION-OPS-QA` | Done | G04 완료 |
| 6 | `G06-S0-S2-BUGFIX-CLOSEOUT` | Done | G02~G05의 ISSUE-LOG 최신화 |
| 7 | `G07-DEFERRED-BE-API-BACKLOG-SPLIT` | Done | G06 완료 |

## 3. G01. QA Env And Doc Closeout

문서: `COMMON/GOAL-SPECS/G01-QA-ENV-AND-DOC-CLOSEOUT.goal.md`

목적:

- UX/UI 공통 QA 완료 상태를 문서에 반영한다.
- Playwright 기본 e2e 실행 실패 원인인 browser binary 상태를 정리한다.

완료 기준:

- `TODO/README.md`가 현재 활성 계획을 이 계획으로 가리킨다.
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`가 `Done` 상태와 G01~G06 완료를 설명한다.
- `FE/user-web`에서 `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e` 결과가 기록된다.
- Playwright browser 설치 또는 `Blocked` 사유가 `QA-RESULTS.md`에 남는다.

## 4. G02. Mobile Browser 390/360 QA

문서: `COMMON/GOAL-SPECS/G02-MOBILE-BROWSER-390-360-QA.goal.md`

목적:

- 모바일 브라우저 Web 기준 390px/360px QA를 실행한다.
- 작은 화면에서 핵심 업무 흐름, navigation, form, dialog, overflow, keyboard 접근성을 확인한다.

완료 기준:

- Chrome channel 기준 390px/360px 확인 결과가 있다.
- Edge channel 기준 390px/360px 확인 결과가 있거나, Edge channel 부재가 `Blocked`로 기록되어 있다.
- S0/S1/S2 issue가 있으면 G02에서 즉시 수정하거나 `ISSUE-LOG.md`에 G06 선행 수정 대상으로 남긴다.
- 모바일 QA 결과가 `QA-RESULTS.md`에 기록되어 있다.

## 5. G03. Chrome/Edge Compat QA

문서: `COMMON/GOAL-SPECS/G03-CHROME-EDGE-COMPAT-QA.goal.md`

목적:

- Chrome과 Edge 최신 버전에서 User Web 핵심 시나리오가 동작하는지 확인한다.

완료 기준:

- Chrome desktop QA 결과가 있다.
- Edge desktop QA 결과가 있거나, Edge channel 부재가 `Blocked`로 기록되어 있다.
- reload, back/forward, multi-tab, slow network loading 상태가 확인되어 있다.
- console/page error가 있으면 심각도와 재현 경로가 `ISSUE-LOG.md`에 남아 있다.

## 6. G04. Multi Account Security QA

문서: `COMMON/GOAL-SPECS/G04-MULTI-ACCOUNT-SECURITY-QA.goal.md`

목적:

- 사용자 A/B 데이터가 Search, Trash, Export, 직접 API 접근에서 섞이지 않는지 확인한다.

완료 기준:

- BE 테스트 또는 HTTP smoke가 사용자 ownership isolation을 검증한다.
- User Web API client가 `/admin/api/*`를 호출하지 않는다는 기준을 재확인한다.
- 일반 사용자 token의 Admin API 접근 차단이 확인되어 있다.
- 발견된 데이터 노출 후보는 S1 이상으로 기록되어 G06 전까지 처리된다.

## 7. G05. DB/Prisma/Migration Ops QA

문서: `COMMON/GOAL-SPECS/G05-DB-PRISMA-MIGRATION-OPS-QA.goal.md`

목적:

- Prisma generate, migration status, seed 정책, 로컬 DB 실행 상태를 운영 전 관점으로 정리한다.

완료 기준:

- `BE/.env` DB 대상이 로컬/공유/운영성 중 하나로 분류되어 있다.
- `pnpm prisma:validate`, `pnpm prisma:generate`, `pnpm exec prisma migrate status` 결과가 기록되어 있다.
- 공유 DB 대상이면 destructive 가능성이 있는 명령을 실행하지 않고 `Blocked` 사유를 남긴다.
- migration 이력 불일치가 있으면 S1 또는 S2 운영 리스크로 기록한다.

## 8. G06. S0/S1/S2 Bugfix Closeout

문서: `COMMON/GOAL-SPECS/G06-S0-S2-BUGFIX-CLOSEOUT.goal.md`

목적:

- G02~G05에서 발견된 S0/S1/S2를 수정하거나 출시 판단 가능한 보류 사유로 닫는다.

완료 기준:

- `ISSUE-LOG.md`에 Open S0/S1/S2가 없다.
- 수정한 FE/BE 범위의 typecheck, lint, build, test가 통과한다.
- API/DB 변경이 있었다면 `COMMON/API-SPEC`과 `BE-TODO/DB-SCHEMA.md`가 갱신되어 있다.
- 완료 보고에 남은 S3/S4와 별도 계획 후보가 적혀 있다.

## 9. G07. Deferred BE/API Backlog Split

문서: `COMMON/GOAL-SPECS/G07-DEFERRED-BE-API-BACKLOG-SPLIT.goal.md`

목적:

- UX/UI 공통 QA에서 의도적으로 미룬 BE/API 개선 후보를 별도 계획 후보로 분리한다.

완료 기준:

- Deal list products summary, Contact dealCount, latest activity/next action summary, ImportJob persistence, Trash private memo backend restriction, BusinessCard provider failure contract, page size contract 후보가 분류되어 있다.
- 품질 라운드가 끝나기 전 구현 금지 항목과 다음 계획 후보가 분리되어 있다.
- 확정된 새 API 계약이 없으면 `draft` 또는 `후보` 상태로만 남긴다.

## 10. 순서 변경 규칙

- G01은 반드시 먼저 실행한다.
- G03은 G02에서 만드는 release QA config를 전제로 하므로 G02 뒤에 실행한다. G03을 먼저 실행해야 하는 경우에는 G03에서 같은 config를 먼저 만들고 `QA-RESULTS.md`에 순서 변경 이유를 남긴다.
- G04와 G05는 독립성이 있지만, 둘 중 하나에서 S0/S1/S2가 나오면 G06 전에 해결한다.
- G07은 기능 구현 goal이 아니므로 G06이 끝난 뒤 실행한다.

## 11. 완료 후 필수 검토 게이트

각 goal 종료 전 아래를 확인한다.

- goal 문서를 다시 읽고 포함/제외 범위를 벗어난 수정이 없는지 확인한다.
- `git diff --check`를 실행한다.
- 수정 파일 diff를 자체 검토한다.
- 실행한 검증 명령과 결과를 `QA-RESULTS.md`에 기록한다.
- 발견 이슈를 `ISSUE-LOG.md`에 기록한다.
- S0/S1/S2가 남아 있으면 다음 goal로 넘기지 않고 G06 선행 수정 대상으로 표시한다.
- 완료 보고에는 수정 요약, 검증, 완료 후 검토 결과, 남은 리스크를 포함한다.
