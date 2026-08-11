# PRE12 Dependency Map

상태: 이관됨 / Deferred
원천: `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`

## 1. 목적

PRE12에서 `billing 충돌 / 12 종속`으로 분류된 항목을 `TODO/PADDLE_PLAN`으로 이관한다.

이 항목들은 1~11 미완성으로 보지 않는다. Paddle/Billing 의사결정 없이는 구현 기준을 확정할 수 없으므로, 베타 이후 결제 계획에서 다시 판단한다.

## 2. 이관 항목

| 후보 | Paddle Plan에서 다룰 이유 |
| --- | --- |
| `PRE12-F12` | plan, subscription, entitlement, payment, invoice, refund, failed payment, tax, paywall, churn, paid conversion, AI usage billing source-of-truth 자체가 Paddle/Billing 핵심 범위다. |
| `PRE12-F20` | USD cent/minor unit과 amount precision은 money model, Paddle price, invoice/tax 표시, 기존 금액 migration과 연결된다. |
| `PRE12-F21` | 국가별 주소 검증, tax, terms, pricing policy는 billing address, tax profile, 약관/환불/인보이스 정책과 연결된다. |
| `PRE12-F26` | account deletion 실제 hard delete/anonymization은 subscription 상태, 환불/chargeback, invoice/tax 보관, AI/follow-up 영구 로그 retention과 충돌한다. |
| `PRE12-F35` | Admin 직접 Trash 복구, 유료 복구, hard delete/purge는 paid recovery, refund, audit, recovery policy와 연결된다. |
| `PRE12-F41` | marketing opt-in/communication consent는 growth, churn, billing lifecycle communication, privacy consent audit와 연결된다. |

## 3. 재분류 기준

Paddle 구현 시점에는 위 항목을 아래처럼 다시 분류한다.

| 분류 | 예시 |
| --- | --- |
| Billing core | `PRE12-F12`, 일부 `PRE12-F20`, 일부 `PRE12-F21` |
| Trust/policy | `PRE12-F26`, 일부 `PRE12-F21` |
| Admin/recovery | `PRE12-F35` |
| Growth/compliance | `PRE12-F41`, coupon/referral/churn survey |

## 4. 지금 금지

- 위 항목을 Global B2C 1~11 미완성으로 되돌리지 않는다.
- `PRE12_FOLLOWUP_RECHECK`를 다시 열어 구현 작업으로 바꾸지 않는다.
- Paddle confirmed scope 없이 임시 API, DB, FE를 만들지 않는다.
- account deletion, paid recovery, marketing opt-in을 billing 정책 없이 따로 구현하지 않는다.
