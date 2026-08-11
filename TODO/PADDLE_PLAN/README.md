# Paddle Plan

상태: Deferred / Draft
원천: `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`에서 이관
작성 기준: 2026-08-11 결제 작업 순서 변경 결정

## 1. 목적

이 폴더는 `onehand.sales`의 구독 결제, Paddle Billing, 세금/인보이스, 환불, 구독 상태, entitlement, paywall, AI 사용량 제한 정책을 베타 이후에 다시 실행하기 위한 결제 전용 계획이다.

기존 Global B2C 로드맵의 12번 작업은 더 이상 다음 즉시 실행 작업이 아니다. 현재 순서는 기능 유지보수, UX/UI 상품성 개선, 100명 베타 테스트, 피드백 반영, 가격/플랜/권한 정책 확정, Paddle 구현 순서로 둔다.

## 2. 현재 결정

- Paddle은 우선 검토 대상이다. 이유는 Merchant of Record 구조로 결제, 구독, 세금, 인보이스, 환불/chargeback, fraud, checkout, customer portal, revenue analytics까지 한 플랫폼에서 다룰 수 있기 때문이다.
- Stripe 직접 결제는 2순위 fallback으로 둔다. 직접 결제는 세금, 인보이스, 환불, chargeback, 국가별 compliance 운영 부담이 커진다.
- 지금은 결제창만 붙이는 작업도 하지 않는다. plan, 가격, trial, entitlement, AI 사용량 제한, 환불/해지/failed payment 정책이 미확정이면 checkout-only 구현도 곧 버릴 가능성이 높다.
- 베타는 결제창 없이 제공한다. 100명 베타 피드백으로 상품성, 핵심 사용 흐름, 플랜별 가치 차이를 검증한 뒤 결제를 붙인다.

## 3. 실행 전제

Paddle 구현은 아래 조건이 충족된 뒤 시작한다.

| Gate | 조건 |
| --- | --- |
| Product maintenance | 기존 1~11 기능의 유지보수, 버그 수정, UX/UI 상품성 개선이 먼저 정리되어야 한다. |
| Beta validation | 100명 베타 테스터에게 결제 없이 제공하고 반복 사용, 이탈 지점, 유료 전환 후보 기능을 확인해야 한다. |
| Pricing decision | 무료/유료, 월간/연간, trial, 가격, 국가/통화 rollout 기준이 정해져야 한다. |
| Entitlement decision | plan별 기능 제한, AI 사용량 제한, reset 기준, paywall 기준이 정해져야 한다. |
| Policy decision | 약관, 개인정보, 환불, 세금, 인보이스, chargeback, failed payment grace period가 정해져야 한다. |
| Paddle readiness | Paddle 계정, 사업자/개인 판매자 정보, 상품 category, sandbox, webhook, checkout 방식이 준비되어야 한다. |

## 4. 문서 구조

| 문서 | 역할 |
| --- | --- |
| `COMMON/SCOPE.md` | Paddle/Billing 포함 범위와 제외 범위 |
| `COMMON/EXECUTION-GATES.md` | 구현 시작 전 결정해야 할 gate |
| `COMMON/PADDLE-OFFICIAL-NOTES.md` | 사용자가 제공한 Paddle 공식 홈페이지 내용 정리 |
| `COMMON/PRE12-DEPENDENCY-MAP.md` | PRE12에서 billing 때문에 보류된 항목 이관표 |
| `COMMON/SOURCE-COVERAGE-REVIEW.md` | 12/Common/PRE12/NEXT/USER 문서의 결제 관련 내용 반영 검토 |
| `COMMON/BACKLOG-PRODUCTIZATION-EXTRACT.md` | NEXT Backend와 User Web productization 문서의 결제 관련 후보 추출 |
| `COMMON/REFERENCES.md` | 참조 문서와 코드 위치 |
| `BE-TODO/API-TODO.md` | Backend API 후보 |
| `BE-TODO/DB-SCHEMA.md` | DB schema 후보 |
| `FE-TODO/USER-WEB-TODO.md` | User Web 후보 |

## 5. 현재 금지

- 베타 전 Paddle checkout 구현 금지
- 베타 전 결제 webhook/API/DB migration 구현 금지
- 베타 전 AI 사용량 제한을 billing source-of-truth로 연결 금지
- 베타 전 plan/paywall/upgrade modal을 임시 UX로 고정 금지
- Paddle live 결제 활성화 금지
- `ProfitWell Metrics`를 결제 구현의 필수 선행으로 착각하지 않는다. 결제 구현의 중심은 `Paddle Billing`이다.

## 6. 다음에 할 일

이 폴더의 다음 작업은 구현이 아니라 post-beta decision 정리다.

1. 베타 피드백을 기준으로 유료 플랜 가설을 다시 쓴다.
2. plan별 entitlement와 AI 사용량 제한을 확정한다.
3. Paddle product/price/checkout/customer portal/webhook 설계를 확정한다.
4. Backend API, DB schema, User Web, Admin 운영 범위를 confirmed 문서로 승격한다.
5. 그때부터 Paddle Billing 구현을 시작한다.
