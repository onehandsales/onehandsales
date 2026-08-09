# No New API Contract

상태: Confirmed / G06 Done
계약 상태: confirmed / No new API
소비자: Backend, User Web, Admin Web

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 새 API를 추가하지 않는다는 계약을 명시한다.

`BEFORE_12_TASKS`는 12 Billing 착수 전 closeout 계획이다. 기능 구현 계획이 아니므로 새 HTTP endpoint, request/response 변경, transaction 변경, audit log 정책 변경을 만들지 않았고, G06 handoff에서도 새 API blocker는 발견되지 않았다.

## 2. API 변경 없음

이번 계획에서는 다음을 하지 않는다.

- User API 추가
- Admin API 추가
- provider API adapter 추가
- API request DTO 변경
- API response DTO 변경
- success status 또는 response body 변경
- error code 또는 HTTP status 변경
- `/api/exports` 추가
- `/api/drafts/*` 추가
- `/api/billing/*` 추가
- `/admin/api/subscriptions` 추가
- `/admin/api/billing-events` 추가
- `/admin/api/*` billing/customer admin API 추가
- follow-up email delivery API path 변경

## 3. G01 기존 API 확인 대상

G01에서는 기존 API 흐름을 운영 smoke에 사용할 수 있다.

| Method | Path | 용도 |
| --- | --- | --- |
| `GET` | `/api/follow-up-delivery/settings` | Gmail/Microsoft 연결 상태 확인 |
| `POST` | `/api/follow-up-delivery/email-connections/:provider/connect` | OAuth 연결 시작 |
| `GET` | `/api/follow-up-delivery/email-connections/:provider/callback` | OAuth callback 처리 |
| `POST` | `/api/follow-up-messages/drafts` | smoke용 follow-up draft 생성 |
| `POST` | `/api/follow-up-messages/:messageId/send` | allowlist 실제 발송 |
| `POST` | `/api/follow-up-messages/:messageId/retry` | 실패/reconnect 이후 재시도 확인 |
| `GET` | `/api/follow-up-messages/:messageId` | 발송 결과와 delivery attempt 확인 |

정본 API 계약은 아래 문서를 따른다.

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`

## 4. G02~G05 확인 방식

G02~G05에서는 실제 route/API 상태를 문서에 반영하기 위해 기존 API client와 controller를 확인할 수 있다.

- User Web은 `/api/*`만 호출해야 한다.
- Admin Web은 `/admin/api/*`만 호출해야 한다.
- 문서 정합성을 이유로 User Web에서 Admin API를 호출하게 만들지 않는다.
- 문서 정합성을 이유로 Admin Web에서 User API를 호출하게 만들지 않는다.

## 5. Transaction / Observability

이번 계획에서는 API 계약 변경이 없으므로 새 transaction 계약도 없다.

단, G01 smoke 결과를 확인할 때는 기존 follow-up send 계약의 상태를 검토한다.

- `FollowUpMessage` 상태 전환
- `FollowUpDeliveryAttempt` 생성/성공/실패 기록
- `ExternalEmailConnection` reconnect-required 전환
- allowlist 밖 수신자 차단 시 provider 외부 호출 생략
- structured log와 DB detail에 token, provider raw response, recipient email, subject, body 원문이 남지 않는지 확인

## 6. 완료 기준

- API 변경이 필요 없다는 결론이 BE/FE TODO와 goal 문서에 일관되게 남는다.
- G01은 기존 API 계약을 사용해 smoke를 실행한다.
- G02~G05는 문서 정합성을 위해 기존 API/route 상태만 확인한다.
- 새 API가 필요해 보이는 항목은 post-12 또는 12 Billing 종속 항목으로 분리된다.

## 7. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`
- `TODO/BEFORE_12_TASKS/BE-TODO/API-TODO.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
