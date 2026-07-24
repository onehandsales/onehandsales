# 05 Backend API TODO

상태: Ready

## 1. Source of truth

Backend API 구현자는 아래 문서를 따른다.

- AI report API: `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`
- Follow-up delivery API: `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`
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

## 5. 공통 금지

- API 계약 없이 controller를 먼저 만들지 않는다.
- User Web에서 `/admin/api/*`를 호출하게 만들지 않는다.
- provider raw response, API key, token, quota detail을 일반 사용자 response에 넣지 않는다.
- 외부 provider 호출을 transaction 안에서 실행하지 않는다.
- AI prompt, input snapshot 원문, email/SMS body를 structured log에 남기지 않는다.
