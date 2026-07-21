# DB Schema TODO

상태: Draft

## 모델 후보

- `Plan`
- `Subscription`
- `BillingCustomer`
- `BillingEvent`
- `Entitlement`
- `Invoice`
- `PlanEntitlement`
- `UsageQuota`
- `Coupon`
- `Referral`
- `BillingCancellationSurvey`
- `BillingAdminSyncLog`

## 결정 baseline 반영 후 세부 확인

- Merchant of Record 우선, Stripe 직접 결제 fallback 여부
- price id와 내부 plan mapping
- 구독 상태 enum
- entitlement snapshot 저장 여부
- webhook event id unique 처리
- tax/invoice metadata 저장 범위
- coupon/referral code unique와 abuse 방지 기준
- churn survey를 billing table에 둘지 09 analytics table에 둘지
- AI 사용량 limit을 실시간 계산할지 snapshot으로 저장할지
- failed payment recovery와 grace period 상태 저장 위치

## migration 주의

- 결제 provider id는 unique/idempotent 처리가 필요하다.
- webhook은 중복 도착을 전제로 설계한다.
- 결제/세금 데이터는 개인정보와 재무 데이터로 보관 정책이 필요하다.
- coupon/referral은 결제 데이터와 analytics 데이터를 동시에 건드리므로 ownership과 개인정보 범위를 분리한다.
- churn survey는 사용자가 작성한 원문이므로 export/delete 정책과 연결한다.
