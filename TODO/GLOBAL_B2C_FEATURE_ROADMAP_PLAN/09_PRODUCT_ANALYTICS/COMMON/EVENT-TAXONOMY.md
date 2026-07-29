# Event Taxonomy

상태: Confirmed
최종 업데이트: 2026-07-29

## 1. 목적

09에서 실제로 저장할 제품 분석 event 이름, source, target, idempotencyKey, payload schema를 고정한다.

이 문서에 없는 event는 09 runtime에서 저장하지 않는다. Billing/paywall/churn event는 아래 `Reserved`에만 두고 실제 발생은 12에서 확정한다.

## 2. 공통 저장 규칙

모든 event는 아래 공통 field를 가진다.

| Field | 저장 주체 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| `userId` | Backend | UUID | 필수 | 현재 사용자 ID |
| `authSessionId` | Backend | UUID/null | 선택 | `CurrentUserContext.sessionId` |
| `authDeviceId` | Backend | UUID/null | 선택 | `AuthSession.authDeviceId` |
| `eventName` | FE 또는 Backend | string | 필수 | 이 문서 allowlist 이름 |
| `eventVersion` | FE 또는 Backend | int | 필수 | 09 1차는 모두 `1` |
| `source` | Backend | enum | 필수 | `CLIENT`, `SERVER`, `SYSTEM` |
| `occurredAt` | Backend | DateTime | 필수 | UTC instant. client가 보내지 않는다. |
| `eventDate` | Backend | Date | 필수 | 사용자 timezone 기준 `YYYY-MM-DD` |
| `timeZone` | Backend | string | 필수 | 이벤트 당시 사용자 IANA timezone |
| `idempotencyKey` | Backend | string/null | 조건부 필수 | server event는 필수, client event는 null |
| `targetType` | Backend | enum/null | 선택 | 안전한 대상 타입 |
| `targetId` | Backend | UUID/null | 선택 | 안전한 대상 UUID |
| `payloadJson` | Backend | JSON | 필수 | event별 allowlist payload |

Client request는 `eventName`, `eventVersion`, `payload`만 보낸다.

Server event 저장 validation:

- `source=SERVER`이면 `idempotencyKey`는 비어 있으면 안 된다.
- `source=CLIENT`이면 `idempotencyKey`는 항상 null이다.
- `targetType`은 아래 enum allowlist만 허용한다.

## 3. Target Type Allowlist

| targetType | 의미 |
|---|---|
| `USER` | 사용자 자체 행동 |
| `DEAL` | 딜 |
| `SCHEDULE` | 일정 |
| `MEETING_NOTE` | 회의록 |
| `BUSINESS_CARD_SCAN` | 명함 스캔 로그 |
| `IMPORT_JOB` | persistent import job |
| `EXPORT` | 도메인 export |

## 4. Client Event

### app_route_viewed

| 항목 | 값 |
|---|---|
| source | `CLIENT` |
| eventVersion | `1` |
| targetType | `null` |
| targetId | `null` |
| idempotencyKey | `null` |
| 기록 위치 | `FE/user-web/src/features/analytics/hooks/use-app-route-analytics.ts` |
| Backend 수집 | `POST /api/analytics/events` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `routeKey` | string | yes | 아래 routeKey allowlist |
| `surface` | string | no | FE가 진입 surface를 명시적으로 알 때만 `sidebar`, `bottom_nav`, `direct`, `redirect`, `unknown` |

RouteKey allowlist:

| routeKey | route match |
|---|---|
| `home` | `/app` |
| `companies` | `/app/companies` |
| `company_create` | `/app/companies/new`, `/app/companies/new/full` |
| `company_detail` | `/app/companies/:companyId` |
| `contacts` | `/app/contacts` |
| `contact_create` | `/app/contacts/new`, `/app/contacts/new/full` |
| `contact_detail` | `/app/contacts/:contactId` |
| `products` | `/app/products` |
| `product_create` | `/app/products/new`, `/app/products/new/full` |
| `product_detail` | `/app/products/:productId` |
| `deals` | `/app/deals` |
| `deal_create` | `/app/deals/new`, `/app/deals/new/full` |
| `deal_detail` | `/app/deals/:dealId` |
| `schedules` | `/app/schedules` |
| `schedule_week` | `/app/schedules/week` |
| `schedule_detail` | `/app/schedules/:scheduleId` |
| `meeting_notes` | `/app/meeting-notes` |
| `meeting_note_create` | `/app/meeting-notes/new/full` |
| `meeting_note_detail` | `/app/meeting-notes/:meetingNoteId` |
| `business_cards` | `/app/business-cards` |
| `notifications` | `/app/notifications` |
| `import` | `/app/import` |
| `import_review` | `/app/import/review/:importJobId` |
| `import_detail` | `/app/import/:importUserLogId` |
| `trash` | `/app/trash` |
| `settings` | `/app/settings` |
| `more` | `/app/more` |

Validation:

- route mapper는 exact/static route와 `new`/`new/full` route를 dynamic `:id` route보다 먼저 검사한다.
- raw URL 저장 금지
- UUID path param 저장 금지
- query string 저장 금지
- public/auth/legacy redirect route 저장 금지
- `/app/contacts/scan`, `/app/meeting-notes/new`, `/app/export` 같은 redirect-only route 저장 금지

## 5. Server Event

### auth_signup_completed

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `USER` |
| targetId | 신규 `User.id` |
| idempotencyKey | `auth_signup_completed:{userId}:{provider}` |
| 기록 위치 | `ExchangeExternalAuthTokenUseCase` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `provider` | string | yes | `google`, `line`, `apple` |
| `locale` | string | yes | `ko-KR`, `en` |
| `countryCode` | string/null | no | `KR`, `US`, null |
| `timeZone` | string | yes | IANA timezone |

계산 기준:

- `provider`: `VerifiedExternalUser.provider` 값을 그대로 사용한다.
- Prisma `OAuthProvider` enum 값으로 변환하지 않는다.

### deal_created

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `DEAL` |
| targetId | `Deal.id` |
| idempotencyKey | `deal_created:{dealId}` |
| 기록 위치 | `DealApplicationService.createDeal` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `dealStatus` | string | yes | `INITIAL_CONTACT`, `NEEDS_CHECK`, `PROPOSAL_QUOTE`, `NEGOTIATION`, `WON`, `LOST` |
| `currencyCode` | string | yes | `KRW`, `USD` |
| `hasCompany` | boolean | yes | true/false |
| `hasContact` | boolean | yes | true/false |
| `hasProduct` | boolean | yes | true/false |

계산 기준:

- `dealStatus`: 생성 직후 `Deal.dealStatus`
- `currencyCode`: 생성 직후 `Deal.currencyCode`
- `hasCompany`: 생성 요청에서 연결 회사가 1개 이상이면 true
- `hasContact`: 생성 요청에서 연결 담당자가 1개 이상이면 true
- `hasProduct`: 생성 요청에서 연결 제품이 1개 이상이면 true

### deal_next_action_created

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `DEAL` |
| targetId | `Deal.id` |
| idempotencyKey | `deal_next_action_created:{followingActionLogId}` |
| 기록 위치 | `DealApplicationService.createDeal`, `DealApplicationService.createFollowingActionLog` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `source` | string | yes | `deal_create`, `manual_log` |

계산 기준:

- `DealApplicationService.createDeal`에서 초기 다음 행동 로그가 생성되면 `source=deal_create`
- `DealApplicationService.createFollowingActionLog`에서 사용자가 다음 행동을 수동 생성하면 `source=manual_log`

### schedule_created

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `SCHEDULE` |
| targetId | `Schedule.id` |
| idempotencyKey | `schedule_created:{scheduleId}` |
| 기록 위치 | `ScheduleApplicationService.createSchedule` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `sourceType` | string | yes | `INTERNAL`, `GOOGLE` |
| `isAllDay` | boolean | yes | true/false |
| `hasDealLink` | boolean | yes | true/false |

계산 기준:

- `sourceType`: 생성 직후 조회한 `ScheduleRecord.sourceType`
- `isAllDay`: 생성 직후 조회한 `ScheduleRecord.isAllDay`
- `hasDealLink`: 생성 직후 조회한 `ScheduleRecord.deals.length > 0`

### schedule_deal_linked

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `SCHEDULE` |
| targetId | `Schedule.id` |
| idempotencyKey | `schedule_deal_linked:{scheduleId}:{dealId}` |
| 기록 위치 | `ScheduleApplicationService.createSchedule`, `ScheduleApplicationService.updateSchedule` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `linkCountBucket` | string | yes | `1`, `2_3`, `4_plus` |

기록 기준:

- `createSchedule`: 생성 요청의 `dealIds`에 들어온 각 dealId마다 1회 기록한다.
- `updateSchedule`: 기존 연결에는 없고 요청 `dealIds`에 새로 추가된 dealId만 기록한다.
- 딜 연결 삭제, 기존 연결 유지, 일정 기본 정보만 수정한 경우에는 기록하지 않는다.
- `linkCountBucket`은 mutation 후 해당 일정에 연결된 전체 딜 수 기준이다.

### meeting_note_created

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `MEETING_NOTE` |
| targetId | `MeetingNote.id` |
| idempotencyKey | `meeting_note_created:{meetingNoteId}` |
| 기록 위치 | `MeetingNoteApplicationService.createMeetingNote` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `sourceType` | string | yes | `MANUAL`, `TEXT_AI`, `STT_AI` |
| `hasDealLink` | boolean | yes | true/false |
| `hasAiDraft` | boolean | yes | true/false |

계산 기준:

- `sourceType`: 생성 직후 조회한 `MeetingNoteRecord.sourceType`
- `hasDealLink`: 생성 직후 조회한 `MeetingNoteRecord.deals` 중 `isDeleted=false`인 관계가 1개 이상이면 true
- `hasAiDraft`: `sourceType`이 `TEXT_AI` 또는 `STT_AI`이면 true, `MANUAL`이면 false

### meeting_note_deal_linked

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `MEETING_NOTE` |
| targetId | `MeetingNote.id` |
| idempotencyKey | `meeting_note_deal_linked:{meetingNoteId}:{dealId}` |
| 기록 위치 | `MeetingNoteApplicationService.createMeetingNote`, `MeetingNoteApplicationService.updateMeetingNote`, `MeetingNoteApplicationService.linkMeetingNoteDeals` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `linkCountBucket` | string | yes | `1`, `2_3`, `4_plus` |

기록 기준:

- `createMeetingNote`: 생성 요청의 `deals`에 들어온 각 dealId마다 1회 기록한다.
- `updateMeetingNote`: 기존 연결에는 없고 요청 `deals`에 새로 추가된 dealId만 기록한다.
- `linkMeetingNoteDeals`: `dealsToLink`에 남은 신규 dealId마다 1회 기록한다.
- 딜 연결 삭제, 기존 연결 유지, 회의록 본문/메타데이터만 수정한 경우에는 기록하지 않는다.
- `linkCountBucket`은 mutation 후 해당 회의록에 연결된 전체 딜 수 기준이다.

### business_card_scan_confirmed

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `BUSINESS_CARD_SCAN` |
| targetId | `BusinessCardScanLog.id` |
| idempotencyKey | `business_card_scan_confirmed:{businessCardScanLogId}` |
| 기록 위치 | `BusinessCardApplicationService.confirmScanLog` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `companyResolution` | string | yes | `EXISTING`, `CREATED` |
| `contactResolution` | string | yes | `EXISTING`, `CREATED` |
| `createdCompany` | boolean | yes | true/false |
| `createdContact` | boolean | yes | true/false |

계산 기준:

- `companyResolution`: `BusinessCardConfirmResult.company.resolution`
- `contactResolution`: `BusinessCardConfirmResult.contact.resolution`
- `createdCompany`: `companyResolution === "CREATED"`
- `createdContact`: `contactResolution === "CREATED"`
- OCR raw text, 이미지 URL, 회사명, 담당자명, 이메일, 전화번호는 payload에 넣지 않는다.

### import_confirmed

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `IMPORT_JOB` |
| targetId | `ImportJob.id` |
| idempotencyKey | `import_confirmed:{importJobId}` |
| 기록 위치 | `DataImportApplicationService.confirmImportJob` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `importType` | string | yes | `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL` |
| `rowCountBucket` | string | yes | `1`, `2_10`, `11_50`, `51_200`, `201_plus` |
| `importedRowCount` | number | yes | 1 이상 정수 |

기록 기준:

- target은 `confirmImportJob` request의 `importJobId`로 고정한다.
- `importType`: `ImportJobDetailResponse.job.targetType`
- `importedRowCount`: `ConfirmImportJobResponse.importedRowCount`
- `rowCountBucket`: `importedRowCount` 기준 bucket
- `ImportUserLog.id`는 성공 내역 조회용 domain 결과이며 09 analytics target으로 저장하지 않는다.
- 같은 `importJobId`의 재시도/idempotent 성공 응답은 같은 `idempotencyKey`로 중복 저장을 막는다.

### export_downloaded

| 항목 | 값 |
|---|---|
| source | `SERVER` |
| targetType | `EXPORT` |
| targetId | `null` |
| idempotencyKey | `export_downloaded:{userId}:{exportType}:{requestId}` |
| 기록 위치 | `CompanyApplicationService.exportCompaniesXlsx`, `ContactApplicationService.exportContactsXlsx`, `ProductApplicationService.exportProductsXlsx`, `DealApplicationService.exportDealsXlsx` |

Payload schema:

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `exportType` | string | yes | `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL` |
| `rowCountBucket` | string | yes | `0`, `1`, `2_10`, `11_50`, `51_200`, `201_plus` |
| `locale` | string | yes | `ko-KR`, `en` |

09에서는 주간 일정 리포트 xlsx와 import template xlsx 다운로드를 `export_downloaded`에 포함하지 않는다.

## 6. System Event

09 1차 runtime system event는 raw event table에 저장하지 않는다.

Snapshot runner와 retention purge는 `ProductAnalyticsEvent`가 아니라 structured log와 snapshot table만 사용한다.

## 7. Reserved Event

아래 event는 09 runtime allowlist에 넣지 않는다.

| Event | 12에서 정할 내용 |
|---|---|
| `paywall_viewed` | paywall 화면/조건/source |
| `upgrade_clicked` | upgrade CTA 위치와 checkout 연결 |
| `trial_started` | trial 시작 기준과 provider event |
| `coupon_applied` | coupon 검증/적용 성공 기준 |
| `referral_invited` | referral invite 발송/수락 기준 |
| `subscription_started` | billing provider webhook과 checkout success 경계 |
| `subscription_canceled` | cancel effective date와 churn survey 연결 |
| `churn_survey_submitted` | survey 저장 table과 PII/privacy 기준 |
