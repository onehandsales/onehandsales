# G06 Mobile Field Analytics Events Work Log

상태: Done
작업일: 2026-07-31

## 작업 내용

- 기존 09 Product Analytics collector `POST /api/analytics/events`를 재사용했다.
- G06 mobile client event 10개를 Backend taxonomy와 client collector payload allowlist에 추가했다.
- client request에서 `userId`, `organizationId`, session/device/source/eventDate/idempotency field를 계속 차단하고, optional `occurredAt`, `targetType`, `targetId`는 계약 범위에서 검증한다.
- forbidden payload key validation에 push endpoint/key, audio/image, transcript/details, PII/raw text 계열을 보강했다.
- `business_card_ocr_failed` server event는 BusinessCard OCR 실패 경로에서 existing ProductAnalyticsEventRecorder로 best effort 기록되는 상태를 검증했다.
- User Web analytics helper를 추가하고 명함 capture/retry, 회의록 녹음, local draft, mobile push permission 이벤트를 collector 전송으로 연결했다.
- 기존 G04/G05 CustomEvent 호환성은 유지하되 collector 전송을 추가해 테스트와 기존 내부 관찰 흐름을 깨지 않게 했다.
- 신규 Admin dashboard, billing/paywall/churn analytics, DB migration, server draft sync는 만들지 않았다.

## 검증 결과

- `pnpm.cmd --dir BE test -- product-analytics` 통과
- `pnpm.cmd --dir BE test -- collect-client-analytics-event` 통과
- `pnpm.cmd --dir BE test -- business-card-application` 통과
- `pnpm.cmd --dir BE typecheck` 통과
- `pnpm.cmd --dir BE lint` 통과
- `pnpm.cmd --dir FE/user-web test -- analytics` 통과
- `pnpm.cmd --dir FE/user-web test -- use-meeting-note-audio-recorder` 통과
- `pnpm.cmd --dir FE/user-web test -- use-mobile-local-draft` 통과
- `pnpm.cmd --dir FE/user-web test -- browser-push-permission` 통과
- `pnpm.cmd --dir FE/user-web typecheck` 통과
- `pnpm.cmd --dir FE/user-web lint` 통과
- `pnpm.cmd --dir FE/user-web test:e2e:analytics` 통과
- `git diff --check` 통과

## 검토 결과

- 검토 횟수: 3회 완료
- 1차: G06/API 계약과 Event Taxonomy 기준으로 BE/FE event allowlist, optional request field, forbidden payload key를 확인하고 FE request 타입 누락을 보정했다.
- 2차: 기능별 호출 지점에서 명함/회의록/local draft/push 이벤트가 PII 없이 fire-and-forget으로 연결됐는지 확인했다.
- 3차: Goal 체크리스트와 공통 체크리스트 기준으로 DB migration 없음, Admin/billing/dashboard 제외, 한국어 주석, targeted 검증 결과를 확인했다. 추가 수정 사항 없음.

## 미실행 검증

- 신규 DB migration이 없어 Prisma migrate/generate는 실행하지 않았다.
- UI layout 변경이 아니라 analytics event 연결 작업이므로 별도 360px/390px screenshot QA는 실행하지 않았다.
