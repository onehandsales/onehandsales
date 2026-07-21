# 09 Product Analytics

상태: Draft Slot
순서: 09
성격: 기능 구현 전 검토 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

가입, 활성화, 핵심 기능 사용, 리텐션, AI 사용량, 유료 전환을 측정해 Global B2C 판매와 Series A급 제품 판단에 필요한 데이터 기반을 만든다. Paywall, trial, coupon, referral, churn survey 같은 성장 실험은 이 슬롯에서 분석 기준을 먼저 정의하고 12 Billing 슬롯과 연결한다.

## 2. 현재 상태

- 제품 분석 정본은 없다.
- activation, retention, paid conversion, churn, AI cost/user 추적이 없다.
- Admin analytics route는 redirect 상태다.
- paywall/coupon/referral/churn survey 실험 체계는 없다.

## 3. 착수 전 해야 할 일

추천 결정:

- 자체 DB event log와 allowlist event taxonomy로 시작한다.
- activation 기준은 `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결`이다.
- client event는 UX 행동 보조, server event는 과금/핵심 정본으로 본다.
- PII는 저장하지 않고 retention을 둔다.
- billing/paywall 이벤트는 12 Billing 슬롯과 연결한다.

1. allowlist event taxonomy를 정의한다.
2. activation 기준은 `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결`로 둔다.
3. client event는 UX 행동 보조, server event는 과금/핵심 정본으로 나눈다.
4. 자체 DB event log로 시작하고, 개인정보와 분석 데이터 보관 정책을 정한다.
5. 결제/구독 이전에 필요한 paywall/trial/coupon/referral/churn survey 실험 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
