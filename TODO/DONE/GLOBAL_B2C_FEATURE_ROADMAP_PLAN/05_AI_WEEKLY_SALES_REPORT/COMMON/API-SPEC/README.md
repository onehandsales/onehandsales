# API Spec

상태: Confirmed / G10 Added
최종 업데이트: 2026-08-05

## 문서

- `AI_WEEKLY_REPORT_API.md`: 05-A AI 주간 리포트 생성/조회 API
- `FOLLOW_UP_DELIVERY_API.md`: 05-B follow-up email/SMS 연결, draft, 발송, 이력 API
- `FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`: G10 Gmail/Microsoft 365 실제 email provider 발송 보강 API 계약

## 공통 규칙

- User API는 `/api/*`만 사용한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- 모든 조회/변경은 current user `userId` ownership으로 제한한다.
- 외부 provider 호출은 DB transaction 밖에서 수행한다.
- prompt, provider raw response, token, email/SMS 본문은 structured log에 남기지 않는다.
- G10 email provider smoke allowlist 차단은 외부 provider 호출 없이 safe failed attempt로 기록한다.
