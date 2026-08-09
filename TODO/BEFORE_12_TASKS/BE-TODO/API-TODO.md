# Backend API TODO

상태: G01-G04 Done / No New API Confirmed
계약 상태: confirmed / No new API

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 Backend API 작업이 필요한지 기록한다.

## 2. 결론

이번 계획에서는 새 Backend API를 만들지 않는다.

`PRE12-F04`는 기존 follow-up delivery email provider 연결/발송 흐름의 운영 smoke 기록이고, `PRE12-F31`~`PRE12-F34`는 문서 정합성 closeout이다.

## 3. 기존 API 확인 대상

G01에서만 기존 User API를 smoke에 사용한다.

| Method | Path | 확인 목적 |
| --- | --- | --- |
| `GET` | `/api/follow-up-delivery/settings` | email connection 상태 확인 |
| `POST` | `/api/follow-up-delivery/email-connections/:provider/connect` | Gmail/Microsoft OAuth 연결 시작 |
| `GET` | `/api/follow-up-delivery/email-connections/:provider/callback` | provider callback 처리 |
| `POST` | `/api/follow-up-messages/drafts` | smoke용 follow-up draft 생성 |
| `POST` | `/api/follow-up-messages/:messageId/send` | allowlist 실제 발송 |
| `POST` | `/api/follow-up-messages/:messageId/retry` | retry/reconnect 흐름 확인 |
| `GET` | `/api/follow-up-messages/:messageId` | message/attempt 결과 확인 |

정본 계약:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`

## 4. 확인 코드 경로

- `BE/src/app.module.ts`
- `BE/src/modules/follow-up`
- `BE/src/modules/notification`
- `BE/src/modules/admin-operation`
- `BE/src/modules/account-request`
- `BE/src/modules/trash`
- `BE/src/shared`
- `BE/prisma/schema.prisma`

## 5. 금지

- `/api/exports` 추가
- `/api/drafts/*` 추가
- `/api/billing/*` 추가
- `/admin/api/subscriptions` 추가
- `/admin/api/billing-events` 추가
- `/admin/api/*` billing/customer admin API 추가
- Admin direct mutation API 추가
- provider adapter 신규 구현
- SMS vendor 구현
- 기존 follow-up API request/response 변경

## 6. 코드 변경 gate

문서 정합성 closeout 중 Backend 코드 변경이 필요해 보이면 아래 순서로 처리한다.

1. 정말 문서 정합성에 필요한 최소 수정인지 확인한다.
2. request/response 또는 business logic 변경이면 현재 goal에서 구현하지 않는다.
3. DB 영향이 있으면 `BE/prisma`를 확인하고 현재 goal에서 구현하지 않는다.
4. 코드를 수정해야 한다면 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`의 한글 주석 규칙을 적용한다.
5. 관련 검증 명령을 실행한다.

Backend 검증 명령:

```bash
cd BE
pnpm run typecheck
pnpm run lint
```

G01 추가 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run test -- follow-up
```

## 7. 완료 기준

- [x] G01 smoke closeout에서 기존 API 상태와 운영 smoke 결과가 기록된다.
- [x] G02~G04에서 문서 정합성을 위해 필요한 실제 BE 코드 확인 결과가 기록된다.
- [x] 새 API가 없다는 계약이 `COMMON/API-SPEC`와 일치한다.
- [x] request/response/business logic 변경이 발생하지 않았다.
- [x] Backend 코드 변경이 발생했다면 typecheck/lint가 통과했고 한글 주석 기준을 지켰다.

## 8. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`
