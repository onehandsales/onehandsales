# 05 Backend API TODO

상태: G03/G06/G07/G09/G10 Done / User-Assumed Provider Smoke Accepted

## 1. Source of truth

Backend API 구현자는 아래 문서를 따른다.

- AI report API: `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`
- Follow-up delivery API: `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`
- Follow-up email provider API: `COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`
- Architecture guardrails: `COMMON/ARCHITECTURE-GUARDRAILS.md`
- Goal specs: `COMMON/GOAL-SPECS/*`

기존 draft의 `/api/sales-reports/weekly/ai-draft` 후보는 더 이상 정본이 아니다.

## 2. 구현 순서

1. G02 AI report DB/Prisma
2. G03 AI report Backend API/job/provider
3. G05 Follow-up DB/provider ports
4. G06 Follow-up settings Backend
5. G07 Follow-up draft/send Backend
6. G09 Backend QA closeout
7. G10 Follow-up email provider integration

## 3. 05-A API

- `POST /api/sales-reports/weekly`
- `GET /api/sales-reports/weekly`
- `GET /api/sales-reports/weekly/:reportId`
- `GET /api/sales-reports/weekly/:reportId/snapshot-summary`

## 4. 05-B API

- `GET /api/follow-up-delivery/settings`
- `POST /api/follow-up-delivery/email-connections/:provider/connect`
- `GET /api/follow-up-delivery/email-connections/:provider/callback`
- `POST /api/follow-up-delivery/email-connections/:connectionId/disconnect`
- `POST /api/follow-up-delivery/sms-sender-numbers`
- `POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/verify`
- `POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/revoke`
- `POST /api/follow-up-delivery/consent-notices/:channel/acknowledge`
- `POST /api/follow-up-messages/drafts`
- `PATCH /api/follow-up-messages/:messageId`
- `GET /api/follow-up-messages/:messageId`
- `POST /api/follow-up-messages/:messageId/send`
- `POST /api/follow-up-messages/:messageId/retry`
- `GET /api/follow-up-messages`

## 4.1 G10 email provider 보강

G10은 새 API를 만들지 않고 기존 05-B API를 실제 Gmail/Microsoft provider 발송으로 보강한다.

- `POST /api/follow-up-delivery/email-connections/:provider/connect`: send-only scope와 production credential preflight
- `GET /api/follow-up-delivery/email-connections/:provider/callback`: granted scope 검증과 token 저장
- `POST /api/follow-up-messages/:messageId/send`: Gmail/Microsoft 실제 provider API 호출
- `POST /api/follow-up-messages/:messageId/retry`: retry/reconnect-required/smoke allowlist 동일 적용
- `GET /api/follow-up-delivery/settings`: `RECONNECT_REQUIRED` 상태를 User Web CTA에 맞게 반환

## 5. 공통 금지

- API 계약 없이 controller를 먼저 만들지 않는다.
- User Web에서 `/admin/api/*`를 호출하게 만들지 않는다.
- provider raw response, API key, token, quota detail을 일반 사용자 response에 넣지 않는다.
- 외부 provider 호출을 transaction 안에서 실행하지 않는다.
- AI prompt, input snapshot 원문, email/SMS body를 structured log에 남기지 않는다.
- G10 신규/수정 Backend 코드에는 한국어 주석을 반드시 추가한다.
