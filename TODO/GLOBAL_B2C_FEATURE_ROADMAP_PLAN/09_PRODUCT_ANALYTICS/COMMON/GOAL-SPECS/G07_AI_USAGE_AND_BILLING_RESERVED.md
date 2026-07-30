# G07 AI Usage And Billing Reserved

상태: Completed
목표: 기존 `AiProviderCallLog` 기반 AI usage 요약을 만들고 billing/paywall/churn taxonomy는 reserved로만 정리한다.

## 1. 목적

G07은 사용자별 AI 사용횟수와 비용을 볼 수 있는 1차 기반을 만든다. 동시에 12 Billing에서 다룰 event를 09 runtime 범위에 섞지 않도록 정리한다.

## 2. 포함 범위

- `AiProviderCallLog` 기반 aggregation use case
- request/success/failure/pending/canceled/token/cost 계산
- reserved billing taxonomy domain 문서/상수
- 12에서 결정할 고려사항 기록

## 3. 제외 범위

- `AiUsageDaily` 신규 table
- `UsageMeter` 신규 table
- Billing plan/quota/paywall 구현
- Churn survey UI/API
- Admin full UI/API

## 4. 작업

1. `SummarizeAiUsageUseCase`를 만든다.
2. `AiProviderCallLog` aggregation repository query를 만든다.
3. user/day/operation groupBy를 모두 지원한다.
4. prompt/raw response를 조회하거나 저장하지 않는 것을 보장한다.
5. billing/paywall/churn reserved event가 runtime allowlist에 들어가지 않도록 분리한다.
6. 12에서 확정할 고려사항을 코드 TODO가 아니라 문서/constant 주석에 남긴다.

## 5. Request 계약

HTTP request는 없다.

Internal command:

```ts
{
  userId: "user-id",
  from: new Date("2026-07-01T00:00:00.000Z"),
  to: new Date("2026-07-29T23:59:59.999Z"),
  groupBy: "USER"
}
```

`from`/`to`는 `AiProviderCallLog.startedAt` UTC instant 기준이다.

Grouping:

- `groupBy=USER`: `(userId)` 단위
- `groupBy=DAY`: `(userId, dateKey)` 단위
- `groupBy=OPERATION`: `(userId, operation)` 단위

## 6. Response 계약

Internal response:

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

## 7. Business Logic

1. `AiProviderCallLog.startedAt`을 UTC 기간 조건으로 조회한다.
2. 모든 groupBy는 사용자별 집계를 기본으로 한다.
3. `groupBy=DAY`는 현재 `User.timeZone`으로 `startedAt`을 `YYYY-MM-DD`로 변환해 계산한다.
4. `User` 조회는 `id`와 `timeZone` 확인에만 사용하고 email, phone, displayName 같은 식별 정보는 조회/로그에 포함하지 않는다.
5. 기존 `AiProviderCallLog`에는 event 당시 timezone이 없으므로 09 AI usage day는 billing source of truth가 아니라 Admin 참고용 read model이다.
6. status별 count는 `SUCCEEDED`, `FAILED`, `PENDING`, `CANCELED`를 분리해 계산한다.
7. token과 estimated cost는 null을 0으로 보고 합산한다.
8. prompt/raw response/provider raw response는 조회하지 않는다.
9. reserved billing event는 09 runtime event allowlist에서 제외한다.

Reserved event:

- `paywall_viewed`
- `upgrade_clicked`
- `trial_started`
- `coupon_applied`
- `referral_invited`
- `subscription_started`
- `subscription_canceled`
- `churn_survey_submitted`

## 8. User Flow

AI usage:

1. 사용자가 AI/STT/follow-up draft 기능을 사용한다.
2. 기존 AI provider flow가 `AiProviderCallLog`를 남긴다.
3. G07 use case가 이 로그를 요약한다.
4. 11 Admin에서 사용자별 AI 사용 횟수와 비용을 볼 수 있게 된다.

Billing reserved:

1. 사용자가 paywall이나 checkout을 보는 실제 흐름은 아직 없다.
2. 09는 event 이름을 reserved list에만 둔다.
3. 12에서 실제 UI/API와 함께 최종 확정한다.

## 9. DB/Prisma 영향

G07은 DB를 변경하지 않는다.

- 조회: AiProviderCallLog, User
- 생성: 없음
- 수정: 없음
- transaction: 없음

`User`는 `groupBy=DAY`의 현재 timezone 계산용으로만 읽는다.

`AiUsageDaily`, `UsageMeter`는 만들지 않는다.

## 10. 코드 주석 기준

Backend:

- use case class: `// 역할 : AI provider 호출 로그를 사용자별 사용량 요약으로 계산합니다.`
- aggregation method: `// 기능 : provider 호출 상태와 비용을 기간 조건으로 집계합니다.`
- reserved taxonomy constant: `// 기능 : 12 Billing에서 최종 확정할 reserved 분석 이벤트 이름입니다.`

## 11. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- analytics meeting-note
```

## 12. Goal 검토 체크리스트

- [x] `AiProviderCallLog` 기반으로 request/success/failure/pending/canceled/cost를 계산한다.
- [x] `groupBy=DAY`가 현재 `User.timeZone` 기준 날짜로 계산된다.
- [x] prompt/raw response/provider raw response를 조회하지 않는다.
- [x] `AiUsageDaily`를 만들지 않았다.
- [x] billing/paywall/churn reserved event가 runtime allowlist로 발생하지 않는다.
- [x] 12에서 결정할 AI quota/UsageMeter 고려사항이 남았다.
- [x] 신규/수정 코드에 한국어 주석이 있다.

## 13. 구현 결과

- 완료일: 2026-07-30
- `SummarizeAiUsageUseCase`가 `USER`, `DAY`, `OPERATION` groupBy 기준으로 request/status/token/cost를 요약한다.
- `PrismaProductAnalyticsRepository.listAiUsageProviderCallLogsForSummary`는 `AiProviderCallLog`와 `User.id/timeZone`만 조회하고 `metadataJson`, prompt/raw response, email/displayName은 조회하지 않는다.
- billing/paywall/churn event는 기존 reserved taxonomy에만 남기고 09 runtime allowlist에는 추가하지 않았다.
- `AiUsageDaily`, `UsageMeter` table은 생성하지 않았다.
- 검증: BE `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run test -- analytics meeting-note`, `pnpm.cmd run build` 통과.
