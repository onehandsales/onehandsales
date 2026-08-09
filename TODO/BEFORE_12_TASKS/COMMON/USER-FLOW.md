# User Flow

상태: Done / Handoff Complete

## 1. 목적

이 문서는 사용자가 보는 제품 기능 흐름이 아니라, 12 Billing 착수 전 작업자가 따라야 하는 closeout 흐름을 정의한다.

## 2. 작업자 흐름

```text
PRE12 최종 분류 확인
-> 01 문서 구조와 현재 BEFORE_12 문서 구조 대조
-> 실제 BE/FE/Prisma 코드 상태 확인
-> G01 provider smoke closeout 실행
-> G02 10 Mobile 문서 체크리스트 정합성 정리
-> G03 User Web route/architecture 문서 정리
-> G04 11 Admin checklist/goal index 정리
-> G05 Admin Web architecture/legacy route 문서 정리
-> G06 12 Billing 착수 가능 상태 handoff
```

## 3. 사용자가 보는 변화

이 계획 자체로 일반 사용자에게 새 기능이 노출되지 않는다.

- `/app/notifications`는 현재 활성 상태를 유지한다.
- `/app/schedules/week`는 현재 활성 상태를 유지한다.
- `/app/export`는 현재 redirect 상태를 유지한다.
- Admin Web의 현재 11 운영 route는 활성 상태를 유지한다.
- Admin Web의 `/organizations`, `/subscriptions`, `/support`는 redirect 상태를 유지한다.
- Billing, subscription, tax 기능은 이 계획에서 노출하지 않는다.

## 4. G01 운영자 smoke 흐름

G01 provider smoke closeout은 외부 운영 확인이 필요한 유일한 goal이다.

```text
provider env key 존재 확인
-> provider console callback URL 등록 확인
-> production-equivalent Backend 확인
-> smoke allowlist 설정 확인
-> Gmail OAuth 연결
-> Gmail allowlist 수신자 실제 발송
-> Gmail allowlist 밖 수신자 차단
-> Microsoft OAuth 연결
-> Microsoft allowlist 수신자 실제 발송
-> Microsoft allowlist 밖 수신자 차단
-> FollowUpDeliveryAttempt와 safe log/redaction 확인
-> 05 G10 pending 문서와 BEFORE_12 결과 문서 갱신
```

G01은 Gmail과 Microsoft 365가 모두 성공해야 완료다. env/callback/account가 없어서 실행하지 못한 경우에는 blocker로 기록하고 G06에서 12 착수 가능 판정을 내리지 않는다.

2026-08-09 G06에서는 G01을 `User-Assumed Provider Smoke Accepted`로 닫은 상태를 확인했고, 해당 증거 성격을 handoff 문서와 work log에 남겼다.

## 5. 기록 금지

아래 값은 문서, 로그, 이슈, 스크린샷 설명에 기록하지 않는다.

- secret 값
- access token
- refresh token
- OAuth code/state 원문
- 수신자 이메일 원문
- 발신자 이메일 원문
- follow-up 제목/본문 원문
- provider raw response body

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/TODO_LOG/2026-07-24/G09_QA_REVIEW_CLOSEOUT/OPERATIONS_RUNBOOK_DRAFT.md`
