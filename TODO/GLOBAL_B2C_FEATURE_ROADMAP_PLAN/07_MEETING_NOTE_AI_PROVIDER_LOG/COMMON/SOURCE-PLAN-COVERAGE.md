# Source Plan Coverage

상태: Confirmed
확정일: 2026-07-26

## 1. 목적

이 문서는 07이 상위 입력 계획의 어떤 후보를 포함/제외하는지 고정한다.

입력 문서:

- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`

## 2. 포함 범위

### 2.1 `NEXT_BACKEND_API_BACKLOG_PLAN` 직접 반영

| 원본 후보 | 07 반영 | 구현 위치 |
|---|---|---|
| `NBA-011` MeetingNote transcript/provider call log | 포함 | G02/G03 |
| `NBA-004` MeetingNote next/latest summary 중 next action 판단 기반 | 목록 summary는 제외하고 저장된 회의록 상세의 next action 후보만 포함 | G04/G05 |
| `NBA-014` DB/Prisma migration 운영 gate | 새 migration이 있으므로 DB target/migrate/seed 금지 gate를 포함 | G01/G02/G06 |

### 2.2 `USER_WEB_PRODUCTIZATION_GAP_PLAN` 직접 반영

| 원본 gap | 07 반영 | 구현 위치 |
|---|---|---|
| 회의록에서 다음 행동과 딜 맥락이 충분히 보이는가 | 저장된 회의록 상세에서 next action 후보를 생성하고 연결 딜 기준으로 저장한다. | G04/G05 |
| 회의록 follow-up을 사용자가 놓치지 않는가 | 07은 알림이 아니라 follow-up 문안 초안과 next action 기반만 제공한다. | G04/G05 |
| AI가 회의록 요약을 넘어 다음 행동/follow-up 문구를 제안하는가 | next action 후보와 email/SMS follow-up draft를 포함한다. | G04/G05 |
| AI cost/user와 provider log를 추적할 수 있는가 | 공통 `AiProviderCallLog`에 operation, latency, token/cost, safe error를 기록한다. | G02/G03/G04 |
| Global B2C 유료 제품 운영 신뢰 | provider raw/prompt/transcript 원문은 저장하지 않고 안전한 실패 UX와 log만 둔다. | G02/G03/G05 |

## 3. 제외 범위

### 3.1 07과 직접 관련 있지만 1차에서 제외

| 원본 후보 | 07 1차 판단 | 후속 |
|---|---|---|
| `NBA-004` MeetingNote list next/latest summary | 1차 제외 | raw text/민감정보 정책 안정화 후 별도 API 계약 |
| AI data cleanup | 1차 제외 | 09/별도 data quality 계획 |
| Admin provider failure log 조회 | 1차 제외 | 11 Admin Operation |
| transcript table | 제외 | 명시적 저장 정책과 삭제권 기준이 생기면 후속 |
| follow-up draft table | 제외 | 05/11/12와 연결된 저장/발송 정책 후속 |
| 회의록 follow-up 알림/reminder | 07은 알림 생성이 아니라 초안/후보 생성만 제공 | Notification/retention 후속 |
| 실제 SMTP/Web Push provider smoke | 07 범위가 아니라 운영 환경 검증 | Data reliability/operation gate |

### 3.2 `NEXT_BACKEND_API_BACKLOG_PLAN` 중 07에서 다루지 않는 후보

| 원본 후보 | 07 판단 | 후속 |
|---|---|---|
| `NBA-003` Company/Contact/Product latest summary 잔여 | MeetingNote AI provider log 범위가 아님 | record summary 후속 |
| `NBA-005` BusinessCard provider failure contract | MeetingNote provider log 범위가 아님 | BusinessCard provider failure contract |
| `NBA-007` Trash private memo backend response restriction | MeetingNote AI 범위가 아님 | Trash privacy/security 후속 |
| `NBA-012` Trash 7일 이후 복구 정책 | MeetingNote AI 범위가 아님 | Trash retention policy |
| `NBA-013` Admin 운영 UX/API | 07 일반 User API와 섞지 않음 | 11 Admin Operation |
| 완료된 `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-006`, `NBA-008`, `NBA-009`, `NBA-010`, `NBA-015` | 이미 별도 roadmap에서 완료된 이력 | 07에서 재구현하지 않음 |

### 3.3 `USER_WEB_PRODUCTIZATION_GAP_PLAN` 중 첫 판매 gate로 남기는 항목

| 원본 gate/gap | 07 판단 | 후속 |
|---|---|---|
| Pricing/plan | 07 범위가 아님 | Global B2C sales policy/payment |
| Billing/payment/subscription | 07 범위가 아님 | Payment/subscription 계획 |
| Tax/compliance/refund | 07 범위가 아님 | Trust/policy/commerce 계획 |
| App localization/global UX | 07은 언어/국가 모델을 확장하지 않음 | localization/account/billing UX 계획 |
| Multi-country phone/currency/address model | 07 범위가 아님 | global data model 계획 |
| Admin/support minimal operation | 07에서 Admin API/UI를 만들지 않음 | Admin minimal operation |
| Product analytics event pipeline | 07은 provider log만 포함하고 제품 분석 event taxonomy는 만들지 않음 | Product analytics 계획 |
| Backup/restore/incident response | 07은 provider log 기반만 포함하고 운영 절차는 만들지 않음 | Data reliability/DB gate |

## 4. 충돌 해소

07 기존 README에는 provider call log table이 없다고 되어 있었지만, 실제 Prisma schema에는 05에서 만든 `AiProviderCallLog`와 `AiJob`이 있다.

따라서 07은 새 전용 table을 만들지 않고 기존 공통 model을 확장한다.

`NBA-011` 원본은 transcript/provider call log table 후보였지만, 07 사용자 결정에 따라 transcript table은 만들지 않고 provider log는 공통 `AiProviderCallLog` 확장으로 처리한다.

`NBA-004` 원본은 MeetingNote 목록 next/latest summary 후보였지만, 07 1차는 목록 summary가 아니라 저장된 회의록 상세의 next action 후보와 follow-up draft로 축소한다.

## 5. 구현 전 확인

- `COMMON/API-SPEC`의 계약 상태가 confirmed인지 확인한다.
- DB 변경이 있으므로 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`의 DB/Prisma 운영 gate를 확인한다.
- User Web 변경은 `FE-TODO/USER-WEB-TODO.md`와 UXUI_AGENT 기준을 함께 따른다.
- First-sale gate 항목 중 결제, Admin, 현지화, 정책, 분석, backup/restore가 07 구현에 섞이지 않았는지 확인한다.
