# G06 06 Record Summary Defer Closeout

상태: Decided
작성일: 2026-08-06

## 1. 목표

06 후속 재검토에서 나온 `NBA-003` record summary/timeline 잔여 범위를 pre-12 구현 대상에서 제외하고, 06 완료 의미가 깨지지 않도록 관련 문서의 표기와 경계를 닫는다.

이 goal은 구현 goal이 아니다. `COMMON/06_RECORD_SUMMARY_DEFER_DECISION.md`를 정본 결정으로 삼아 문서 동기화와 충돌 문구 제거만 다룬다.

## 2. 정본 결정

- 06은 Completed 상태를 유지한다.
- Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 계약화/구현 대상이 아니다.
- 위 잔여 범위는 post-12의 B2B/team CRM 전략 후보로 보류한다.
- `NBA-004` MeetingNote list summary는 2026-08-06 A 결정 범위에 섞지 않고 기존 post-12 seed로 분리 유지한다.
- UX/UI 전체 polish는 지금 진행하지 않고, 12와 post-12 재검토 이후 별도 전면 유지보수 계획에서 다룬다.

## 3. 확인 범위

- `PRE12_FOLLOWUP_RECHECK/README.md`
- `COMMON/SCOPE.md`
- `COMMON/CANDIDATE-MATRIX.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`
- `06_DEAL_ACTIVITY_TIMELINE` 문서
- `NEXT_BACKEND_API_BACKLOG_PLAN`
- `USER_WEB_PRODUCTIZATION_GAP_PLAN`

## 4. 제외 범위

- Company/Contact/Product summary API 계약 추가
- generic summary endpoint 계약 추가
- record별 상세 timeline API/DB/FE 구현
- MeetingNote list summary의 pre-12 전환
- 06 UI polish 또는 12 이후 전면 유지보수 계획 작성

## 5. 완료 기준

- `06_RECORD_SUMMARY_DEFER_DECISION.md`와 `GOAL-SPECS` 색인이 서로 연결된다.
- `06~11 남은 재검토`처럼 06이 아직 미검토 대상처럼 읽히는 문구가 남지 않는다.
- `NBA-003` 보류 결정과 `NBA-004` MeetingNote list summary seed가 섞이지 않는다.
- 상태 분류 용어가 `SCOPE.md`의 taxonomy와 충돌하지 않는다.
- G99 closeout에서 G06 완료 여부를 선행 조건으로 확인할 수 있다.
