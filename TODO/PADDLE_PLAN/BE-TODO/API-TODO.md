# Backend API TODO

상태: Deferred / Candidate

## 1. 원칙

이 문서는 Paddle 구현 시 필요한 Backend API 후보를 보존한다. 지금은 API 구현, controller 추가, service 추가, webhook route 추가, Prisma migration을 하지 않는다.

confirmed API는 베타 피드백, 가격/플랜, entitlement, 환불/세금/인보이스 정책이 확정된 뒤 별도 문서에서 승격한다.

## 2. API 후보

| Method | Path | 목적 |
| --- | --- | --- |
| `GET` | `/api/billing/plans` | 내부에 노출할 plan 목록과 Paddle price mapping 조회 |
| `GET` | `/api/billing/entitlements` | 현재 사용자 plan, 기능 권한, AI 사용량 제한 조회 |
| `POST` | `/api/billing/checkout-sessions` | Paddle checkout 진입용 transaction/session 생성 |
| `GET` | `/api/billing/subscription` | 내 구독 상태, 갱신일, past_due/canceled 상태 조회 |
| `POST` | `/api/billing/portal-sessions` | Paddle customer portal 진입 |
| `POST` | `/api/billing/webhooks/paddle` | Paddle webhook 수신 |
| 후보 | `/api/billing/coupons/validate` | coupon 적용 가능 여부 확인 |
| 후보 | `/api/referrals` | referral code/link 생성 |
| 후보 | `/api/billing/cancel-reasons` | cancel/churn survey 저장 |
| `GET` | `/admin/api/subscriptions` | Admin 구독 조회 후보 |
| 후보 | `/admin/api/billing-events` | 결제 event와 webhook 처리 이력 조회 |
| 후보 | `/admin/api/refunds` | 환불/chargeback 운영 상태 조회 또는 처리 후보 |

## 2A. 원천 문서에서 넘어온 Backend gap

| 원천 | Paddle Plan 반영 |
| --- | --- |
| `NEXT_BACKEND_API_BACKLOG_PLAN` | Payment/subscription은 현재 없음. plan, entitlement, payment provider, Admin ops가 첫 판매 전 별도 큰 계획으로 필요하다. |
| `NEXT_BACKEND_API_BACKLOG_PLAN` | billing/paywall/churn event는 09 runtime allowlist가 아니라 reserved taxonomy로만 남아 있다. 실제 paid conversion/churn source event는 Paddle/Billing 구현 후 연결한다. |
| `NEXT_BACKEND_API_BACKLOG_PLAN` | 11 Admin Operation은 완료됐지만 결제/구독/plan/payment/invoice/refund/failed payment recovery와 billing-linked conversion/churn은 11 범위가 아니다. |
| `USER_WEB_PRODUCTIZATION_GAP_PLAN` | Billing 정책/감사, Billing 운영 신뢰, billing-linked conversion/churn 지표는 판매 전 계약화해야 한다. 지금은 post-beta Paddle confirmed API로 승격할 때 다룬다. |
| `PRE12_FOLLOWUP_RECHECK` | `AiProviderCallLog`와 `FollowUpDeliveryAttempt`의 cost 추정은 내부 운영용이며 billing source-of-truth가 아니다. |

## 3. Paddle 연동 계약 후보

- Paddle webhook signature 검증
- Paddle event id 기준 idempotency
- Paddle customer id와 내부 user id mapping
- Paddle subscription id와 내부 subscription snapshot mapping
- Paddle transaction/invoice id 저장 범위
- Paddle price id와 내부 plan id mapping
- checkout custom data 또는 passthrough에 내부 user 식별자를 넣을지 결정
- sandbox/live 환경 분리
- webhook retry와 중복 도착 처리

## 4. Entitlement/API 결정 후보

- Paddle을 결제 source-of-truth로 두고 내부 DB는 권한 판단용 snapshot으로 둘지 결정한다.
- AI 사용량 source-of-truth를 `AiUsageDaily`, `UsageMeter`, 새 billing usage table 중 어디에 둘지 결정한다.
- `past_due` grace period 동안 허용할 기능과 제한할 기능을 정한다.
- plan downgrade/cancel 시 즉시 반영인지 결제 주기 종료 반영인지 정한다.
- refund/chargeback 후 access 전환과 Admin audit 기준을 정한다.
- paid conversion, paywall, churn survey, subscription status event를 09 analytics taxonomy와 어떻게 연결할지 정한다.
- Admin subscription route가 현재 redirect 상태라는 점을 기준으로, Admin Web Billing 화면을 새로 열지 customer portal/support link 중심으로 둘지 정한다.

## 5. 구현 전 금지

- 임시 `/api/billing/*` route 생성 금지
- provider id 없이 내부 subscription table만 먼저 만드는 것 금지
- AI usage limit을 billing 정책 없이 user-facing으로 노출 금지
- checkout-only API 구현 금지
- Paddle live webhook 연결 금지
- 09 reserved billing event를 runtime emit으로 바꾸는 작업 금지
- 11 Admin 완료 범위를 넓혀 Billing Admin API를 끼워 넣는 작업 금지
