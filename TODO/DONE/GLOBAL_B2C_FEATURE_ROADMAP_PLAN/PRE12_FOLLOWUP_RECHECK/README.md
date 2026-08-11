# Pre-12 Follow-up Recheck

상태: DONE / Pre-12 Closeout Complete / Billing moved to `TODO/PADDLE_PLAN`
작성일: 2026-08-06
최종 업데이트: 2026-08-11
성격: 01~11 완료 슬롯 재대조에서 나온 후속 후보를 분류하고, billing 종속 후보를 `TODO/PADDLE_PLAN`으로 이관한 완료 이력 폴더

## 1. 목적

이 폴더는 `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 기존 01~11 완료 의미를 깨지 않으면서, Paddle 이관 전에 다시 확인해야 했던 후속 후보를 한곳에 묶은 완료 이력이다.

2026-08-07 기준 최종 3분류는 `COMMON/FINAL-CLASSIFICATION.md`를 정본으로 본다. 결론은 PRE12 새 기능 구현 없음, PRE12 운영 smoke/문서 정합성만 closeout, 나머지는 후속 seed 또는 Billing/Paddle 종속으로 분리다.

2026-08-09 기준 선택된 PRE12 처리 대상 `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`는 모두 `TODO/DONE/BEFORE_12_TASKS`에서 closeout 완료로 반영됐다. `PRE12-F04` provider smoke는 2026-08-10 배포 환경 smoke verified 기준으로 BEFORE_12 G01에서 완료 처리했으며, 실배포 환경 재확인은 PRE12 잔여 작업으로 남기지 않는다.

2026-08-10 재검토에서 11 Admin Operation의 Admin provider failure 목록 cursor pagination 편중 누락 Finding은 `PrismaAdminProviderFailureRepository` batch 조회와 회귀 테스트로 해결했다. 이 보정은 기존 11 완료 범위의 품질 수정이며, PRE12 잔여 작업 또는 Paddle Billing 선행 blocker로 남기지 않는다.

현재 문서는 01~11 재대조와 06 후속 재검토 A 결정, 07 MeetingNote AI 후속 후보 재대조, 08 Global Data I18N 후속 후보 재대조, 09 Product Analytics 후속 후보 재대조, 10 Mobile Field Use 후속 후보 2차 재대조, 11 Admin Operation 후속 후보 closeout, BEFORE_12 G01~G06 완료 결과를 반영했다. 따라서 이 문서는 특히 01, 02, 03, 05, 06, 07, 08, 09, 10, 11 사이에서 오해하기 쉬운 다음 항목을 분리한다.

- 01에서 제외된 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API, ImportJob cleanup 실패 전용 aggregate/system gate
- 02에서 제외된 다음 행동 알림
- 02에서 제외된 회의록 후속 알림
- 02 문서에 보관 후보로 남은 Notification 데이터 TTL/cleanup 정책
- 03에서 제외된 PDF, generic ExportJob, 반복 일정 정식 모델
- 04에서 제외된 Google export/write/양방향 sync, realtime webhook/watch, 반복 일정 정식 모델, Google reminders import, 참석자/contact auto-link, 여러 Google 계정, Google Calendar 외 provider
- 05에서 닫은 Gmail/Microsoft provider smoke closeout
- 05에서 제외된 SMS 실제 provider, B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external email SaaS, HTML/첨부/tracking, 사용자 비용 노출, 영구 로그 legal deletion 정책
- 06에서 닫은 DealActivity 범위와 06 밖으로 남은 record summary, activity lifecycle/search/score 후보
- 07에서 닫은 MeetingNote 상세 AI 후보와 07 밖으로 남은 목록 summary, 자동 발송, 알림, AI data cleanup, raw/transcript 저장, AI 후보 자동 업무 mutation 후보
- 08에서 닫은 Global Data I18N 범위와 08 밖으로 남은 시장/국가/통화/전화번호/auth/UX polish 후보
- 09에서 닫은 Product Analytics foundation과 09 밖으로 남은 account deletion 실제 처리, 세부 analytics event, 외부 provider, attribution/experiment, marketing opt-in, PWA/native 후보
- 10에서 닫은 mobile browser field-use 범위와 10 밖으로 남은 PWA/offline/native, advanced camera preview/crop, server draft/media raw storage, generic ExportJob, 문서 체크리스트/architecture 정합성 후보
- 11에서 닫은 Admin 운영 범위와 11 밖으로 남은 Admin 문서 정합성, Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지, Admin 직접 도메인 데이터 수정, Customer/B2B tenant admin 후보

이 폴더는 13번 기능 폴더가 아니다. 기존 완료 슬롯을 재대조하기 위한 보조 계획이었으며, 2026-08-11 기준 billing 종속 후보는 `TODO/PADDLE_PLAN`으로 이관됐다.

## 2. 현재 결론

최종 분류:

| 최종 분류 | 후보 |
| --- | --- |
| PRE12에서 닫힌 것 | `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34` |
| 후속 seed | `PRE12-F01`, `PRE12-F02`, `PRE12-F03`, `PRE12-F05`, `PRE12-F06`, `PRE12-F07`, `PRE12-F08`, `PRE12-F09`, `PRE12-F10`, `PRE12-F11`, `PRE12-F13`, `PRE12-F14`, `PRE12-F15`, `PRE12-F17`, `PRE12-F18`, `PRE12-F19`, `PRE12-F22`, `PRE12-F23`, `PRE12-F24`, `PRE12-F25`, `PRE12-F27`, `PRE12-F28`, `PRE12-F29`, `PRE12-F30`, `PRE12-F36`, `PRE12-F37`, `PRE12-F38`, `PRE12-F39`, `PRE12-F40`, `PRE12-F42`, `PRE12-F43`, `PRE12-F44`, `PRE12-F45` |
| billing 충돌 / Paddle 종속 | `PRE12-F12`, `PRE12-F20`, `PRE12-F21`, `PRE12-F26`, `PRE12-F35`, `PRE12-F41` |

따라서 PRE12의 잔여 작업은 없다. 운영 provider smoke와 문서 정합성 정리는 BEFORE_12에서 닫혔고, billing 종속 항목은 `TODO/PADDLE_PLAN`으로 이관됐다. 다음 행동 reminder, 회의록 follow-up reminder, record summary, mobile/PWA/native, ExportJob, Admin mutation, B2B tenant admin 같은 제품 기능은 이 폴더에서 구현하지 않는다.

분류 제외 완료 참조: `PRE12-F16`

| 영역 | 현재 판정 | 구현 판단 |
| --- | --- | --- |
| 01 ImportJob | 완료 | 대용량 worker, 일정/회의록 import, generic ExportJob, Admin 전용 화면/API, ImportJob cleanup 실패 전용 aggregate/system gate는 01 미완성이 아니다. |
| 02 Notification | 완료 | 일정/딜 reminder, in-app/email/browser push, provider smoke는 완료다. 다음 행동 알림과 회의록 후속 알림은 구현되지 않았다. Notification 데이터 TTL/cleanup은 구현 완료 범위가 아니라 정책 후속 후보로 분리한다. |
| 03 Weekly Schedule Report | 완료 | PDF, generic ExportJob, recurrence는 03 재오픈 대상이 아니다. |
| 04 Google Calendar | 완료 | read-only import/sync/source badge/Trash restore/Google-origin reminder/provider smoke는 완료다. Google export/write/양방향 sync, webhook/watch, 반복 일정 정식 모델, reminders/attendee import, 여러 Google 계정, Google Calendar 외 provider는 후속이다. |
| 05 AI Weekly Sales Report | 완료 / provider smoke closeout 완료 | AI weekly report 저장/버전/스냅샷, 사용자 확인 기반 follow-up draft/send/retry/timeline, Gmail/Microsoft email adapter와 자동 검증은 완료됐다. Gmail/Microsoft provider smoke closeout은 2026-08-10 배포 환경 verified 기준 BEFORE_12 G01에서 닫혔다. SMS 실제 provider, B2B sender/email sync/sequence/campaign/bulk/unsubscribe, 예약 발송/SMTP/HTML/첨부/tracking, 사용자 비용 노출, 영구 로그 legal deletion 정책은 후속이다. |
| 06 DealActivity | 완료 이력 유지 / A 결정 반영 | 06은 DealActivity timeline, manual create/update, Deal list latestActivity, products summary, Contact dealCount 범위를 넘기지 않고 완료로 유지한다. record summary 잔여는 `PRE12-F07`, activity lifecycle/search/score 확장은 `PRE12-F39`로 분리한다. |
| 07 MeetingNote AI | 완료 이력 유지 / G08 closeout 완료 | 상세 next action/follow-up draft와 provider log는 완료다. 회의록 목록 summary, 자동 발송, 알림, AI data cleanup, transcript/raw/follow-up draft 저장, AI 후보 자동 저장/자동 일정 생성/자동 딜 변경은 07 완료 범위가 아니다. Admin provider audit/raw access는 11 완료 범위를 참조한다. |
| 08 Global Data I18N | 완료 이력 유지 / G09 closeout 완료 | `/app` `ko-KR/en`, User global settings, KR/US phone/region, KRW/USD currency, Import/Export localization, Google/LINE/Apple auth는 완료다. `ja/zh-TW`, `zh-CN`, 전 세계 국가/통화/전화번호, minor unit, 상세 주소 검증, auth strategy 확장은 08 미완성이 아니다. |
| 09 Product Analytics | 완료 이력 유지 / G10 closeout 완료 | 자체 DB `ProductAnalyticsEvent`, collector, server/client event, activation/retention snapshot, AI usage summary, 10 mobile field-use event와 11 Admin analytics 연결은 완료다. account deletion 실제 hard delete/anonymization job, 세부 event 확장, 외부 provider, UTM/experiment, marketing opt-in, PWA/native install attribution은 09 완료 범위가 아니다. |
| 10 Mobile PWA Field Use | 완료 이력 유지 / G11 및 BEFORE_12 G02~G03 closeout 완료 | 명함 촬영/OCR safe failure, 회의 녹음/STT fallback, FE local draft 24시간 TTL, browser push permission UX, mobile field analytics는 완료다. PWA install/offline shell/full offline sync/iOS/Android native app/native push/contact/calendar, advanced camera preview/crop, server draft/media raw storage는 후속이고, 10 FE/BE TODO 체크리스트와 FE route architecture 문서 정합성은 `PRE12-F31`/`PRE12-F32`로 분리한 뒤 BEFORE_12에서 닫았다. 남는 기능 후보는 `PRE12-F30`, `PRE12-F42`, `PRE12-F43`과 기존 `PRE12-F09`다. |
| 11 Admin Operation | 완료 이력 유지 / G12 및 BEFORE_12 G04~G05 closeout 완료 | `/admin/api/*`, Admin Web 운영 화면, audit/redaction, Trash/account request/provider/system gate는 완료다. 11 문서 체크리스트와 Admin Web architecture/legacy route 정합성은 `PRE12-F33`/`PRE12-F34`로 분리한 뒤 BEFORE_12에서 닫았다. 2026-08-10 Admin provider failure 목록 cursor pagination 편중 누락 Finding은 batch 조회와 회귀 테스트로 해결했다. Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지, Admin 직접 도메인 데이터 수정, Customer/B2B tenant admin은 11 완료 범위가 아니다. 남는 후보는 `PRE12-F35`~`PRE12-F37`, `PRE12-F44`, `PRE12-F45`와 기존 `PRE12-F09`, `PRE12-F11`, `PRE12-F12`, `PRE12-F13`, `PRE12-F26` 연결이다. |

2026-08-06 사용자 결정 A에 따라 `NBA-003` 잔여인 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 PRE12 계약화/구현 대상이 아니다. 이 후보들은 B2B 또는 team CRM 성격이 더 강한 후속 전략 재검토 seed로 남기며, UX/UI 전체 polish도 지금 06 후속으로 하지 않고 별도 전면 유지보수 계획에서 다룬다.

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
| 다음 행동 reminder | 후속 seed / notification policy | PRE12에서 구현하지 않는다. Notification source/setting/scheduler 정책은 필요성이 확인될 때 별도 TODO에서 재검토한다. |
| 회의록 follow-up reminder | 후속 seed | G03에서 상태를 재확인한다. 자동 발송과 함께 정책 결정이 필요하다. |
| MeetingNote follow-up 자동 발송 | 후속 seed | G03에서 reminder와 분리한다. 명시적 사용자 확인 없는 발송은 구현 금지다. |
| MeetingNote AI 후보 자동 업무 mutation | 후속 seed / AI policy | 07은 후보/초안만 제공하고 사용자가 확인한 뒤 기존 API 또는 복사 흐름으로 처리한다. 자동 일정 생성, 자동 딜 변경, Contact/MeetingNote/Deal 자동 변경은 구현 금지다. |
| Notification 데이터 TTL/cleanup | 후속 seed / trust-ops policy | 02의 `Notification` 90일, `NotificationDeliveryAttempt` 30일, revoked `BrowserPushSubscription` 90일 보관 후보는 실제 cleanup 구현이 없다. 정책/운영 계약 전 구현하지 않는다. |
| Gmail/Microsoft provider smoke | closed-by-BEFORE_12 | BEFORE_12 G01에서 2026-08-10 배포 환경 verified 기준 closeout 완료로 처리했다. 코드 구현 후보가 아니다. |
| SMS 실제 provider | 후속 seed | `PRE12-F05`로 유지한다. 현재 SMS sender verification UI/API foundation은 있으나 실제 vendor 연동은 없다. |
| Follow-up delivery 고급 provider/growth 확장 | 후속 seed | `PRE12-F06`으로 유지한다. B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external email SaaS, HTML/첨부/tracking은 05 완료 범위가 아니다. |
| Company/Contact/Product latest summary | defer | 2026-08-06 A 결정으로 PRE12 G04 계약화와 구현을 하지 않는다. |
| DealActivity lifecycle/search/score 확장 | 후속 seed / trust-product policy | `PRE12-F39`로 둔다. 수동 삭제/retention/audit, memo 통합, 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단은 06 미완성이 아니다. |
| MeetingNote list latest/next summary | 후속 seed 또는 별도 MeetingNote list 후보 | PRE12에서 구현하지 않는다. 07 결과와 연결한 목록 summary 계약은 필요성이 확인될 때만 만든다. |
| AI data cleanup 제안 저장/적용 | 후속 seed / 별도 data quality 계획 | 07에서는 제외한다. 09 또는 별도 data quality 계획에서 권한, 적용, 감사 로그, rollback 기준을 정한 뒤 판단한다. |
| transcript/raw provider response/follow-up draft 저장 | defer / 정책 필요 | retention, 삭제권, raw access audit, redaction 정책 없이는 구현하지 않는다. |
| Import scale/source/Admin 확장 | 후속 seed | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API, ImportJob cleanup 실패 전용 aggregate/system gate는 01/11 미완성이 아니다. |
| generic ExportJob/PDF 및 Google Calendar 고급 연동 | 후속 seed | `PRE12-F09`와 `PRE12-F10`으로 유지한다. Google export/write/양방향 sync, webhook/watch, 반복 일정, reminders/attendee, multi-account/provider 확장은 필요성이 확인될 때 새 TODO로 승격할지 판단한다. |
| billing/subscription/tax/paywall/churn/paid conversion/AI usage billing source | billing-blocked | 08의 국가/통화/주소 모델과 05/09의 내부 cost/usage summary는 plan/payment/subscription/tax/refund/invoice/failed payment 또는 과금 정본이 아니다. Paddle 확정 전 임시 구현 금지. |
| `/app` `ja`, `zh-TW` 번역과 시장별 UX writing | 후속 seed | 일본/대만 판매 준비 goal에서 다룬다. 08 완료 범위는 `ko-KR/en`이다. |
| `zh-CN` 중국 본토 지원 | defer / 시장 진입 결정 필요 | 중국 본토 시장, 인프라, 정책, 결제/세금 기준이 없으면 구현하지 않는다. |
| 전 세계 국가/통화/전화번호 확장 | 후속 seed | KR/US, KRW/USD 1차 검증 뒤 실제 판매 국가 기준으로 확장한다. |
| USD cent/minor unit | billing-blocked | Paddle money model과 기존 금액 migration 기준 없이 구현하지 않는다. |
| 국가별 상세 주소 검증/세금/약관/가격 정책 | billing-blocked | `TODO/PADDLE_PLAN` Payment/Tax/Policy 범위와 연결한다. |
| Contact 개인 주소 | 후속 seed | CRM 확장 요구가 명확해질 때 별도 Contact data expansion으로 판단한다. |
| Auth strategy 확장 | defer / 정책 필요 | 이메일/비밀번호, Microsoft login, Kakao runtime 복구, 신규 provider는 별도 auth strategy 결정 전 구현 금지. |
| `/app` locale route prefix | defer / guardrail | 새 라우팅 계약 없이 `/app`에 locale prefix를 붙이지 않는다. |
| app i18n/Settings/bundle polish | 후속 seed / UXUI quality | legacy static fallback 직접 keying, Settings OAuth 계정 라벨, Vite large chunk warning은 08 blocker가 아니다. |
| account deletion 실제 hard delete/anonymization job | billing-blocked / trust-policy | 09는 30일 유예 후 user-linked analytics 삭제 기준을 세웠고 11은 요청/취소/Admin queue를 구현했다. 실제 삭제 job은 privacy/legal/session revoke/billing 영향을 Paddle subscription/refund/invoice/tax 보관 기준과 함께 확정하기 전 구현하지 않는다. |
| Product analytics 세부 event 확장 | 후속 seed / 별도 analytics 계획 | Notification delivery/click/reach, Google Calendar sync detail, AI weekly/follow-up delivery detail event는 09 최소 taxonomy에 넣지 않는다. |
| 외부 analytics provider forwarding | 후속 seed / growth/ops | 자체 DB analytics 정본을 유지하고 Segment/PostHog/Mixpanel류 provider port/adapter/runtime call은 별도 계획에서 판단한다. |
| public site/UTM/ad attribution/growth experiment | 후속 seed / growth/marketing | 09는 core `/app` route view만 수집했다. public route, UTM/referrer/ad attribution, experiment assignment API/model은 후속이다. |
| Marketing opt-in/communication consent policy | billing-blocked / growth-compliance | 원천 문서의 Marketing opt-in은 09/10 완료 범위가 아니며 Paddle Billing/growth/privacy 정책 이후 판단한다. `FollowUpConsentNotice`나 public contact form `marketingAgreement`와 혼동하지 않는다. |
| PWA/native packaging과 install attribution | 후속 seed / 별도 mobile roadmap | 10은 mobile browser field-use까지 완료했다. PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution은 후속으로 유지한다. |
| BusinessCard mobile advanced camera preview/crop | 후속 seed / mobile advanced capture | 10은 native file/camera picker 기반으로 완료했다. `getUserMedia`, custom camera preview/crop/canvas capture는 별도 usage/device QA/접근성 계약 전 구현하지 않는다. |
| Server draft and media/raw storage policy | defer / trust-policy / 후속 seed | 10 local draft는 FE 24시간 TTL 저장으로 닫혔다. `UserDraft`, `/api/drafts/*`, audio/image binary, transcript 전문, provider raw response 저장은 retention/account deletion/raw access 정책 전 구현하지 않는다. |
| 10 FE/BE TODO 체크리스트 정합성 | closed-by-BEFORE_12 | 10 README/G07 closeout/실제 코드 기준 완료 상태와 문서 체크리스트를 BEFORE_12 G02에서 맞췄다. |
| User Web route/architecture 문서 정합성 | closed-by-BEFORE_12 | 실제 `/app/notifications` 활성, `/app/export` redirect 상태를 BEFORE_12 G03에서 FE architecture 문서에 반영했다. |
| 11 문서 체크리스트/goal index 정합성 | closed-by-BEFORE_12 | 11 README/G10 closeout/실제 코드 기준 완료 상태와 checklist/goal index를 BEFORE_12 G04에서 맞췄다. |
| Admin Web architecture/legacy route 정합성 | closed-by-BEFORE_12 | 실제 Admin Web route/API와 비활성 legacy route 기준을 BEFORE_12 G05에서 문서에 반영했다. |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | billing-blocked / recovery-policy | 11은 User 복구 문의와 Admin queue까지만 완료했다. Admin mutation, 유료 복구 결제, hard delete/purge는 recovery policy와 Paddle Billing 이후 판단한다. |
| User data export artifact/download endpoint | 후속 seed / `PRE12-F09` 연결 | 11은 request/Admin queue를 완료했고 실제 artifact 생성 processor, signed URL, download controller는 없다. ExportJob/file retention/audit 계약 전 구현하지 않는다. |
| 자동 민감정보 감지 | defer / 정책 필요 | 11의 masking/raw access와 별개인 자동 탐지 기능이다. 보안/data governance 계약 전 구현하지 않는다. |
| Admin direct domain data mutation and recovery action policy | defer / ops-policy | 11은 도메인 records를 read-only/masked 조회로 닫았다. Admin이 Company/Contact/Product/Deal/Schedule/MeetingNote/BusinessCard/Import를 직접 수정/삭제/복구하는 mutation은 ownership, 사용자 통지, audit/result, rollback, redaction 정책 전 구현하지 않는다. |
| Customer/B2B tenant admin and organization admin model | defer / B2B-strategy | 11 Admin은 내부 최종 관리자용이다. tenant/org/member/role/permission/billing 경계가 없으면 `/organizations` redirect나 내부 AdminGuard를 고객 관리자 기능으로 바꾸지 않는다. |

## 5. 문서 구조

```text
PRE12_FOLLOWUP_RECHECK/
  README.md
  COMMON/
    README.md
    SCOPE.md
    CANDIDATE-MATRIX.md
    FINAL-CLASSIFICATION.md
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

1. G00 최종 분류 결과는 `COMMON/FINAL-CLASSIFICATION.md`를 따른다.
2. 기존 PRE12 처리 대상 `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`는 모두 BEFORE_12에서 닫혔고 PRE12 잔여 작업은 없다.
3. API/DB/FE 구현이 필요한 후보는 PRE12에서 바로 구현하지 않고, 새 TODO 또는 `TODO/PADDLE_PLAN` confirmed 계약으로만 다룬다.
4. 06 작업 중 발견한 보정은 06 완료 범위를 넓히는 방식이 아니라 이 폴더의 후보 상태로 기록한다.
5. billing/subscription/plan/payment/invoice/refund/failed payment/tax/paywall/churn/paid conversion과 연결된 항목은 `TODO/PADDLE_PLAN`에서 다룬다.
6. `NBA-003` 잔여 record summary는 2026-08-06 A 결정에 따라 PRE12 API/DB/FE 계약 대상으로 보지 않는다.
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
