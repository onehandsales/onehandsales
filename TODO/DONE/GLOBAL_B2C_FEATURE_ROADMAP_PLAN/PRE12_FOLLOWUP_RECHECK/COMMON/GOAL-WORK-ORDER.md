# Goal Work Order

상태: Pre-12 Closeout Complete / BEFORE_12 반영 완료 / Billing moved to `TODO/PADDLE_PLAN`
작성일: 2026-08-06
최종 업데이트: 2026-08-11

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`를 `/goal` 단위로 실행할 때의 순서를 고정한다. 현재 확정 구현 goal은 없다. 2026-08-07 기준 최종 분류는 `FINAL-CLASSIFICATION.md`를 따르며, 2026-08-09 기준 선택된 PRE12 closeout은 모두 BEFORE_12에서 완료됐다.

## 2. 실행 순서

| 순서 | Goal | 상태 | 목적 | 구현 가능 여부 |
| ---: | --- | --- | --- | --- |
| G00 | `G00_SCOPE_CLASSIFICATION` | Completed | 후보 상태를 확정하고 완료 슬롯에 영향을 주는 경계를 다시 고정했다. | 문서/코드 검색만 가능 |
| G01 | `G01_06_SCOPE_GUARD_AND_CODE_AUDIT` | Not selected / covered by final classification | 06 완료 결과가 Notification/MeetingNote/Follow-up/list summary/activity lifecycle 범위를 잘못 넓히지 않았는지 확인하는 audit 후보였고, 최종 분류에서는 별도 PRE12 작업으로 선택하지 않는다. | 기능 구현 금지 |
| G02 | `G02_NEXT_ACTION_REMINDER_CONTRACT` | Classified 후속 | 다음 행동 reminder는 PRE12 구현하지 않고 후속 Notification policy 후보로 남긴다. | PRE12 구현 금지 |
| G03 | `G03_MEETING_NOTE_FOLLOW_UP_REMINDER_CONTRACT` | Classified 후속 | 회의록 follow-up reminder와 자동 발송 후보는 후속으로 분리한다. | PRE12 구현 금지 |
| G04 | `G04_RECORD_SUMMARY_CONTRACT` | Classified 후속 | NBA-003 Company/Contact/Product/generic summary/timeline은 2026-08-06 A 결정으로 후속 seed다. MeetingNote list summary도 후속 seed로 유지한다. | PRE12 구현 금지 |
| G05 | `G05_PROVIDER_SMOKE_CLOSEOUT` | Done / closed by BEFORE_12 G01 | 05 G10 Gmail/Microsoft provider smoke 실행 조건과 결과 기록을 닫았다. | 추가 구현 금지 |
| G06 | `G06_06_RECORD_SUMMARY_DEFER_CLOSEOUT` | Decided | 06/NBA-003 record summary defer 결정과 문서 동기화 범위를 닫는다. | 문서 closeout만 가능 |
| G07 | `G07_01_IMPORT_EXPANSION_DEFER_CLOSEOUT` | Decided | 01 import scale/source/Admin 확장 후보가 01 미완성이 아님을 닫는다. | 문서 closeout만 가능 |
| G08 | `G08_07_MEETING_NOTE_AI_FOLLOWUP_DEFER_CLOSEOUT` | Completed | 07 MeetingNote AI 후속 후보가 07 미완성이 아님을 닫고 PRE12 후보로 분류했다. | 문서 closeout만 가능 |
| G09 | `G09_08_GLOBAL_DATA_I18N_FOLLOWUP_DEFER_CLOSEOUT` | Completed | 08 Global Data I18N 후속 후보가 08 미완성이 아님을 닫고 PRE12 후보로 분류했다. | 문서 closeout만 가능 |
| G10 | `G10_09_PRODUCT_ANALYTICS_FOLLOWUP_DEFER_CLOSEOUT` | Completed | 09 Product Analytics 후속 후보가 09 미완성이 아님을 닫고 PRE12 후보로 분류했다. | 문서 closeout만 가능 |
| G11 | `G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT` | Completed | 10 Mobile PWA Field Use 후속 후보와 문서/코드 정합성 이슈가 10 미완성이 아님을 닫고 PRE12 후보로 분류했다. | 문서 closeout만 가능 |
| G12 | `G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT` | Completed | 11 Admin Operation 후속 후보와 문서/코드 정합성 이슈가 11 미완성이 아님을 닫고 PRE12 후보로 분류했다. | 문서 closeout만 가능 |
| G99 | `G99_PRE12_CLOSEOUT` | Done / 2026-08-09 | 06 후속 재검토 A 결정과 07~11 재대조 결과, 10/11 문서 정합성 closeout, BEFORE_12 완료 상태를 상위 문서에 반영했다. | 추가 구현 금지 |

## 2A. PRE12 실제 처리 대상

| 후보 | 처리 방식 | 완료 반영 |
| --- | --- | --- |
| `PRE12-F04` | 운영 Gmail/Microsoft provider smoke 결과 기록 | BEFORE_12 G01 완료 |
| `PRE12-F31` | 10 Mobile Field Use 문서 체크리스트 정합성 정리 | BEFORE_12 G02 완료 |
| `PRE12-F32` | User Web route/architecture 문서 정합성 정리 | BEFORE_12 G03 완료 |
| `PRE12-F33` | 11 Admin Operation 문서 체크리스트/goal index 정합성 정리 | BEFORE_12 G04 완료 |
| `PRE12-F34` | Admin Web architecture/legacy route 정합성 정리 | BEFORE_12 G05 완료 |

후속 후보 기준으로 위 5개 외에는 PRE12 구현 또는 문서 closeout 대상으로 올리지 않는다. 위 5개는 모두 닫혔고 PRE12 잔여 작업은 없다. G01 audit 후보는 `FINAL-CLASSIFICATION.md`의 후보 분류에 흡수하고 별도 PRE12 작업으로 남기지 않는다. G99는 선택된 PRE12 후보 closeout 이후 상위 문서 반영 여부를 점검하는 메타 closeout이므로 후보 분류에 넣지 않는다.

## 3. 선행 조건

- G00 분류 결과는 `FINAL-CLASSIFICATION.md`를 따른다.
- PRE12 처리 대상 5개 외에는 어떤 후보도 구현하지 않는다.
- API가 필요한 후보는 `COMMON/API-SPEC`에 confirmed 계약이 생긴 뒤에만 구현 goal로 전환한다.
- DB 변경이 필요한 후보는 `BE-TODO/DB-SCHEMA.md`에 model, enum, index, retention, ownership 기준이 생긴 뒤에만 구현 goal로 전환한다.
- Paddle/Billing과 직접 연결되는 후보는 PRE12 구현 goal로 전환하지 않는다.

## 4. 병렬 가능성

- G01 audit 후보는 final classification에 흡수됐고 별도 실행하지 않는다.
- G05 provider smoke closeout은 BEFORE_12 G01에서 완료됐다.
- G02, G03은 2026-08-07 최종 분류에서 후속으로 보냈으므로 PRE12 병렬 구현 대상이 아니다. G04의 NBA-003 분기는 2026-08-06 A 결정으로 PRE12 구현 계약화 대상에서 제외됐고, NBA-004 MeetingNote list summary는 후속 seed로 유지한다.
- G06은 구현 작업이 아니라 06/NBA-003 defer 결정의 문서 closeout이다.
- G07은 구현 작업이 아니라 01 import 확장 후보의 문서 closeout이다.
- G08은 구현 작업이 아니라 07 MeetingNote AI 후속 후보의 문서 closeout이며 완료됐다.
- G09는 구현 작업이 아니라 08 Global Data I18N 후속 후보의 문서 closeout이며 완료됐다.
- G10은 구현 작업이 아니라 09 Product Analytics 후속 후보의 문서 closeout이며 완료됐다.
- G11은 구현 작업이 아니라 10 Mobile PWA Field Use 후속 후보와 문서/코드 정합성 이슈의 문서 closeout이며 완료됐다.
- G12는 구현 작업이 아니라 11 Admin Operation 후속 후보와 문서/코드 정합성 이슈의 문서 closeout이며 완료됐다.
- G99는 모든 선택된 PRE12 작업이 끝난 뒤 실행하는 메타 closeout이며 2026-08-09 완료됐다.

## 5. 관련 문서

- `GOAL-SPECS/README.md`
- `CANDIDATE-MATRIX.md`
- `API-SPEC/README.md`
