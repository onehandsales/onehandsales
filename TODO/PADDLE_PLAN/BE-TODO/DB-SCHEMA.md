# DB Schema TODO

상태: Deferred / Candidate

## 1. 원칙

Paddle을 도입할 경우 내부 DB는 결제 처리의 원본이 아니라, access control, Admin 조회, audit, analytics, 장애 대응을 위한 snapshot/cache 역할을 우선 검토한다.

지금은 Prisma model 또는 migration을 만들지 않는다.

## 2. 모델 후보

| 모델 후보 | 목적 |
| --- | --- |
| `Plan` | 내부 plan code, 표시 이름, 기능 묶음, Paddle price id mapping |
| `PlanEntitlement` | plan별 기능 권한과 quota 정의 |
| `BillingCustomer` | Paddle customer id와 내부 user mapping |
| `Subscription` | Paddle subscription snapshot, status, renew/cancel/past_due 기준 |
| `BillingEvent` | Paddle webhook/event 처리 이력, idempotency, 실패 원인 |
| `Entitlement` | 사용자별 현재 권한 snapshot |
| `UsageQuota` | AI 사용량 제한과 reset 기준 snapshot |
| `Invoice` | Paddle transaction/invoice metadata와 내부 표시용 최소 정보 |
| `Coupon` | coupon/referral을 내부에서 운영할 경우의 후보 |
| `Referral` | referral code/link 후보 |
| `BillingCancellationSurvey` | cancel/downgrade 사유 수집 후보 |
| `BillingAdminSyncLog` | Admin 표시/동기화 이력 후보 |

## 3. Paddle 기준 세부 확인

- Paddle product/price id를 내부 plan과 어떻게 mapping할지 결정한다.
- Paddle customer/subscription/transaction/event id는 unique/idempotent하게 저장한다.
- money는 minor unit 기준을 정하고, 기존 Product/Deal amount 정수 모델과 충돌 여부를 확인한다.
- Paddle이 처리하는 tax/invoice 데이터를 내부에 어디까지 저장할지 정한다.
- 환불/chargeback 정보는 운영에 필요한 최소 metadata만 둘지, Admin 처리 history까지 둘지 정한다.
- entitlement snapshot을 저장할지, 매 요청마다 plan/usage를 계산할지 정한다.
- AI 사용량 reset 기준을 결제 주기와 맞출지 월 단위로 둘지 정한다.
- account deletion 시 Paddle customer/subscription/invoice/tax 보관 의무와 내부 anonymization 범위를 정한다.
- 현재 schema에는 `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`, billing/payment/tax/refund/invoice 관련 모델이 없다는 원천 문서 기준을 유지한다.
- `ProductAnalyticsEvent`, activation/retention snapshot, Admin analytics overview는 완료 범위지만 billing conversion/churn source table은 아니다.
- Admin 직접 Trash 복구 실행, 유료 복구 결제, hard delete/purge 상태/결과 저장 모델은 11 완료 범위 밖이며 Paddle/recovery policy 이후 별도 판단한다.

## 4. migration 주의

- webhook은 중복 도착과 순서 뒤섞임을 전제로 설계한다.
- 결제/세금/인보이스 데이터는 개인정보와 재무 데이터이므로 retention 정책이 필요하다.
- Paddle customer id, subscription id, event id는 환경별 sandbox/live 충돌을 피해야 한다.
- coupon/referral은 analytics와 billing 양쪽 ownership이 섞이므로 abuse 방지와 개인정보 범위를 분리한다.
- churn survey는 사용자가 작성한 원문이므로 export/delete 정책과 연결한다.

## 5. 지금 만들지 않는 것

- `UserSubscription` 또는 `BillingEvent` 임시 migration
- provider-agnostic 결제 추상화 레이어
- 자체 invoice/tax 계산 table
- user-facing AI usage billing source table
- Admin paid recovery/hard delete/purge table
- 09 analytics 완료 모델을 billing source-of-truth로 재사용하는 것
