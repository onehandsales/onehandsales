# Planning Review

상태: Confirmed
작성일: 2026-07-29

## 1. 검토 결론

09 Product Analytics는 Global B2C 첫 판매 전에 필요한 분석 정본을 만드는 작업이다.

현재 코드에는 `AuthSession`, `AuthDevice`, `AiProviderCallLog`가 이미 있으므로 09에서 새 session/device 식별자나 새 AI provider log를 만들 필요가 없다.

## 2. 구현 방향

- 자체 DB `ProductAnalyticsEvent`를 1차 정본으로 만든다.
- Client event는 core `/app` route view만 수집한다.
- Server event는 auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product use case와 application service 성공 후 기록한다.
- Analytics failure는 product feature failure가 아니다.
- Activation/retention은 snapshot batch로 계산한다.
- AI usage는 기존 `AiProviderCallLog`를 읽는다.

## 3. 범위 분리

| 영역 | 처리 |
|---|---|
| Admin analytics UI/API | 11에서 구현 |
| Billing/paywall/churn final event | 12에서 구현 |
| External analytics provider | 후속 |
| Ad attribution/UTM | 후속 marketing analytics |
| Account deletion full UI/API | 별도 trust/admin/billing 계획과 연결 |

## 4. Blocking 질문

현재 구현 착수 blocking 질문은 없다.

다만 12 Billing 작성 시 반드시 재확인할 질문:

- 09 reserved event name을 그대로 쓸지 바꿀지
- webhook/server event와 client paywall event 경계
- churn survey 저장 table
- AI quota/billing usage meter source of truth
