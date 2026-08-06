# G05 Provider Smoke Closeout

상태: Pending
목표: 05 G10 Gmail/Microsoft provider smoke pending 상태를 운영 실행 조건과 결과 기록으로 닫는다.

## 1. 현재 사실

- Gmail API actual send adapter는 구현 및 자동 검증이 완료됐다.
- Microsoft Graph actual send adapter는 구현 및 자동 검증이 완료됐다.
- 로컬 `BE/.env`에 운영 credential, provider console callback URL, smoke allowlist 환경이 없어 production-equivalent 실제 수신자 smoke가 미실행 상태로 남았다.

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
- B2B sender, email sync, sequence/campaign 구현
- 신규 09 analytics event
- 신규 11 Admin provider failure API

## 4. 완료 기준

- 성공하면 05 G10 provider smoke pending 상태를 closeout 문서에 반영한다.
- 운영 credential이 없으면 pending 사유와 필요한 환경값을 문서에 유지한다.
- 비밀값, access token, refresh token, 수신자 개인정보 원문은 문서에 기록하지 않는다.

