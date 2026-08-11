# Execution Gates

상태: Draft

## 1. 결론

Paddle 구현은 지금 시작하지 않는다. 아래 gate가 닫힌 뒤에만 API, DB, FE, Admin 구현을 confirmed 작업으로 승격한다.

## 2. Gate 목록

| Gate | 닫히는 기준 |
| --- | --- |
| G1. Product maintenance | 기존 1~11 기능의 유지보수, 핵심 버그, UX/UI 상품성 개선 항목이 정리된다. |
| G2. Beta operation | 100명 베타 테스터에게 결제 없이 제공하고 실제 사용 데이터를 수집한다. |
| G3. Paid value | 어떤 기능이 유료 전환을 만들지 확인한다. |
| G4. Pricing | 무료/유료, 월간/연간, trial, 가격, 국가/통화 rollout을 결정한다. 기존 월 5,900~6,900원은 출발 가설로만 둔다. |
| G5. Entitlement | plan별 기능 제한, AI 사용량 제한, reset, grace period를 결정한다. |
| G6. Policy | 약관, 개인정보, 환불, invoice, tax, chargeback, failed payment 정책을 정한다. |
| G7. Paddle account | Paddle 판매자 정보, 상품 category, sandbox, business type, 정산 정보, 심사 준비를 끝낸다. |
| G8. Implementation spec | API, DB, FE, Admin, webhook, analytics event를 confirmed spec으로 승격한다. |

## 3. Paddle 계정/onboarding 기준

- 판매 category는 `Digital products or SaaS`를 기본값으로 둔다.
- `Paddle Billing`은 결제/구독 운영 콘솔이다.
- `ProfitWell Metrics`는 결제 이후 revenue analytics 용도이며, 결제 구현의 필수 선행이 아니다.
- business type은 실제 법적 상태를 따른다. 개인이면 `Individual`, 비상장 법인이면 `Private`, 상장 법인이면 `Public`이다.
- 주소/정산/세금 정보는 실제 판매자 정보와 일치해야 하며, screenshot 공유 시 개인정보 노출을 피한다.

## 3A. Rollout 기준 후보

- 1차 후보: 한국/KRW 유료 검증
- 2차 후보: 일본/대만 확장
- 3차 후보: 영어권 확장

이 순서는 기존 12번 draft의 rollout 후보를 보존한 것이다. 실제 Paddle product/price/currency 설정은 베타 피드백과 가격 결정 후 확정한다.

## 4. 구현 착수 시 첫 작업 순서 후보

1. Paddle sandbox project/product/price를 만든다.
2. 내부 plan code와 Paddle price id mapping을 확정한다.
3. webhook signature/idempotency 설계를 먼저 만든다.
4. checkout session 생성 API와 subscription 조회 API를 만든다.
5. Paddle webhook으로 subscription snapshot을 동기화한다.
6. User Web settings billing과 checkout/portal 진입을 연결한다.
7. entitlement와 AI usage limit을 연결한다.
8. Admin billing event/subscription 조회를 연결한다.

## 5. 구현 착수 전 금지

- checkout-only spike를 production UX에 붙이지 않는다.
- plan/entitlement 없이 결제 provider부터 붙이지 않는다.
- Paddle live 결제를 sandbox 검증 없이 열지 않는다.
- provider webhook 없이 FE success 화면만 믿고 subscription을 부여하지 않는다.
- refund, failed payment, canceled 상태 정책 없이 access control을 만들지 않는다.
