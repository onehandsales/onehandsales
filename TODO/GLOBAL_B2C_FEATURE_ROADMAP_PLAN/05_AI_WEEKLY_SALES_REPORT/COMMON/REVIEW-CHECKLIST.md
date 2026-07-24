# 05 Review Checklist

상태: Draft checklist

## 1. 공통

- [ ] 03 주간 일정 보고서가 완료 상태라는 전제로 작성했는가?
- [ ] 05-A와 05-B의 구현 순서가 분리되어 있는가?
- [ ] User API `/api/*`와 Admin API `/admin/api/*`가 섞이지 않았는가?
- [ ] UXUI_AGENT의 Notion + Attio 기준을 반영했는가?
- [ ] SOFTWARE_AGENT의 API contract, transaction, observability 기준을 반영했는가?
- [ ] 시간 필드가 UTC instant와 date-only로 구분되어 있는가?
- [ ] 외부 provider 호출이 transaction 밖으로 분리되어 있는가?
- [ ] `/goal` 작업 단위가 DB, Backend, FE, QA 순서로 분리되어 있는가?
- [ ] 각 `/goal` 문서에 체크리스트, 완료 기준, 검증 후보가 있는가?

## 2. 05-A

- [ ] request/response DTO가 API 문서에 명시되어 있는가?
- [ ] 비동기 job 생성 흐름이 명시되어 있는가?
- [ ] 같은 user/week 생성 중복 차단 기준이 있는가?
- [ ] version 저장, 실패 version 저장, 삭제/숨김 불가 기준이 있는가?
- [ ] 회의록 본문 전체 포함과 snapshot 전체 저장 기준이 명시되어 있는가?
- [ ] 사용자는 snapshot 요약만 볼 수 있다는 기준이 있는가?
- [ ] AI output schema가 section별로 정의되어 있는가?
- [ ] 자동 mutation 금지 기준이 반복 명시되어 있는가?
- [ ] SQL 초안에 table, column, index comment가 포함되어 있는가?

## 3. 05-B

- [ ] Gmail/Microsoft 365 연결 API가 구분되어 있는가?
- [ ] SMS 발신번호 인증 API가 있는가?
- [ ] compose 확인 후 발송 흐름이 명시되어 있는가?
- [ ] 발송 본문 전체 영구 보관과 삭제 불가 기준이 명시되어 있는가?
- [ ] 발송 이력이 AI 리포트와 record timeline 양쪽에 연결되는가?
- [ ] provider 실패 safe error와 retry 정책이 있는가?
- [ ] 비용은 내부 추적만 하고 사용자 화면에 기본 숨김으로 되어 있는가?
- [ ] SQL 초안에 table, column, index comment가 포함되어 있는가?

## 4. 구현 시작 전 차단 조건

- [ ] DB/Prisma migration 운영 gate가 닫히지 않았으면 shared/cloud DB migration을 실행하지 않는다.
- [ ] Gmail/Microsoft/SMS provider env와 callback URL이 확정되지 않았으면 실제 provider smoke를 완료로 보지 않는다.
- [ ] 계정 삭제/법적 삭제 요청 정책은 별도 Privacy/Compliance 계획으로 남긴다.
