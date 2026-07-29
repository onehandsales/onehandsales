# Business Logic

상태: Confirmed

## 0. Software Agent 기준

09의 비즈니스 로직은 `AGENT/SOFTWARE_AGENT` 기준을 따른다.

필수 원칙:

- controller에는 비즈니스 로직을 두지 않는다.
- application use case가 인증, validation, event allowlist, ownership, transaction 경계를 책임진다.
- domain/application layer는 Prisma type과 HTTP SDK를 직접 import하지 않는다.
- payload 원문과 민감정보는 log에 남기지 않는다.
- 모든 신규/수정 Backend 코드에는 한국어 주석 규칙을 적용한다.
- 모든 신규/수정 Frontend component/hook/API client에는 `// 기능 : ...` 주석을 적용한다.

## 1. Event 수집

Client event 흐름:

1. User Web route가 core `/app` allowlist route인지 확인한다.
2. routeKey를 허용 payload로 만든다. `surface`는 FE가 진입 surface를 명시적으로 알 때만 optional로 보낸다.
3. `POST /api/analytics/events`를 호출한다.
4. 실패하면 사용자에게 표시하지 않고 조용히 종료한다.
5. Backend는 AuthGuard로 현재 사용자를 확인한다.
6. eventName, eventVersion, payload allowlist를 검증한다.
7. `ProductAnalyticsRepository.findAuthDeviceIdBySessionId(CurrentUserContext.sessionId)`로 `authDeviceId`를 찾는다.
8. 조회 결과가 없으면 `authDeviceId=null`로 계속 진행한다.
9. `occurredAt=serverNow`, `eventDate=resolveProductAnalyticsEventDate(serverNow, user.timeZone)`, `source=CLIENT`로 저장한다.

Server event 흐름:

1. auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product caller가 기존 validation과 ownership을 수행한다.
2. 제품 mutation을 성공시킨다.
3. response에 필요한 DTO를 만든다.
4. 성공 후 analytics recorder를 best-effort로 호출한다.
5. recorder는 allowlist payload와 idempotencyKey를 검증한다.
6. 저장 실패 시 warning log만 남기고 제품 response는 유지한다.

## 2. Activation

Activation 기준:

```text
첫 deal_created
+ 첫 deal_next_action_created 또는 schedule_deal_linked 또는 meeting_note_deal_linked
```

계산 흐름:

1. 사용자별 첫 `deal_created` event를 찾는다.
2. 사용자별 첫 meaningful action event를 찾는다.
3. 두 조건이 모두 있으면 둘 중 늦은 시각을 `activatedAt`으로 둔다.
4. `activatedEventDate`는 `activatedAt`을 만든 event row의 `eventDate`다.
5. `timeZone`은 `activatedAt`을 만든 event row의 `timeZone`이다.
6. `UserActivationSnapshot`을 upsert한다.

의미:

- signup만으로 activation 처리하지 않는다.
- route view만으로 activation 처리하지 않는다.
- import로 딜이 생성되는 경우 `deal_created` 또는 `import_confirmed`에서 실제 딜 생성 수를 알 수 있게 payload를 둔다.

## 3. Retention

Retention 기준:

- active user day는 `app_route_viewed` 또는 server core event가 해당 user의 `eventDate`에 하나 이상 있는 날이다.
- active server event는 `deal_created`, `deal_next_action_created`, `schedule_created`, `schedule_deal_linked`, `meeting_note_created`, `meeting_note_deal_linked`, `business_card_scan_confirmed`, `import_confirmed`, `export_downloaded`다.
- D1/D7/D30은 activation date 기준 day offset으로 계산한다.
- 날짜 기준은 UTC가 아니라 사용자 timezone 기준 `eventDate`다.
- day offset 계산은 `addDaysToProductAnalyticsDate(cohortDate, dayOffset)` helper로 수행한다.
- helper는 date-only `YYYY-MM-DD`를 직접 분해해 `Date.UTC(year, month - 1, day + dayOffset)`로 계산하고 서버 local timezone을 쓰지 않는다.
- Prisma `DateTime @db.Date` 저장 변환은 `toProductAnalyticsDateOnlyDate(eventDate)` helper로 수행한다.
- Prisma `DateTime @db.Date` 조회 변환은 `formatProductAnalyticsDateOnlyDate(value)` helper로 수행한다.

계산 흐름:

1. activation snapshot에서 cohort date를 얻는다.
2. `ProductAnalyticsEvent`에서 cohort date + dayOffset 날짜의 active event를 찾는다.
3. `cohortUserCount`는 같은 cohort date의 activated user distinct count로 계산한다.
4. `retainedUserCount`는 target eventDate에 active event가 있는 cohort user distinct count로 계산한다.
5. `RetentionCohortSnapshot`에 upsert한다.

## 4. AI Usage

09 1차 기준:

- `AiProviderCallLog`를 사용한다.
- 사용자별 요청 수, 성공 수, 실패 수, 대기 수, 취소 수, token, estimated cost를 계산한다.
- day grouping은 `AiProviderCallLog.startedAt` UTC instant를 현재 `User.timeZone` 기준 `YYYY-MM-DD`로 변환한다.
- 09 AI usage day는 관리자 참고용 read model이며 billing source of truth가 아니다.
- provider prompt/raw response는 저장하지 않는다.
- Admin에서 사용자별 AI 사용횟수를 보여줄 수 있도록 11에서 이 read model을 사용한다.

12 Billing에서 반드시 다시 결정할 항목:

- AI plan/quota/paywall이 필요해지면 `AiUsageDaily` 또는 `UsageMeter`를 만든다.
- 09에서는 reserved로만 남긴다.

## 5. Billing / Growth Reserved

09는 아래 event를 실제로 발생시키지 않는다.

- `paywall_viewed`
- `upgrade_clicked`
- `trial_started`
- `coupon_applied`
- `referral_invited`
- `subscription_started`
- `subscription_canceled`
- `churn_survey_submitted`

12에서 할 일:

- 실제 API/UI state transition을 확정한다.
- webhook/server event와 client event 경계를 확정한다.
- churn survey 저장 table을 확정한다.
- 09 reserved taxonomy와 event 이름을 sync한다.

## 6. Retention / Deletion

Raw event retention:

- `ProductAnalyticsEvent`는 365일 보관한다.
- retention purge는 `ProductAnalyticsEvent.occurredAt < now - 365 days` raw event만 hard delete한다.
- purge cutoff는 `new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)`로 계산한다.
- purge는 `UserActivationSnapshot`, `RetentionCohortSnapshot`, `AiProviderCallLog`를 삭제하지 않는다.
- aggregate snapshot은 userId가 없으므로 장기 보관한다.

Account deletion:

1. 삭제 요청 시 사용자 접근을 막고 30일 유예 상태로 둔다.
2. 유예 중 복구하면 analytics row는 유지된다.
3. 30일 후 실제 삭제 시 user-linked raw event와 user-level snapshot을 삭제한다.
4. 법무/세금/보안/결제 예외 기록은 ProductAnalyticsEvent에 남기지 않는다.

## 7. Error / Validation

Collector API error code:

- `ANALYTICS_EVENT_UNSUPPORTED`
- `ANALYTICS_EVENT_VERSION_UNSUPPORTED`
- `ANALYTICS_PAYLOAD_INVALID`
- `ANALYTICS_PAYLOAD_PII_REJECTED`
- `ANALYTICS_ROUTE_KEY_UNSUPPORTED`

FE 처리:

- analytics error는 사용자에게 표시하지 않는다.
- `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때만 User Web client event를 전송한다.
- 개발/test 기본값은 비활성이다. test는 API client mock으로 route mapper와 hook 호출 조건을 확인한다.

BE 처리:

- validation error는 저장하지 않는다.
- unknown error는 exception filter와 request id로 추적한다.
- server event recorder 실패는 warning log만 남긴다.
