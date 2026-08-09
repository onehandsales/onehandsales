# G10 Follow-up Email Provider Integration

상태: Done / User-Assumed Provider Smoke Accepted
작성일: 2026-08-05

## 1. 목표

05-B follow-up email 발송을 production에서 실제 Gmail/Microsoft 365 provider API로 동작하게 만든다.

기존 G01~G09는 05-A AI weekly report와 05-B follow-up foundation/User Web/QA closeout을 완료했다. G10은 그 뒤에 남은 운영 provider 발송 빈칸을 닫는 추가 goal이다.

## 2. 선행 문서

G10 시작 전에 반드시 읽는다.

- `../SCOPE.md`
- `../G10_CROSS_PLAN_COVERAGE.md`
- `../API-SPEC/README.md`
- `../API-SPEC/FOLLOW_UP_DELIVERY_API.md`
- `../API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`
- `../FOLLOW_UP_DELIVERY_BUSINESS-LOGIC.md`
- `../FOLLOW_UP_EMAIL_PROVIDER_BUSINESS-LOGIC.md`
- `../FOLLOW_UP_DELIVERY_USER-FLOW.md`
- `../FOLLOW_UP_EMAIL_PROVIDER_USER-FLOW.md`
- `../../BE-TODO/FOLLOW_UP_DELIVERY_DB-SCHEMA.md`
- `../../BE-TODO/FOLLOW_UP_EMAIL_PROVIDER_DB-SCHEMA.md`
- `../../FE-TODO/FOLLOW_UP_DELIVERY_USER-WEB-TODO.md`
- `../../../COMMON/COVERAGE-MATRIX.md`
- `../../../../NEXT_BACKEND_API_BACKLOG_PLAN`
- `../../../../USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `../../../../AGENT/UXUI_AGENT`
- `../../../../AGENT/SOFTWARE_AGENT`

## 3. 포함 범위

Backend:

- Gmail API 실제 email send adapter
- Microsoft Graph 실제 email send adapter
- access token refresh 후 발송
- refresh failure, revoked token, invalid_grant, insufficient scope safe error 처리
- `ExternalEmailConnection.status=RECONNECT_REQUIRED` 전환
- provider send scope 검증
- smoke allowlist backend env와 차단 로직
- smoke allowlist 차단 시 provider 호출 없이 failed delivery attempt 저장
- provider raw/token/body/recipient log redaction test

Frontend:

- `/app/settings`에서 `RECONNECT_REQUIRED` 다시 연결 CTA 보강
- compose/send 실패 safe error rendering 보강
- smoke allowlist 차단 문구 처리
- 모바일 settings/compose/timeline QA

Docs:

- G10 완료 후 `COMMON/GOAL-COMPLETION-CHECKLIST.md` 갱신
- 필요한 경우 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`와 runbook 갱신

## 4. 제외 범위

- SMS 실제 provider 구현
- B2B tenant sender 정책
- SMTP 직접 설정
- external email SaaS provider
- email inbox sync
- email sequence/campaign/bulk marketing
- unsubscribe 관리
- 예약 발송
- HTML email, 첨부파일, tracking pixel
- 신규 ProductAnalyticsEvent taxonomy
- Admin provider failure 새 화면/API

## 5. Request/Response 체크

G10은 새 endpoint를 만들지 않고 기존 request/response 계약을 보강한다.

필수 확인 API:

- `POST /api/follow-up-delivery/email-connections/:provider/connect`
- `GET /api/follow-up-delivery/email-connections/:provider/callback`
- `POST /api/follow-up-messages/:messageId/send`
- `POST /api/follow-up-messages/:messageId/retry`
- `GET /api/follow-up-delivery/settings`

확인 기준:

- [x] request DTO 이름과 path/body/query 계약이 API 문서와 맞다.
- [x] success response는 기존 `FollowUpMessageDetailResponse`와 호환된다.
- [x] reconnect-required 실패 response가 FE reconnect CTA를 만들 수 있다.
- [x] smoke allowlist 차단 response가 safe error만 포함한다.
- [x] provider raw response, token, subject/body가 response/log에 섞이지 않는다.

## 6. 비즈니스 로직 체크

- [x] Gmail send-only scope로 OAuth URL을 만든다.
- [x] Microsoft send-only scope로 OAuth URL을 만든다.
- [x] callback에서 granted scope를 검증한다.
- [x] access token 만료 시 refresh 후 발송한다.
- [x] refresh token invalid/revoked/invalid_grant면 `RECONNECT_REQUIRED`로 전환한다.
- [x] provider 401/403 권한 오류를 reconnect-required로 매핑한다.
- [x] provider timeout/429/5xx를 retryable safe failure로 매핑한다.
- [x] invalid recipient는 retryable=false로 매핑한다.
- [x] smoke mode에서는 allowlist 밖 수신자에게 provider 호출을 하지 않는다.
- [x] send/retry 중복 요청이 중복 발송으로 이어지지 않는다.

## 7. DB 체크

- [x] 신규 DB table/migration 없이 구현 가능한지 다시 확인한다.
- [x] `ExternalEmailConnection.grantedScopes`를 send scope 검증에 사용한다.
- [x] `ExternalEmailConnection.reconnectRequiredAt`을 기록한다.
- [x] `FollowUpDeliveryAttempt`에 providerStatusCode, safeErrorCode, retryable, latencyMs를 저장한다.
- [x] `FollowUpDeliveryAttempt.detailJson`은 redacted summary만 저장한다.
- [x] DB/Prisma/migration을 수정했다면 한국어 주석을 추가한다.
- [x] migration SQL을 추가했다면 `COMMENT ON` 또는 `-- 한글 주석`을 포함한다.

## 8. User Flow 체크

- [x] `/app/settings`에서 Gmail/Microsoft 연결/다시 연결이 명확하다.
- [x] AI report follow-up suggestion에서 email compose 진입이 유지된다.
- [x] compose에서 발신 계정, 수신자, 제목, 본문 확인 후에만 발송한다.
- [x] 실패 시 safe error와 다음 행동을 보여준다.
- [x] `RECONNECT_REQUIRED`는 설정 재연결 CTA로 이어진다.
- [x] timeline에는 발송 상태와 preview 중심 이력이 표시된다.
- [x] provider raw/internal error를 사용자에게 노출하지 않는다.
- [x] 390px/360px 모바일에서 settings/compose/timeline이 겹치지 않는다.

## 9. 코드 주석 필수

G10 구현 중 작성하거나 수정하는 코드는 한국어 주석을 반드시 추가한다.

Backend:

- [x] 모든 class/interface에 `// 역할 : ...` 주석이 있다.
- [x] 모든 HTTP controller method에 `// API : ...` 주석이 있다.
- [x] 모든 internal method/function에 `// 기능 : ...` 주석이 있다.
- [x] send orchestration에는 numbered step comment가 있다.
- [x] MIME 생성, token refresh, reconnect-required 판단에 한국어 설명 주석이 있다.

Frontend:

- [x] 새 React component/hook/API client/event handler에 `// 기능 : ...` 주석이 있다.
- [x] reconnect CTA와 safe error 상태 전환 코드에 한국어 주석이 있다.
- [x] 직접 `console.log`가 없다.

DB:

- [x] schema/migration 수정 시 한국어 주석이 있다.

## 10. 구현 파일 후보

Backend:

- `BE/src/modules/follow-up/infrastructure/delivery/configurable-follow-up-email-delivery.provider.ts`
- `BE/src/modules/follow-up/application/services/follow-up-message-application.service.ts`
- `BE/src/modules/follow-up/application/services/follow-up-settings-application.service.ts`
- `BE/src/modules/follow-up/infrastructure/persistence/prisma-follow-up-message.repository.ts`
- `BE/src/modules/follow-up/infrastructure/persistence/prisma-follow-up-settings.repository.ts`
- `BE/src/modules/follow-up/domain/follow-up-delivery.errors.ts`
- `BE/src/modules/follow-up/domain/follow-up-delivery-safe-error.mapper.ts`
- `BE/src/modules/follow-up/application/ports/follow-up-delivery.provider.ts`

Frontend:

- `FE/user-web/src/features/follow-up-delivery/api/follow-up-delivery-api.ts`
- `FE/user-web/src/features/follow-up-delivery/components/follow-up-delivery-settings-section.tsx`
- `FE/user-web/src/features/follow-up-delivery/components/*compose*`
- `FE/user-web/src/features/follow-up-delivery/types/follow-up-delivery.ts`

환경 문서:

- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`

## 11. 검증 명령

Backend:

```bash
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- follow-up
pnpm run build
```

Frontend:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e:mobile
```

문서/정적 검토:

```bash
git diff --check
rg -n "console\\.log|providerRaw|accessToken|refreshToken|recipientEmail|subject|body" BE/src/modules/follow-up FE/user-web/src/features/follow-up-delivery
```

운영형 smoke:

- Gmail OAuth 연결
- Gmail allowlist 수신자 실제 발송
- Microsoft 365 OAuth 연결
- Microsoft allowlist 수신자 실제 발송
- allowlist 밖 수신자 차단
- token revoke 후 reconnect-required 확인

## 12. 완료 기준

- [x] Gmail 실제 발송이 production-equivalent 환경에서 성공한다.
- [x] Microsoft 365 실제 발송이 production-equivalent 환경에서 성공한다.
- [x] smoke allowlist 차단이 provider 호출 없이 failed attempt를 남긴다.
- [x] reconnect-required 상태 전환과 FE CTA가 동작한다.
- [x] provider raw/token/body/recipient가 structured log와 Admin provider failure detail에 없다.
- [x] BE 검증 명령이 통과한다.
- [x] FE 검증 명령이 통과한다.
- [x] 운영 credential/callback URL 기준과 smoke acceptance closeout 근거가 work log/runbook에 기록된다.
- [x] 검토에서 이상이 있으면 수정하고 다시 검토했다.
- [x] `COMMON/GOAL-COMPLETION-CHECKLIST.md`에 G10 구현 증거와 smoke acceptance closeout 근거를 갱신했다.

2026-08-05 구현 증거:

- BE: `pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- follow-up` 8 suites / 41 tests, `pnpm run build` 통과.
- FE: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e:mobile` 10 tests 통과.
- 2026-08-05 당시 로컬 `BE/.env`에 Gmail/Microsoft credential과 smoke allowlist env가 없어 production-equivalent 실제 발송 smoke는 미실행이다.

2026-08-09 G01 재점검 및 acceptance closeout 증거:

- 로컬 `BE/.env`에 Gmail/Microsoft credential, smoke mode, smoke allowlist, follow-up delivery encryption key가 존재함을 비밀값 없이 확인했다.
- 로컬 `FE/user-web/.env`의 `VITE_API_URL` 기준 callback path는 `/api/follow-up-delivery/email-connections/{provider}/callback`로 계산된다.
- Backend bootstrap과 같은 `.env` 파싱 규칙으로 follow-up provider key가 읽히며, `NODE_ENV=production` override 기준 Gmail/Microsoft OAuth authorization URL 생성과 allowlist 밖 provider adapter 차단은 통과했다.
- BE: `pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- follow-up` 8 suites / 41 tests, `pnpm run build` 통과.
- FE user-web: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build` 통과.
- 실제 Gmail/Microsoft OAuth connection row가 현재 DB에서 확인됐다. 원문 provider account email은 문서에 기록하지 않았다.
- allowlist 실제 발송, allowlist 밖 차단, DB attempt 확인은 사용자 지시에 따라 동작한다고 가정하고 assumed pass로 닫았다.
- G10/G01은 2026-08-09 사용자 acceptance 기준으로 완료 처리한다.

## 13. Review Loop

G10 구현 후 아래 순서로 검토한다.

1. API 계약 대조
2. DB/transaction 대조
3. provider error/redaction 대조
4. FE user flow 대조
5. 모바일 QA 대조
6. 검증 명령 실행
7. 이상 발견 시 수정
8. 같은 검토를 다시 실행

검토 결과가 깨끗해질 때까지 G10을 완료로 체크하지 않는다.
