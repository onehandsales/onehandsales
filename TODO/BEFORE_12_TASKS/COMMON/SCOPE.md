# Scope

상태: Draft / Skeleton

## 1. 목적

이 문서는 `BEFORE_12_TASKS`의 포함 범위와 제외 범위를 고정한다.

## 2. 포함 범위

- Gmail/Microsoft provider smoke closeout 기록
- 10 Mobile Field Use 문서 체크리스트 정합성 정리
- User Web route/architecture 문서 정합성 정리
- 11 Admin Operation 문서 체크리스트와 goal index 정합성 정리
- Admin Web architecture와 legacy route 설명 정리
- 12 Billing 착수 전 handoff 문서 정리

## 3. 제외 범위

- 제품 기능 구현
- API 계약 추가
- Prisma schema/migration 추가
- User Web 화면/route 신규 활성화
- Admin Web 화면/route 신규 활성화
- Billing, subscription, tax, payment, invoice, refund 구현
- B2B tenant/customer admin 구현
- post-12 후보를 이 폴더에서 구현하는 작업

## 4. 기준 상태

- `/app/notifications`는 실제 User Web route에서 활성이다.
- `/app/export`는 실제 User Web route에서 `/app`으로 redirect된다.
- Admin Web의 11 운영 route는 실제 route에서 활성이다.
- Admin Web의 `/organizations`, `/subscriptions`, `/support`는 redirect 상태다.
- Prisma schema에는 billing/subscription/tenant/customer admin 정본 모델이 없다.

## 5. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
