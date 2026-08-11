# AI Usage Analytics Contract

상태: Implemented

## 1. 목적

기존 `AiProviderCallLog`를 이용해 사용자별 AI 요청 수, 성공/실패, token, 추정 비용을 계산한다.

09에서는 새 `AiUsageDaily` table을 만들지 않는다. `TODO/PADDLE_PLAN`에서 AI plan/quota/paywall을 만들 때 `AiUsageDaily` 또는 `UsageMeter` 중 하나를 source of truth로 반드시 다시 확정한다.

## 2. 계약 개요

- 계약 상태: implemented
- 소비자: Backend internal, 11 Admin future
- 호환성: 기존 `AiProviderCallLog` 읽기 기반. 기존 AI 기능 변경 없음
- 인증: 09 내부 use case 기준 없음. Admin API 노출은 11에서 별도 인증/권한 계약 작성

## 3. Internal API

- API 이름: 사용자별 AI 사용량 요약 contract
- API 식별자: SummarizeAiUsage
- 호출 방식: application use case
- Request 이름: `SummarizeAiUsageCommand`
- Response 이름: `AiUsageSummaryResponse`

### Request

```ts
interface SummarizeAiUsageCommand {
  readonly userId?: string;
  readonly from?: Date;
  readonly to?: Date;
  readonly groupBy?: "USER" | "DAY" | "OPERATION";
}
```

`from`/`to`는 `AiProviderCallLog.startedAt` UTC instant 기준이다.

Grouping:

- `groupBy=USER`: `(userId)` 단위
- `groupBy=DAY`: `(userId, dateKey)` 단위
- `groupBy=OPERATION`: `(userId, operation)` 단위

### Response

```json
{
  "items": [
    {
      "userId": "user-id",
      "dateKey": null,
      "operation": null,
      "userTimeZone": null,
      "requestCount": 12,
      "succeededCount": 10,
      "failedCount": 2,
      "pendingCount": 0,
      "canceledCount": 0,
      "totalTokenCount": 5400,
      "estimatedCostAmount": "0.132000",
      "costCurrency": "USD"
    }
  ]
}
```

Response field:

| 필드 | 타입 | 설명 |
|---|---|---|
| `userId` | string | 사용자 ID. 11 Admin에서는 권한/마스킹 정책을 별도 적용 |
| `dateKey` | `YYYY-MM-DD`/null | `groupBy=DAY`일 때 사용자 timezone 기준 날짜 |
| `operation` | string/null | `groupBy=OPERATION`일 때 `AiProviderOperation` |
| `userTimeZone` | string/null | `dateKey` 계산에 사용한 현재 `User.timeZone` |
| `requestCount` | number | provider call log row 수 |
| `succeededCount` | number | `SUCCEEDED` count |
| `failedCount` | number | `FAILED` count |
| `pendingCount` | number | `PENDING` count |
| `canceledCount` | number | `CANCELED` count |
| `totalTokenCount` | number | token 합계. null은 0으로 계산 |
| `estimatedCostAmount` | decimal string | 추정 비용 합계 |
| `costCurrency` | string | 09 1차는 `USD` 기준 |

`groupBy=USER`이면 `dateKey=null`, `operation=null`, `userTimeZone=null`이다. `groupBy=DAY`이면 `dateKey`와 `userTimeZone`이 있고 `operation=null`이다. `groupBy=OPERATION`이면 `operation`이 있고 `dateKey=null`, `userTimeZone=null`이다.

## 4. Business Logic

1. `AiProviderCallLog.startedAt`을 UTC 기간 조건으로 조회한다.
2. 모든 groupBy는 사용자별 집계를 기본으로 한다.
3. `groupBy=DAY`는 현재 `User.timeZone`으로 `startedAt`을 `YYYY-MM-DD`로 변환해 계산한다.
4. `User` 조회는 `id`와 `timeZone` 확인에만 사용하고 email, phone, displayName 같은 식별 정보는 조회/로그에 포함하지 않는다.
5. 기존 `AiProviderCallLog`에는 event 당시 timezone이 없으므로 09 AI usage day는 billing source of truth가 아니라 Admin 참고용 read model이다.
6. status별 count는 `SUCCEEDED`, `FAILED`, `PENDING`, `CANCELED`를 분리해 계산한다.
7. token과 estimated cost는 null을 0으로 보고 합산한다.
8. prompt/raw response/provider raw response는 조회하지 않는다.
9. Admin API 노출은 11에서 권한과 masking 기준을 추가한 뒤 연결한다.

## 5. 연결된 DB 스키마

- 조회: AiProviderCallLog, User
- 생성: 없음
- 수정: 없음
- transaction: 없음

`User`는 `groupBy=DAY`의 현재 timezone 계산용으로만 읽는다.

## 6. Transaction

- 필요 여부: 없음
- 이유: read-only aggregation
- rollback 범위: 없음
- 외부 Provider: 없음
- audit log 포함: 09 내부 없음. 11 Admin API로 노출할 때 Admin 조회 audit 필요 여부를 확정한다.

## 7. Observability

- log event key: 기본 성공 로그 없음
- 실패: `analytics.aiUsage.summaryFailed`
- request id: Admin API 노출 시 사용
- redaction: prompt/raw response/provider raw response 없음. user email/phone logging 금지

## 8. Paddle Billing 고려사항

`TODO/PADDLE_PLAN`에서 AI quota 또는 plan 제한이 생기면 아래를 확정한다.

- `AiUsageDaily`를 새로 만들지
- `UsageMeter`로 billing usage를 통합할지
- provider call log와 billing entitlement 계산의 source of truth를 어떻게 나눌지
- paywall/upgrade event와 AI usage limit event를 어떤 이름으로 기록할지

09 문서의 reserved 결정은 12 최종 계약에 의해 수정될 수 있다.

## 9. 구현 결과

- 완료일: 2026-07-30
- 구현 파일: `SummarizeAiUsageUseCase`, `ProductAnalyticsRepository.listAiUsageProviderCallLogsForSummary`, `PrismaProductAnalyticsRepository`
- `groupBy=DAY`는 현재 `User.timeZone`으로 `startedAt`을 `YYYY-MM-DD` dateKey로 변환한다.
- repository select는 `AiProviderCallLog` 집계 field와 `User.id/timeZone`만 포함하고 prompt/raw response/provider raw response, email/displayName은 조회하지 않는다.
- 검증: BE `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run test -- analytics meeting-note`, `pnpm.cmd run build` 통과
