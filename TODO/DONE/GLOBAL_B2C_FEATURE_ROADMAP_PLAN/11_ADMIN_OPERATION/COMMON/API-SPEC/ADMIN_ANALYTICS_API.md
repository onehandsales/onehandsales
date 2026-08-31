# Admin Analytics API

상태: Implemented
연결 Goal: G07
소비자: Admin Web

## 1. GET /admin/api/analytics/overview

- API 이름: Admin 운영 분석 요약 API
- API 식별자: `GetAdminAnalyticsOverview`
- Request: `GetAdminAnalyticsOverviewQuery`
- Response: `AdminAnalyticsOverviewResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `from` | ISO string | yes | UTC instant |
| `to` | ISO string | yes | UTC instant |
| `timeZone` | string | no | IANA timezone, default `Asia/Seoul` |
| `countryCode` | string | no | optional filter |
| `preferredLocale` | string | no | optional filter |

Response:

```json
{
  "range": {
    "from": "2026-07-01T00:00:00.000Z",
    "to": "2026-07-31T23:59:59.999Z",
    "timeZone": "Asia/Seoul"
  },
  "activation": {
    "activatedUsers": 120,
    "notActivatedUsers": 42,
    "activationRate": 0.7407
  },
  "retention": [
    {
      "cohortDate": "2026-07-01",
      "dayOffset": 7,
      "cohortUserCount": 40,
      "retainedUserCount": 18,
      "retentionRate": 0.45
    }
  ],
  "events": [
    {
      "eventName": "deal_created",
      "count": 340
    },
    {
      "eventName": "meeting_note_created",
      "count": 128
    }
  ],
  "routes": [
    {
      "routeKey": "deals",
      "viewCount": 820
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

Business Logic:

1. AdminGuard를 확인한다.
2. `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`을 조회한다.
3. AI usage는 `AiProviderCallLog` aggregate를 사용한다.
4. 10번 mobile field-use event는 eventName count와 allowlist payload bucket만 집계한다.
5. PII/raw payload를 조회하지 않는다.
6. billing/subscription 관련 event는 11에서 만들거나 조회하지 않는다.
7. 조회 audit를 남긴다.

Transaction: 없음.

Implementation note:

- 조회 본문은 transaction 없이 read model aggregate로 처리하고, 조회 성공 후 `ADMIN_ANALYTICS_VIEW` audit를 append-only로 남긴다.
- `countryCode`, `preferredLocale` filter는 사용자 relation이 있는 activation/event/AI usage aggregate에 적용한다. `RetentionCohortSnapshot`은 비식별 cohort snapshot이라 기간/timezone 기준으로 조회한다.

Observability:

- audit log: `ADMIN_ANALYTICS_VIEW`
- redaction: analytics payload raw dump 금지, push endpoint/key/userAgent 원문 금지

Error:

| 상황 | code | status |
|---|---|---|
| 기간 누락 | `ADMIN_ANALYTICS_RANGE_REQUIRED` | 400 |
| 기간 과도 | `ADMIN_ANALYTICS_RANGE_TOO_LARGE` | 400 |
| timezone invalid | `ADMIN_TIMEZONE_INVALID` | 400 |

## 2. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 Admin Web 전용 운영 분석 조회 API 보관 문서다. G05에서는 현재 구현 기준의 권한, audit, observability, FE/BE 처리 기준을 보강하며 기존 aggregate response shape는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: Admin Web
- 호환성: 기존 `/admin/api/analytics/overview` GET 계약 유지. breaking change 없음
- 권한: `AuthGuard` + `AdminGuard`, application service의 `assertAdmin`
- FE 호출 경계: `adminApiClient` 상대 경로 `/analytics/overview`, 최종 path `/admin/api/analytics/overview`

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| Admin 운영 분석 요약 API | `GetAdminAnalyticsOverview` | `GET` | `/admin/api/analytics/overview` | `GetAdminAnalyticsOverviewQueryDto` / FE `AdminAnalyticsOverviewParams` | `AdminAnalyticsOverviewResponse` |

연결된 DB 스키마:

- 조회: `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`, `AiProviderCallLog`, `User`
- audit: `AdminAuditLog`

Transaction:

- 필요 여부: 조회 본문은 없음. read model aggregate를 transaction 없이 조회한다.
- audit log 포함: 조회 성공 후 `ADMIN_ANALYTICS_VIEW` audit를 append-only로 생성한다. 현재 구현은 audit 저장 실패가 발생하면 요청 실패로 전파한다.
- 외부 Provider: 없음. AI provider 원문 조회 없이 저장된 provider call log aggregate만 사용한다.

Observability:

- log event key: 별도 application log event 없음. audit action은 `ADMIN_ANALYTICS_VIEW`
- audit log: 필수. 현재 구현 metadata는 기간, timezone, 활성 filter key, country/preferredLocale filter만 저장한다.
- request id: controller에서 application metadata로 전달해 audit에 저장한다.
- masking/redaction: analytics raw payload, route raw payload dump, push endpoint/key/userAgent 원문, AI prompt/raw response/token 상세를 응답과 log에 포함하지 않는다.
- provider error context: 저장된 `AiProviderCallLog`의 count/cost/failure aggregate만 사용하며 provider 원문 context는 제외한다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| `from`/`to` 누락 또는 invalid ISO | `ADMIN_ANALYTICS_RANGE_REQUIRED` | 400 | 기간 필터 inline 오류 | warn |
| 기간 상한 초과 | `ADMIN_ANALYTICS_RANGE_TOO_LARGE` | 400 | 기간 축소 안내 | warn |
| timezone invalid | `ADMIN_TIMEZONE_INVALID` | 400 | timezone 기본값 재설정 또는 필터 오류 안내 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin Web 접근 차단 또는 login 화면 이동 | warn |
| aggregate/audit 저장 실패 | 내부 오류 | 500 | overview 오류 상태와 재시도 제공 | error |

FE/BE 처리 기준:

- FE는 빈 문자열 filter를 query에 싣지 않고, 날짜는 ISO instant string으로 보낸다.
- BE는 `timeZone` 기본값을 `Asia/Seoul`로 보정하고 기간 상한을 366일로 제한한다.
- 응답은 집계값만 반환하며 사용자 식별 raw event payload를 반환하지 않는다.
- G05 범위에서는 billing/subscription 관련 신규 event나 Admin analytics target type 확장을 추가하지 않는다.
