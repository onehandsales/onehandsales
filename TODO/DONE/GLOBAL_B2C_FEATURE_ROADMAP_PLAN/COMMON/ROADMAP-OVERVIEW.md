# Roadmap Overview

상태: DONE / Closed Roadmap / Billing moved to `TODO/PADDLE_PLAN`
최종 업데이트: 2026-08-11

## 0. 완료 현황

- [x] `01_IMPORT_JOB_PERSISTENCE`: Done (2026-07-21)
- [x] `02_NOTIFICATION_REMINDER`: Done (2026-07-22)
- [x] `03_WEEKLY_SCHEDULE_REPORT`: Done (2026-07-22)
- [x] `04_GOOGLE_CALENDAR_INTEGRATION`: Done (2026-07-23)
- [x] `05_AI_WEEKLY_SALES_REPORT`: Done / Provider smoke closeout complete
- [x] `06_DEAL_ACTIVITY_TIMELINE`: Done (2026-07-26)
- [x] `07_MEETING_NOTE_AI_PROVIDER_LOG`: Done (2026-07-26)
- [x] `08_GLOBAL_DATA_I18N`: Done (2026-07-28)
- [x] `09_PRODUCT_ANALYTICS`: Done (2026-07-30)
- [x] `10_MOBILE_PWA_FIELD_USE`: Done (2026-07-31)
- [x] `11_ADMIN_OPERATION`: Done (2026-08-01)
- [x] `PRE12_FOLLOWUP_RECHECK`: Done (2026-08-09, 2026-08-10 보정 반영)
- [x] `12_BILLING_SUBSCRIPTION_TAX`: Moved / Deferred to `TODO/PADDLE_PLAN` (2026-08-11)

## 1. Closeout 기준

이 로드맵은 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 Backend/API/DB 후보와 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 제품화 gap을 01~12 기능 슬롯으로 변환해 실행하기 위한 상위 계획이었다.

2026-08-11 기준으로 이 역할은 끝났다.

- 01~11의 기능 구현과 QA closeout은 완료됐다.
- PRE12의 01~11 후속 후보 재분류와 BEFORE_12 closeout은 완료됐다.
- 12 Billing/Subscription/Tax는 즉시 구현하지 않고 `TODO/PADDLE_PLAN`으로 이관했다.
- UX/UI 유지보수와 기능 유지보수, 100명 베타가 결제 구현보다 먼저 진행된다.

## 2. 최종 단계 구분

| 단계 | 포함 폴더 | 최종 상태 |
| --- | --- | --- |
| 기능 신뢰 기반 | 01 | Done |
| 리텐션/일정 루프 | 02~05 | Done |
| 영업 기록 고도화 | 06~07 | Done |
| Global B2C 제품화 기반 | 08~10 | Done |
| Admin 운영 | 11 | Done |
| 01~11 Pre-12 후속 재대조 | `PRE12_FOLLOWUP_RECHECK` | Done |
| Billing/Paddle | 기존 12 | Moved / Deferred to `TODO/PADDLE_PLAN` |
| Product maintenance / UXUI / Beta | 이 로드맵 밖 | Next active direction |

## 3. 최종 순서

1. `01_IMPORT_JOB_PERSISTENCE` - Done
2. `02_NOTIFICATION_REMINDER` - Done
3. `03_WEEKLY_SCHEDULE_REPORT` - Done
4. `04_GOOGLE_CALENDAR_INTEGRATION` - Done
5. `05_AI_WEEKLY_SALES_REPORT` - Done / Provider smoke closeout complete
6. `06_DEAL_ACTIVITY_TIMELINE` - Done
7. `07_MEETING_NOTE_AI_PROVIDER_LOG` - Done
8. `08_GLOBAL_DATA_I18N` - Done
9. `09_PRODUCT_ANALYTICS` - Done
10. `10_MOBILE_PWA_FIELD_USE` - Done
11. `11_ADMIN_OPERATION` - Done
12. `12_BILLING_SUBSCRIPTION_TAX` - Moved / Deferred to `TODO/PADDLE_PLAN`

## 4. 다음 실제 작업 방향

이 로드맵의 다음 작업은 더 이상 12 Billing 구현이 아니다.

다음 실제 방향은 아래 순서다.

1. 기존 기능 유지보수
2. UX/UI 상품성 개선
3. 100명 베타 테스트
4. 베타 피드백 반영
5. 가격/플랜/entitlement/AI 사용량 제한/policy 확정
6. `TODO/PADDLE_PLAN` 기준 Paddle Billing 구현

## 5. 보존할 원칙

- 완료된 01~11 폴더를 후속 기능 구현을 위해 재개하지 않는다.
- 결제 관련 후보는 `TODO/PADDLE_PLAN`에서 다룬다.
- non-billing 후속 후보는 필요성이 확인될 때 새 TODO 폴더로 승격한다.
- 신규 API/DB/FE 구현은 draft 문서가 아니라 confirmed scope/API/DB/FE 계약으로 승격한 뒤 진행한다.
- Product UX first-sale gate와 Trust/policy gate는 이후 유지보수/베타/Paddle 작업에서도 계속 확인한다.
