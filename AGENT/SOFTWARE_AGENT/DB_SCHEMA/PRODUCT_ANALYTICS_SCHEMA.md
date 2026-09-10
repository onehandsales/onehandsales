# Product Analytics Schema

Product Analytics는 제품 사용 분석을 위한 raw event와 snapshot만 저장한다.

## Models

- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`

## Enums

`ProductAnalyticsEventSource`:

- `CLIENT`
- `SERVER`
- `SYSTEM`

`UserActivationStatus`:

- `NOT_ACTIVATED`
- `ACTIVATED`

`ProductAnalyticsTargetType`:

- `USER`
- `DEAL`
- `EXPORT`

## ProductAnalyticsEvent

- `userId`: 이벤트를 발생시킨 사용자 ID
- `authSessionId`: 앱 세션 ID
- `authDeviceId`: 로그인 기기 ID
- `eventName`: allow-list 기반 event 이름
- `eventVersion`: payload schema version
- `source`: client/server/system 구분
- `occurredAt`: UTC instant
- `eventDate`: 사용자 timezone 기준 date-only 값
- `timeZone`: event 당시 사용자 IANA timezone
- `idempotencyKey`: server event 중복 저장 방지 key
- `targetType`, `targetId`: 안전한 대상 타입과 UUID
- `payloadJson`: allow-list를 통과한 비식별 payload

## UserActivationSnapshot

- 사용자별 activation 달성 여부와 달성 시점을 저장한다.
- 기준 event는 딜 생성과 딜 다음 행동 생성이다.
- `userId`는 unique이며 User hard delete 시 cascade 삭제한다.

## RetentionCohortSnapshot

- cohort 단위 D1/D7/D30 retention 계산 결과를 저장한다.
- userId를 저장하지 않는 aggregate로 보관한다.

## 제외 범위

- billing/paywall/churn 최종 이벤트
- 구독/과금 사용량 정본
- 실험 assignment
