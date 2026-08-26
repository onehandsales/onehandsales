# Global B2C Feature Roadmap Plan

상태: DONE / Closed Roadmap / Billing moved to `TODO/PADDLE_PLAN`
작성일: 2026-07-20
최종 업데이트: 2026-08-11
성격: Global B2C 01~11 기능 선구현 로드맵 완료 이력

> 2026-08-24 전략 업데이트: 현재 우선 타겟 국가는 한국, 미국, 캐나다다. 이 archive 안의 일본/영국/싱가포르/호주 우선순위 또는 전체 locale smoke 문구는 당시 완료 이력으로 보존하며, 새 작업 기준은 `AGENT/PM_AGENT/DECISIONS/031_kr_us_ca_priority_market.md`와 `TODO/PADDLE_PLAN`을 따른다.

## 0. Closeout 결론

이 로드맵은 2026-08-11 기준 DONE으로 닫는다.

- 01~11 기능 슬롯은 구현과 QA closeout이 완료됐다.
- PRE12 `PRE12_FOLLOWUP_RECHECK`는 01~11 후속 후보 재분류와 BEFORE_12 closeout까지 완료했다.
- 기존 12 `12_BILLING_SUBSCRIPTION_TAX`는 즉시 구현하지 않고 `TODO/PADDLE_PLAN`으로 이관했다.
- Paddle/Billing은 UX/UI 유지보수, 기능 유지보수, 100명 베타 테스트, 가격/플랜/권한 정책 확정 이후 진행한다.
- 이 폴더 안에서 더 이상 새 API, DB migration, FE route, Admin route 구현 계획을 만들지 않는다.

## 1. 완료 현황

- [x] 01 `01_IMPORT_JOB_PERSISTENCE`: Done (2026-07-21)
- [x] 02 `02_NOTIFICATION_REMINDER`: Done (2026-07-22)
- [x] 03 `03_WEEKLY_SCHEDULE_REPORT`: Done (2026-07-22)
- [x] 04 `04_GOOGLE_CALENDAR_INTEGRATION`: Done (2026-07-23)
- [x] 05 `05_AI_WEEKLY_SALES_REPORT`: G01-G09 Done (2026-07-24), G10 code/automatic validation done (2026-08-05), provider smoke closeout completed by PRE12/BEFORE_12 (2026-08-09)
- [x] 06 `06_DEAL_ACTIVITY_TIMELINE`: Done (2026-07-26)
- [x] 07 `07_MEETING_NOTE_AI_PROVIDER_LOG`: Done (2026-07-26)
- [x] 08 `08_GLOBAL_DATA_I18N`: Done (2026-07-28, DB 최신 상태 2026-07-29 재확인)
- [x] 09 `09_PRODUCT_ANALYTICS`: Done (2026-07-30)
- [x] 10 `10_MOBILE_PWA_FIELD_USE`: Done (2026-07-31)
- [x] 11 `11_ADMIN_OPERATION`: Done (2026-08-01)
- [x] PRE12 `PRE12_FOLLOWUP_RECHECK`: Done (2026-08-09, Admin provider failure pagination 보정 반영 2026-08-10)
- [x] 12 `12_BILLING_SUBSCRIPTION_TAX`: Moved / Deferred to `TODO/PADDLE_PLAN` (2026-08-11)

## 2. 현재 운영 기준

이 폴더는 앞으로 새 기능 작업공간이 아니라 완료 이력과 의사결정 근거를 보관하는 archive로 본다.

| 영역 | 현재 기준 |
| --- | --- |
| 01~11 기능 | 완료 이력 유지. 기존 완료 폴더를 재개하지 않는다. |
| PRE12 | 완료. 12 전 잔여 API/DB/FE 구현 작업 없음. |
| 결제/구독/세금 | `TODO/PADDLE_PLAN`에서 관리한다. |
| UX/UI 유지보수 | 이 로드맵 밖의 별도 product maintenance/UXUI 계획에서 진행한다. |
| 100명 베타 | 결제창 없이 제공하고 피드백을 받은 뒤 Paddle 구현 여부와 범위를 확정한다. |
| 후속 후보 | 결제 관련 후보는 `TODO/PADDLE_PLAN`, 그 외 후보는 새 TODO 또는 별도 유지보수 계획에서 다시 판단한다. |

## 3. 12개 기능 슬롯의 최종 상태

| 순서 | 폴더 | 기능 묶음 | 최종 상태 |
| ---: | --- | --- | --- |
| 01 | `01_IMPORT_JOB_PERSISTENCE` | ImportJob 영속화 | Done |
| 02 | `02_NOTIFICATION_REMINDER` | 알림/리마인더 | Done |
| 03 | `03_WEEKLY_SCHEDULE_REPORT` | 주간 일정 보고서 | Done |
| 04 | `04_GOOGLE_CALENDAR_INTEGRATION` | Google Calendar 연동 | Done |
| 05 | `05_AI_WEEKLY_SALES_REPORT` | AI 주간 영업 리포트 | Done / Provider smoke closeout complete |
| 06 | `06_DEAL_ACTIVITY_TIMELINE` | DealActivity 타임라인 | Done |
| 07 | `07_MEETING_NOTE_AI_PROVIDER_LOG` | 회의록 AI/provider log 고도화 | Done |
| 08 | `08_GLOBAL_DATA_I18N` | 다국가 데이터 모델과 `/app` 다국어 | Done |
| 09 | `09_PRODUCT_ANALYTICS` | 제품 분석 | Done |
| 10 | `10_MOBILE_PWA_FIELD_USE` | 모바일/PWA/현장 사용성 | Done for mobile browser field-use. PWA/native는 후속 |
| 11 | `11_ADMIN_OPERATION` | Admin 운영 | Done. Billing Admin은 제외 |
| 12 | `12_BILLING_SUBSCRIPTION_TAX` | 결제/구독/세금 | Moved / Deferred to `TODO/PADDLE_PLAN` |

## 4. 이관된 결제 범위

아래 범위는 이 폴더에서 더 이상 실행하지 않는다.

- Paddle Billing
- Paddle Checkout
- subscription, plan, entitlement
- AI usage billing source-of-truth
- paywall, upgrade, trial
- tax, invoice, refund, chargeback
- failed payment recovery
- Billing Admin 연동
- billing-linked paid conversion/churn/ARPU
- marketing opt-in과 billing lifecycle communication
- account deletion과 invoice/tax retention 충돌 정책

정본 위치:

- `TODO/PADDLE_PLAN/README.md`
- `TODO/PADDLE_PLAN/COMMON/SOURCE-COVERAGE-REVIEW.md`
- `TODO/PADDLE_PLAN/COMMON/BACKLOG-PRODUCTIZATION-EXTRACT.md`
- `TODO/PADDLE_PLAN/COMMON/PRE12-DEPENDENCY-MAP.md`

## 5. 남은 후속 처리 원칙

이 폴더 안에서 후속 후보를 바로 구현하지 않는다.

1. 결제 관련 후속은 `TODO/PADDLE_PLAN`에서 post-beta에 다시 확정한다.
2. UX/UI와 기능 유지보수는 별도 product maintenance/UXUI 계획에서 다룬다.
3. PRE12의 non-billing post-12 seed는 필요성이 확인될 때 새 TODO 폴더로 승격한다.
4. 기존 01~11 완료 폴더의 closeout 의미를 깨지 않는다.
5. 문서 stale 정리, 완료 근거 보강, archive 안내는 허용한다.

## 6. 먼저 볼 문서

- `TODO/PADDLE_PLAN/README.md`
- `TODO/PADDLE_PLAN/COMMON/SOURCE-COVERAGE-REVIEW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/ROADMAP-OVERVIEW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX/README.md`
