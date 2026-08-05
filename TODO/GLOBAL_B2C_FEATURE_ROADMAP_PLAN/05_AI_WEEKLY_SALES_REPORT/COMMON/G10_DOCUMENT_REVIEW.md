# G10 Document Review

상태: Implemented / Provider Smoke Pending
검토일: 2026-08-05
대상: G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION 문서화

## 1. 검토 범위

- `COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`
- `COMMON/FOLLOW_UP_EMAIL_PROVIDER_BUSINESS-LOGIC.md`
- `COMMON/FOLLOW_UP_EMAIL_PROVIDER_USER-FLOW.md`
- `BE-TODO/FOLLOW_UP_EMAIL_PROVIDER_DB-SCHEMA.md`
- `COMMON/G10_CROSS_PLAN_COVERAGE.md`
- `COMMON/GOAL-SPECS/G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION.md`
- 기존 05 README, work order, checklist, API index, references 연결
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
- 실제 코드 상태 `BE/src/modules/follow-up`, `FE/user-web/src/features/follow-up-delivery`, `BE/prisma/schema.prisma`

## 2. 검토 결과

| 항목 | 결과 | 비고 |
|---|---|---|
| request 문서화 | Pass | 기존 endpoint별 path/body/query/response 계약 보강 |
| response 문서화 | Pass | success, reconnect-required, smoke allowlist failure 예시 포함 |
| 비즈니스 로직 | Pass | OAuth, send, retry, reconnect, safe error, transaction 흐름 포함 |
| 유저 플로우 | Pass | settings, AI report compose, timeline, mobile, privacy risk 포함 |
| DB 작업 | Pass | 신규 migration 불필요 판단과 변경 시 주석 필수 조건 포함 |
| 코드 한글 주석 | Pass | Backend/Frontend/DB 주석 필수 조건을 goal checklist에 포함 |
| UXUI_AGENT 반영 | Pass | Notion workspace + Attio CRM record 기준 반영 |
| SOFTWARE_AGENT 반영 | Pass | API contract, transaction, observability, comment/logging 기준 반영 |
| 09 영향 | Pass | 신규 analytics taxonomy 없음으로 문서화 불필요 판단 |
| 11 영향 | Pass | existing `FollowUpDeliveryAttempt` provider failure source 유지 |
| SMS/B2B 확장 | Pass | G10 제외, 별도 후속으로 분리 |
| smoke 과집중 방지 | Pass | smoke는 검증 gate로만 두고 제품 목표는 실제 provider 발송으로 명시 |
| 환경 변수 정본 | Pass | smoke allowlist env를 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 반영 |
| 상위 coverage | Pass | 05를 G01-G09 Done / G10 Implemented / Provider Smoke Pending으로 보정 |

## 3. 수정 반영

검토 중 아래 항목을 문서에 반영했다.

- G10이 새 endpoint 추가가 아니라 기존 API 계약 보강임을 명시했다.
- SMS, B2B, email sync, sequence/campaign을 G10 제외 범위로 명시했다.
- 09/11에 새 goal 문서를 추가하지 않는 판단 근거를 `G10_CROSS_PLAN_COVERAGE.md`와 DB 문서에 남겼다.
- DB migration 기본 불필요와 DB 수정 시 한국어 주석 필수 조건을 분리했다.
- provider raw/token/body/recipient redaction 기준을 API/비즈니스/goal 문서에 반복 명시했다.
- smoke allowlist 환경 변수를 software 환경 변수 정본에 추가했다.
- 상위 coverage matrix에서 05의 G10 Implemented / Provider Smoke Pending 상태가 보이도록 보정했다.
- architecture guardrail에서 G10은 기본 신규 migration 없이 기존 model을 사용한다고 보정했다.

## 4. 구현 검토 항목

G10 실제 구현 후 2026-08-05에 다시 검토했다.

- [x] Gmail/Microsoft 실제 provider send adapter 코드가 API 문서와 맞다.
- [x] token refresh와 reconnect-required 상태 전환이 테스트된다.
- [x] smoke allowlist 차단 시 provider 호출이 없다.
- [x] structured log와 Admin provider failure safe select가 원문을 포함하지 않는다.
- [x] User Web reconnect CTA와 safe error 문구가 해요체다.
- [x] 모바일 390px/360px QA를 통과한다.
- [x] 검토에서 이상 발견 시 수정 후 같은 검토를 다시 실행했다.
- [ ] production-equivalent Gmail/Microsoft allowlist smoke를 실행했다.

## 5. 2026-08-05 구현 증거

| 항목 | 결과 | 증거 |
|---|---|---|
| Gmail 실제 API adapter | Pass | `ConfigurableFollowUpEmailDeliveryProvider.sendGmailEmail`, `configurable-follow-up-email-delivery.provider.spec.ts` Gmail MIME/base64url test |
| Microsoft Graph adapter | Pass | `sendMicrosoftEmail`, Microsoft `/me/sendMail` JSON Text body test |
| token refresh | Pass | `FollowUpMessageApplicationService.resolveEmailAccessToken`, expired token refresh test |
| invalid_grant/reconnect | Pass | provider refresh invalid_grant test, provider auth failure reconnect test |
| scope 부족 | Pass | callback scope 부족 reject test, send scope 부족 provider-call-skip test |
| smoke allowlist | Pass | `FOLLOW_UP_EMAIL_SMOKE_MODE`, `FOLLOW_UP_EMAIL_SMOKE_ALLOWED_RECIPIENTS`, provider call skip test |
| safe error/redaction | Pass | provider failure result redaction test, `console.log` no match, provider log safe fields review |
| User Web CTA | Pass | safe error mapper, compose/timeline settings CTA, FE typecheck/lint/build/mobile e2e |
| DB/migration | Pass | 신규 migration 없음, 기존 `ExternalEmailConnection`, `FollowUpMessage`, `FollowUpDeliveryAttempt` 사용 |

검증 명령:

- BE: `pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- follow-up`, `pnpm run build`
- FE: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e:mobile`
- Static: `git diff --check`, `rg -n "console\\.log" BE/src/modules/follow-up FE/user-web/src/features/follow-up-delivery`

운영형 smoke 미실행 사유:

- 2026-08-05 확인 기준 로컬 `BE/.env`에 Gmail/Microsoft OAuth credential과 smoke allowlist env가 없다.
- 따라서 실제 provider console callback URL 등록, Gmail OAuth 연결, Gmail allowlist 수신자 발송, Microsoft OAuth 연결, Microsoft allowlist 수신자 발송은 운영 credential 준비 후 실행해야 한다.

## 6. 결론

G10 코드 구현과 자동 검증은 완료됐다.

현재 추가 문서가 필요한 다른 roadmap 번호는 없다. 09는 신규 analytics event를 만들지 않으므로 제외하고, 11은 기존 provider failure source 계약이 `FollowUpDeliveryAttempt`를 이미 포함하므로 제외한다.

단, G10 goal 자체는 production-equivalent Gmail/Microsoft allowlist smoke가 끝나기 전까지 완료 체크하지 않는다.
