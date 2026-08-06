# Pre-12 Follow-up Recheck

상태: Draft / 12 전 후속 범위 정리 / 구현 시작 금지
작성일: 2026-08-06
최종 업데이트: 2026-08-06
성격: 01~11 완료 슬롯 재대조에서 나온 후속 후보를 12 착수 전 결정에 연결하는 작업 폴더

## 1. 목적

이 폴더는 `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 기존 01~11 완료 의미를 깨지 않으면서, 12 착수 전에 다시 확인해야 하는 후속 후보를 한곳에 묶는다.

현재 문서는 01~11 재대조와 06 후속 재검토 A 결정, 07 MeetingNote AI 후속 후보 재대조, 10 Mobile Field Use 문서/코드 정합성 재검토, 11 Admin Operation 문서/코드 정합성 재검토를 반영했다. 따라서 이 문서는 특히 01, 02, 03, 05, 06, 07, 08, 09, 10, 11 사이에서 오해하기 쉬운 다음 항목을 분리한다.

- 01에서 제외된 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API
- 02에서 제외된 다음 행동 알림
- 02에서 제외된 회의록 후속 알림
- 02 문서에 보관 후보로 남은 Notification 데이터 TTL/cleanup 정책
- 03에서 제외된 PDF, generic ExportJob, 반복 일정 정식 모델
- 04에서 제외된 Google export/write/양방향 sync, realtime webhook/watch, 반복 일정 정식 모델, Google reminders import, 참석자/contact auto-link, 여러 Google 계정, Google Calendar 외 provider
- 05에서 남은 Gmail/Microsoft provider smoke
- 05에서 제외된 SMS 실제 provider, B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external email SaaS, HTML/첨부/tracking, 사용자 비용 노출, 영구 로그 legal deletion 정책
- 06에서 닫은 DealActivity 범위와 06 밖으로 남은 record summary, activity lifecycle/search/score 후보
- 07에서 닫은 MeetingNote 상세 AI 후보와 07 밖으로 남은 목록 summary, 자동 발송, 알림, AI data cleanup, raw/transcript 저장 후보
- 08에서 닫은 Global Data I18N 범위와 08 밖으로 남은 시장/국가/통화/전화번호/auth/UX polish 후보
- 09에서 닫은 Product Analytics foundation과 09 밖으로 남은 account deletion 실제 처리, 세부 analytics event, 외부 provider, attribution/experiment, PWA/native 후보
- 10에서 닫은 mobile browser field-use 범위와 10 밖으로 남은 PWA/offline/native, generic ExportJob, 문서 체크리스트/architecture 정합성 후보
- 11에서 닫은 Admin 운영 범위와 11 밖으로 남은 Admin 문서 정합성, Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지 후보

이 폴더는 13번 기능 폴더가 아니다. 12 전에 기존 완료 슬롯을 재대조하기 위한 보조 계획이며, 12 Billing 범위를 우회하는 구현 계획이 아니다.

## 2. 현재 결론

| 영역 | 현재 판정 | 구현 판단 |
| --- | --- | --- |
| 01 ImportJob | 완료 | 대용량 worker, 일정/회의록 import, generic ExportJob, Admin 전용 화면/API는 01 미완성이 아니다. |
| 02 Notification | 완료 | 일정/딜 reminder, in-app/email/browser push, provider smoke는 완료다. 다음 행동 알림과 회의록 후속 알림은 구현되지 않았다. Notification 데이터 TTL/cleanup은 구현 완료 범위가 아니라 정책 후속 후보로 분리한다. |
| 03 Weekly Schedule Report | 완료 | PDF, generic ExportJob, recurrence는 03 재오픈 대상이 아니다. |
| 04 Google Calendar | 완료 | read-only import/sync/source badge/Trash restore/Google-origin reminder/provider smoke는 완료다. Google export/write/양방향 sync, webhook/watch, 반복 일정 정식 모델, reminders/attendee import, 여러 Google 계정, Google Calendar 외 provider는 후속이다. |
| 05 AI Weekly Sales Report | 구현 완료 / provider smoke pending | AI weekly report 저장/버전/스냅샷, 사용자 확인 기반 follow-up draft/send/retry/timeline, Gmail/Microsoft email adapter와 자동 검증은 완료됐다. 운영 credential/callback/allowlist 기반 실제 수신자 smoke는 남아 있다. SMS 실제 provider, B2B sender/email sync/sequence/campaign/bulk/unsubscribe, 예약 발송/SMTP/HTML/첨부/tracking, 사용자 비용 노출, 영구 로그 legal deletion 정책은 후속이다. |
| 06 DealActivity | 완료 이력 유지 / A 결정 반영 | 06은 DealActivity timeline, manual create/update, Deal list latestActivity, products summary, Contact dealCount 범위를 넘기지 않고 완료로 유지한다. record summary 잔여는 `PRE12-F07`, activity lifecycle/search/score 확장은 `PRE12-F39`로 분리한다. |
| 07 MeetingNote AI | 완료 이력 유지 / G08 closeout 완료 | 상세 next action/follow-up draft와 provider log는 완료다. 회의록 목록 summary, 자동 발송, 알림, AI data cleanup, transcript/raw/follow-up draft 저장은 07 완료 범위가 아니다. Admin provider audit/raw access는 11 완료 범위를 참조한다. |
| 08 Global Data I18N | 완료 이력 유지 | `/app` `ko-KR/en`, User global settings, KR/US phone/region, KRW/USD currency, Import/Export localization, Google/LINE/Apple auth는 완료다. `ja/zh-TW`, `zh-CN`, 전 세계 국가/통화/전화번호, minor unit, 상세 주소 검증, auth strategy 확장은 08 미완성이 아니다. |
| 09 Product Analytics | 완료 이력 유지 | 자체 DB `ProductAnalyticsEvent`, collector, server/client event, activation/retention snapshot, AI usage summary, 10 mobile field-use event와 11 Admin analytics 연결은 완료다. account deletion 실제 hard delete/anonymization job, 세부 event 확장, 외부 provider, UTM/experiment, PWA/native install attribution은 09 완료 범위가 아니다. |
| 10 Mobile PWA Field Use | 완료 이력 유지 / 문서 정합성 후보 있음 | 명함 촬영/OCR safe failure, 회의 녹음/STT fallback, FE local draft 24시간 TTL, browser push permission UX, mobile field analytics는 완료다. PWA install/offline shell/full offline sync/iOS/Android native app/native push/contact/calendar는 후속이고, 10 FE/BE TODO 체크리스트 미체크와 FE route architecture stale은 문서 정리 후보다. |
| 11 Admin Operation | 완료 이력 유지 / 문서 정합성 후보 있음 | `/admin/api/*`, Admin Web 운영 화면, audit/redaction, Trash/account request/provider/system gate는 완료다. 11 문서 체크리스트와 Admin Web architecture 일부는 stale이고, Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지는 11 완료 범위가 아니다. |

2026-08-06 사용자 결정 A에 따라 `NBA-003` 잔여인 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 계약화/구현 대상이 아니다. 이 후보들은 B2B 또는 team CRM 성격이 더 강한 post-12 전략 재검토 seed로 남기며, UX/UI 전체 polish도 지금 06 후속으로 하지 않고 별도 전면 유지보수 계획에서 다룬다.

## 3. 06 완료 이후 적용할 경계

06 완료 범위와 이후 07~11 재대조는 아래 경계를 지킨다.

- `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`는 DealActivity event로만 본다.
- `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED`는 DealActivity event로만 본다.
- `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED`는 Deal target을 가진 follow-up delivery attempt의 safe summary로만 본다.
- 다음 행동 reminder 생성, 회의록 follow-up reminder 생성, MeetingNote follow-up 자동 발송은 06 구현 범위에 넣지 않는다.
- private memo, provider raw response, follow-up body 전체, meeting note raw text 전문을 timeline summary, list summary, log에 넣지 않는다.
- 수동 activity 삭제, 자동 activity 수정/삭제, activity soft delete/trash/restore/retention/audit, memo/private memo timeline 통합, 모든 도메인 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단, DealActivity summary cache/denormalized latest는 06 완료 범위가 아니다.

## 4. 후보 분류

| 후보 | 기본 상태 | 다음 처리 |
| --- | --- | --- |
| 다음 행동 reminder | Question / 계약 필요 | G00에서 12 전 처리 여부를 결정한다. 결정 전 구현 금지. |
| 회의록 follow-up reminder | post-12-seed | G03에서 상태를 재확인한다. 자동 발송과 함께 정책 결정이 필요하다. |
| MeetingNote follow-up 자동 발송 | post-12-seed | G03에서 reminder와 분리한다. 명시적 사용자 확인 없는 발송은 구현 금지다. |
| Notification 데이터 TTL/cleanup | post-12-seed / trust-ops policy | 02의 `Notification` 90일, `NotificationDeliveryAttempt` 30일, revoked `BrowserPushSubscription` 90일 보관 후보는 실제 cleanup 구현이 없다. 정책/운영 계약 전 구현하지 않는다. |
| Gmail/Microsoft provider smoke | pre-12-follow-up-needed | G05에서 운영 credential/callback/allowlist 준비 후 실행 기록만 닫는다. 코드 구현 후보가 아니다. |
| SMS 실제 provider | post-12-seed | `PRE12-F05`로 유지한다. 현재 SMS sender verification UI/API foundation은 있으나 실제 vendor 연동은 없다. |
| Follow-up delivery 고급 provider/growth 확장 | post-12-seed | `PRE12-F06`으로 유지한다. B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external email SaaS, HTML/첨부/tracking은 05 완료 범위가 아니다. |
| Company/Contact/Product latest summary | defer | 2026-08-06 A 결정으로 12 전 G04 계약화와 구현을 하지 않는다. |
| DealActivity lifecycle/search/score 확장 | post-12-seed / trust-product policy | `PRE12-F39`로 둔다. 수동 삭제/retention/audit, memo 통합, 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단은 06 미완성이 아니다. |
| MeetingNote list latest/next summary | post-12-seed 또는 별도 MeetingNote list 후보 | 12 전 구현하지 않는다. 07 결과와 연결한 목록 summary 계약은 post-12 재검토에서 필요성이 확인될 때만 만든다. |
| AI data cleanup 제안 저장/적용 | post-12-seed / 별도 data quality 계획 | 07에서는 제외한다. 09 또는 별도 data quality 계획에서 권한, 적용, 감사 로그, rollback 기준을 정한 뒤 판단한다. |
| transcript/raw provider response/follow-up draft 저장 | defer / 정책 필요 | retention, 삭제권, raw access audit, redaction 정책 없이는 구현하지 않는다. |
| Import scale/source/Admin 확장 | post-12-seed | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 미완성이 아니다. |
| generic ExportJob/PDF 및 Google Calendar 고급 연동 | post-12-seed | `PRE12-F09`와 `PRE12-F10`으로 유지한다. Google export/write/양방향 sync, webhook/watch, 반복 일정, reminders/attendee, multi-account/provider 확장은 12 완료 후 새 TODO로 승격할지 판단한다. |
| billing/paywall/churn/paid conversion/AI usage billing source | billing-blocked | 05/09의 내부 cost/usage summary는 과금 정본이 아니다. 12 전 임시 구현 금지. |
| `/app` `ja`, `zh-TW` 번역과 시장별 UX writing | post-12-seed | 일본/대만 판매 준비 goal에서 다룬다. 08 완료 범위는 `ko-KR/en`이다. |
| `zh-CN` 중국 본토 지원 | defer / 시장 진입 결정 필요 | 중국 본토 시장, 인프라, 정책, 결제/세금 기준이 없으면 구현하지 않는다. |
| 전 세계 국가/통화/전화번호 확장 | post-12-seed | KR/US, KRW/USD 1차 검증 뒤 실제 판매 국가 기준으로 확장한다. |
| USD cent/minor unit | billing-blocked | 12 Billing money model과 기존 금액 migration 기준 없이 구현하지 않는다. |
| 국가별 상세 주소 검증/세금/약관/가격 정책 | billing-blocked | 12 Payment/Tax/Policy 범위와 연결한다. |
| Contact 개인 주소 | post-12-seed | CRM 확장 요구가 명확해질 때 별도 Contact data expansion으로 판단한다. |
| Auth strategy 확장 | defer / 정책 필요 | 이메일/비밀번호, Microsoft login, Kakao runtime 복구, 신규 provider는 별도 auth strategy 결정 전 구현 금지. |
| `/app` locale route prefix | defer / guardrail | 새 라우팅 계약 없이 `/app`에 locale prefix를 붙이지 않는다. |
| app i18n/Settings/bundle polish | post-12-seed / UXUI quality | legacy static fallback 직접 keying, Settings OAuth 계정 라벨, Vite large chunk warning은 08 blocker가 아니다. |
| account deletion 실제 hard delete/anonymization job | Question / 정책 필요 | 09는 30일 유예 후 user-linked analytics 삭제 기준을 세웠고 11은 요청/취소/Admin queue를 구현했다. 실제 삭제 job은 privacy/legal/session revoke/billing 영향을 확정하기 전 구현하지 않는다. |
| Product analytics 세부 event 확장 | post-12-seed / 별도 analytics 계획 | Notification delivery/click/reach, Google Calendar sync detail, AI weekly/follow-up delivery detail event는 09 최소 taxonomy에 넣지 않는다. |
| 외부 analytics provider forwarding | post-12-seed / growth/ops | 자체 DB analytics 정본을 유지하고 Segment/PostHog/Mixpanel류 provider port/adapter/runtime call은 별도 계획에서 판단한다. |
| public site/UTM/ad attribution/growth experiment | post-12-seed / growth/marketing | 09는 core `/app` route view만 수집했다. public route, UTM/referrer/ad attribution, experiment assignment API/model은 후속이다. |
| PWA/native packaging과 install attribution | post-12-seed / 별도 mobile roadmap | 10은 mobile browser field-use까지 완료했다. PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution은 후속으로 유지한다. |
| 10 FE/BE TODO 체크리스트 정합성 | pre-12-doc-cleanup | 10 README/G07 closeout/실제 코드 기준 완료다. `10/FE-TODO`의 G03~G06, `10/BE-TODO`의 G03/G05/G06 미체크는 기능 미구현이 아니라 문서 체크리스트 정리 대상이다. |
| User Web route/architecture 문서 정합성 | pre-12-doc-cleanup | 실제 `/app/notifications`는 활성이고 `/app/export`만 redirect다. FE architecture 문서의 stale route 설명을 실제 router 기준으로 정정한다. |
| 11 문서 체크리스트/goal index 정합성 | pre-12-doc-cleanup | 11 README/G10 closeout/실제 코드 기준 완료다. `11/COMMON/GOAL-COMPLETION-CHECKLIST`, `11/COMMON/GOAL-SPECS/README`, `11/BE-TODO`, `11/FE-TODO`의 planning/미체크 상태는 기능 미구현이 아니라 문서 정리 대상이다. |
| Admin Web architecture 문서 정합성 | pre-12-doc-cleanup | 실제 Admin Web route와 API 연동은 11 범위로 활성화됐다. `FE/admin-web/ARCHITECTURE.md`의 stale 설명을 실제 router/API 기준으로 정정한다. |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | Question / 정책 및 billing 필요 | 11은 User 복구 문의와 Admin queue까지만 완료했다. Admin mutation, 유료 복구 결제, hard delete/purge는 recovery policy와 12 Billing 이후 판단한다. |
| User data export artifact/download endpoint | post-12-seed / `PRE12-F09` 연결 | 11은 request/Admin queue를 완료했고 실제 artifact 생성 processor, signed URL, download controller는 없다. ExportJob/file retention/audit 계약 전 구현하지 않는다. |
| 자동 민감정보 감지 | defer / 정책 필요 | 11의 masking/raw access와 별개인 자동 탐지 기능이다. 보안/data governance 계약 전 구현하지 않는다. |

## 5. 문서 구조

```text
PRE12_FOLLOWUP_RECHECK/
  README.md
  COMMON/
    README.md
    SCOPE.md
    CANDIDATE-MATRIX.md
    06_RECORD_SUMMARY_DEFER_DECISION.md
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
      G06_06_RECORD_SUMMARY_DEFER_CLOSEOUT.md
      G07_01_IMPORT_EXPANSION_DEFER_CLOSEOUT.md
      G08_07_MEETING_NOTE_AI_FOLLOWUP_DEFER_CLOSEOUT.md
      G09_08_GLOBAL_DATA_I18N_FOLLOWUP_DEFER_CLOSEOUT.md
      G10_09_PRODUCT_ANALYTICS_FOLLOWUP_DEFER_CLOSEOUT.md
      G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT.md
      G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md
      G99_PRE12_CLOSEOUT.md
  BE-TODO/
    API-TODO.md
    DB-SCHEMA.md
  FE-TODO/
    ADMIN-WEB-TODO.md
    USER-WEB-TODO.md
```

## 6. 실행 원칙

1. G00을 먼저 실행해 후보 상태를 확정한다.
2. API/DB/FE 구현이 필요한 후보는 `COMMON/API-SPEC` 계약이 `confirmed`로 오른 뒤 별도 goal로 쪼갠다.
3. `draft` 또는 `Question` 상태의 후보는 controller, service, repository, Prisma schema, FE route로 구현하지 않는다.
4. 06 작업 중 발견한 보정은 06 완료 범위를 넓히는 방식이 아니라 이 폴더의 후보 상태로 기록한다.
5. billing/paywall/churn/paid conversion/invoice/tax와 연결된 항목은 12 전 구현하지 않는다.
6. `NBA-003` 잔여 record summary는 2026-08-06 A 결정에 따라 12 전 API/DB/FE 계약 대상으로 보지 않는다.
7. G06, G07, G08, G09, G10, G11, G12는 문서 closeout으로만 사용하고 구현 goal로 전환하지 않는다.
8. G08은 07 후속 후보를 PRE12 후보로 닫은 closeout이며, 07 폴더에 새 구현 goal을 만들지 않는다.
9. G09는 08 후속 후보를 PRE12 후보로 닫는 closeout이며, 08 폴더에 새 구현 goal을 만들지 않는다.
10. G10은 09 후속 후보를 PRE12 후보로 닫는 closeout이며, 09 폴더에 새 구현 goal을 만들지 않는다.
11. G11은 10 후속 후보와 문서/코드 정합성 이슈를 PRE12 후보로 닫는 closeout이며, 10 폴더에 새 구현 goal을 만들지 않는다.
12. G12는 11 후속 후보와 문서/코드 정합성 이슈를 PRE12 후보로 닫는 closeout이며, 11 폴더에 새 구현 goal을 만들지 않는다.

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
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
