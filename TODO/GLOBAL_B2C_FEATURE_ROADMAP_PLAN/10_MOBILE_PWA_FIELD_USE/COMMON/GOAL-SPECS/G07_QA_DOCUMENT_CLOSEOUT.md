# G07 QA Document Closeout

상태: Ready

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

- [ ] G01~G06 체크리스트 검토 기록이 있다.
- [ ] `COMMON/GOAL-REVIEW-CHECKLIST.md` 공통 항목 검토 기록이 있다.
- [ ] `COMMON/REVIEW-CHECKLIST.md` 항목을 검토했다.
- [ ] `COMMON/SOFTWARE-AGENT-REVIEW.md` 기준을 검토했다.
- [ ] UXUI Agent 기준을 적용한 모바일 QA 기록이 있다.
- [ ] UX/UI 기준 확인 경로인 `AGENT/UXUI_AGENT` 검토 기록이 있다.
- [ ] Software/architecture 기준 확인 경로인 `AGENT/SOFTWARE_AGENT` 검토 기록이 있다.
- [ ] Prisma schema/migration 검토 기록이 있다.
- [ ] DB 추가/생성 항목의 Prisma 한국어 주석과 migration SQL COMMENT를 검토했다.
- [ ] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수의 한국어 주석 적용 여부를 검토했다.
- [ ] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았는지 검토했다.
- [ ] provider raw detail/privacy audit 결과가 있다.
- [ ] BE/FE/E2E command와 결과가 기록되어 있다.
- [ ] 실행하지 못한 검증은 사유와 잔여 위험이 있다.
- [ ] 10번 문서 상태를 구현 결과에 맞게 갱신했다.

## 12. 실행 결과

구현 후 기록한다.
