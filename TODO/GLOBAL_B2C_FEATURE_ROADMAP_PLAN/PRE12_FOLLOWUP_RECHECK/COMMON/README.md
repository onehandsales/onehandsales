# PRE12_FOLLOWUP_RECHECK Common

상태: Draft
작성일: 2026-08-06

## 1. 목적

`COMMON`은 12 전 후속 후보 재대조에서 Frontend와 Backend가 함께 봐야 하는 범위, 후보 상태, goal 순서, 구현 금지 조건을 관리한다.

이 계획은 곧바로 기능 구현을 시작하기 위한 문서가 아니다. 먼저 01~05에서 나온 후속 후보가 06 작업에 들어가야 하는지, 07 또는 post-12 후보로 남겨야 하는지, 12 Billing과 충돌하는지 분류한다.

## 2. 문서 목록

- `SCOPE.md`: 포함 범위, 제외 범위, 06 작업 경계
- `CANDIDATE-MATRIX.md`: 후보별 출처, 현재 구현 상태, 기본 분류, 다음 조치
- `06_RECORD_SUMMARY_DEFER_DECISION.md`: 2026-08-06 A 결정에 따른 `NBA-003` 잔여 record summary 보류 기준
- `GOAL-WORK-ORDER.md`: `/goal` 실행 순서
- `PLANNING-REVIEW.md`: 기획 검토 결과
- `API-SPEC/README.md`: 현재 확정 API 없음, 후보 API 계약 상태
- `GOAL-SPECS/README.md`: goal 상세 명세 목록

## 3. 현재 구현 금지 기준

아래는 G00과 API 계약 확정 전까지 구현하지 않는다.

- `NotificationSourceType`에 `NEXT_ACTION`, `MEETING_NOTE`, `FOLLOW_UP` 추가
- 다음 행동 reminder scheduling use case 추가
- 회의록 follow-up reminder scheduling use case 추가
- MeetingNote follow-up 자동 발송
- Company/Contact/Product latest summary response field 추가
- MeetingNote list latest/next summary response field 추가
- generic ExportJob, PDF, recurrence, Google Calendar write/watch
- billing/paywall/churn/paid conversion runtime flow

2026-08-06 A 결정 기준으로 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 pre-12 계약화 대상도 아니다. post-12 재검토 전에는 G04를 구현 계약 goal로 전환하지 않는다.

## 4. 관련 문서

- `../README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`
