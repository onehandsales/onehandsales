# 12 Billing Subscription Tax

상태: Draft Slot
순서: 12
성격: 마지막 판매 묶음 검토 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

Global B2C 실제 판매를 위해 가격/플랜, trial, paywall, 구독 상태, entitlement, AI 사용량 제한, 결제 provider, coupon/referral, churn survey, 환불, 영수증/인보이스, 세금/컴플라이언스 기준을 만든다.

## 2. 현재 상태

- public pricing page는 있다.
- 결제/구독 Backend, entitlement, webhook, invoice/tax 기능은 없다.
- Admin subscription route는 redirect 상태다.
- paywall, upgrade modal, coupon, referral, churn survey, failed payment recovery는 구현되어 있지 않다.

## 3. 착수 전 해야 할 일

추천 결정:

- Global B2C는 Merchant of Record를 우선 검토한다.
- Stripe 직접 결제는 세금, 환불, 인보이스 운영 부담이 커서 2순위로 둔다.
- 판매 rollout은 한국/KRW 유료 검증, 일본/대만 확장, 영어권 확장 순서로 둔다.
- plan, entitlement, paywall은 단순하게 시작한다.
- AI 사용량 limit은 plan에 포함한다.
- 가격 수치는 PRD의 월 5,900~6,900원 가설을 출발점으로 둔다.
- failed payment grace period, refund, chargeback, invoice/tax 정책은 11 Admin 운영과 연결한다.

1. Merchant of Record를 우선 검토하고 Stripe 직접 결제는 2순위로 둔다.
2. 가격 수치는 PRD의 월 5,900~6,900원 가설을 출발점으로 두고, provider 수수료/세금 반영 후 12 confirmed 문서에서 확정한다.
3. entitlement와 AI 사용량 제한은 plan에 포함한다.
4. paywall/upgrade는 첫 판매 기본 흐름에 포함하고, coupon/referral/churn survey는 09 분석 실험과 연결해 1차 포함 범위를 정한다.
5. 환불, chargeback, failed payment recovery, invoice/tax 운영 범위를 정한다.
6. Admin 운영 범위와 연결한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
