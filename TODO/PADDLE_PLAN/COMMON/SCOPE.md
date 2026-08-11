# Scope

상태: Deferred / Candidate

## 1. 범위 원칙

이 문서는 Paddle/Billing 구현 후보를 보존하기 위한 범위 문서다. 현재 상태에서는 구현 지시가 아니다.

Paddle 구현은 UX/UI 유지보수와 100명 베타 테스트 이후, 가격/플랜/권한/정책 의사결정이 끝났을 때 confirmed scope로 다시 승격한다.

## 2. 포함 후보

| 항목 | 내용 |
| --- | --- |
| Pricing/plan | 무료 베타 이후 유료 플랜, 월간/연간, trial, 국가/통화 rollout, Paddle price mapping. 기존 PRD의 월 5,900~6,900원은 확정 가격이 아니라 출발 가설로만 둔다. |
| Subscription | trialing, active, past_due, paused, canceled 등 Paddle 구독 상태와 내부 상태 mapping |
| Paddle Checkout | localized checkout, 결제수단, Apple Pay/local payment method, overlay 또는 hosted checkout 선택 |
| Customer portal | 결제수단 변경, 구독 변경/취소, 영수증 확인을 Paddle portal로 처리할지 결정 |
| Entitlement | plan별 기능 제한, AI 사용량 제한, quota reset 기준 |
| Paywall/upgrade | 무료 제한 초과, AI 사용량 초과, 유료 기능 접근 시 upgrade 흐름 |
| Tax/invoice | Paddle Merchant of Record 기준의 VAT/GST/판매세, 영수증/인보이스, 보관 정책 |
| Webhook | Paddle transaction/subscription/customer/event 상태 동기화 |
| Failed payment recovery | 결제 실패, 카드 만료, dunning, grace period, 기능 제한 전환 |
| Refund/chargeback | 환불 요청, chargeback, 증빙, Admin 운영 기준 |
| Billing Admin sync | Admin 운영 화면에서 구독/결제/환불/failed payment 상태를 어디까지 볼지 결정 |
| Coupon/referral | 첫 유료 전환 이후 growth 실험 후보. 첫 구현 필수 여부는 post-beta에서 결정 |
| Churn survey | cancel 또는 downgrade 시 해지 사유 수집 후보. 09 analytics와 연결 여부 결정 |
| Marketing consent | billing lifecycle email과 marketing/growth communication consent 경계 |

## 2A. Global B2C source context

| 원천 맥락 | Paddle Plan 반영 |
| --- | --- |
| 첫 판매는 기능 수가 아니라 결제, 운영, 신뢰, 현지화, 분석이 연결된 상태로 판단한다. | Paddle 구현 gate에 Product maintenance, Beta validation, Pricing, Entitlement, Policy를 둔다. |
| 08은 글로벌 데이터 기본값을 닫았지만 국가별 tax/terms/pricing/address validation은 닫지 않았다. | Paddle 구현 전 billing address, tax profile, 국가/통화/가격 rollout을 다시 결정한다. |
| 09는 Product Analytics foundation을 닫았지만 billing/paywall/churn runtime event는 reserved taxonomy로만 남겼다. | paid conversion/churn/ARPU/ProfitWell 연결은 Paddle source event 이후로 둔다. |
| 11은 Admin 운영을 닫았지만 Billing Admin, 구독/결제 운영, Admin 직접 유료 복구는 제외했다. | Admin subscription, billing event, refund/chargeback, paid recovery는 Paddle confirmed scope에서 다시 판단한다. |
| Trust/policy first-sale gate는 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, retention과 연결된다. | Paddle 정책 gate에서 invoice/tax 보관, account deletion/anonymization, refund/chargeback 충돌을 먼저 해결한다. |

## 3. 제외 후보

| 항목 | 이유 |
| --- | --- |
| 베타 전 결제창 | 가격/플랜/권한이 미정이면 checkout만 붙여도 재작업 가능성이 크다. |
| 복잡한 enterprise contract | 현재 우선순위는 Global B2C 개인 사용자다. |
| 다중 조직 billing | B2B tenant/org/member/role 정책 이후 별도 판단한다. |
| 완전 자동 growth automation | 09 제품 분석과 베타 데이터 이후 실험으로 다룬다. |
| 자체 세금 엔진 | Paddle을 쓰는 이유는 MoR 기반 세금/인보이스/compliance 부담을 줄이기 위함이다. |
| billing과 무관한 post-12 seed | SMS provider, calendar strategy, generic export, backup drill, PWA/native, B2B tenant admin 등은 별도 TODO에서 다룬다. |

## 4. 구현 전 확인 질문

- 실제 첫 유료 상품은 개인 사용자용 단일 플랜인가, 여러 플랜인가?
- 무료 베타 종료 후 free plan을 유지할 것인가, trial만 둘 것인가?
- trial은 결제 정보 선입력 방식인가, 미입력 방식인가?
- 월간/연간 가격과 할인율은 어떻게 둘 것인가?
- 한국/KRW부터 시작할 것인가, 처음부터 글로벌 통화와 현지화를 열 것인가?
- AI 사용량은 어떤 단위로 제한할 것인가?
- AI 사용량 reset은 월 단위인가, 결제 주기 기준인가?
- Paddle을 source-of-truth로 두고 내부 DB는 snapshot/cache로 둘 것인가?
- past_due 상태에서 어느 기능까지 허용할 것인가?
- 환불/chargeback 시 사용자 access와 Admin audit은 어떻게 처리할 것인가?
- account deletion과 invoice/tax 보관 의무가 충돌할 때 어떤 정책을 적용할 것인가?

## 5. 완료 기준 초안

confirmed scope로 승격된 뒤의 완료 기준은 아래를 기본값으로 둔다.

- 사용자가 plan을 보고 checkout으로 진입할 수 있다.
- Paddle webhook으로 내부 subscription 상태가 idempotent하게 동기화된다.
- 사용자는 billing portal 또는 설정 화면에서 구독 상태를 확인하고 관리할 수 있다.
- entitlement와 AI 사용량 제한이 API와 FE에 일관되게 반영된다.
- failed payment, refund, canceled, past_due 상태의 접근 정책이 명확하다.
- 세금/환불/인보이스/개인정보 보관 정책이 Trust/policy gate와 연결된다.
- Admin에서 필요한 billing 상태와 webhook 처리 이력을 확인할 수 있다.
