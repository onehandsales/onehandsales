# Final Service Shape

상태: Draft / Skeleton

## 1. 목적

이 문서는 `BEFORE_12_TASKS`가 완료된 뒤 12 Billing 착수 전에 남아 있어야 하는 최종 서비스 상태와 문서 상태를 고정한다.

이번 계획은 새 기능 출시 계획이 아니다. `PRE12_FOLLOWUP_RECHECK`에서 12 전에 닫기로 분류한 운영 smoke와 문서 정합성 항목을 실제 코드 상태 기준으로 닫고, Billing 범위와 섞이지 않게 하는 closeout 계획이다.

## 2. 최종 상태

완료 후 상태는 아래와 같아야 한다.

- Gmail/Microsoft provider smoke closeout 결과가 문서에 남아 있다.
- 10 Mobile Field Use 체크리스트가 실제 완료 상태와 맞는다.
- User Web route/architecture 문서가 실제 route 상태와 맞는다.
- 11 Admin Operation 체크리스트와 goal index가 실제 완료 상태와 맞는다.
- Admin Web architecture와 legacy route 설명이 실제 route/API 상태와 맞는다.
- 12 Billing에서 다룰 subscription, tax, payment, invoice, entitlement, paywall 범위가 이 계획에 섞이지 않는다.
- post-12 후보는 별도 재검토 또는 후속 TODO 후보로 남아 있다.

## 3. 사용자에게 보이는 상태

이 계획만으로 사용자의 서비스 기능이 새로 늘어나지는 않는다.

- User Web의 현재 활성 route는 유지한다.
- Admin Web의 현재 활성 route는 유지한다.
- `/app/notifications`는 활성 상태를 rollback하지 않는다.
- `/app/export`는 redirect 상태를 유지한다.
- Admin Web의 `/organizations`, `/subscriptions`, `/support`는 redirect 상태를 유지한다.

## 4. Backend 상태

- 새 API를 추가하지 않는다.
- 새 Prisma migration을 만들지 않는다.
- provider smoke는 기존 follow-up delivery email provider 흐름으로만 확인한다.
- billing/subscription/tax/payment/invoice/refund 모델은 12 계획에서 정본화한다.

## 5. Frontend 상태

- 새 User Web route를 활성화하지 않는다.
- 새 Admin Web route를 활성화하지 않는다.
- stale 문서에 맞추기 위해 이미 활성화된 route를 되돌리지 않는다.
- legacy `admin-query`를 현재 주력 route/API로 승격하지 않는다.

## 6. 12 Billing 인계 조건

아래 조건이 충족되면 12 Billing 착수 가능 상태로 본다.

- G01~G06의 완료 기록이 있다.
- `PRE12_FOLLOWUP_RECHECK`와 `BEFORE_12_TASKS` 상태가 충돌하지 않는다.
- 12 전 closeout 항목, post-12 후보, billing 종속 후보가 문서상 분리되어 있다.
- 12 Billing 문서에서 Stripe 기반 구독/세금/인보이스 정책을 별도로 결정할 수 있다.

## 7. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/BEFORE_12_TASKS/COMMON/RELEASE-SCOPE-CHECK.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`

