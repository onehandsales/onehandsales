# G01 Provider Smoke Closeout

상태: Draft / Skeleton
연결 PRE12 ID: `PRE12-F04`

## 1. 목표

05 G10 Gmail/Microsoft provider smoke pending 상태를 12 착수 전에 닫을 수 있도록 운영 확인 결과를 문서화한다.

## 2. 포함 범위

- provider env key 존재 여부 확인
- provider console callback URL 등록 여부 확인
- Gmail OAuth 연결 smoke 결과 기록
- Gmail allowlist 수신자 실제 발송 smoke 결과 기록
- Microsoft OAuth 연결 smoke 결과 기록
- Microsoft allowlist 수신자 실제 발송 smoke 결과 기록
- allowlist 밖 수신자 차단 smoke 결과 기록
- 실행하지 못한 항목의 미실행 사유와 다음 필요 조건 기록

## 3. 제외 범위

- 새 email API 구현
- 새 provider 구현
- SMS vendor 구현
- sequence/campaign/bulk/unsubscribe 구현
- scheduled send 구현
- billing, quota, paywall, cost UI 구현
- 비밀값, access token, refresh token, 수신자 개인정보 원문 기록

## 4. 확인 대상

- `BE/.env`
- `BE/src/modules/follow-up`
- `FE/user-web/src/features/follow-up-delivery`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`

## 5. 완료 기준

- [ ] 현재 env key 존재 여부가 비밀값 없이 기록됐다.
- [ ] provider console callback URL 등록 여부가 기록됐다.
- [ ] Gmail smoke 결과 또는 미실행 사유가 기록됐다.
- [ ] Microsoft smoke 결과 또는 미실행 사유가 기록됐다.
- [ ] allowlist 밖 차단 결과 또는 미실행 사유가 기록됐다.
- [ ] 05 문서의 오래된 env 미준비 설명이 현재 상태와 충돌하지 않게 정리됐다.

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G05_PROVIDER_SMOKE_CLOSEOUT.md`
