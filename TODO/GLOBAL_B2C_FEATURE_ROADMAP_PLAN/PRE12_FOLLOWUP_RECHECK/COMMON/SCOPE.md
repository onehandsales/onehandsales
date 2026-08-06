# Scope

상태: Draft
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`가 어떤 후보를 다루고, 어떤 후보는 기존 완료 슬롯 또는 12 이후로 남기는지 고정한다.

## 2. 포함 범위

| 범위 | 설명 |
| --- | --- |
| 01~05 재대조 결과 정리 | 01~04 완료, 05 provider smoke pending 상태와 06 후속 재검토 A 결정을 07~11 재대조에서 참고할 수 있게 정리한다. |
| 02 후속 후보 분리 | 다음 행동 알림과 회의록 후속 알림이 02 구현 범위가 아니었음을 고정한다. |
| 06 작업 경계 설정 | DealActivity event와 실제 Notification reminder를 분리한다. |
| 07 작업 경계 설정 | MeetingNote 상세 AI draft와 MeetingNote 목록 summary/자동 발송/알림을 분리한다. |
| 후보 상태 분류 | `pre-12-follow-up-needed`, `post-12-seed`, `billing-blocked`, `Question`, `defer` 중 하나로 분류한다. |
| 구현 전 계약 요구 | API/DB/FE 변경 후보는 API contract와 DB 영향 문서를 먼저 확정하도록 한다. |

## 3. 제외 범위

| 제외 항목 | 이유 |
| --- | --- |
| 06 DealActivity 구현 재개 | 06은 이미 완료 슬롯이다. 현재 작업이 있더라도 이 문서는 06 범위 확장을 지시하지 않는다. |
| 07 MeetingNote AI 구현 재개 | 07은 이미 완료 슬롯이다. 목록 summary, 자동 발송, 알림은 별도 후보다. |
| 12 Billing 구현 | 결제, 구독, 세금, paywall, churn, paid conversion은 12 결정 없이는 기준을 확정할 수 없다. |
| 새 API 즉시 구현 | 현재 `COMMON/API-SPEC`에는 confirmed API가 없다. |
| 새 Prisma migration 즉시 작성 | 후보 계약이 확정되기 전에는 schema를 바꾸지 않는다. |
| UX/UI 전체 polish | Product UX first-sale gate와 UX/UI 유지보수는 별도 흐름이다. |
| Company/Contact/Product latest summary pre-12 계약화 | 2026-08-06 A 결정에 따라 `NBA-003` 잔여 record summary는 B2B/team CRM 성격이 강한 post-12 전략 후보로 둔다. |

## 4. 06 작업에 직접 영향을 주는 기준

06에서 다뤄도 되는 범위:

- DealActivity model, repository, timeline API, deal list `latestActivity`
- `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`
- `SCHEDULE_LINKED`, `SCHEDULE_UNLINKED`
- `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED`
- `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED`
- list summary에 필요한 safe title, safe summary, occurredAt

06에서 다루면 안 되는 범위:

- Notification reminder row 생성
- due processor와 next action due date 연동
- MeetingNote follow-up reminder 생성
- MeetingNote follow-up 자동 발송
- follow-up body 전체 또는 meeting note raw text 전문 노출
- Company/Contact/Product latest summary response field 추가
- MeetingNote list latest/next summary response field 추가
- Company/Contact/Product summary 전용 endpoint 또는 record별 상세 activity timeline 추가

## 5. 상태 분류 기준

| 상태 | 의미 |
| --- | --- |
| `done` | 실제 구현과 QA가 이미 닫힌 항목 |
| `pre-12-follow-up-needed` | 12 전 별도 goal로 처리할 수 있고, billing 결정과 직접 충돌하지 않는 항목 |
| `post-12-seed` | 12 이후 최종 재검토에서 새 TODO로 승격할지 판단할 항목 |
| `billing-blocked` | 12 결정 없이는 구현 기준을 확정할 수 없는 항목 |
| `Question` | 사용자의 제품 판단 또는 정책 결정이 필요한 항목 |
| `defer` | 현재 의도적으로 미루는 항목 |

## 6. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/SCOPE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/SOURCE-PLAN-COVERAGE.md`
