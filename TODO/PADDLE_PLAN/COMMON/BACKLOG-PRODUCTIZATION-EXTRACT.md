# Backlog And Productization Extract

상태: Extract / Deferred
원천:
- `TODO/DONE/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/DONE/USER_WEB_PRODUCTIZATION_GAP_PLAN`

## 1. 목적

NEXT Backend와 User Web Productization 문서에 남아 있는 결제/구독/세금/상품화 관련 내용을 Paddle Plan에 연결한다.

이 문서는 구현 지시가 아니다. 기존 backlog/productization 문서를 DONE 처리할 때 결제 관련 후속이 누락되지 않도록 보존하는 handoff 문서다.

## 2. NEXT Backend API Backlog에서 넘어온 항목

| 항목 | 현재 상태 | Paddle Plan 반영 |
| --- | --- | --- |
| Payment/subscription | Backend 구현 없음 | plan, entitlement, Paddle customer/subscription/transaction/webhook API 후보로 보존 |
| billing/paywall/churn runtime event | 09 runtime allowlist에 없음. reserved taxonomy로만 존재 | Paddle source event가 생긴 뒤 paid conversion/churn/ARPU event로 연결 |
| AI usage summary | `AiProviderCallLog` 기반 Admin 참고용 summary는 있음 | billing source-of-truth가 아니며, `AiUsageDaily`/`UsageMeter` 여부는 post-beta 결정 |
| Admin Operation | 11 완료. `/admin/api/*` 운영 API와 Admin Web 완료 | Billing Admin, subscription/payment/refund/invoice는 제외된 상태로 보존 |
| Admin paid recovery | User 복구 문의와 Admin queue는 완료 | 유료 복구 결제, hard delete/purge는 recovery policy와 Paddle 이후 판단 |
| Marketing opt-in | 09/10 완료 범위 아님 | billing lifecycle communication, growth, privacy consent 기준과 함께 판단 |
| Money precision | Product/Deal 금액은 기존 정수 정책 | Paddle money model, invoice/tax 표시, 기존 금액 migration 여부와 함께 판단 |
| Country tax/terms/pricing | 08 global data 기본 모델은 완료 | billing address, tax profile, 약관, 가격 정책은 Paddle gate에서 판단 |

## 3. User Web Productization에서 넘어온 항목

| 항목 | 현재 상태 | Paddle Plan 반영 |
| --- | --- | --- |
| Public pricing | public pricing page는 있음 | 실제 가격/플랜/trial/paywall 결정 후 post-beta에 재작성 |
| Payment/subscription UX | 없음 | 계정 모달 Settings 안의 Billing 후보, checkout, portal, subscription status 후보로 보존 |
| Settings/account/data | global settings, account deletion request, data export request는 구현됨 | billing status와 invoice/tax retention이 충돌하지 않도록 policy gate에서 확인 |
| Admin subscription route | redirect 상태 | Billing Admin 화면 후보 또는 Paddle portal/support 운영 기준으로 판단 |
| Product analytics | 09/10/11 foundation 완료 | paid conversion/churn/ARPU는 Paddle source event 연결 후 완성 |
| First-sale trust | 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, retention 필요 | Paddle policy gate로 연결 |
| Final service shape | 돈을 받고 운영할 수 있는 결제/운영/현지화/신뢰 계층 필요 | 베타 후 유료 상품 확정 시 Paddle 구현으로 연결 |
| UX/UI productization | 기능은 많지만 유료 제품처럼 읽히고 반복 사용되는지 점검 필요 | Paddle보다 먼저 기능 유지보수와 UX/UI 개선을 진행 |

## 4. Paddle 구현 시 다시 열 항목

| 묶음 | 다시 열 질문 |
| --- | --- |
| Pricing | 무료/유료, trial, 월간/연간, 가격, 국가/통화 rollout |
| Entitlement | plan별 기능, AI usage quota, reset, overage, paywall |
| Checkout | Paddle overlay/hosted checkout, localized checkout, payment methods |
| Subscription | active/past_due/canceled/paused 상태, cancel/downgrade 시점 |
| Tax/invoice | Paddle MoR 기준 내부 보관 범위, invoice 표시, tax metadata |
| Analytics | paid conversion, checkout started/completed, subscription started/canceled, churn survey |
| Admin/support | billing event 조회, refund/chargeback 운영, failed payment 문의 대응 |
| Trust/privacy | account deletion/anonymization과 invoice/tax retention 충돌 처리 |

## 5. DONE 처리 시 주의 문구

`NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 DONE으로 옮길 때는 아래 의미로 닫는다.

> 기존 Backend/User Web productization backlog의 1~11 관련 구현 및 closeout은 완료했다. 결제/구독/세금, Billing Admin, billing-linked analytics, payment recovery, pricing/plan/paywall/entitlement는 `TODO/PADDLE_PLAN`으로 이관했으며 UX/UI 유지보수와 100명 베타 이후 확정한다.
