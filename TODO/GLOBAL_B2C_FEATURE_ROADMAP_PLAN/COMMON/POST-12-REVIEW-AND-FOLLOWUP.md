# Pre-12 Follow-up And Post-12 Review Rule

상태: Decision Baseline
기준일: 2026-08-05

## 1. 목적

이 문서는 `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 01~11 완료 슬롯을 12 착수 전에 한 번 더 재대조하고, 그 뒤 `12_BILLING_SUBSCRIPTION_TAX`와 post-12 최종 재검토로 이어지는 규칙을 고정한다.

현재 사용자 결정은 결제/구독/세금 성격의 12를 바로 시작하기 전에, 이미 완료된 01~11에서 후속 조치가 필요한 항목을 먼저 다시 정리하는 것이다. 다만 billing, paywall, churn, paid conversion, invoice/tax처럼 12 결정에 직접 묶이는 항목은 12 또는 post-12 최종 재검토로 남긴다.

## 2. 사용자 결정

- 12 착수 전에 `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 01~11 완료 슬롯을 순서대로 다시 대조한다.
- 2026-08-05 기준 현재 pre-12 후속 재대조는 01~04까지 진행/확인 완료로 본다. 다음 대상은 05~11이다.
- 각 슬롯은 해당 README, COMMON 문서, GOAL-SPECS, TODO_LOG/closeout, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`, 실제 BE/FE/Prisma 상태를 함께 대조한다.
- 미구현, 부분 구현, 후속 조치, 의도적으로 제외한 항목을 다시 분류한다.
- 문서 stale 정리, 완료 근거 보강, audit 기록은 기존 완료 폴더에 남길 수 있다.
- 기존 closeout 의미를 깨는 추가 기능 구현은 새 TODO 폴더 또는 명시적 새 goal로 분리한다.
- billing/paywall/churn/paid conversion/invoice/tax에 직접 연결되는 항목은 12 전 임시 구현으로 처리하지 않고 12 또는 post-12 seed로 보류한다.
- 01~11 pre-12 후속 재대조가 끝나면 `12_BILLING_SUBSCRIPTION_TAX`를 진행한다.
- 12가 완료되면 01~12 전체와 입력 계획 2개를 다시 읽고 최종 후속 TODO로 재배치한다.
- UX/UI 디자인 유지보수는 01~11 pre-12 후속 재대조, 12, post-12 최종 재검토 이후에 별도 계획으로 진행한다.

## 3. 01~11 Pre-12 후속 재대조 순서

1. 현재 진행 상태를 확인한다.
   - 01~04 진행/확인 완료 여부
   - 05~11 남은 재대조 대상
   - 12로 보류해야 하는 billing-linked 항목
2. `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 01~11을 순서대로 다시 읽는다.
   - README
   - COMMON/API-SPEC
   - COMMON/GOAL-SPECS
   - BE-TODO/DB-SCHEMA
   - BE-TODO/API-TODO
   - FE-TODO
   - TODO_LOG 또는 closeout 문서
3. 같은 재대조에서 `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 함께 읽는다.
4. 실제 코드와 문서의 stale 여부를 표시한다.
   - BE module/controller/Prisma schema
   - User Web router/API client/feature
   - Admin Web router/API client/feature
   - 완료 문서와 오래된 README/ARCHITECTURE 간 충돌
5. 후속 항목을 아래 상태로 재분류한다.
   - `done`: 실제 구현과 QA가 이미 닫힌 항목
   - `pre-12-follow-up-done`: 12 전 재대조에서 추가 확인 또는 문서 closeout까지 닫힌 항목
   - `pre-12-follow-up-needed`: 12 전 별도 TODO/goal로 먼저 처리할 수 있는 항목
   - `billing-blocked`: 12 결정 없이는 구현 기준을 확정할 수 없는 항목
   - `post-12-seed`: 12 이후 최종 재검토에서 다시 판단할 항목
   - `series-a-later`: 첫 판매 이후 지표를 보고 확장할 항목
   - `defer`: 의도적으로 미루거나 현재 범위에서 제외할 항목
6. 새 작업이 필요하면 새로운 TODO 폴더 또는 명시적 goal을 만든다.
   - 기존 01~11 완료 폴더의 closeout 의미를 깨지 않는다.
   - 새 TODO는 `COMMON`, `FE-TODO`, `BE-TODO` 구조를 가진다.
   - API/DB 변경이 있으면 계약 상태를 최소 `confirmed`로 올린 뒤 `/goal`로 쪼갠다.
7. 01~11 재대조가 끝나면 12 착수 전 남은 보류 항목 목록을 확정한다.

## 3A. Post-12 최종 재검토 순서

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

01~11 pre-12 재대조 또는 12 완료 후 최종 재검토에서 다시 판단할 후보는 아래와 같다. 이 목록은 바로 구현 지시가 아니라 재분류 seed다.

| 후보 | 기준 | 기본 판단 |
|---|---|---|
| Company/Contact/Product latest summary | `NBA-003` 잔여 | 제품 맥락 보강 후보 |
| MeetingNote list latest/next summary | `NBA-004` 잔여 | 회의록 목록 제품화 후보 |
| backup/restore 실행 runbook | Data reliability gate | 운영 신뢰 후보 |
| 장애 대응 drill | Data reliability gate | 운영 신뢰 후보 |
| Product UX first-sale gate | `USER_WEB_PRODUCTIZATION_GAP_PLAN` | 첫 판매 전 QA 후보 |
| Trust/policy closeout | First-sale gate | 12와 직접 연결되는 정책은 post-12 후보, 그 외 문서/운영 gap은 pre-12 후보 |
| billing-linked paid conversion/churn/ARPU | 09/11/12 연결 | 12 전 구현 금지. 12 구현 결과 기준으로 재판단 |
| PWA install/offline shell/native app | 10 후속 | Series A 또는 별도 제품화 후보 |
| Google Calendar write/webhook/recurrence | 04 후속 | 후속 확장 후보 |
| generic ExportJob | 03/11 후속 | 정책/대량 export 필요성 재판단 |
| MeetingNote 자동 발송/알림 | 07 후속 | 오발송/정책 리스크 확인 후 재판단 |

## 5. 금지

- 12 완료 전에는 billing/paywall/churn/paid conversion source를 별도 임시 기능으로 구현하지 않는다.
- 01~11 pre-12 후속 재대조를 billing/paywall/churn 구현 우회로로 사용하지 않는다.
- 01~11 pre-12 후속 재대조와 12 이후 최종 재검토 없이 UX/UI 전체 polish를 먼저 시작하지 않는다.
- API 계약이 `draft`인 후속 후보를 바로 controller/service/repository로 구현하지 않는다.
- 기존 완료 폴더의 closeout 의미를 깨는 방식으로 01~11을 되돌려 열지 않는다. 단, 문서 stale 정리, 완료 근거 보강, audit 기록은 허용한다.
- FE가 API 응답에 없는 summary/count/latest 정보를 사실처럼 꾸미지 않는다.
- 신규 Prisma migration이 있으면 `FIRST-SALE-GATE-MAP.md`의 DB/Prisma 운영 gate를 선행 적용한다.

## 6. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/ROADMAP-OVERVIEW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/WORKFLOW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
