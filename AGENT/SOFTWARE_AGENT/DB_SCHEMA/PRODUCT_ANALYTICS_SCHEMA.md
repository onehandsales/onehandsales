# Product Analytics DB Schema

현재 비활성 문서다.

2026-09-10 기준 `BE/prisma/schema.prisma`에는 Product Analytics 계열 모델과 enum이 남아 있지 않다.

- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`
- `ProductAnalyticsEventSource`
- `UserActivationStatus`
- `ProductAnalyticsTargetType`

현재 Backend에는 `/api/analytics/events` API와 analytics module이 없다. 과거 제품 분석 구현 맥락이 필요할 때만 git history 또는 archived TODO 문서를 확인한다.
