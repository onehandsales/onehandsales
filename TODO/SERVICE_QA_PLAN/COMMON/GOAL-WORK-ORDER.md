# Service QA Goal Work Order

## 1. 목적

실제 QA를 자동 검증, Playwright, 실제 통합, 수동 UX, 보안 검증, closeout 순서로 나눈다. 단, 1인 QA 실행 중에는 기능 QA와 UX/UI QA를 같은 사용 흐름에서 함께 발견하고, 수정은 작고 명확한 항목만 즉시 처리한다.

## 2. 실행 순서

| 순서 | Goal | 상태 | 목적 |
|---:|---|---|---|
| 1 | `G01-QA-DOC-AND-ENV-BASELINE` | Pending | QA 기준 문서와 로컬 환경 전제 조건을 확인한다. |
| 2 | `G02-AUTOMATED-QUALITY-GATE` | Pending | BE/FE typecheck, lint, test, build를 실행한다. |
| 3 | `G03-PLAYWRIGHT-MOCK-FE-QA` | Pending | 기존 mock 기반 Playwright로 FE 흐름과 경계를 확인한다. |
| 4 | `G04-REAL-BE-INTEGRATION-QA` | Pending | 실제 BE/DB를 켜고 주요 업무 흐름을 확인한다. |
| 5 | `G05-MANUAL-UX-MOBILE-BROWSER-QA` | Pending | 모바일/브라우저/수동 UX를 확인한다. |
| 6 | `G06-SECURITY-ADMIN-PRIVACY-QA` | Pending | 권한, 개인정보, Admin 민감 흐름을 확인한다. |
| 7 | `G07-ISSUE-TRIAGE-AND-CLOSEOUT` | Pending | 발견 이슈를 severity별로 정리하고 종료 판단을 한다. |

1인 QA 운영 기준은 `SOLO-QA-RUNBOOK.md`를 따른다. 실제 화면별 체크는 `../SERVICE-QA-CHECKLIST.csv`에 먼저 기록하고, 각 goal에서 발견한 기능 판단은 `ISSUE-LOG.md`와 `QA-RESULTS.md`의 기능 선별 QA 요약에 함께 기록한다.

## 3. G01. QA Doc And Env Baseline

완료 기준:

- `README.md`, `SCOPE.md`, `PLAYWRIGHT-RUNBOOK.md`를 확인했다.
- `.env` 파일 존재 여부만 확인하고 실제 값은 기록하지 않았다.
- Node 24.x, pnpm, Docker, browser 설치 상태를 기록했다.
- 실제 DB 대상이 local/shared/production 중 무엇인지 분류했다.

## 4. G02. Automated Quality Gate

완료 기준:

- BE typecheck/lint/test/build 결과가 `QA-RESULTS.md`에 기록됐다.
- User Web typecheck/lint/build 결과가 기록됐다.
- Admin Web typecheck/lint/build 결과가 기록됐다.
- Prisma validate/generate/migration status 결과가 기록됐다.
- 실패가 있으면 `ISSUE-LOG.md`에 severity와 재현 명령을 기록했다.
- 자동 검증 실패는 기능 선별 판단 전에 우선 `FIX` 후보로 기록했다.

## 5. G03. Playwright Mock FE QA

완료 기준:

- User Web `test:e2e` 결과가 기록됐다.
- User Web mobile/browser/analytics Playwright 결과가 기록됐다.
- Admin Web `test:e2e` 결과가 기록됐다.
- 실패 시 HTML report, screenshot, trace 위치가 기록됐다.
- mock 기반 테스트 한계를 `QA-RESULTS.md`에 명시했다.

## 6. G04. Real BE Integration QA

완료 기준:

- 실제 BE와 DB가 연결된 상태로 User Web 주요 CRUD 흐름을 확인했다.
- 실제 BE와 DB가 연결된 상태로 Admin Web read-only/민감 원문 흐름을 확인했다.
- User API와 Admin API의 경계가 실제 HTTP 기준으로 확인됐다.
- `../SERVICE-QA-CHECKLIST.csv`의 결과/판단/이슈 칸이 확인한 범위만큼 채워졌다.
- `../FE-TODO/PAGE-API-QA-MATRIX.md` 기준으로 페이지별 주요 API를 확인했다.
- DB 저장/조회/수정/삭제/복구 결과가 화면과 일치한다.
- 실패는 mock 테스트 결과와 분리해 기록했다.
- 기능은 동작하지만 흐름이 불편한 항목도 `IMPROVE`, `HIDE`, `RETHINK` 등으로 기록했다.

## 7. G05. Manual UX Mobile Browser QA

완료 기준:

- Desktop Chrome 1440px 확인 결과가 있다.
- Mobile 390px, 360px 확인 결과가 있다.
- 가능한 경우 Edge 확인 결과가 있다.
- dialog, form, table/list, bottom navigation, overflow, keyboard 입력 상태를 확인했다.
- 접근성 기본 항목인 focus, label, icon-only button 이름을 확인했다.
- 기능 QA 중 이미 발견한 UX/UI 이슈를 다시 보고, 즉시 수정할 항목과 묶어서 처리할 항목을 분리했다.

## 8. G06. Security Admin Privacy QA

완료 기준:

- access token 없이 보호 API 호출 시 401을 확인했다.
- 일반 사용자 token으로 Admin API 호출 시 403을 확인했다.
- User Web에서 `/admin/api/*` 호출이 없음을 확인했다.
- Admin Web에서 일반 `/api/*`로 관리자 데이터를 처리하지 않음을 확인했다.
- 민감 원문, token, email, phone, memo가 console log에 노출되지 않음을 확인했다.
- Admin 민감 원문 조회에는 사유 입력과 감사 로그가 남음을 확인했다.

## 9. G07. Issue Triage And Closeout

완료 기준:

- Open S0/S1이 없다.
- Open S2는 수정 완료 또는 명확한 보류 사유가 있다.
- S3/S4는 후속 개선으로 분리됐다.
- 기능별 triage가 `KEEP/FIX/IMPROVE/REMOVE/HIDE/DEFER/RETHINK` 중 하나로 정리됐다.
- QA 결과와 이슈 로그가 최신이다.
- 실제 QA 실행 후 최종 판단이 `QA-RESULTS.md`에 기록됐다.
