# Goal Completion Checklist

상태: Ready
최종 업데이트: 2026-07-24

## 1. 목적

05 AI Weekly Sales Report의 `/goal` 실행 완료 여부를 한눈에 확인하기 위한 체크리스트다.

`COMMON/REVIEW-CHECKLIST.md`는 G09 QA 검증표이고, 이 문서는 G01~G09 진행 상태판이다.

## 2. 사용 규칙

- 각 `/goal`을 시작하기 전에 이 문서를 확인한다.
- goal 완료 조건이 충족되면 해당 항목을 `[x]`로 바꾼다.
- 체크할 때 `완료일`, `증거`, `비고`를 함께 갱신한다.
- 검증 명령을 실행하지 못했으면 체크하지 않는다.
- 코드 구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다.
- 실제 Gmail/Microsoft/SMS provider smoke는 env 미준비 시 G09에서 미실행 사유를 기록한다.

## 3. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [ ] | G01 Planning API DB Contract | Ready |  | 문서 계약과 현재 코드 사실을 대조하고, G02~G09 착수 blocking 질문이 없음을 확인한다. |  |  |
| [ ] | G02 AI Report DB Prisma | Ready |  | 05-A DB foundation, migration, Prisma model이 spec과 일치한다. |  |  |
| [ ] | G03 AI Report Backend | Ready |  | 생성/조회 API, async job, AI provider log가 spec과 일치한다. |  |  |
| [ ] | G04 AI Report User Web | Ready |  | `/app/schedules/week` AI report UX가 FE TODO와 API 계약에 맞게 연결된다. |  |  |
| [ ] | G05 Follow-up DB Provider Ports | Ready |  | 05-B DB foundation과 provider port/redaction mapper가 준비된다. |  |  |
| [ ] | G06 Follow-up Settings Backend | Ready |  | OAuth, SMS sender verification, consent notice API가 spec과 일치한다. |  |  |
| [ ] | G07 Follow-up Draft Send Backend | Ready |  | draft, update, send, retry, list/detail API가 spec과 일치한다. |  |  |
| [ ] | G08 Follow-up User Web | Ready |  | settings, compose, send, retry, timeline UX가 FE TODO와 API 계약에 맞게 연결된다. |  |  |
| [ ] | G09 QA Review Closeout | Ready |  | `COMMON/REVIEW-CHECKLIST.md` critical 항목과 BE/FE 검증 명령이 완료된다. |  |  |

## 4. Goal별 체크 조건

### G01 Planning API DB Contract

- [ ] `COMMON/SCOPE.md`, `COMMON/API-SPEC/*`, `COMMON/ARCHITECTURE-GUARDRAILS.md`를 재확인했다.
- [ ] 현재 Schedule/MeetingNote/Deal/Contact/User Web week 화면 구조를 확인했다.
- [ ] API path, enum, 상태명, error code 충돌이 없다.
- [ ] 현재 코드와 충돌하는 부분은 구현해야 할 변경으로 문서에 명시되어 있다.
- [ ] G02~G09 구현 착수를 막는 질문이 없다.

### G02 AI Report DB Prisma

- [ ] Prisma enum/model/migration이 추가됐다.
- [ ] `AiWeeklySalesReport` version/failed version 저장이 가능하다.
- [ ] `AiWeeklySalesReportSuggestion`이 section별 suggestion을 저장한다.
- [ ] `AiJob`이 async generation job을 추적한다.
- [ ] `AiProviderCallLog`가 비용/latency/safe error를 저장한다.
- [ ] prompt/raw response가 DB/log에 저장되지 않는다.
- [ ] BE Prisma 검증 명령을 실행했다.

### G03 AI Report Backend

- [ ] `POST /api/sales-reports/weekly`가 생성 job을 만든다.
- [ ] `GET /api/sales-reports/weekly`가 최신 성공/생성 중/실패 version 목록을 반환한다.
- [ ] `GET /api/sales-reports/weekly/:reportId`가 상세 section을 반환한다.
- [ ] `GET /api/sales-reports/weekly/:reportId/snapshot-summary`가 원문 없는 snapshot summary를 반환한다.
- [ ] 생성 중복 방지와 실패 version 저장이 동작한다.
- [ ] BE 검증 명령을 실행했다.

### G04 AI Report User Web

- [ ] `/app/schedules/week` 기존 기능을 깨지 않고 AI section을 추가했다.
- [ ] empty/generating/success/failed state가 있다.
- [ ] version 목록과 실패 이력 접힘 표시가 있다.
- [ ] snapshot summary는 원문을 노출하지 않는다.
- [ ] 모바일 card/list layout을 확인했다.
- [ ] FE 검증 명령을 실행했다.

### G05 Follow-up DB Provider Ports

- [ ] 05-B Prisma enum/model/migration이 추가됐다.
- [ ] `ExternalEmailOAuthState`가 state 재사용을 막는다.
- [ ] token/phone 원문 암호화와 hash/masking이 분리됐다.
- [ ] provider port와 safe error mapper가 있다.
- [ ] body/raw response/token structured log redaction test가 있다.
- [ ] BE Prisma 검증 명령을 실행했다.

### G06 Follow-up Settings Backend

- [ ] settings 조회 API가 masking된 연결 상태를 반환한다.
- [ ] Gmail/Microsoft connect/callback/disconnect가 동작한다.
- [ ] callback은 state로 user ownership을 검증한다.
- [ ] SMS sender request/verify/revoke가 동작한다.
- [ ] first-send consent notice upsert가 동작한다.
- [ ] BE 검증 명령을 실행했다.

### G07 Follow-up Draft Send Backend

- [ ] `FOLLOW_UP` suggestion에서 draft를 만든다.
- [ ] recipient/channel/language validation이 동작한다.
- [ ] 사용자가 수정한 subject/body를 저장한다.
- [ ] send/retry 중복 발송이 방지된다.
- [ ] delivery attempt와 timeline target이 저장된다.
- [ ] BE 검증 명령을 실행했다.

### G08 Follow-up User Web

- [ ] `/app/settings` provider 연결 UI가 있다.
- [ ] AI report follow-up suggestion에서 compose로 진입한다.
- [ ] email/SMS compose 수정과 즉시 발송이 동작한다.
- [ ] 실패 safe error와 retry UI가 있다.
- [ ] AI report와 record timeline에 발송 이력이 표시된다.
- [ ] FE 검증 명령과 mobile 확인을 실행했다.

### G09 QA Review Closeout

- [ ] Backend QA 항목을 확인했다.
- [ ] Frontend QA 항목을 확인했다.
- [ ] Security/Privacy QA 항목을 확인했다.
- [ ] `COMMON/REVIEW-CHECKLIST.md` 체크 결과를 반영했다.
- [ ] README, goal spec, planning review, 상위 roadmap 상태를 구현 결과와 맞췄다.
- [ ] 실제 provider smoke 실행 여부와 미실행 사유를 기록했다.

## 5. 완료 시 업데이트 예시

```markdown
| [x] | G01 Planning API DB Contract | Done | 2026-07-24 | ... | `rg ...`, `git diff --check` 통과 | blocking 질문 없음 |
```
