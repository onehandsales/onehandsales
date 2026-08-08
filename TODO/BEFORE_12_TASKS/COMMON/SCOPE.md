# Scope

상태: Ready For Goal

## 1. 목적

이 문서는 `BEFORE_12_TASKS`의 포함 범위와 제외 범위를 고정한다.

범위 판단은 `PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`를 따른다. 12 전에 할 수 있는 작업만 포함하고, post-12 후보와 billing 종속 후보는 이 폴더에서 구현하지 않는다.

## 2. 포함 범위

| Goal | PRE12 ID | 포함 범위 |
| --- | --- | --- |
| G01 | `PRE12-F04` | Gmail/Microsoft provider smoke closeout 기록 |
| G02 | `PRE12-F31` | 10 Mobile Field Use 문서 체크리스트 정합성 정리 |
| G03 | `PRE12-F32` | User Web route/architecture 문서 정합성 정리 |
| G04 | `PRE12-F33` | 11 Admin Operation 문서 체크리스트와 goal index 정합성 정리 |
| G05 | `PRE12-F34` | Admin Web architecture와 legacy route 설명 정리 |
| G06 | closeout | 12 Billing 착수 전 handoff 문서 정리 |

## 3. 제외 범위

- 제품 기능 구현
- API 계약 추가 또는 breaking change
- Prisma schema/migration 추가
- User Web 화면/route 신규 활성화
- Admin Web 화면/route 신규 활성화
- Billing, subscription, tax, payment, invoice, refund 구현
- B2B tenant/customer admin 구현
- post-12 후보 구현
- billing 종속 후보 선구현
- stale 문서에 맞추기 위한 route/API rollback

## 4. 현재 코드 기준 상태

실제 코드 기준으로 문서화해야 하는 상태는 아래와 같다.

- Backend는 NestJS modular monolith이며 `BE/src/app.module.ts`에 `follow-up`, `notification`, `sales-report`, `admin-operation`, `account-request` 모듈이 포함되어 있다.
- Prisma schema에는 01~11 작업 결과가 반영되어 있고, follow-up email connection과 delivery attempt 모델이 존재한다.
- Prisma schema에는 billing plan/subscription/tenant/customer admin 정본 모델이 없다.
- Prisma schema의 `BrowserPushSubscription`은 notification push token 모델이며 12 Billing subscription 모델이 아니다.
- User Web의 `/app/schedules/week`와 `/app/notifications`는 실제 route로 활성이다.
- User Web의 `/app/export`는 `/app`으로 redirect된다.
- Admin Web에는 11 Admin Operation route가 활성이고, `/organizations`, `/subscriptions`, `/support`는 redirect 상태다.

## 5. 12 Billing과의 경계

12 Billing의 현재 방향은 Merchant of Record 우선, Stripe 직접 결제 fallback이다.

이번 계획에서는 결제 provider, billing plan, billing subscription, entitlement, payment, invoice, refund, tax, paywall, failed payment, churn survey를 만들지 않는다. 해당 항목은 `12_BILLING_SUBSCRIPTION_TAX`의 confirmed scope/API/DB 문서에서 결정한다.

## 6. 변경 gate

문서 정합성 closeout 중 실제 코드 변경 필요성이 발견되면 아래 기준을 적용한다.

- 새 API 또는 request/response 변경이 필요하면 이 goal에서 구현하지 않고 별도 후속 또는 12 종속으로 분리한다.
- DB schema/migration이 필요하면 이 goal에서 구현하지 않고 `BE/prisma`와 12 또는 post-12 계획으로 분리한다.
- 비활성 legacy 코드가 실제 라우트/빌드/문서 충돌을 만들면 case-by-case로 삭제 또는 격리할 수 있다.
- 코드 변경이 발생하면 관련 앱의 `typecheck`, `lint`를 실행하고 한글 주석 규칙을 지킨다.

## 7. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX/COMMON/SCOPE.md`
