# PRE12_FOLLOWUP_RECHECK Common

상태: Draft
작성일: 2026-08-06

## 1. 목적

`COMMON`은 12 전 후속 후보 재대조에서 Frontend와 Backend가 함께 봐야 하는 범위, 후보 상태, goal 순서, 구현 금지 조건을 관리한다.

이 계획은 곧바로 기능 구현을 시작하기 위한 문서가 아니다. 먼저 01~11 완료 슬롯 재대조에서 나온 후속 후보가 pre-12 closeout, post-12 seed, defer, billing-blocked 중 어디에 남아야 하는지 분류한다.

## 2. 문서 목록

- `SCOPE.md`: 포함 범위, 제외 범위, 06 작업 경계
- `CANDIDATE-MATRIX.md`: 후보별 출처, 현재 구현 상태, 기본 분류, 다음 조치
- `06_RECORD_SUMMARY_DEFER_DECISION.md`: 2026-08-06 A 결정에 따른 `NBA-003` 잔여 record summary 보류 기준
- `GOAL-WORK-ORDER.md`: `/goal` 실행 순서
- `PLANNING-REVIEW.md`: 기획 검토 결과
- `API-SPEC/README.md`: 현재 확정 API 없음, 후보 API 계약 상태
- `GOAL-SPECS/README.md`: goal 상세 명세 목록
- `GOAL-SPECS/G08_07_MEETING_NOTE_AI_FOLLOWUP_DEFER_CLOSEOUT.md`: 07 MeetingNote AI 후속 후보 closeout
- `GOAL-SPECS/G09_08_GLOBAL_DATA_I18N_FOLLOWUP_DEFER_CLOSEOUT.md`: 08 Global Data I18N 후속 후보 closeout

## 3. 현재 구현 금지 기준

아래는 G00과 API 계약 확정 전까지 구현하지 않는다.

- `NotificationSourceType`에 `NEXT_ACTION`, `MEETING_NOTE`, `FOLLOW_UP` 추가
- 다음 행동 reminder scheduling use case 추가
- 회의록 follow-up reminder scheduling use case 추가
- MeetingNote follow-up 자동 발송
- Company/Contact/Product latest summary response field 추가
- MeetingNote list latest/next summary response field 추가
- AI data cleanup 제안 저장/적용 API 추가
- MeetingNote transcript/raw provider response/follow-up draft 저장 table 또는 raw 조회 API 추가
- 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API 추가
- generic ExportJob, PDF, recurrence, Google Calendar write/watch
- billing/paywall/churn/paid conversion runtime flow
- `/app` `ja`, `zh-TW`, `zh-CN` locale 추가
- 전 세계 country/currency/phone dictionary 추가
- USD cent/minor unit migration 또는 amount precision 변경
- 국가별 tax/terms/pricing/address validation 추가
- Contact 개인 주소 field 추가
- email/password login, Microsoft login, Kakao runtime 복구, 신규 auth provider 추가
- `/app` locale route prefix 추가

2026-08-06 A 결정 기준으로 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 pre-12 계약화 대상도 아니다. post-12 재검토 전에는 G04를 구현 계약 goal로 전환하지 않는다.

08 재대조 기준으로 `/app` 기본 `ko-KR/en` i18n, User global settings, KR/US phone/region, KRW/USD currency, Import/Export localization, Google/LINE/Apple auth는 완료다. 시장/국가/auth 확장과 UX polish는 08 미완성이 아니라 PRE12 후속 후보 또는 post-12 seed로 분류한다.

## 4. 관련 문서

- `../README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`
