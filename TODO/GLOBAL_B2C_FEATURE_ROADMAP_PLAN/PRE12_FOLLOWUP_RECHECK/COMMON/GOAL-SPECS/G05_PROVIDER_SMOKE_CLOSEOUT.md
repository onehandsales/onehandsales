# G05 Provider Smoke Closeout

상태: Pending
목표: 05 G10 Gmail/Microsoft provider smoke pending 상태를 운영 실행 조건과 결과 기록으로 닫는다.

## 1. 현재 사실

- Gmail API actual send adapter는 구현 및 자동 검증이 완료됐다.
- Microsoft Graph actual send adapter는 구현 및 자동 검증이 완료됐다.
- token refresh, reconnect-required, send-only scope, smoke allowlist, allowlist 밖 safe failure, FE reconnect CTA는 05 G10 범위로 구현됐다.
- 로컬 `BE/.env`에 `FOLLOW_UP_GOOGLE_CLIENT_ID`, `FOLLOW_UP_GOOGLE_CLIENT_SECRET`, `FOLLOW_UP_MICROSOFT_CLIENT_ID`, `FOLLOW_UP_MICROSOFT_CLIENT_SECRET`, `FOLLOW_UP_EMAIL_SMOKE_MODE`, `FOLLOW_UP_EMAIL_SMOKE_ALLOWED_RECIPIENTS`와 provider console callback URL이 없어 production-equivalent 실제 수신자 smoke가 미실행 상태로 남았다.

## 2. 포함 범위

- 운영 credential/callback/allowlist 준비 여부 확인
- Gmail OAuth 연결 smoke
- Gmail allowlist 수신자 실제 발송 smoke
- Microsoft OAuth 연결 smoke
- Microsoft allowlist 수신자 실제 발송 smoke
- allowlist 밖 수신자 차단 smoke
- 결과를 05 문서와 이 폴더에 기록

## 3. 제외 범위

- Gmail/Microsoft adapter 코드 재구현
- SMS 실제 provider 구현
- B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송 구현
- SMTP 직접 설정, external email SaaS provider, HTML email, 첨부파일, tracking pixel 구현
- 사용자-facing cost/plan/quota/paywall/entitlement UI/API 구현
- AI weekly report 자동 생성 또는 AI suggestion 자동 mutation 구현
- 신규 09 analytics event
- 신규 11 Admin provider failure API

## 4. 완료 기준

- 성공하면 05 G10 provider smoke pending 상태를 closeout 문서에 반영한다.
- 운영 credential이 없으면 pending 사유와 필요한 환경값을 문서에 유지한다.
- 비밀값, access token, refresh token, 수신자 개인정보 원문은 문서에 기록하지 않는다.
