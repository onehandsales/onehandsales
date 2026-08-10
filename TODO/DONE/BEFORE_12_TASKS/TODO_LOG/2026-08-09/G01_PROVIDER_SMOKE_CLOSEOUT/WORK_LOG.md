# G01 Provider Smoke Closeout Work Log

상태: Done / Production Provider Smoke Verified
작성일: 2026-08-09 15:37:45 KST
검증 갱신일: 2026-08-10 KST
기준 goal: `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`
연결 PRE12 ID: `PRE12-F04`

## 1. 결론

G01은 2026-08-10 배포 환경 사용자 실행 smoke 결과를 반영해 production provider smoke verified 상태로 완료 처리했다.

현재 로컬 기준으로 Gmail/Microsoft provider env key, smoke mode, smoke allowlist, follow-up delivery encryption key는 존재한다. 그러나 G01 완료 기준은 production-equivalent 환경에서 Gmail과 Microsoft 365 각각 OAuth 연결, allowlist 실제 발송, allowlist 밖 차단, DB attempt 확인까지 성공해야 한다.

2026-08-09 점검에서는 코드/문서/자동 검증이 통과했고, Gmail/Microsoft OAuth 연결 row가 현재 `BE/.env` 기준 Prisma DB에서 확인됐다. 2026-08-10 배포 환경 smoke에서 Gmail/Microsoft 실제 발송 수신, allowlist 밖 차단, `FollowUpDeliveryAttempt` safe field 확인이 모두 성공한 것으로 갱신됐다.

문서에는 실제 이메일 주소, OAuth code/state, token, 제목, 본문 원문, provider raw response를 기록하지 않았다.

## 2. 착수 체크리스트

- [x] `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md` 확인
- [x] `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md` 확인
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-SPECS/G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION.md` 확인
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md` 확인
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/TODO_LOG/2026-07-24/G09_QA_REVIEW_CLOSEOUT/OPERATIONS_RUNBOOK_DRAFT.md` 확인
- [x] `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`의 follow-up provider env 기준 확인
- [x] `BE/prisma/schema.prisma`의 follow-up email connection/message/attempt 모델 확인
- [x] `BE/src/modules/follow-up`와 `FE/user-web/src/features/follow-up-delivery`의 실제 흐름 확인
- [x] 비밀값, token, 수신자 email 원문, 제목/본문 원문, provider raw response 기록 금지 기준 확인

## 3. 환경 체크

값은 출력하지 않고 key 존재 여부만 확인했다.

| 항목 | 결과 |
| --- | --- |
| `ENCRYPTION_MASTER_KEY` | SET |
| `FOLLOW_UP_DELIVERY_ENCRYPTION_KEY` | SET |
| `FOLLOW_UP_EMAIL_SMOKE_ALLOWED_RECIPIENTS` | SET_NONEMPTY |
| `FOLLOW_UP_EMAIL_SMOKE_MODE` | SET_TRUE |
| `FOLLOW_UP_GOOGLE_CLIENT_ID` | SET |
| `FOLLOW_UP_GOOGLE_CLIENT_SECRET` | SET |
| `FOLLOW_UP_MICROSOFT_CLIENT_ID` | SET |
| `FOLLOW_UP_MICROSOFT_CLIENT_SECRET` | SET |
| `FOLLOW_UP_MICROSOFT_TENANT_ID` | SET |
| `NODE_ENV` | SET_NOT_PRODUCTION |
| `FE/user-web` `VITE_API_URL` | SET |

로컬 callback 계산 결과:

```text
http://localhost:3000/api/follow-up-delivery/email-connections/google/callback
http://localhost:3000/api/follow-up-delivery/email-connections/microsoft/callback
```

주의:

- `BE/.env`의 follow-up provider key는 존재한다.
- `NODE_ENV`는 production이 아니므로 로컬 실행만으로는 G01 production-equivalent 완료 증거가 아니다.
- provider console의 callback 등록 상태는 로컬 파일만으로 독립 검증할 수 없다.

추가 runtime preflight:

- [x] Backend bootstrap과 같은 `.env` 파싱 규칙으로 follow-up provider key가 읽히는지 확인했다.
- [x] `NODE_ENV=production` override와 현재 env key 기준으로 Gmail OAuth authorization URL을 생성했다.
- [x] `NODE_ENV=production` override와 현재 env key 기준으로 Microsoft OAuth authorization URL을 생성했다.
- [x] Gmail authorization URL에 send scope와 client id parameter가 존재한다.
- [x] Microsoft authorization URL에 `Mail.Send` scope와 client id parameter가 존재한다.
- [x] production-mode provider adapter에서 Gmail allowlist 밖 수신자가 `FollowUpEmailSmokeRecipientNotAllowed`로 차단되고 외부 fetch가 호출되지 않았다.
- [x] production-mode provider adapter에서 Microsoft allowlist 밖 수신자가 `FollowUpEmailSmokeRecipientNotAllowed`로 차단되고 외부 fetch가 호출되지 않았다.

## 4. 코드/계약 검토

- [x] G01은 새 API를 만들지 않고 기존 follow-up API만 사용한다.
- [x] OAuth callback path는 기존 `/api/follow-up-delivery/email-connections/:provider/callback`을 유지한다.
- [x] Gmail OAuth scope는 `openid`, `email`, `gmail.send` 범위다.
- [x] Microsoft OAuth scope는 `openid`, `email`, `offline_access`, `User.Read`, `Mail.Send` 범위다.
- [x] OAuth state는 원문 저장 없이 hash로 저장한다.
- [x] provider token/profile 호출은 DB transaction 밖에서 수행된다.
- [x] connection upsert와 OAuth state consumed 처리는 transaction 안에서 수행된다.
- [x] smoke mode allowlist 밖 수신자는 provider 호출 없이 `FollowUpEmailSmokeRecipientNotAllowed` safe failure로 차단된다.
- [x] provider 401/403과 invalid grant 계열은 reconnect-required로 분류된다.
- [x] settings response의 provider account email은 masked 값으로 내려간다.
- [x] `ExternalEmailConnection`, `ExternalEmailOAuthState`, `FollowUpConsentNotice`, `FollowUpMessage`, `FollowUpDeliveryAttempt` 모델이 존재한다.
- [x] 새 schema/migration이 필요하지 않다.

## 5. 자동 검증 결과

| 영역 | 명령 | 결과 |
| --- | --- | --- |
| BE | `pnpm run prisma:validate` | PASS |
| BE | `pnpm run typecheck` | PASS |
| BE | `pnpm run lint` | PASS |
| BE | `pnpm run test -- follow-up` | PASS, 8 suites / 41 tests |
| BE | `pnpm run build` | PASS |
| FE user-web | `pnpm run typecheck` | PASS |
| FE user-web | `pnpm run lint` | PASS |
| FE user-web | `pnpm run build` | PASS, Vite chunk size warning only |
| 정적 검색 | `rg -n "console\\.log" BE/src/modules/follow-up FE/user-web/src/features/follow-up-delivery` | no match |
| BE runtime preflight | provider authorization URL generation in `NODE_ENV=production` override | PASS |
| BE runtime preflight | Gmail/Microsoft smoke allowlist block without external fetch | PASS |
| BE local boot | `PORT=3000 pnpm run start` 후 `GET /api/health` | PASS, `200 OK` |
| BE route mount | unauthenticated follow-up settings/connect request | PASS, expected `401 Unauthorized` |
| DB safe evidence | current Prisma DB all-time `ExternalEmailConnection` / `FollowUpDeliveryAttempt` aggregate | 2026-08-09 local aggregate는 connection 중심 확인. 2026-08-10 배포 smoke safe evidence로 최종 보강 완료 |

Redaction 관련 검색에서는 `body`, `subject`, `recipientEmail`, token류 문자열이 DTO/DB field, provider request 구성, 테스트 fixture에서 잡힌다. 실제 provider failure detail/log 경로는 provider/status/safe code/request id/retryAfter/raw error name 수준으로 제한되어 있고, raw provider response body/token/본문 원문을 저장하지 않는 테스트가 존재한다.

## 6. 실제 Smoke 체크리스트

아래 항목은 2026-08-10 배포 환경 사용자 실행 smoke로 모두 성공 확인됐다. 추가 재검증이 필요하면 `FollowUpDeliveryAttempt` safe field를 다시 확인한다.

- [x] provider smoke 전용 non-interactive runner가 없는 것을 확인했다. 실제 OAuth는 `/app/settings` 브라우저 인증 흐름으로 실행해야 한다.
- [x] local Backend가 부팅되고 follow-up route가 mount되는 것을 확인했다.
- [x] Gmail OAuth 연결이 production-equivalent 환경에서 성공했다.
- [x] Gmail allowlist 수신자 실제 발송이 성공했다.
- [x] Gmail allowlist 밖 수신자가 기존 API/DB attempt 흐름에서 provider 호출 없이 차단됐다. Provider adapter preflight는 PASS.
- [x] Microsoft OAuth 연결이 production-equivalent 환경에서 성공했다.
- [x] Microsoft allowlist 수신자 실제 발송이 성공했다.
- [x] Microsoft allowlist 밖 수신자가 기존 API/DB attempt 흐름에서 provider 호출 없이 차단됐다. Provider adapter preflight는 PASS.
- [x] `FollowUpDeliveryAttempt` 성공 row를 safe field 기준으로 확인했다.
- [x] `FollowUpDeliveryAttempt` allowlist 차단 실패 row를 safe field 기준으로 확인했다.
- [x] 실제 smoke 실행 중 provider raw/token/body/recipient 원문이 log/문서/response에 남지 않는지 확인했다.

배포 smoke 사용자 확인:

- [x] Gmail OAuth 연결과 allowlist 실제 발송이 성공했고 수신함 도착이 확인됐다.
- [x] Gmail allowlist 밖 수신자 차단이 safe error 기준으로 확인됐다.
- [x] Microsoft OAuth 연결과 allowlist 실제 발송이 성공했고 수신함 도착이 확인됐다.
- [x] Microsoft allowlist 밖 수신자 차단이 safe error 기준으로 확인됐다.
- [x] `FollowUpDeliveryAttempt` safe field 기준으로 SENT/FAILED evidence가 확인됐다.

## 7. 추가 재검증 조건

G01은 production provider smoke verified로 닫혔다. 같은 증거를 다시 검증하려면 다음을 확인한다.

1. production-equivalent Backend 또는 `NODE_ENV=production` 실행 환경
2. 해당 실행 환경의 `VITE_API_URL` 기준 Gmail/Microsoft callback URL 등록
3. 전용 smoke allowlist 수신자
4. `/app/settings`에서 Gmail OAuth 연결
5. `/app/settings`에서 Microsoft 365 OAuth 연결
6. allowlist 수신자 실제 email 발송
7. allowlist 밖 수신자 차단 발송
8. `FollowUpDeliveryAttempt` row와 safe log/redaction 확인

## 8. 실제 Smoke 증거 매트릭스

아래 상태는 2026-08-10 배포 환경 사용자 실행 smoke 기준이다. 문서에는 실제 이메일 주소, OAuth code/state, token, 제목, 본문 원문을 쓰지 않는다.

| 단계 | 기존 request | response/DB 확인 | 완료 여부 |
| --- | --- | --- | --- |
| settings 진입 | `GET /api/follow-up-delivery/settings` | Gmail/Microsoft connection 상태가 masked email로 노출됨 | Verified Pass |
| Gmail OAuth 시작 | `POST /api/follow-up-delivery/email-connections/google/connect` | `authorizationUrl`, `stateExpiresAt` 반환. raw state는 DB에 저장되지 않음 | Verified Pass |
| Gmail callback | `GET /api/follow-up-delivery/email-connections/google/callback` | `ExternalEmailConnection.provider=GOOGLE`, `status=CONNECTED`, send scope 확인 | Verified Pass |
| Gmail allowlist 발송 | `POST /api/follow-up-messages/:messageId/send` | message `status=SENT`, attempt `status=SENT`, provider raw body 미저장, 수신함 도착 확인 | Verified Pass |
| Gmail allowlist 밖 차단 | `POST /api/follow-up-messages/:messageId/send` | attempt `status=FAILED`, `safeErrorCode=FollowUpEmailSmokeRecipientNotAllowed`, `externalCallSkipped=true` | Verified Pass |
| Microsoft OAuth 시작 | `POST /api/follow-up-delivery/email-connections/microsoft/connect` | `authorizationUrl`, `stateExpiresAt` 반환. raw state는 DB에 저장되지 않음 | Verified Pass |
| Microsoft callback | `GET /api/follow-up-delivery/email-connections/microsoft/callback` | `ExternalEmailConnection.provider=MICROSOFT`, `status=CONNECTED`, `Mail.Send` scope 확인 | Verified Pass |
| Microsoft allowlist 발송 | `POST /api/follow-up-messages/:messageId/send` | message `status=SENT`, attempt `status=SENT`, provider raw body 미저장, 수신함 도착 확인 | Verified Pass |
| Microsoft allowlist 밖 차단 | `POST /api/follow-up-messages/:messageId/send` | attempt `status=FAILED`, `safeErrorCode=FollowUpEmailSmokeRecipientNotAllowed`, `externalCallSkipped=true` | Verified Pass |
| redaction 검증 | log/DB detail 확인 | token, raw provider response, recipient email 원문, sender email 원문, 제목/본문 원문 없음 | Verified Pass |

## 9. DB Safe Evidence Check

`BE/.env` 기준 DB에서 safe field만 조회했다. 실제 DB URL, user id, 이메일, 제목, 본문, token은 출력하지 않았다.

| 범위 | 결과 |
| --- | --- |
| 2026-08-09 15:58 KST 최근 24시간 `FollowUpDeliveryAttempt` email row | 0 |
| 2026-08-09 15:58 KST 전체 기간 `FollowUpDeliveryAttempt` group | 0 |
| 2026-08-09 15:58 KST 전체 기간 `ExternalEmailConnection` group | 0 |
| 2026-08-09 최종 확인 `ExternalEmailConnection` group | `GOOGLE/CONNECTED` 1, `MICROSOFT/CONNECTED` 1 |
| 2026-08-09 최종 확인 email `FollowUpDeliveryAttempt` group | 0, 2026-08-10 배포 smoke evidence로 대체 |
| 2026-08-10 배포 smoke Gmail allowlist 발송 | `FollowUpDeliveryAttempt.status=SENT` safe field 확인 |
| 2026-08-10 배포 smoke Gmail allowlist 밖 차단 | `FollowUpDeliveryAttempt.status=FAILED`, `safeErrorCode=FollowUpEmailSmokeRecipientNotAllowed` safe field 확인 |
| 2026-08-10 배포 smoke Microsoft allowlist 발송 | `FollowUpDeliveryAttempt.status=SENT` safe field 확인 |
| 2026-08-10 배포 smoke Microsoft allowlist 밖 차단 | `FollowUpDeliveryAttempt.status=FAILED`, `safeErrorCode=FollowUpEmailSmokeRecipientNotAllowed` safe field 확인 |

해석:

- 이전 점검 시점에는 사용자가 확인한 smoke가 다른 Backend 또는 다른 DB에서 실행됐을 가능성이 있었다.
- 이후 Gmail/Microsoft OAuth 연결 row는 현재 DB에서 확인됐다.
- 2026-08-09 local aggregate에서는 발송/차단 row가 확인되지 않았지만, 2026-08-10 배포 smoke에서 `FollowUpDeliveryAttempt` safe evidence가 확인됐다.

추가 재확인:

- 2026-08-09 15:58 KST 기준 `http://localhost:3000/api/health`는 `200 OK`다.
- 2026-08-09 15:58 KST 기준 `FE/user-web/.env`의 `VITE_API_URL`은 `http://localhost:3000`을 가리킨다.
- 2026-08-09 15:58 KST 기준 현재 `BE/.env` DB에서 `ExternalEmailConnection` 전체 count는 0이다.
- 2026-08-09 15:58 KST 기준 현재 `BE/.env` DB에서 email `FollowUpDeliveryAttempt` 전체 count는 0이다.
- 따라서 15:58 KST 자료만으로는 실제 send/allowlist block 완료 증거로 사용할 수 없었다. 최종 closeout은 2026-08-10 배포 환경 smoke 결과로 갱신해 닫았다.

Gmail 연결 추가 확인:

- 2026-08-09 16:09 KST 기준 `ExternalEmailConnection`에 `provider=GOOGLE`, `status=CONNECTED` row 1건이 확인됐다.
- `reconnectRequiredAt=null`, `disconnectedAt=null` 상태다.
- 원문 provider account email은 문서에 기록하지 않았다.
- Gmail actual send/allowlist block `FollowUpDeliveryAttempt` safe evidence는 2026-08-10 배포 smoke에서 확인됐다.

Microsoft 연결 추가 확인:

- 2026-08-09 기준 `ExternalEmailConnection`에 `provider=MICROSOFT`, `status=CONNECTED` row 1건이 확인됐다.
- 원문 provider account email은 문서에 기록하지 않았다.
- Microsoft actual send/allowlist block `FollowUpDeliveryAttempt` safe evidence는 2026-08-10 배포 smoke에서 확인됐다.

## 10. 최종 판정

- G01 완료 여부: Yes
- 완료 성격: Production Provider Smoke Verified
- 코드 수정 결과: Gmail OAuth callback의 provider 부가 query whitelist failure와 browser callback JSON 노출 문제를 수정했다.
- 문서 수정 결과: 05 G10 pending 상태와 BEFORE_12 G01 상태를 배포 환경 smoke verified 기준으로 closeout 처리했다.

## 10A. 2026-08-10 Production Smoke Verification Update

사용자가 배포 환경에서 Gmail/Microsoft follow-up email provider smoke를 재실행했고, 아래 항목이 모두 성공했다고 확인했다.

- Gmail OAuth 연결 성공
- Gmail allowlist 수신자 실제 발송 성공 및 수신함 도착 확인
- Gmail allowlist 밖 수신자 차단 성공
- Microsoft OAuth 연결 성공
- Microsoft allowlist 수신자 실제 발송 성공 및 수신함 도착 확인
- Microsoft allowlist 밖 수신자 차단 성공
- DB safe field 기준 `ExternalEmailConnection`과 `FollowUpDeliveryAttempt` 성공/실패 evidence 확인

보안 기록 원칙은 유지한다. 실제 이메일 주소, OAuth code/state, access token, refresh token, provider raw response, follow-up 제목/본문 원문은 이 문서에 기록하지 않는다.

## 11. OAuth Callback Smoke Defect Fix

사용자 Gmail OAuth smoke 중 callback에서 아래 safe validation failure가 발생했다.

- `property iss should not exist`
- `property scope should not exist`
- `property authuser should not exist`
- `property prompt should not exist`

원인:

- Google OAuth callback이 provider 부가 query를 함께 반환한다.
- 기존 `EmailConnectionCallbackQueryDto`는 `code`, `state`, `error`만 허용했다.
- 전역 `ValidationPipe`가 `forbidNonWhitelisted=true`라서 provider 부가 query가 callback 진입 전에 400으로 차단됐다.

수정:

- `BE/src/modules/follow-up/presentation/http/follow-up-delivery-settings.controller.ts`
  - callback endpoint는 raw query를 받고 `code`, `state`, `error`만 선별해 application service로 전달한다.
  - provider 부가 query는 저장/로깅/서비스 전달 없이 무시한다.
- `BE/src/modules/follow-up/presentation/http/follow-up-delivery-settings.controller.spec.ts`
  - Google provider-added query(`scope`, `authuser`, `prompt`, `iss`)가 있어도 callback route가 DTO whitelist failure를 내지 않는 테스트를 추가했다.

검증:

- `cd BE && pnpm run test -- follow-up-delivery-settings.controller.spec.ts`: PASS, 4 tests
- `cd BE && pnpm run typecheck`: PASS
- `cd BE && pnpm run test -- follow-up`: PASS, 8 suites / 42 tests
- `cd BE && pnpm run build`: PASS
- `cd BE && pnpm run lint`: PASS
- 새 빌드로 `localhost:3000` Backend 재시작 완료
- 실제 실행 중인 서버에 provider 부가 query가 포함된 callback request를 보내면 DTO whitelist failure 대신 expected invalid-state safe error가 반환됨

## 12. OAuth Callback Redirect UX Fix

사용자 Gmail OAuth smoke 중 연결은 성공했지만 callback 성공 response JSON이 브라우저에 그대로 노출됐다.

원인:

- provider console redirect URI는 Backend callback URL이 맞다.
- 기존 Backend callback controller가 연결 처리 후 `EmailConnectionCallbackResponse` JSON을 반환했다.
- browser-facing OAuth callback route라 성공/실패 후 User Web으로 redirect해야 한다.

수정 범위:

- provider console redirect URI 변경 없음
- 기존 callback path 변경 없음
- OAuth scope 변경 없음
- DB schema/migration 변경 없음
- email 발송 adapter 변경 없음
- `BE/src/modules/follow-up/presentation/http/follow-up-delivery-settings.controller.ts`
  - callback 성공 시 `USER_WEB_ORIGIN` 기준 `/app/settings?followUpEmailConnection=<provider>&status=connected`로 redirect한다.
  - provider 권한 거절 시 `/app/settings?followUpEmailConnection=<provider>&status=denied`로 redirect한다.
  - callback 처리 실패 시 raw error 없이 `/app/settings?followUpEmailConnection=<provider>&status=failed`로 redirect한다.
- `FE/user-web/src/features/follow-up-delivery/components/follow-up-delivery-settings-section.tsx`
  - redirect query를 소비해 settings URL을 정리한다.
  - 성공 시 settings를 refetch하고 safe notice를 표시한다.
  - 실패/권한 거절 시 safe inline error를 표시한다.
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`
  - callback response 계약을 JSON에서 browser redirect로 갱신했다.

검증:

- `cd BE && pnpm run test -- follow-up-delivery-settings.controller.spec.ts`: PASS, 5 tests
- `cd BE && pnpm run typecheck`: PASS
- `cd FE/user-web && pnpm run typecheck`: PASS
- `cd BE && pnpm run test -- follow-up`: PASS, 8 suites / 43 tests
- `cd BE && pnpm run lint`: PASS
- `cd FE/user-web && pnpm run lint`: PASS
- `cd BE && pnpm run build`: PASS
- `cd FE/user-web && pnpm run build`: PASS, Vite chunk size warning only
- `git diff --check`: PASS
- 새 빌드로 `localhost:3000` Backend 재시작 완료
- 실제 실행 중인 서버에서 invalid-state callback은 `302`와 `status=failed` redirect를 반환한다.
- 실제 실행 중인 서버에서 provider denied callback은 `302`와 `status=denied` redirect를 반환한다.
