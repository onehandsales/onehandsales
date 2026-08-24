# PRE12_FOLLOWUP_RECHECK Common

상태: DONE / Pre-12 Closeout Complete / Billing moved to `TODO/PADDLE_PLAN`
작성일: 2026-08-06
최종 업데이트: 2026-08-11

## 1. 목적

`COMMON`은 PRE12 후속 후보 재대조에서 Frontend와 Backend가 함께 봐야 했던 범위, 후보 상태, goal 순서, 구현 금지 조건을 보존한다.

이 계획은 곧바로 기능 구현을 시작하기 위한 문서가 아니다. 2026-08-07 기준 `FINAL-CLASSIFICATION.md`에서 01~11 후속 후보를 PRE12 처리 대상, 후속 seed, billing 충돌/Paddle 종속으로 최종 분리했다. 2026-08-09 기준 선택된 PRE12 처리 대상 5개는 `TODO/DONE/BEFORE_12_TASKS`에서 모두 closeout 완료로 반영됐다.

결론:

- PRE12에 닫힌 것: `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`
- 후속 seed: 제품 기능/정책/전략 후속 후보 대부분
- billing 충돌 / Paddle 종속: `PRE12-F12`, `PRE12-F20`, `PRE12-F21`, `PRE12-F26`, `PRE12-F35`, `PRE12-F41`
- 분류 제외 완료 참조: `PRE12-F16`
- PRE12 잔여 구현/API/DB/FE/문서 closeout: 없음
- billing 종속 후보: `TODO/PADDLE_PLAN/COMMON/PRE12-DEPENDENCY-MAP.md`로 이관

## 2. 문서 목록

- `SCOPE.md`: 포함 범위, 제외 범위, 05/06/07/10/11 작업 경계
- `CANDIDATE-MATRIX.md`: 후보별 출처, 현재 구현 상태, 기본 분류, 다음 조치
- `FINAL-CLASSIFICATION.md`: PRE12 처리 대상 / 후속 seed / billing 충돌 최종 분류 정본
- `06_RECORD_SUMMARY_DEFER_DECISION.md`: 2026-08-06 A 결정에 따른 `NBA-003` 잔여 record summary 보류 기준
- `GOAL-WORK-ORDER.md`: `/goal` 실행 순서
- `PLANNING-REVIEW.md`: 기획 검토 결과
- `API-SPEC/README.md`: 현재 확정 API 없음, 후보 API 계약 상태
- `GOAL-SPECS/README.md`: goal 상세 명세 목록
- `GOAL-SPECS/G08_07_MEETING_NOTE_AI_FOLLOWUP_DEFER_CLOSEOUT.md`: 07 MeetingNote AI 후속 후보 closeout
- `GOAL-SPECS/G09_08_GLOBAL_DATA_I18N_FOLLOWUP_DEFER_CLOSEOUT.md`: 08 Global Data I18N 후속 후보 closeout 완료
- `GOAL-SPECS/G10_09_PRODUCT_ANALYTICS_FOLLOWUP_DEFER_CLOSEOUT.md`: 09 Product Analytics 후속 후보 closeout 완료
- `GOAL-SPECS/G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT.md`: 10 Mobile PWA Field Use 후속 후보와 문서/코드 정합성 closeout 완료
- `GOAL-SPECS/G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md`: 11 Admin Operation 후속 후보와 문서/코드 정합성 closeout 완료
- `GOAL-SPECS/G99_PRE12_CLOSEOUT.md`: BEFORE_12 완료와 상위 문서 반영 closeout 완료

## 3. 현재 구현 금지 기준

아래는 `FINAL-CLASSIFICATION.md`에서 PRE12 처리 대상으로 남긴 운영 smoke/문서 정합성 외에는 구현하지 않는다.

- `NotificationSourceType`에 `NEXT_ACTION`, `MEETING_NOTE`, `FOLLOW_UP` 추가
- 다음 행동 reminder scheduling use case 추가
- 회의록 follow-up reminder scheduling use case 추가
- MeetingNote follow-up 자동 발송
- AI weekly report 자동 생성, AI suggestion 자동 mutation, MeetingNote AI 후보 자동 업무 mutation
- Follow-up delivery SMS 실제 provider, B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external email SaaS, HTML email/첨부/tracking pixel
- Company/Contact/Product latest summary response field 추가
- DealActivity manual delete/restore, automatic activity update/delete, retention/audit/trash, memo/private memo 통합, 모든 도메인 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단, summary cache/denormalized latest 추가
- MeetingNote list latest/next summary response field 추가
- AI data cleanup 제안 저장/적용 API 추가
- MeetingNote transcript/raw provider response/follow-up draft 저장 table 또는 raw 조회 API 추가
- 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API 추가
- generic ExportJob, PDF, recurrence
- Google Calendar export/write/양방향 sync/webhook/watch/reminders/attendees/multi-account/other provider
- billing/subscription/plan/payment/invoice/refund/failed payment/tax/paywall/churn/paid conversion runtime flow
- `/app` 보류 locale 또는 `zh-CN` locale 추가
- 전 세계 country/currency/phone dictionary 추가
- USD cent/minor unit migration 또는 amount precision 변경
- 국가별 tax/terms/pricing/address validation 추가
- Contact 개인 주소 field 추가
- email/password login, Microsoft login, Kakao runtime 복구, 신규 auth provider 추가
- `/app` locale route prefix 추가
- account deletion 실제 hard delete/anonymization processor 추가
- Notification/Calendar/follow-up 세부 analytics event를 runtime allowlist에 추가
- 외부 analytics provider forwarding port/adapter/runtime call 추가
- public site/UTM/ad attribution/growth experiment API/model 추가
- marketing opt-in/communication consent policy API/model/UI 추가
- PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution 추가
- BusinessCard 전용 `getUserMedia`, custom camera preview/crop/canvas capture flow를 `PRE12-F42` 계약 없이 추가
- `UserDraft`, `/api/drafts/*`, server draft DB, media/raw 저장을 `PRE12-F43` 정책 없이 10 후속처럼 추가
- `/app/export`, `/api/exports`, `ExportJob`을 10/PRE12 후속처럼 활성화
- stale FE architecture 문서에 맞추기 위해 `/app/notifications` route를 숨김 route로 되돌리기
- 11 문서 체크리스트/goal index 미체크를 근거로 Admin 기능 재구현
- stale Admin Web architecture 문서에 맞추기 위해 11 Admin route/API를 숨기거나 되돌리기
- Admin 직접 Trash 복구 mutation, 유료 복구 결제, Trash hard delete/purge 추가
- data export artifact 생성 processor, storage signed URL, download endpoint 추가
- 자동 민감정보 감지/DLP model 또는 processor 추가
- Admin 도메인 read-only records를 직접 수정/삭제/복구 mutation으로 확장
- `/organizations` redirect나 내부 AdminGuard를 Customer/B2B tenant admin으로 전환
- ImportJob cleanup 실패 전용 Admin 화면/API/집계를 `PRE12-F13` 전략 없이 추가

2026-08-06 A 결정 기준으로 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 PRE12 계약화 대상도 아니다. 별도 후속 재검토 전에는 G04를 구현 계약 goal로 전환하지 않는다.

06 재대조 기준으로 DealActivity model/repo/API, 자동 event, manual create/update, Deal list products/latestActivity, Contact dealCount, page size 15는 완료다. 삭제/보존/감사, memo 통합, 공통 activity bus, 검색/필터, score, AI 자동 판단, summary cache는 06 미완성이 아니라 `PRE12-F39` 후속 후보로 분리한다.

07 재대조 기준으로 MeetingNote AI/STT provider log, detail next action draft, detail follow-up draft, User Web AI 후속 작업 section은 완료다. MeetingNote 목록 latest/next summary, follow-up reminder/자동 발송, AI data cleanup 저장/적용, transcript/raw/follow-up draft 저장, AI 후보 자동 업무 mutation은 07 미완성이 아니라 `PRE12-F02`/`PRE12-F03`/`PRE12-F08`/`PRE12-F14`/`PRE12-F15`/`PRE12-F40` 후속 후보로 분리하고, Admin provider audit/raw access는 11 완료 범위를 참조한다.

05 재대조 기준으로 저장형 AI weekly report, 사용자 확인 기반 follow-up draft/send/retry/timeline, Gmail/Microsoft send adapter는 완료다. Gmail/Microsoft provider smoke closeout은 2026-08-10 배포 환경 verified 기준 BEFORE_12 G01에서 닫혔고, SMS 실제 provider, B2B sender/email sync/sequence/campaign/bulk/unsubscribe, 예약 발송/SMTP/HTML/첨부/tracking, 사용자 비용 노출, 영구 로그 legal deletion 정책은 05 미완성이 아니라 PRE12 후속 후보로 분리한다.

08 재대조 기준으로 `/app` 기본 `ko-KR/en` i18n, User global settings, KR/US phone/region, KRW/USD currency, Import/Export localization, Google/LINE/Apple auth는 완료다. 시장/국가/auth 확장과 UX polish는 08 미완성이 아니라 `PRE12-F17`~`PRE12-F25` 후속 후보 또는 후속 seed로 분류했고 G09 closeout을 완료했다.

09 재대조 기준으로 자체 DB `ProductAnalyticsEvent`, collector, core event, activation/retention, AI usage summary, billing reserved taxonomy, 10 mobile field-use event, 11 Admin analytics overview는 완료다. account deletion 실제 처리, 세부 event 확장, 외부 provider, attribution/experiment, marketing opt-in, PWA/native install attribution은 09 미완성이 아니라 `PRE12-F26`~`PRE12-F30` 및 `PRE12-F41` 후속 후보 또는 후속 seed로 분류했고 G10 closeout을 완료했다.

10 재대조 기준으로 BusinessCard capture/OCR safe failure, MeetingNote recording/STT fallback, local draft, browser push permission UX, mobile field analytics는 완료다. 10 FE/BE TODO 체크리스트와 FE route architecture 정합성은 `PRE12-F31`/`PRE12-F32`로 분류했고 BEFORE_12 G02/G03에서 닫았다. PWA/native packaging은 `PRE12-F30`, advanced camera preview/crop은 `PRE12-F42`, server draft/media raw storage policy는 `PRE12-F43`, generic ExportJob은 기존 `PRE12-F09`로 본다.

11 재대조 기준으로 `/admin/api/*`, Admin Web 운영 화면, audit/redaction, Trash/account request/provider/system gate는 완료다. 11 문서 체크리스트와 Admin Web architecture/legacy route 정합성은 `PRE12-F33`/`PRE12-F34`로 분류했고 BEFORE_12 G04/G05에서 닫았다. Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지는 11 완료 범위를 넓히지 않는 `PRE12-F35`~`PRE12-F37` 후속 후보로만 둔다. 2026-08-07 2차 재대조에서 Admin 직접 도메인 데이터 mutation은 `PRE12-F44`, Customer/B2B tenant admin은 `PRE12-F45`로 추가 분리했고, ImportJob cleanup 실패 전용 aggregate/system gate는 기존 `PRE12-F13`에 연결했다.

## 4. 관련 문서

- `../README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`
- `TODO/PADDLE_PLAN/COMMON/PRE12-DEPENDENCY-MAP.md`
