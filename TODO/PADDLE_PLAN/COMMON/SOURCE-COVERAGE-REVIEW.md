# Source Coverage Review

상태: Review / Reflected
검토일: 2026-08-11

## 1. 결론

`TODO/PADDLE_PLAN`에는 기존 `12_BILLING_SUBSCRIPTION_TAX`의 실행 후보가 이관되어 있고, `PRE12_FOLLOWUP_RECHECK`의 billing-blocked 항목도 반영되어 있다.

추가 검토 결과, `GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON`, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`에는 결제 구현 후보 자체뿐 아니라 첫 판매 gate, 기존 구현 완료 범위, Admin/analytics 제외 범위, UX/UI productization 순서가 흩어져 있었다. 이 문서들은 `SOURCE-COVERAGE-REVIEW.md`, `BACKLOG-PRODUCTIZATION-EXTRACT.md`, `SCOPE.md`, `BE-TODO/*`, `FE-TODO/*`에 보강했다.

단, 모든 문장을 기계적으로 복사하지는 않는다. Paddle Plan은 결제/구독/세금/entitlement/paywall/AI usage billing source와 직접 연결되는 내용만 보존한다. SMS provider, calendar strategy, generic export, backup drill, PWA/native, B2B tenant admin처럼 billing과 직접 연결되지 않는 post-12 seed는 Paddle Plan 범위가 아니다.

## 2. 원천별 반영 상태

| 원천 | 반영 상태 | Paddle Plan 위치 |
| --- | --- | --- |
| `12_BILLING_SUBSCRIPTION_TAX` | 반영 완료. 기존 draft를 post-beta Paddle plan으로 재작성했고 원래 위치에는 이관 안내만 남겼다. | `README.md`, `COMMON/SCOPE.md`, `BE-TODO/*`, `FE-TODO/*` |
| `GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md` | 12가 원래 마지막 판매 묶음이고, Admin은 11 완료/결제는 제외, Trust/policy gate와 연결된다는 맥락을 반영했다. | `README.md`, `COMMON/SCOPE.md`, `COMMON/EXECUTION-GATES.md` |
| `GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON` | first-sale gate, MoR 우선, Stripe fallback, 09 analytics reserved billing, 11 Admin 제외, post-12 review 흐름을 billing 관련 범위만 반영했다. | `COMMON/SCOPE.md`, `COMMON/EXECUTION-GATES.md`, `COMMON/BACKLOG-PRODUCTIZATION-EXTRACT.md` |
| `PRE12_FOLLOWUP_RECHECK` | `PRE12-F12`, `F20`, `F21`, `F26`, `F35`, `F41`을 Paddle Plan dependency로 이관했다. pre-12 closeout 완료 항목은 Paddle 구현 범위로 넣지 않았다. | `COMMON/PRE12-DEPENDENCY-MAP.md` |
| `NEXT_BACKEND_API_BACKLOG_PLAN` | Payment/subscription 없음, billing/paywall/churn reserved taxonomy, 11 Admin Billing 제외, 실제 billing runtime event 후속을 반영했다. | `COMMON/BACKLOG-PRODUCTIZATION-EXTRACT.md`, `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md` |
| `USER_WEB_PRODUCTIZATION_GAP_PLAN` | public pricing은 있으나 결제 없음, settings billing UX 미구현, first-sale gate, final service shape, Billing Admin redirect/제외 범위를 반영했다. | `COMMON/BACKLOG-PRODUCTIZATION-EXTRACT.md`, `FE-TODO/USER-WEB-TODO.md` |

## 3. 반영된 핵심 결정

- 결제 구현은 지금 시작하지 않는다.
- UX/UI 유지보수와 기능 유지보수 후 100명 베타 테스트를 먼저 진행한다.
- 베타 후 가격/플랜/entitlement/AI 사용량 제한/trial/refund/failed payment/tax/invoice 정책을 확정한다.
- 기존 PRD의 월 5,900~6,900원은 확정 가격이 아니라 post-beta pricing 출발 가설로만 유지한다.
- 판매 rollout은 KR/US/CA 우선 시장 결정에 따라 한국/KRW, 미국/USD, 캐나다/CAD 또는 USD 순서를 후보로 두되 post-beta에 다시 확정한다. 일본/영국/싱가포르/호주는 보류 확장 후보로 유지한다.
- Paddle은 Merchant of Record 우선 후보이며 Stripe 직접 결제는 fallback이다.
- Paddle Billing은 결제/구독 구현 콘솔이고 ProfitWell Metrics는 revenue analytics다.
- checkout-only 구현은 금지한다.
- 09 Product Analytics의 billing/paywall/churn event는 reserved taxonomy일 뿐 runtime source가 아니다.
- 11 Admin Operation은 완료됐지만 Billing Admin, subscription/payment/refund/invoice 운영은 제외됐다.
- account deletion, paid recovery, marketing opt-in은 billing/privacy/growth policy 없이는 따로 구현하지 않는다.

## 4. 의도적으로 제외한 내용

| 제외 내용 | 이유 |
| --- | --- |
| PRE12의 post-12 seed 전체 | billing과 직접 연결되지 않는 후보가 많아 Paddle Plan에 넣지 않는다. |
| backup/restore drill | 운영 절차 후보이며 결제 구현 범위가 아니다. |
| SMS 실제 provider | 국가/비용/provider 정책 후속이며 Paddle Billing 범위가 아니다. |
| calendar write/sync/watch strategy | 별도 calendar strategy 후보이다. |
| PWA/native packaging | mobile roadmap 후보이며 billing 구현 범위가 아니다. |
| B2B tenant admin | 다중 조직 billing과 연결될 수 있지만 현재 우선순위는 Global B2C 개인 사용자다. |

## 5. 검토 결과

현재 `PADDLE_PLAN`은 결제 관련 관점에서는 원천 문서들의 핵심 내용을 반영했다. 앞으로 기존 세 계획을 DONE 처리할 때는 "Global B2C 1~11과 PRE12 closeout은 완료, Billing/Paddle은 `TODO/PADDLE_PLAN`으로 이관되어 UX/UI 유지보수와 100명 베타 이후 post-beta에 실행"이라는 문구로 닫는 것이 맞다.
