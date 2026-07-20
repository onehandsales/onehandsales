# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `GET` | `/api/billing/plans` | plan 목록 |
| `GET` | `/api/billing/entitlements` | 현재 사용자 entitlement와 사용량 제한 |
| `POST` | `/api/billing/checkout-sessions` | checkout session 생성 |
| `GET` | `/api/billing/subscription` | 내 구독 상태 |
| `POST` | `/api/billing/portal-sessions` | billing portal 진입 |
| 후보 | `/api/billing/coupons/validate` | coupon 적용 가능 여부 확인 |
| 후보 | `/api/referrals` | referral code/link 생성 |
| 후보 | `/api/billing/cancel-reasons` | cancel/churn survey 저장 |
| `POST` | `/api/billing/webhooks/:provider` | provider webhook |
| `GET` | `/admin/api/subscriptions` | Admin 구독 조회 후보 |
| 후보 | `/admin/api/billing-events` | 결제 event와 webhook 처리 이력 조회 |

## 계약 보강 필요

- provider 선택
- webhook signature 검증
- idempotency
- entitlement 계산
- plan/price/currency mapping
- trial, coupon, referral 적용 순서
- refund/invoice 처리 범위
- failed payment, grace period, downgrade/cancel 상태 전이
- AI 사용량 집계와 plan limit enforcement
- analytics event와 billing event 연결
