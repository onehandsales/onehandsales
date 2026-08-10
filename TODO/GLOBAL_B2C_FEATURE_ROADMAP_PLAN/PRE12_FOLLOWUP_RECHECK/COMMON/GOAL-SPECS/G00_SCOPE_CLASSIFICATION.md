# G00 Scope Classification

상태: Completed / BEFORE_12 closeout reflected
작성일: 2026-08-07
최종 반영일: 2026-08-09
목표: 12 전 후속 후보의 상태를 확정하고 06/07/10/11 작업 경계를 다시 고정한다.

## 1. 목적

G00은 구현 goal이 아니다. 문서와 실제 코드 상태를 다시 대조해 후보별 상태를 확정하고, 2026-08-07 기준 `COMMON/FINAL-CLASSIFICATION.md`에서 12 전에 할 것 / post-12 / billing 충돌을 최종 분리했다.

2026-08-09 기준 아래 12 전 처리 대상 5개는 `TODO/DONE/BEFORE_12_TASKS`에서 모두 닫혔다. 따라서 이 문서의 `12 전에 할 것`은 당시 분류 결과이며, 현재 PRE12 잔여 작업은 없다.

최종 결론:

- 12 전에 닫힌 것: `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`
- post-12: `PRE12-F01`, `PRE12-F02`, `PRE12-F03`, `PRE12-F05`, `PRE12-F06`, `PRE12-F07`, `PRE12-F08`, `PRE12-F09`, `PRE12-F10`, `PRE12-F11`, `PRE12-F13`, `PRE12-F14`, `PRE12-F15`, `PRE12-F17`, `PRE12-F18`, `PRE12-F19`, `PRE12-F22`, `PRE12-F23`, `PRE12-F24`, `PRE12-F25`, `PRE12-F27`, `PRE12-F28`, `PRE12-F29`, `PRE12-F30`, `PRE12-F36`, `PRE12-F37`, `PRE12-F38`, `PRE12-F39`, `PRE12-F40`, `PRE12-F42`, `PRE12-F43`, `PRE12-F44`, `PRE12-F45`
- billing 충돌 / 12 종속: `PRE12-F12`, `PRE12-F20`, `PRE12-F21`, `PRE12-F26`, `PRE12-F35`, `PRE12-F41`
- 분류 제외 완료 참조: `PRE12-F16`

## 2. 포함 범위

- 01~11 완료 슬롯 재대조 결과 확인
- 01 Import scale/source/Admin 확장 후보 상태 확인
- 06, 07, 10, 11 문서와 현재 코드 상태 확인
- 12 Billing Subscription Tax 문서 확인
- `NotificationSourceType`, `DealActivityType`, `DealActivitySourceType`, `AiProviderOperation` 상태 확인
- 후보 matrix 갱신
- 06/07/10/11 후속 작업자가 바로 참고할 구현 금지 조건 보강
- 12 전에 할 것 / post-12 / billing 충돌 최종 분류 문서 작성 및 2026-08-09 BEFORE_12 closeout 결과 반영

## 3. 제외 범위

- 코드 구현
- Prisma schema 변경
- API contract confirmed 승격
- FE route/page/client 추가
- provider smoke 실행

## 4. 검증 기준

- `COMMON/CANDIDATE-MATRIX.md`의 모든 후보가 상태를 가진다.
- `COMMON/FINAL-CLASSIFICATION.md`에 12 전에 닫힌 것 / post-12 / billing 충돌 분류가 남는다.
- `COMMON/API-SPEC/README.md`에 12 전 confirmed API가 없음을 유지한다.
- 06/07/10에서 구현 가능한 범위와 금지 범위가 `README.md`, `SCOPE.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`에 일관되게 남는다.

## 5. 권장 확인 명령

```powershell
rg -n "enum NotificationSourceType|enum DealActivityType|enum DealActivitySourceType|enum AiProviderOperation" BE\prisma\schema.prisma
rg -n "NotificationSourceType|sourceType: \"NEXT|sourceType: \"MEETING|sourceType: \"FOLLOW" BE\src -g "*.ts"
rg -n "대용량 import|일정/회의록 import|ImportJob Admin|NEXT_ACTION|MEETING_NOTE|FOLLOW_UP|알림|reminder|자동 발송|latestActivity|Company/Contact/Product|MeetingNote 목록|PWA|offline|native|UserDraft|ExportJob|/app/export|/api/exports" TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\01_IMPORT_JOB_PERSISTENCE TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\06_DEAL_ACTIVITY_TIMELINE TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\07_MEETING_NOTE_AI_PROVIDER_LOG TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE -g "*.md"
```
