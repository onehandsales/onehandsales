# Goal Implementation Matrix

상태: Confirmed

## 1. 목적

각 `/goal`이 어느 코드, 문서, 테스트를 수정해야 하는지 미리 고정해 구현 범위 누락을 막는다.

## 2. Matrix

| Goal | 주요 수정 대상 | 필수 검증 |
|---|---|---|
| G01 | `10_MOBILE_PWA_FIELD_USE/**`, `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`, `FE-TODO/USER-WEB-TODO.md` | 문서 grep, checklist presence |
| G02 | `BE/prisma/schema.prisma`, Prisma migration, BusinessCard BE controller/service/repository/provider, BusinessCard FE API/types/screen | BE unit/controller tests, FE unit/component tests, mobile E2E |
| G03 | MeetingNote FE create dialog/hook/API types, MeetingNote BE STT draft tests | MediaRecorder unit tests, upload fallback E2E, BE safe error tests |
| G04 | FE local draft utility/hook, BusinessCard confirm form, MeetingNote create form | IndexedDB/localStorage tests, restore/discard E2E |
| G05 | FE notification settings/permission components, notification API client usage, optional BE contract tests | permission state tests, denied/default/granted tests, mobile E2E |
| G06 | Product Analytics event allowlist, server recorder usage, FE analytics helper calls | BE analytics tests, FE helper tests, payload privacy tests |
| G07 | roadmap docs, QA evidence, closeout notes | full targeted test commands and checklist audit |

## 3. G02 상세 대상

Backend:

- `BE/prisma/schema.prisma`
- 새 Prisma migration
- BusinessCard controller DTO/response mapper
- BusinessCard application service
- BusinessCard OCR provider error mapper
- BusinessCard repository
- ProductAnalytics server recorder 호출부
- 관련 Software Agent DB schema 문서 필요 시 갱신

권장 test 파일:

- `BE/src/modules/business-card/**/*.spec.ts`
- controller multipart validation spec
- service OCR failure mapping spec
- repository old row fallback spec

Frontend:

- BusinessCard API client/types
- mobile capture component 또는 기존 screen
- OCR failure retry/manual input UI
- confirm form local draft hook 연결 지점

권장 test 파일:

- `FE/user-web/src/features/business-card/**/*.test.tsx`
- `FE/user-web/tests/e2e/mobile-business-card-capture.spec.ts`

## 4. G03 상세 대상

Frontend:

- MeetingNote create dialog/page
- mobile audio recorder hook
- audio upload fallback component
- STT draft API client error handling

Backend:

- existing `POST /api/meeting-notes/stt-draft` contract regression tests
- provider safe error mapping tests

권장 E2E:

- `FE/user-web/tests/e2e/mobile-meeting-note-recording.spec.ts`

## 5. G04 상세 대상

Frontend:

- local draft storage utility
- local draft restore prompt component
- BusinessCard confirm form integration
- MeetingNote create form integration

권장 test:

- save/load/discard/expiry
- schemaVersion mismatch
- IndexedDB unavailable fallback
- mobile restore prompt E2E

## 6. G05 상세 대상

Frontend:

- notification settings screen
- push permission dialog/bottom sheet
- service/marketing copy 분리
- browser permission state mapper

Backend:

- 기존 notification API owner scope regression test가 없으면 추가

## 7. G06 상세 대상

Backend:

- 09 Product Analytics allowlist 확장
- `business_card_ocr_failed` server event recorder integration
- forbidden payload key validation regression

Frontend:

- mobile capture/recording/local draft/permission event helper 호출
- analytics disabled 환경 no-op

## 8. G07 상세 대상

- 모든 goal 체크리스트 확인
- `COMMON/SOFTWARE-AGENT-REVIEW.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- 구현 후 문서 상태 갱신
