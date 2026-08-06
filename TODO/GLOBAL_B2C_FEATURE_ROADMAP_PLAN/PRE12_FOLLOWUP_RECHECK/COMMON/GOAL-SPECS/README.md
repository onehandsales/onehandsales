# Goal Specs

상태: Draft
작성일: 2026-08-06

## 1. Goal 목록

| Goal | 문서 | 목적 |
| --- | --- | --- |
| G00 | `G00_SCOPE_CLASSIFICATION.md` | 후보 상태 확정과 06 작업 경계 고정 |
| G01 | `G01_06_SCOPE_GUARD_AND_CODE_AUDIT.md` | 06 작업 결과가 범위를 넓히지 않았는지 audit |
| G02 | `G02_NEXT_ACTION_REMINDER_CONTRACT.md` | 다음 행동 reminder 계약 여부 결정 |
| G03 | `G03_MEETING_NOTE_FOLLOW_UP_REMINDER_CONTRACT.md` | 회의록 follow-up reminder/자동 발송 후보 분리 |
| G04 | `G04_RECORD_SUMMARY_CONTRACT.md` | NBA-003 record summary 보류 결정과 NBA-004 MeetingNote list summary 분리 |
| G05 | `G05_PROVIDER_SMOKE_CLOSEOUT.md` | 05 G10 운영 provider smoke closeout |
| G06 | `G06_06_RECORD_SUMMARY_DEFER_CLOSEOUT.md` | 06/NBA-003 record summary defer 결정 closeout |
| G99 | `G99_PRE12_CLOSEOUT.md` | pre-12 재대조 closeout과 상위 문서 반영 |

## 2. 공통 금지

- confirmed API 없이 구현 goal로 들어가지 않는다.
- DB schema 변경 없이도 될 것처럼 추정하지 않는다.
- 06 완료 범위를 넓혀서 새 알림/summary 기능을 끼워 넣지 않는다.
- billing-linked 후보는 12 전 구현하지 않는다.
- 2026-08-06 A 결정으로 `NBA-003` 잔여 record summary는 12 전 계약화하지 않는다.
