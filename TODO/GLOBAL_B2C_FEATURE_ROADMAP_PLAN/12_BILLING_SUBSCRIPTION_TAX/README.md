# 12 Billing Subscription Tax

상태: Draft Slot
순서: 12
성격: 마지막 판매 묶음 검토 슬롯

## 1. 목적

Global B2C 실제 판매를 위해 가격/플랜, trial, paywall, 구독 상태, entitlement, AI 사용량 제한, 결제 provider, coupon/referral, churn survey, 환불, 영수증/인보이스, 세금/컴플라이언스 기준을 만든다.

## 2. 현재 상태

- public pricing page는 있다.
- 결제/구독 Backend, entitlement, webhook, invoice/tax 기능은 없다.
- Admin subscription route는 redirect 상태다.
- paywall, upgrade modal, coupon, referral, churn survey, failed payment recovery는 구현되어 있지 않다.

## 3. 착수 전 해야 할 일

1. Stripe 직접 결제와 Merchant of Record 중 방향을 결정한다.
2. 판매 국가, 가격, trial, plan 제한을 정한다.
3. entitlement와 AI 사용량 제한 기준을 정한다.
4. paywall, upgrade, coupon, referral, churn survey를 첫 판매 범위에 넣을지 결정한다.
5. 환불, chargeback, failed payment recovery, invoice/tax 운영 범위를 정한다.
6. Admin 운영 범위와 연결한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
