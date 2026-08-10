# G05 Provider Smoke Closeout

상태: Done / closed by BEFORE_12 G01
목표: 05 G10 Gmail/Microsoft provider smoke 대기 상태였던 항목을 운영 실행 조건과 결과 기록으로 닫는다.
완료 반영일: 2026-08-10

## 1. 현재 사실

- Gmail API actual send adapter는 구현 및 자동 검증이 완료됐다.
- Microsoft Graph actual send adapter는 구현 및 자동 검증이 완료됐다.
- token refresh, reconnect-required, send-only scope, smoke allowlist, allowlist 밖 safe failure, FE reconnect CTA는 05 G10 범위로 구현됐다.
- 2026-08-10 배포 환경 사용자 실행 기준으로 `TODO/BEFORE_12_TASKS` G01 provider smoke closeout은 production provider smoke verified 상태로 완료 처리됐다.
- PRE12에는 provider smoke 관련 새 API, DB migration, FE route, 코드 구현 잔여가 없다.
- 실배포 환경 재확인은 PRE12 blocker 또는 문서 잔여 작업으로 남기지 않는다.

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

## 4. 완료 결과

- [x] 05 G10 provider smoke 대기 상태였던 항목을 BEFORE_12 G01 closeout 결과로 닫았다.
- [x] 새 Gmail/Microsoft adapter 코드, 새 API, 새 DB 변경, 새 FE route를 만들지 않는다.
- [x] 비밀값, access token, refresh token, 수신자 개인정보 원문은 문서에 기록하지 않는다.
