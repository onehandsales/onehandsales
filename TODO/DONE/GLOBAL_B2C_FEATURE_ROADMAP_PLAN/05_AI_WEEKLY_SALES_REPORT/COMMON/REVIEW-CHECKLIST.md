# 05 Review Checklist

상태: Closed / G10 Provider Smoke Closeout Reflected
최종 업데이트: 2026-08-09

## 1. 공통

- [x] 03 주간 일정 보고서가 완료 상태라는 전제로 작성했는가?
- [x] 05-A와 05-B의 구현 순서가 분리되어 있는가?
- [x] User API `/api/*`와 Admin API `/admin/api/*`가 섞이지 않았는가?
- [x] UXUI_AGENT의 Notion + Attio 기준을 반영했는가?
- [x] SOFTWARE_AGENT의 API contract, transaction, observability 기준을 반영했는가?
- [x] 시간 필드가 UTC instant와 date-only로 구분되어 있는가?
- [x] 외부 provider 호출이 transaction 밖으로 분리되어 있는가?
- [x] `/goal` 작업 단위가 DB, Backend, FE, QA 순서로 분리되어 있는가?
- [x] 각 `/goal` 문서에 체크리스트, 완료 기준, 검증 후보가 있는가?

## 2. 05-A

- [x] request/response DTO가 API 문서에 명시되어 있는가?
- [x] 비동기 job 생성 흐름이 명시되어 있는가?
- [x] 같은 user/week 생성 중복 차단 기준이 있는가?
- [x] version 저장, 실패 version 저장, 삭제/숨김 불가 기준이 있는가?
- [x] 회의록 본문 전체 포함과 snapshot 전체 저장 기준이 명시되어 있는가?
- [x] 사용자는 snapshot 요약만 볼 수 있다는 기준이 있는가?
- [x] AI output schema가 section별로 정의되어 있는가?
- [x] 자동 mutation 금지 기준이 반복 명시되어 있는가?
- [x] SQL 초안에 table, column, index comment가 포함되어 있는가?

## 3. 05-B

- [x] Gmail/Microsoft 365 연결 API가 구분되어 있는가?
- [x] SMS 발신번호 인증 API가 있는가?
- [x] compose 확인 후 발송 흐름이 명시되어 있는가?
- [x] 발송 본문 전체 영구 보관과 삭제 불가 기준이 명시되어 있는가?
- [x] 발송 이력이 AI 리포트와 record timeline 양쪽에 연결되는가?
- [x] provider 실패 safe error와 retry 정책이 있는가?
- [x] 비용은 내부 추적만 하고 사용자 화면에 기본 숨김으로 되어 있는가?
- [x] SQL 초안에 table, column, index comment가 포함되어 있는가?

## 4. 구현 시작 전 차단 조건

- [x] DB/Prisma migration 운영 gate가 닫히지 않았으면 shared/cloud DB migration을 실행하지 않는다.
- [x] Gmail/Microsoft provider smoke는 2026-08-09 PRE12/BEFORE_12 기준 완료 처리했다. SMS 실제 provider는 05 완료 범위가 아니므로 별도 후속 후보로 본다.
- [x] 계정 삭제/법적 삭제 요청 정책은 별도 Privacy/Compliance 계획으로 남긴다.

## 5. G09 Closeout 결과

- BE 필수 명령 `prisma:validate`, `typecheck`, `lint`, `test`, `build`가 통과했다.
- FE 필수 명령 `typecheck`, `lint`, `build`, `test:e2e:mobile`이 통과했다.
- FE build의 기존 Tailwind `duration-[500ms]` ambiguous warning은 `duration-500`으로 정리했다.
- FE build의 large chunk warning은 남아 있지만 G09 blocker가 아니며 별도 code-splitting/performance task로 분리한다.
- Gmail/Microsoft provider smoke closeout은 2026-08-09 PRE12/BEFORE_12 기준 완료 처리했다. SMS 실제 provider는 05 완료 범위가 아니라 후속 후보로 유지한다.
- G09 당시 provider smoke 미실행 사유와 운영 설정은 `TODO_LOG/2026-07-24/G09_QA_REVIEW_CLOSEOUT/WORK_LOG.md`와 `OPERATIONS_RUNBOOK_DRAFT.md`에 기록했다. Gmail/Microsoft provider smoke closeout은 2026-08-09 PRE12/BEFORE_12 기준 완료 처리했다.

## 6. G10 별도 검토

G10 실제 Gmail/Microsoft email provider 발송 후속 문서 검토는 `COMMON/G10_DOCUMENT_REVIEW.md`에 분리했다.

G10은 G09 closeout 결과를 뒤집지 않고, G09에서 미실행으로 기록한 실제 provider smoke와 production email send adapter를 별도 goal로 닫았다. Gmail/Microsoft provider smoke closeout은 2026-08-09 PRE12/BEFORE_12 기준 완료 처리했다.
