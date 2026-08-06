# Scope

상태: Draft
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`가 어떤 후보를 다루고, 어떤 후보는 기존 완료 슬롯 또는 12 이후로 남기는지 고정한다.

## 2. 포함 범위

| 범위 | 설명 |
| --- | --- |
| 01~06 재대조 결과 정리 | 01~04 완료, 05 provider smoke pending 상태와 06 후속 재검토 A 결정을 07~11 재대조에서 참고할 수 있게 정리한다. |
| 01 Import 확장 후보 분리 | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API가 01 미완성이 아니라 별도 post-12 seed임을 고정한다. |
| 02 후속 후보 분리 | 다음 행동 알림과 회의록 후속 알림이 02 구현 범위가 아니었음을 고정한다. |
| 06 작업 경계 설정 | DealActivity event와 실제 Notification reminder를 분리한다. |
| 07 작업 경계 설정 | MeetingNote 상세 AI draft와 MeetingNote 목록 summary/자동 발송/알림/AI data cleanup/raw 저장 후보를 분리한다. |
| 08 작업 경계 설정 | `/app` 기본 i18n/global data/auth provider 완료 범위와 시장/국가/통화/auth 확장 후보를 분리한다. |
| 09 작업 경계 설정 | Product Analytics foundation 완료 범위와 account deletion 실제 처리, 세부 event, 외부 provider, attribution/experiment, PWA/native 후보를 분리한다. |
| 10 작업 경계 설정 | mobile browser field-use 완료 범위와 PWA/offline/native, generic ExportJob, 문서 체크리스트/architecture 정합성 후보를 분리한다. |
| 후보 상태 분류 | `done`, `pre-12-follow-up-needed`, `pre-12-doc-cleanup`, `post-12-seed`, `billing-blocked`, `Question`, `defer` 중 하나로 분류한다. |
| 구현 전 계약 요구 | API/DB/FE 변경 후보는 API contract와 DB 영향 문서를 먼저 확정하도록 한다. |

## 3. 제외 범위

| 제외 항목 | 이유 |
| --- | --- |
| 06 DealActivity 구현 재개 | 06은 이미 완료 슬롯이다. 현재 작업이 있더라도 이 문서는 06 범위 확장을 지시하지 않는다. |
| 07 MeetingNote AI 구현 재개 | 07은 이미 완료 슬롯이다. 목록 summary, 자동 발송, 알림은 별도 후보다. |
| 01 ImportJob 구현 재개 | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 완료 의미를 깨지 않고 post-12에서 재검토한다. |
| 08 Global Data I18N 구현 재개 | 08은 `ko-KR/en`, KR/US, KRW/USD, Google/LINE/Apple 기준으로 완료됐다. 시장/국가/auth 확장은 별도 후속이다. |
| 09 Product Analytics 구현 재개 | 09는 자체 DB analytics 정본, collector, core event, snapshot/retention, AI usage summary, billing reserved taxonomy로 완료됐다. 후속 event/provider/attribution/deletion job은 별도 후보다. |
| 12 Billing 구현 | 결제, 구독, 세금, paywall, churn, paid conversion은 12 결정 없이는 기준을 확정할 수 없다. |
| 새 API 즉시 구현 | 현재 `COMMON/API-SPEC`에는 confirmed API가 없다. |
| 새 Prisma migration 즉시 작성 | 후보 계약이 확정되기 전에는 schema를 바꾸지 않는다. |
| UX/UI 전체 polish | Product UX first-sale gate와 UX/UI 유지보수는 별도 흐름이다. |
| Company/Contact/Product latest summary pre-12 계약화 | 2026-08-06 A 결정에 따라 `NBA-003` 잔여 record summary는 B2B/team CRM 성격이 강한 post-12 전략 후보로 둔다. |
| 07 MeetingNote AI 구현 재개 | 07은 완료 슬롯이다. AI data cleanup, list summary, follow-up reminder/자동 발송, transcript/raw/follow-up draft 저장은 별도 후보로만 둔다. |
| 08 market/global expansion pre-12 구현 | `ja/zh-TW`, `zh-CN`, 전 세계 국가/통화/전화번호, USD minor unit, 상세 주소 검증, 신규 auth provider는 08 완료 범위를 넓히지 않는다. |
| 09 analytics/growth/trust 확장 pre-12 구현 | account deletion 실제 job, 세부 event taxonomy, 외부 provider forwarding, public/UTM attribution, growth experiment, PWA/native attribution은 09 완료 범위를 넓히지 않는다. |
| 10 Mobile PWA Field Use 구현 재개 | 10은 mobile browser field-use 기준으로 완료됐다. PWA/offline/native, server draft DB, media/raw 저장, `/app/export`/`/api/exports`는 10 완료 범위가 아니다. |
| 10 mobile/PWA 확장 pre-12 구현 | PWA install/offline shell/full offline sync, native app, native push/contact/calendar, native install attribution은 10 완료 범위를 넓히지 않는다. |

## 4. 06 작업에 직접 영향을 주는 기준

06에서 다뤄도 되는 범위:

- DealActivity model, repository, timeline API, deal list `latestActivity`
- `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`
- `SCHEDULE_LINKED`, `SCHEDULE_UNLINKED`
- `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED`
- `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED`
- list summary에 필요한 safe title, safe summary, occurredAt

06에서 다루면 안 되는 범위:

- Notification reminder row 생성
- due processor와 next action due date 연동
- MeetingNote follow-up reminder 생성
- MeetingNote follow-up 자동 발송
- follow-up body 전체 또는 meeting note raw text 전문 노출
- Company/Contact/Product latest summary response field 추가
- MeetingNote list latest/next summary response field 추가
- Company/Contact/Product summary 전용 endpoint 또는 record별 상세 activity timeline 추가
- AI data cleanup 제안 저장/적용 API 추가
- MeetingNote transcript/raw provider response/follow-up draft 저장 table 추가

## 5. 08 Global Data I18N에 직접 영향을 주는 기준

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

## 6. 기존 PRE12 후보와 연결되는 08 항목

08 재대조에서 다시 발견됐지만 새 후보로 중복 생성하지 않는 항목:

| 항목 | 기존 PRE12 후보 |
| --- | --- |
| generic ExportJob/PDF/bulk export | `PRE12-F09` |
| backup/restore runbook/drill | `PRE12-F11` |
| billing/paywall/churn/paid conversion | `PRE12-F12` |
| Import scale/source/Admin 확장 | `PRE12-F13` |

## 7. 09 Product Analytics에 직접 영향을 주는 기준

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
- `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`를 09/PRE12에서 생성
- PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution을 09 완료 범위로 끼워 넣기

## 8. 기존 PRE12 후보와 연결되는 09 항목

09 재대조에서 다시 발견됐지만 기존 후보와 연결하거나 09 전용 새 후보로 분리하는 항목:

| 항목 | PRE12 후보 |
| --- | --- |
| billing/paywall/churn/paid conversion/AI usage billing source | `PRE12-F12` |
| account deletion 실제 hard delete/anonymization job | `PRE12-F26` |
| Notification/Calendar/follow-up 세부 analytics event | `PRE12-F27` |
| 외부 analytics provider forwarding | `PRE12-F28` |
| public site/UTM/ad attribution/growth experiment | `PRE12-F29` |
| PWA/native packaging과 install attribution | `PRE12-F30` |

## 9. 10 Mobile PWA Field Use에 직접 영향을 주는 기준

10에서 완료로 보는 범위:

- BusinessCard mobile capture와 OCR safe failure 계약
- MeetingNote mobile recording, audio file fallback, 기존 STT draft API 재사용
- FE local draft 24시간 TTL, IndexedDB primary/localStorage fallback, restore/discard UX
- Browser push permission UX와 기존 notification settings/subscription API 재사용
- Mobile field-use analytics event와 payload privacy allowlist
- `BusinessCardScanLog` safe failure field 외 10 범위 신규 DB model 미생성

10 완료 범위로 다루면 안 되는 범위:

- `UserDraft`, `/api/drafts/*`, server draft DB 추가
- audio/image binary, transcript 전문, provider raw response 저장
- PWA manifest, offline shell, full offline sync, cache strategy, workbox/vite-plugin-pwa 추가
- iOS/Android native app, native push/contact/calendar bridge 추가
- `/app/export` route 활성화
- `/api/exports`, `ExportJob`, export file retention API/model 추가
- 10 FE/BE TODO 체크리스트 미체크를 근거로 기능을 재구현
- stale FE architecture 문서에 맞추기 위해 `/app/notifications` route를 숨김 route로 되돌리기

## 10. 상태 분류 기준

| 상태 | 의미 |
| --- | --- |
| `done` | 실제 구현과 QA가 이미 닫힌 항목 |
| `pre-12-follow-up-needed` | 12 전 별도 goal로 처리할 수 있고, billing 결정과 직접 충돌하지 않는 항목 |
| `pre-12-doc-cleanup` | 실제 기능 구현은 닫혔지만 문서 체크리스트, architecture 설명, dead-code 메모 같은 정합성 정리가 필요한 항목 |
| `post-12-seed` | 12 이후 최종 재검토에서 새 TODO로 승격할지 판단할 항목 |
| `billing-blocked` | 12 결정 없이는 구현 기준을 확정할 수 없는 항목 |
| `Question` | 사용자의 제품 판단 또는 정책 결정이 필요한 항목 |
| `defer` | 현재 의도적으로 미루는 항목 |

## 11. 관련 문서

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
- `FE/user-web/ARCHITECTURE.md`
- `FE/user-web/src/app/router/router.tsx`
