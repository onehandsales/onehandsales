# Release QA Follow-up Issue Log

## 1. 목적

이 문서는 `USER_WEB_RELEASE_QA_FOLLOWUP_PLAN` 실행 중 발견한 이슈, 미검증 품질 gap, 보류 항목을 기록한다.

## 2. 상태값

- `Open`: 처리 전
- `Fixed`: 수정과 검증 완료
- `Deferred`: 별도 계획으로 분리
- `N/A`: 현재 제품 범위가 아님
- `Blocked`: 환경/계정/브라우저/DB 조건 때문에 확인 불가

## 3. 초기 이슈

### RQA-001 Playwright 기본 e2e browser binary 누락

- 상태: Fixed
- 심각도: S2 Major
- 영역: FE/user-web > e2e
- 발견일: 2026-07-18
- 재확인일: 2026-07-20
- 처리일: 2026-07-20

#### 내용

UX/UI 공통 QA G02~G06 기록에서 `pnpm run test:e2e`가 로컬 Playwright `chromium_headless_shell` binary 누락으로 시작 전 실패했다. 코드 assertion 실패는 아니지만 기본 release gate를 신뢰하기 어렵다.

#### 기대 결과

`FE/user-web`에서 Playwright browser가 설치되어 `pnpm run test:e2e`가 실행된다.

#### 처리 결과

`pnpm exec playwright install chromium`이 정상 종료됐고, 이후 `pnpm run test:e2e`가 browser binary 누락 없이 실행됐다. 기본 smoke에서 드러난 별도 selector/accessibility 계약 불일치는 `RQA-007`로 분리해 수정했고, 최종 e2e는 2건 모두 통과했다.

#### 처리 goal

- `G01-QA-ENV-AND-DOC-CLOSEOUT`

### RQA-002 모바일 브라우저 390px/360px 전용 QA 미완료

- 상태: Fixed
- 심각도: S2 Major
- 영역: FE/user-web > mobile browser QA
- 발견일: 2026-07-20
- 처리일: 2026-07-20

#### 내용

`USER_WEB_UXUI_COMMON_QA_PLAN`은 1440px, 1280px, 768px, 125% 확대를 다뤘고 390px/360px 모바일 브라우저 전용 QA는 제외 범위로 남겼다.

#### 기대 결과

390px와 360px에서 User Web 핵심 업무 흐름이 사용 가능하고, 결과가 `QA-RESULTS.md`에 기록된다.

#### 처리 결과

`FE/user-web/playwright.release-qa.config.ts`, `tests/e2e/mobile-browser-qa.spec.ts`, `tests/e2e/support/user-web-api-mocks.ts`를 추가해 Chrome/Edge channel의 390px/360px 모바일 QA를 `pnpm.cmd run test:e2e:mobile`로 실행 가능하게 했다. 최종 실행 결과는 12 passed이며, 보호 route redirect, 주요 `/app` route 순회, mobile header/bottom nav, long text overflow, company create dialog/dropdown/toast/keyboard focus smoke가 통과했다. 기본 `pnpm.cmd run test:e2e`는 모바일 release QA spec을 제외해 기존 smoke 2건만 실행되도록 유지했다.

#### 처리 goal

- `G02-MOBILE-BROWSER-390-360-QA`

### RQA-003 Chrome/Edge 호환 QA 미완료

- 상태: Open
- 심각도: S2 Major
- 영역: FE/user-web > browser compatibility
- 발견일: 2026-07-20

#### 내용

기존 QA 기록에는 Chrome channel 기반 부분 확인은 있으나, Chrome/Edge 전용 호환 QA가 완료 산출물로 남아 있지 않다.

#### 기대 결과

Chrome과 Edge에서 핵심 시나리오, reload, history, slow network, multi-tab smoke 결과가 기록된다.

#### 처리 goal

- `G03-CHROME-EDGE-COMPAT-QA`

### RQA-004 다중 계정 보안 QA 미완료

- 상태: Open
- 심각도: S1 Critical Risk
- 영역: BE, FE/user-web > ownership isolation
- 발견일: 2026-07-20

#### 내용

Search, Trash, Export, 직접 API 접근에서 다른 사용자 데이터가 섞이지 않는지 별도 계정 기준으로 끝까지 확인한 산출물이 없다.

#### 기대 결과

사용자 A token으로 사용자 B 데이터가 조회, 검색, export, trash detail/restore에 노출되지 않는다.

#### 처리 goal

- `G04-MULTI-ACCOUNT-SECURITY-QA`

### RQA-005 DB/Prisma/migration 운영 정합성 미완료

- 상태: Open
- 심각도: S1 Critical Risk
- 영역: BE > DB/Prisma
- 발견일: 2026-07-20

#### 내용

`AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`와 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`에 Prisma generate DLL lock 이력, migration 기록 정합성, seed 실행 기준 정리가 운영 전 남은 작업으로 기록되어 있다.

#### 기대 결과

Prisma validate/generate/migration status 결과와 seed 실행 정책이 안전하게 기록된다.

#### 처리 goal

- `G05-DB-PRISMA-MIGRATION-OPS-QA`

### RQA-006 완료된 UX/UI QA README 상태 문구 불일치

- 상태: Fixed
- 심각도: S4 Polish
- 영역: TODO docs
- 발견일: 2026-07-20
- 처리일: 2026-07-20

#### 내용

`TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`가 완료 폴더에 있으면서도 `상태: Active`, `다음 실행 goal은 G06`이라고 적혀 있었다.

#### 기대 결과

완료된 계획 문서는 `Done`, `G01~G06 완료`, `모바일/브라우저 QA는 별도 follow-up`으로 정리된다.

#### 처리 결과

`TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`의 상태를 `Done`으로 바꾸고, G01~G06 완료와 `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN` 후속 계획을 연결했다. 관련 문서 링크도 완료 보관 경로인 `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN`으로 정리했다.

#### 처리 goal

- `G01-QA-ENV-AND-DOC-CLOSEOUT`

### RQA-007 기본 smoke e2e selector/accessibility 계약 불일치

- 상태: Fixed
- 심각도: S2 Major
- 영역: FE/user-web > e2e, accessibility
- 발견일: 2026-07-20
- 처리일: 2026-07-20
- 환경: Playwright chromium, 1440x1000

#### 내용

Playwright Chromium 설치 후 `pnpm run test:e2e`가 실행 단계까지 진입했으나, 기존 smoke가 현재 UI 계약과 맞지 않아 실패했다. 주요 원인은 성공 알림 helper가 페이지 전체 `닫기` 버튼을 잡는 문제, 담당자/제품/회의록 submit selector의 stale 문구, 딜 생성 후 상세 URL 이동 기대값, 일부 입력의 접근성 이름 누락이었다.

#### 기대 결과

기본 smoke가 현재 User Web UI의 접근 가능한 이름과 실제 navigation 동작을 기준으로 로그인부터 회의록 저장까지 이어진다.

#### 처리 결과

담당자/제품/딜/회의록 생성 패널의 입력 접근성 이름을 보강하고, e2e selector를 현재 UI 계약에 맞췄다. 최종 `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e`가 모두 통과했다.

#### 처리 goal

- `G01-QA-ENV-AND-DOC-CLOSEOUT`

## 4. 신규 이슈 템플릿

```markdown
### RQA-000 제목

- 상태: Open
- 심각도: S0 Blocker / S1 Critical / S2 Major / S3 Minor / S4 Polish
- 영역:
- 발견일:
- 환경:

#### 재현 절차

1.

#### 기대 결과

#### 실제 결과

#### 증거

#### 처리 goal
```
