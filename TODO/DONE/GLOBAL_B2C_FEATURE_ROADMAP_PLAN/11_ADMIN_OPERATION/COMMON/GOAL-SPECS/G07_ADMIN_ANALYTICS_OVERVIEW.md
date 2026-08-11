# G07 Admin Analytics Overview

상태: Implemented
목표: 09 Product Analytics foundation을 읽어 Admin 운영 분석 요약을 만든다.

## 1. 포함 범위

- `GET /admin/api/analytics/overview`
- Admin Web `/analytics`
- activation summary
- retention summary
- core event count
- route view count
- AI usage/cost summary
- 10 mobile field-use event summary

## 2. 제외 범위

- paid conversion
- churn
- ARPU
- LTV/CAC
- subscription/plan/revenue
- billing/paywall funnel
- 외부 analytics provider

## 3. Backend 작업

1. 09 `ProductAnalyticsEvent` aggregate query를 만든다.
2. `UserActivationSnapshot` activation summary를 만든다.
3. `RetentionCohortSnapshot` retention summary를 만든다.
4. `AiProviderCallLog` 기반 AI usage/cost summary를 연결한다.
5. 10번 mobile field-use eventName count와 allowlist payload bucket을 집계한다.
6. billing/subscription event를 추가하지 않는다.
7. Admin analytics 조회 audit를 남긴다.

## 4. Frontend 작업

1. `/analytics` page를 만든다.
2. 기간/timezone filter를 만든다.
3. activation, retention, events, routes, AI usage, mobile field-use section을 만든다.
4. 결제/구독 지표 section을 만들지 않는다.
5. chart는 필요한 경우에만 쓰고 숫자 표를 같이 둔다.

## 5. Request 계약

```http
GET /admin/api/analytics/overview?from=2026-07-01T00:00:00.000Z&to=2026-07-31T23:59:59.999Z&timeZone=Asia/Seoul
```

상세 계약: `COMMON/API-SPEC/ADMIN_ANALYTICS_API.md`

## 6. Response 계약

```json
{
  "activation": {
    "activatedUsers": 120,
    "notActivatedUsers": 42,
    "activationRate": 0.7407
  },
  "events": [
    {
      "eventName": "deal_created",
      "count": 340
    }
  ],
  "aiUsage": {
    "requestCount": 460,
    "successCount": 430,
    "failureCount": 30,
    "estimatedCost": "18.24"
  },
  "mobileFieldUse": {
    "businessCardCaptureStarted": 44,
    "businessCardCaptureRetried": 12,
    "businessCardOcrFailed": 8,
    "meetingNoteRecordingStarted": 31,
    "meetingNoteRecordingCompleted": 25,
    "meetingNoteRecordingFailed": 3,
    "localDraftSaved": 52,
    "localDraftRestored": 16,
    "localDraftDiscarded": 14,
    "mobilePushPermissionPromptOpened": 20,
    "mobilePushPermissionResult": {
      "granted": 8,
      "denied": 3,
      "default": 6,
      "unsupported": 3,
      "browserPushEnabledTrue": 8,
      "browserPushEnabledFalse": 12
    }
  }
}
```

## 7. Business Logic

- 09 DB foundation과 10 mobile field-use event만 source로 사용한다.
- 10 mobile field-use event는 새 event를 추가하지 않고 기존 `ProductAnalyticsEvent`만 집계한다.
- analytics payload raw JSON을 그대로 Admin response에 dump하지 않는다.
- AI usage는 prompt/raw response 없이 count/token/cost/status만 집계한다.
- push permission 집계는 `permissionState`, `browserPushEnabled` allowlist bucket만 사용한다.
- billing-linked 지표는 12 전까지 reserved다.

## 8. User Flow

1. Admin이 `/analytics`에 진입한다.
2. 기간과 timezone을 선택한다.
3. activation/retention/core events/mobile field-use/AI usage를 확인한다.
4. 결제/구독 지표가 필요하면 12 범위로 이동한다.

## 9. DB/Prisma 영향

신규 DB 변경 없음.

조회:

- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`
- `AiProviderCallLog`
- `AdminAuditLog`

## 10. 주석 기준

```ts
// 기능 : 09 ProductAnalyticsEvent를 Admin 운영 요약으로 집계합니다.
// 기능 : billing source가 없는 지표를 11에서 계산하지 않도록 제한합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run test -- product-analytics admin
```

결과: 통과. 20개 test suite, 77개 test 통과.

```powershell
cd FE/admin-web
pnpm run build
```

결과: 통과. `tsc -b && vite build` 완료.

## 12. Goal 체크리스트

- [x] Admin analytics overview API가 있다.
- [x] activation summary가 있다.
- [x] retention summary가 있다.
- [x] core event count가 있다.
- [x] route view count가 있다.
- [x] AI usage/cost summary가 있다.
- [x] 10 mobile field-use event summary가 있다.
- [x] mobile analytics raw payload를 response에 dump하지 않는다.
- [x] billing/subscription/paid conversion/churn 지표가 없다.
- [x] analytics 조회 audit가 남는다.
- [x] Admin Web `/analytics` 화면이 있다.
- [x] 검증 command 결과를 기록했다.
