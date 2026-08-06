# Pre-12 Follow-up Recheck

상태: Draft / 12 전 후속 범위 정리 / 구현 시작 금지
작성일: 2026-08-06
성격: 01~11 완료 슬롯 재대조에서 나온 후속 후보를 06~11 재대조와 12 착수 전 결정에 연결하는 작업 폴더

## 1. 목적

이 폴더는 `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 기존 01~11 완료 의미를 깨지 않으면서, 12 착수 전에 다시 확인해야 하는 후속 후보를 한곳에 묶는다.

현재 사용자는 01~05 재대조를 마쳤고, 다른 터미널에서 06 관련 작업을 진행 중이다. 따라서 이 문서는 특히 02, 05, 06, 07 사이에서 오해하기 쉬운 다음 항목을 분리한다.

- 02에서 제외된 다음 행동 알림
- 02에서 제외된 회의록 후속 알림
- 05에서 남은 Gmail/Microsoft provider smoke
- 06에서 닫은 DealActivity 범위와 06 밖으로 남은 record summary 후보
- 07에서 닫은 MeetingNote 상세 AI 후보와 07 밖으로 남은 목록 summary, 자동 발송, 알림 후보

이 폴더는 13번 기능 폴더가 아니다. 12 전에 기존 완료 슬롯을 재대조하기 위한 보조 계획이며, 12 Billing 범위를 우회하는 구현 계획도 아니다.

## 2. 현재 결론

| 영역 | 현재 판정 | 구현 판단 |
| --- | --- | --- |
| 01 ImportJob | 완료 | 대용량 worker, generic ExportJob, Admin 전용 화면/API는 01 미완성이 아니다. |
| 02 Notification | 완료 | 일정/딜 reminder, in-app/email/browser push, provider smoke는 완료다. 다음 행동 알림과 회의록 후속 알림은 구현되지 않았다. |
| 03 Weekly Schedule Report | 완료 | PDF, generic ExportJob, recurrence는 03 재오픈 대상이 아니다. |
| 04 Google Calendar | 완료 | read-only import/sync/source badge/Trash restore/provider smoke는 완료다. write, webhook, recurrence는 후속이다. |
| 05 AI Weekly Sales Report | 구현 완료 / provider smoke pending | Gmail/Microsoft email adapter와 자동 검증은 완료됐다. 운영 credential/callback/allowlist 기반 실제 수신자 smoke는 남아 있다. |
| 06 DealActivity | 완료 이력 유지 | 현재 06 작업은 DealActivity timeline, Deal list latestActivity, products summary, Contact dealCount 범위를 넘기지 않는다. |
| 07 MeetingNote AI | 완료 이력 유지 | 상세 next action/follow-up draft와 provider log는 완료다. 회의록 목록 summary, 자동 발송, 알림은 07 완료 범위가 아니다. |

## 3. 06 작업 시 바로 적용할 경계

다른 터미널에서 진행 중인 06 작업은 아래 경계를 지킨다.

- `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`는 DealActivity event로만 본다.
- `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED`는 DealActivity event로만 본다.
- `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED`는 Deal target을 가진 follow-up delivery attempt의 safe summary로만 본다.
- 다음 행동 reminder 생성, 회의록 follow-up reminder 생성, MeetingNote follow-up 자동 발송은 06 구현 범위에 넣지 않는다.
- private memo, provider raw response, follow-up body 전체, meeting note raw text 전문을 timeline summary, list summary, log에 넣지 않는다.

## 4. 후보 분류

| 후보 | 기본 상태 | 다음 처리 |
| --- | --- | --- |
| 다음 행동 reminder | Question / 계약 필요 | G00에서 12 전 처리 여부를 결정한다. 결정 전 구현 금지. |
| 회의록 follow-up reminder | post-12-seed | G00에서 상태를 재확인한다. 자동 발송과 함께 정책 결정이 필요하다. |
| Gmail/Microsoft provider smoke | pre-12-follow-up-needed | G05에서 운영 credential/callback/allowlist 준비 후 실행 기록만 닫는다. 코드 구현 후보가 아니다. |
| Company/Contact/Product latest summary | post-12-seed 또는 별도 record summary 후보 | G04에서 summary/privacy 계약을 먼저 만든다. |
| MeetingNote list latest/next summary | post-12-seed 또는 별도 MeetingNote list 후보 | G04에서 07 결과와 연결해 계약을 먼저 만든다. |
| generic ExportJob/PDF/recurrence/Google write/watch | post-12-seed | 12 완료 후 최종 재검토에서 새 TODO로 승격할지 판단한다. |
| billing/paywall/churn/paid conversion | billing-blocked | 12 전 임시 구현 금지. |

## 5. 문서 구조

```text
PRE12_FOLLOWUP_RECHECK/
  README.md
  COMMON/
    README.md
    SCOPE.md
    CANDIDATE-MATRIX.md
    GOAL-WORK-ORDER.md
    PLANNING-REVIEW.md
    API-SPEC/
      README.md
    GOAL-SPECS/
      README.md
      G00_SCOPE_CLASSIFICATION.md
      G01_06_SCOPE_GUARD_AND_CODE_AUDIT.md
      G02_NEXT_ACTION_REMINDER_CONTRACT.md
      G03_MEETING_NOTE_FOLLOW_UP_REMINDER_CONTRACT.md
      G04_RECORD_SUMMARY_CONTRACT.md
      G05_PROVIDER_SMOKE_CLOSEOUT.md
      G99_PRE12_CLOSEOUT.md
  BE-TODO/
    API-TODO.md
    DB-SCHEMA.md
  FE-TODO/
    USER-WEB-TODO.md
```

## 6. 실행 원칙

1. G00을 먼저 실행해 후보 상태를 확정한다.
2. API/DB/FE 구현이 필요한 후보는 `COMMON/API-SPEC` 계약을 `confirmed`로 올린 뒤 별도 goal로 쪼갠다.
3. `draft` 또는 `Question` 상태의 후보는 controller, service, repository, Prisma schema, FE route로 구현하지 않는다.
4. 06 작업 중 발견한 보정은 06 완료 범위를 넓히는 방식이 아니라 이 폴더의 후보 상태로 기록한다.
5. billing/paywall/churn/paid conversion/invoice/tax와 연결된 항목은 12 전 구현하지 않는다.

## 7. 먼저 읽을 문서

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/ROADMAP-OVERVIEW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`

