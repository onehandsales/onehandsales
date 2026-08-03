# Post-12 Review And Follow-up Rule

상태: Decision Baseline
기준일: 2026-08-03

## 1. 목적

이 문서는 `12_BILLING_SUBSCRIPTION_TAX`를 먼저 진행한 뒤, `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 01~12 전체와 입력 계획인 `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 다시 학습하고 후속 TODO로 재배치하는 규칙을 고정한다.

12 완료 전에는 billing과 직접 연결되는 제품/운영/분석/정책 판단이 확정되지 않는다. 따라서 전체 UX/UI 유지보수나 잔여 기능 정리는 12 완료 후 실제 코드와 문서 상태를 다시 대조한 뒤 진행한다.

## 2. 사용자 결정

- 먼저 `12_BILLING_SUBSCRIPTION_TAX`를 진행한다.
- 12가 완료되면 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 01~12 폴더 전체를 다시 읽는다.
- 같은 재검토에서 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`과 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`을 함께 읽고, 실제 BE/FE/Prisma 구현 상태와 대조한다.
- 미구현, 부분 구현, 후속 조치, 의도적으로 제외한 항목을 다시 분류한다.
- 재분류 결과는 기존 완료 폴더를 되돌려 수정하는 방식이 아니라, 필요한 경우 새로운 TODO 폴더를 만들어 작업한다.
- UX/UI 디자인 유지보수는 12와 후속 기능/운영 정리 이후에 별도 계획으로 진행한다.

## 3. Post-12 재검토 순서

1. 12 완료 기록을 확인한다.
   - 12 README 상태
   - 12 `COMMON/GOAL-SPECS`
   - 12 QA/document closeout
   - 실제 BE/FE/Prisma 변경
2. `GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 01~12를 모두 다시 읽는다.
   - README
   - COMMON/API-SPEC
   - COMMON/GOAL-SPECS
   - BE-TODO/DB-SCHEMA
   - BE-TODO/API-TODO
   - FE-TODO
   - TODO_LOG 또는 closeout 문서
3. `NEXT_BACKEND_API_BACKLOG_PLAN`을 다시 읽고 남은 후보를 분류한다.
   - `NBA-003` Company/Contact/Product latest summary
   - `NBA-004` MeetingNote list latest/next summary
   - backup/restore 실행 runbook
   - 장애 대응 drill
   - billing-linked conversion/churn/ARPU가 12에서 어디까지 닫혔는지
4. `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 다시 읽고 제품화 gap을 분류한다.
   - Product UX first-sale gate
   - Trust/policy first-sale gate
   - UX/UI 전체 polish 후보
   - PWA/offline/native app 후보
   - Google Calendar write/webhook/recurrence 후보
   - generic ExportJob 후보
   - MeetingNote 자동 발송/알림 후보
5. 실제 코드와 문서의 stale 여부를 표시한다.
   - BE module/controller/Prisma schema
   - User Web router/API client/feature
   - Admin Web router/API client/feature
   - 완료 문서와 오래된 README/ARCHITECTURE 간 충돌
6. 후속 항목을 아래 상태로 재분류한다.
   - `done`: 12까지 포함해 실제 구현과 QA가 닫힌 항목
   - `first-sale-follow-up`: 첫 판매 전 별도 TODO가 필요한 항목
   - `product-follow-up`: 제품 완성도 향상을 위해 별도 TODO가 필요한 항목
   - `ops-follow-up`: 운영 runbook, 장애 대응, provider smoke처럼 운영 절차가 필요한 항목
   - `series-a-later`: 첫 판매 이후 지표를 보고 확장할 항목
   - `defer`: 의도적으로 미루거나 현재 범위에서 제외할 항목
7. 새 작업이 필요하면 새로운 TODO 폴더를 만든다.
   - 기존 01~12 완료 폴더를 재개하지 않는다.
   - 새 TODO는 `COMMON`, `FE-TODO`, `BE-TODO` 구조를 가진다.
   - API/DB 변경이 있으면 계약 상태를 최소 `confirmed`로 올린 뒤 `/goal`로 쪼갠다.

## 4. 후속 후보 seed

12 완료 후 반드시 다시 판단할 후보는 아래와 같다. 이 목록은 바로 구현 지시가 아니라 post-12 재검토의 seed다.

| 후보 | 기준 | 기본 판단 |
|---|---|---|
| Company/Contact/Product latest summary | `NBA-003` 잔여 | 제품 맥락 보강 후보 |
| MeetingNote list latest/next summary | `NBA-004` 잔여 | 회의록 목록 제품화 후보 |
| backup/restore 실행 runbook | Data reliability gate | 운영 신뢰 후보 |
| 장애 대응 drill | Data reliability gate | 운영 신뢰 후보 |
| Product UX first-sale gate | `USER_WEB_PRODUCTIZATION_GAP_PLAN` | 첫 판매 전 QA 후보 |
| Trust/policy closeout | First-sale gate | 12 이후 정책 closeout 후보 |
| billing-linked paid conversion/churn/ARPU | 09/11/12 연결 | 12 구현 결과 기준으로 재판단 |
| PWA install/offline shell/native app | 10 후속 | Series A 또는 별도 제품화 후보 |
| Google Calendar write/webhook/recurrence | 04 후속 | 후속 확장 후보 |
| generic ExportJob | 03/11 후속 | 정책/대량 export 필요성 재판단 |
| MeetingNote 자동 발송/알림 | 07 후속 | 오발송/정책 리스크 확인 후 재판단 |

## 5. 금지

- 12 완료 전에는 billing/paywall/churn/paid conversion source를 별도 임시 기능으로 구현하지 않는다.
- 12 완료 후 재검토 없이 UX/UI 전체 polish를 먼저 시작하지 않는다.
- API 계약이 `draft`인 후속 후보를 바로 controller/service/repository로 구현하지 않는다.
- 기존 완료 폴더의 closeout 의미를 깨는 방식으로 01~11을 되돌려 열지 않는다.
- FE가 API 응답에 없는 summary/count/latest 정보를 사실처럼 꾸미지 않는다.
- 신규 Prisma migration이 있으면 `FIRST-SALE-GATE-MAP.md`의 DB/Prisma 운영 gate를 선행 적용한다.

## 6. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/ROADMAP-OVERVIEW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/WORKFLOW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
