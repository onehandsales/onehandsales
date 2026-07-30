# G04 Server Event Logging

상태: Completed
목표: 핵심 Backend domain 성공 event를 `ProductAnalyticsEvent`에 server event로 기록한다.

## 1. 목적

G04는 activation과 core usage의 정본이 되는 server event를 실제 제품 use case에 연결한다.

## 2. 포함 범위

- server event recorder service
- auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product module provider wiring
- auth/deal/schedule/meeting-note/business-card/import/export 성공 event 연결
- HTTP controller에서 `RequestWithRequestId.requestId`를 application input으로 전달
- recorder failure best-effort 처리
- domain service spec

## 3. 제외 범위

- Client route view wrapper
- Admin API/UI
- Billing/paywall/churn runtime event
- External analytics provider

## 4. 작업

1. `ProductAnalyticsEventRecorder`를 application service로 만든다.
2. server event allowlist와 payload schema를 구현한다.
3. `auth.module.ts`, `deal.module.ts`, `schedule.module.ts`, `meeting-note.module.ts`, `business-card.module.ts`, `data-import.module.ts`, `company.module.ts`, `contact.module.ts`, `product.module.ts`에 recorder dependency를 주입한다.
4. server event가 필요한 기존 HTTP controller method는 `@Req() request: RequestWithRequestId`를 받아 application input에 `requestId`를 전달한다.
5. `ExchangeExternalAuthTokenUseCase.execute`에서 신규 User 생성 branch에만 `auth_signup_completed`를 기록한다.
6. `DealApplicationService.createDeal`에서 `deal_created`와 초기 다음 행동이 생성된 경우 `deal_next_action_created`를 기록한다.
7. `DealApplicationService.createFollowingActionLog`에서 `deal_next_action_created`를 기록한다.
8. `ScheduleApplicationService.createSchedule`에서 `schedule_created`와 신규 딜 연결별 `schedule_deal_linked`를 기록한다.
9. `ScheduleApplicationService.updateSchedule`에서 새로 추가된 딜 연결별 `schedule_deal_linked`만 기록한다.
10. `MeetingNoteApplicationService.createMeetingNote`에서 `meeting_note_created`와 신규 딜 연결별 `meeting_note_deal_linked`를 기록한다.
11. `MeetingNoteApplicationService.updateMeetingNote`에서 새로 추가된 딜 연결별 `meeting_note_deal_linked`만 기록한다.
12. `MeetingNoteApplicationService.linkMeetingNoteDeals`에서 `dealsToLink`별 `meeting_note_deal_linked`를 기록한다.
13. `BusinessCardApplicationService.confirmScanLog`에서 `business_card_scan_confirmed`를 기록한다.
14. `DataImportApplicationService.confirmImportJob`에서 `import_confirmed`를 기록한다.
15. `CompanyApplicationService.exportCompaniesXlsx`, `ContactApplicationService.exportContactsXlsx`, `ProductApplicationService.exportProductsXlsx`, `DealApplicationService.exportDealsXlsx`에서 `export_downloaded`를 기록한다.
16. recorder 호출은 try/catch로 감싸 제품 API 성공을 막지 않는다.
17. idempotencyKey를 event별로 부여한다.
18. recorder 실패 시 warning log만 남긴다.

## 5. Request 계약

신규 HTTP request는 없다.

기존 HTTP handler에서 발생하는 server event는 `RequestWithRequestId.requestId`를 internal request로 넘긴다. Controller가 없는 background/internal 흐름만 `requestId=null`을 사용한다.

Internal request:

```ts
{
  userId: currentUser.id,
  authSessionId: currentUser.sessionId,
  requestId,
  eventName: "deal_created",
  eventVersion: 1,
  timeZone: currentUser.timeZone,
  idempotencyKey: `deal_created:${deal.id}`,
  targetType: "DEAL",
  targetId: deal.id,
  payload: {
    dealStatus: deal.dealStatus,
    currencyCode: deal.currencyCode,
    hasCompany: true,
    hasContact: true,
    hasProduct: true
  }
}
```

## 6. Response 계약

Internal response: 없음.

Caller 처리:

- 성공: 아무 동작 없음
- 실패: 제품 response 유지, warning log만 남김

## 7. Business Logic

Server event 기록 기준:

- `auth_signup_completed`: 신규 User가 만들어진 경우만 기록
- `deal_created`: 딜 생성 성공 후 기록
- `deal_next_action_created`: 다음 행동 생성 성공 후 기록
- `schedule_created`: 일정 생성 성공 후 기록
- `schedule_deal_linked`: 일정 생성/수정에서 새 일정-딜 연결이 추가된 경우만 기록
- `meeting_note_created`: 회의록 저장 성공 후 기록
- `meeting_note_deal_linked`: 회의록 생성/수정/딜 연결 API에서 새 회의록-딜 연결이 추가된 경우만 기록
- `business_card_scan_confirmed`: OCR 결과 확인 저장 성공 후 기록
- `import_confirmed`: import 확정 성공 후 기록
- `export_downloaded`: xlsx 생성 성공 후 기록

Analytics 저장 실패:

```text
product mutation success
-> recorder failure
-> analytics.event.recordFailed warn log
-> original response 유지
```

## 8. User Flow

1. 사용자가 딜을 생성한다.
2. 딜 생성 use case가 성공한다.
3. Backend가 `deal_created`를 기록한다.
4. 다음 행동이 생성되면 `deal_next_action_created`를 기록한다.
5. Snapshot batch가 activation을 계산한다.

사용자는 analytics 기록 여부를 보지 않는다.

## 9. DB/Prisma 영향

G04는 G02의 `ProductAnalyticsEvent`를 사용한다.

- 조회: AuthSession
- 생성: ProductAnalyticsEvent
- 수정: 없음
- transaction: 제품 mutation transaction과 분리

## 10. 코드 주석 기준

Backend:

- recorder class/interface: `// 역할 : ...`
- recorder method: `// 기능 : server 분석 이벤트를 allowlist 기준으로 저장합니다.`
- controller requestId 전달부: `// 기능 : HTTP request id를 server 분석 이벤트 추적용으로 전달합니다.`
- auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product use case에서 recorder 호출 전 numbered step comment를 둔다.
- catch block에는 사용자 응답을 막지 않는 이유를 짧은 한국어 주석으로 남긴다.
- server event `eventDate` 저장은 G02의 `resolveProductAnalyticsEventDate`, `toProductAnalyticsDateOnlyDate` helper만 사용한다.

## 11. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- auth deal schedule meeting-note business-card data-import analytics
```

검증 결과:

- 2026-07-30 `pnpm run typecheck` 통과
- 2026-07-30 `pnpm run lint` 통과
- 2026-07-30 `pnpm run test -- auth deal schedule meeting-note business-card data-import analytics` 통과, 39 suites / 237 tests

## 12. Goal 검토 체크리스트

- [x] recorder failure가 제품 API 실패로 전파되지 않는다.
- [x] server event payload에 PII/raw text가 없다.
- [x] activation 필수 event가 기록된다.
- [x] idempotencyKey가 중복 event를 막는다.
- [x] HTTP에서 발생한 server event는 `RequestWithRequestId.requestId`를 recorder command로 전달한다.
- [x] log에 payload 원문이 남지 않는다.
- [x] 신규/수정 코드에 한국어 주석이 있다.
