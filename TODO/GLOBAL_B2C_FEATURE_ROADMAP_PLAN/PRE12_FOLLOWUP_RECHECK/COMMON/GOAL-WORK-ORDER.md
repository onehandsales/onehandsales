# Goal Work Order

상태: Draft
작성일: 2026-08-06

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`를 `/goal` 단위로 실행할 때의 순서를 고정한다. 현재 확정 구현 goal은 없다. 먼저 분류와 계약을 닫는다.

## 2. 실행 순서

| 순서 | Goal | 상태 | 목적 | 구현 가능 여부 |
| ---: | --- | --- | --- | --- |
| G00 | `G00_SCOPE_CLASSIFICATION` | Ready | 후보 상태를 확정하고 완료 슬롯에 영향을 주는 경계를 다시 고정한다. | 문서/코드 검색만 가능 |
| G01 | `G01_06_SCOPE_GUARD_AND_CODE_AUDIT` | Pending | 06 완료 결과가 Notification/MeetingNote/Follow-up 범위를 잘못 넓히지 않았는지 확인한다. | 문서 보정 가능, 기능 구현 금지 |
| G02 | `G02_NEXT_ACTION_REMINDER_CONTRACT` | Question | 다음 행동 reminder를 12 전에 할지, post-12 seed로 남길지 결정하고 계약 초안을 만든다. | 사용자 결정과 confirmed API 전 구현 금지 |
| G03 | `G03_MEETING_NOTE_FOLLOW_UP_REMINDER_CONTRACT` | Question | 회의록 follow-up reminder와 자동 발송 후보를 분리한다. | 사용자 결정과 confirmed API 전 구현 금지 |
| G04 | `G04_RECORD_SUMMARY_CONTRACT` | defer | 2026-08-06 A 결정은 NBA-003 Company/Contact/Product/generic summary/timeline에만 적용한다. MeetingNote list summary는 기존 NBA-004 post-12-seed로 분리 유지한다. | pre-12 구현 금지 |
| G05 | `G05_PROVIDER_SMOKE_CLOSEOUT` | Pending | 05 G10 Gmail/Microsoft provider smoke 실행 조건과 결과 기록을 닫는다. | 운영 smoke와 문서 기록 가능 |
| G06 | `G06_06_RECORD_SUMMARY_DEFER_CLOSEOUT` | Decided | 06/NBA-003 record summary defer 결정과 문서 동기화 범위를 닫는다. | 문서 closeout만 가능 |
| G07 | `G07_01_IMPORT_EXPANSION_DEFER_CLOSEOUT` | Decided | 01 import scale/source/Admin 확장 후보가 01 미완성이 아님을 닫는다. | 문서 closeout만 가능 |
| G08 | `G08_07_MEETING_NOTE_AI_FOLLOWUP_DEFER_CLOSEOUT` | Pending | 07 MeetingNote AI 후속 후보가 07 미완성이 아님을 닫고 PRE12 후보로 분류한다. | 문서 closeout만 가능 |
| G09 | `G09_08_GLOBAL_DATA_I18N_FOLLOWUP_DEFER_CLOSEOUT` | Pending | 08 Global Data I18N 후속 후보가 08 미완성이 아님을 닫고 PRE12 후보로 분류한다. | 문서 closeout만 가능 |
| G10 | `G10_09_PRODUCT_ANALYTICS_FOLLOWUP_DEFER_CLOSEOUT` | Pending | 09 Product Analytics 후속 후보가 09 미완성이 아님을 닫고 PRE12 후보로 분류한다. | 문서 closeout만 가능 |
| G11 | `G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT` | Pending | 10 Mobile PWA Field Use 후속 후보와 문서/코드 정합성 이슈가 10 미완성이 아님을 닫고 PRE12 후보로 분류한다. | 문서 closeout만 가능 |
| G12 | `G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT` | Completed | 11 Admin Operation 후속 후보와 문서/코드 정합성 이슈가 11 미완성이 아님을 닫고 PRE12 후보로 분류한다. | 문서 closeout만 가능 |
| G99 | `G99_PRE12_CLOSEOUT` | Pending | 06 후속 재검토 A 결정과 07~11 재대조 결과, 특히 08 Global Data I18N/09 Product Analytics/10 Mobile Field Use/11 Admin Operation 후속 분류를 상위 문서에 반영한다. | 문서 closeout 가능 |

## 3. 선행 조건

- G00 전에는 어떤 후보도 구현하지 않는다.
- API가 필요한 후보는 `COMMON/API-SPEC`에 confirmed 계약이 생긴 뒤에만 구현 goal로 전환한다.
- DB 변경이 필요한 후보는 `BE-TODO/DB-SCHEMA.md`에 model, enum, index, retention, ownership 기준이 생긴 뒤에만 구현 goal로 전환한다.
- 12와 직접 연결되는 후보는 12 전 구현 goal로 전환하지 않는다.

## 4. 병렬 가능성

- G01과 G05는 G00 이후 병렬 가능하다.
- G02, G03은 사용자 결정 또는 계약 확정이 필요하므로 병렬 구현 대상이 아니다. G04의 NBA-003 분기는 2026-08-06 A 결정으로 pre-12 구현 계약화 대상에서 제외됐고, NBA-004 MeetingNote list summary는 기존 post-12-seed로 유지한다.
- G06은 구현 작업이 아니라 06/NBA-003 defer 결정의 문서 closeout이다.
- G07은 구현 작업이 아니라 01 import 확장 후보의 문서 closeout이다.
- G08은 구현 작업이 아니라 07 MeetingNote AI 후속 후보의 문서 closeout이다.
- G09는 구현 작업이 아니라 08 Global Data I18N 후속 후보의 문서 closeout이다.
- G10은 구현 작업이 아니라 09 Product Analytics 후속 후보의 문서 closeout이다.
- G11은 구현 작업이 아니라 10 Mobile PWA Field Use 후속 후보와 문서/코드 정합성 이슈의 문서 closeout이다.
- G12는 구현 작업이 아니라 11 Admin Operation 후속 후보와 문서/코드 정합성 이슈의 문서 closeout이다.
- G99는 모든 선택된 pre-12 작업이 끝난 뒤 실행한다.

## 5. 관련 문서

- `GOAL-SPECS/README.md`
- `CANDIDATE-MATRIX.md`
- `API-SPEC/README.md`
