# Scope

상태: Final / BEFORE_12 closeout reflected
작성일: 2026-08-06
최종 업데이트: 2026-08-09

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`가 어떤 후보를 다루고, 어떤 후보는 기존 완료 슬롯 또는 12 이후로 남기는지 고정한다.

최종 3분류 정본은 `FINAL-CLASSIFICATION.md`다. 이 문서는 12 전 새 기능 구현을 열지 않는다.

## 1A. 최종 분류 요약

| 최종 분류 | 후보 |
| --- | --- |
| 12 전에 닫힌 것 | `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34` |
| post-12 | `PRE12-F01`, `PRE12-F02`, `PRE12-F03`, `PRE12-F05`, `PRE12-F06`, `PRE12-F07`, `PRE12-F08`, `PRE12-F09`, `PRE12-F10`, `PRE12-F11`, `PRE12-F13`, `PRE12-F14`, `PRE12-F15`, `PRE12-F17`, `PRE12-F18`, `PRE12-F19`, `PRE12-F22`, `PRE12-F23`, `PRE12-F24`, `PRE12-F25`, `PRE12-F27`, `PRE12-F28`, `PRE12-F29`, `PRE12-F30`, `PRE12-F36`, `PRE12-F37`, `PRE12-F38`, `PRE12-F39`, `PRE12-F40`, `PRE12-F42`, `PRE12-F43`, `PRE12-F44`, `PRE12-F45` |
| billing 충돌 / 12 종속 | `PRE12-F12`, `PRE12-F20`, `PRE12-F21`, `PRE12-F26`, `PRE12-F35`, `PRE12-F41` |

12 전에 할 것으로 분류했던 운영 smoke와 문서 정합성은 2026-08-09 BEFORE_12에서 모두 닫혔다. 다음 행동 reminder, 회의록 follow-up reminder, ExportJob, PWA/native, Admin mutation, Customer/B2B tenant admin 같은 기능 후보는 12 전 구현으로 올리지 않는다.

분류 제외 완료 참조: `PRE12-F16`

## 2. 포함 범위

| 범위 | 설명 |
| --- | --- |
| 01~06 재대조 결과 정리 | 01~04 완료, 05 provider smoke closeout 완료와 06 후속 재검토 A 결정을 07~11 재대조에서 참고할 수 있게 정리한다. |
| 01 Import 확장 후보 분리 | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API가 01 미완성이 아니라 별도 post-12 seed임을 고정한다. |
| 02 후속 후보 분리 | 다음 행동 알림, 회의록 후속 알림, Notification 데이터 TTL/cleanup 정책이 02 구현 범위가 아니었음을 고정한다. |
| 04 후속 후보 분리 | Google read-only import/sync 완료 범위와 Google export/write/양방향 sync, realtime webhook/watch, 반복 일정 정식 모델, reminders/attendee import, 여러 Google 계정, Google Calendar 외 provider 후보를 분리한다. |
| 05 후속 후보 분리 | AI weekly report/follow-up delivery 완료 범위와 Gmail/Microsoft provider smoke, SMS 실제 provider, B2B/email growth, cost/legal deletion 후보를 분리한다. |
| 06 작업 경계 설정 | DealActivity event와 실제 Notification reminder, record summary, activity lifecycle/search/score 확장 후보를 분리한다. |
| 07 작업 경계 설정 | MeetingNote 상세 AI draft와 MeetingNote 목록 summary/자동 발송/알림/AI data cleanup/raw 저장 후보를 분리한다. |
| 08 작업 경계 설정 | `/app` 기본 i18n/global data/auth provider 완료 범위와 시장/국가/통화/auth 확장 후보를 분리한다. |
| 09 작업 경계 설정 | Product Analytics foundation 완료 범위와 account deletion 실제 처리, 세부 event, 외부 provider, attribution/experiment, marketing opt-in, PWA/native 후보를 분리한다. |
| 10 작업 경계 설정 | mobile browser field-use 완료 범위와 PWA/offline/native, advanced camera preview/crop, server draft/media raw storage, generic ExportJob, 문서 체크리스트/architecture 정합성 후보를 분리한다. |
| 11 작업 경계 설정 | Admin Operation 완료 범위와 Admin 문서 정합성, Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지, Admin 직접 도메인 데이터 수정, Customer/B2B tenant admin 후보를 분리한다. |
| 후보 상태 분류 | `FINAL-CLASSIFICATION.md` 기준으로 12 전에 할 것, post-12, billing 충돌/12 종속으로 분리한다. 완료 참조는 작업 분류에서 제외한다. |
| 구현 전 계약 요구 | API/DB/FE 변경 후보는 API contract와 DB 영향 문서를 먼저 확정하도록 한다. |

## 3. 제외 범위

| 제외 항목 | 이유 |
| --- | --- |
| 06 DealActivity 구현 재개 | 06은 이미 완료 슬롯이다. manual create/update와 safe timeline/list summary 범위를 넘는 삭제/보존/감사/search/score/AI 확장은 `PRE12-F39`로만 둔다. |
| 07 MeetingNote AI 구현 재개 | 07은 이미 완료 슬롯이다. detail AI draft/provider log 범위를 넘는 목록 summary, 자동 발송, 알림, AI data cleanup, transcript/raw/follow-up draft 저장, AI 후보 자동 업무 mutation은 별도 후보다. |
| 01 ImportJob 구현 재개 | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 완료 의미를 깨지 않고 post-12에서 재검토한다. |
| 04 Google Calendar 구현 재개 | 04는 Google read-only import/sync, 선택 calendar, source badge, Trash restore, Google-origin reminder, provider smoke 기준으로 완료됐다. 고급 sync/provider 확장은 `PRE12-F10`으로만 둔다. |
| 05 AI Weekly Sales Report 구현 재개 | 05는 저장형 AI weekly report, 사용자 확인 기반 follow-up delivery, Gmail/Microsoft send adapter 기준으로 완료됐다. provider smoke는 운영 closeout이고 SMS/B2B/email growth/cost/legal deletion은 별도 후속이다. |
| 08 Global Data I18N 구현 재개 | 08은 `ko-KR/en`, KR/US, KRW/USD, Google/LINE/Apple 기준으로 완료됐다. 시장/국가/auth 확장은 별도 후속이다. |
| 09 Product Analytics 구현 재개 | 09는 자체 DB analytics 정본, collector, core event, snapshot/retention, AI usage summary, billing reserved taxonomy로 완료됐다. 후속 event/provider/attribution/deletion job은 별도 후보다. |
| 12 Billing 구현 | 결제/구독/세금과 plan/payment/invoice/refund/failed payment/paywall/churn/paid conversion은 12 결정 없이는 기준을 확정할 수 없다. |
| 새 API 즉시 구현 | 현재 `COMMON/API-SPEC`에는 confirmed API가 없다. |
| 새 Prisma migration 즉시 작성 | 후보 계약이 확정되기 전에는 schema를 바꾸지 않는다. |
| UX/UI 전체 polish | Product UX first-sale gate와 UX/UI 유지보수는 별도 흐름이다. |
| Company/Contact/Product latest summary pre-12 계약화 | 2026-08-06 A 결정에 따라 `NBA-003` 잔여 record summary는 B2B/team CRM 성격이 강한 post-12 전략 후보로 둔다. |
| 08 market/global expansion pre-12 구현 | `ja/zh-TW`, `zh-CN`, 전 세계 국가/통화/전화번호, USD minor unit, 상세 주소 검증, 신규 auth provider는 08 완료 범위를 넓히지 않는다. |
| 09 analytics/growth/trust 확장 pre-12 구현 | account deletion 실제 job, 세부 event taxonomy, 외부 provider forwarding, public/UTM attribution, growth experiment, marketing opt-in, PWA/native attribution은 09 완료 범위를 넓히지 않는다. |
| 10 Mobile PWA Field Use 구현 재개 | 10은 mobile browser field-use 기준으로 완료됐다. PWA/offline/native, advanced camera preview/crop, server draft DB, media/raw 저장, `/app/export`/`/api/exports`는 10 완료 범위가 아니다. |
| 10 mobile/PWA 확장 pre-12 구현 | PWA install/offline shell/full offline sync, native app, native push/contact/calendar, native install attribution은 10 완료 범위를 넓히지 않는다. |
| 11 Admin Operation 구현 재개 | 11은 최소 Admin 운영 API/화면과 audit/redaction 기준으로 완료됐다. 문서 stale이나 후속 후보를 근거로 Admin 기능을 재구현하지 않는다. |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge pre-12 구현 | 11은 User 복구 문의와 Admin queue까지만 완료했다. 복구 실행/과금/삭제 정책은 recovery policy와 12 Billing 이후 판단한다. |
| Admin 직접 도메인 데이터 수정 pre-12 구현 | 11은 사용자별 도메인 records를 read-only/masked 조회로 닫았다. Admin mutation은 ownership, 사용자 통지, audit/result, rollback, redaction 정책이 확정되기 전 구현하지 않는다. |
| Customer/B2B tenant admin pre-12 구현 | 11 Admin은 내부 onehand.sales 관리자용이다. tenant/org/member/role/permission/billing/support 경계가 확정되기 전 `/organizations` redirect나 내부 AdminGuard를 고객 관리자 기능으로 바꾸지 않는다. |
| ImportJob cleanup 실패 전용 Admin aggregate/system gate pre-12 구현 | 01 cleanup은 safe summary log 범위이고 11 system gate는 generic operation check 기록이다. ImportJob cleanup failure 전용 Admin 화면/API/집계는 `PRE12-F13` 전략 전 구현하지 않는다. |

## 4. 04 Google Calendar에 직접 영향을 주는 기준

04에서 완료로 보는 범위:

- Google OAuth connect/reconnect/disconnect/status
- Google calendar list 조회와 selected calendar 저장
- 선택 calendar event read-only import/sync
- `/app/schedules` freshness auto sync와 manual sync
- Google source badge, hidden source 처리, Trash restore
- Google-origin schedule reminder
- 실제 Google provider smoke 기록

04 완료 범위로 다루면 안 되는 범위:

- Google Calendar export/write 또는 양방향 sync 추가
- realtime webhook/watch channel 추가
- 반복 일정 정식 모델 추가
- Google reminders import 또는 reminder mapping 추가
- 참석자 import, contact auto-link, attendee response UI 추가
- 여러 Google 계정 동시 연결 추가
- Google Calendar 외 provider 추가

위 항목은 새 후보로 중복 생성하지 않고 `PRE12-F10`으로 연결한다.

## 5. 05 AI Weekly Sales Report에 직접 영향을 주는 기준

05에서 완료로 보는 범위:

- 저장형 AI weekly report 수동 생성, async job, version/failed version, snapshot-summary
- summary/risk/next action/follow-up draft/data cleanup suggestion 저장과 사용자-facing summary 노출
- `/app/schedules/week` AI report section, `/app/settings` follow-up delivery settings, compose/send/retry/timeline UX
- 사용자가 확인/수정한 email/SMS immediate send와 full subject/body delivery log 보관
- Gmail/Microsoft send-only adapter, token refresh, reconnect-required, safe failure, smoke allowlist

05 완료 범위로 다루면 안 되는 범위:

- AI weekly report 자동 생성 또는 AI suggestion 자동 Deal/Schedule/Contact/MeetingNote mutation
- Gmail/Microsoft provider smoke closeout을 새 코드 구현 후보로 전환
- SMS 실제 provider/vendor 연동
- B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe
- scheduled send, SMTP 직접 설정, external email SaaS provider, HTML email, attachments, tracking pixel
- 사용자-facing cost/plan/quota/paywall/entitlement UI/API
- full input snapshot과 follow-up subject/body 영구 로그의 legal deletion/retention 정책 없이 hard delete/anonymization 구현
- AI weekly/follow-up delivery 세부 analytics event를 09 runtime allowlist에 임의 추가
- 신규 Admin provider failure UI/API 재구현

05 재대조에서 다시 발견됐지만 새 후보로 중복 생성하지 않는 항목:

| 항목 | PRE12 후보 |
| --- | --- |
| Gmail/Microsoft 운영 provider smoke | `PRE12-F04` / BEFORE_12 G01에서 closeout 완료 |
| SMS 실제 provider/vendor 연동 | `PRE12-F05` |
| B2B sender/email sync/sequence/campaign/bulk/unsubscribe/예약 발송/SMTP/HTML/첨부/tracking | `PRE12-F06` |
| MeetingNote follow-up reminder/자동 발송 | `PRE12-F02`/`PRE12-F03` |
| 사용자-facing cost/AI usage billing source | `PRE12-F12` |
| AI weekly/follow-up 영구 로그 legal deletion/retention | `PRE12-F26` |
| AI weekly/follow-up 세부 analytics event | `PRE12-F27` |
| Admin provider failure 조회/감사 | `PRE12-F16` 및 11 완료 문서 |

## 6. 06 작업에 직접 영향을 주는 기준

06에서 다뤄도 되는 범위:

- DealActivity model, repository, timeline API, deal list `latestActivity`
- manual activity create/update
- Deal list products summary, Contact list `dealCount`, page size 15 contract
- `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`
- `SCHEDULE_LINKED`, `SCHEDULE_UNLINKED`
- `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED`
- `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED`
- list summary에 필요한 safe title, safe summary, occurredAt

06에서 다루면 안 되는 범위:

- Notification reminder row 생성
- Notification/NotificationDeliveryAttempt/BrowserPushSubscription TTL cleanup 추가
- due processor와 next action due date 연동
- MeetingNote follow-up reminder 생성
- MeetingNote follow-up 자동 발송
- follow-up body 전체 또는 meeting note raw text 전문 노출
- Company/Contact/Product latest summary response field 추가
- MeetingNote list latest/next summary response field 추가
- Company/Contact/Product summary 전용 endpoint 또는 record별 상세 activity timeline 추가
- manual activity delete API/UI 추가
- 자동 activity update/delete API 추가
- DealActivity soft delete/trash/restore/retention/audit model 추가
- memo/private memo timeline 통합
- 모든 도메인 공통 activity bus 추가
- DealActivity 고급 검색/필터, 딜 score, AI activity 자동 판단 추가
- DealActivity summary cache 또는 denormalized latest table 추가
- 06 UX/UI 전체 polish를 06 blocker로 취급
- AI data cleanup 제안 저장/적용 API 추가
- MeetingNote transcript/raw provider response/follow-up draft 저장 table 추가

06 재대조에서 다시 발견됐지만 새 후보로 중복 생성하지 않거나 분리하는 항목:

| 항목 | PRE12 후보 |
| --- | --- |
| Company/Contact/Product latest summary와 generic summary endpoint | `PRE12-F07` |
| Notification 데이터 TTL/cleanup | `PRE12-F38` |
| DealActivity delete/retention/audit, memo 통합, 공통 activity bus, 검색/filter, score, AI 자동 판단 | `PRE12-F39` |
| backup/restore runbook/drill | `PRE12-F11` |

## 7. 07 MeetingNote AI에 직접 영향을 주는 기준

07에서 완료로 보는 범위:

- MeetingNote AI/STT draft provider call log
- 공통 `AiProviderCallLog`의 MeetingNote operation과 `targetType`/`targetId` 연결
- `POST /api/meeting-notes/ai-draft`
- `POST /api/meeting-notes/stt-draft`
- `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`
- `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`
- User Web meeting note detail의 AI 후속 작업 section
- STT transcript 임시 표시와 저장 request body 제외
- next action 후보를 사용자가 확인한 뒤 기존 Deal following-action API로 저장
- follow-up draft를 사용자가 수정/복사하는 흐름
- provider raw, prompt, transcript 전문, follow-up body 전문 미저장 redaction 기준

07 완료 범위로 다루면 안 되는 범위:

- MeetingNote follow-up reminder source, scheduler, notification row 추가
- MeetingNote follow-up 자동 발송 worker, 예약 발송, 자동 발송 toggle 추가
- `GET /api/meeting-notes` `latestSummary`, `nextActionSummary` response field 추가
- FE에서 API에 없는 MeetingNote list summary를 조합 표시
- `MeetingNoteTranscript`, `MeetingNoteFollowUpDraft`, `MeetingNoteProviderCallLog`, `AiDataCleanupSuggestion` table 추가
- transcript 원문, follow-up body 전체, provider raw response를 User Web 목록/상세에 장기 보관 상태로 표시
- 11에서 닫힌 Admin provider failure 조회, raw access reason, audit/sensitive access log를 07 또는 PRE12에서 재구현
- MeetingNote AI detail 후보를 자동 저장하거나 자동 Deal/Schedule/Contact/MeetingNote mutation으로 적용

07 재대조에서 다시 발견됐지만 새 후보로 중복 생성하지 않는 항목:

| 항목 | PRE12 후보 |
| --- | --- |
| 회의록 follow-up reminder | `PRE12-F02` |
| MeetingNote follow-up 자동 발송 | `PRE12-F03` |
| MeetingNote list latest/next summary | `PRE12-F08` |
| AI data cleanup 저장/적용 | `PRE12-F14` |
| transcript/raw provider response/follow-up draft 저장 | `PRE12-F15` |
| MeetingNote Admin/internal provider audit 조회 | `PRE12-F16` 및 11 완료 문서 |
| MeetingNote AI 후보 자동 업무 mutation | `PRE12-F40` |

## 8. 08 Global Data I18N에 직접 영향을 주는 기준

08에서 완료로 보는 범위:

- `/app` 내부 `ko-KR`, `en` i18n provider/resource/formatter
- User global settings: `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`
- Product/Deal `currencyCode`와 KRW/USD 정수 금액 정책
- Contact KR/US `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`
- Company KR/US country/region code와 free address
- Import template `locale=ko-KR|en`과 domain export localization
- Google, LINE, Apple auth provider와 verified email linking
- LINE/Apple provider smoke와 08 DB migration 최신 상태 확인

08 완료 범위로 다루면 안 되는 범위:

- `/app` `ja`, `zh-TW`, `zh-CN` translation 추가
- 전 세계 country/currency/phone dictionary 추가
- Product/Deal amount를 minor unit으로 migration
- 국가별 상세 주소 validation, 국가별 tax/terms/pricing policy
- Contact personal address 추가
- email/password login, Microsoft login, Kakao runtime 복구, 신규 auth provider 추가
- `/app` locale route prefix 추가
- legacy static fallback 직접 keying, Settings OAuth 계정 라벨, bundle chunk 최적화를 08 blocker로 취급

## 9. 기존 PRE12 후보와 연결되는 08 항목

08 재대조에서 다시 발견됐지만 새 후보로 중복 생성하지 않는 항목:

| 항목 | 기존 PRE12 후보 |
| --- | --- |
| generic ExportJob/PDF/bulk export | `PRE12-F09` |
| backup/restore runbook/drill | `PRE12-F11` |
| billing/subscription/tax/paywall/churn/paid conversion | `PRE12-F12` |
| Import scale/source/Admin 확장 | `PRE12-F13` |

## 10. 09 Product Analytics에 직접 영향을 주는 기준

09에서 완료로 보는 범위:

- 자체 DB `ProductAnalyticsEvent` source of truth, collector API, repository, payload allowlist
- `AuthSession`, `AuthDevice` 재사용과 별도 analytics session/device model 미생성
- auth/deal/schedule/meeting-note/business-card/import/export core server event 기록
- `/app` core route view client event 기록
- activation snapshot, retention cohort aggregate, 365일 raw event purge
- 기존 `AiProviderCallLog` 기반 Admin 참고용 AI usage summary
- billing/paywall/churn event name reserved taxonomy
- 10 mobile field-use event와 11 Admin analytics overview 연결

09 완료 범위로 다루면 안 되는 범위:

- account deletion 30일 유예 이후 실제 hard delete/anonymization processor를 정책 없이 추가
- Notification delivery/click/reach, Google Calendar sync detail, AI weekly/follow-up delivery detail event를 runtime allowlist에 추가
- Segment/PostHog/Mixpanel/GA 같은 외부 analytics provider forwarding port/adapter/runtime call 추가
- public site route view, UTM/referrer/ad attribution, campaign attribution 추가
- `ExperimentAssignment`, `/api/experiments/assignments` 같은 growth experiment model/API 추가
- marketing opt-in/communication consent policy API/model/UI 추가
- `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`를 09/PRE12에서 생성
- PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution을 09 완료 범위로 끼워 넣기

## 11. 기존 PRE12 후보와 연결되는 09 항목

09 재대조에서 다시 발견됐지만 기존 후보와 연결하거나 09 전용 새 후보로 분리하는 항목:

| 항목 | PRE12 후보 |
| --- | --- |
| billing/subscription/tax/paywall/churn/paid conversion/AI usage billing source | `PRE12-F12` |
| account deletion 실제 hard delete/anonymization job | `PRE12-F26` |
| Notification/Calendar/follow-up 세부 analytics event | `PRE12-F27` |
| 외부 analytics provider forwarding | `PRE12-F28` |
| public site/UTM/ad attribution/growth experiment | `PRE12-F29` |
| PWA/native packaging과 install attribution | `PRE12-F30` |
| Marketing opt-in/communication consent policy | `PRE12-F41` |

## 12. 10 Mobile PWA Field Use에 직접 영향을 주는 기준

10에서 완료로 보는 범위:

- BusinessCard mobile capture와 OCR safe failure 계약
- BusinessCard capture는 native file/camera picker 기반 `input type=file`, `accept="image/*"`, `capture="environment"`
- MeetingNote mobile recording, audio file fallback, 기존 STT draft API 재사용
- FE local draft 24시간 TTL, IndexedDB primary/localStorage fallback, restore/discard UX
- Browser push permission UX와 기존 notification settings/subscription API 재사용
- Mobile field-use analytics event와 payload privacy allowlist
- `BusinessCardScanLog` safe failure field 외 10 범위 신규 DB model 미생성

10 완료 범위로 다루면 안 되는 범위:

- `UserDraft`, `/api/drafts/*`, server draft DB 추가
- audio/image binary, transcript 전문, provider raw response 저장
- BusinessCard 전용 `getUserMedia`, `ImageCapture`, camera preview/crop/canvas capture flow 추가
- PWA manifest, offline shell, full offline sync, cache strategy, workbox/vite-plugin-pwa 추가
- iOS/Android native app, native push/contact/calendar bridge 추가
- `/app/export` route 활성화
- `/api/exports`, `ExportJob`, export file retention API/model 추가
- 10 FE/BE TODO 체크리스트 미체크를 근거로 기능을 재구현
- stale FE architecture 문서에 맞추기 위해 `/app/notifications` route를 숨김 route로 되돌리기

10 재대조에서 다시 발견됐지만 기존 후보와 연결하거나 10 전용 새 후보로 분리하는 항목:

| 항목 | PRE12 후보 |
| --- | --- |
| PWA/native packaging과 install attribution | `PRE12-F30` |
| BusinessCard mobile advanced camera preview/crop | `PRE12-F42` |
| Server draft and media/raw storage policy | `PRE12-F43` |
| generic ExportJob/PDF | `PRE12-F09` |
| 10 FE/BE TODO 체크리스트 정합성 | `PRE12-F31` |
| User Web route/architecture 문서 정합성 | `PRE12-F32` |

## 13. 11 Admin Operation에 직접 영향을 주는 기준

11에서 완료로 보는 범위:

- `/admin/api/*` AuthGuard/AdminGuard 분리
- `INITIAL_ADMIN_EMAILS` 기반 Admin bootstrap과 `/admin/api/me`
- Admin 사용자 목록/상세, 활동 timeline, 도메인 read-only records
- 내부 onehand.sales AdminGuard/Admin Web. Customer/B2B tenant admin은 아님
- Admin Trash summary/records와 Trash recovery request queue
- provider failure safe summary/detail
- Admin analytics overview
- account deletion/data export request API와 Admin queue
- audit log, sensitive raw access reason, append-only sensitive access log
- system operation gate record API와 Admin Web `/system`
- User Web `/admin/api/*` 호출 차단
- provider raw/prompt/token/quota, browser push endpoint/key/userAgent, analytics raw payload, private memo 원문 미노출

11 완료 범위로 다루면 안 되는 범위:

- 11 문서 체크리스트/goal index 미체크를 근거로 기능을 재구현
- stale Admin Web architecture 문서에 맞춰 실제 Admin route/API를 숨기거나 되돌리기
- Admin 직접 Trash 복구 mutation, 유료 복구 결제, Trash hard delete/purge 추가
- Admin domain read-only records를 Company/Contact/Product/Deal/Schedule/MeetingNote/BusinessCard/Import 직접 수정/삭제/복구 mutation으로 확장
- Admin 직접 DB migrate/seed/backup/restore shell command 실행
- `/organizations` redirect를 customer-facing tenant admin으로 활성화하거나 tenant/org/member role model 추가
- ImportJob cleanup 실패 전용 Admin 화면/API/집계/gate 추가
- 실제 account deletion hard delete/anonymization processor 추가
- data export artifact 생성 processor, storage signed URL, download endpoint 추가
- 자동 민감정보 감지/DLP model 또는 processor 추가
- billing/subscription/plan/payment/invoice/refund/failed payment/tax/Admin Billing 화면/API 추가

11 재대조에서 다시 발견됐지만 기존 후보와 연결하거나 11 전용 새 후보로 분리하는 항목:

| 항목 | PRE12 후보 |
| --- | --- |
| Admin 문서 체크리스트/goal index 정합성 | `PRE12-F33` |
| Admin Web architecture/legacy route 정합성 | `PRE12-F34` |
| Admin 직접 Trash 복구/유료 복구/Trash hard delete/purge | `PRE12-F35` |
| User data export artifact/download endpoint | `PRE12-F36` 및 `PRE12-F09` |
| 자동 민감정보 감지 | `PRE12-F37` |
| Admin direct domain data mutation and recovery action policy | `PRE12-F44` |
| Customer/B2B tenant admin and organization admin model | `PRE12-F45` |
| ImportJob cleanup failure aggregate/system gate | `PRE12-F13` |

## 14. 상태 분류 기준

최종 실행 분류는 `FINAL-CLASSIFICATION.md`의 12 전에 할 것 / post-12 / billing 충돌을 따른다. 완료 참조는 작업 분류에서 제외한다. 아래 상태값은 후보의 세부 성격을 설명하기 위한 보조 값이다.

| 상태 | 의미 |
| --- | --- |
| `done` | 실제 구현과 QA가 이미 닫힌 항목 |
| `closed-by-BEFORE_12` | `TODO/BEFORE_12_TASKS`에서 2026-08-09 기준 닫힌 12 전 운영 smoke 또는 문서 정합성 항목 |
| `pre-12-follow-up-needed` | 12 전 별도 goal로 처리할 수 있고, billing 결정과 직접 충돌하지 않는 항목. 2026-08-09 현재 이 상태로 남은 후보는 없다. |
| `pre-12-doc-cleanup` | 실제 기능 구현은 닫혔지만 문서 체크리스트, architecture 설명, dead-code 메모 같은 정합성 정리가 필요한 항목. 2026-08-09 현재 이 상태로 남은 후보는 없다. |
| `post-12-seed` | 12 이후 최종 재검토에서 새 TODO로 승격할지 판단할 항목 |
| `billing-blocked` | 12 결정 없이는 구현 기준을 확정할 수 없는 항목 |
| `Question` | 사용자의 제품 판단 또는 정책 결정이 필요한 항목 |
| `defer` | 현재 의도적으로 미루는 항목 |

## 15. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/SCOPE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/SCOPE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/SCOPE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/SOURCE-PLAN-COVERAGE.md`
- `FE/ARCHITECTURE.md`
- `FE/admin-web/ARCHITECTURE.md`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/user-web/ARCHITECTURE.md`
- `FE/user-web/src/app/router/router.tsx`
