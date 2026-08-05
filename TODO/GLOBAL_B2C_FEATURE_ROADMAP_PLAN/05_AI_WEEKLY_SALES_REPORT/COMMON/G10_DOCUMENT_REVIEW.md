# G10 Document Review

상태: Completed
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
| 상위 coverage | Pass | 05를 G01-G09 Done / G10 Ready로 보정 |

## 3. 수정 반영

검토 중 아래 항목을 문서에 반영했다.

- G10이 새 endpoint 추가가 아니라 기존 API 계약 보강임을 명시했다.
- SMS, B2B, email sync, sequence/campaign을 G10 제외 범위로 명시했다.
- 09/11에 새 goal 문서를 추가하지 않는 판단 근거를 `G10_CROSS_PLAN_COVERAGE.md`와 DB 문서에 남겼다.
- DB migration 기본 불필요와 DB 수정 시 한국어 주석 필수 조건을 분리했다.
- provider raw/token/body/recipient redaction 기준을 API/비즈니스/goal 문서에 반복 명시했다.
- smoke allowlist 환경 변수를 software 환경 변수 정본에 추가했다.
- 상위 coverage matrix에서 05의 G10 Ready 상태가 보이도록 보정했다.
- architecture guardrail에서 G10은 기본 신규 migration 없이 기존 model을 사용한다고 보정했다.

## 4. 남은 구현 검토 항목

G10 실제 구현 시 완료 전 반드시 다시 검토한다.

- [ ] Gmail/Microsoft 실제 provider send adapter 코드가 API 문서와 맞다.
- [ ] token refresh와 reconnect-required 상태 전환이 테스트된다.
- [ ] smoke allowlist 차단 시 provider 호출이 없다.
- [ ] structured log와 Admin provider failure safe select가 원문을 포함하지 않는다.
- [ ] User Web reconnect CTA와 safe error 문구가 해요체다.
- [ ] 모바일 390px/360px QA를 통과한다.
- [ ] 검토에서 이상 발견 시 수정 후 같은 검토를 다시 실행한다.

## 5. 결론

G10 문서화는 구현 착수 가능한 수준으로 정리됐다.

현재 추가 문서가 필요한 다른 roadmap 번호는 없다. 09는 신규 analytics event를 만들지 않으므로 제외하고, 11은 기존 provider failure source 계약이 `FollowUpDeliveryAttempt`를 이미 포함하므로 제외한다.
