# 09 Product Analytics

상태: Draft Slot
순서: 09
성격: 기능 구현 전 검토 슬롯

## 1. 목적

가입, 활성화, 핵심 기능 사용, 리텐션, AI 사용량, 유료 전환을 측정해 Global B2C 판매와 Series A급 제품 판단에 필요한 데이터 기반을 만든다. Paywall, trial, coupon, referral, churn survey 같은 성장 실험은 이 슬롯에서 분석 기준을 먼저 정의하고 12 Billing 슬롯과 연결한다.

## 2. 현재 상태

- 제품 분석 정본은 없다.
- activation, retention, paid conversion, churn, AI cost/user 추적이 없다.
- Admin analytics route는 redirect 상태다.
- paywall/coupon/referral/churn survey 실험 체계는 없다.

## 3. 착수 전 해야 할 일

1. event taxonomy를 정의한다.
2. client/server event 수집 범위를 나눈다.
3. 개인정보와 분석 데이터 보관 정책을 정한다.
4. 외부 analytics provider를 쓸지 자체 table로 시작할지 결정한다.
5. 결제/구독 이전에 필요한 paywall/trial/coupon/referral/churn survey 실험 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
