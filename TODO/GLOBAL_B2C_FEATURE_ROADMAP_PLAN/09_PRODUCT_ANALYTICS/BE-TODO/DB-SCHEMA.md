# DB Schema TODO

상태: Draft

## 모델 후보

- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `AiUsageDaily`
- `ExperimentAssignment`
- `ChurnSurveyResponse`

## 결정 필요

- 자체 DB 저장 여부
- 외부 analytics provider 사용 여부
- userId hashing/anonymization
- payload JSON 허용 범위
- retention 기간
- experiment variant 저장 여부
- churn survey 응답 보관/익명화 여부

## migration 주의

- 이벤트 table은 빠르게 커질 수 있다.
- 민감정보가 저장되지 않도록 allowlist가 필요하다.
