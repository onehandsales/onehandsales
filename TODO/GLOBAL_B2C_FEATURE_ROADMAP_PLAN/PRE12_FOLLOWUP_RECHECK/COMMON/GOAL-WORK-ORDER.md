# Goal Work Order

상태: Draft
작성일: 2026-08-06

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`를 `/goal` 단위로 실행할 때의 순서를 고정한다. 현재 확정 구현 goal은 없다. 먼저 분류와 계약을 닫는다.

## 2. 실행 순서

| 순서 | Goal | 상태 | 목적 | 구현 가능 여부 |
| ---: | --- | --- | --- | --- |
| G00 | `G00_SCOPE_CLASSIFICATION` | Ready | 후보 상태를 확정하고 06 작업에 영향을 주는 경계를 다시 고정한다. | 문서/코드 검색만 가능 |
| G01 | `G01_06_SCOPE_GUARD_AND_CODE_AUDIT` | Pending | 현재 06 작업 결과가 Notification/MeetingNote/Follow-up 범위를 잘못 넓히지 않았는지 확인한다. | 문서 보정 가능, 기능 구현 금지 |
| G02 | `G02_NEXT_ACTION_REMINDER_CONTRACT` | Question | 다음 행동 reminder를 12 전에 할지, post-12 seed로 남길지 결정하고 계약 초안을 만든다. | 사용자 결정과 confirmed API 전 구현 금지 |
| G03 | `G03_MEETING_NOTE_FOLLOW_UP_REMINDER_CONTRACT` | Question | 회의록 follow-up reminder와 자동 발송 후보를 분리한다. | 사용자 결정과 confirmed API 전 구현 금지 |
| G04 | `G04_RECORD_SUMMARY_CONTRACT` | Question | Company/Contact/Product latest summary와 MeetingNote list summary 후보의 privacy/API 기준을 만든다. | 사용자 결정과 confirmed API 전 구현 금지 |
| G05 | `G05_PROVIDER_SMOKE_CLOSEOUT` | Pending | 05 G10 Gmail/Microsoft provider smoke 실행 조건과 결과 기록을 닫는다. | 운영 smoke와 문서 기록 가능 |
| G99 | `G99_PRE12_CLOSEOUT` | Pending | 06~11 재대조 결과와 이 폴더의 후보 분류를 상위 문서에 반영한다. | 문서 closeout 가능 |

## 3. 선행 조건

- G00 전에는 어떤 후보도 구현하지 않는다.
- API가 필요한 후보는 `COMMON/API-SPEC`에 confirmed 계약이 생긴 뒤에만 구현 goal로 전환한다.
- DB 변경이 필요한 후보는 `BE-TODO/DB-SCHEMA.md`에 model, enum, index, retention, ownership 기준이 생긴 뒤에만 구현 goal로 전환한다.
- 12와 직접 연결되는 후보는 12 전 구현 goal로 전환하지 않는다.

## 4. 병렬 가능성

- G01과 G05는 G00 이후 병렬 가능하다.
- G02, G03, G04는 모두 사용자 결정 또는 계약 확정이 필요하므로 병렬 구현 대상이 아니다.
- G99는 모든 선택된 pre-12 작업이 끝난 뒤 실행한다.

## 5. 관련 문서

- `GOAL-SPECS/README.md`
- `CANDIDATE-MATRIX.md`
- `API-SPEC/README.md`

