# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| Pricing/plan | 무료체험, 월간/연간, plan별 제한 |
| Subscription | trialing, active, past_due, canceled |
| Entitlement | 기능 제한, AI 사용량 제한 |
| Paywall/upgrade | 무료 제한 초과, AI 사용량 초과, 유료 기능 접근 시 upgrade 흐름 |
| Payment provider | Stripe 또는 Merchant of Record |
| Tax/invoice | VAT/GST/판매세, 영수증/인보이스 |
| Webhook | 결제 상태 동기화 |
| Failed payment recovery | 결제 실패, 카드 만료, grace period, 기능 제한 전환 |
| Refund/chargeback | 환불 요청, chargeback 상태, Admin 처리 기준 |
| Coupon/referral | 첫 판매 이후 growth 실험에 필요한 할인/추천 코드 기반 |
| Churn survey | cancel 또는 plan downgrade 시 해지 사유 수집 |
| Billing Admin sync | 11 Admin 운영 화면과 구독/결제 상태를 연결 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 복잡한 enterprise contract | B2C 우선 |
| 다중 조직 billing | 개인 영업자 우선 |
| 완전 자동 growth automation | 09 제품 분석에서 실험 판단 후 확장 |

## 열린 질문

- 첫 판매는 어떤 국가와 통화로 시작할지?
- Stripe 직접 결제인가 Merchant of Record인가?
- free trial 기간과 결제 정보 선입력 여부는?
- AI 사용량 제한, 초과 과금, 사용량 reset 기준을 plan에 포함할지?
- coupon/referral은 첫 판매 전 기본 모델만 둘지, 출시 후 09 실험으로 넘길지?
- cancel/downgrade 시 churn survey를 필수로 받을지, 선택으로 둘지?
- 결제 실패 후 grace period와 기능 제한 전환 시점은?
- refund/chargeback 운영을 Admin에서 어디까지 처리할지?

## 완료 기준 초안

- 사용자가 plan을 선택하고 구독 상태를 확인할 수 있다.
- 결제 provider webhook으로 subscription 상태가 동기화된다.
- entitlement가 API와 FE에 반영된다.
- 세금/환불/인보이스 정책이 판매 국가와 맞다.
- paywall/upgrade/cancel/churn survey 흐름이 제품 분석 이벤트와 연결된다.
- coupon/referral/failed payment recovery의 1차 포함 여부가 명확하다.
