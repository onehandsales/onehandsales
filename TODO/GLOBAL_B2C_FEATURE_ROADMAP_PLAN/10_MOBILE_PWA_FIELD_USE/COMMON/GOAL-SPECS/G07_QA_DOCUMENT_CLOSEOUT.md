# G07 QA Document Closeout

상태: Done

## 1. 목적

G02~G06 구현 결과가 10번 문서, Software Agent, UXUI Agent, Prisma 기준을 실제로 따르는지 통합 검토하고 closeout 기록을 남긴다.

## 2. 포함 범위

- goal별 체크리스트 검토 기록 확인
- backend/frontend/e2e targeted test 결과 수집
- 360px/390px mobile QA 확인
- provider raw detail/privacy audit
- 문서 상태 갱신
- 잔여 위험 기록

## 3. 제외 범위

- 신규 기능 구현
- native app 구현
- Admin analytics 구현
- PWA install/offline shell 구현

## 4. Request 계약

서버 API request 변경 없음.

Closeout input:

```ts
type MobileFieldUseCloseoutInput = {
  completedGoals: ["G01", "G02", "G03", "G04", "G05", "G06"];
  testCommands: string[];
  unresolvedRisks?: string[];
};
```

## 5. Response 계약

서버 API response 변경 없음.

Closeout result:

```ts
type MobileFieldUseCloseoutResult = {
  allGoalChecklistsReviewed: boolean;
  commonChecklistReviewed: boolean;
  softwareAgentCompliant: boolean;
  uxuiAgentCompliant: boolean;
  prismaCompliant: boolean;
  testsPassed: boolean;
  skippedTests: Array<{ command: string; reason: string }>;
};
```

## 6. Backend Business Logic

G07은 runtime backend logic을 구현하지 않는다.

검토해야 하는 backend 결과:

- BusinessCard OCR failure safe field 저장/응답
- MeetingNote STT draft safe provider handling
- notification owner scope와 endpoint/key logging 금지
- analytics event privacy/allowlist
- transaction 범위

## 7. User Flow

G07은 사용자 화면을 새로 만들지 않는다.

검토해야 하는 user flow:

- 명함 촬영/재시도/수동 입력
- 회의 녹음/file upload fallback
- local draft restore/discard
- browser push permission granted/denied/default/unsupported
- 모바일 viewport overflow 없음

## 8. DB/Prisma 영향

신규 DB 변경 없음.

검토해야 하는 DB 결과:

- G02 migration 외 신규 DB model 없음
- `UserDraft` 없음
- audio/image binary 저장 없음
- analytics payload privacy 유지

## 9. 코드 주석 기준

G07에서 코드 수정이 발생하면 해당 수정 파일에 Software Agent 주석 기준을 적용한다.

문서 closeout 수정에는 불필요한 주석을 추가하지 않는다.

## 10. 검증

권장 command:

```powershell
pnpm --dir BE prisma validate
pnpm --dir BE test -- business-card
pnpm --dir BE test -- meeting-note
pnpm --dir BE test -- notification
pnpm --dir BE test -- product-analytics
pnpm --dir FE/user-web test -- business-card
pnpm --dir FE/user-web test -- meeting-note
pnpm --dir FE/user-web test -- notification
pnpm --dir FE/user-web test -- local-draft
pnpm --dir FE/user-web test:e2e -- mobile
```

프로젝트 script명이 다르면 package.json 기준으로 동등한 targeted command를 실행한다.

## 11. Goal 검토 체크리스트

- [x] G01~G06 체크리스트 검토 기록이 있다.
- [x] `COMMON/GOAL-REVIEW-CHECKLIST.md` 공통 항목 검토 기록이 있다.
- [x] `COMMON/REVIEW-CHECKLIST.md` 항목을 검토했다.
- [x] `COMMON/SOFTWARE-AGENT-REVIEW.md` 기준을 검토했다.
- [x] UXUI Agent 기준을 적용한 모바일 QA 기록이 있다.
- [x] UX/UI 기준 확인 경로인 `AGENT/UXUI_AGENT` 검토 기록이 있다.
- [x] Software/architecture 기준 확인 경로인 `AGENT/SOFTWARE_AGENT` 검토 기록이 있다.
- [x] Prisma schema/migration 검토 기록이 있다.
- [x] DB 추가/생성 항목의 Prisma 한국어 주석과 migration SQL COMMENT를 검토했다.
- [x] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수의 한국어 주석 적용 여부를 검토했다.
- [x] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았는지 검토했다.
- [x] provider raw detail/privacy audit 결과가 있다.
- [x] BE/FE/E2E command와 결과가 기록되어 있다.
- [x] 실행하지 못한 검증은 사유와 잔여 위험이 있다.
- [x] 10번 문서 상태를 구현 결과에 맞게 갱신했다.

## 12. 실행 결과

완료일: 2026-07-31

Closeout input:

```ts
const input: MobileFieldUseCloseoutInput = {
  completedGoals: ["G01", "G02", "G03", "G04", "G05", "G06"],
  testCommands: [
    "pnpm.cmd --dir BE run prisma:validate",
    "pnpm.cmd --dir BE test -- business-card",
    "pnpm.cmd --dir BE test -- meeting-note",
    "pnpm.cmd --dir BE test -- notification",
    "pnpm.cmd --dir BE test -- product-analytics",
    "pnpm.cmd --dir FE/user-web test -- business-card",
    "pnpm.cmd --dir FE/user-web test -- meeting-note",
    "pnpm.cmd --dir FE/user-web test -- notification",
    "pnpm.cmd --dir FE/user-web test -- local-draft",
    "pnpm.cmd --dir FE/user-web test:e2e:mobile",
    "pnpm.cmd --dir BE typecheck",
    "pnpm.cmd --dir BE lint",
    "pnpm.cmd --dir FE/user-web typecheck",
    "pnpm.cmd --dir FE/user-web lint",
    "git diff --check"
  ],
  unresolvedRisks: []
};
```

Closeout result:

```ts
const result: MobileFieldUseCloseoutResult = {
  allGoalChecklistsReviewed: true,
  commonChecklistReviewed: true,
  softwareAgentCompliant: true,
  uxuiAgentCompliant: true,
  prismaCompliant: true,
  testsPassed: true,
  skippedTests: []
};
```

문서 검토:

- G01~G06 goal 문서는 모두 `상태: Done`이고 `Goal 검토 체크리스트`가 전부 체크된 것을 확인했다.
- G03~G06 goal 문서의 상태와 체크리스트가 실제 `TODO_LOG/2026-07-31/*/WORK_LOG.md` 완료 기록을 따라가지 못한 문서 불일치를 발견해 수정했다.
- `COMMON/GOAL-REVIEW-CHECKLIST.md`, `COMMON/REVIEW-CHECKLIST.md`, `COMMON/SOFTWARE-AGENT-REVIEW.md`, `COMMON/UXUI-AGENT-REVIEW.md`, `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`, `COMMON/GOAL-WORK-ORDER.md`, `COMMON/GOAL-COMPLETION-CHECKLIST.md`를 재검토했다.
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`, `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md` 기준으로 모바일 화면의 입력 흐름, 버튼 겹침, compact workflow 기준을 확인했다.
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md` 기준으로 도메인 경계, 테스트 배치, 공개/핵심 함수 한국어 주석 적용 여부를 확인했다.

Prisma/DB 검토:

- `BE/prisma/schema.prisma`와 `BE/prisma/migrations/20260731010000_add_business_card_safe_failure_fields/migration.sql`을 확인했다.
- G02 외 10번 범위 신규 DB model은 없고 `UserDraft` model도 없다.
- `BusinessCardScanLog` safe failure field에는 Prisma 한국어 주석이 있고 migration SQL에는 `COMMENT ON COLUMN`이 있다.
- MeetingNote audio/image binary, transcript 전문, provider raw response를 DB에 저장하는 변경은 없다.
- G06 analytics는 신규 migration 없이 기존 `ProductAnalyticsEvent` model을 재사용한다.
- notification은 기존 `UserNotificationSetting`, `BrowserPushSubscription` model/API 범위에서 동작한다.

Privacy audit:

- BusinessCard OCR 실패 response/log/analytics에는 provider raw error/detail이 노출되지 않는다.
- MeetingNote STT draft 경로는 transcript 전문/provider raw response를 UI/log/analytics/local draft에 저장하지 않는 테스트가 있다.
- Local draft payload는 client local 저장만 사용하고 image/audio blob/base64, transcript 전문, provider raw response를 제외한다.
- Browser push endpoint, `p256dh`, `auth`, token 계열 값은 analytics/log payload에 포함하지 않고 subscription 저장 경로에서는 암호화/해시 처리된다.
- Product Analytics forbidden payload key validation은 endpoint/key, audio/image, details/transcript, PII/raw text 계열을 차단한다.
- `/api/follow-up-messages/drafts`는 기존 별도 도메인 draft API로 확인되며, 10번 범위에서 금지한 `/api/drafts/*` 또는 `UserDraft` 생성은 없었다.

검증:

```powershell
pnpm.cmd --dir BE run prisma:validate
pnpm.cmd --dir BE test -- business-card
pnpm.cmd --dir BE test -- meeting-note
pnpm.cmd --dir BE test -- notification
pnpm.cmd --dir BE test -- product-analytics
pnpm.cmd --dir FE/user-web test -- business-card
pnpm.cmd --dir FE/user-web test -- meeting-note
pnpm.cmd --dir FE/user-web test -- notification
pnpm.cmd --dir FE/user-web test -- local-draft
pnpm.cmd --dir FE/user-web test:e2e:mobile
pnpm.cmd --dir BE typecheck
pnpm.cmd --dir BE lint
pnpm.cmd --dir FE/user-web typecheck
pnpm.cmd --dir FE/user-web lint
git diff --check
```

결과:

- BE Prisma schema validate 통과.
- BE business-card Jest 2 suites / 6 tests 통과.
- BE meeting-note Jest 9 suites / 49 tests 통과.
- BE notification Jest 6 suites / 37 tests 통과.
- BE product-analytics Jest 8 suites / 39 tests 통과.
- FE business-card Vitest 1 file / 2 tests 통과.
- FE meeting-note Vitest 2 files / 7 tests 통과.
- FE notification Vitest 1 file / 4 tests 통과.
- FE local-draft Vitest 3 files / 11 tests 통과.
- FE mobile Playwright 360px/390px QA는 Chrome/Edge 기준 20 tests 통과.
- BE typecheck/lint 통과.
- FE typecheck/lint 통과.
- `git diff --check` 통과. LF/CRLF warning만 있었고 whitespace error는 없었다.

미실행 검증:

- 없음. G07 권장 검증과 closeout 보강 검증을 모두 실행했다.
- FE notification/local-draft Vitest는 최초 병렬 실행이 tool timeout으로 종료되었으나, 각각 단독 재실행해 통과했으므로 skipped test로 보지 않는다.

검토 결과:

- 검토 횟수: 3회 완료
- 1차: G01~G06 goal 문서, work log, common checklist를 대조해 G03~G06 문서 상태/체크리스트 불일치를 수정했다.
- 2차: Backend/Frontend/Prisma/privacy/UXUI/Software Agent 기준으로 10번 범위 위반 여부를 감사하고 targeted 검증을 실행했다.
- 3차: G07 closeout 결과, 전체 완료 체크리스트, diff/checklist 상태를 재확인했다.
