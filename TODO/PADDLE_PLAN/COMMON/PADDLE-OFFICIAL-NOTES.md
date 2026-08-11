# Paddle Official Notes

상태: 사용자 제공 Paddle 공식 홈페이지 내용 정리

## 1. Paddle의 포지션

Paddle은 단순 카드 결제 PG가 아니라 SaaS와 디지털 제품 판매자를 위한 recurring billing 플랫폼이다. 결제, 구독 관리, checkout, tax compliance, fraud protection, invoice, revenue analytics, customer portal을 한 플랫폼에서 제공하는 방향이다.

핵심 차이는 Merchant of Record 구조다. Paddle이 판매자 대신 결제 처리, 세금 계산/신고/납부, fraud/chargeback 대응, 일부 back-office 부담을 맡는다는 점이 일반 payment service provider와 다르다.

## 2. 주요 기능 요약

| 영역 | 공식 설명상 핵심 |
| --- | --- |
| Subscription billing | proration, credits, seats, one-time purchase, pause/reactivate, customer portal |
| Checkout | localized language/currency, branded checkout, Apple Pay/local payment methods, overlay checkout |
| Payments | multiple payment methods, payment routing, local acquiring, acceptance rate 개선 |
| Tax compliance | 100+ jurisdictions에서 sales tax/VAT 계산, 신고, 납부 |
| Fraud protection | card attack, chargeback, fraud screening, 3D Secure 2 |
| Invoicing | B2B invoice 생성/발송, recurring invoice, payment reconciliation |
| Analytics | ProfitWell Metrics, MRR/churn/retention/NRR/cohort/reporting |
| Compliance | SOC 2 Type 2, GDPR, PCI-DSS SAQ A, CCPA 언급 |

## 3. onehand.sales에 주는 의미

- 글로벌 B2C SaaS라면 Paddle은 결제창보다 운영 부담 절감 효과가 더 크다.
- 세금/인보이스/환불/chargeback을 직접 운영하지 않아도 되는 점이 가장 큰 장점이다.
- 한국/KRW 검증 후 일본/대만/영어권 확장을 고려하는 로드맵과 맞는다.
- 단, plan/가격/권한이 확정되지 않은 상태에서는 Paddle을 붙여도 상품성이 올라가지 않는다.
- 따라서 베타 전에는 Paddle 문서 정리와 계정 준비까지만 하고, 실제 구현은 post-beta로 둔다.

## 4. Paddle Billing과 ProfitWell Metrics 구분

| 항목 | 의미 | 지금 우선순위 |
| --- | --- | --- |
| Paddle Billing | 상품, 가격, checkout, 고객, 구독, invoice, webhook, tax, refund를 다루는 결제/구독 운영 영역 | 결제 구현 시 필수 |
| ProfitWell Metrics | MRR, churn, retention, NRR, cohort 등 revenue analytics | 실제 결제 데이터가 생긴 뒤 유용 |

로그인 후 둘이 나뉘어 보이면 결제 구현은 `Paddle Billing`에서 시작한다. `ProfitWell Metrics`는 분석 도구로 이해한다.

## 5. 주의점

- Paddle은 SaaS와 digital products에 맞는 서비스다. 물리 상품, 금융, 도박, marketplace, 일부 human services는 제한이 있거나 심사가 까다롭다.
- `onehand.sales`는 `Digital products or SaaS` category가 기본 후보로 보인다.
- 결제 수수료와 고정 fee가 있으므로 저가 월 구독은 가격 민감도가 크다.
- Paddle 공식 내용은 구현 착수 시점에 다시 확인해야 한다. payment method, 지원 국가, 수수료, 정책은 바뀔 수 있다.
