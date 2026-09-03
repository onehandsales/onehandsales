# 030 Global B2C Closeout And Paddle Defer

Date: 2026-08-11
Updated: 2026-09-03

## Decision

`TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`과 `TODO/DONE/NEXT_BACKEND_API_BACKLOG_PLAN`은 완료된 archive로 본다.

Global B2C 01~11 기능 선구현 로드맵은 구현과 QA closeout 기준으로 닫았고, 기존 12 Billing/Subscription/Tax 작업은 즉시 구현하지 않는다. 결제/구독/세금/Paddle 관련 범위는 `TODO/PADDLE_PLAN`으로 분리해 Deferred / Draft 상태로 관리한다.

현재 다음 순서는 Paddle checkout 구현이 아니다.

1. 기존 01~11 기능 유지보수
2. UX/UI 상품성 개선
3. 결제창 없는 100명 베타 테스트
4. 베타 피드백 반영
5. 가격/플랜/entitlement/AI 사용량 제한/환불/세금/인보이스 정책 확정
6. Paddle Billing 구현 착수 여부와 범위 확정

단, 2026-09-03에 확정한 Mobile App 인증 foundation은 결제/CRM 신규 기능 확장이 아니라 네이티브 앱 기반을 여는 별도 범위다. 모바일 1차 범위는 로그인/회원가입, Backend 모바일 인증 세션, `/api/me` 확인, 최소 홈, 로그아웃으로 제한한다.

## Reason

구독 결제를 먼저 붙이면 가격, plan, trial, entitlement, AI 사용량 제한, 환불/해지/failed payment 정책이 바뀔 때 checkout, webhook, DB, User Web, Admin 운영 범위를 다시 고칠 가능성이 높다.

현재 제품은 대부분의 핵심 기능이 구현된 상태이므로, 결제창을 붙이는 것보다 유지보수와 UX/UI 개선으로 상품성을 높이고 100명 베타에서 실제 반복 사용과 유료 전환 후보 기능을 확인하는 것이 우선이다.

Paddle은 Merchant of Record 후보로 유지한다. 다만 `ProfitWell Metrics`는 분석 제품이고, 결제 구현의 중심은 `Paddle Billing`이다.

## Scope

완료 archive:

- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`
- `TODO/DONE/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/DONE/USER_WEB_PRODUCTIZATION_GAP_PLAN`

활성 보류 계획:

- `TODO/PADDLE_PLAN`

`TODO/PADDLE_PLAN`에는 다음 범위가 포함된다.

- Paddle Billing/Checkout
- subscription, plan, entitlement
- AI usage billing source-of-truth
- paywall, upgrade, trial
- tax, invoice, refund, chargeback
- failed payment recovery
- Billing Admin 연동
- billing-linked conversion/churn/ARPU

## Implementation Rule

베타 전에는 다음을 하지 않는다.

- Paddle checkout 구현
- 결제 webhook/API/DB migration 구현
- AI 사용량 제한을 billing source-of-truth로 연결
- plan/paywall/upgrade modal을 임시 UX로 고정
- Paddle live 결제 활성화

새 결제 작업을 시작하려면 `TODO/PADDLE_PLAN/COMMON/EXECUTION-GATES.md`의 gate를 먼저 confirmed 상태로 바꾼다.

## Related Documents

- `TODO/PADDLE_PLAN/README.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`
- `TODO/DONE/NEXT_BACKEND_API_BACKLOG_PLAN/README.md`
- `TODO/DONE/USER_WEB_PRODUCTIZATION_GAP_PLAN/README.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/PM_AGENT/DECISIONS/032_mobile_auth_foundation_scope.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
