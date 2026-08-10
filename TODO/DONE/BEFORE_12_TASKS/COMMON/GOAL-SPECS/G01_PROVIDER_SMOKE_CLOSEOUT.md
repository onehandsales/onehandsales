# G01 Provider Smoke Closeout

상태: Done / Production Provider Smoke Verified
연결 PRE12 ID: `PRE12-F04`
성격: 운영 provider smoke closeout
최근 실행 로그: `TODO/BEFORE_12_TASKS/TODO_LOG/2026-08-09/G01_PROVIDER_SMOKE_CLOSEOUT/WORK_LOG.md`

완료 판정 메모: 2026-08-10 배포 환경 사용자 실행 기준으로 Gmail/Microsoft OAuth 연결, allowlist 실제 발송, allowlist 밖 차단, DB safe attempt 확인이 모두 성공해 production provider smoke verified 상태로 닫았다. 문서에는 비밀값, token, 수신자 email 원문, 제목/본문 원문, provider raw response를 기록하지 않는다.

## 0. 착수 체크리스트

- [x] `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`를 확인한다.
- [x] `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`를 확인한다.
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-SPECS/G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION.md`를 확인한다.
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`를 확인한다.
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/TODO_LOG/2026-07-24/G09_QA_REVIEW_CLOSEOUT/OPERATIONS_RUNBOOK_DRAFT.md`를 확인한다.
- [x] `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`의 follow-up provider env 기준을 확인한다.
- [x] `BE/prisma/schema.prisma`의 follow-up email connection/message/attempt 모델을 확인한다.
- [x] `BE/src/modules/follow-up`와 `FE/user-web/src/features/follow-up-delivery`의 실제 흐름을 확인한다.
- [x] 비밀값, token, 수신자 email 원문, 제목/본문 원문, provider raw response를 기록하지 않는 기준을 확인한다.

## 1. 목표

05 G10 Gmail/Microsoft provider smoke verified closeout 상태를 12 착수 전에 문서화한다.

G01은 문서상 pending 사유만 갱신하는 goal이 아니다. Gmail과 Microsoft 365 모두 production-equivalent 환경에서 실제 OAuth 연결과 allowlist 수신자 실제 발송이 성공해야 완료다.

## 2. 포함 범위

- provider env key 존재 여부 확인
- provider console callback URL 등록 여부 확인
- production-equivalent Backend 또는 `NODE_ENV=production` 환경 확인
- `FOLLOW_UP_EMAIL_SMOKE_MODE=true` 확인
- `FOLLOW_UP_EMAIL_SMOKE_ALLOWED_RECIPIENTS` 존재 확인
- Gmail OAuth 연결 smoke 결과 기록
- Gmail allowlist 수신자 실제 발송 smoke 결과 기록
- Gmail allowlist 밖 수신자 차단 smoke 결과 기록
- Microsoft OAuth 연결 smoke 결과 기록
- Microsoft allowlist 수신자 실제 발송 smoke 결과 기록
- Microsoft allowlist 밖 수신자 차단 smoke 결과 기록
- `FollowUpDeliveryAttempt` DB 결과 확인
- safe log/redaction 확인
- 05 G10 pending 문서와 BEFORE_12 결과 문서 갱신

## 3. 제외 범위

- 새 email API 구현
- 기존 follow-up API request/response 변경
- 새 provider 구현
- SMS vendor 구현
- sequence/campaign/bulk/unsubscribe 구현
- scheduled send 구현
- billing, quota, paywall, cost UI 구현
- 비밀값, access token, refresh token, 수신자 개인정보 원문 기록
- smoke를 쉽게 만들기 위한 DB schema/migration 추가

## 4. 확인 대상

Backend:

- `BE/.env`
- `BE/src/modules/follow-up`
- `BE/prisma/schema.prisma`
- `BE/src/modules/follow-up/infrastructure/delivery/configurable-follow-up-email-delivery.provider.ts`
- `BE/src/modules/follow-up/application/services/follow-up-message-application.service.ts`
- `BE/src/modules/follow-up/application/services/follow-up-settings-application.service.ts`

Frontend:

- `FE/user-web/.env`
- `FE/user-web/src/features/follow-up-delivery`
- `FE/user-web/src/pages/settings/index.tsx`

문서:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`

## 5. Request/Response 체크

G01은 새 API 계약을 만들지 않는다. 기존 API의 response를 smoke 확인에 사용한다.

- `GET /api/follow-up-delivery/settings`
- `POST /api/follow-up-delivery/email-connections/:provider/connect`
- `GET /api/follow-up-delivery/email-connections/:provider/callback`
- `POST /api/follow-up-messages/drafts`
- `POST /api/follow-up-messages/:messageId/send`
- `GET /api/follow-up-messages/:messageId`

체크 기준:

- request/response DTO를 변경하지 않는다.
- OAuth callback path를 변경하지 않는다.
- safe error code만 사용자/문서에 남긴다.
- provider raw response, token, subject, body, recipient email 원문을 response/log/문서에 남기지 않는다.

## 6. Business Logic 체크

- Gmail OAuth scope는 send-only 범위다.
- Microsoft OAuth scope는 send-only 범위다.
- callback은 `ExternalEmailOAuthState`의 state hash로 user ownership을 복원한다.
- token/profile provider 호출은 DB transaction 밖에서 수행한다.
- send/retry는 message status와 delivery attempt를 짧은 transaction으로 저장한다.
- `FOLLOW_UP_EMAIL_SMOKE_MODE=true`면 allowlist 밖 수신자에게 provider 호출을 하지 않는다.
- allowlist 밖 수신자는 `FollowUpEmailSmokeRecipientNotAllowed` safe error로 실패 처리한다.
- provider 401/403, revoked token, invalid_grant는 reconnect-required로 분류한다.

## 7. DB/Prisma 체크

확인 모델:

- `ExternalEmailConnection`
- `ExternalEmailOAuthState`
- `FollowUpConsentNotice`
- `FollowUpMessage`
- `FollowUpDeliveryAttempt`

체크 기준:

- 새 schema/migration을 추가하지 않는다.
- Gmail/Microsoft connection row는 user ownership 기준으로 확인한다.
- allowlist 성공 발송은 `FollowUpDeliveryAttempt.status=SENT`를 확인한다.
- allowlist 밖 차단은 `FollowUpDeliveryAttempt.status=FAILED`, `safeErrorCode=FollowUpEmailSmokeRecipientNotAllowed`를 확인한다.
- reconnect-required 검증을 수행했다면 `ExternalEmailConnection.status=RECONNECT_REQUIRED`와 `reconnectRequiredAt`을 확인한다.
- DB 조회 결과를 문서에 남길 때 수신자 email, 제목, 본문 원문을 기록하지 않는다.

## 8. User Flow 체크

- `/app/settings`에서 Gmail 연결 버튼이 동작한다.
- `/app/settings`에서 Microsoft 365 연결 버튼이 동작한다.
- 연결 완료 후 masked connection 상태가 보인다.
- follow-up compose에서 사용자가 제목/본문을 확인한 뒤 발송한다.
- 발송 성공/실패 상태가 timeline 또는 detail에서 safe summary로 보인다.
- reconnect-required이면 설정 재연결 CTA로 이어진다.

## 9. 작업 순서

1. env key 이름 존재 여부를 확인한다. 값은 출력하지 않는다.
2. `VITE_API_URL` 기준 callback URL을 계산한다.
3. provider console에 아래 callback URL이 등록됐는지 확인한다.
   - `https://<api-host>/api/follow-up-delivery/email-connections/google/callback`
   - `https://<api-host>/api/follow-up-delivery/email-connections/microsoft/callback`
4. BE/FE 검증 명령을 실행한다.
5. Gmail OAuth 연결을 실행한다.
6. Gmail allowlist 수신자에게 실제 발송한다.
7. Gmail allowlist 밖 수신자 차단을 확인한다.
8. Microsoft OAuth 연결을 실행한다.
9. Microsoft allowlist 수신자에게 실제 발송한다.
10. Microsoft allowlist 밖 수신자 차단을 확인한다.
11. DB attempt와 log redaction을 확인한다.
12. 05 G10 pending 문서와 BEFORE_12 결과 문서를 갱신한다.

## 10. 검증 명령

Backend:

```bash
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- follow-up
```

Frontend:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

정적 확인:

```bash
rg -n "console\\.log|providerRaw|accessToken|refreshToken|recipientEmail|subject|body" BE/src/modules/follow-up FE/user-web/src/features/follow-up-delivery
git diff --check
```

## 11. 완료 기준

- [x] Gmail OAuth 연결이 production-equivalent 환경에서 성공했다.
- [x] Gmail allowlist 수신자 실제 발송이 성공했다.
- [x] Gmail allowlist 밖 수신자가 provider 호출 없이 차단됐다.
- [x] Microsoft OAuth 연결이 production-equivalent 환경에서 성공했다.
- [x] Microsoft allowlist 수신자 실제 발송이 성공했다.
- [x] Microsoft allowlist 밖 수신자가 provider 호출 없이 차단됐다.
- [x] `FollowUpDeliveryAttempt` 성공/실패 row를 safe field 기준으로 확인했다.
- [x] provider raw/token/body/recipient 원문이 structured log와 문서에 없다.
- [x] BE 검증 명령이 통과했다.
- [x] FE 검증 명령이 통과했다.
- [x] 05 G10 pending 상태와 BEFORE_12 결과 문서가 현재 상태와 맞는다.

완료 기준은 2026-08-10 배포 환경 사용자 실행 smoke 증거로 충족됐다. 재검증이 필요하면 `WORK_LOG.md`의 safe evidence 메모를 기준으로 DB row와 provider log를 다시 확인한다.

## 12. 결과 기록 위치

권장 결과 기록:

```text
TODO/BEFORE_12_TASKS/TODO_LOG/<YYYY-MM-DD>/G01_PROVIDER_SMOKE_CLOSEOUT/WORK_LOG.md
```

기록 필수 항목:

- 실행 일시
- 실행 환경
- provider별 OAuth 연결 결과
- provider별 allowlist 발송 결과
- provider별 allowlist 밖 차단 결과
- DB attempt 확인 결과
- redaction 확인 결과
- 실행 명령 결과
- blocker 여부

## 13. 권장 실행 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md 기준으로 G01을 진행해줘.
```

## 14. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G05_PROVIDER_SMOKE_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-SPECS/G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION.md`
