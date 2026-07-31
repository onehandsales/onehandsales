# G06 Mobile Field Analytics Events

상태: Done

## 1. 목적

모바일 현장 입력 경험의 품질을 운영 관점에서 파악하기 위한 최소 analytics event를 09 Product Analytics 위에 추가한다.

## 2. 포함 범위

- 09 collector event allowlist 확장
- BusinessCard OCR failure server event
- BusinessCard capture/retry client event
- MeetingNote recording client event
- Local draft client event
- Mobile push permission client event
- payload privacy tests

## 3. 제외 범위

- Admin analytics dashboard
- billing/paywall/churn analytics
- raw text/PII analytics
- mobile 필요성 검증용 growth experiment

## 4. Request 계약

기준 문서: `COMMON/API-SPEC/MOBILE_FIELD_ANALYTICS_EVENT_CONTRACT.md`

`POST /api/analytics/events`

```ts
type MobileFieldAnalyticsEventRequest = {
  eventName: string;
  eventVersion: 1;
  occurredAt?: string;
  targetType?: "USER" | "BUSINESS_CARD_SCAN" | "MEETING_NOTE";
  targetId?: string;
  payload?: Record<string, unknown>;
};
```

client가 보내지 않는 값:

- `userId`
- `organizationId`
- `eventDate`
- `source`
- `deviceId`

## 5. Response 계약

성공 status: `202 Accepted`

```json
{
  "accepted": true
}
```

FE는 analytics 실패를 사용자에게 표시하지 않는다.

## 6. Backend Business Logic

1. 09 Product Analytics allowlist에 10번 event를 추가한다.
2. forbidden payload key validation을 유지한다.
3. eventDate/timezone 정책은 09 기준을 재사용한다.
4. `business_card_ocr_failed`는 BusinessCard OCR 실패 시 server recorder로 남긴다.
5. analytics 저장 실패는 warning log만 남기고 본 작업을 rollback하지 않는다.

## 7. User Flow

- 명함 촬영 시작/재시도 시 client event를 보낸다.
- OCR 실패 시 backend server event를 보낸다.
- 녹음 시작/종료/실패 시 client event를 보낸다.
- local draft 저장/복구/폐기 시 client event를 보낸다.
- push permission 안내/결과 시 client event를 보낸다.
- event 전송 실패는 사용자가 보지 않는다.

## 8. DB/Prisma 영향

신규 DB migration 없음.

기존 `ProductAnalyticsEvent`를 사용한다.

주의:

- eventName string 확장이므로 Prisma enum 변경 없음
- payloadJson에 PII/raw text 금지

## 9. 코드 주석 기준

Backend:

- event taxonomy/recorder/use case 수정 시 `// 기능 : ...`

Frontend:

- analytics helper와 이벤트 호출 hook에 `// 기능 : ...`

## 10. 검증

권장 command:

```powershell
pnpm --dir BE test -- product-analytics
pnpm --dir FE/user-web test -- analytics
pnpm --dir FE/user-web test:e2e -- product-analytics-route
```

## 11. Goal 검토 체크리스트

- [x] 09 Product Analytics API를 재사용한다.
- [x] 신규 mobile event allowlist가 contract와 일치한다.
- [x] `business_card_ocr_failed` server event가 있다.
- [x] analytics payload에 PII/raw text가 없다.
- [x] forbidden payload key validation이 유지된다.
- [x] analytics 실패가 사용자 작업을 막지 않는다.
- [x] Admin analytics dashboard를 만들지 않았다.
- [x] DB 추가/생성 없이 `ProductAnalyticsEvent` 기존 model만 사용했다.
- [x] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에 한국어 주석을 적용했다.
- [x] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았다.
- [x] UX/UI 변경 전 `AGENT/UXUI_AGENT` 기준을 확인했다.
- [x] Software/architecture 변경 전 `AGENT/SOFTWARE_AGENT` 기준을 확인했다.
- [x] BE/FE/E2E targeted 검증 결과를 기록했다.
- [x] `COMMON/GOAL-REVIEW-CHECKLIST.md`를 확인했다.

## 12. 실행 결과

완료일: 2026-07-31

구현 요약:

- 기존 `POST /api/analytics/events` collector를 재사용하고 G06 mobile client event 10개를 allowlist에 추가했다.
- client collector는 G06 계약의 optional `occurredAt`, `targetType`, `targetId`를 검증하되 user/session/device/source/eventDate/idempotency 값은 계속 차단한다.
- payload는 event별 allowlist schema로 정규화하고 `endpoint`, `p256dh`, `auth`, `audio`, `image`, `details`, `transcript`, PII/raw text key를 차단한다.
- BusinessCard OCR 실패 server event `business_card_ocr_failed`는 기존 Product Analytics recorder와 BusinessCard service 경로에서 best effort로 기록되는 상태를 검증했다.
- User Web에 mobile field analytics helper를 추가하고 명함 capture/retry, 회의록 녹음 start/completed/failed, local draft saved/restored/discarded, push permission prompt/result 이벤트를 collector 전송으로 연결했다.
- analytics 전송 실패는 helper/recorder에서 catch하거나 warning log로 처리해 사용자 촬영, 녹음, draft, 권한 UX를 막지 않는다.
- 신규 DB migration 없이 기존 `ProductAnalyticsEvent`만 사용했다.

검증:

```powershell
pnpm.cmd --dir BE test -- product-analytics
pnpm.cmd --dir BE test -- collect-client-analytics-event
pnpm.cmd --dir BE test -- business-card-application
pnpm.cmd --dir BE typecheck
pnpm.cmd --dir BE lint
pnpm.cmd --dir FE/user-web test -- analytics
pnpm.cmd --dir FE/user-web test -- use-meeting-note-audio-recorder
pnpm.cmd --dir FE/user-web test -- use-mobile-local-draft
pnpm.cmd --dir FE/user-web test -- browser-push-permission
pnpm.cmd --dir FE/user-web typecheck
pnpm.cmd --dir FE/user-web lint
pnpm.cmd --dir FE/user-web test:e2e:analytics
git diff --check
```

결과:

- BE product-analytics Jest 8 suites / 39 tests 통과.
- BE collect-client-analytics-event Jest 1 suite / 23 tests 통과.
- BE business-card-application Jest 1 suite / 5 tests 통과.
- BE typecheck/lint 통과.
- FE analytics Vitest 4 files / 45 tests 통과.
- FE meeting-note recorder Vitest 1 file / 6 tests 통과.
- FE local-draft Vitest 1 file / 3 tests 통과.
- FE browser-push-permission Vitest 1 file / 4 tests 통과.
- FE typecheck/lint 통과.
- Product Analytics Playwright smoke 1 test 통과.
- `git diff --check` 통과.
- 운영/공유 DB migrate/seed는 실행하지 않았다.
