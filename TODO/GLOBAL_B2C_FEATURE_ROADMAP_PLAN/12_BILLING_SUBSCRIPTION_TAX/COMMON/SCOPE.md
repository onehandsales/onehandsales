# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| Pricing/plan | 무료체험, 월간/연간 개인 plan, 한국/KRW 유료 검증 가격 가설 |
| Subscription | trialing, active, past_due, canceled |
| Entitlement | 기능 제한, AI 사용량 제한 |
| Paywall/upgrade | 무료 제한 초과, AI 사용량 초과, 유료 기능 접근 시 upgrade 흐름 |
| Payment provider | Merchant of Record 우선, Stripe 직접 결제 fallback |
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

## 구현 전 세부 확인 질문

- 판매 rollout은 한국/KRW 유료 검증, 일본/대만 확장, 영어권 확장 순서로 둔다.
- 결제 provider는 Merchant of Record를 우선 검토하고 Stripe 직접 결제는 2순위로 둔다.
- 가격 수치는 PRD의 월 5,900~6,900원 가설을 출발점으로 두고, free trial 기간과 결제 정보 선입력 여부는 12 confirmed 문서에서 확정한다.
- AI 사용량 제한과 reset 기준은 plan에 포함한다.
- coupon/referral은 09 분석 실험과 연결해 첫 판매 전 기본 모델만 둘지, 출시 후 실험으로 넘길지 정한다.
- cancel/downgrade 시 churn survey는 09 churn 분석과 연결해 필수/선택 여부를 정한다.
- 결제 실패 후 grace period와 기능 제한 전환 시점은?
- refund/chargeback 운영을 Admin에서 어디까지 처리할지?

## 완료 기준 초안

- 사용자가 plan을 선택하고 구독 상태를 확인할 수 있다.
- 결제 provider webhook으로 subscription 상태가 동기화된다.
- entitlement가 API와 FE에 반영된다.
- 세금/환불/인보이스 정책이 판매 국가와 맞다.
- paywall/upgrade/cancel/churn survey 흐름이 제품 분석 이벤트와 연결된다.
- coupon/referral/failed payment recovery의 1차 포함 여부가 명확하다.
