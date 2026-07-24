# G09 QA Review Closeout

상태: Done
완료일: 2026-07-24

## 1. 목적

05-A/05-B 전체를 QA하고 release 전에 ownership, privacy, provider failure, mobile UX, migration 위험을 점검한다.

## 2. 선행 조건

- G04와 G08이 완료되어 05-A/05-B 주요 happy path가 연결되어 있다.
- `COMMON/REVIEW-CHECKLIST.md`를 먼저 읽는다.
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`를 갱신할 준비가 되어 있다.

## 3. 포함 범위

- Backend regression
- Frontend regression
- API contract smoke test
- DB migration review
- privacy/redaction review
- provider failure simulation
- mobile UX review
- release note와 운영 runbook 초안
- 실제 provider smoke 실행 여부 기록

## 4. 제외 범위

- 새 기능 추가
- scope 밖 provider 추가
- 예약 발송/campaign/Admin 비용 화면

## 5. QA 체크

- 다른 userId의 report/message/connection/sender를 조회하거나 변경할 수 없다.
- `weekStart`, `timeZone`, UTC timestamp 정책이 지켜진다.
- AI report 생성 실패가 실패 version으로 저장되고 사용자 삭제 기능이 없다.
- full input snapshot은 user response에 전체 노출되지 않는다.
- AI prompt 원문과 provider raw response가 structured log에 없다.
- email/SMS 본문 전체는 DB 이력에는 저장되고 structured log에는 없다.
- OAuth token과 SMS 번호 원문은 암호화 저장된다.
- provider 장애, token 만료, quota error, invalid recipient가 safe error로 변환된다.
- send/retry 중복 요청이 중복 발송으로 이어지지 않는다.
- `/app/schedules/week` 기존 03 기능이 유지된다.
- 모바일 360px/390px에서 AI report와 compose UI가 겹치지 않는다.
- Admin API에 이번 User Web 기능이 의존하지 않는다.

## 6. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e:mobile
```

## 7. 완료 기준

- `COMMON/REVIEW-CHECKLIST.md` critical 항목이 닫혀 있다.
- BE/FE 검증 명령 결과가 work log에 기록되어 있다.
- provider credential/env/callback URL 운영 설정 여부가 기록되어 있다.
- README, goal spec, planning review, 상위 roadmap 상태가 구현 결과와 일치한다.

## 8. 작업 로그 경로

- `TODO_LOG/<date>/G09_QA_REVIEW_CLOSEOUT/WORK_LOG.md`

## 9. 완료 결과

- `COMMON/REVIEW-CHECKLIST.md` critical 항목을 모두 닫았다.
- BE 필수 명령 `pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`가 통과했다.
- FE 필수 명령 `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e:mobile`이 통과했다.
- `pnpm run test:e2e:mobile`은 현재 머신에 Microsoft Edge가 없으면 Chrome 390px/360px project만 실행하고, Edge가 있거나 `PLAYWRIGHT_INCLUDE_EDGE=1`이면 Edge project를 포함하도록 보정했다.
- 실제 Gmail/Microsoft/SMS provider smoke는 follow-up 전용 credential과 provider console callback URL 미확정으로 완료 처리하지 않았고, 미실행 사유를 work log와 runbook에 기록했다.
- Release note draft와 operations runbook draft를 `TODO_LOG/2026-07-24/G09_QA_REVIEW_CLOSEOUT`에 추가했다.
- README, planning review, goal completion checklist, 상위 roadmap 상태를 G01-G09 Done 기준으로 맞췄다.
