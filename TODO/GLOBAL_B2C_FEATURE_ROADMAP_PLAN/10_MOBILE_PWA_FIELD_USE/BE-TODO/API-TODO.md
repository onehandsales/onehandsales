# Backend API TODO

상태: Confirmed
BEFORE_12 G02 정합성 확인: 2026-08-09 G07 QA closeout, G03/G05/G06 goal 문서, 2026-07-31 work log, 실제 Backend 코드를 대조해 완료된 G03/G05/G06 항목을 체크했다. 완료 불가 조건은 위반 조건이므로 발견되지 않은 상태를 `[ ]`로 유지한다.

## 1. 목적

10번 Mobile/PWA Field Use에서 Backend가 구현하거나 계약을 보강해야 하는 API 작업을 `/goal` 단위로 고정한다.

## 2. API 작업 목록

| Goal | Method | Path | 처리 |
|---|---:|---|---|
| G02 | `POST` | `/api/business-card-scans` | mobile image upload validation, OCR safe failure response |
| G02 | `GET` | `/api/business-card-scans` | response `failure` nullable field 추가 |
| G02 | `GET` | `/api/business-card-scans/:scanLogId` | response `failure` nullable field 추가 |
| G02 | `POST` | `/api/business-card-scans/:scanLogId/confirm` | 기존 request 유지, mobile confirm regression test |
| G03 | `POST` | `/api/meeting-notes/stt-draft` | mobile recording blob/audio file upload contract test |
| G05 | `GET` | `/api/notifications/settings` | 기존 API owner scope regression |
| G05 | `PATCH` | `/api/notifications/settings` | browser push setting과 permission 의미 분리 |
| G05 | `GET` | `/api/notifications/browser-push/public-key` | 기존 API 유지 |
| G05 | `POST` | `/api/notifications/browser-subscriptions` | endpoint/key logging 금지, owner scope |
| G05 | `DELETE` | `/api/notifications/browser-subscriptions/:subscriptionId` | owner scope |
| G06 | `POST` | `/api/analytics/events` | mobile field client event allowlist 추가 |
| G06 | 내부 | ProductAnalytics recorder | `business_card_ocr_failed` server event |

## 3. G02 BusinessCard API 구현 TODO

- [x] `POST /api/business-card-scans` multipart `image` validation을 계약과 맞춘다.
- [x] OCR provider error를 safe code/userMessage/retryable로 map한다.
- [x] `BusinessCardScanLogResponse.failure`를 create/list/detail에 추가한다.
- [x] 과거 `OCR_FAILED` row에 safe field가 없는 경우 fallback response를 반환한다.
- [x] provider raw error/detail을 response/log/analytics에 포함하지 않는다.
- [x] OCR 실패 시 `business_card_ocr_failed` server event를 best effort로 기록한다.
- [x] confirm API regression test로 기존 company/contact 연결 transaction을 보호한다.

## 4. G03 MeetingNote API 구현 TODO

- [x] `POST /api/meeting-notes/stt-draft`가 mobile `MediaRecorder` blob/File 전송을 받을 수 있는지 검증한다.
- [x] audio missing/type/size validation test를 추가하거나 보강한다.
- [x] STT/AI provider failure가 safe error로 전달되는지 확인한다.
- [x] audio binary/blob를 DB에 저장하지 않는다.
- [x] MeetingNote row는 사용자가 최종 저장하기 전까지 만들지 않는다.

## 5. G05 Notification API 구현 TODO

- [x] 기존 notification settings/subscription API를 재사용한다.
- [x] browser push permission을 server setting true와 동일하게 취급하지 않는다.
- [x] subscription endpoint/key를 log/analytics에 남기지 않는다.
- [x] 회원가입/약관 동의로 browser push 자동 허용 처리하는 API를 만들지 않는다.
- [x] marketing/advertising opt-in 신규 API는 10번에서 만들지 않는다.

## 6. G06 Analytics API 구현 TODO

- [x] 09 Product Analytics collector allowlist에 10번 mobile field event를 추가한다.
- [x] forbidden payload key validation을 유지한다.
- [x] client event request에서 userId/deviceId를 받지 않는다.
- [x] server event `business_card_ocr_failed` payload는 safe code, retryable, provider/model, fileSizeBucket 정도만 허용한다.
- [x] analytics 저장 실패가 원래 business mutation을 rollback하지 않게 한다.

## 7. 공통 Backend 검증

권장 command:

```powershell
pnpm --dir BE prisma validate
pnpm --dir BE test -- business-card
pnpm --dir BE test -- meeting-note
pnpm --dir BE test -- notification
pnpm --dir BE test -- product-analytics
```

프로젝트 script명이 다르면 `BE/package.json` 기준으로 동등한 targeted command를 실행하고 결과를 각 goal final에 기록한다.

## 8. 완료 불가 조건

- [ ] provider raw error/detail을 user response에 넣었다.
- [ ] `/api/drafts/*`를 만들었다.
- [ ] `UserDraft`를 만들었다.
- [ ] audio/image binary를 DB에 저장했다.
- [ ] 약관 동의만으로 browser push permission 요청/구독 등록을 처리했다.
- [ ] analytics payload에 PII/raw text를 허용했다.
