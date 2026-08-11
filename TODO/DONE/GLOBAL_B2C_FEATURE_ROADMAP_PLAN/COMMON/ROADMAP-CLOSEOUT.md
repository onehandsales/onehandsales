# Roadmap Closeout

상태: Final / DONE
작성일: 2026-08-11

## 1. 결론

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`은 DONE으로 닫는다.

닫는 의미는 "서비스 전체가 결제까지 완성됐다"가 아니다. 의미는 아래와 같다.

- Global B2C 01~11 기능 선구현 로드맵은 완료됐다.
- PRE12 후속 재대조와 BEFORE_12 closeout은 완료됐다.
- 결제/구독/세금/Paddle 작업은 `TODO/PADDLE_PLAN`으로 이관됐다.
- 다음 active direction은 기능 유지보수, UX/UI 상품성 개선, 100명 베타 테스트다.

## 2. 이관된 범위

| 범위 | 새 위치 |
| --- | --- |
| Paddle Billing/Checkout | `TODO/PADDLE_PLAN` |
| plan/subscription/entitlement | `TODO/PADDLE_PLAN` |
| AI usage billing source-of-truth | `TODO/PADDLE_PLAN` |
| tax/invoice/refund/chargeback | `TODO/PADDLE_PLAN` |
| failed payment recovery | `TODO/PADDLE_PLAN` |
| Billing Admin | `TODO/PADDLE_PLAN` |
| billing-linked analytics | `TODO/PADDLE_PLAN` |
| PRE12 billing-blocked 항목 | `TODO/PADDLE_PLAN/COMMON/PRE12-DEPENDENCY-MAP.md` |

## 3. 남은 후보 처리

| 후보 성격 | 처리 |
| --- | --- |
| 결제 관련 | `TODO/PADDLE_PLAN`에서 post-beta에 confirmed로 승격 |
| UX/UI 상품성 | 별도 유지보수/UXUI 계획에서 진행 |
| 기능 버그/품질 보정 | 별도 유지보수 계획 또는 명시적 bugfix goal |
| PRE12 non-billing seed | 필요성이 확인되면 새 TODO 폴더 |

## 4. 금지

- 이 폴더에서 새 결제 API/DB/FE 구현 계획을 만들지 않는다.
- `12_BILLING_SUBSCRIPTION_TAX`를 다시 active next 작업으로 되돌리지 않는다.
- 완료된 01~11 폴더를 후속 기능 구현 목적으로 재개하지 않는다.
- checkout-only 구현으로 Paddle 작업을 앞당기지 않는다.
