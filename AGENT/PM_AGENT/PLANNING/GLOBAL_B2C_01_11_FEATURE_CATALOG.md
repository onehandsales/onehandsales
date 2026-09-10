# Global B2C 01~10 Feature Catalog

기준일: 2026-09-10

이 문서는 `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 01~10 완료 폴더를 다시 검토해, 현재 제품에 어떤 기능 foundation이 있는지 정리한 AGENT 정본 카탈로그다.

`IMPLEMENTATION_STATUS.md`는 완료/후속 상태 판단의 정본이고, 이 문서는 01~10의 기능별 상세 색인이다. 세부 검증 이력은 각 `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/*/COMMON/GOAL-COMPLETION-CHECKLIST.md`와 goal closeout 문서를 따른다.

현재 제품 순서는 Paddle checkout 구현이 아니다. 01~10 유지보수, UX/UI 상품성 개선, 결제창 없는 100명 베타, 가격/플랜/entitlement/정책 확정 이후 `TODO/PADDLE_PLAN`을 confirmed 계획으로 승격한다.

이 문서의 10 Mobile/PWA Field Use는 User Web의 모바일 브라우저 현장 입력성 완료 범위다.

## 1. 전체 색인

## 4. 03 Weekly Schedule Report

목적:

- 사용자가 한 주의 일정과 관련 영업 맥락을 빠르게 확인하고 XLSX로 내보낼 수 있게 한다.

구현된 기능:

- User Web route: `/app/schedules/week`.
- legacy `/schedules/week` redirect.
- 주간 일정 API는 7일 bucket을 항상 반환한다.
- `weekStart`는 Monday `YYYY-MM-DD`, `timeZone`은 IANA timezone만 허용한다.
- multi-day schedule은 겹치는 모든 local day bucket에 포함한다.
- linked active deal summary에는 stage, amount, expected end date, companies, contacts, next following action을 포함한다.
- memo body는 노출하지 않고 `hasMemo`만 제공한다.
- XLSX export는 즉시 response로 처리하고 server file storage를 만들지 않는다.

주요 API:

- `GET /api/schedules/week`
- `GET /api/schedules/week/export/xlsx`

명시적 제외:

- PDF export
- recurring schedule
- product summary
- AI summary
- 민감 memo export

## 5. 04 Google Calendar Integration

목적:

- Google Calendar를 onehand.sales 일정 화면에 read-only로 가져와 영업 일정과 함께 볼 수 있게 한다.

구현된 기능:

- Google Calendar OAuth connect/callback/status/calendar selection/manual sync/disconnect.
- readonly scope: `openid email calendar.readonly`.
- OAuth state TTL 10분, `returnTo` allowlist `/app/schedules`, `/app?account=settings`.
- token은 calendar key 또는 master key로 암호화한다.
- sync range: 사용자 timezone 기준 오늘 local 00:00에서 과거 1개월, 미래 3개월.
- `/app/schedules` 진입 시 freshness 10분 이상이면 auto sync 후보, manual sync 제공.
- sync lock은 5분이며 진행 중이면 409.
- primary calendar는 기본 선택, system calendar는 기본 미선택.
- Google event summary/location/meetingUrl/all-day 값을 Schedule 필드로 mapping한다.
- Google-origin 일정은 local edit 가능하며 `LOCAL_MODIFIED` 상태로 local field를 보호한다.
- Google에서 삭제되거나 선택 해제된 일정은 기본 목록에서 숨긴다.
- disconnect는 `KEEP`, `HIDE`, `TRASH` 정책을 지원한다.

DB/삭제 정책:

- `ExternalCalendarConnection`
- `ExternalCalendarSource`
- `Schedule.meetingUrl`, `isAllDay`, `sourceType`, external event metadata, sync status.
- Schedule은 04 이후 `deletedAt`, `deletedByUserId`, `trashExpiresAt` 기반 soft delete/Trash 대상이다.
- Schedule restore 시 Google-origin 일정은 `LOCAL_MODIFIED`로 처리한다.

주요 API:

- `POST /api/schedules/google/connect`
- `GET /api/schedules/google/callback`
- `GET /api/schedules/google/status`
- `GET /api/schedules/google/calendars`
- `PATCH /api/schedules/google/calendars`
- `POST /api/schedules/google/sync`
- `POST /api/schedules/google/disconnect`

명시적 제외:

- Google Calendar write/export
- webhook/watch
- bidirectional sync
- recurring schedule formal model
- attendees import
- 다른 calendar provider
- multi Google accounts

## 6. 05 AI Weekly Sales Report / Follow-up

목적:

- 03 주간 일정 보고서 위에 저장형 AI 영업 리포트와 후속 메시지 실행 흐름을 얹는다.

구현된 기능:

- manual AI weekly report generation.
- async job, report versioning, failed version 저장.
- user/week/timeZone 기준 중복 generation 차단.
- input snapshot은 meeting note body를 포함하지만 full snapshot은 사용자에게 직접 노출하지 않고 summary만 제공한다.
- section: executive/summary, risk, next action, follow-up draft, data cleanup.
- suggestion은 target record에 연결하되 자동 mutation하지 않는다.
- follow-up draft는 사용자가 confirm/edit 후 발송한다.
- immediate send, retry, timeline 연결.
- Gmail API `users.messages.send`, Microsoft Graph `/me/sendMail` provider send 구현.
- provider smoke는 2026-08-09 사용자 acceptance 기준 완료.
- SMS sender number verification contract는 있으나 05 G10 범위에서 실제 SMS provider send는 제외다.

주요 API:

- `POST /api/sales-reports/weekly`
- `GET /api/sales-reports/weekly/:id`
- `GET /api/sales-reports/weekly/:id/snapshot-summary`
- follow-up delivery settings/email connection/sms sender number/consent notice API
- follow-up message draft/list/edit/send/retry API

명시적 제외:

- automatic weekly report generation
- AI suggestion 자동 record mutation
- scheduled/bulk/campaign follow-up
- SMTP direct settings
- Google Calendar write/webhook
- 사용자-facing cost display
- permanent legal deletion policy

## 7. 06 Deal Activity Timeline

목적:

- 딜 상세에서 영업 활동을 시간순으로 추적하는 canonical activity model을 만든다.

구현된 기능:

- `DealActivity` canonical model.
- deal-centered timeline 조회, manual activity 생성/수정.
- auto activity는 source mutation transaction 안에서 생성한다.
- auto activity는 사용자가 수정/삭제할 수 없다.
- manual delete는 06 범위에서 제외한다.
- safe summary만 저장/노출하고 private memo, provider raw, follow-up full body, meeting raw body는 제외한다.

Activity type:

- Auto: `DEAL_CREATED`, `STAGE_CHANGED`, `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`, `SCHEDULE_LINKED`, `SCHEDULE_UNLINKED`, `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED`, `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED`
- Manual: `CALL`, `MEETING`, `EMAIL`, `VISIT`, `NOTE`

주요 API:

- `GET /api/deals/:dealId/activities`
- `POST /api/deals/:dealId/activities`
- `PATCH /api/deals/:dealId/activities/:activityId`

연결 확장:

- Deal list에 `products` summary와 `latestActivity`를 확장했다.
- Contact list에 `dealCount`를 확장했다.
- page size 15 contract를 정렬했다.

명시적 제외:

- Company/Contact/Product latest summary 전체 확장.
- generic summary endpoint.
- record-level detailed timeline.
- team CRM식 activity 확장.

## 8. 07 MeetingNote AI Provider Log

목적:

- 회의록 AI/STT/다음 행동/follow-up draft 생성의 provider observability와 safe 실패 처리를 만든다.

구현된 기능:

- `AiProviderCallLog`가 MeetingNote operation과 target linking을 가진다.
- 기존 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`에 provider log와 safe failure UX를 연결했다.
- text max 60,000 chars.
- audio max 25MB.
- STT transcript는 응답에서 일시 검토용으로만 보여주고 DB에 저장하지 않는다.
- `rawText`는 계속 `null` 정책이다.
- AI는 candidate/draft만 만들고, 사용자가 confirm해야 기존 Deal following action API로 저장된다.
- follow-up draft는 edit/copy 보조이며, 07에서는 DB 저장이나 자동 발송을 하지 않는다.

Operation:

- `MEETING_NOTE_TEXT_DRAFT`
- `MEETING_NOTE_STT_TRANSCRIPTION`
- `MEETING_NOTE_STT_DRAFT`
- `MEETING_NOTE_NEXT_ACTION_DRAFT`
- `MEETING_NOTE_FOLLOW_UP_DRAFT`

주요 API:

- `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`
- `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`

명시적 제외:

- transcript table
- provider raw/prompt storage
- follow-up draft DB save
- automatic send/schedule/deal mutation
- data cleanup suggestion
- meeting note list summary

## 9. 08 Global Data / I18N

목적:

- public/auth 다국어보다 `/app` 내부 제품 경험과 글로벌 데이터 모델을 먼저 정리한다.

구현된 기능:

- `/app` route에는 locale prefix를 붙이지 않는다.
- `/app?account=settings` 계정 모달에서 Language, Time zone, Country, Default currency를 수정하고 즉시 반영한다. `/app/settings` 사용자-facing route는 제거된 상태다.
- 신규 가입 기본값은 browser locale, proxy geo country, browser timezone을 사용하고 없으면 `ko-KR`, `KR`, `Asia/Seoul`, `KRW`로 fallback한다.
- DB는 UTC, API는 ISO, FE는 `User.preferredLocale + User.timeZone` 기준으로 표시한다.
- 1차 app locale: `ko-KR`, `en`.
- Product/Deal 금액은 정수 amount와 `currencyCode`를 함께 사용한다.
- 현재 구현된 1차 currency: `KRW`, `USD`. KR/US/CA 우선 전략에 맞춘 `CAD`는 후속 구현 범위다.
- Contact phone global fields: `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`.
- Company region/address는 1차로 Company에만 적용하고 Contact 개인 주소는 추가하지 않는다.
- 1차 region/country support: `KR`, `US`.
- Domain export는 locale-aware header/date-time/currency/phone 표시를 사용한다.
- Google, LINE, Apple auth provider를 정식 runtime provider로 구현했다. 버튼 순서는 Google, LINE, Apple이다.
- LINE/Apple 실제 OAuth provider smoke와 운영 설정 연결은 2026-07-29 사용자 확인 기준 완료됐다.

DB/API:

- `User.preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`
- `OAuthProvider.LINE`
- `Product.currencyCode`
- `Deal.currencyCode`
- `Contact.phoneCountryCode`, `phoneNationalNumber`, `phoneE164`
- `CompanyRegion.countryCode`, `regionCode`, `Company.address`
- `GET/PATCH /api/users/me/profile`
- `GET /api/auth/providers`
- `POST /api/auth/exchange`

명시적 제외:

- `/app` locale URL prefix.
- 이메일/비밀번호 로그인.
- marketing site 전체 rewrite.
- Contact 주소/지역 field.
- `KAKAO` runtime provider 복구.

## 10. 09 Product Analytics

목적:

- 완성형 BI가 아니라 Global B2C 유료 판매와 베타 운영에 필요한 분석 정본 foundation을 만든다.

구현된 기능:

- 자체 DB `ProductAnalyticsEvent`를 1차 정본으로 사용한다.
- 외부 analytics provider forwarding은 만들지 않는다.
- `POST /api/analytics/events` client event collector.
- User Web core `/app` route view는 `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때만 전송한다.
- analytics 저장 실패는 원래 제품 action을 막지 않는다.
- event는 `snake_case`, allowlist, `eventVersion` 기준을 따른다.
- `occurredAt`은 UTC instant, `eventDate`는 사용자 timezone 기준 local date다.
- activation snapshot과 D1/D7/D30 retention cohort snapshot batch를 구현했다.
- raw `ProductAnalyticsEvent`는 365일 초과 purge use case로 hard delete한다.
- `AiProviderCallLog` 기반 AI usage summary를 구현했다.
- billing/paywall/churn event는 reserved taxonomy에만 두고 runtime 구현하지 않는다.

DB/API:

- `ProductAnalyticsEventSource`
- `UserActivationStatus`
- `ProductAnalyticsTargetType`
- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`
- `POST /api/analytics/events`
- `ProductAnalyticsEventRecorder.recordServerEvent`
- `ProcessProductAnalyticsSnapshotsUseCase`
- `PurgeProductAnalyticsRawEventsUseCase`
- `SummarizeAiUsageUseCase`

Runtime event boundary:

- 09 client runtime event: `app_route_viewed`.

명시적 제외:

- billing/paywall/churn 실제 상태 전이.
- external analytics provider.
- public/auth route tracking, UTM/ad attribution, raw URL query, UUID path param.
- `AiUsageDaily` table.

## 11. 10 Mobile/PWA Field Use

목적:

- User Web 모바일 브라우저/PWA 기반 현장 입력성을 제공한다.
- 이 완료 범위는 User Web 모바일 브라우저 기준이다.

구현된 기능:

- `/app/meeting-notes` 또는 create dialog의 mobile recording.
- `MediaRecorder` 기반 녹음, permission denied/unsupported 상태의 audio file upload fallback.
- `POST /api/meeting-notes/stt-draft` 재사용.
- local draft TTL은 24시간이며, `불러오기`/`버리기` UX를 제공한다.
- mobile field-use analytics event allowlist를 09 analytics foundation에 추가했다.
- 360px/390px mobile viewport QA를 완료했다.

Local draft boundary:

- 서버 API 없음.
- DB table 없음.
- `UserDraft`, `LocalDraft`, `MobileDraft` model을 만들지 않는다.
- image/audio blob, transcript, provider raw response는 local draft에 저장하지 않는다.

Mobile event:

- `meeting_note_recording_started`
- `meeting_note_recording_completed`
- `meeting_note_recording_failed`
- `local_draft_saved`
- `local_draft_restored`
- `local_draft_discarded`

명시적 제외:

- custom `getUserMedia` camera preview/crop.
- PWA install prompt/offline shell.
- server-side draft persistence.

## 12. 현재 후속 판단

01~10은 기능 foundation 완료 상태지만, 유료 판매 완료 상태는 아니다.

바로 다음 작업:

1. S0/S1/S2 버그 수정과 유지보수.
2. UX/UI 상품성 개선.
3. 모바일/브라우저/다중 계정/운영 QA.
4. 결제창 없는 100명 베타.
5. 가격, 플랜, trial, entitlement, AI 사용량 제한, 환불, 세금, 인보이스 정책 확정.
6. `TODO/PADDLE_PLAN`을 confirmed Paddle Billing 계획으로 승격할지 결정.

Paddle/Billing에서 다시 열어야 하는 대표 범위:

- Paddle Billing/Checkout.
- subscription lifecycle.
- tax/Merchant of Record 처리.
- invoice/receipt/refund.
- failed payment/dunning.
- entitlement/paywall.
- AI usage quota source of truth.
- paid conversion/churn/ARPU/LTV analytics.
