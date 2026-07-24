# Goal Work Order

상태: Confirmed
확정일: 2026-07-24

## 1. 원칙

05는 Planning/API/DB 계약 확인, 05-A DB, 05-A Backend, 05-A User Web, 05-B DB/provider foundation, 05-B settings Backend, 05-B draft/send Backend, 05-B User Web, QA 순서로 간다.

각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

각 `/goal` 완료 시 `COMMON/GOAL-COMPLETION-CHECKLIST.md`에서 해당 goal의 완료 여부, 완료일, 검증 증거, 비고를 갱신한다.

모든 `/goal`은 `COMMON/ARCHITECTURE-GUARDRAILS.md`, `COMMON/SCOPE.md`, `COMMON/API-SPEC/*`, `COMMON/REVIEW-CHECKLIST.md`를 먼저 읽고 진행한다.

DB migration을 허용한다. Prisma schema와 migration에는 한글 주석 기준을 지킨다.

05-A는 저장형 AI weekly report다. 03 weekly schedule report를 다시 만들지 않는다.

05-B는 Gmail/Microsoft 365 email과 국제 SMS follow-up delivery다. 예약 발송, campaign/bulk 발송, SMTP 직접 설정은 만들지 않는다.

## 2. 실행 순서

```text
G01_PLANNING_API_DB_CONTRACT
-> G02_AI_REPORT_DB_PRISMA
-> G03_AI_REPORT_BACKEND
-> G04_AI_REPORT_USER_WEB
-> G05_FOLLOW_UP_DB_PROVIDER_PORTS
-> G06_FOLLOW_UP_SETTINGS_BACKEND
-> G07_FOLLOW_UP_DRAFT_SEND_BACKEND
-> G08_FOLLOW_UP_USER_WEB
-> G09_QA_REVIEW_CLOSEOUT
```

## 3. G01 Planning API DB Contract

상세 명세: `COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md`

목표:

- 현재 코드와 문서 계약 충돌 여부를 최종 확인한다.
- 필요한 경우 문서 계약만 보정한다.
- 구현 착수 전 blocking 질문이 없음을 확인한다.

## 4. G02 AI Report DB Prisma

상세 명세: `COMMON/GOAL-SPECS/G02_AI_REPORT_DB_PRISMA.md`

목표:

- 05-A AI weekly report 저장 schema를 추가한다.
- report version, suggestion, async job, AI provider call log를 migration과 Prisma model로 만든다.

## 5. G03 AI Report Backend

상세 명세: `COMMON/GOAL-SPECS/G03_AI_REPORT_BACKEND.md`

목표:

- AI weekly report 생성 요청 API, 조회 API, async job 처리, AI provider port/adapter를 구현한다.

## 6. G04 AI Report User Web

상세 명세: `COMMON/GOAL-SPECS/G04_AI_REPORT_USER_WEB.md`

목표:

- `/app/schedules/week`에 AI report 생성, 진행 상태, version 목록, report 상세, 제안 카드를 구현한다.

## 7. G05 Follow-up DB Provider Ports

상세 명세: `COMMON/GOAL-SPECS/G05_FOLLOW_UP_DB_PROVIDER_PORTS.md`

목표:

- follow-up delivery schema와 email/SMS provider port, safe error mapper를 구현한다.

## 8. G06 Follow-up Settings Backend

상세 명세: `COMMON/GOAL-SPECS/G06_FOLLOW_UP_SETTINGS_BACKEND.md`

목표:

- Gmail/Microsoft 365 연결, 연결 해제, SMS 발신번호 등록/인증/해제, 첫 발송 안내 확인 API를 구현한다.

## 9. G07 Follow-up Draft Send Backend

상세 명세: `COMMON/GOAL-SPECS/G07_FOLLOW_UP_DRAFT_SEND_BACKEND.md`

목표:

- AI follow-up suggestion에서 email/SMS draft를 만들고, 사용자 수정 후 즉시 발송, 실패 재시도, 이력 조회를 구현한다.

## 10. G08 Follow-up User Web

상세 명세: `COMMON/GOAL-SPECS/G08_FOLLOW_UP_USER_WEB.md`

목표:

- User Web에서 follow-up 설정, compose, 발송, 실패 재시도, timeline 이력을 구현한다.

## 11. G09 QA Review Closeout

상세 명세: `COMMON/GOAL-SPECS/G09_QA_REVIEW_CLOSEOUT.md`

목표:

- Backend/User Web 검증, migration, ownership, redaction, provider failure, mobile QA를 점검한다.

## 12. 첫 실행 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md 기준으로 G01을 구현해줘.
```
