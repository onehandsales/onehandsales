# G09 QA Review Closeout Work Log

상태: Done
작업일: 2026-07-24
검토 시각: 2026-07-24 19:49 KST

## 1. 검토 범위

- 05-A AI Weekly Report Backend, DB, User Web
- 05-B Follow-up Delivery Backend, DB/provider ports, User Web
- ownership isolation, snapshot/privacy, provider failure, duplicate send/retry, mobile QA, migration order
- release note draft와 operations runbook draft

## 2. 코드 대조 결과

- Ownership: AI report 조회/상세/snapshot summary와 follow-up settings/message 조회/변경/발송은 repository/service 경계에서 `currentUser.id` 또는 `userId`를 필터로 사용한다.
- Week/date policy: AI report는 `weekStart`/`weekEnd`를 date-only로 저장하고, `requestedAt`/`startedAt`/`generatedAt`/`failedAt` 등 operational timestamp는 UTC instant로 저장한다.
- Version/failure retention: `AiWeeklySalesReport`는 `[userId, weekStart, timeZone, version]` unique로 append-only version을 저장하고, 실패도 `FAILED` version으로 남긴다. 사용자 삭제 API는 없다.
- Snapshot/privacy: full input snapshot은 DB에 저장하지만 user response는 `snapshot-summary`에서 counts/metadata와 `hasMemo`/`hasDetails` 계열 summary만 반환한다.
- Structured log: AI report generation, follow-up draft/send/retry log event는 ids/status/safe error 중심이며 prompt/raw response/token/SMS code/email/SMS body를 넣지 않는다.
- Secret handling: OAuth token과 SMS sender 원문은 `NodeFollowUpDeliverySecretEncryptionService`에서 AES-GCM ciphertext, hash, mask로 분리한다.
- Provider failure: follow-up provider failure는 `FollowUpDeliverySafeErrorMapper`가 safe code/message/retryable/detail로 변환하고 raw error/response body를 저장하지 않는다.
- Duplicate send/retry: `beginDeliveryAttempt`가 `updateMany` status gate로 `DRAFT`/`FAILED`에서만 `SENDING` 전환한다. `SENT`와 non-retryable `FAILED`는 application service에서 차단한다.
- User Web API: AI weekly report와 follow-up delivery feature 영역은 `/api/*`를 사용하며 `/admin/api/*` 의존은 없다.
- Mobile UX: release QA config가 390px/360px Chrome mobile을 항상 실행하고, Edge는 로컬 Edge 설치 또는 `PLAYWRIGHT_INCLUDE_EDGE=1`일 때 포함한다.

## 3. 수정 사항

- `FE/user-web/playwright.release-qa.config.ts`: 로컬 Microsoft Edge가 없는 개발 환경에서도 `pnpm run test:e2e:mobile`이 환경 실패로 끝나지 않도록 Edge project를 조건부 포함으로 변경했다.
- `FE/user-web/src/**/*.tsx`: 기존 Tailwind ambiguous warning을 내던 `duration-[500ms]`를 동일 의미의 `duration-500`으로 교체했다.

## 4. 검증 명령

Backend:

- `cd BE && pnpm run prisma:validate`: pass
- `cd BE && pnpm run typecheck`: pass
- `cd BE && pnpm run lint`: pass
- `cd BE && pnpm run test`: pass, 48 test suites / 267 tests
- `cd BE && pnpm run build`: pass

Frontend:

- `cd FE/user-web && pnpm run typecheck`: pass
- `cd FE/user-web && pnpm run lint`: pass
- `cd FE/user-web && pnpm run build`: pass
- `cd FE/user-web && pnpm run test:e2e:mobile`: pass, 6 tests

Non-blocking output:

- FE build still reports the existing large bundle warning for the main JS chunk. It is not a G09 blocker and should be handled by a separate code-splitting/performance task.
- Playwright webServer prints the existing `NO_COLOR`/`FORCE_COLOR` warning. It does not fail tests.

## 5. Provider Smoke 기록

- 실제 Gmail/Microsoft/SMS provider smoke: 미실행.
- 사유: 로컬 환경에는 follow-up 전용 `FOLLOW_UP_GOOGLE_CLIENT_ID`, `FOLLOW_UP_GOOGLE_CLIENT_SECRET`, `FOLLOW_UP_MICROSOFT_CLIENT_ID`, `FOLLOW_UP_MICROSOFT_CLIENT_SECRET`, production SMS provider credential/callback 등록이 준비되어 있지 않다.
- 현재 자동 검증은 provider adapter test double, safe error mapper, unavailable provider path, OAuth/SMS secret encryption test로 닫았다.
- 운영 callback URL은 `VITE_API_URL` 기준으로 User Web이 생성하는 `/api/follow-up-delivery/email-connections/{google|microsoft}/callback`을 provider console에 등록해야 한다.

## 6. 산출물

- Release note draft: `RELEASE_NOTE_DRAFT.md`
- Operations runbook draft: `OPERATIONS_RUNBOOK_DRAFT.md`
- Final QA checklist: `COMMON/REVIEW-CHECKLIST.md`
