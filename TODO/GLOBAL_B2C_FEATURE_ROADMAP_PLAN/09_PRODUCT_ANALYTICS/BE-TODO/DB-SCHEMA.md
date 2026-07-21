# DB Schema TODO

상태: Draft

## 모델 후보

- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `AiUsageDaily`
- `ExperimentAssignment`
- `ChurnSurveyResponse`

## 결정 baseline 반영 후 세부 확인

- 자체 DB `ProductAnalyticsEvent`로 시작
- 외부 analytics provider는 후속/보조 여부만 검토
- userId hashing/anonymization
- payload JSON 허용 범위
- retention 기간
- experiment variant 저장 여부
- churn survey 응답 보관/익명화 여부

## migration 주의

- 이벤트 table은 빠르게 커질 수 있다.
- 민감정보가 저장되지 않도록 allowlist가 필요하다.
